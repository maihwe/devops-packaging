# DevOps Spring Boot App — Software Packaging

A Spring Boot REST API used to demonstrate software packaging practices for the Java ecosystem: dependency management, semantic versioning, environment separation, build artifacts, verification, and security auditing.

## 1. Dependency Management

Dependencies are defined in `pom.xml` using Maven.

**Runtime dependencies:**
- `spring-boot-starter-web` — REST API / embedded Tomcat
- `spring-boot-starter-data-jpa` — ORM layer
- `spring-boot-starter-actuator` — health-check endpoint (`/actuator/health`)
- `h2` (runtime scope) — in-memory database for local dev
- `postgresql` (runtime scope) — database driver for staging

**Development-only dependency:**
- `spring-boot-devtools` (optional, runtime scope) — auto-restart during development

**Test dependency:**
- `spring-boot-starter-test` (test scope) — JUnit 5, MockMvc

Unlike Node's `^` ranges or Python's exact `==` pins, Maven dependencies here use exact versions inherited from the `spring-boot-starter-parent` BOM (Bill of Materials), which centrally manages compatible versions across the whole Spring Boot ecosystem.

Cross-checked against the actual source code (`HomeController.java`, `application-dev.properties`) to confirm every dependency is genuinely used — no unused or missing entries.

## 2. Installing Dependencies & Building

```bash
mvn install
```

Unlike npm/pip, Maven's `install` lifecycle phase does dependency resolution, compilation, testing, and packaging all in one command. Result:
- All dependencies resolved from Maven Central
- 2/2 unit tests passed (`HomeControllerTest`)
- Packaged into an executable JAR: `target/devops-springboot-app-1.0.0.jar`
- Installed into the local repository (`~/.m2/repository`)

## 3. Versioning Strategy

Follows **Semantic Versioning (MAJOR.MINOR.PATCH)**, declared in `pom.xml` as `<version>1.0.0</version>`.

## 4. Environment Configuration

Environment-specific settings are split into Spring profiles:
```
src/main/resources/
├── application.properties          # shared base config
├── application-dev.properties       # H2, debug logging
└── application-staging.properties   # PostgreSQL, warn-level logging
```

The active profile is controlled entirely by the `SPRING_PROFILES_ACTIVE` environment variable — no extra config library needed (Spring Boot reads it natively), unlike Node's `dotenv` or Python's `decouple`.

**Verified:**
```bash
export $(grep -v '^#' .env | xargs)
java -jar target/devops-springboot-app-1.0.0.jar
```
Startup log confirmed: `The following 1 profile is active: "dev"`, and the H2 console was mounted — proving `application-dev.properties` was genuinely in effect, not just a fallback default.

## 5. Distributable Artifact

Produced automatically by `mvn install` via the `spring-boot-maven-plugin`, which repackages the plain JAR into a self-contained executable JAR (`BOOT-INF/` bundles all dependencies inside):

```
target/devops-springboot-app-1.0.0.jar
```

Run standalone with no external dependency folder needed:
```bash
java -jar target/devops-springboot-app-1.0.0.jar
```

## 6. Verification (Dev & Staging)

**Dev environment:**
```bash
curl http://localhost:8080/
curl http://localhost:8080/health
curl http://localhost:8080/actuator/health
```
All three returned `200`, confirming the app, custom health endpoint, and Spring Boot Actuator all work correctly.

**Staging environment:**
```bash
export SPRING_PROFILES_ACTIVE=staging
export DB_USER=dummy_user
export DB_PASSWORD=dummy_password
java -jar target/devops-springboot-app-1.0.0.jar
```
Startup log confirmed: `The following 1 profile is active: "staging"`. The app then failed to connect to PostgreSQL (`staging-db.internal` doesn't exist in this environment) — this is expected, since no live staging database was available. The important result is that profile activation and configuration loading worked correctly; only the live database connection was out of scope.

## 7. Security Audit

Initial attempt used **OWASP Dependency-Check** (`org.owasp:dependency-check-maven`), the standard tool for Java CVE scanning:
```bash
mvn org.owasp:dependency-check-maven:9.2.0:check
```
This failed because the NVD (National Vulnerability Database) API now requires a registered API key for reliable access, and one wasn't available in this environment (`403` error fetching vulnerability data even after requesting a key).

**Fallback used:** Maven's `versions-maven-plugin`, which requires no external API:
```bash
mvn org.codehaus.mojo:versions-maven-plugin:2.16.2:display-dependency-updates
```
**Result:** identified `spring-boot-maven-plugin` has a newer version available (`3.3.1` → `4.1.0`).

**Note for future work:** OWASP Dependency-Check with a valid NVD API key would give proper CVE-level vulnerability matching (as was done for the Django app's `pip-audit` scan) and should be the standard tool in a real production pipeline.

## 8. Publish / Retrieve Simulation (Optional)

`mvn install` already "publishes" the artifact to the local Maven repository:
```bash
find ~/.m2/repository/com/devops -type f
```
Confirmed: `devops-springboot-app-1.0.0.jar` and its `.pom` present.

Simulated a downstream consumer retrieving it via a separate, unrelated Maven project:
```bash
mkdir consumer-test-spring && cd consumer-test-spring
# pom.xml declares com.devops:devops-springboot-app:1.0.0 as a dependency
mvn dependency:resolve
```
**Result: BUILD SUCCESS** — the consumer project resolved the packaged JAR and all its transitive dependencies purely from the local repository, exactly as it would from a real remote repository (Nexus/Artifactory).

## Screenshots / Logs

See terminal logs for:
- `mvn install` output (Tasks 1, 2, 5) — showing BUILD SUCCESS and test results
- Dev server startup + curl output (Task 6)
- Staging profile activation log (Task 6)
- `versions-maven-plugin` output (Task 7)
- Consumer project `mvn dependency:resolve` output (Task 8)
