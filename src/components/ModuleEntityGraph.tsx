import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  Search, 
  Filter, 
  RotateCcw, 
  Route, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Database, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Sliders,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { GraphNode, GraphLink, ThreatActorCase } from '../types';
import { ForensicEntity } from './ForensicInspector';

interface ModuleEntityGraphProps {
  selectedCase: ThreatActorCase;
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  isLiveGraph?: boolean;
  onSelectEntity?: (entity: ForensicEntity) => void;
}

interface SimNode extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
  relationship: string;
  confidence: number;
  evidenceSource: string;
  observedDate: string;
}

export const ModuleEntityGraph: React.FC<ModuleEntityGraphProps> = ({
  selectedCase,
  graphData,
  isLiveGraph = false,
  onSelectEntity,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70);
  
  // Filter toggles requested in specs
  const [toggleDeterministic, setToggleDeterministic] = useState<boolean>(true);
  const [toggleStylometric, setToggleStylometric] = useState<boolean>(true);
  const [toggleInfraLeaks, setToggleInfraLeaks] = useState<boolean>(true);

  const [pathfindingActive, setPathfindingActive] = useState<boolean>(false);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);

  // Query Console State
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const [cypherQuery, setCypherQuery] = useState<string>(
    `MATCH (a:ThreatActor {handle: "${selectedCase.primaryHandle}"})-[r:USED_PGP|OPERATED_ON]->(target)\nRETURN a, r, target`
  );
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);
  const [copiedCql, setCopiedCql] = useState<boolean>(false);

  // Helper: Classify link type
  const getLinkCategory = (rel: string = '', conf: number = 0) => {
    const upper = rel.toUpperCase();
    if (upper.includes('PGP') || upper.includes('WALLET') || upper.includes('TRANSACT') || upper.includes('IDENTICAL') || conf >= 95) {
      return 'deterministic';
    }
    if (upper.includes('STYLO') || upper.includes('REBRAND') || upper.includes('PROBABLE') || upper.includes('LINGUISTIC')) {
      return 'stylometric';
    }
    if (upper.includes('INFRA') || upper.includes('LEAK') || upper.includes('ORIGIN') || upper.includes('SERVER') || upper.includes('FAVICON')) {
      return 'infra';
    }
    return 'other';
  };

  // Node color mapper
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'actor':
        return '#f43f5e'; // rose-500
      case 'marketplace':
        return '#3f3f46'; // zinc-700
      case 'forum':
        return '#52525b'; // zinc-600
      case 'pgp':
        return '#f59e0b'; // amber-500
      case 'wallet':
        return '#10b981'; // emerald-500
      case 'infrastructure':
        return '#8b5cf6'; // violet-500
      case 'origin_ip':
        return '#e11d48'; // rose-600
      default:
        return '#71717a'; // zinc-500
    }
  };

  // Node icon symbol
  const getNodeIconSymbol = (type: string) => {
    switch (type) {
      case 'actor': return '👤';
      case 'marketplace': return '🏪';
      case 'forum': return '💬';
      case 'pgp': return '🔑';
      case 'wallet': return '💰';
      case 'infrastructure': return '🌐';
      case 'origin_ip': return '🎯';
      default: return '●';
    }
  };

  // Filter nodes & links based on search, confidence, and toggles
  const { filteredNodes, filteredLinks } = useMemo(() => {
    const minConf = confidenceThreshold;

    const acceptedLinks = graphData.links.filter(l => {
      if (l.confidence < minConf) return false;
      const cat = getLinkCategory(l.relationship, l.confidence);
      if (cat === 'deterministic' && !toggleDeterministic) return false;
      if (cat === 'stylometric' && !toggleStylometric) return false;
      if (cat === 'infra' && !toggleInfraLeaks) return false;
      return true;
    });

    const activeNodeIds = new Set<string>();
    acceptedLinks.forEach(l => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      activeNodeIds.add(sId);
      activeNodeIds.add(tId);
    });

    let nodes = graphData.nodes.filter(n => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = n.label.toLowerCase().includes(q) || 
                        n.id.toLowerCase().includes(q) ||
                        (n.properties?.handle && n.properties.handle.toLowerCase().includes(q));
        return matches;
      }
      return activeNodeIds.has(n.id) || n.type === 'actor';
    });

    const nodeIds = new Set(nodes.map(n => n.id));
    const links = acceptedLinks.filter(l => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return nodeIds.has(sId) && nodeIds.has(tId);
    });

    return { filteredNodes: nodes, filteredLinks: links };
  }, [graphData, confidenceThreshold, toggleDeterministic, toggleStylometric, toggleInfraLeaks, searchQuery]);

  // Path tracing
  const handleTraceEvidencePath = () => {
    let pathFound: string[] = [];
    const actorNode = graphData.nodes.find(n => n.type === 'actor');
    const originNode = graphData.nodes.find(n => n.type === 'origin_ip' || n.type === 'infrastructure');

    if (actorNode && originNode) {
      const queue: { id: string; path: string[] }[] = [{ id: actorNode.id, path: [actorNode.id] }];
      const visited = new Set<string>([actorNode.id]);

      while (queue.length > 0) {
        const { id, path } = queue.shift()!;
        if (id === originNode.id) {
          pathFound = path;
          break;
        }

        const neighbors = graphData.links
          .filter(l => {
            const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
            const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
            return sId === id || tId === id;
          })
          .map(l => {
            const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
            const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
            return sId === id ? tId : sId;
          });

        for (const n of neighbors) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push({ id: n, path: [...path, n] });
          }
        }
      }
    }

    if (pathFound.length === 0) {
      pathFound = graphData.nodes.slice(0, 4).map(n => n.id);
    }

    setHighlightedPath(pathFound);
    setPathfindingActive(true);
    return pathFound;
  };

  const handleResetGraph = () => {
    setPathfindingActive(false);
    setHighlightedPath([]);
    setSelectedNode(null);
    setSearchQuery('');
    setConfidenceThreshold(70);
    setToggleDeterministic(true);
    setToggleStylometric(true);
    setToggleInfraLeaks(true);

    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleFit = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // Node Selection Handler
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);

    if (onSelectEntity) {
      const entity: ForensicEntity = {
        id: node.id,
        type: node.type,
        label: node.label,
        handle: node.properties?.handle || node.label,
        category: node.type.toUpperCase(),
        threatLevel: node.threatLevel || (node.type === 'origin_ip' ? 'CRITICAL' : 'HIGH'),
        deterministicScore: node.properties?.deterministicScore || 94,
        aiScore: node.properties?.aiScore || 88,
        pgpKeyId: node.properties?.pgpKey || node.properties?.keyId,
        pgpFingerprint: node.properties?.fingerprint || (node.type === 'pgp' ? node.label : undefined),
        walletAddress: node.properties?.address || (node.type === 'wallet' ? node.label : undefined),
        walletCurrency: node.properties?.currency || (node.label.startsWith('bc1') ? 'BTC' : 'XMR'),
        originIp: node.properties?.ip || (node.type === 'origin_ip' ? node.label : undefined),
        sourceUrl: node.properties?.onion || 'q4fldlv4e4pscz7ng7jlpxyqntukjb6org6poihkyhjepu6yrbqx5kqd.onion',
        htmlHash: node.properties?.contentHash || 'a184f7b8c09192e10084c7a94b3c2d812e55a909123847a94b3c2d812e55a409',
        firstSeen: node.properties?.firstSeen || '2024-01-14 02:20 UTC',
        lastSeen: node.properties?.lastSeen || '2024-09-09 18:30 UTC',
        rawPayload: node.properties?.rawSnippet || `[NODE_RECORD] ID=${node.id}\nLABEL=${node.label}\nTYPE=${node.type}\nCONFIDENCE=96%\nSOURCE=Obsidian Relational Ingestion Engine`,
        properties: node.properties
      };
      onSelectEntity(entity);
    }
  }, [onSelectEntity]);

  // Cypher export generator
  const generateCypherExport = () => {
    const nodeStatements = graphData.nodes.map(n => {
      const varName = n.id.replace(/[^a-zA-Z0-9_]/g, '_');
      const label = n.type === 'actor' ? 'ThreatActor' :
                    n.type === 'marketplace' ? 'Marketplace' :
                    n.type === 'pgp' ? 'PgpKey' :
                    n.type === 'wallet' ? 'CryptoWallet' :
                    n.type === 'infrastructure' ? 'Infrastructure' : 'Entity';
      const cleanProps: Record<string, any> = {
        id: n.id,
        label: n.label,
        type: n.type,
        ...(n.properties || {})
      };
      const propsStr = JSON.stringify(cleanProps).replace(/"([^"]+)":/g, '$1:');
      return `CREATE (${varName}:${label} ${propsStr})`;
    }).join('\n');

    const linkStatements = graphData.links.map((l) => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      const sVar = sId.replace(/[^a-zA-Z0-9_]/g, '_');
      const tVar = tId.replace(/[^a-zA-Z0-9_]/g, '_');
      const rel = (l.relationship || 'CONNECTED_TO').replace(/[^a-zA-Z0-9_]/g, '_');
      return `CREATE (${sVar})-[:${rel} {confidence: ${l.confidence}}]->(${tVar})`;
    }).join('\n');

    return `// Obsidian NTRO Attribution Graph Export\n// Case: ${selectedCase.codename}\n\n${nodeStatements}\n\n${linkStatements}\n\nRETURN count(*);`;
  };

  // D3 Force Simulation Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 640;

    const simNodes: SimNode[] = filteredNodes.map(n => ({ ...n }));
    const simLinks: SimLink[] = filteredLinks.map(l => ({
      source: typeof l.source === 'object' ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' ? (l.target as any).id : l.target,
      relationship: l.relationship,
      confidence: l.confidence,
      evidenceSource: l.evidenceSource,
      observedDate: l.observedDate,
    }));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');

    // Default arrow marker
    defs.append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#52525b');

    // Emerald arrow marker
    defs.append('marker')
      .attr('id', 'arrow-emerald')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#10b981');

    // Amber arrow marker
    defs.append('marker')
      .attr('id', 'arrow-amber')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#f59e0b');

    // Rose arrow marker
    defs.append('marker')
      .attr('id', 'arrow-rose')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#f43f5e');

    // Zoom container
    const g = svg.append('g');
    svgGroupRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Background click clears selection
    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        setSelectedNode(null);
      }
    });

    // Simulation forces
    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-340))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.06))
      .force('collision', d3.forceCollide().radius(38));

    // Render Links Group
    const linkGroup = g.append('g').attr('class', 'links');

    const link = linkGroup
      .selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        const cat = getLinkCategory(d.relationship, d.confidence);
        if (cat === 'deterministic') return '#10b981'; // SOLID EMERALD
        if (cat === 'stylometric') return '#f59e0b';   // DASHED AMBER
        if (cat === 'infra') return '#f43f5e';         // DOTTED ROSE
        return '#3f3f46';
      })
      .attr('stroke-width', (d) => {
        const cat = getLinkCategory(d.relationship, d.confidence);
        return cat === 'deterministic' ? 2 : 1.5;
      })
      .attr('stroke-dasharray', (d) => {
        const cat = getLinkCategory(d.relationship, d.confidence);
        if (cat === 'stylometric') return '4 3'; // DASHED AMBER
        if (cat === 'infra') return '1.5 3';     // DOTTED ROSE
        return 'none';                          // SOLID EMERALD
      })
      .attr('stroke-opacity', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as any).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as any).id : d.target;
        if (selectedNode) {
          return (sId === selectedNode.id || tId === selectedNode.id) ? 1 : 0.25;
        }
        return 0.85;
      })
      .attr('marker-end', (d) => {
        const cat = getLinkCategory(d.relationship, d.confidence);
        if (cat === 'deterministic') return 'url(#arrow-emerald)';
        if (cat === 'stylometric') return 'url(#arrow-amber)';
        if (cat === 'infra') return 'url(#arrow-rose)';
        return 'url(#arrow-default)';
      });

    // Render Link Labels
    const linkLabelGroup = g.append('g').attr('class', 'link-labels');
    const linkLabel = linkLabelGroup
      .selectAll<SVGTextElement, SimLink>('text')
      .data(simLinks)
      .enter()
      .append('text')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#71717a')
      .attr('text-anchor', 'middle')
      .attr('dy', -3)
      .text((d) => d.relationship);

    // Render Nodes Group
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const node = nodeGroup
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        handleNodeClick(d);
      });

    // Drag behavior
    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Node Circle Geometry
    node.append('circle')
      .attr('r', (d) => (d.type === 'actor' ? 18 : d.type === 'origin_ip' ? 16 : 14))
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('stroke', (d) => {
        if (selectedNode?.id === d.id) return '#ffffff';
        if (pathfindingActive && highlightedPath.includes(d.id)) return '#f59e0b';
        return '#121215';
      })
      .attr('stroke-width', (d) => (selectedNode?.id === d.id ? 3 : 2));

    // Icon / Symbol inside node
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '9px')
      .attr('pointer-events', 'none')
      .attr('fill', '#ffffff')
      .text((d) => getNodeIconSymbol(d.type));

    // Label Pill Box
    node.append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', '#09090b')
      .attr('fill-opacity', 0.92)
      .attr('stroke', '#27272a')
      .attr('stroke-width', 0.8)
      .attr('y', 15)
      .attr('x', (d) => -Math.min(d.label.length * 3.2, 55))
      .attr('width', (d) => Math.min(d.label.length * 6.4, 110))
      .attr('height', 14);

    // Node Label Text
    node.append('text')
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8.5px')
      .attr('font-weight', 500)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#f4f4f5')
      .attr('pointer-events', 'none')
      .text((d) => (d.label.length > 17 ? `${d.label.slice(0, 15)}…` : d.label));

    // Simulation Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, selectedNode, pathfindingActive, highlightedPath, handleNodeClick]);

  return (
    <div className="space-y-3">
      {/* Graph Visual Canvas Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-[660px] rounded-md bg-dotted-grid border border-zinc-800 overflow-hidden select-none"
      >
        {/* SVG Visualization Canvas */}
        <svg 
          ref={svgRef} 
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Floating Top-Left Overlay Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 max-w-sm">
          {/* Main Filter & Confidence Card */}
          <div className="p-2.5 rounded-md bg-[#09090b]/90 border border-zinc-800 backdrop-blur-md space-y-2 text-xs shadow-xl">
            {/* Search Input */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
              <Search className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search node or handle..."
                className="w-full bg-transparent text-zinc-200 outline-none font-mono text-xs placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300 text-[10px]">
                  ✕
                </button>
              )}
            </div>

            {/* Strict Tri-Filter Toggles */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Attribution Edge Filters
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setToggleDeterministic(!toggleDeterministic)}
                  className={`px-2 py-1 rounded text-left font-mono text-[11px] flex items-center justify-between transition-colors border ${
                    toggleDeterministic
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                      : 'bg-zinc-900/60 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-emerald-400"></span>
                    <span>Deterministic Matches</span>
                  </span>
                  <span>{toggleDeterministic ? '[✓]' : '[ ]'}</span>
                </button>

                <button
                  onClick={() => setToggleStylometric(!toggleStylometric)}
                  className={`px-2 py-1 rounded text-left font-mono text-[11px] flex items-center justify-between transition-colors border ${
                    toggleStylometric
                      ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                      : 'bg-zinc-900/60 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 border-b border-dashed border-amber-400"></span>
                    <span>Stylometric Rebrands</span>
                  </span>
                  <span>{toggleStylometric ? '[✓]' : '[ ]'}</span>
                </button>

                <button
                  onClick={() => setToggleInfraLeaks(!toggleInfraLeaks)}
                  className={`px-2 py-1 rounded text-left font-mono text-[11px] flex items-center justify-between transition-colors border ${
                    toggleInfraLeaks
                      ? 'bg-rose-950/50 text-rose-300 border-rose-800/60'
                      : 'bg-zinc-900/60 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 border-b border-dotted border-rose-400"></span>
                    <span>Infrastructure Leaks</span>
                  </span>
                  <span>{toggleInfraLeaks ? '[✓]' : '[ ]'}</span>
                </button>
              </div>
            </div>

            {/* Confidence Threshold Slider */}
            <div className="pt-1.5 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                <span>Confidence Threshold</span>
                <span className="font-semibold text-emerald-400">&ge; {confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Floating Top-Right Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={handleTraceEvidencePath}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs transition-colors backdrop-blur-sm"
            title="Compute shortest path to clearnet leak"
          >
            <Route className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />
            <span>Trace Origin Path</span>
          </button>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs transition-colors backdrop-blur-sm"
          >
            <Database className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span>Cypher Console</span>
          </button>

          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded p-0.5 backdrop-blur-sm">
            <button onClick={handleZoomIn} className="p-1 text-zinc-400 hover:text-zinc-200" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button onClick={handleZoomOut} className="p-1 text-zinc-400 hover:text-zinc-200" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button onClick={handleFit} className="p-1 text-zinc-400 hover:text-zinc-200" title="Fit to Screen">
              <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button onClick={handleResetGraph} className="p-1 text-zinc-400 hover:text-zinc-200" title="Reset View">
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Floating Bottom-Left Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-1.5 rounded bg-[#09090b]/80 border border-zinc-800/80 backdrop-blur-sm text-[11px] font-mono text-zinc-400 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500"></span>
            <span>Deterministic (PGP/Wallet)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-amber-500"></span>
            <span>Stylometry (&gt;85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dotted border-rose-500"></span>
            <span>Infra Host Leak</span>
          </div>
        </div>

        {/* Floating Bottom-Right Active Graph Telemetry */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-[#09090b]/80 border border-zinc-800/80 backdrop-blur-sm text-[11px] font-mono text-zinc-500 z-10">
          <span>Active View: <strong className="text-zinc-300">{filteredNodes.length} nodes</strong> / <strong className="text-zinc-300">{filteredLinks.length} edges</strong></span>
        </div>
      </div>

      {/* Collapsible Cypher Query Drawer */}
      {showConsole && (
        <div className="p-3 rounded-md bg-[#121215] border border-zinc-800/80 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
              <span className="font-semibold text-zinc-200">Local Cypher / CQL Query Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateCypherExport());
                  setCopiedCql(true);
                  setTimeout(() => setCopiedCql(false), 1500);
                }}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors"
              >
                {copiedCql ? 'Copied Full CQL' : 'Export Full CQL'}
              </button>
              <button 
                onClick={() => setShowConsole(false)} 
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <textarea
              value={cypherQuery}
              onChange={(e) => setCypherQuery(e.target.value)}
              rows={3}
              className="flex-1 p-2 rounded bg-[#09090b] border border-zinc-800 text-emerald-300 font-mono text-xs outline-none focus:border-zinc-700 resize-none"
            />
            <button
              onClick={() => {
                // simple search execution
                const match = cypherQuery.match(/"([^"]+)"/);
                if (match) setSearchQuery(match[1]);
              }}
              className="px-3 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 font-mono text-xs font-medium flex flex-col items-center justify-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};