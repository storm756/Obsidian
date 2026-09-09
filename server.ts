import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize Gemini client:', e);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Obsidian Controlled Correlation Workspace',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // Target cases endpoint
  app.get('/api/cases', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Simulated active OnionScan endpoint
  app.post('/api/scan-onion', async (req, res) => {
    try {
      const { onionUrl } = req.body;
      if (!onionUrl) {
        return res.status(400).json({ error: 'onionUrl is required' });
      }

      // Realistic OnionScan operational security analysis simulation
      const isBenchmarkVenom = onionUrl.includes('venom') || onionUrl.includes('nox');
      const isTestbed = onionUrl.includes('testbed') || onionUrl.includes('charonlab');

      let response;
      if (isBenchmarkVenom) {
        response = {
          onionUrl,
          status: 'ONLINE',
          testedAt: new Date().toISOString(),
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
            leakVector: 'Exposed Apache mod_status (/server-status) + TLS SAN CN=nox-delivery-bg.net',
          },
          riskScore: 96,
        };
      } else if (isTestbed) {
        response = {
          onionUrl,
          status: 'ONLINE',
          testedAt: new Date().toISOString(),
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
            leakVector: 'Simulated Apache mod_status + OpenSSH Banner Leak (Planted for Demo)',
          },
          riskScore: 99,
        };
      } else {
        // Dynamic simulated scan for arbitrary onion URLs
        const pseudoIp = `194.169.${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 250) + 1}`;
        response = {
          onionUrl,
          status: 'ONLINE',
          testedAt: new Date().toISOString(),
          serverBanner: 'nginx/1.22.1 (Debian)',
          exposedStatusPage: Math.random() > 0.4,
          statusPageDetails: {
            serverUptime: '12 days, 3 hours',
            totalRequests: 42100,
            workerSlotsLeaked: true,
            internalIPs: ['172.18.0.4', pseudoIp],
          },
          sslCertificate: {
            hasSsl: true,
            issuer: 'CN=secure-node-proxy.org',
            subject: 'CN=secure-node-proxy.org',
            serialNumber: '5a:20:91:ff:00:19:bb',
            sha256Fingerprint: '94bf0091823abce1099238129038471928374619283746192837461928374612',
            validFrom: '2024-01-15',
            validTo: '2025-01-15',
            sans: ['secure-node-proxy.org'],
            clearnetMatch: {
              ip: pseudoIp,
              hostname: `node-${pseudoIp.replace(/\./g, '-')}.hosting.eu`,
              country: 'Netherlands',
              city: 'Amsterdam',
              asn: 'AS20860',
              confidence: 88,
            }
          },
          openPorts: [80, 443],
          descriptorTiming: {
            skewSeconds: 0.88,
            ntpSynchronized: true,
          },
          leakedOriginIP: {
            ip: pseudoIp,
            country: 'Netherlands',
            city: 'Amsterdam',
            latitude: 52.3676,
            longitude: 4.9041,
            isp: 'I极Hosting Global B.V.',
            asn: 'AS20860',
            leakVector: 'TLS Certificate SHA-256 fingerprint cross-match on clearnet port 443',
          },
          riskScore: 84,
        };
      }

      res.json(response);
    } catch (err: any) {
      console.error('Scan error:', err);
      res.status(500).json({ error: err.message || 'Internal scan error' });
    }
  });

  // Server-side AI Persona Evaluation using Gemini API
  app.post('/api/gemini-persona-audit', async (req, res) => {
    try {
      const { textA, textB, handleA, handleB, metrics } = req.body;
      const ai = getAIClient();

      if (!ai) {
        // Fallback forensic reasoning when API key is not configured
        return res.json({
          provider: 'local-heuristic',
          analysis: `FORENSIC LINGUISTIC EVALUATION REPORT
- Subject Comparison: [${handleA || 'Sample A'}] vs [${handleB || 'Sample B'}]
- Subconscious Markers: Both samples exhibit correlated use of polite modal constructions ("we kindly request/insist") coupled with strict imperative transactional boundaries.
- Punctuation Signature: Recurrent trailing ellipses (...) used as paragraph transitions, accompanied by spaced double-hyphens for announcement headers.
- Operational Framing: Strong concordance in shipping vocabulary ("dispatched within 12h", "stealth vacuum packed", "50% reship upon tracking").
- De-anonymization Assessment: The idiosyncratic syntactical cadence strongly indicates authorship continuity, suggesting a deliberate persona rebrand rather than independent operators.`
        });
      }

      const prompt = `You are a Senior Digital Forensics Linguistic Specialist working with the National Technical Research Organisation (NTRO) on dark web threat actor de-anonymization.
Task: Provide a forensic stylometric and behavioral evaluation comparing two suspected texts written by dark web personas:
Persona A (${handleA || 'Known Actor'}):
"${textA}"

Persona B (${handleB || 'Suspect Rebrand'}):
"${textB}"

Statistical metrics already extracted:
${JSON.stringify(metrics || {}, null, 2)}

Provide a concise, highly professional 4-section forensic evaluation:
1. Lexical and Function-Word Affinity (Analysis of subconscious grammatical words, modal verbs, and vocabulary richness)
2. Punctuation & Orthographic Idiosyncrasies (Unusual punctuation quirks, capitalization, or formatting anomalies)
3. Operational Semantic Consistency (Comparison of business policy, tone, and transactional phrasing)
4. Forensic Authorship Conclusion (Definitive evidentiary assessment: High Confidence Same Author, Probable Same Author, or Inconclusive, with reasoning suitable for investigative case documentation).`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const analysisText = geminiResponse.text || 'Forensic analysis completed.';
      res.json({
        provider: 'gemini-3.8-flash',
        analysis: analysisText
      });
    } catch (err: any) {
      console.error('Gemini error:', err);
      res.json({
        provider: 'local-fallback',
        analysis: `FORENSIC LINGUISTIC EVALUATION (OFFLINE FALLBACK)
- Cross-Sample Consistency: The syntactic structure reveals matching sentence length and vocabulary concentration.
- Punctuation Peculiarities: Matching ellipses syntax (...) and standardized notice headers.
- Conclusion: Evidentiary profile supports persona continuity across marketplace migrations.`
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Obsidian workspace] Server running on http://localhost:${PORT}`);
  });
}

startServer();
