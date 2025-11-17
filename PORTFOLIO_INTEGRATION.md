#  Portfolio Integration Setup

This project is integrated as a **Git Submodule** into the main portfolio at [MaxeLBerger.github.io](https://github.com/MaxeLBerger/MaxeLBerger.github.io).

##  How It Works

When you push to main branch in this repo:

1. **Workflow triggers**  .github/workflows/update-portfolio.yml runs
2. **Repository dispatch**  Sends event to portfolio repo
3. **Portfolio updates**  Submodule reference updated to latest commit
4. **Build & Deploy**  Portfolio rebuilds with your latest changes
5. **Live in 3 minutes**  Changes appear at [maximilianhaak.de/CasinoIdleSlots](https://maximilianhaak.de/CasinoIdleSlots/)

##  Required Setup

### 1. Create Personal Access Token (PAT)

You need a GitHub Personal Access Token with epo scope:

1. Go to: https://github.com/settings/tokens/new
2. **Note**: Portfolio Update Token
3. **Expiration**: Choose appropriate expiration
4. **Scopes**: Select epo (full control of private repositories)
5. Click **Generate token**
6. **Copy the token** (you won't see it again!)

### 2. Add Secret to This Repository

1. Go to: https://github.com/MaxeLBerger/casino-idle-slots/settings/secrets/actions
2. Click **New repository secret**
3. **Name**: PORTFOLIO_UPDATE_TOKEN
4. **Value**: Paste your PAT from step 1
5. Click **Add secret**

### 3. Verify Integration

After adding the secret:

1. Make a small change (e.g., update README.md)
2. Commit and push to main
3. Check Actions: https://github.com/MaxeLBerger/casino-idle-slots/actions
4. Workflow should trigger successfully
5. Check portfolio Actions: https://github.com/MaxeLBerger/MaxeLBerger.github.io/actions
6. Portfolio should auto-update and redeploy
7. Visit https://maximilianhaak.de/CasinoIdleSlots/ in ~3 minutes

##  Deployment Architecture

\\\

                    MaxeLBerger.github.io                        
                     (Portfolio Repo)                            
                                                                 
              
    AgeOfMax/      FireCastle/    AuTuneOnline/         
   (Submodule)     (Submodule)     (Submodule)          
              
                                                                 
                 
        CasinoIdleSlots/ (Submodule)                        
      You are here!                                         
                 
                                                                 
  deploy.yml  Builds all projects  GitHub Pages               

                            
                   maximilianhaak.de
                (Reverse Proxy on your server)
                            
              /CasinoIdleSlots/  GitHub Pages
\\\

##  Build Configuration

This project builds with **Vite** and uses:

- **Base URL**: /CasinoIdleSlots/ (configured in ite.config.ts)
- **Build Command**: 
pm run build
- **Output Directory**: dist/
- **Minifier**: esbuild (fast, no extra dependencies)

The portfolio workflow:
1. Clones this repo as submodule
2. Runs 
pm ci to install dependencies
3. Runs 
pm run build with NODE_ENV=production
4. Copies dist/* to dist/CasinoIdleSlots/ in portfolio
5. Deploys to GitHub Pages

##  Troubleshooting

### Workflow fails with \"Resource not accessible\"
 Make sure you added the PORTFOLIO_UPDATE_TOKEN secret (see step 2 above)

### Portfolio doesn't update after push
 Check if the workflow ran: https://github.com/MaxeLBerger/casino-idle-slots/actions
 Check if token has epo scope and hasn't expired

### Build fails in portfolio
 Check portfolio Actions for error details
 Verify 
pm run build works locally
 Check if all dependencies are in package.json

### Changes don't appear on website
 Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
 Check if correct submodule version is deployed
 Verify reverse proxy configuration on your server

##  Related Documentation

- [Portfolio Setup Guide](https://github.com/MaxeLBerger/MaxeLBerger.github.io/blob/main/COMPLETE_SETUP_GUIDE.md)
- [Project Repos Setup](https://github.com/MaxeLBerger/MaxeLBerger.github.io/blob/main/PROJECT_REPOS_SETUP.md)
- [Automation Overview](https://github.com/MaxeLBerger/MaxeLBerger.github.io/blob/main/AUTOMATION_OVERVIEW.md)

##  Best Practices

1. **Always test locally** before pushing: 
pm run build
2. **Keep dependencies updated**: Regular 
pm update
3. **Use semantic commits**: e.g., eat:, ix:, docs:
4. **Test on different screen sizes** before deploying
5. **Check GitHub Actions** after each push to verify deployment

---

**Status**:  **Setup Required** - Add PORTFOLIO_UPDATE_TOKEN secret to enable automatic deployment!
