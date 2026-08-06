# mdv

[![Built with Bun](https://img.shields.io/badge/built%20with-Bun-f9f1e1?logo=bun)](https://bun.sh)
[![Powered by pantsdown](https://img.shields.io/badge/powered%20by-pantsdown-e6c9a8)](https://github.com/wallpants/pantsdown)
[![Inspired by github-preview.nvim](https://img.shields.io/badge/inspired%20by-github--preview.nvim-8957e5?logo=neovim)](https://github.com/wallpants/github-preview.nvim)
[![macOS](https://img.shields.io/badge/macOS-only-000000?logo=apple)](https://www.apple.com/macos)

A minimal CLI markdown viewer for the terminal. Opens any `.md` file in your browser with GitHub-accurate rendering, a file-tree sidebar, and automatic dark mode — no internet required.

Built on top of [pantsdown](https://github.com/wallpants/pantsdown), the same renderer used by [github-preview.nvim](https://github.com/wallpants/github-preview.nvim).

## Features

- GitHub-accurate markdown rendering via pantsdown
- File tree sidebar — click to navigate between `.md` files in the same directory
- Automatic dark/light mode (follows your OS setting)
- Mermaid diagrams, syntax highlighting, KaTeX math
- Fully offline — single self-contained binary, no external requests

## Install

```bash
# build from source (requires bun)
git clone https://github.com/sardonyx001/mdv
cd mdv
task install
```

## Usage

```bash
mdv README.md
mdv ~/notes/project.md
```

Opens a local server and launches your browser. `Ctrl+C` to quit.

## How it works

`mdv` spins up a local HTTP server, renders the markdown with pantsdown, and serves a single-page app with a sidebar built from the directory tree. Clicking a `.md` file in the sidebar fetches and renders it without a full page reload. Everything runs locally — no telemetry, no network requests.

## Credits

- [pantsdown](https://github.com/wallpants/pantsdown) — the markdown parser and GitHub CSS
- [github-preview.nvim](https://github.com/wallpants/github-preview.nvim) — the Neovim plugin that inspired this
