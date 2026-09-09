import socket
import ssl
import hashlib
import requests
import socks  # pip install pysocks
from datetime import datetime, timezone
import os
from cryptography import x509
from cryptography.hazmat.backends import default_backend

TOR_PROXY_HOST = os.getenv("TOR_PROXY_HOST", "127.0.0.1")
TOR_PROXY_PORT = int(os.getenv("TOR_PROXY_PORT", 9050))


def get_tor_session():
    session = requests.session()
    session.proxies = {
        "http": f"socks5h://{TOR_PROXY_HOST}:{TOR_PROXY_PORT}",
        "https": f"socks5h://{TOR_PROXY_HOST}:{TOR_PROXY_PORT}",
    }
    return session


def scan_ports(onion_url: str, ports: list[int] = [80, 443, 22, 9050]) -> list[int]:
    open_ports = []
    for port in ports:
        try:
            s = socks.socksocket()
            s.set_proxy(socks.SOCKS5, TOR_PROXY_HOST, TOR_PROXY_PORT)
            s.settimeout(10)
            s.connect((onion_url, port))
            open_ports.append(port)
            s.close()
        except Exception:
            continue
    return open_ports


def grab_banner_and_status(onion_url: str, session) -> dict:
    result = {"serverBanner": None, "exposedStatusPage": False, "statusPageDetails": None}
    try:
        resp = session.get(f"http://{onion_url}/", timeout=15)
        result["serverBanner"] = resp.headers.get("Server", "Unknown")
    except Exception:
        pass

    try:
        status_resp = session.get(f"http://{onion_url}/server-status", timeout=15)
        if status_resp.status_code == 200 and "Apache Server Status" in status_resp.text:
            result["exposedStatusPage"] = True
            import re
            uptime = re.search(r"Server uptime:\s*(.+)", status_resp.text)
            internal_ips = re.findall(r"\b(?:10|172|192)\.\d+\.\d+\.\d+\b", status_resp.text)
            result["statusPageDetails"] = {
                "serverUptime": uptime.group(1) if uptime else None,
                "internalIPs": list(set(internal_ips)),
            }
    except Exception:
        pass

    return result


def get_tls_cert_via_tor(onion_url: str, port: int = 443) -> dict | None:
    try:
        s = socks.socksocket()
        s.set_proxy(socks.SOCKS5, TOR_PROXY_HOST, TOR_PROXY_PORT)
        s.settimeout(10)
        s.connect((onion_url, port))

        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        tls_sock = ctx.wrap_socket(s, server_hostname=onion_url)

        der_cert = tls_sock.getpeercert(binary_form=True)
        tls_sock.close()
    except Exception:
        return None

    try:
        cert = x509.load_der_x509_certificate(der_cert, default_backend())
    except Exception:
        return None

    sha256_fp = hashlib.sha256(der_cert).hexdigest()

    try:
        sans = cert.extensions.get_extension_for_class(
            x509.SubjectAlternativeName
        ).value.get_values_for_type(x509.DNSName)
    except x509.ExtensionNotFound:
        sans = []

    return {
        "hasSsl": True,
        "issuer": cert.issuer.rfc4514_string(),
        "subject": cert.subject.rfc4514_string(),
        "serialNumber": format(cert.serial_number, "x"),
        "sha256Fingerprint": sha256_fp,
        "validFrom": cert.not_valid_before_utc.isoformat(),
        "validTo": cert.not_valid_after_utc.isoformat(),
        "sans": sans,
    }


def censys_cert_lookup(sha256_fp: str, api_id: str, api_secret: str) -> dict | None:
    """Cross-reference cert fingerprint against Censys to find clearnet host reusing it.
    NOTE: verify the actual Censys v2 /certificates response schema before relying on
    this in the demo — field names below are best-effort and may need adjusting."""
    try:
        resp = requests.get(
            f"https://search.censys.io/api/v2/certificates/{sha256_fp}",
            auth=(api_id, api_secret),
            timeout=15,
        )
        if resp.status_code != 200:
            return None
        data = resp.json().get("result", {})
        hosts = data.get("parsed", {}).get("hosts", [])
        if not hosts:
            return None
        host = hosts[0]
        location = host.get("location", {}) or {}
        asys = host.get("autonomous_system", {}) or {}
        return {
            "ip": host.get("ip"),
            "hostname": host.get("hostname") or host.get("ip"),
            "country": location.get("country"),
            "city": location.get("city"),
            "asn": f"AS{asys.get('asn')}" if asys.get("asn") else None,
            "confidence": 95,
        }
    except Exception:
        return None


def shodan_host_lookup(ip: str, api_key: str) -> dict | None:
    try:
        resp = requests.get(f"https://api.shodan.io/shodan/host/{ip}?key={api_key}", timeout=15)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return None


def compute_risk_score(exposed_status: bool, clearnet_match: dict | None, open_ports: list[int]) -> int:
    score = 0
    if exposed_status:
        score += 40
    if clearnet_match:
        score += 45
    if 22 in open_ports:
        score += 15
    return min(score, 100)


def build_leaked_origin_ip(clearnet_match: dict | None, exposed_status: bool, cert_matched: bool) -> dict | None:
    if not clearnet_match:
        return None

    if exposed_status and cert_matched:
        leak_vector = "Exposed Apache mod_status endpoint corroborated by TLS certificate fingerprint reuse on clearnet host"
    elif exposed_status:
        leak_vector = "Exposed Apache mod_status (/server-status) endpoint leaking internal network details"
    elif cert_matched:
        leak_vector = "TLS X.509 certificate SHA-256 fingerprint reused on a clearnet host"
    else:
        leak_vector = "Infrastructure correlation match"

    return {
        "ip": clearnet_match.get("ip"),
        "country": clearnet_match.get("country"),
        "city": clearnet_match.get("city"),
        "latitude": None,
        "longitude": None,
        "isp": clearnet_match.get("hostname"),
        "asn": clearnet_match.get("asn"),
        "leakVector": leak_vector,
    }


def run_full_scan(onion_url: str, shodan_key: str = None, censys_id: str = None, censys_secret: str = None) -> dict:
    session = get_tor_session()

    open_ports = scan_ports(onion_url)
    banner_info = grab_banner_and_status(onion_url, session)
    tls_info = get_tls_cert_via_tor(onion_url) if 443 in open_ports else None

    clearnet_match = None
    if tls_info and censys_id and censys_secret:
        clearnet_match = censys_cert_lookup(tls_info["sha256Fingerprint"], censys_id, censys_secret)

    if clearnet_match:
        tls_info = dict(tls_info)  # avoid mutating None/shared ref
        tls_info["clearnetMatch"] = clearnet_match

    risk_score = compute_risk_score(banner_info["exposedStatusPage"], clearnet_match, open_ports)
    leaked_origin_ip = build_leaked_origin_ip(
        clearnet_match, banner_info["exposedStatusPage"], clearnet_match is not None
    )

    return {
        "onionUrl": onion_url,
        "status": "ONLINE" if open_ports else "OFFLINE",
        "testedAt": datetime.now(timezone.utc).isoformat(),
        "serverBanner": banner_info["serverBanner"],
        "exposedStatusPage": banner_info["exposedStatusPage"],
        "statusPageDetails": banner_info["statusPageDetails"],
        "sslCertificate": tls_info,
        "openPorts": open_ports,
        "clearnetMatch": clearnet_match,
        "descriptorTiming": {"skewSeconds": None, "ntpSynchronized": None},
        "leakedOriginIP": leaked_origin_ip,
        "riskScore": risk_score,
    }