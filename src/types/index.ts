export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AttributionStatus = 'CONFIRMED' | 'HIGH_CONFIDENCE' | 'PROBABLE' | 'INCONCLUSIVE';

export interface ThreatActorCase {
  id: string;
  caseNumber: string;
  codename: string;
  primaryHandle: string;
  aliases: string[];
  threatLevel: ThreatLevel;
  primaryCategory: string; // e.g. "Narcotics & Counterfeiting", "Ransomware Brokerage", "Weaponry"
  marketplaces: string[];
  firstObserved: string;
  lastActive: string;
  status: AttributionStatus;
  suspectedRealIdentity: {
    name?: string;
    alias?: string;
    location?: string;
    clearnetIP?: string;
    isp?: string;
    asn?: string;
  };
  summary: string;
  evidenceCount: number;
  scores: {
    infrastructure: number; // 0 - 100
    entityGraph: number;     // 0 - 100
    stylometry: number;      // 0 - 100
    composite: number;       // 0 - 100
  };
  onionServices: string[];
  pgpKeys: string[];
  cryptoWallets: string[];
}

export interface InfraScanResult {
  onionUrl: string;
  status: 'ONLINE' | 'INTERMITTENT' | 'OFFLINE';
  testedAt: string;
  serverBanner?: string;
  exposedStatusPage: boolean;
  statusPageDetails?: {
    serverUptime?: string;
    totalRequests?: number;
    workerSlotsLeaked?: boolean;
    internalIPs?: string[];
  };
  sslCertificate?: {
    hasSsl: boolean;
    issuer?: string;
    subject?: string;
    serialNumber?: string;
    sha256Fingerprint?: string;
    validFrom?: string;
    validTo?: string;
    sans?: string[];
    clearnetMatch?: {
      ip: string;
      hostname: string;
      country: string;
      city: string;
      asn: string;
      confidence: number;
    };
  };
  openPorts: number[];
  descriptorTiming: {
    skewSeconds: number;
    ntpSynchronized: boolean;
  };
  leakedOriginIP?: {
    ip: string;
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    isp: string;
    asn: string;
    leakVector: string; // "Apache mod_status", "Reused TLS Cert SAN", "Nginx Status Page"
  };
  riskScore: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'actor' | 'marketplace' | 'pgp' | 'wallet' | 'infrastructure' | 'forum' | 'origin_ip' | string;
  threatLevel?: ThreatLevel;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship: string;
  confidence: number; // 0 - 100
  evidenceSource: string;
  observedDate: string;
  evidenceHash?: string;
  snippet?: string;
}

export interface StylometricProfile {
  actorHandle: string;
  sampleCount: number;
  totalWords: number;
  metrics: {
    avgSentenceLength: number;
    avgWordLength: number;
    typeTokenRatio: number; // TTR
    yulesK: number;          // Richness metric
    hapaxRatio: number;      // % of words used only once
    ellipsesPer100Words: number;
    punctuationDensity: number;
    capitalizationRate: number;
    modalVerbRate: number;
  };
  topFunctionWords: { word: string; freq: number }[];
  distinctiveIdioms: string[];
  sentimentProfile: {
    formality: number; // 0 - 100
    assertiveness: number;
    aggression: number;
  };
}

export interface StylometryComparisonResult {
  targetHandleA: string;
  targetHandleB: string;
  overallSimilarity: number; // 0 - 100
  semanticEmbeddingSimilarity: number;
  classicalStylometrySimilarity: number;
  metricsComparison: {
    metric: string;
    valueA: number | string;
    valueB: number | string;
    matchScore: number; // 0 - 100
    significance: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  keyCorrelations: string[];
  dissimilarities: string[];
  verdict: 'SAME_AUTHOR_HIGH_CONFIDENCE' | 'LIKELY_SAME_AUTHOR' | 'INCONCLUSIVE' | 'DIFFERENT_AUTHORS';
  aiAnalysis?: string;
}

export interface AttributionSignalBreakdown {
  signalName: string;
  category: 'INFRASTRUCTURE' | 'ENTITY_GRAPH' | 'STYLOMETRY';
  weight: number;
  rawScore: number;
  weightedScore: number;
  evidenceSummary: string;
  verifiableProof: string;
  evidenceConfidence: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  source: string;
  category: 'INFRA_LEAK' | 'MARKET_TRANSITION' | 'PGP_ACTIVITY' | 'FINANCIAL_FLOW' | 'FORUM_POST';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  corroboratedBy: string;
}
