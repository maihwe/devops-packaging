# DevOps Node App — Software Packaging

A small Express.js API used to demonstrate software packaging practices for the Node.js ecosystem: dependency management, semantic versioning, environment separation, build artifacts, verification, and security auditing.

## 1. Dependency Management

Dependencies are defined in `package.json`:

**Runtime dependencies:**
- `express` — web framework
- `dotenv` — loads environment variables from `.env`
- `cors` — cross-origin request handling

**Development-only dependencies:**
- `nodemon`, `jest`, `eslint`, `supertest`

Install and update commands:
```bash
npm install          # resolves and installs all dependencies, generates package-lock.json
npm outdated          # lists packages with newer versions available
npm update            # updates within allowed semver ranges
```

`package-lock.json` is committed to version control to guarantee every environment installs the exact same dependency tree.

## 2. Versioning Strategy

The app follows **Semantic Versioning (MAJOR.MINOR.PATCH)**, currently at `1.0.0`.

- **PATCH** (`1.0.1`) — bug fixes, no API changes
- **MINOR** (`1.1.0`) — new backward-compatible features
- **MAJOR** (`2.0.0`) — breaking changes

Dependency ranges in `package.json` use caret notation (e.g. `^4.18.2`), allowing MINOR/PATCH updates automatically while blocking MAJOR version jumps.

## 3. Environment Configuration

All environment-specific values (port, environment name, secrets) are isolated from the code:

- `env.example` documents required variables without real secrets
- `src/config/env.js` is the **only** file that reads `process.env`
- `.env` (real values) is gitignored and never bundled into the artifact

Verified: changing `PORT` in `.env` from `3000` to `4000` changed the running server's port with zero code changes.

## 4. Build / Distributable Artifact

The distributable artifact is produced with:
```bash
npm pack
```

This generates `devops-node-app-1.0.0.tgz`, containing only:
```
env.example
package.json
src/app.js
src/config/env.js
src/index.js
```

The `"files"` field in `package.json` explicitly whitelists what ships, so dev tooling, tests, and `.env` are never included regardless of `.gitignore` state.

## 5. Verification (Dev & Simulated Staging)

**Dev environment:**
```bash
npm run dev
```
Confirmed output: `Environment: development`, `Port: 3000` (or 4000 after `.env` change).

**Simulated staging environment** — extracting only the packaged tarball into a clean directory, installing production-only dependencies, and running it standalone:
```bash
mkdir /tmp/staging-test && cd /tmp/staging-test
tar -xzf path/to/devops-node-app-1.0.0.tgz --strip-components=1
cp env.example .env
# set NODE_ENV=staging in .env
npm install --omit=dev
NODE_ENV=staging node src/index.js
```
Confirmed output: `Environment: staging`, `Port: 3000`, `Version: 1.0.0` — the packaged artifact runs correctly standalone, independent of the development project folder.

## 6. Security Audit

```bash
npm audit
```
**Result: 0 vulnerabilities found** across all installed dependencies (as of the date in the commit history / screenshot).

## 7. Publish / Retrieve Simulation (Optional)

Simulated a downstream consumer installing the package as if from a registry, without needing to run an actual registry server:

```bash
mkdir consumer-test && cd consumer-test
npm init -y
npm install ../devops-packaging/nodejs-app/devops-node-app-1.0.0.tgz
```

Result: `consumer-test/package.json` recorded the dependency as
`"devops-node-app": "file:../devops-packaging/nodejs-app/devops-node-app-1.0.0.tgz"`,
and `node_modules/devops-node-app` contained exactly the artifact's clean file set — proving the package installs and resolves like a real published dependency.

## Screenshots / Logs

See `/screenshots` folder (or paste terminal logs) for:
- `npm install` output (Task 2)
- Port-change proof, dev mode (Task 4)
- `npm pack` tarball contents (Task 5)
- Staging run output (Task 6)
- `npm audit` output (Task 7)
- Consumer install output (Task 8)
