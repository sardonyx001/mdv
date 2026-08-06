import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, dirname, basename, join, relative, extname } from "path";
import { Command } from "commander";
import pkg from "./package.json" with { type: "json" };
import bundledJs from "./web/dist/bundle.js" with { type: "text" };

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
const initialRel = relative(root, filePath);

import indexCss from "./web/static/index.css" with { type: "text" };
import appCss from "./web/static/app.css" with { type: "text" };
import pantsdownCss from "./pantsdown/src/css/styles.css" with { type: "text" };

const html = `<!doctype html>
<html lang="en" class="pantsdown">
<script>if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');</script>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>mdv — ${basename(file)}</title>
  <style>${pantsdownCss}</style>
  <style>${appCss}</style>
  <style>${indexCss}</style>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    #root { height: 100vh; display: flex; overflow: hidden; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">${bundledJs}</script>
</body>
</html>`;

// Build flat directory tree for the explorer
function buildEntries(dir: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  function walk(d: string, relKey: string) {
    result[relKey] = [];
    let entries: string[];
    try {
      entries = readdirSync(d).filter(e => !e.startsWith(".") && e !== "node_modules");
    } catch { return; }

    entries.sort((a, b) => {
      const aIsDir = statSync(join(d, a)).isDirectory();
      const bIsDir = statSync(join(d, b)).isDirectory();
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
      return a.localeCompare(b);
    });

    for (const entry of entries) {
      const abs = join(d, entry);
      const isDir = statSync(abs).isDirectory();
      const childKey = relKey === "" ? (isDir ? entry + "/" : entry) : (isDir ? relKey + entry + "/" : relKey + entry);
      result[relKey].push(childKey);
      if (isDir) walk(abs, childKey);
    }
  }

  walk(dir, "");
  return result;
}

const entries = buildEntries(root);

const { Pantsdown } = await import("./pantsdown/src/index.ts");
const pantsdown = new Pantsdown({ renderer: { detailsTagDefaultOpen: true } });

function renderFile(abs: string) {
  const content = readFileSync(abs, "utf-8");
  const ext = extname(abs).slice(1);
  const markdown = ext === "md" ? content : "```" + ext + "\n" + content;
  const { lines } = { lines: content.split("\n") };
  return { lines };
}

const server = Bun.serve({
  port: explicitPort,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/init") {
      return new Response(JSON.stringify({
        currentPath: initialRel,
        repoName: basename(root),
        entries,
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/render") {
      const relPath = url.searchParams.get("path") ?? "";
      const abs = resolve(root, relPath);
      if (!abs.startsWith(root)) return new Response("forbidden", { status: 403 });
      try {
        return new Response(JSON.stringify(renderFile(abs)), {
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return new Response("not found", { status: 404 });
      }
    }

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  },
});

const serverUrl = `http://localhost:${server.port}`;
console.log(`→ ${serverUrl}`);
Bun.spawn(["open", serverUrl]);

process.on("SIGINT", () => { server.stop(); process.exit(0); });
