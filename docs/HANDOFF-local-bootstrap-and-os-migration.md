# HANDOFF — Local bootstrap repair, Supabase pause, and OS migration

> **For whoever picks this up (human or agent):** read this before touching the project.
> It records the state as of **2026-10-15**, why the app was returning 500 on every
> route, what PR #79 changed, what is deliberately unfinished, and how to bring the
> project back up on a new machine.

---

## 1. TL;DR

| | |
|---|---|
| Symptom | Every route returned **HTTP 500**; the project could not be opened locally |
| Root cause | `.env` pointed at a **paused Supabase project** whose hostname no longer resolves in DNS |
| Fix | [PR #79](https://github.com/aleocampodev/nenufar/pull/79) — squash `0ef165c`, plus follow-up `467af56` |
| Verified | `pnpm lint` → 0 errors · `pnpm test:int` → 95/95 · 10/10 routes → 200 |
| Start command | `pnpm dev:local` → http://localhost:3002 |
| Big caveat | A dump of the paused Supabase database exists and contains **personal data** (§6). Never commit it in the clear. |

---

## 2. What was broken

Five independent defects. Any one of them alone would have broken the local loop.

### 2.1 The paused Supabase project (the 500s)

`DATABASE_URL` in `.env` pointed at a Supabase project that had been **paused by
inactivity**. A paused project does not resolve in DNS, so Payload failed at boot:

```
Error: cannot connect to Postgres: getaddrinfo ENOTFOUND db.<ref>.supabase.co
```

Supabase Free plan pauses any project with no database activity for 7 days. Nenúfar
is a shop with almost no traffic, so it never reaches the minimum query threshold.
Supabase sends a warning email roughly a week before pausing — the pause was not a
crash or an outage. Restore window: 1 year, via **Resume project** in the dashboard.

### 2.2 Postgres port collision

`docker-compose.yml` published Postgres on `:5433`, which was already held by another
local container. The documented bootstrap (`docker-compose up -d`) could never start.
Now `"${POSTGRES_HOST_PORT:-5435}:5432"`.

### 2.3 Migrations that could not build a database

The two committed migrations were **internally inconsistent**: the newest snapshot
(`20260911_233852_buyer_fields.json`) declared tables such as
`_pages_v_version_hero_slides` that its own SQL never created. Building a fresh
database from them produced a schema that Payload could not query — the seed died with
`relation "_pages_v_version_hero_slides" does not exist`, and `migrate:create`
confusingly reported "No schema changes detected" (it diffs snapshot → config, and the
snapshot was the thing lying).

Replaced by a single migration, `20261016_001343_initial`, generated from the current
config: **120 `CREATE TABLE` statements**, and it keeps the `buyer_name` /`buyer_contact`
columns that the deleted second migration had added.

### 2.4 E2E pointed at a port nothing listens on

`playwright.config.ts` and both E2E specs used `:3000` while the dev server serves
`:3002` (CONSTITUTION Art. IV). `pnpm test:e2e` therefore waited forever on a dead port.
Now `:3002`.

### 2.5 The seed could not load `.env`

`src/endpoints/seed/run-seed.ts` is run directly with `tsx`, which — unlike the Payload
CLI — does not load `.env`, so `payload.config.ts` threw
`Error: PAYLOAD_SECRET env var is required`. Fixed with an `import 'dotenv/config'`.

### 2.6 (not code, but it broke the same day)

`node_modules` was missing **dev** dependencies, so `pnpm lint` could not even load
ESLint (`Cannot find package 'typescript-eslint'`). `pnpm install --prod=false` repaired it.
See §8 — this is easy to hit again on a fresh machine.

---

## 3. What PR #79 changed

| File | Change |
|---|---|
| `docker-compose.yml` | `${POSTGRES_HOST_PORT:-5435}:5432` |
| `src/migrations/*` | Two inconsistent migrations → one `20261016_001343_initial` |
| `playwright.config.ts`, `tests/e2e/*.spec.ts` | `:3000` → `:3002` |
| `src/endpoints/seed/run-seed.ts` | `import 'dotenv/config'` |
| `scripts/dev-local.sh` (new) | Postgres up → wait ready → migrate → `pnpm dev` |
| `package.json` | `dev:local`, `seed:local` |
| `.env.example`, `README.md`, `AGENTS.md`, `CLAUDE.md` | Aligned on `:5435` and `:3002` |

**BREAKING:** the previous migrations are gone. Any database that already applied them
must be recreated from scratch — see §7 for what that means for the paused Supabase one.

### 3.1 The `payload migrate` prompt trap

`payload.config.ts` sets `push: process.env.NODE_ENV === 'development'`. In dev mode
Payload records a marker row in `payload-migrations` with `batch = -1`, and **every
later `payload migrate` blocks on an interactive confirm prompt**:

```
It looks like you've run Payload in dev mode, meaning you've dynamically pushed
changes to your database. If you'd like to run migrations, data loss will occur.
```

`scripts/dev-local.sh` deletes that dev-only marker before migrating so the bootstrap
stays non-interactive. If you ever run `pnpm payload migrate` by hand after a dev
session, expect that prompt.

---

## 4. Verified state (re-run these, don't trust this paragraph)

```bash
pnpm lint                 # 0 errors, 376 pre-existing warnings
pnpm test:int             # 95/95
pnpm dev:local            # boots Postgres, migrates, serves http://localhost:3002
```

Routes confirmed **200** against a freshly migrated + seeded database:
`/`, `/shop`, `/blog`, `/contact`, `/galeria`, `/eventos`, `/products/tshirt`,
`/pedidos/enviar`, `/admin`, `/api/products?limit=2`.

Admin login: `admin@nenufar.com` / `admin123` (seed data only — never in production).

---

## 5. Local database (the development path)

```
Postgres 16 in Docker, host port 5435 (override with POSTGRES_HOST_PORT)
  └─ DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5435/nenufar
```

**The local database is the supported development path.** Supabase is not, for two
reasons: it pauses itself weekly (§2.1), and it is the only place the old data lived.

If you change the host port, change `DATABASE_URL` to match — `dev-local.sh` only warns
about a non-local `DATABASE_URL`, it does not rewrite it.

---

## 6. The Supabase dump — contains personal data

A `pg_dump` of the paused project was taken on **2026-09-19 21:47:50** and preserved
outside `~/Downloads`:

- `~/Backups/nenufar-supabase-20260919/` — canonical copy
- `<repo>/.secrets-backup/nenufar-supabase-20260919/` — git-ignored copy (PR #78)
- SHA-256: `6923527837d7c4df4de64aafe0ec4d0452c7c19a6df673c94bc5087c9ca51cf0`
- Format: **plain SQL**, cluster level. Restore with `psql`, **not** `pg_restore`.
- Content: 120 public tables, plus real rows — 9 products, 40 media, 222 storage objects,
  37 page versions, 150 `agent_messages`, 62 `agent_traces`.

**Security warning.** The dump contains personal data (an email address, phone-number-like
values, and 150 real Telegram messages between Shirley and the bot). It contains **no
credentials** — `auth.users`, `vault.secrets`, `auth.sessions` and `auth.refresh_tokens`
are all empty (0 rows), and there are no JWTs in the file. It must still never be
committed to this public repository in the clear. If you need it to survive an OS
reinstall, encrypt it first and keep the passphrase outside the repo:

```bash
gpg -c --output ~/Backups/nenufar-supabase-20260919.dump.gpg \
    ~/Backups/nenufar-supabase-20260919/db_cluster-19-09-2026@21-47-50.backup
```

Also note the earlier finding that this database held **no published orders and no
catalogue history** in `public.products` beyond the seeded pieces; most of the content is
in version/draft tables plus the agent transcripts.

---

## 7. If you resume Supabase later

The project is **paused, not deleted** — its data is still there. Resuming it requires
the owner's dashboard session; no agent can do it.

1. Dashboard → project → **Resume project** → wait for *Active*.
2. **Do not** run `DROP SCHEMA public CASCADE` there: the project already holds real rows,
   and the rebuilt migration from §2.3 only applies to an **empty** database.
3. Put the new connection string into `.env` yourself (never paste it into a chat or a
   commit — this repo is public and a Telegram token was already leaked through it):

   ```bash
   read -rsp "Connection string: " DB; echo
   python3 - "$DB" <<'PY'
   import sys, re, pathlib
   db = sys.argv[1].strip()
   assert db.startswith(('postgres://', 'postgresql://'))
   p = pathlib.Path('.env'); t = p.read_text()
   p.write_text(re.sub(r'^DATABASE_URL=.*$', 'DATABASE_URL=' + db, t, flags=re.M))
   print('OK ->', db.split('@')[-1])   # host only, never the password
   PY
   ```

4. The SSL branch in `payload.config.ts` keys off the URL containing `supabase`, so the
   session-pooler string works without further config.
5. Verify with the route sweep in §4.

---

## 8. OS migration checklist

The project is moving to a new operating system. After the reinstall:

```bash
# 1. Toolchain
node -v    # needs >= 20
pnpm -v
docker --version && docker compose version

# 2. Clone (the old absolute paths in the docs are stale by definition)
git clone https://github.com/aleocampodev/nenufar.git

# 3. Dependencies — READ THIS: a plain `pnpm install` here silently skipped
#    devDependencies and left `pnpm lint` unable to start. Force them:
pnpm install --ignore-workspace --prod=false

# 4. Secrets — recreate .env from .env.example and fill in PAYLOAD_SECRET,
#    TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID, TELEGRAM_WEBHOOK_SECRET,
#    TELEGRAM_ADMIN_CHAT_ID, GROQ_API_KEY, LITELLM_MASTER_KEY,
#    ANTHROPIC_BASE_URL / ANTHROPIC_AUTH_TOKEN / ANTHROPIC_MODEL, PREVIEW_SECRET
cp .env.example .env

# 5. Bring it up
pnpm dev:local
pnpm seed:local     # sample content + admin@nenufar.com / admin123
```

Watch for these on the new machine:

- **Port 5435 must be free** (other local projects may hold 5432/5433/5434; override with
  `POSTGRES_HOST_PORT` and update `DATABASE_URL` to match).
- **Stale `.next`**: after pulling dependency changes, `pnpm dev` can fail with
  `__webpack_modules__[...] is not a function`. `rm -rf .next` fixes it.
- **Container name collision**: if something else already claims the container name
  `nenufar-postgres`, `docker compose up` refuses to start. `docker ps -a` shows it.
- **Restore the backup** from §6 if you need the old data — decrypt first if encrypted.
- Absolute paths written in older docs (`/home/ale/Work/nenufar/...`) are stale.

---

## 9. Deliberately unfinished

| Item | State |
|---|---|
| E2E suite | Unblocked from hanging, but **2 of 24 specs fail**: they `POST /api/variantTypes` unauthenticated and get `403`. That `beforeAll` blocks the other 21. Pre-existing, unrelated to ports. Needs its own PR. |
| Duplicate clone | `~/Documentos/Laptop-ale/Work/nenufar/` and `.../nenufar-admin-polish/` are two clones of this same repo. Nothing unique remains in the first one (its only pending change shipped in PR #78). Consolidation was proposed and **not executed** — it deletes `node_modules` and needs an explicit OK. |
| Oracle Cloud deployment | Deferred by the owner. `docs/DEPLOYMENT.md` targets Oracle Cloud Always Free. It must run the rebuilt migration from §2.3 against a **fresh** database. |
| CI gate | CI runs only `test:int`. Lint, build and E2E are not gates, although CONSTITUTION Art. VI requires lint + build. |
| Playwright report vs lint | Running `pnpm test:e2e` writes `playwright-report/` and `test-results/`. They are git-ignored but ESLint does not inherit `.gitignore`, and linting the report's bundled vendor JS produced **2946 bogus errors**. Fixed by ignoring both directories in `eslint.config.mjs`; delete them if a stale report resurfaces. |
| Live catalogue | Shirley never loaded real products or orders; the site was rendering from hardcoded CMS fallbacks. Worth confirming before any launch. |

---

## 10. Repository hygiene note

Never commit secrets, connection strings or project references to this public repository.
Before pushing, check what the commit message and PR body contain — a Supabase project ref
leaked into an earlier commit message of this work and had to be amended away.