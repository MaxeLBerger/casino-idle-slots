#  Deployment Guide

Dieses Projekt wird **automatisch** über das Portfolio-Repository deployed: [MaxeLBerger.github.io](https://github.com/MaxeLBerger/MaxeLBerger.github.io)

>  **WICHTIG**: Dieses Projekt deployed **NICHT direkt** zu GitHub Pages!  
> Es ist ein **Git Submodule** im Portfolio und wird dort gebaut und deployed.

##  Voraussetzungen

### 1. Portfolio Integration Setup
Siehe **[PORTFOLIO_INTEGRATION.md](./PORTFOLIO_INTEGRATION.md)** für die vollständige Anleitung!

**Kurzfassung:**
1. Personal Access Token (PAT) erstellen mit `repo` scope
2. Secret `PORTFOLIO_UPDATE_TOKEN` in diesem Repo hinzufügen
3. Push auf `main` triggert automatisch Portfolio-Update

##  Build-Konfiguration

### Base URL in vite.config.ts

Die Base-URL ist bereits korrekt konfiguriert für das Subdirectory:

\\\	ypescript
base: process.env.NODE_ENV === 'production' ? '/CasinoIdleSlots/' : '/'
\\\

### GitHub Actions Workflow

Die Deployment-Pipeline ist in `.github/workflows/update-portfolio.yml` definiert:

- **Trigger**: Push auf `main` Branch
- **Action**: Sendet `repository_dispatch` Event an Portfolio
- **Portfolio**: Updated Submodule, baut Projekt, deployed zu GitHub Pages

##  Deployment-Prozess

### So funktioniert das Deployment:

\\\
1. Du pushst zu casino-idle-slots/main
         
2. update-portfolio.yml triggert
         
3. Repository Dispatch Event  MaxeLBerger.github.io
         
4. Portfolio updated CasinoIdleSlots Submodule
         
5. Portfolio workflow baut ALLE Projekte (inkl. CasinoIdleSlots)
         
6. Deployment zu GitHub Pages
         
7. Live auf maximilianhaak.de/CasinoIdleSlots/ (~3 Minuten)
\\\

### Push und Deploy

\\\ash
git add .
git commit -m \"feat: neue Features\"
git push origin main
\\\

**Das war's!** Der Rest passiert automatisch.

##  Custom Domain Setup (maximilianhaak.de)

Die App läuft auf einer Custom Domain mit Path-basiertem Routing:

### Reverse Proxy Konfiguration

Auf deinem Server (maximilianhaak.de) muss ein Reverse Proxy konfiguriert sein:

**Nginx Beispiel:**
\\\
ginx
location /CasinoIdleSlots/ {
    proxy_pass https://maxeleberger.github.io/CasinoIdleSlots/;
    proxy_set_header Host maxeleberger.github.io;
    proxy_set_header X-Real-IP \;
}
\\\

**Apache Beispiel:**
\\\pache
<Location /CasinoIdleSlots/>
    ProxyPass https://maxeleberger.github.io/CasinoIdleSlots/
    ProxyPassReverse https://maxeleberger.github.io/CasinoIdleSlots/
</Location>
\\\

### Direct Access URLs

- **Via Custom Domain**: https://maximilianhaak.de/CasinoIdleSlots/
- **Direct GitHub Pages**: https://maxeleberger.github.io/CasinoIdleSlots/

##  Deployment Verification

Nach erfolgreichem Push:

### 1. Check This Repo's Actions
- Gehe zu: https://github.com/MaxeLBerger/casino-idle-slots/actions
- Workflow **Update Portfolio on Push** sollte grün sein 
- Dauer: ~10 Sekunden

### 2. Check Portfolio Actions
- Gehe zu: https://github.com/MaxeLBerger/MaxeLBerger.github.io/actions
- Workflow **Auto Update Submodules** sollte laufen
- Danach: **Deploy Portfolio** sollte laufen
- Gesamtdauer: ~3 Minuten

### 3. Verify Deployment
\\\ash
# Check if site is live
curl -I https://maxeleberger.github.io/CasinoIdleSlots/

# Should return: HTTP/2 200
\\\

### 4. Test in Browser
- Clear cache: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Visit: https://maximilianhaak.de/CasinoIdleSlots/
- Changes should be live in ~3 minutes

##  Troubleshooting

### Problem: Workflow fails with \"Resource not accessible\"
**Lösung**: Füge das `PORTFOLIO_UPDATE_TOKEN` Secret hinzu (siehe PORTFOLIO_INTEGRATION.md)

### Problem: Portfolio updated nicht
**Check:**
1. Ist der Token noch gültig?
2. Hat der Token `repo` scope?
3. Läuft der Workflow?  Check Actions Tab

### Problem: Build fails im Portfolio
**Check:**
1. Läuft `npm run build` lokal?
2. Sind alle Dependencies in `package.json`?
3. Check Portfolio Actions für Details

### Problem: Änderungen nicht sichtbar
**Lösungen:**
1. Hard Refresh: Ctrl+Shift+R
2. Clear Browser Cache
3. Check ob Submodule im Portfolio updated ist:
   \\\ash
   cd /path/to/MaxeLBerger.github.io
   git submodule status CasinoIdleSlots
   \\\
4. Check Reverse Proxy Logs auf deinem Server

### Problem: 404 Error auf Subdirectory
**Check:**
1. Ist `base: '/CasinoIdleSlots/'` in `vite.config.ts` gesetzt?
2. Buildet Vite mit korrekter base URL?
3. Sind Assets mit korrektem Pfad referenziert?

##  Monitoring

### GitHub Actions Status Badges

Portfolio Deployment:
\\\markdown
![Deploy Status](https://github.com/MaxeLBerger/MaxeLBerger.github.io/actions/workflows/deploy.yml/badge.svg)
\\\

### Deployment Logs

- **This Repo**: https://github.com/MaxeLBerger/casino-idle-slots/actions
- **Portfolio**: https://github.com/MaxeLBerger/MaxeLBerger.github.io/actions

##  Manual Update (Falls nötig)

Falls automatisches Update nicht funktioniert:

\\\ash
# Im Portfolio Repo
cd /path/to/MaxeLBerger.github.io

# Update Submodule
git submodule update --remote --merge CasinoIdleSlots

# Commit & Push
git add CasinoIdleSlots
git commit -m \"chore: manually update CasinoIdleSlots\"
git push origin main
\\\

##  Related Documentation

- **[PORTFOLIO_INTEGRATION.md](./PORTFOLIO_INTEGRATION.md)** - Setup-Anleitung
- **[README.md](./README.md)** - Projekt-Übersicht
- **[CODE_REVIEW.md](./CODE_REVIEW.md)** - Code-Review Ergebnisse
- [Portfolio Setup Guide](https://github.com/MaxeLBerger/MaxeLBerger.github.io/blob/main/COMPLETE_SETUP_GUIDE.md)
- [Automation Overview](https://github.com/MaxeLBerger/MaxeLBerger.github.io/blob/main/AUTOMATION_OVERVIEW.md)

---

**Current Status**:  **Setup Required**  
Add `PORTFOLIO_UPDATE_TOKEN` secret to enable automatic deployment!

See: [PORTFOLIO_INTEGRATION.md](./PORTFOLIO_INTEGRATION.md) for setup instructions.
