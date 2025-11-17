#  Backend-Empfehlung für Casino Idle Slots

##  TLDR - Beste Lösung

**Supabase** - Kostenlos, einfach, perfekt für dein Spiel!

---

##  Vergleich der Optionen

### 1.  Supabase (EMPFOHLEN)

**Warum Supabase?**
-  **Komplett kostenlos** bis 500MB DB + 50k monatliche Nutzer
-  **PostgreSQL** - Echte relationale Datenbank
-  **GitHub OAuth** eingebaut
-  **Realtime Updates** - Leaderboard live!
-  **Row Level Security** - Automatischer Datenschutz
-  **React Integration** super einfach
-  **TypeScript Support** out of the box

**Free Tier:**
\\\
 500 MB Datenbank
 2 GB File Storage
 50.000 monatliche aktive User
 2 GB Bandwidth
 Unbegrenzte API Requests
\\\

**Perfekt für:**
- Multiplayer Features
- Leaderboards
- User Progress
- Achievements
- Social Features

**Setup Zeit:** ~2-3 Stunden
**Code Changes:** Mittel (nur persistence.ts + auth)

---

### 2.  Firebase (Google)

**Vorteile:**
-  Sehr bekannt & dokumentiert
-  Große Community
-  Realtime Database

**Nachteile:**
-  **Kompliziertes Preismodell**
-  NoSQL (schwieriger für Queries)
-  Vendor Lock-in (Google)
-  Auth UI nicht so gut

**Free Tier:**
\\\
 1 GB Storage
 10 GB Bandwidth/Monat
 50k reads/day
 20k writes/day
\\\

**Setup Zeit:** ~3-4 Stunden

---

### 3.  PocketBase (Self-Hosted)

**Vorteile:**
-  Komplett open source
-  Single binary (Go)
-  Kein Vendor Lock-in
-  Komplett kostenlos

**Nachteile:**
-  Musst du selbst hosten
-  Kein automatisches Scaling
-  Mehr Wartungsaufwand

**Kosten:**
\\\
Server: ~\-10/Monat (Hetzner, DigitalOcean)
\\\

**Setup Zeit:** ~4-6 Stunden

---

### 4.  localStorage only

**Vorteile:**
-  Kostenlos
-  Keine Abhängigkeiten
-  Keine Server

**Nachteile:**
-  Kein Leaderboard
-  Kein Cloud-Sync
-  Keine Multiplayer Features
-  Daten gehen bei Cache-Clear verloren

**Setup Zeit:** ~1 Stunde (Spark entfernen)

---

##  Empfehlung: Supabase

### Warum?

1. **Kostenlos & Skalierbar**
   - Free Tier reicht für 50k Nutzer/Monat
   - Automatisches Scaling

2. **Perfekt für Games**
   - Realtime Leaderboards
   - User Auth eingebaut
   - Schnelle Queries

3. **Developer Experience**
   - React SDK super einfach
   - TypeScript Support
   - Gute Docs

4. **Custom Domain funktioniert**
   - Keine Einschränkungen wie bei GitHub Spark
   - Läuft auf maximilianhaak.de

---

##  Migration zu Supabase - Schritt für Schritt

### Phase 1: Setup (30 Min)

\\\ash
# 1. Supabase Account erstellen
https://supabase.com

# 2. Neues Project erstellen
Name: casino-idle-slots
Region: Frankfurt (EU)

# 3. Dependencies installieren
npm install @supabase/supabase-js
\\\

### Phase 2: Database Schema (30 Min)

\\\sql
-- users table (auto-created by Auth)
-- Supabase Auth kümmert sich um user management

-- game_states table
CREATE TABLE game_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  coins BIGINT DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience BIGINT DEFAULT 0,
  prestige_points INTEGER DEFAULT 0,
  
  -- Slot machines
  slots_unlocked JSONB DEFAULT '[]',
  
  -- Upgrades
  upgrades JSONB DEFAULT '{}',
  
  -- Achievements
  achievements JSONB DEFAULT '[]',
  
  -- Statistics
  statistics JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- leaderboard view
CREATE VIEW leaderboard AS
SELECT 
  u.id,
  u.raw_user_meta_data->>'name' as username,
  u.raw_user_meta_data->>'avatar_url' as avatar,
  gs.coins,
  gs.level,
  gs.prestige_points,
  gs.updated_at
FROM auth.users u
JOIN game_states gs ON u.id = gs.user_id
ORDER BY gs.coins DESC
LIMIT 100;

-- Row Level Security
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY \"Users can read own game state\"
  ON game_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY \"Users can update own game state\"
  ON game_states FOR UPDATE
  USING (auth.uid() = user_id);
\\\

### Phase 3: Code Migration (1-2 Std)

\\\	ypescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// src/lib/persistence.ts - NEU
export class SupabasePersistence {
  async save(gameState: GameState) {
    const { data, error } = await supabase
      .from('game_states')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...gameState,
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
    return data
  }
  
  async load(): Promise<GameState | null> {
    const { data, error } = await supabase
      .from('game_states')
      .select('*')
      .single()
    
    if (error) return null
    return data
  }
}

// src/lib/auth.ts - NEU
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin + '/CasinoIdleSlots/'
    }
  })
  return { data, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export function onAuthChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}
\\\

### Phase 4: Leaderboard (30 Min)

\\\	ypescript
// src/lib/leaderboard.ts
export async function getLeaderboard(category: LeaderboardCategory) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order(category, { ascending: false })
    .limit(100)
  
  if (error) throw error
  return data
}

// Realtime Updates!
export function subscribeToLeaderboard(callback: (data: any) => void) {
  return supabase
    .channel('leaderboard')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'game_states'
    }, callback)
    .subscribe()
}
\\\

### Phase 5: Environment Variables

\\\env
# .env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
\\\

### Phase 6: GitHub OAuth Setup (15 Min)

1. GitHub OAuth App erstellen
2. Callback URL: \https://xxxxx.supabase.co/auth/v1/callback\
3. Client ID & Secret in Supabase eintragen

---

##  Kosten-Rechnung

### Supabase Free Tier Limits:

\\\
50.000 Nutzer/Monat
= ~1.666 Nutzer/Tag
= ~69 Nutzer/Stunde

Realistische Einschätzung:
- Phase 1 (Monat 1-3): ~10-100 Nutzer  Free Tier 
- Phase 2 (Monat 4-12): ~100-1000 Nutzer  Free Tier 
- Phase 3 (Jahr 2+): 1000-10000 Nutzer  Free Tier 

Wenn du >50k Nutzer/Monat erreichst:
 Pro Plan: \/Monat
 Das wäre ein Erfolg! 
\\\

---

##  Zeit-Investment

\\\markdown
Setup Phase 1:        30 Min  (Account, Project)
Database Schema:      30 Min  (SQL Tables)
Code Migration:     2 Std    (persistence.ts, auth.ts)
Leaderboard:        30 Min  (queries, realtime)
Testing:          1 Std    (E2E Tests)
Deployment:         30 Min  (Env vars, deploy)
-------------------------------------------
TOTAL:            ~5 Stunden
\\\

**Aber:** Es lohnt sich! Du bekommst:
-  Professionelles Backend
-  Echte Multiplayer Features
-  Kein Vendor Lock-in (PostgreSQL)
-  Skaliert automatisch

---

##  Nächste Schritte

\\\markdown
1. [ ] Supabase Account erstellen
2. [ ] Project anlegen (casino-idle-slots)
3. [ ] GitHub OAuth App erstellen
4. [ ] Database Schema deployen
5. [ ] Dependencies installieren
6. [ ] Code migrieren (persistence + auth)
7. [ ] Environment Variables setzen
8. [ ] Local testen
9. [ ] Deploy & testen auf Production
10. [ ] GitHub Spark Dependencies entfernen
\\\

---

##  FAQ

**Q: Ist Supabase wirklich kostenlos?**
A: Ja! Bis 50k monatliche Nutzer komplett kostenlos.

**Q: Was wenn ich die Limits überschreite?**
A: Dann zahlst du \/Monat. Aber das heißt du hast Erfolg! 

**Q: Kann ich später wechseln?**
A: Ja! PostgreSQL ist Standard, du kannst jederzeit exportieren.

**Q: Ist das sicher?**
A: Ja! Row Level Security schützt User-Daten automatisch.

**Q: Wie schnell ist es?**
A: Sehr schnell! Edge Functions weltweit verteilt.

---

**Soll ich mit der Migration starten?** 
