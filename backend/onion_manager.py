import os
import subprocess
import json
from pathlib import Path

SERVICES = ["testbed", "market-a", "market-b", "market-c", "forum-a", "forum-b", "escrow"]
CACHE_FILE = Path(__file__).parent / "onion_targets.json"
TESTBED_DIR = Path(__file__).parent.parent / "testbed"

def get_all_onion_targets() -> dict[str, str]:
    """Retrieve the generated .onion addresses for all configured Tor services."""
    targets = {}
    
    # 1. Try Docker exec if Docker is available
    try:
        for svc in SERVICES:
            cmd = ["docker", "exec", "obsidian-tor", "cat", f"/var/lib/tor/{svc}/hostname"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            if res.returncode == 0 and res.stdout.strip().endswith(".onion"):
                targets[svc] = res.stdout.strip()
    except Exception:
        pass

    # 2. Check local fallback file if docker call didn't get all
    if len(targets) < len(SERVICES) and CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r") as f:
                cached = json.load(f)
                for svc, onion in cached.items():
                    if svc not in targets:
                        targets[svc] = onion
        except Exception:
            pass

    # 3. If primary target is set in env
    env_target = os.getenv("TESTBED_ONION_URL")
    if env_target and "testbed" not in targets:
        targets["testbed"] = env_target

    if targets:
        need_write = True
        if CACHE_FILE.exists():
            try:
                with open(CACHE_FILE, "r") as f:
                    if json.load(f) == targets:
                        need_write = False
            except Exception:
                pass
        if need_write:
            with open(CACHE_FILE, "w") as f:
                json.dump(targets, f, indent=2)

    return targets

def sync_testbed_cross_links(targets: dict[str, str]):
    """Update testbed/index.html to use the live .onion addresses for multi-onion crawling."""
    if not targets or "testbed" not in targets:
        return

    index_path = TESTBED_DIR / "index.html"
    if not index_path.exists():
        return

    # Build links using live onion hostnames if available, falling back to relative paths
    m_a_url = f"http://{targets['market-a']}/market-a/" if "market-a" in targets else "/market-a/"
    m_b_url = f"http://{targets['market-b']}/market-b/" if "market-b" in targets else "/market-b/"
    m_c_url = f"http://{targets['market-c']}/market-c/" if "market-c" in targets else "/market-c/"
    f_a_url = f"http://{targets['forum-a']}/forum-a/" if "forum-a" in targets else "/forum-a/"
    f_b_url = f"http://{targets['forum-b']}/forum-b/" if "forum-b" in targets else "/forum-b/"
    escrow_url = f"http://{targets['escrow']}/escrow/" if "escrow" in targets else "/escrow/"

    new_html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Obsidian Controlled Tor Testbed</title>
<style>body{{margin:0;background:#101313;color:#d8dedb;font:15px/1.55 system-ui,sans-serif}}main{{max-width:880px;margin:auto;padding:32px 20px}}a{{color:#7bdcb5}}header{{border-bottom:1px solid #3a4641;margin-bottom:22px}}.tag{{color:#9db3a9;font-size:.8rem;text-transform:uppercase;letter-spacing:.12em}}.entry{{background:#18201d;border:1px solid #36443e;border-radius:8px;padding:16px;margin:12px 0}}pre{{white-space:pre-wrap;overflow-wrap:anywhere;background:#0c100e;padding:12px;border-radius:5px;font-size:.78rem}}small{{color:#9db3a9}}.onion-pill{{display:inline-block;padding:2px 8px;background:#1e293b;border-radius:9999px;font-family:monospace;font-size:0.75rem;color:#38bdf8;margin-top:6px}}</style></head>
<body><main><header><div class="tag">Obsidian controlled training dataset - multi-onion cross-correlation testbed</div><h1>Obsidian Controlled Tor Testbed</h1></header><p>This sandboxed testbed spans <strong>7 independent Tor v3 hidden services</strong> to demonstrate automated multi-host discovery, infrastructure scanning, and cross-platform threat actor correlation.</p><p>All listings and nodes are connected via standard HTML hyperlinks across onion services.</p>
<article class="entry"><h2><a href="{m_a_url}">Aster Market</a></h2><p>Escrow listings and vendor notices. 11 synthetic records.</p><div class="onion-pill">{targets.get('market-a', 'market-a.onion')}</div></article>
<article class="entry"><h2><a href="{m_b_url}">Boreal Exchange</a></h2><p>Independent vendor directory. 12 synthetic records.</p><div class="onion-pill">{targets.get('market-b', 'market-b.onion')}</div></article>
<article class="entry"><h2><a href="{m_c_url}">Cinder Bazaar</a></h2><p>Archived marketplace offers. 11 synthetic records.</p><div class="onion-pill">{targets.get('market-c', 'market-c.onion')}</div></article>
<article class="entry"><h2><a href="{f_a_url}">Lantern Forum</a></h2><p>Community references and vendor discussions. 11 synthetic records.</p><div class="onion-pill">{targets.get('forum-a', 'forum-a.onion')}</div></article>
<article class="entry"><h2><a href="{f_b_url}">Harbor Board</a></h2><p>Research-only marketplace discussion board. 10 synthetic records.</p><div class="onion-pill">{targets.get('forum-b', 'forum-b.onion')}</div></article>
<article class="entry"><h2><a href="{escrow_url}">CryptaVault Escrow & Tumbler</a></h2><p>Multi-sig escrow settlements & coin mixing pools. 5 synthetic records.</p><div class="onion-pill">{targets.get('escrow', 'escrow.onion')}</div></article>
<p><small>Obsidian Research Fixture v2.0 - 7 Tor Hidden Services Online</small></p></main></body></html>"""

    need_write = True
    if index_path.exists():
        try:
            with open(index_path, "r", encoding="utf-8") as f:
                if f.read() == new_html:
                    need_write = False
        except Exception:
            pass

    if need_write:
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(new_html)

    d_index = Path("D:/Obsidian/testbed/index.html")
    if d_index.parent.exists() and need_write:
        try:
            with open(d_index, "w", encoding="utf-8") as f:
                f.write(new_html)
        except Exception:
            pass

if __name__ == "__main__":
    targets = get_all_onion_targets()
    print("Discovered Tor Targets:")
    for k, v in targets.items():
        print(f"  {k}: {v}")
    sync_testbed_cross_links(targets)
    print("Synchronized testbed/index.html cross-onion links.")
