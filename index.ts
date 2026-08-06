import { Pantsdown } from "./pantsdown/src/index.ts";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, dirname, basename, join, relative } from "path";
import css from "./pantsdown/src/css/styles.css" with { type: "text" };

const file = process.argv[2];
if (!file) {
  console.error("usage: mdv <file.md>");
  process.exit(1);
}

const filePath = resolve(file);
const root = dirname(filePath);

function buildTree(dir: string, depth = 0): string {
  if (depth > 5) return "";
  let html = "<ul>";
  let entries;
  try {
    entries = readdirSync(dir).filter(e => !e.startsWith(".") && e !== "node_modules");
  } catch {
    return "";
  }
  entries.sort((a, b) => {
    const aIsDir = statSync(join(dir, a)).isDirectory();
    const bIsDir = statSync(join(dir, b)).isDirectory();
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
    return a.localeCompare(b);
  });
  for (const entry of entries) {
    const entryPath = join(dir, entry);
    const isDir = statSync(entryPath).isDirectory();
    const relPath = relative(root, entryPath);
    if (isDir) {
      html += `<li class="tree-dir"><span>📁 ${entry}</span>${buildTree(entryPath, depth + 1)}</li>`;
    } else {
      const isMd = entry.endsWith(".md");
      html += `<li class="tree-file${isMd ? " tree-md" : ""}" data-path="${relPath}"><span>${isMd ? "📄" : "·"} ${entry}</span></li>`;
    }
  }
  return html + "</ul>";
}

function renderFile(fp: string): string {
  const content = readFileSync(fp, "utf-8");
  const pantsdown = new Pantsdown({ renderer: { detailsTagDefaultOpen: true } });
  const { html, javascript } = pantsdown.parse(content);
  return JSON.stringify({ html, javascript });
}

const pantsdown = new Pantsdown({ renderer: { detailsTagDefaultOpen: true } });
const initialContent = readFileSync(filePath, "utf-8");
const { html: initialHtml, javascript: initialJs } = pantsdown.parse(initialContent);
const tree = buildTree(root);
const initialRel = relative(root, filePath);

const page = `<!doctype html>
<html lang="en" class="pantsdown">
<script>if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');</script>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>mdv</title>
  <style>${css}</style>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; display: flex; height: 100vh; font-family: -apple-system, sans-serif; }

    #sidebar {
      width: 260px;
      min-width: 260px;
      height: 100vh;
      overflow-y: auto;
      border-right: 1px solid var(--color-border-default);
      background: var(--color-canvas-subtle);
      padding: 12px 0;
      font-size: 13px;
    }
    #sidebar-title {
      padding: 4px 16px 10px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-fg-muted);
    }
    #sidebar ul { list-style: none; margin: 0; padding: 0; }
    #sidebar li { padding: 0; }
    #sidebar li span {
      display: block;
      padding: 3px 16px;
      cursor: default;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-fg-default);
    }
    #sidebar .tree-md span { cursor: pointer; }
    #sidebar .tree-md span:hover { background: var(--color-neutral-muted); border-radius: 4px; }
    #sidebar .tree-md.active span {
      background: var(--color-accent-emphasis);
      color: white;
      border-radius: 4px;
    }
    #sidebar .tree-dir > span { color: var(--color-fg-muted); font-weight: 500; }
    #sidebar ul ul li span { padding-left: 28px; }
    #sidebar ul ul ul li span { padding-left: 44px; }
    #sidebar ul ul ul ul li span { padding-left: 60px; }

    #main {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
    }
    #content {
      max-width: 1012px;
      margin: 0 auto;
      padding: 44px;
    }
  </style>
</head>
<body>
  <div id="sidebar">
    <div id="sidebar-title">${basename(root)}</div>
    ${tree}
  </div>
  <div id="main">
    <div id="content">${initialHtml}</div>
  </div>
  <script>${initialJs}</script>
  <script>
    const root = ${JSON.stringify(root)};
    const content = document.getElementById('content');

    function setActive(path) {
      document.querySelectorAll('.tree-md').forEach(el => {
        el.classList.toggle('active', el.dataset.path === path);
      });
    }

    setActive(${JSON.stringify(initialRel)});

    document.querySelectorAll('.tree-md').forEach(el => {
      el.querySelector('span').addEventListener('click', async () => {
        const res = await fetch('/render?path=' + encodeURIComponent(el.dataset.path));
        const { html, javascript } = await res.json();
        content.innerHTML = html;
        const s = document.createElement('script');
        s.text = javascript;
        content.appendChild(s);
        setActive(el.dataset.path);
        document.getElementById('main').scrollTo(0, 0);
      });
    });
  </script>
</body>
</html>`;

const server = Bun.serve({
  port: 0,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/render") {
      const relPath = url.searchParams.get("path") ?? "";
      const abs = resolve(root, relPath);
      if (!abs.startsWith(root)) return new Response("forbidden", { status: 403 });
      try {
        return new Response(renderFile(abs), { headers: { "Content-Type": "application/json" } });
      } catch {
        return new Response("not found", { status: 404 });
      }
    }
    return new Response(page, { headers: { "Content-Type": "text/html" } });
  },
});

const url = `http://localhost:${server.port}`;
console.log(`→ ${url}`);
Bun.spawn(["open", url]);

process.on("SIGINT", () => { server.stop(); process.exit(0); });
