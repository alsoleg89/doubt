function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonForScript(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e");
}

export function renderMap(map, validation) {
  const { metrics, receipt } = validation;
  const nodeLabels = new Map(map.nodes.map((node) => [node.id, node.label]));
  const nodes = map.nodes
    .map((node, index) => {
      const source = node.sourceId
        ? map.sources.find((item) => item.id === node.sourceId)
        : null;
      return `
        <button
          class="node ${escapeHtml(node.type)}"
          data-id="${escapeHtml(node.id)}"
          style="--delay:${index * 36}ms"
          aria-label="${escapeHtml(node.label)}"
        >
          <span class="type">${escapeHtml(node.type)}</span>
          <strong>${escapeHtml(node.label)}</strong>
          <span class="copy">${escapeHtml(node.text)}</span>${source ? `
          <span class="source-chip">↗ ${escapeHtml(source.publisher)}</span>` : ""}
        </button>`;
    })
    .join("");

  const edgeList = map.edges
    .map(
      (edge) => `
        <li class="${escapeHtml(edge.relation)}">
          <button data-edge="${escapeHtml(edge.from)}|${escapeHtml(edge.to)}">
            <span>${escapeHtml(nodeLabels.get(edge.from) || edge.from)}</span>
            <b>${escapeHtml(edge.relation)}</b>
            <span>${escapeHtml(nodeLabels.get(edge.to) || edge.to)}</span>
          </button>
          <p>${escapeHtml(edge.note)}</p>
        </li>`,
    )
    .join("");

  const sources = map.sources
    .map(
      (source) => `
        <article class="source" data-source="${escapeHtml(source.id)}">
          <div>
            <span>${escapeHtml(source.publisher)}</span>
            <time>${escapeHtml(source.date)}</time>
          </div>
          <h3>${escapeHtml(source.title)}</h3>
          <p class="locator">${escapeHtml(source.locator)}</p>
          <blockquote>${escapeHtml(source.excerpt)}</blockquote>
          <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open source region ↗</a>
        </article>`,
    )
    .join("");

  const data = jsonForScript({
    edges: map.edges,
    nodes: map.nodes,
    sources: map.sources,
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="Doubt evidence maps">
  <meta name="description" content="${escapeHtml(map.verdict)}">
  <meta name="theme-color" content="#0b0d0e">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(map.title)} — Doubt">
  <meta property="og:description" content="${escapeHtml(map.verdict)}">
  <meta name="twitter:card" content="summary">
  <title>${escapeHtml(map.title)} — Doubt</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b0d0e;
      --panel: #111416;
      --ink: #eef0e7;
      --muted: #8e9690;
      --line: #252b28;
      --support: #a8ec67;
      --against: #ff806e;
      --missing: #eac96f;
      --claim: #83b9ff;
    }
    * { box-sizing: border-box; }
    html { background: var(--bg); scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--ink);
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    button, a { font: inherit; }
    button { color: inherit; }
    .shell { display: grid; grid-template-columns: minmax(0, 1fr) 370px; min-height: 100vh; }
    main { min-width: 0; padding: 30px clamp(24px, 4vw, 66px) 70px; }
    aside {
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: auto;
      border-left: 1px solid var(--line);
      background: #0e1112;
      padding: 28px;
    }
    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 25px;
      border-bottom: 1px solid var(--line);
    }
    .brand { font-weight: 820; letter-spacing: -.045em; font-size: 21px; }
    .brand i { color: var(--support); font-style: normal; }
    .nav-meta { display: flex; align-items: center; gap: 13px; }
    .nav-meta a {
      color: var(--muted);
      font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
      text-transform: uppercase;
      letter-spacing: .08em;
      text-decoration: none;
    }
    .nav-meta a:hover { color: var(--support); }
    .date {
      color: var(--muted);
      font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
      text-transform: uppercase;
      letter-spacing: .1em;
    }
    header {
      padding: 58px 0 42px;
      display: grid;
      grid-template-columns: 1fr minmax(260px, .6fr);
      gap: 60px;
    }
    .kicker {
      color: var(--support);
      font: 700 11px ui-monospace, SFMono-Regular, Menlo, monospace;
      text-transform: uppercase;
      letter-spacing: .13em;
    }
    h1 {
      margin: 15px 0 0;
      font-size: clamp(41px, 5vw, 76px);
      line-height: .98;
      letter-spacing: -.065em;
      max-width: 900px;
    }
    .verdict {
      align-self: end;
      color: #c8cec9;
      font-size: 16px;
      line-height: 1.55;
      border-left: 2px solid var(--support);
      padding-left: 18px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 14px;
    }
    .metric { padding: 17px; background: var(--panel); border-right: 1px solid var(--line); }
    .metric:last-child { border: 0; }
    .metric strong { display: block; font-size: 27px; letter-spacing: -.05em; }
    .metric span {
      color: var(--muted);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .toolbar { display: flex; gap: 8px; margin: 22px 0 16px; flex-wrap: wrap; }
    .toolbar button {
      cursor: pointer;
      border: 1px solid var(--line);
      background: transparent;
      color: var(--muted);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
    }
    .toolbar button.active { color: var(--bg); background: var(--ink); border-color: var(--ink); }
    .map-shell { position: relative; }
    .connections {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
      pointer-events: none;
      z-index: 0;
    }
    .connection { fill: none; stroke-width: 1.5; opacity: .58; transition: opacity .18s; }
    .connection.supports { stroke: var(--support); }
    .connection.contradicts { stroke: var(--against); stroke-dasharray: 7 5; }
    .connection.qualifies { stroke: var(--claim); }
    .connection.missing { stroke: var(--missing); stroke-dasharray: 2 6; }
    .connection.dim { opacity: .06; }
    .map {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 22px;
    }
    .node {
      position: relative;
      cursor: pointer;
      text-align: left;
      min-height: 190px;
      border: 1px solid var(--line);
      background: rgba(17, 20, 22, .96);
      border-radius: 14px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      animation: arrive .45s both;
      animation-delay: var(--delay);
      transition: transform .18s, border-color .18s, opacity .18s;
      box-shadow: 0 12px 32px rgba(0, 0, 0, .18);
    }
    .node:hover, .node.selected { transform: translateY(-3px); border-color: #647168; }
    .node.dim { opacity: .18; }
    .node .type {
      color: var(--muted);
      font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
      text-transform: uppercase;
      letter-spacing: .12em;
    }
    .node strong { margin: 35px 0 9px; font-size: 17px; letter-spacing: -.02em; }
    .node .copy { color: #b7bdb8; line-height: 1.42; font-size: 13px; }
    .source-chip {
      margin-top: auto;
      padding-top: 20px;
      color: var(--support);
      font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .node.position {
      grid-column: span 2;
      background: linear-gradient(140deg, rgba(168, 236, 103, .13), rgba(17, 20, 22, .97) 58%);
    }
    .node.position::after {
      content: "VERDICT";
      position: absolute;
      right: 15px;
      bottom: 11px;
      font: 800 35px/1 ui-sans-serif;
      letter-spacing: -.05em;
      color: rgba(168, 236, 103, .07);
    }
    .node.unknown { border-style: dashed; }
    .node.unknown .type { color: var(--missing); }
    @keyframes arrive { from { opacity: 0; transform: translateY(9px); } }
    aside h2 {
      font-size: 12px;
      margin: 0 0 16px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: .12em;
    }
    .edge-list { list-style: none; margin: 0 0 38px; padding: 0; }
    .edge-list li { border-top: 1px solid var(--line); padding: 12px 0; }
    .edge-list button {
      width: 100%;
      cursor: pointer;
      border: 0;
      background: none;
      padding: 0;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 6px;
      align-items: center;
      color: #aeb4af;
      text-align: left;
      font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .edge-list button span:last-child { text-align: right; }
    .edge-list b {
      padding: 4px 6px;
      border-radius: 4px;
      color: var(--bg);
      background: var(--support);
    }
    .edge-list .contradicts b { background: var(--against); }
    .edge-list .missing b { background: var(--missing); }
    .edge-list .qualifies b { background: var(--claim); }
    .edge-list p { margin: 7px 0 0; color: #717973; font-size: 11px; line-height: 1.4; }
    .source { display: none; border-top: 1px solid var(--line); padding: 19px 0 8px; }
    .source.visible { display: block; }
    .source div {
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      font: 10px ui-monospace, SFMono-Regular, Menlo, monospace;
      text-transform: uppercase;
    }
    .source h3 { font-size: 16px; line-height: 1.3; margin: 12px 0; }
    .locator {
      color: var(--claim);
      font: 10px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
      margin: -4px 0 12px;
    }
    blockquote { margin: 0 0 15px; color: #aeb5b0; font-size: 13px; line-height: 1.5; }
    .source a { color: var(--support); font-size: 12px; text-decoration: none; }
    .empty { color: var(--muted); font-size: 13px; line-height: 1.5; }
    .receipt {
      margin-top: 30px;
      padding-top: 18px;
      border-top: 1px solid var(--line);
      color: #59615c;
      font: 9px ui-monospace, SFMono-Regular, Menlo, monospace;
      overflow-wrap: anywhere;
    }
    @media (max-width: 1150px) {
      .shell { grid-template-columns: 1fr; }
      aside { position: relative; height: auto; border-left: 0; border-top: 1px solid var(--line); }
      header { grid-template-columns: 1fr; gap: 24px; }
    }
    @media (max-width: 760px) {
      .map { grid-template-columns: 1fr; gap: 12px; }
      .node.position { grid-column: auto; }
      .connections { display: none; }
      .metrics { grid-template-columns: repeat(2, 1fr); }
      .metric { border-bottom: 1px solid var(--line); }
      .metric:nth-child(even) { border-right: 0; }
      .metric:last-child { border-bottom: 0; }
    }
    @media (max-width: 520px) {
      nav { align-items: flex-start; }
      .nav-meta { flex-direction: column; align-items: flex-end; gap: 6px; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; transition: none !important; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <main>
      <nav>
        <div class="brand">Doubt<i>↯</i></div>
        <div class="nav-meta">
          <a href="https://alsoleg89.github.io/doubt/playground/" target="_blank" rel="noreferrer">Make a map ↗</a>
          <a href="https://github.com/alsoleg89/doubt" target="_blank" rel="noreferrer">GitHub ↗</a>
          <div class="date">Evidence snapshot · ${escapeHtml(map.updatedAt)}</div>
        </div>
      </nav>
      <header>
        <div>
          <span class="kicker">Decision under pressure</span>
          <h1>${escapeHtml(map.question)}</h1>
        </div>
        <div class="verdict">${escapeHtml(map.verdict)}</div>
      </header>
      <section class="metrics">
        <div class="metric"><strong>${metrics.claims}</strong><span>claims</span></div>
        <div class="metric"><strong>${metrics.evidence}</strong><span>evidence</span></div>
        <div class="metric"><strong>${metrics.sources}</strong><span>sources</span></div>
        <div class="metric"><strong>${metrics.contradictions}</strong><span>tensions</span></div>
        <div class="metric"><strong>${metrics.unknowns}</strong><span>unknowns</span></div>
      </section>
      <div class="toolbar" aria-label="Filter map">
        <button class="active" data-filter="all">All</button>
        <button data-filter="claim">Claims</button>
        <button data-filter="evidence">Evidence</button>
        <button data-filter="unknown">Unknown</button>
      </div>
      <section class="map-shell">
        <svg class="connections" aria-hidden="true"></svg>
        <div class="map">${nodes}</div>
      </section>
    </main>
    <aside>
      <h2>Reasoning edges</h2>
      <ol class="edge-list">${edgeList}</ol>
      <h2>Exact source region</h2>
      <p class="empty">Select an evidence card to inspect the source excerpt behind it.</p>
      <div class="sources">${sources}</div>
      <div class="receipt">receipt · ${receipt}</div>
    </aside>
  </div>
  <script type="application/json" id="map-data">${data}</script>
  <script>
    const dataset = JSON.parse(document.querySelector("#map-data").textContent);
    const cards = [...document.querySelectorAll(".node")];
    const sources = [...document.querySelectorAll(".source")];
    const empty = document.querySelector(".empty");
    const shell = document.querySelector(".map-shell");
    const svg = document.querySelector(".connections");
    const svgNs = "http://www.w3.org/2000/svg";

    function selectNode(id, focusPair = null) {
      const node = dataset.nodes.find((item) => item.id === id);
      cards.forEach((item) => {
        item.classList.toggle("selected", item.dataset.id === id);
        item.classList.toggle(
          "dim",
          Boolean(focusPair) && !focusPair.includes(item.dataset.id),
        );
      });
      sources.forEach((item) => {
        item.classList.toggle("visible", item.dataset.source === node?.sourceId);
      });
      empty.style.display = node?.sourceId ? "none" : "block";
      if (!node?.sourceId) {
        empty.textContent = node
          ? "This node is a claim or an explicit unknown. Follow its reasoning edges to inspect the underlying evidence."
          : "Select an evidence card to inspect the source excerpt behind it.";
      }
      [...svg.querySelectorAll(".connection")].forEach((path) => {
        path.classList.toggle(
          "dim",
          Boolean(focusPair) &&
            !focusPair.includes(path.dataset.from) &&
            !focusPair.includes(path.dataset.to),
        );
      });
    }

    function drawConnections() {
      svg.replaceChildren();
      const shellRect = shell.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + shellRect.width + " " + shellRect.height);
      for (const edge of dataset.edges) {
        const from = document.querySelector('.node[data-id="' + CSS.escape(edge.from) + '"]');
        const to = document.querySelector('.node[data-id="' + CSS.escape(edge.to) + '"]');
        if (!from || !to || getComputedStyle(from).display === "none" || getComputedStyle(to).display === "none") continue;
        const a = from.getBoundingClientRect();
        const b = to.getBoundingClientRect();
        const x1 = a.left - shellRect.left + a.width / 2;
        const y1 = a.top - shellRect.top + a.height / 2;
        const x2 = b.left - shellRect.left + b.width / 2;
        const y2 = b.top - shellRect.top + b.height / 2;
        const bend = Math.max(28, Math.abs(x2 - x1) * .22);
        const path = document.createElementNS(svgNs, "path");
        path.setAttribute("d", "M " + x1 + " " + y1 + " C " + (x1 + bend) + " " + y1 + ", " + (x2 - bend) + " " + y2 + ", " + x2 + " " + y2);
        path.setAttribute("class", "connection " + edge.relation);
        path.dataset.from = edge.from;
        path.dataset.to = edge.to;
        svg.append(path);
      }
    }

    cards.forEach((card) => card.addEventListener("click", () => selectNode(card.dataset.id)));
    document.querySelectorAll("[data-edge]").forEach((button) => {
      button.addEventListener("click", () => {
        const [from, to] = button.dataset.edge.split("|");
        selectNode(from, [from, to]);
      });
    });
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const filter = button.dataset.filter;
        cards.forEach((card) => {
          const visible =
            filter === "all" ||
            card.classList.contains(filter) ||
            (filter === "claim" && card.classList.contains("position"));
          card.style.display = visible ? "" : "none";
          card.classList.remove("dim");
        });
        requestAnimationFrame(drawConnections);
      });
    });
    addEventListener("resize", drawConnections);
    requestAnimationFrame(drawConnections);
  </script>
</body>
</html>`;
}
