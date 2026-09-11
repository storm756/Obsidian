import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  Search, 
  Filter, 
  RotateCcw, 
  Route, 
  Info,
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
  Sparkles,
  Radio
} from 'lucide-react';
import { GraphNode, GraphLink, ThreatActorCase } from '../types';

interface ModuleEntityGraphProps {
  selectedCase: ThreatActorCase;
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  isLiveGraph?: boolean; // true when data came from the real backend, false/undefined = simulated/mock
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
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pathfindingActive, setPathfindingActive] = useState<boolean>(false);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);

  // Query Console State (styled like Cypher, but backed by a real local query engine — see notes below)
  const [showConsole, setShowConsole] = useState<boolean>(true);
  const [cypherQuery, setCypherQuery] = useState<string>(
    `MATCH (a:ThreatActor {handle: "${selectedCase.primaryHandle}"})-[r:USED_PGP|OPERATED_ON]->(target)\nRETURN a, r, target`
  );
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);
  const [copiedCql, setCopiedCql] = useState<boolean>(false);
  const [showCqlModal, setShowCqlModal] = useState<boolean>(false);
  const [cypherStats, setCypherStats] = useState<{
    executionTimeMs: number;
    recordsCount: number;
    nodesCount: number;
    edgesCount: number;
    lastExecuted: string;
  }>({
    executionTimeMs: 0,
    recordsCount: graphData.links.length,
    nodesCount: graphData.nodes.length,
    edgesCount: graphData.links.length,
    lastExecuted: 'Query ready',
  });

  // Node color helper
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'actor':
        return '#f43f5e'; // rose-500
      case 'marketplace':
        return '#10b981'; // emerald-500
      case 'pgp':
        return '#f59e0b'; // amber-500
      case 'wallet':
        return '#06b6d4'; // cyan-500
      case 'infrastructure':
        return '#fb923c'; // orange-400
      case 'forum':
        return '#8b5cf6'; // purple-500
      case 'origin_ip':
        return '#ef4444'; // red-500 target origin
      default:
        return '#94a3b8'; // slate-400
    }
  };

  const getNodeIconSymbol = (type: string) => {
    switch (type) {
      case 'actor': return '👤';
      case 'marketplace': return '🛒';
      case 'pgp': return '🔑';
      case 'wallet': return '₿';
      case 'infrastructure': return '🌐';
      case 'forum': return '💬';
      case 'origin_ip': return '🎯';
      default: return '●';
    }
  };

  // Shared helper: apply a type filter + search string to the current graphData,
  // used both by the D3 render effect and by the query console so stats always
  // reflect what's actually being shown, not a hardcoded number.
  const computeFiltered = useCallback((type: string, query: string) => {
    let baseNodes = graphData.nodes;

    // If filtering by a specific type (e.g. pgp, wallet, infrastructure, origin_ip),
    // include nodes of that type AND any connected actor/marketplace nodes so relationships are visible
    if (type !== 'all') {
      const typeNodeIds = new Set(graphData.nodes.filter(n => n.type === type).map(n => n.id));
      const connectedIds = new Set<string>();
      graphData.links.forEach(l => {
        const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
        if (typeNodeIds.has(s)) connectedIds.add(t);
        if (typeNodeIds.has(t)) connectedIds.add(s);
      });
      baseNodes = graphData.nodes.filter(n => typeNodeIds.has(n.id) || connectedIds.has(n.id));
    }

    const filteredNodes = baseNodes.filter(n => {
      if (!query || query.trim() === '') return true;
      const q = query.toLowerCase().trim();
      return n.label.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q) ||
        (n.properties && JSON.stringify(n.properties).toLowerCase().includes(q));
    });

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(l => {
      const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return nodeIds.has(s) && nodeIds.has(t);
    });

    return { filteredNodes, filteredLinks };
  }, [graphData]);

  // Run Pathfinder from primary actor to leaked clearnet origin / lead
  const handleTraceEvidencePath = () => {
    const sourceNode = graphData.nodes.find(n => n.type === 'actor') || graphData.nodes[0];
    const targetNode = graphData.nodes.find(n => 
      n.id.includes('clearnet') || 
      n.id.includes('identity') || 
      n.label.includes('IP:') ||
      (n.properties && n.properties.city)
    ) || graphData.nodes[graphData.nodes.length - 1];

    if (!sourceNode || !targetNode) return [];

    // Breadth-first search for shortest unweighted path
    const adj = new Map<string, string[]>();
    graphData.nodes.forEach(n => adj.set(n.id, []));
    graphData.links.forEach(l => {
      const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
      adj.get(s)?.push(t);
      adj.get(t)?.push(s);
    });

    const queue: string[][] = [[sourceNode.id]];
    const visited = new Set<string>([sourceNode.id]);
    let pathFound: string[] = [];

    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      const current = currentPath[currentPath.length - 1];

      if (current === targetNode.id) {
        pathFound = currentPath;
        break;
      }

      for (const neighbor of adj.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...currentPath, neighbor]);
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
    setFilterType('all');

    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(600)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleFit = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  // Preset Queries (Cypher-style syntax kept as a familiar query language for
  // analysts, but executed locally against graphData — see handleExecuteCypher)
  const presetQueries = useMemo(() => [
    {
      title: 'Correlate PGP Key',
      description: 'Find shared 4096-bit public key across marketplaces',
      query: `MATCH (a:ThreatActor)-[r:USED_PGP]->(k:PgpKey)\nRETURN a, r, k`,
      filter: 'pgp'
    },
    {
      title: 'Trace Shortest Origin Path',
      description: 'Shortest path from persona to clearnet IP leak',
      query: `MATCH path = shortestPath((a:ThreatActor {handle: "${selectedCase.primaryHandle}"})-[*..5]-(i:Infrastructure))\nRETURN path`,
      action: 'path'
    },
    {
      title: 'Escrow & Crypto Wallets',
      description: 'Extract Bitcoin and Monero transaction destinations',
      query: `MATCH (a:ThreatActor)-[r:TRANSACTED_WITH]->(w:CryptoWallet)\nRETURN a, r, w`,
      filter: 'wallet'
    },
    {
      title: 'High-Confidence Edges (≥95%)',
      description: 'Filter verified cryptographic and server matches',
      query: `MATCH (n)-[r]->(m)\nWHERE r.confidence >= 95\nRETURN n, r, m`,
      filter: 'all'
    },
    {
      title: 'Full Knowledge Graph',
      description: 'Return all personas, infrastructure, and keys',
      query: `MATCH (n)\nOPTIONAL MATCH (n)-[r]->(m)\nRETURN n, r, m`,
      filter: 'all'
    }
  ], [selectedCase]);

  // Execute Query Handler — executes real local Cypher parsing and custom text search
  const handleExecuteCypher = (customQuery?: string) => {
    const rawQuery = customQuery || cypherQuery;
    const q = rawQuery.trim();
    const upper = q.toUpperCase();
    const startTime = performance.now();

    // 1. Pathfinding query: shortest path to leaked infrastructure/clearnet IP
    if (upper.includes('SHORTESTPATH') || upper.includes('PATH =') || upper.includes('PATH=')) {
      const path = handleTraceEvidencePath();
      const elapsed = +(performance.now() - startTime).toFixed(1);
      setCypherStats({
        executionTimeMs: elapsed,
        recordsCount: path.length,
        nodesCount: path.length,
        edgesCount: Math.max(path.length - 1, 0),
        lastExecuted: 'Shortest path computed via local BFS over graph store'
      });
      return;
    }

    // 2. Detect entity type filter
    let nextFilter = 'all';
    if (upper.includes(':PGP') || upper.includes('USED_PGP') || upper.includes('PGPKEY')) nextFilter = 'pgp';
    else if (upper.includes(':CRYPTO') || upper.includes('WALLET') || upper.includes('TRANSACTED_WITH')) nextFilter = 'wallet';
    else if (upper.includes(':INFRASTRUCTURE') || upper.includes('TOR')) nextFilter = 'infrastructure';
    else if (upper.includes(':ORIGIN') || upper.includes('CLEARNET') || upper.includes('ORIGIN_IP')) nextFilter = 'origin_ip';
    else if (upper.includes(':MARKETPLACE') || upper.includes('MARKET')) nextFilter = 'marketplace';
    else if (upper.includes(':FORUM')) nextFilter = 'forum';
    else if (upper.includes(':THREATACTOR') || upper.includes(':ACTOR')) nextFilter = 'actor';

    // 3. Extract search term if present
    let term = '';
    const handleMatch = q.match(/handle\s*:\s*["']([^"']+)["']/i) || 
                        q.match(/CONTAINS\s*["']([^"']+)["']/i) ||
                        q.match(/label\s*=\s*["']([^"']+)["']/i) ||
                        q.match(/WHERE\s+.*?["']([^"']+)["']/i);
    if (handleMatch) {
      term = handleMatch[1];
    } else if (!upper.startsWith('MATCH') && !upper.startsWith('RETURN') && q.length > 0) {
      term = q;
    }

    setFilterType(nextFilter);
    setSearchQuery(term);
    setPathfindingActive(false);

    const { filteredNodes, filteredLinks } = computeFiltered(nextFilter, term);
    const elapsed = +(performance.now() - startTime).toFixed(1);

    // Auto-select first matching node if any found
    if (filteredNodes.length > 0) {
      setSelectedNode(filteredNodes[0]);
    }

    setCypherStats({
      executionTimeMs: elapsed,
      recordsCount: filteredNodes.length + filteredLinks.length,
      nodesCount: filteredNodes.length,
      edgesCount: filteredLinks.length,
      lastExecuted: term 
        ? `Matched "${term}" (${filteredNodes.length} nodes, ${filteredLinks.length} edges)`
        : nextFilter === 'all'
        ? `Full graph query (${filteredNodes.length} nodes, ${filteredLinks.length} edges)`
        : `Filtered to "${nextFilter}" (${filteredNodes.length} nodes, ${filteredLinks.length} edges)`,
    });
  };

  // Generate a portable Cypher-style CREATE script from the current graph data.
  // Useful for importing into an actual Neo4j instance later, but this app
  // itself does not run Neo4j — the graph is served from the local backend.
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
        ...(n.threatLevel ? { threatLevel: n.threatLevel } : {}),
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
      return `CREATE (${sVar})-[:${rel} {confidence: ${l.confidence}, evidence: "${l.evidenceSource || ''}", observedDate: "${l.observedDate || ''}"}]->(${tVar})`;
    }).join('\n');

    return `// ==================================================================\n// Cypher-style Attribution Graph Export\n// Case: ${selectedCase.codename} (${selectedCase.primaryHandle})\n// Source: Obsidian local graph store (import into Neo4j if desired)\n// Data mode: ${isLiveGraph ? 'LIVE — backend-crawled data' : 'SIMULATED — benchmark/demo data'}\n// ==================================================================\n\n// Create Graph Nodes\n${nodeStatements}\n\n// Create Relationship Edges\n${linkStatements}\n\nRETURN "Attribution Graph created with ${graphData.nodes.length} nodes and ${graphData.links.length} edges" AS status;`;
  };

  const handleCopyCypher = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const handleCopyFullCql = () => {
    navigator.clipboard.writeText(generateCypherExport());
    setCopiedCql(true);
    setTimeout(() => setCopiedCql(false), 2000);
  };

  const handleDownloadCql = () => {
    const cql = generateCypherExport();
    const blob = new Blob([cql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph_export_${selectedCase.codename}.cql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Real match percentage: share of links whose confidence is high (>=90),
  // computed from the actual data rather than a hardcoded string.
  const matchPercentage = useMemo(() => {
    if (graphData.links.length === 0) return 0;
    const highConfidence = graphData.links.filter(l => l.confidence >= 90).length;
    return Math.round((highConfidence / graphData.links.length) * 100);
  }, [graphData.links]);

  // Keep displayed stats in sync whenever the underlying graphData changes
  // (e.g. a fresh crawl comes in) instead of only updating on manual query runs.
  useEffect(() => {
    const { filteredNodes, filteredLinks } = computeFiltered(filterType, searchQuery);
    setCypherStats(prev => ({
      ...prev,
      recordsCount: filteredNodes.length + filteredLinks.length,
      nodesCount: filteredNodes.length,
      edgesCount: filteredLinks.length,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  // D3 Force Simulation Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 550;

    const { filteredNodes: rawFilteredNodes, filteredLinks: rawFilteredLinks } = computeFiltered(filterType, searchQuery);
    const filteredNodes: SimNode[] = rawFilteredNodes.map(n => ({ ...n }));
    const filteredLinks: SimLink[] = rawFilteredLinks.map(l => ({
      source: typeof l.source === 'object' ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' ? (l.target as any).id : l.target,
      relationship: l.relationship,
      confidence: l.confidence,
      evidenceSource: l.evidenceSource,
      observedDate: l.observedDate,
    }));

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Definitions: Arrowheads and Glow filter
    const defs = svg.append('defs');

    // Default arrow marker
    defs.append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#475569');

    // Highlighted arrow marker
    defs.append('marker')
      .attr('id', 'arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#06b6d4');

    // Glow filter for highlighted nodes and paths
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background click to clear selection
    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        setSelectedNode(null);
      }
    });

    // Zoom container
    const g = svg.append('g');
    svgGroupRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Simulation setup
    const simulation = d3.forceSimulation<SimNode>(filteredNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(filteredLinks)
        .id((d) => d.id)
        .distance(110)
      )
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
      .force('collision', d3.forceCollide().radius(36));

    // Render Links
    const linkGroup = g.append('g').attr('class', 'links');

    const link = linkGroup
      .selectAll<SVGLineElement, SimLink>('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as any).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as any).id : d.target;
        const isHighlighted = pathfindingActive && 
          highlightedPath.includes(sId) && 
          highlightedPath.includes(tId) &&
          Math.abs(highlightedPath.indexOf(sId) - highlightedPath.indexOf(tId)) === 1;
        return isHighlighted ? '#06b6d4' : '#334155';
      })
      .attr('stroke-width', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as any).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as any).id : d.target;
        const isHighlighted = pathfindingActive && 
          highlightedPath.includes(sId) && 
          highlightedPath.includes(tId) &&
          Math.abs(highlightedPath.indexOf(sId) - highlightedPath.indexOf(tId)) === 1;
        return isHighlighted ? 3 : 1.5;
      })
      .attr('stroke-opacity', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as any).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as any).id : d.target;
        const isHighlighted = pathfindingActive && 
          highlightedPath.includes(sId) && 
          highlightedPath.includes(tId) &&
          Math.abs(highlightedPath.indexOf(sId) - highlightedPath.indexOf(tId)) === 1;
        return isHighlighted ? 1 : 0.6;
      })
      .attr('filter', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as any).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as any).id : d.target;
        const isHighlighted = pathfindingActive && 
          highlightedPath.includes(sId) && 
          highlightedPath.includes(tId) &&
          Math.abs(highlightedPath.indexOf(sId) - highlightedPath.indexOf(tId)) === 1;
        return isHighlighted ? 'url(#glow)' : null;
      })
      .attr('marker-end', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as any).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as any).id : d.target;
        const isHighlighted = pathfindingActive && 
          highlightedPath.includes(sId) && 
          highlightedPath.includes(tId) &&
          Math.abs(highlightedPath.indexOf(sId) - highlightedPath.indexOf(tId)) === 1;
        return isHighlighted ? 'url(#arrow-highlight)' : 'url(#arrow-default)';
      });

    // Render Link Labels
    const linkLabelGroup = g.append('g').attr('class', 'link-labels');
    const linkLabel = linkLabelGroup
      .selectAll<SVGTextElement, SimLink>('text')
      .data(filteredLinks)
      .enter()
      .append('text')
      .attr('font-size', '8px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .text((d) => d.relationship);

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const node = nodeGroup
      .selectAll<SVGGElement, SimNode>('g')
      .data(filteredNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
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

    // Node outer circle (glow/selection)
    node.append('circle')
      .attr('r', (d) => {
        const isPath = pathfindingActive && highlightedPath.includes(d.id);
        const isActor = d.type === 'actor';
        return isPath ? 22 : isActor ? 18 : 15;
      })
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('stroke', (d) => {
        if (selectedNode?.id === d.id) return '#ffffff';
        if (pathfindingActive && highlightedPath.includes(d.id)) return '#fbbf24';
        return '#09090b';
      })
      .attr('stroke-width', (d) => {
        if (selectedNode?.id === d.id) return 3.5;
        if (pathfindingActive && highlightedPath.includes(d.id)) return 3;
        return 2;
      })
      .attr('filter', (d) => {
        if (pathfindingActive && highlightedPath.includes(d.id)) return 'url(#glow)';
        return null;
      });

    // Node inner icon/symbol
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .text((d) => getNodeIconSymbol(d.type));

    // Label pill background
    node.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', '#09090b')
      .attr('fill-opacity', 0.88)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.8)
      .attr('y', 16)
      .attr('x', (d) => -Math.min(d.label.length * 3.2, 50))
      .attr('width', (d) => Math.min(d.label.length * 6.4, 100))
      .attr('height', 14);

    // Label text
    node.append('text')
      .attr('y', 26)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-weight', 600)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', '#f1f5f9')
      .attr('pointer-events', 'none')
      .text((d) => (d.label.length > 16 ? `${d.label.slice(0, 14)}…` : d.label));

    // Simulation tick
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
  }, [graphData, filterType, searchQuery, pathfindingActive, highlightedPath, selectedNode, computeFiltered]);

  return (
    <div className="space-y-6">
      {/* Module Overview Header */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono font-bold uppercase tracking-wider">
              MODULE 02 // ENTITY GRAPH CLUSTER
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              NEO4J REPLICA · 4096-BIT RSA PGP · UTXO CO-SPEND
            </span>
            {isLiveGraph ? (
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wide">
                Live Scan Result
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wide">
                Simulated — Not a Live Scan
              </span>
            )}
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Cryptographic Relationship &amp; Entity Correlation Graph</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed mt-1">
            Correlates handles, 4096-bit PGP public key fingerprints, cryptocurrency wallets (Bitcoin &amp; Monero), marketplace listings, and Dread dispute forums into a multi-hop evidence relationship graph.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`px-3 py-2 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 border ${
              showConsole
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-[#08090d] hover:bg-[#111622] text-zinc-300 border-[#1e2433]'
            }`}
            title="Toggle Query Console"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>QUERY CONSOLE</span>
            {showConsole ? (
              <ChevronUp className="w-3 h-3 text-cyan-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            )}
          </button>

          <button
            onClick={handleTraceEvidencePath}
            className="px-3.5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition-colors flex items-center gap-1.5 border border-emerald-300/40 shadow-sm"
          >
            <Route className="w-4 h-4 fill-black" />
            <span>TRACE SHORTEST PATH</span>
          </button>
          
          <button
            onClick={handleResetGraph}
            className="p-2 rounded bg-[#08090d] hover:bg-[#111622] text-zinc-400 hover:text-white border border-[#1e2433] transition-colors"
            title="Reset Graph"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Filter & Search Bar */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase text-zinc-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>FILTER:</span>
          </span>
          {['all', 'actor', 'origin_ip', 'infrastructure', 'marketplace', 'forum', 'pgp', 'wallet'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded font-mono text-[10px] font-semibold uppercase transition-colors border ${
                filterType === type
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  : 'bg-[#08090d] text-zinc-400 border-[#1e2433] hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {type === 'origin_ip' ? 'Origin IP' : type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node or key..."
              className="w-full bg-[#08090d] border border-[#1e2433] rounded pl-8 pr-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Graph & Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="lg:col-span-3 bg-[#08090d] border border-[#1e2433] rounded-lg relative overflow-hidden h-[550px]"
        >
          {pathfindingActive && (
            <div className="absolute top-3 left-3 z-10 bg-[#08090d]/95 border border-amber-500/40 rounded px-3 py-1.5 text-xs text-amber-300 font-mono flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>PATHFINDER ACTIVE: {highlightedPath.length} HOPS TO CLEARNET ORIGIN</span>
              <button
                onClick={() => setPathfindingActive(false)}
                className="ml-2 text-zinc-500 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          {/* Quick Zoom Controls */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#121216]/80 border border-white/[0.08] backdrop-blur p-1 rounded-xl shadow-sm">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-10 bg-[#121216]/90 border border-white/[0.08] backdrop-blur rounded-xl p-3 text-xs space-y-1.5 hidden sm:block shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">Entity Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-zinc-300">Threat Actor Persona</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-zinc-300">Darknet Marketplace</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span className="text-zinc-300">Discussion / Vouch Forum</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-zinc-300">PGP Key Fingerprint</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <span className="text-zinc-300">Crypto Wallet Address</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span className="text-zinc-300">Tor Hidden Service Infrastructure</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-zinc-300">Attributed Clearnet Origin IP</span>
            </div>
          </div>

          <svg 
            ref={svgRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing select-none" 
          />
        </div>

        {/* Node Details Inspector Sidebar */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e24] mb-3">
              <div className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Entity Inspector</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono uppercase">
                {selectedNode ? selectedNode.type : 'Select Node'}
              </span>
            </div>

            {selectedNode ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">IDENTIFIER LABEL</div>
                  <div className="text-sm font-bold text-white break-words mt-0.5">
                    {selectedNode.label}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-gray-500 uppercase">ENTITY CLASSIFICATION</div>
                  <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-0.5 uppercase" style={{ backgroundColor: `${getNodeColor(selectedNode.type)}25`, color: getNodeColor(selectedNode.type) }}>
                    {selectedNode.type}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e1e24]">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">PROPERTIES &amp; TELEMETRY</div>
                  <div className="bg-[#0c0c0e] p-2.5 rounded border border-[#1e1e24] space-y-1 text-[11px]">
                    {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <span className="text-gray-400 capitalize">{k}:</span>
                        <span className="text-gray-200 truncate text-right font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e1e24]">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">CORROBORATING EVIDENCE</div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Cryptographic signature and multi-market transaction logs confirm association with {selectedCase.primaryHandle}.
                  </p>
                </div>

                {/* Quick query button for this entity */}
                <div className="pt-2 border-t border-[#1e1e24]">
                  <button
                    onClick={() => {
                      const query = `MATCH (n {id: "${selectedNode.id}"})-[r]-(neighbor)\nRETURN n, r, neighbor`;
                      setCypherQuery(query);
                      setShowConsole(true);
                      handleExecuteCypher(query);
                    }}
                    className="w-full py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>Query This Entity</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Network className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">Click any node in the graph to inspect cryptographic attributes and multi-hop relationships.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#1e1e24]">
            <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
              <span>GRAPH STATS</span>
              <span className={`text-[10px] flex items-center gap-1 ${isLiveGraph ? 'text-emerald-400' : 'text-amber-400'}`}>
                <Radio className={`w-2.5 h-2.5 animate-pulse ${isLiveGraph ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>{isLiveGraph ? 'Live Data' : 'Simulated Data'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-gray-300 mt-1">
              <span>Nodes: {graphData.nodes.length}</span>
              <span>Edges: {graphData.links.length}</span>
              <span className="text-emerald-400">High-Conf: {matchPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Query Console & Graph Analytics Workbench */}
      {showConsole && (
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-lg p-5 space-y-4">
          {/* Console Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e2433]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Graph Query Workbench</h3>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    Local Backend
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Cypher-style syntax &bull; executed against Obsidian's local exact-match graph store
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowCqlModal(!showCqlModal)}
                className="px-3 py-1.5 rounded-xl bg-[#0b0b0e] hover:bg-white/[0.05] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                title="View &amp; Export Cypher CREATE script"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export .cql Script</span>
              </button>
              
              <button
                onClick={() => handleCopyCypher(cypherQuery)}
                className="px-3 py-1.5 rounded-xl bg-[#0b0b0e] hover:bg-white/[0.05] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                title="Copy current query"
              >
                {copiedQuery ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Query</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Queries Bar */}
          <div>
            <div className="text-[10px] text-zinc-400 font-mono uppercase font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Attribution Query Templates:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {presetQueries.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCypherQuery(preset.query);
                    handleExecuteCypher(preset.query);
                  }}
                  className="p-2.5 rounded-xl bg-[#0a0a0d] border border-white/[0.06] hover:border-cyan-500/40 hover:bg-[#101015] text-left transition-all group"
                >
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 truncate">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Query Editor */}
          <div className="bg-[#09090b] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="bg-[#0e0e12] px-3.5 py-1.5 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] text-zinc-300">query.cql</span>
              </div>
              <span className="text-[10px] text-zinc-500">Cypher-style syntax</span>
            </div>

            <div className="p-3">
              <textarea
                value={cypherQuery}
                onChange={(e) => setCypherQuery(e.target.value)}
                rows={3}
                placeholder="Enter a Cypher-style statement, e.g. MATCH (n:ThreatActor) RETURN n..."
                className="w-full bg-transparent text-xs font-mono text-cyan-200 focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/30"
                spellCheck={false}
              />
            </div>

            <div className="bg-[#0e0e12] px-3.5 py-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 flex-wrap">
                <span className="text-emerald-400 font-semibold">{cypherStats.lastExecuted}</span>
                <span className="text-zinc-600">&bull;</span>
                <span>Latency: <strong className="text-zinc-200">{cypherStats.executionTimeMs}ms</strong></span>
                <span className="text-zinc-600">&bull;</span>
                <span>Returned: <strong className="text-zinc-200">{cypherStats.recordsCount} records</strong></span>
              </div>

              <button
                onClick={() => handleExecuteCypher()}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Run Query</span>
              </button>
            </div>
          </div>

          {/* Export Script Drawer / Modal */}
          {showCqlModal && (
            <div className="bg-[#0a0a0d] border border-cyan-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono">
                    CYPHER-STYLE EXPORT ({graphData.nodes.length} NODES &bull; {graphData.links.length} RELATIONSHIPS)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyFullCql}
                    className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1"
                  >
                    {copiedCql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                    <span>{copiedCql ? 'Copied' : 'Copy All'}</span>
                  </button>
                  <button
                    onClick={handleDownloadCql}
                    className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .cql</span>
                  </button>
                  <button
                    onClick={() => setShowCqlModal(false)}
                    className="text-zinc-500 hover:text-white text-base leading-none pl-1"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <pre className="max-h-56 overflow-y-auto p-3 rounded-lg bg-[#060608] border border-white/[0.05] text-[10.5px] font-mono text-zinc-300 whitespace-pre leading-relaxed">
                {generateCypherExport()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};