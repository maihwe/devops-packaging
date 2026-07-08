# Verification Evidence — Software Packaging Project

This document collects terminal output confirming successful packaging, installation, and execution across all three applications.

---

## 1. Node.js App (`nodejs-app`)

### Task 2 — Dependency Installation
```
$ npm install
added 444 packages, and audited 445 packages in 3m
found 0 vulnerabilities
```

### Task 4 — Environment Separation (dev, port from .env)
```
$ npm run dev
========================================
  DevOps Node App
  Environment : development
  Port        : 4000
  Version     : 1.0.0
========================================
```
(Port changed from 3000 to 4000 purely by editing `.env` — zero code changes.)

### Task 5 — Distributable Artifact
```
$ npm pack
npm notice Tarball Contents
npm notice env.example
npm notice package.json
npm notice src/app.js
npm notice src/config/env.js
npm notice src/index.js
npm notice devops-node-app-1.0.0.tgz
```

### Task 6 — Staging Verification (fresh extraction, prod-only deps)
```
$ NODE_ENV=staging node src/index.js
========================================
  DevOps Node App
  Environment : staging
  Port        : 3000
  Version     : 1.0.0
========================================
```

### Task 7 — Security Audit
```
$ npm audit
found 0 vulnerabilities
```

### Task 8 — Publish/Retrieve Simulation
```
$ npm install ~/devops-packaging/nodejs-app/devops-node-app-1.0.0.tgz
added 72 packages, and audited 73 packages in 14s
found 0 vulnerabilities
```
`consumer-test/package.json` recorded:
```json
"dependencies": {
  "devops-node-app": "file:../devops-packaging/nodejs-app/devops-node-app-1.0.0.tgz"
}
```

---

## 2. Django App (`django-app`)

### Task 2 — Dependency Installation
```
$ pip install -r requirements.txt
Successfully installed Django-5.0.6 asgiref-3.11.1 django-cors-headers-4.3.1
djangorestframework-3.15.1 gunicorn-22.0.0 packaging-26.2 psycopg2-binary-2.9.9
python-decouple-3.8 sqlparse-0.5.5 whitenoise-6.6.0
(venv) — virtual environment active
```

### Task 6 — Dev Verification
```
$ python manage.py runserver
Django version 5.2.15, using settings 'config.settings.development'
Starting development server at http://127.0.0.1:8000/

$ curl http://127.0.0.1:8000/
{"message":"DevOps Django App is running!","environment":"development","version":"1.0.0","django_version":"5.2.15"}

$ curl http://127.0.0.1:8000/health/
{"status":"ok","python_version":"3.12.3 ..."}
```

### Task 6 — Staging Verification
```
$ DJANGO_SETTINGS_MODULE=config.settings.staging python manage.py check
System check identified no issues (0 silenced).
```

### Task 7 — Security Audit (before remediation)
```
$ pip-audit
Found 25 known vulnerabilities in 3 packages
django              5.0.6   (23 CVEs/GHSAs)
djangorestframework 3.15.1  GHSA-gw84-84pc-xp82
pip                 24.0    (multiple)
```

### Task 7 — Security Audit (after remediation: Django 5.0.6 → 5.2.15)
```
$ pip-audit
No known vulnerabilities found.
```

### Task 8 — Publish/Retrieve Simulation
```
$ mkdir consumer-test-django && cd consumer-test-django
$ tar -xzf devops-django-app-1.0.1.tar.gz
$ pip install -r requirements.txt
Requirement already satisfied: Django==5.2.15 ...
```
Confirms the retrieved artifact matches the patched, secure dependency set.

---

## 3. Spring Boot App (`springboot-app`)

### Task 2 & 5 — Install, Test, and Package (single `mvn install`)
```
$ mvn install
[INFO] Running com.devops.HomeControllerTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Building jar: target/devops-springboot-app-1.0.0.jar
[INFO] BUILD SUCCESS
```

### Task 4 & 6 — Dev Profile Verification
```
$ export $(grep -v '^#' .env | xargs)
$ java -jar target/devops-springboot-app-1.0.0.jar
The following 1 profile is active: "dev"
H2 console available at '/h2-console'
Tomcat started on port 8080

$ curl http://localhost:8080/
{"message":"DevOps Spring App is running!","version":"1.0.0","environment":"dev"}

$ curl http://localhost:8080/actuator/health
{"status":"UP"}
```

### Task 6 — Staging Profile Verification
```
$ export SPRING_PROFILES_ACTIVE=staging
$ java -jar target/devops-springboot-app-1.0.0.jar
The following 1 profile is active: "staging"
```
(Database connection to `staging-db.internal` failed as expected — no live staging DB available; profile loading itself confirmed working.)

### Task 7 — Dependency Update Check
```
$ mvn org.codehaus.mojo:versions-maven-plugin:2.16.2:display-dependency-updates
[INFO] org.springframework.boot:spring-boot-maven-plugin ..... 3.3.1 -> 4.1.0
[INFO] BUILD SUCCESS
```

### Task 8 — Publish/Retrieve Simulation
```
$ find ~/.m2/repository/com/devops -type f
devops-springboot-app-1.0.0.jar
devops-springboot-app-1.0.0.pom

$ cd consumer-test-spring && mvn dependency:resolve
[INFO] BUILD SUCCESS
```
Confirms the packaged JAR resolves correctly as a dependency from the local Maven repository.

---

## Summary

All three applications were successfully packaged, installed, versioned, environment-separated, built into distributable artifacts, verified in both dev and staging contexts, security-audited (with one real vulnerability set found and fully remediated in Django), and confirmed retrievable by a downstream consumer.
