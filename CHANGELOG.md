# Changelog

All notable changes are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-08-06

### Bug Fixes

- Remove sidebar entirely, markdown-only viewer

### Features

- *(ui)* Rewrite sidebar to match github-preview.nvim style
- *(ui)* Replace hand-rolled sidebar with React app using plugin components

## [0.4.0] - 2026-08-06

### Bug Fixes

- *(ci)* Replace git-cliff container action with pinned binary download
- *(ci)* Upgrade git-cliff-action to v4 (composite, no Docker)
- *(ci)* Tolerate asset conflicts on re-run
- *(ci)* Use npm publish with OIDC trusted publishing via setup-node
- *(ci)* Use classic automation token for npm publish
- *(ci)* Use setup-node with NODE_AUTH_TOKEN for npm publish
- *(ci)* Remove setup-node to let npm use OIDC trusted publishing
- *(ci)* Manually fetch OIDC token for npm trusted publishing
- *(ci)* Setup-node with registry-url but no auth token for OIDC
- *(npm)* Build JS bundle for bunx/npx, upgrade npm for OIDC trusted publishing

### Features

- *(ci)* Add arm64 Linux build target
- *(ci)* Sign binaries with cosign keyless signing
- *(ci)* Switch to npm trusted publishing (OIDC, no token needed)

## [0.2.1] - 2026-08-06

### Bug Fixes

- *(ci)* Publish releases immediately, not as drafts
- *(ci)* Revert to shell for multi-arch homebrew formula (mislav action is single-url only)

## [0.2.0] - 2026-08-06

### Features

- Add --help, --version, --port flags
- Add npm publishing, update package.json metadata

### Refactor

- Replace hand-rolled arg parsing with commander

## [0.1.0] - 2026-08-06

### Bug Fixes

- *(ci)* Replace container action with cli for git-cliff (macOS runner)

### Features

- Initial commit


