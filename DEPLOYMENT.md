#  Deployment Guide

Dieses Dokument beschreibt den Deployment-Prozess für Casino Idle Slots auf \https://maximilianhaak.de/CasinoIdleSlots/\.

##  Voraussetzungen

### 1. Repository Setup
- Repository muss öffentlich sein oder GitHub Pages aktiviert haben
- Schreibrechte für das Repository

### 2. GitHub Pages Konfiguration
1. Gehe zu **Settings**  **Pages**
2. Unter **Source** wähle **GitHub Actions**
3. Das war's! Die Workflow-Datei übernimmt den Rest

##  Konfiguration

### Base URL in vite.config.ts

Die Base-URL ist bereits korrekt konfiguriert für das Subdirectory:

\\\	ypescript
base: process.env.NODE_ENV === 'production' ? '/CasinoIdleSlots/' : '/'
\\\

### GitHub Actions Workflow

Die Deployment-Pipeline ist in \.github/workflows/deploy.yml\ definiert:

- **Trigger:** Push auf \main\ Branch oder manuell
- **Build:** \
pm ci && npm run build\
- **Deploy:** Automatisches Deployment auf GitHub Pages

##  Deployment-Prozess

### Automatisches Deployment

Jeder Push auf den \main\ Branch triggert automatisch:

\\\ash
git add .
git commit -m "feat: neue Features"
git push origin main
\\\

Der Workflow wird automatisch ausgeführt und deployed nach ~2-3 Minuten.

### Manuelles Deployment

1. Gehe zu **Actions** Tab im Repository
2. Wähle **Deploy to GitHub Pages** Workflow
3. Klicke **Run workflow**  **Run workflow**

##  Custom Domain Setup (maximilianhaak.de)

Da die App auf einer Custom Domain läuft, sind zusätzliche DNS-Konfigurationen nötig:

### DNS Records

In deinem DNS-Provider (z.B. Cloudflare, Namecheap):

#### Option A: Subdomain Redirect

\\\
Type: CNAME
Name: casinoidleslots (oder beliebiger Subdomain)
Value: maximilianhaak.github.io
\\\

#### Option B: Path-basiertes Routing

Wenn \maximilianhaak.de\ bereits existiert und du \/CasinoIdleSlots/\ als Path nutzen willst:

1. Deploye auf GitHub Pages wie üblich
2. Setze einen Reverse Proxy oder Rewrite-Rule auf deinem Haupt-Server
3. Leite \/CasinoIdleSlots/*\ zu GitHub Pages um

### CNAME Datei

Wenn du eine Custom Domain direkt nutzen willst:

\\\ash
echo "maximilianhaak.de" > public/CNAME
\\\

Dann in \ite.config.ts\ die base URL anpassen:
\\\	ypescript
base: '/'  // Statt '/CasinoIdleSlots/'
\\\

##  Deployment Verification

Nach erfolgreichem Deployment:

1. **Check Workflow Status**
   - Gehe zu Actions Tab
   - Stelle sicher, dass der Workflow grün ist 

2. **Test Production URL**
   - Öffne: \https://maximilianhaak.de/CasinoIdleSlots/\
   - Verifiziere alle Features funktionieren

3. **Test GitHub Login**
   - Login mit GitHub Account
   - Verifiziere Cloud-Sync funktioniert

4. **Check Console**
   - Öffne Browser Dev Tools
   - Prüfe auf JavaScript-Fehler
   - Prüfe auf 404-Fehler bei Assets

##  Troubleshooting

### Problem: 404 bei Assets

**Ursache:** Base URL falsch konfiguriert

**Lösung:**
\\\	ypescript
// vite.config.ts
base: '/CasinoIdleSlots/'  // Mit trailing slash!
\\\

### Problem: Blank Page nach Deployment

**Ursache:** JavaScript nicht geladen

**Lösung:**
1. Check Browser Console für Fehler
2. Verifiziere \ase\ in vite.config.ts
3. Hard-Refresh mit Ctrl+Shift+R

### Problem: GitHub Login funktioniert nicht

**Ursache:** Callback URL nicht konfiguriert

**Lösung:**
1. Gehe zu GitHub App Settings
2. Füge Production URL zu allowed callbacks hinzu
3. Spark sollte dies automatisch handhaben

### Problem: Workflow schlägt fehl

**Ursache:** Build-Fehler oder fehlende Permissions

**Lösung:**
1. Check Workflow-Logs in Actions Tab
2. Stelle sicher Pages Permissions gesetzt sind
3. Verifiziere \package.json\ scripts

##  Monitoring & Analytics

### Performance Monitoring

Nutze Browser Dev Tools für Performance-Analyse:

\\\ash
npm run build
npm run preview
# Dann Lighthouse-Report in Chrome ausführen
\\\

### Error Tracking (Optional)

Für Production Error Tracking können Services wie Sentry integriert werden:

\\\	ypescript
// main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    environment: "production",
  });
}
\\\

##  Rollback-Strategie

Falls ein Deployment Probleme verursacht:

### Option 1: Git Revert

\\\ash
git revert HEAD
git push origin main
\\\

### Option 2: Manueller Rollback

1. Gehe zu vorheriger Commit
2. Erstelle neuen Branch
3. Force-push zu main (nicht empfohlen für Teams)

### Option 3: Actions Re-run

1. Gehe zu Actions Tab
2. Finde letzten erfolgreichen Workflow
3. Re-run den Workflow

##  Pre-Deployment Checklist

Vor jedem Production Deployment:

- [ ] Alle Tests lokal ausgeführt
- [ ] \
pm run build\ erfolgreich
- [ ] \
pm run preview\ getestet
- [ ] Keine Console Errors
- [ ] GitHub Login funktioniert lokal
- [ ] Performance akzeptabel (Lighthouse Score >90)
- [ ] Mobile Responsiveness geprüft
- [ ] Changelog aktualisiert
- [ ] Version in package.json erhöht

##  Deployment Environments

### Development
- **URL:** \http://localhost:5173\
- **Command:** \
pm run dev\
- **Features:** Hot Module Replacement, Source Maps

### Preview
- **URL:** \http://localhost:4173\
- **Command:** \
pm run preview\
- **Features:** Production Build lokal testen

### Production
- **URL:** \https://maximilianhaak.de/CasinoIdleSlots/\
- **Command:** Automatisch via GitHub Actions
- **Features:** Minifiziert, Tree-shaken, Optimiert

##  Best Practices

1. **Semantic Versioning** - Nutze Semantic Versioning für Releases
2. **Branch Protection** - Schütze main Branch, require Pull Requests
3. **Review Process** - Code-Review vor Merge zu main
4. **Staging Environment** - Teste auf Staging vor Production
5. **Monitoring** - Monitor Production für Fehler und Performance

---

Bei Fragen oder Problemen öffne ein Issue im Repository! 
