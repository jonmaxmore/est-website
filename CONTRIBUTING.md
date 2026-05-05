# Contributing

Thanks for considering a contribution. The site is closed-source / proprietary,
but the contribution flow below applies to anyone with commit rights.

## Branching model

- `main` — production. Auto-deploys via the GitHub Actions workflow.
- `claude/<topic>` or `feat/<topic>` — short-lived feature branches off `main`.
- One topic per branch; rebase or merge `main` into the branch as needed.

## Commit messages

Follow the conventional-commits prefix the project already uses:

```
<type>(<scope>): <imperative summary>

<body — wrap at 80 cols, explain WHY rather than WHAT>

Co-Authored-By: ...   (optional, for AI-assisted commits)
```

Types: `feat`, `fix`, `refactor`, `perf`, `chore`, `docs`, `test`, `style`.
Scope: a folder or system name (`security`, `i18n`, `api`, `consent`,
`ops`, `analytics`, `auth`, `content`, …).

Each commit should be **one logical change** — small commits review faster
and revert cleanly when something is wrong.

## Pull request checklist

- [ ] `npm run lint` passes (the husky pre-commit hook enforces this on
      staged files; run it on the full repo before opening the PR)
- [ ] `npm run test:node` passes
- [ ] `npm run build` passes locally (catches type errors `vue-tsc` would
      raise during the production build)
- [ ] Docs updated when you touched env vars, schemas, or runbooks
- [ ] Migration files match the schema (run `npx prisma migrate dev` locally
      to confirm) — never edit a migration after it has been applied to a
      shared environment
- [ ] If you added an env var, document it in BOTH `.env.example` and
      `.env.production.example`

## Code style

- TypeScript strict (Nuxt-injected; don't disable it locally).
- Default to writing **no** code comments. Add a comment only when the WHY
  is non-obvious (a hidden constraint, a workaround, a subtle invariant).
  Don't explain WHAT well-named code already says.
- File-size cap: 500 lines max, prefer ≤300.
- Function-size cap: 50 lines max, prefer ≤30.
- Single-Responsibility: a file/function should have one reason to change.

See [`AGENTS.md`](AGENTS.md) (if present) or [`docs/PRODUCTION-OPS.md`](docs/PRODUCTION-OPS.md)
for system-specific conventions.

## Migrations

- Forward-only (we don't ship `down` scripts). Plan accordingly.
- Take a `pg_dump` snapshot before applying destructive migrations to prod.
- Coordinate enum changes across deploy steps — Postgres only allows
  `ALTER TYPE … ADD VALUE` outside a transaction, so a multi-step deploy
  may be required.

## Testing

- `tests/cms/*.test.ts` — unit tests via `node:test` runner. New utility
  functions should ship with tests.
- `e2e/*.spec.ts` — Playwright. Smoke tests under `e2e/smoke/`, deeper UAT
  under `e2e/uat/`.
- Visual regression and a11y testing are not yet wired (audit-2 finding W-2);
  add when relevant.

## Reporting issues

- Production incident: post to `#prod-alerts` (or whatever Slack channel
  `SLACK_ALERT_WEBHOOK_URL` is wired to).
- Security disclosure: email the maintainer directly (see `git log` for
  the address). Don't open public issues for vulnerabilities.

## License

All code under this repository is proprietary © Eternal Tower Saga.
By contributing you agree that your contributions are licensed under the
same terms as the rest of the codebase.
