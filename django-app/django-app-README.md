# DevOps Django App — Software Packaging

A Django REST API used to demonstrate software packaging practices for the Python ecosystem: dependency management, semantic versioning, environment separation, build artifacts, verification, and security auditing.

## 1. Dependency Management

Dependencies are defined in `requirements.txt`, using exact version pins (`==`) rather than ranges — a deliberate Python convention that prioritizes reproducibility.

**Runtime dependencies (`requirements.txt`):**
- `Django` — web framework
- `gunicorn` — production WSGI server
- `python-decouple` — loads environment variables from `.env`
- `djangorestframework` — REST API support
- `django-cors-headers` — CORS handling
- `psycopg2-binary` — PostgreSQL driver
- `whitenoise` — static file serving

**Development-only dependencies (`requirements-dev.txt`)**, installed via `-r requirements.txt` plus:
- `pytest`, `pytest-django`, `pytest-cov` — testing
- `pip-audit` — dependency vulnerability scanning
- `black`, `flake8` — formatting/linting
- `django-extensions` — dev tooling

Install commands:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Bug found and fixed:** the initial dependency list was written generically before checking the actual code. Cross-checking against `core/views.py` and `config/settings/base.py` revealed the app imports `decouple`, `rest_framework`, and `corsheaders` — so `requirements.txt` was corrected to include `python-decouple`, `djangorestframework`, and `django-cors-headers`, replacing an incorrect initial guess (`python-dotenv`) that didn't match what the code actually used.

## 2. Versioning Strategy

Follows **Semantic Versioning (MAJOR.MINOR.PATCH)**, declared in `pyproject.toml`.

- Started at `1.0.0`
- Bumped to **`1.0.1`** after the Task 7 security patch (dependency upgrade, no breaking API changes → PATCH bump is correct per semver rules)

## 3. Environment Configuration

Environment-specific values are isolated from code using a split settings module:

```
config/settings/
├── base.py         # shared settings
├── development.py  # SQLite, DEBUG=True
└── staging.py       # PostgreSQL, DEBUG=False
```

`python-decouple` reads all secrets/config from `.env` (gitignored, never bundled into the artifact); `env.example` documents the expected variables without real values.

**Bug found and fixed:** the settings folder was originally misnamed `config/testings/` while every reference (`manage.py`, `wsgi.py`, `pyproject.toml`) pointed to `config.settings.*`. This would have broken the app immediately on first run. Fixed by renaming the folder to `config/settings/`.

**Bug found and fixed:** `core/urls.py` was an accidental duplicate of the root `config/urls.py` (routed to Django admin instead of the app's own views). Corrected to route `/` and `/health/` to `core/views.py`'s `home` and `health` view functions.

## 4. Distributable Artifact

Built with a `tar` command that excludes environment/dev artifacts:
```bash
tar -czf devops-django-app-1.0.1.tar.gz \
  --exclude='venv' --exclude='.env' --exclude='__pycache__' \
  --exclude='.git' --exclude='db.sqlite3' --exclude='*.pyc' \
  --exclude='.pytest_cache' --exclude='*.tar.gz' \
  manage.py config core requirements.txt env.example pyproject.toml
```

Contents: `manage.py`, `config/`, `core/`, `requirements.txt`, `env.example`, `pyproject.toml` — no secrets, no virtual environment, no cache or database files.

**Important lesson learned:** the artifact must be rebuilt after every dependency change. The first artifact (`1.0.0`) was built *before* the security patch and still shipped the vulnerable Django version even after the source `requirements.txt` was fixed. This was caught during the Task 8 retrieval test and fixed by rebuilding as `1.0.1`.

## 5. Verification (Dev & Staging)

**Dev environment:**
```bash
python manage.py migrate
python manage.py runserver
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/health/
```
Confirmed: both endpoints return `200`, reporting the running Django version.

**Staging environment** (settings isolation, validated via Django's system check with staging-specific env vars):
```bash
DJANGO_SETTINGS_MODULE=config.settings.staging python manage.py check
```
Confirmed: "System check identified no issues (0 silenced)" — staging settings load correctly and independently from development settings.

Both checks were re-run after the Django security upgrade (5.0.6 → 5.2.15) to confirm no regressions.

## 6. Security Audit

```bash
pip install pip-audit
pip-audit
```

**Initial result:** 25 known vulnerabilities found — 23 in Django 5.0.6 (multiple CVEs/GHSAs, several unpatched on the 5.0.x line entirely), 1 in `djangorestframework` 3.15.1, 1 in `pip` 24.0.

**Remediation:**
- Upgraded `pip` to the latest version
- Upgraded `djangorestframework` to `3.15.2`
- Upgraded `Django` in two steps: `5.0.6` → `5.2.8` → `5.2.15` (the fully-patched current LTS line)

**Final result:** `No known vulnerabilities found.`

Regression-tested after the upgrade (dev server + staging check) to confirm the patch introduced no breaking changes.

## 7. Publish / Retrieve Simulation (Optional)

Simulated a downstream consumer retrieving the packaged artifact without a live registry:
```bash
mkdir consumer-test-django && cd consumer-test-django
tar -xzf path/to/devops-django-app-1.0.1.tar.gz
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Confirmed: fresh environment installs `Django==5.2.15` (the patched version), proving the retrieved artifact matches the secured dependency set — not the earlier, vulnerable build.

## Screenshots / Logs

See terminal logs for:
- `pip install -r requirements.txt` (Task 2)
- `manage.py runserver` + curl output, dev (Task 6)
- `manage.py check` with staging settings (Task 6)
- `pip-audit` before and after remediation (Task 7)
- Consumer install output confirming patched version (Task 8)
