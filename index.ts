import { Pantsdown } from "./pantsdown/src/index.ts";
import { readFileSync } from "fs";
import { resolve } from "path";
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
const content = readFileSync(filePath, "utf-8");
const pantsdown = new Pantsdown({ renderer: { detailsTagDefaultOpen: true } });
const { html, javascript } = pantsdown.parse(content);

const page = `<!doctype html>
<html lang="en" class="pantsdown">
<script>if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');</script>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${file}</title>
  <style>${css}</style>
  <style>
    body { margin: 0; padding: 0; }
    #content { max-width: 1012px; margin: 0 auto; padding: 44px; }
  </style>
</head>
<body>
  <div id="content">${html}</div>
  <script>${javascript}</script>
</body>
</html>`;

const server = Bun.serve({
  port: explicitPort,
  fetch() {
    return new Response(page, { headers: { "Content-Type": "text/html" } });
  },
});

const url = `http://localhost:${server.port}`;
console.log(`→ ${url}`);
Bun.spawn(["open", url]);

process.on("SIGINT", () => { server.stop(); process.exit(0); });
