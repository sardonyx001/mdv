import { Pantsdown } from "./pantsdown/src/index.ts";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, dirname, basename, join, relative } from "path";
import css from "./pantsdown/src/css/styles.css" with { type: "text" };

import { Command } from "commander";
import pkg from "./package.json" with { type: "json" };

const program = new Command()
  .name("mdv")
  .description("Minimal CLI markdown viewer powered by pantsdown")
  .version(pkg.version, "-v, --version")
  .argument("<file>", "markdown file to view")
  .option("-p, --port <number>", "port to serve on", "0")
  .parse();

const opts = program.opts();
const file = program.args[0];
const explicitPort = parseInt(opts.port);

const filePath = resolve(file);
const root = dirname(filePath);

const ICON_DIR = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="fill:var(--color-icon-directory);stroke:var(--color-icon-directory);flex-shrink:0"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`;
const ICON_FILE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--color-icon-file);flex-shrink:0"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;
const ICON_CHEVRON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--color-fg-subtle);flex-shrink:0;transition:transform 0.15s" class="chevron"><path d="m9 18 6-6-6-6"/></svg>`;

function buildTree(dir: string, depth = 0): string {
  if (depth > 5) return "";
  let entries;
  try {
    entries = readdirSync(dir).filter(e => !e.startsWith(".") && e !== "node_modules");
  } catch { return ""; }

  entries.sort((a, b) => {
    const aIsDir = statSync(join(dir, a)).isDirectory();
    const bIsDir = statSync(join(dir, b)).isDirectory();
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
    return a.localeCompare(b);
  });

  let html = "";
  for (const entry of entries) {
    const entryPath = join(dir, entry);
    const isDir = statSync(entryPath).isDirectory();
    const relPath = relative(root, entryPath);
    const indent = depth * 11;
    const extraIndent = isDir ? 0 : 20;

    if (isDir) {
      html += `
        <div class="tree-entry tree-dir" data-path="${relPath}/" style="padding-left:${indent}px">
          <div class="chevron-wrap">${ICON_CHEVRON}</div>
          ${ICON_DIR}
          <span class="entry-name">${entry}</span>
        </div>
        <div class="tree-children" data-parent="${relPath}/">
          ${buildTree(entryPath, depth + 1)}
        </div>`;
    } else {
      const isMd = entry.endsWith(".md");
      html += `
        <div class="tree-entry tree-file${isMd ? " tree-md" : ""}" data-path="${relPath}" style="padding-left:${indent + extraIndent}px">
          ${ICON_FILE}
          <span class="entry-name">${entry}</span>
        </div>`;
    }
  }
  return html;
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
    body { margin: 0; padding: 0; display: flex; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }

    #sidebar {
      width: 260px;
      min-width: 260px;
      height: 100vh;
      overflow-y: auto;
      border-right: 1px solid var(--color-border-default);
      background: var(--color-canvas-default);
      padding: 8px 0;
      font-size: 13px;
    }
    #sidebar-title {
      padding: 6px 12px 8px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-fg-muted);
    }

    .tree-entry {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 34px;
      margin: 0 6px;
      padding-right: 8px;
      border-radius: 6px;
      cursor: pointer;
      color: var(--color-fg-default);
      user-select: none;
    }
    .tree-entry:hover { background: var(--color-canvas-subtle); }
    .tree-entry.active { background: var(--color-canvas-subtle); }
    .tree-entry.active::before {
      content: '';
      position: absolute;
      left: -4px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      border-radius: 2px;
      background: var(--color-accent-fg);
    }
    .entry-name {
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .tree-entry:hover .entry-name { color: var(--color-accent-fg); text-decoration: underline; }
    .tree-entry.active .entry-name { color: var(--color-accent-fg); }
    .chevron-wrap {
      display: flex;
      align-items: center;
      width: 16px;
      flex-shrink: 0;
    }
    .chevron { transition: transform 0.15s; }
    .tree-dir.open > .chevron-wrap .chevron { transform: rotate(90deg); }
    .tree-children { display: none; }
    .tree-children.open { display: block; }

    #main { flex: 1; height: 100vh; overflow-y: auto; }
    #content { max-width: 1012px; margin: 0 auto; padding: 44px; }
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
    const content = document.getElementById('content');

    // expand dirs that contain the initial file
    const initialPath = ${JSON.stringify(initialRel)};
    const parts = initialPath.split('/');
    for (let i = 1; i < parts.length; i++) {
      const dirPath = parts.slice(0, i).join('/') + '/';
      const dirEl = document.querySelector('.tree-dir[data-path="' + dirPath + '"]');
      const childEl = document.querySelector('.tree-children[data-parent="' + dirPath + '"]');
      if (dirEl) dirEl.classList.add('open');
      if (childEl) childEl.classList.add('open');
    }

    function setActive(path) {
      document.querySelectorAll('.tree-entry').forEach(el => {
        el.classList.toggle('active', el.dataset.path === path);
      });
    }
    setActive(initialPath);

    // dir toggle
    document.querySelectorAll('.tree-dir').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('open');
        const children = document.querySelector('.tree-children[data-parent="' + el.dataset.path + '"]');
        if (children) children.classList.toggle('open');
      });
    });

    // file click
    document.querySelectorAll('.tree-md').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.stopPropagation();
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
  port: explicitPort,
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
