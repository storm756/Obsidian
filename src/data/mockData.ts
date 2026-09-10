import { ThreatActorCase, InfraScanResult, GraphNode, GraphLink, StylometricProfile, TimelineEvent, AttributionSignalBreakdown } from '../types';

export const BENCHMARK_CASES: ThreatActorCase[] = [
  {
    id: 'case-venom-01',
    caseNumber: 'CHR-NTRO-2024-091',
    codename: 'HYDRA-CHIMERA',
    primaryHandle: 'VenomVendor',
    aliases: ['Noxious_Direct', 'VenomV_Alpha', 'VV_EscrowAdmin'],
    threatLevel: 'CRITICAL',
    primaryCategory: 'Narcotics & High-Purity Precursors',
    marketplaces: ['Bohemia', 'AlphaBay (Historical)', 'Dread Forum', 'Tor2Door'],
    firstObserved: '2021-04-12',
    lastActive: '2024-09-02',
    status: 'HIGH_CONFIDENCE',
    suspectedRealIdentity: {
      name: 'Pavel K. (Investigative Lead)',
      alias: 'pk_sysadmin92',
      location: 'Sofia, Bulgaria',
      clearnetIP: '185.220.101.44',
      isp: 'Neterra Telecommunications Ltd',
      asn: 'AS34224 (Neterra BG)',
    },
    summary: 'High-volume narcotics vendor active across multiple marketplaces. Migrated from AlphaBay to Bohemia. De-anonymized via exposed Apache mod_status endpoint on custom direct-delivery hidden service, corroborated by 4096R PGP master key fingerprint reuse and 92.4% stylometric concordance.',
    evidenceCount: 14,
    scores: {
      infrastructure: 96,
      entityGraph: 92,
      stylometry: 91,
      composite: 93.8,
    },
    onionServices: [
      'venomv53kx9q2lptmw7r2x99u274y001z848.onion',
      'noxiousdirect4vklsm2091mzzq8821.onion',
      'testbed-leaks-01.onion'
    ],
    pgpKeys: [
      '0x7A94B3C2D812E55A (RSA 4096, created 2021-03-19)',
      'F4A1 89DE 2011 77CB 92E1 0184 7A94 B3C2 D812 E55A'
    ],
    cryptoWallets: [
      'bc1q9v7kmw201994xza0183zzmm3291882a',
      '888tNk919920192837482910293847561829304958671920394857618293049'
    ]
  },
  {
    id: 'case-crypta-02',
    caseNumber: 'CHR-NTRO-2024-042',
    codename: 'CIPHER-VAULT',
    primaryHandle: 'CryptaVault',
    aliases: ['ShadowBroker_77', 'KryptonEx_Admin', 'CoinTumbler_V'],
    threatLevel: 'HIGH',
    primaryCategory: 'Ransomware Proceeds Laundering & Bulletproof Escrow',
    marketplaces: ['Dread Forum', 'ASAP Market', 'Hydra (Historical)', 'Telegram VIP'],
    firstObserved: '2022-08-15',
    lastActive: '2024-08-28',
    status: 'HIGH_CONFIDENCE',
    suspectedRealIdentity: {
      name: 'Unidentified Syndicate Node',
      alias: 'root@vps-frankfurt-91',
      location: 'Frankfurt am Main, Germany',
      clearnetIP: '194.26.29.112',
      isp: 'Equinix Datacenter Services GmbH',
      asn: 'AS9009 (M247 Europe)',
    },
    summary: 'High-yield Bitcoin tumbling & multi-sig escrow operator facilitating ransomware ransom cashouts. Attributed through self-signed X.509 SSL certificate SHA-256 reuse matching a clearnet reverse proxy in Frankfurt, plus co-spent inputs linking Dread moderator donations.',
    evidenceCount: 11,
    scores: {
      infrastructure: 91,
      entityGraph: 88,
      stylometry: 84,
      composite: 88.2,
    },
    onionServices: [
      'cryptavlt99281kz8810293mzn19028.onion',
      'tumblercash77192834019283.onion'
    ],
    pgpKeys: [
      '0xC5019A82D1E43391 (RSA 4096, created 2022-07-29)',
      '3B12 90AE 5110 CC44 8192 4410 C501 9A82 D1E4 3391'
    ],
    cryptoWallets: [
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    ]
  },
  {
    id: 'case-testbed-03',
    caseNumber: 'CHR-NTRO-TEST-001',
    codename: 'AEGIS-TESTBED',
    primaryHandle: 'LabSynthetic_Actor_1',
    aliases: ['GhostTest_Admin', 'DevLeak_Node'],
    threatLevel: 'MEDIUM',
    primaryCategory: 'Responsible-by-Design Academic Testbed',
    marketplaces: ['Local Testbed Market v2', 'Simulated Dread Forum'],
    firstObserved: '2024-01-10',
    lastActive: '2024-09-05',
    status: 'CONFIRMED',
    suspectedRealIdentity: {
      name: 'Research Lab Container #04',
      alias: 'lab_operator_demo',
      location: 'New Delhi, India (Lab VPC)',
      clearnetIP: '103.212.43.19',
      isp: 'National Knowledge Network (NKN)',
      asn: 'AS55836',
    },
    summary: 'Controlled self-hosted Tor hidden-service environment. Demonstrates intentionally exposed static status fixtures, exact identifier reuse, and reviewable cross-site correlation evidence.',
    evidenceCount: 8,
    scores: {
      infrastructure: 99,
      entityGraph: 95,
      stylometry: 88,
      composite: 95.1,
    },
    onionServices: [
      'charonlab4vj7kmk99201msn3819028.onion',
      'misconfigtestbed99281.onion'
    ],
    pgpKeys: [
      '0xDEADBEEF40960001 (RSA 4096, created 2024-01-01)',
      '7788 9900 1122 3344 5566 7788 DEADBEEF 4096 0001'
    ],
    cryptoWallets: [
      'bc1qtestsyntheticmockwallet0000000011928374',
      '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otRmV'
    ]
  },
  {
    id: 'case-insider-04',
    caseNumber: 'ENT-INSD-2024-088',
    codename: 'PHANTOM-INSIDER',
    primaryHandle: 'CorpExfil_Direct',
    aliases: ['InternalLeak_Dev', 'ShadowEngineer_X'],
    threatLevel: 'CRITICAL',
    primaryCategory: 'Enterprise Rogue Insider & Source Code Leak',
    marketplaces: ['BreachForums', 'Bohemia Market', 'Enterprise Slack/Git (Internal)'],
    firstObserved: '2024-03-14',
    lastActive: '2024-09-09',
    status: 'CONFIRMED',
    suspectedRealIdentity: {
      name: 'Vikram S. (DevOps Lead / Employee #4092)',
      alias: 'vikram.s@enterprise.internal',
      location: 'Workstation WS-SEC-092 (Subnet 10.240.14.88)',
      clearnetIP: '10.240.14.88 (Corporate DHCP Lease)',
      isp: 'Internal Enterprise Core Gateway (VLAN-14)',
      asn: 'AS-ENTERPRISE-PRIVATE',
    },
    summary: 'Rogue corporate employee operating darknet escrow and exfiltrating proprietary source code. De-anonymized via internal Tor circuit egress timing correlation on enterprise gateway (10.240.14.88), matched corporate workstation GPG keyring with darknet PGP key (0x4B82EA99), and 94.6% linguistic stylometry concordance between internal Slack messages and darknet breach sale listings.',
    evidenceCount: 16,
    scores: {
      infrastructure: 97,
      entityGraph: 95,
      stylometry: 94,
      composite: 95.5,
    },
    onionServices: [
      'insiderexfil4vj7kmk99201msn3819028.onion',
      'corpleaksdirect8810293mzn19028.onion'
    ],
    pgpKeys: [
      '0x4B82EA99F10238C1 (RSA 4096, matched Workstation WS-SEC-092 keyring)',
      'A102 994B 82EA 99F1 0238 C144 8812 0019 44B1 0928'
    ],
    cryptoWallets: [
      'bc1qinsidermonitoredescrowwallet0019284756',
      '888tCorpExfilPaymentAddress192837465019283'
    ]
  }
];

export const MOCK_INFRA_SCANS: Record<string, InfraScanResult> = {
  'case-venom-01': {
    onionUrl: 'venomv53kx9q2lptmw7r2x99u274y001z848.onion',
    status: 'ONLINE',
    testedAt: '2024-09-04T18:32:10Z',
    serverBanner: 'Apache/2.4.41 (Ubuntu) mod_ssl/2.4.41 OpenSSL/1.1.1f',
    exposedStatusPage: true,
    statusPageDetails: {
      serverUptime: '47 days, 14 hours, 21 minutes',
      totalRequests: 849204,
      workerSlotsLeaked: true,
      internalIPs: ['192.168.1.104', '185.220.101.44'],
    },
    sslCertificate: {
      hasSsl: true,
      issuer: 'Let\'s Encrypt Authority X3',
      subject: 'CN=nox-delivery-bg.net',
      serialNumber: '03:8b:44:91:fa:e8:11:00:2b:81',
      sha256Fingerprint: '7b82f8a192c011e479a02931bc44820199e1a84f33918a2044810293bf401944',
      validFrom: '2024-03-01',
      validTo: '2024-11-28',
      sans: ['nox-delivery-bg.net', 'mail.nox-delivery-bg.net', 'vpn.nox-delivery-bg.net'],
      clearnetMatch: {
        ip: '185.220.101.44',
        hostname: 'vps-sofia-core.neterra.bg',
        country: 'Bulgaria',
        city: 'Sofia',
        asn: 'AS34224',
        confidence: 98,
      }
    },
    openPorts: [80, 443, 22, 9050],
    descriptorTiming: {
      skewSeconds: 0.42,
      ntpSynchronized: true,
    },
    leakedOriginIP: {
      ip: '185.220.101.44',
      country: 'Bulgaria',
      city: 'Sofia',
      latitude: 42.6977,
      longitude: 23.3219,
      isp: 'Neterra Telecommunications Ltd',
      asn: 'AS34224',
      leakVector: 'Exposed Apache mod_status (/server-status) leaking client/origin IP + TLS SAN CN=nox-delivery-bg.net',
    },
    riskScore: 96,
  },
  'case-crypta-02': {
    onionUrl: 'cryptavlt99281kz8810293mzn19028.onion',
    status: 'ONLINE',
    testedAt: '2024-09-03T11:15:40Z',
    serverBanner: 'nginx/1.18.0 (Ubuntu)',
    exposedStatusPage: false,
    sslCertificate: {
      hasSsl: true,
      issuer: 'C=DE, ST=Hessen, L=Frankfurt, O=ShadowNode Ops, CN=escrow-node-09.de',
      subject: 'CN=escrow-node-09.de',
      serialNumber: '11:22:33:44:aa:bb:cc:dd:ee:ff',
      sha256Fingerprint: '99e4f0183a019284bc7102938475610293847561029384756102938475610293',
      validFrom: '2023-08-10',
      validTo: '2025-08-10',
      sans: ['escrow-node-09.de', 'api.escrow-node-09.de'],
      clearnetMatch: {
        ip: '194.26.29.112',
        hostname: 'node-fra-99.m247.com',
        country: 'Germany',
        city: 'Frankfurt',
        asn: 'AS9009',
        confidence: 94,
      }
    },
    openPorts: [443, 8443, 22],
    descriptorTiming: {
      skewSeconds: 1.15,
      ntpSynchronized: true,
    },
    leakedOriginIP: {
      ip: '194.26.29.112',
      country: 'Germany',
      city: 'Frankfurt',
      latitude: 50.1109,
      longitude: 8.6821,
      isp: 'Equinix Datacenter / M247 Europe',
      asn: 'AS9009',
      leakVector: 'TLS X.509 Certificate SHA-256 Fingerprint Reuse on Clearnet Port 8443',
    },
    riskScore: 91,
  },
  'case-testbed-03': {
    onionUrl: 'charonlab4vj7kmk99201msn3819028.onion',
    status: 'ONLINE',
    testedAt: '2024-09-05T08:00:00Z',
    serverBanner: 'Apache/2.4.52 (Ubuntu) mod_status/enabled',
    exposedStatusPage: true,
    statusPageDetails: {
      serverUptime: '3 days, 6 hours',
      totalRequests: 1420,
      workerSlotsLeaked: true,
      internalIPs: ['10.0.0.15', '103.212.43.19'],
    },
    sslCertificate: {
      hasSsl: true,
      issuer: 'CN=charon-research-lab.local',
      subject: 'CN=charon-research-lab.local',
      serialNumber: 'DE:AD:BE:EF:01',
      sha256Fingerprint: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      validFrom: '2024-01-01',
      validTo: '2026-01-01',
      sans: ['charon-research-lab.local'],
      clearnetMatch: {
        ip: '103.212.43.19',
        hostname: 'lab-node.sih-charon.in',
        country: 'India',
        city: 'New Delhi',
        asn: 'AS55836',
        confidence: 100,
      }
    },
    openPorts: [80, 443, 8080],
    descriptorTiming: {
      skewSeconds: 0.05,
      ntpSynchronized: true,
    },
    leakedOriginIP: {
      ip: '103.212.43.19',
      country: 'India',
      city: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      isp: 'National Knowledge Network (NKN)',
      asn: 'AS55836',
      leakVector: 'Simulated Apache mod_status + OpenSSH Banner Leak (Plant for Hackathon Demo)',
    },
    riskScore: 99,
  },
  'case-insider-04': {
    onionUrl: 'insiderexfil4vj7kmk99201msn3819028.onion',
    status: 'ONLINE',
    testedAt: '2024-09-09T14:22:00Z',
    serverBanner: 'Apache/2.4.52 (Ubuntu) Corporate-Staging-Build',
    exposedStatusPage: true,
    statusPageDetails: {
      serverUptime: '14 days, 2 hours',
      totalRequests: 8940,
      workerSlotsLeaked: true,
      internalIPs: ['10.240.14.88', '192.168.1.105'],
    },
    sslCertificate: {
      hasSsl: true,
      issuer: 'CN=corp-sec-internal-ca',
      subject: 'CN=ws-sec-092.enterprise.internal',
      serialNumber: '4B:82:EA:99:04:92',
      sha256Fingerprint: '4b82ea99f10238c1a102994b82ea99f10238c1448812001944b10928a49281c0',
      validFrom: '2024-01-01',
      validTo: '2025-01-01',
      sans: ['ws-sec-092.enterprise.internal', 'dev-vikram.internal'],
      clearnetMatch: {
        ip: '10.240.14.88',
        hostname: 'ws-sec-092.enterprise.internal',
        country: 'Enterprise Intranet',
        city: 'Campus LAN (VLAN-14)',
        asn: 'AS-PRIVATE-ENTERPRISE',
        confidence: 99,
      }
    },
    openPorts: [80, 443, 22, 9050],
    descriptorTiming: {
      skewSeconds: 0.12,
      ntpSynchronized: true,
    },
    leakedOriginIP: {
      ip: '10.240.14.88',
      country: 'Internal Corporate Network',
      city: 'Campus Workstation Cluster',
      latitude: 28.6139,
      longitude: 77.2090,
      isp: 'Internal DHCP Pool (Assigned to Vikram S., DevOps)',
      asn: 'AS-PRIVATE-CORP',
      leakVector: 'Exposed Apache /server-status + Internal SSL Cert with Workstation Hostname SAN',
    },
    riskScore: 97,
  }
};

export const MOCK_GRAPH_DATA: Record<string, { nodes: GraphNode[]; links: GraphLink[] }> = {
  'case-venom-01': {
    nodes: [
      { id: 'actor-venom', label: 'VenomVendor', type: 'actor', threatLevel: 'CRITICAL', properties: { role: 'Primary Persona', status: 'Active 2021-2023' } },
      { id: 'actor-noxious', label: 'Noxious_Direct', type: 'actor', threatLevel: 'HIGH', properties: { role: 'Rebranded Persona (Bohemia)', status: 'Active 2023-Present' } },
      { id: 'actor-vv-admin', label: 'VV_EscrowAdmin', type: 'actor', threatLevel: 'MEDIUM', properties: { role: 'Forum Support Handle', status: 'Dread Forum' } },
      { id: 'market-alphabay', label: 'AlphaBay Market', type: 'marketplace', properties: { status: 'Seized/Offline', tier: 'Tier 1 Darknet' } },
      { id: 'market-bohemia', label: 'Bohemia Market', type: 'marketplace', properties: { status: 'Active', category: 'Multi-vendor' } },
      { id: 'market-dread', label: 'Dread Forum', type: 'forum', properties: { role: 'Reputation & Dispute Community' } },
      { id: 'pgp-master', label: 'PGP: 0x7A94B3C2D812E55A', type: 'pgp', properties: { bits: 4096, algo: 'RSA', created: '2021-03-19', fingerprint: 'F4A1 89DE 2011 77CB 92E1 0184 7A94 B3C2 D812 E55A' } },
      { id: 'wallet-btc', label: 'BTC: bc1q9v7kmw...91882a', type: 'wallet', properties: { asset: 'Bitcoin', balance: '18.44 BTC', cluster: 'Direct Escrow Sweep' } },
      { id: 'wallet-xmr', label: 'XMR: 888tNk91...8293049', type: 'wallet', properties: { asset: 'Monero', privacy: 'RingCT Obfuscated', txCount: 142 } },
      { id: 'infra-onion-1', label: 'venomv53k...onion', type: 'infrastructure', properties: { service: 'Direct Vendor Storefront', port: 80 } },
      { id: 'infra-clearnet-ip', label: 'Clearnet IP: 185.220.101.44', type: 'infrastructure', properties: { isp: 'Neterra BG', city: 'Sofia', asn: 'AS34224' } },
      { id: 'identity-pavel', label: 'Pavel K. (Attribution Lead)', type: 'actor', threatLevel: 'CRITICAL', properties: { identityLead: 'Sysadmin Sofia', domainReg: 'nox-delivery-bg.net' } }
    ],
    links: [
      { source: 'actor-venom', target: 'market-alphabay', relationship: 'OPERATED_ON', confidence: 99, evidenceSource: 'Gwern Darknet Market Archive (AlphaBay 2021-2022)', observedDate: '2021-04-12' },
      { source: 'actor-venom', target: 'pgp-master', relationship: 'USED_PGP', confidence: 100, evidenceSource: 'Signed Vendor Listing Key Block', observedDate: '2021-04-12' },
      { source: 'actor-noxious', target: 'pgp-master', relationship: 'USED_PGP', confidence: 100, evidenceSource: 'Identical 4096-bit RSA Fingerprint on Bohemia Profile', observedDate: '2023-06-18' },
      { source: 'actor-noxious', target: 'market-bohemia', relationship: 'OPERATED_ON', confidence: 98, evidenceSource: 'Bohemia Verified Vendor Registry', observedDate: '2023-06-18' },
      { source: 'actor-venom', target: 'actor-noxious', relationship: 'ALIAS_OF', confidence: 94, evidenceSource: 'Multi-Signal Fusion (PGP + Stylometry + Infra Leak)', observedDate: '2023-07-01' },
      { source: 'actor-vv-admin', target: 'market-dread', relationship: 'OPERATED_ON', confidence: 95, evidenceSource: 'Dread Subdread /d/VenomOfficial Moderator List', observedDate: '2022-01-15' },
      { source: 'actor-vv-admin', target: 'pgp-master', relationship: 'USED_PGP', confidence: 90, evidenceSource: 'Subkey signed PGP Announcement on Dread', observedDate: '2022-01-16' },
      { source: 'actor-noxious', target: 'wallet-btc', relationship: 'TRANSACTED_WITH', confidence: 96, evidenceSource: 'Bohemia Direct Order Payment Address', observedDate: '2023-09-12' },
      { source: 'actor-noxious', target: 'wallet-xmr', relationship: 'TRANSACTED_WITH', confidence: 85, evidenceSource: 'Stealth Direct PGP Message Order Confirmation', observedDate: '2023-10-04' },
      { source: 'actor-noxious', target: 'infra-onion-1', relationship: 'HOSTED_ON', confidence: 98, evidenceSource: 'Vendor Direct Storefront URL announced in PGP signed bio', observedDate: '2023-08-20' },
      { source: 'infra-onion-1', target: 'infra-clearnet-ip', relationship: 'ORIGIN_IP_LEAK', confidence: 98, evidenceSource: 'Apache /server-status leak + TLS Cert SAN CN=nox-delivery-bg.net', observedDate: '2024-09-04' },
      { source: 'infra-clearnet-ip', target: 'identity-pavel', relationship: 'ALIAS_OF', confidence: 89, evidenceSource: 'WHOIS registrant for nox-delivery-bg.net & VPS reverse DNS', observedDate: '2024-09-04' }
    ]
  },
  'case-crypta-02': {
    nodes: [
      { id: 'actor-crypta', label: 'CryptaVault', type: 'actor', threatLevel: 'HIGH', properties: { role: 'Primary Tumbler' } },
      { id: 'actor-shadow', label: 'ShadowBroker_77', type: 'actor', threatLevel: 'HIGH', properties: { role: 'ASAP Market Vendor' } },
      { id: 'market-asap', label: 'ASAP Market', type: 'marketplace', properties: { tier: 'Darknet Vendor' } },
      { id: 'market-dread', label: 'Dread Forum', type: 'forum', properties: { role: 'Vouch Hub' } },
      { id: 'pgp-crypta', label: 'PGP: 0xC5019A82D1E43391', type: 'pgp', properties: { bits: 4096, algo: 'RSA' } },
      { id: 'wallet-escrow', label: 'BTC: bc1qxy2kg...x0wlh', type: 'wallet', properties: { balance: '94.2 BTC' } },
      { id: 'infra-fra-ip', label: 'Clearnet IP: 194.26.29.112', type: 'infrastructure', properties: { city: 'Frankfurt', asn: 'AS9009' } }
    ],
    links: [
      { source: 'actor-crypta', target: 'pgp-crypta', relationship: 'USED_PGP', confidence: 100, evidenceSource: 'Tumbler announcement', observedDate: '2022-08-15' },
      { source: 'actor-shadow', target: 'market-asap', relationship: 'OPERATED_ON', confidence: 95, evidenceSource: 'Vendor Listing', observedDate: '2023-01-20' },
      { source: 'actor-shadow', target: 'wallet-escrow', relationship: 'TRANSACTED_WITH', confidence: 92, evidenceSource: 'Multi-sig settlement', observedDate: '2023-04-10' },
      { source: 'actor-crypta', target: 'wallet-escrow', relationship: 'TRANSACTED_WITH', confidence: 97, evidenceSource: 'Escrow sweep cluster', observedDate: '2023-04-12' },
      { source: 'actor-crypta', target: 'infra-fra-ip', relationship: 'ORIGIN_IP_LEAK', confidence: 94, evidenceSource: 'SSL X.509 SHA-256 fingerprint reuse', observedDate: '2024-09-03' },
      { source: 'actor-crypta', target: 'actor-shadow', relationship: 'ALIAS_OF', confidence: 88, evidenceSource: 'Co-spent UTXO + Stylometry match', observedDate: '2023-05-01' }
    ]
  },
  'case-testbed-03': {
    nodes: [
      { id: 'test-synthetic', label: 'LabSynthetic_Actor_1', type: 'actor', threatLevel: 'MEDIUM', properties: { role: 'Synthetic Persona' } },
      { id: 'test-admin', label: 'GhostTest_Admin', type: 'actor', threatLevel: 'LOW', properties: { role: 'Sub-persona' } },
      { id: 'test-market', label: 'Local Testbed Market v2', type: 'marketplace', properties: { role: 'Simulated Market' } },
      { id: 'test-pgp', label: 'PGP: 0xDEADBEEF40960001', type: 'pgp', properties: { bits: 4096 } },
      { id: 'test-onion', label: 'charonlab4vj7...onion', type: 'infrastructure', properties: { host: 'Tor v3' } },
      { id: 'test-ip', label: 'Clearnet IP: 103.212.43.19', type: 'infrastructure', properties: { location: 'New Delhi (Lab VPC)' } }
    ],
    links: [
      { source: 'test-synthetic', target: 'test-market', relationship: 'OPERATED_ON', confidence: 100, evidenceSource: 'Testbed Catalog', observedDate: '2024-01-10' },
      { source: 'test-synthetic', target: 'test-pgp', relationship: 'USED_PGP', confidence: 100, evidenceSource: 'Generated RSA Key Block', observedDate: '2024-01-10' },
      { source: 'test-admin', target: 'test-pgp', relationship: 'USED_PGP', confidence: 96, evidenceSource: 'Signed Subkey Verification', observedDate: '2024-02-15' },
      { source: 'test-synthetic', target: 'test-onion', relationship: 'HOSTED_ON', confidence: 100, evidenceSource: 'Tor Hidden Service daemon', observedDate: '2024-01-10' },
      { source: 'test-onion', target: 'test-ip', relationship: 'ORIGIN_IP_LEAK', confidence: 100, evidenceSource: 'Apache /server-status exposed endpoint', observedDate: '2024-09-05' },
      { source: 'test-synthetic', target: 'test-admin', relationship: 'ALIAS_OF', confidence: 95, evidenceSource: 'Graph + Stylometry test suite', observedDate: '2024-03-01' }
    ]
  },
  'case-insider-04': {
    nodes: [
      { id: 'actor-corp-exfil', label: 'CorpExfil_Direct', type: 'actor', threatLevel: 'CRITICAL', properties: { role: 'Darknet Breach Persona', status: 'Active 2024' } },
      { id: 'actor-vikram', label: 'Vikram S. (DevOps Lead)', type: 'actor', threatLevel: 'CRITICAL', properties: { identityLead: 'Employee #4092', department: 'Cloud Infrastructure' } },
      { id: 'node-workstation', label: 'Host: WS-SEC-092', type: 'infrastructure', properties: { os: 'Ubuntu 22.04 LTS', domain: 'enterprise.internal' } },
      { id: 'node-internal-ip', label: 'Internal IP: 10.240.14.88', type: 'origin_ip', properties: { vlan: 'VLAN-14 DevOps', dhcpLease: 'Active' } },
      { id: 'node-pgp', label: 'PGP: 0x4B82EA99F10238C1', type: 'pgp', properties: { bits: 4096, algo: 'RSA', created: '2024-03-12', fingerprint: 'A102 994B 82EA 99F1 0238 C144 8812 0019 44B1 0928' } },
      { id: 'node-wallet', label: 'BTC: bc1qinsider...4756', type: 'wallet', properties: { asset: 'Bitcoin', balance: '4.82 BTC', cluster: 'Breach Escrow Settlement' } },
      { id: 'node-onion', label: 'insiderexfil4v...onion', type: 'infrastructure', properties: { service: 'Rogue Exfil Storefront', port: 80 } },
      { id: 'market-breach', label: 'BreachForums Market', type: 'marketplace', properties: { role: 'Credential & Source Code Leak Market' } },
      { id: 'channel-slack', label: 'Slack: #devops-infra', type: 'forum', properties: { role: 'Corporate Workplace Communications' } }
    ],
    links: [
      { source: 'actor-corp-exfil', target: 'market-breach', relationship: 'OPERATED_ON', confidence: 99, evidenceSource: 'BreachForums verified listing catalog', observedDate: '2024-03-14' },
      { source: 'actor-corp-exfil', target: 'node-pgp', relationship: 'USED_PGP', confidence: 100, evidenceSource: 'Signed Darknet Breach Announcement', observedDate: '2024-03-14' },
      { source: 'actor-corp-exfil', target: 'node-wallet', relationship: 'TRANSACTED_WITH', confidence: 97, evidenceSource: 'Escrow deposit transaction ID 7b92a...', observedDate: '2024-04-02' },
      { source: 'actor-corp-exfil', target: 'node-onion', relationship: 'HOSTED_ON', confidence: 98, evidenceSource: 'Direct vendor storefront URL in profile', observedDate: '2024-03-20' },
      { source: 'node-onion', target: 'node-internal-ip', relationship: 'ORIGIN_IP_LEAK', confidence: 99, evidenceSource: 'Apache /server-status handler leaked corporate IP 10.240.14.88', observedDate: '2024-09-09' },
      { source: 'node-internal-ip', target: 'node-workstation', relationship: 'OPERATED_ON', confidence: 100, evidenceSource: 'Corporate DHCP Lease Table mapped to WS-SEC-092', observedDate: '2024-09-09' },
      { source: 'node-workstation', target: 'actor-vikram', relationship: 'OPERATED_ON', confidence: 100, evidenceSource: 'Active Directory Kerberos ticket binding for vikram.s', observedDate: '2024-09-09' },
      { source: 'actor-vikram', target: 'node-pgp', relationship: 'USED_PGP', confidence: 100, evidenceSource: 'osquery EDR discovered identical 4096R key in /home/vikram/.gnupg', observedDate: '2024-09-09' },
      { source: 'actor-vikram', target: 'channel-slack', relationship: 'OPERATED_ON', confidence: 98, evidenceSource: 'Corporate Slack logs across #devops-infra', observedDate: '2024-09-09' },
      { source: 'actor-corp-exfil', target: 'actor-vikram', relationship: 'ALIAS_OF', confidence: 95, evidenceSource: 'MCDA Fusion: NetFlow Egress Timing + EDR GPG Key + Slack Stylometry', observedDate: '2024-09-09' }
    ]
  }
};

export const SAMPLE_TEXTS = {
  sample_venom_alphabay: `### VENOM VENDOR -- PREMIUM DISPATCH NOTICE ###
Greetings to our loyal buyers on AlphaBay...
All orders placed before 14:00 UTC are dispatched within 12h stealth vacuum packed.
We kindly request buyers to ALWAYS encrypt your delivery coordinates using our updated 4096R PGP key below.
Never send plain text addresses in PM. Do not finalize early unless specifically instructed for bulk tier 3 orders...
Reship policy: In the rare event of domestic customs seizure, 50% reship is provided upon delivery tracking inspection.
Stay safe, stay stealthy.
-- VenomVendor`,

  sample_noxious_bohemia: `### NOXIOUS DIRECT -- OFFICIAL STOREFRONT POLICY ###
Welcome back comrades. We are now operational on Bohemia market...
Dispatched within 12h stealth vacuum packed double MBB barrier.
We kindly insist that you encrypt your drop info with our public PGP block attached on profile.
Do not send unencrypted plain text info under any circumstances...
Reship guarantee: In case of non-arrival after 14 business days, we provide 50% reship upon tracking confirmation.
High purity guaranteed on all batches.
-- Noxious_Direct`,

  sample_shadow_asap: `SHADOW BROKER 77 - BULK LOGINS & ACCESS KEYS
Check feedback before ordering. Instant automated escrow settlement via multisig.
Strict policy: No test keys provided. Check validity within 2 hours of delivery.
PGP mandatory for support tickets. No Telegram contact unless listed on verified PGP clear-sign.
Funds swept through non-custodial mixing channels.`,

  sample_unrelated_vendor: `HELLO EVERYONE WELCOME TO MY SHOP FAST SHIPMENT GUARANTEED!!
BUY NOW BEST PRICES ON THE MARKET 100% SATISFACTION!!
CONTACT ME ON WICKR OR TELEGRAM FOR FAST DISCOUNTS.
NO REFUNDS AFTER TRACKING IS GIVEN. HAVE A NICE DAY.`,

  sample_insider_slack: `Hey DevOps team...
All staging deployment tasks must be completed within 12h sprint review cycles.
We kindly insist on verifying GPG signed commits before pushing to main branch...
Never push raw AWS credentials to git repositories under any circumstances.
Kindly check Jira ticket attachments upon code review completion.
-- Vikram (DevOps Lead)`,

  sample_insider_darknet: `### EXCLUSIVE PROPRIETARY ENTERPRISE SOURCE CODE DUMP ###
Greetings buyers...
Complete enterprise core microservices repo dispatched within 12h upon BTC escrow confirmation.
We kindly insist on using our updated 4096R PGP key for all secret delivery drop info...
Never send unencrypted plain text inquiries under any circumstances.
Guaranteed full commit logs and environment variables provided upon payment.
-- CorpExfil_Direct`
};

export const MOCK_STYLOMETRIC_PROFILES: Record<string, StylometricProfile> = {
  'VenomVendor': {
    actorHandle: 'VenomVendor (AlphaBay)',
    sampleCount: 42,
    totalWords: 8420,
    metrics: {
      avgSentenceLength: 14.8,
      avgWordLength: 4.9,
      typeTokenRatio: 0.384,
      yulesK: 98.4,
      hapaxRatio: 0.521,
      ellipsesPer100Words: 1.45,
      punctuationDensity: 11.2,
      capitalizationRate: 5.8,
      modalVerbRate: 3.2,
    },
    topFunctionWords: [
      { word: 'upon', freq: 0.012 },
      { word: 'within', freq: 0.018 },
      { word: 'kindly', freq: 0.009 },
      { word: 'always', freq: 0.014 },
      { word: 'never', freq: 0.011 },
    ],
    distinctiveIdioms: [
      'dispatched within 12h stealth vacuum packed',
      'we kindly request',
      'trailing ellipses (...) after greeting and closing',
      'double MBB barrier'
    ],
    sentimentProfile: {
      formality: 78,
      assertiveness: 84,
      aggression: 15,
    }
  },
  'Noxious_Direct': {
    actorHandle: 'Noxious_Direct (Bohemia)',
    sampleCount: 38,
    totalWords: 7890,
    metrics: {
      avgSentenceLength: 14.4,
      avgWordLength: 4.88,
      typeTokenRatio: 0.391,
      yulesK: 96.8,
      hapaxRatio: 0.514,
      ellipsesPer100Words: 1.38,
      punctuationDensity: 10.9,
      capitalizationRate: 5.4,
      modalVerbRate: 3.1,
    },
    topFunctionWords: [
      { word: 'upon', freq: 0.011 },
      { word: 'within', freq: 0.017 },
      { word: 'kindly', freq: 0.008 },
      { word: 'always', freq: 0.013 },
      { word: 'under', freq: 0.010 },
    ],
    distinctiveIdioms: [
      'dispatched within 12h stealth vacuum packed',
      'we kindly insist',
      'double MBB barrier',
      'upon tracking confirmation'
    ],
    sentimentProfile: {
      formality: 75,
      assertiveness: 82,
      aggression: 18,
    }
  }
};

export const MOCK_TIMELINES: Record<string, TimelineEvent[]> = {
  'case-venom-01': [
    {
      id: 't-1',
      date: '2021-04-12',
      source: 'AlphaBay Market Archive (Gwern Dataset)',
      category: 'MARKET_TRANSITION',
      title: 'Vendor Registration & Key Publication',
      description: 'Threat actor registers handle "VenomVendor" on AlphaBay. Uploads 4096-bit RSA PGP key ID 0x7A94B3C2D812E55A.',
      severity: 'INFO',
      corroboratedBy: 'Gwern Market Snapshot / PGP Keyring Dump',
    },
    {
      id: 't-2',
      date: '2022-01-15',
      source: 'Dread Forum (/d/VenomOfficial)',
      category: 'FORUM_POST',
      title: 'Dread Subdread Creation',
      description: 'Support handle "VV_EscrowAdmin" launches dedicated dispute subdread. PGP subkey proves cryptographic authority.',
      severity: 'MEDIUM',
      corroboratedBy: 'Dread PostgreSQL forum archive dump',
    },
    {
      id: 't-3',
      date: '2022-10-04',
      source: 'Blockchain Intelligence / BlockSci',
      category: 'FINANCIAL_FLOW',
      title: 'High-Volume BTC Escrow Sweeps',
      description: 'Vendor consolidates 18.44 BTC into change address bc1q9v7... before splitting to Wasabi CoinJoin mixer.',
      severity: 'HIGH',
      corroboratedBy: 'Mempool graph clustering analysis',
    },
    {
      id: 't-4',
      date: '2023-06-18',
      source: 'Bohemia Market Ingestion',
      category: 'MARKET_TRANSITION',
      title: 'Rebrand to "Noxious_Direct"',
      description: 'Following market disruption, actor announces migration to Bohemia under new moniker "Noxious_Direct".',
      severity: 'HIGH',
      corroboratedBy: 'Identical PGP key fingerprint & listing stylometry',
    },
    {
      id: 't-5',
      date: '2023-08-20',
      source: 'Tor Hidden Service Crawler',
      category: 'INFRA_LEAK',
      title: 'Direct Storefront Onion Deployed',
      description: 'Actor launches autonomous hidden service venomv53kx9q...onion to bypass 5% market commission.',
      severity: 'HIGH',
      corroboratedBy: 'OnionScan automated crawl feed',
    },
    {
      id: 't-6',
      date: '2024-09-04',
      source: 'Obsidian OnionScan Misconfiguration Engine',
      category: 'INFRA_LEAK',
      title: 'CRITICAL: Apache mod_status & TLS SAN Clearnet Leak',
      description: 'Operational security blunder: Hidden service web server exposes /server-status with unmasked client requests and uses TLS certificate with SAN pointing to clearnet domain nox-delivery-bg.net (Sofia, Bulgaria). Origin IP 185.220.101.44 confirmed.',
      severity: 'CRITICAL',
      corroboratedBy: 'Live Port 80/443 TCP banner capture & Shodan TLS index',
    },
  ],
  'case-crypta-02': [
    {
      id: 't-c1',
      date: '2022-08-15',
      source: 'ASAP Market & Telegram VIP',
      category: 'MARKET_TRANSITION',
      title: 'CryptaVault Launch',
      description: 'High-tier tumbling service begins advertising automated escrow sweeps.',
      severity: 'INFO',
      corroboratedBy: 'ASAP Listing Database',
    },
    {
      id: 't-c2',
      date: '2023-04-12',
      source: 'Blockchain Trace',
      category: 'FINANCIAL_FLOW',
      title: '94.2 BTC Multi-Sig Consolidation',
      description: 'Transfers linked between ShadowBroker_77 vendor listings and CryptaVault mixer pool.',
      severity: 'HIGH',
      corroboratedBy: 'UTXO Co-spend clustering',
    },
    {
      id: 't-c3',
      date: '2024-09-03',
      source: 'Obsidian TLS Scanner',
      category: 'INFRA_LEAK',
      title: 'X.509 SSL Certificate SHA-256 Fingerprint Reuse',
      description: 'Self-signed SSL certificate on hidden service matches clearnet host 194.26.29.112 (Frankfurt, M247 ASN 9009).',
      severity: 'CRITICAL',
      corroboratedBy: 'Censys / Shodan X.509 index',
    },
  ],
  'case-testbed-03': [
    {
      id: 't-t1',
      date: '2024-01-10',
      source: 'Lab Testbed Framework',
      category: 'MARKET_TRANSITION',
      title: 'Test Environment Initialized',
      description: 'Synthetic actor initialized on isolated Tor v3 test hidden service for verification.',
      severity: 'INFO',
      corroboratedBy: 'Docker container orchestrator',
    },
    {
      id: 't-t2',
      date: '2024-09-05',
      source: 'Obsidian Active Testbed Scan',
      category: 'INFRA_LEAK',
      title: 'Planted Misconfiguration Triggered',
      description: 'Obsidian successfully identifies simulated Apache mod_status and internal VPC address 103.212.43.19.',
      severity: 'CRITICAL',
      corroboratedBy: 'Local diagnostic tracer',
    },
  ],
  'case-insider-04': [
    {
      id: 't-in1',
      date: '2024-03-12',
      source: 'Corporate EDR (osquery / Endpoint Log)',
      category: 'PGP_ACTIVITY',
      title: 'Workstation 4096R GPG Key Generation',
      description: 'Employee Vikram S. generates 4096-bit RSA key on corporate laptop WS-SEC-092. Keyring matches darknet key 0x4B82EA99F10238C1.',
      severity: 'HIGH',
      corroboratedBy: 'EDR GnuPG directory file integrity monitoring',
    },
    {
      id: 't-in2',
      date: '2024-03-14',
      source: 'Darknet Market Crawler / BreachForums',
      category: 'MARKET_TRANSITION',
      title: 'Breach Listing & Darknet Handle Registration',
      description: 'Moniker "CorpExfil_Direct" registers on BreachForums offering proprietary microservices source code and enterprise API keys.',
      severity: 'HIGH',
      corroboratedBy: 'BreachForums verified archive listing',
    },
    {
      id: 't-in3',
      date: '2024-04-02',
      source: 'Internal NetFlow / Zeek Gateway',
      category: 'INFRA_LEAK',
      title: 'Tor Circuit Egress Timing Correlation',
      description: 'Internal IP 10.240.14.88 initiates high-entropy Tor packet bursts exactly 0.8s prior to darknet listing updates (p < 0.0001).',
      severity: 'CRITICAL',
      corroboratedBy: 'Cisco NetFlow sensor + Tor Consensus Entry Guard IP',
    },
    {
      id: 't-in4',
      date: '2024-09-09',
      source: 'Obsidian Stylometric Engine & Active Directory',
      category: 'INFRA_LEAK',
      title: 'CRITICAL: Multi-Signal Attribution & Identity De-Anonymization',
      description: 'Apache /server-status leak on custom exfil onion exposes internal DHCP IP 10.240.14.88. Active Directory maps lease to Vikram S. Stylometric analysis of employee Slack messages yields 94.6% linguistic match with darknet listing.',
      severity: 'CRITICAL',
      corroboratedBy: 'DHCP lease binding + Slack Mosteller-Wallace function word concordance',
    },
  ]
};

export const MOCK_FUSION_SIGNALS: Record<string, AttributionSignalBreakdown[]> = {
  'case-venom-01': [
    {
      signalName: 'Origin IP De-cloaking (Apache mod_status)',
      category: 'INFRASTRUCTURE',
      weight: 0.40,
      rawScore: 96,
      weightedScore: 38.4,
      evidenceSummary: 'Direct origin IP 185.220.101.44 (Sofia, Bulgaria) exposed via misconfigured Apache server-status endpoint on hidden service.',
      verifiableProof: 'TCP Handshake + HTTP GET /server-status payload containing internal virtualhost headers and ISP AS34224',
      evidenceConfidence: 98,
    },
    {
      signalName: 'TLS X.509 Certificate SubjectAltName (SAN) Correlation',
      category: 'INFRASTRUCTURE',
      weight: 0.15,
      rawScore: 95,
      weightedScore: 14.25,
      evidenceSummary: 'SSL Certificate SHA256 7b82f8a... issued for nox-delivery-bg.net matches clearnet reverse DNS in Sofia.',
      verifiableProof: 'X.509 Serial 03:8b:44:91... matching Censys/Shodan clearnet IP scan on port 443',
      evidenceConfidence: 96,
    },
    {
      signalName: 'Cryptographic Identity (4096-bit PGP Fingerprint Reuse)',
      category: 'ENTITY_GRAPH',
      weight: 0.25,
      rawScore: 99,
      weightedScore: 24.75,
      evidenceSummary: 'Identical 4096R PGP fingerprint (0x7A94B3C2D812E55A) published by VenomVendor on AlphaBay and Noxious_Direct on Bohemia.',
      verifiableProof: 'Cryptographic signature verification on vendor announcements across both marketplaces with matching subkey creation timestamps',
      evidenceConfidence: 99,
    },
    {
      signalName: 'Multi-Marketplace Financial / Escrow Clustering',
      category: 'ENTITY_GRAPH',
      weight: 0.10,
      rawScore: 84,
      weightedScore: 8.4,
      evidenceSummary: 'Bohemia direct payment BTC address co-spent into common withdrawal wallet cluster associated with VenomVendor.',
      verifiableProof: 'Co-spend transaction ID b3a82f... with 18.44 BTC consolidation',
      evidenceConfidence: 85,
    },
    {
      signalName: 'Stylometric & Semantic Authorship Attribution',
      category: 'STYLOMETRY',
      weight: 0.10,
      rawScore: 91,
      weightedScore: 9.1,
      evidenceSummary: '92.4% stylometric concordance (Yule\'s K = 98.4 vs 96.8, matching function words "upon", "within", "kindly", and idiosyncratic trailing ellipses).',
      verifiableProof: 'Cosine similarity of function-word distributions + sentence cadence correlation analysis across 80+ listing samples',
      evidenceConfidence: 92,
    },
  ],
  'case-crypta-02': [
    {
      signalName: 'TLS Certificate SHA-256 Fingerprint Matching Clearnet Host',
      category: 'INFRASTRUCTURE',
      weight: 0.45,
      rawScore: 91,
      weightedScore: 40.95,
      evidenceSummary: 'Self-signed certificate on .onion service reused on Frankfurt VPS 194.26.29.112 (AS9009).',
      verifiableProof: 'SHA256 99e4f0183... identical on Tor port 443 and Clearnet port 8443',
      evidenceConfidence: 94,
    },
    {
      signalName: 'Multi-Sig Escrow Wallet Transaction Graph Co-spending',
      category: 'ENTITY_GRAPH',
      weight: 0.35,
      rawScore: 88,
      weightedScore: 30.8,
      evidenceSummary: 'Direct multi-hop co-spending linking Dread forum moderator donation to ASAP vendor settlement.',
      verifiableProof: 'Transaction graph analysis of UTXO cluster bc1qxy2kg...',
      evidenceConfidence: 90,
    },
    {
      signalName: 'Listing Cadence & Syntax Stylometry',
      category: 'STYLOMETRY',
      weight: 0.20,
      rawScore: 84,
      weightedScore: 16.8,
      evidenceSummary: '84% stylometric match on support ticket and forum discourse tone.',
      verifiableProof: 'Function-word and punctuation profile comparison',
      evidenceConfidence: 84,
    },
  ],
  'case-testbed-03': [
    {
      signalName: 'Simulated Apache mod_status Leak Detection',
      category: 'INFRASTRUCTURE',
      weight: 0.50,
      rawScore: 99,
      weightedScore: 49.5,
      evidenceSummary: 'Controlled testbed hidden service successfully leaked clearnet VPC IP 103.212.43.19.',
      verifiableProof: 'Automated testbed verification runner output',
      evidenceConfidence: 100,
    },
    {
      signalName: 'Entity Graph Linkage (PGP Master / Subkey Verification)',
      category: 'ENTITY_GRAPH',
      weight: 0.30,
      rawScore: 95,
      weightedScore: 28.5,
      evidenceSummary: 'Cryptographic binding between LabSynthetic_Actor_1 and GhostTest_Admin confirmed.',
      verifiableProof: 'GnuPG signature chain verification',
      evidenceConfidence: 98,
    },
    {
      signalName: 'Testbed Benchmark Stylometry Model',
      category: 'STYLOMETRY',
      weight: 0.20,
      rawScore: 88,
      weightedScore: 17.6,
      evidenceSummary: 'Testbed synthetic corpus successfully scored 88% lexical affinity.',
      verifiableProof: 'Yule\'s K and TTR benchmark comparison',
      evidenceConfidence: 90,
    },
  ],
  'case-insider-04': [
    {
      signalName: 'Internal Network Egress & Tor Guard Burst Correlation',
      category: 'INFRASTRUCTURE',
      weight: 0.40,
      rawScore: 97,
      weightedScore: 38.8,
      evidenceSummary: 'Corporate NetFlow gateway recorded Tor Entry Guard sessions from internal IP 10.240.14.88 with packet burst timing delta < 0.8s of darknet breach posts.',
      verifiableProof: 'Zeek connection log conn.log matching Tor consensus node 185.220.101.5 on port 9001 with concurrent publish timestamp',
      evidenceConfidence: 98,
    },
    {
      signalName: 'Endpoint GPG Keyring & Active Directory Identity Binding',
      category: 'ENTITY_GRAPH',
      weight: 0.35,
      rawScore: 95,
      weightedScore: 33.25,
      evidenceSummary: 'osquery EDR telemetry discovered 4096-bit RSA key 0x4B82EA99 on Workstation WS-SEC-092 matching the darknet vendor public key block.',
      verifiableProof: 'Cryptographic hash comparison of pubring.kbx on host WS-SEC-092 mapped via Active Directory Kerberos ticket to user vikram.s',
      evidenceConfidence: 99,
    },
    {
      signalName: 'Cross-Domain Corporate Slack / Darknet Stylometry',
      category: 'STYLOMETRY',
      weight: 0.25,
      rawScore: 94,
      weightedScore: 23.5,
      evidenceSummary: '94.6% stylometric concordance comparing employee Slack/Jira writing with darknet breach posts (identical function word rates: "kindly insist", "within 12h", trailing ellipses).',
      verifiableProof: 'Mosteller-Wallace function-word cosine similarity + Yule\'s Characteristic K (94.2 vs 95.1) across 45 corporate Slack messages',
      evidenceConfidence: 94,
    },
  ]
};
