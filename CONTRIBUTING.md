# Contributing to attendance-tracker

Thank you for considering a contribution to **attendance-tracker**. This guide is written for both first-time and experienced contributors.

## Project Overview

This repository contains the source code, docs, and project assets for **attendance-tracker**.

### Key top-level items
- public
- src
- .gitignore
- index.html
- package-lock.json
- package.json
- PRD.md
- README.md
- seed_attendance.sql
- supabase_setup.sql
- tsconfig.app.json
- tsconfig.json
- vercel.json
- vite.config.ts

## Before You Start

1. Fork the repository to your GitHub account.
2. Clone your fork locally.
3. Create a branch for your change.

Example:

`ash
git clone https://github.com/Rajveerx11/attendance-tracker.git
cd attendance-tracker
git checkout -b feature/short-description
`

## Local Setup

Use the setup approach that matches the repo:
- `npm install`
- `npm run dev (or npm start)`

If a command does not apply, check the README for repo-specific details.

## Contribution Workflow

1. **Discuss first**: open an issue for large features or breaking changes.
2. **Write focused commits**: one logical change per commit.
3. **Keep PRs small**: easier to review and merge.
4. **Add tests/docs**: include tests for behavior changes and docs for new flows.

## Code Quality Expectations

- Follow existing folder and naming conventions.
- Prefer readability over clever code.
- Keep functions and classes focused.
- Avoid unrelated formatting-only changes in feature PRs.

## Pull Request Checklist

Before opening a PR, verify:

- [ ] Code builds locally
- [ ] Tests pass (if the project has tests)
- [ ] Lint/format checks pass (if configured)
- [ ] README/docs updated when behavior changed
- [ ] PR title clearly explains the change

## Commit Message Tips

Use concise, descriptive commit messages:

- eat: add user profile validation
- ix: handle null response in dashboard
- docs: improve setup steps for windows

## Reporting Bugs

When filing a bug, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs (if available)
- Environment details (OS, browser/runtime/tool versions)

## Need Help?

If you are new, feel free to open a discussion/issue with questions. Friendly, respectful collaboration is expected for all contributors.
