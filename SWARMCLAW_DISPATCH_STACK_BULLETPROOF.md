# DISPATCH: Stack Bulletproofing — SwarmClaw + robby-telegram + DeepSeek Lock
Date: 2026-06-19
Priority: HIGH
Assigned to: ARCHITECT, BACKEND, SECURITY, OBSERVE

---

## CONTEXT

The following has already been completed externally:
- ecosystem.config.cjs updated: robby-telegram added as PM2 app with correct cwd
- pm2 reload + pm2 save executed: both processes persisted
- DeepSeek migration confirmed: all 36 agents in DB are provider=deepseek
- robby-telegram swarmclaw.js: https bug fixed (http vs https transport now dynamic)
- ALLOWED_CHAT_ID: 8876949268 confirmed and written to .env

One action pending (requires user sudo — Claude cannot execute):
- `sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup launchd -u rorysemeah --hp /Users/rorysemeah`
- This registers PM2 with launchd so SwarmClaw + robby-telegram auto-start on Mac login

---

## MISSION

Audit and harden the following. Execute all fixes. Report what was found and what was changed.

---

### TASK 1 — ARCHITECT: Verify ecosystem.config.cjs is correct

File: `/Users/rorysemeah/swarmclaw/ecosystem.config.cjs`

Confirm:
- swarmclaw entry uses sc-safe-start.sh (not npm run dev)
- robby-telegram entry has correct cwd: `/Users/rorysemeah/Documents/Claude/Projects/RedLantern Studios/robby-telegram`
- robby-telegram interpreter is `node`
- Both have max_memory_restart and restart_delay set
- No typos or path errors

If anything is wrong: fix it directly.

---

### TASK 2 — BACKEND: Lock DeepSeek as default provider in SwarmClaw DB

File: `/Users/rorysemeah/swarmclaw/data/swarmclaw.db`

Step 1: Run this audit:
```python
import sqlite3, json
con = sqlite3.connect('/Users/rorysemeah/swarmclaw/data/swarmclaw.db')
cur = con.cursor()
rows = cur.execute('SELECT id, data FROM agents').fetchall()
from collections import Counter
providers = Counter()
models = Counter()
for aid, data_raw in rows:
    try:
        d = json.loads(data_raw)
        providers[d.get('provider','none')] += 1
        models[d.get('model','none')] += 1
    except: pass
print('Providers:', dict(providers))
print('Models:', dict(models))
con.close()
```

Step 2: Check if SwarmClaw has a settings/config table with a default_model or default_provider field:
```python
import sqlite3
con = sqlite3.connect('/Users/rorysemeah/swarmclaw/data/swarmclaw.db')
cur = con.cursor()
tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print('Tables:', [t[0] for t in tables])
# Check for settings/config
for t in [t[0] for t in tables]:
    if any(k in t.lower() for k in ['setting', 'config', 'default', 'provider']):
        print(f'  {t}:', cur.execute(f'SELECT * FROM {t} LIMIT 10').fetchall())
con.close()
```

Step 3: If a default provider/model field exists, set it to deepseek / deepseek-chat.

Step 4: Check `/Users/rorysemeah/swarmclaw/src` for any hardcoded Groq model references:
```bash
grep -r "groq\|llama-4\|llama4" /Users/rorysemeah/swarmclaw/src --include="*.ts" --include="*.js" -l 2>/dev/null
```

Report every file that references Groq. Do not change source files — just report.

---

### TASK 3 — OBSERVE: Create sc-health.sh — combined stack health check

Create file: `/Users/rorysemeah/swarmclaw/sc-health.sh`

Content:
```bash
#!/bin/zsh
# sc-health.sh — Full stack health check
# Usage: bash ~/swarmclaw/sc-health.sh

echo "=== SwarmClaw Stack Health ==="
echo "$(date)"
echo ""

# PM2 status
echo "--- PM2 Processes ---"
pm2 list 2>&1
echo ""

# SwarmClaw API
echo "--- SwarmClaw API (localhost:3456) ---"
SC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Access-Key: f957751f5642361f37b3a51c4a27ba3c" http://localhost:3456/api/chats --max-time 3)
if [ "$SC_STATUS" = "200" ]; then
  echo "✅ SwarmClaw API: live ($SC_STATUS)"
else
  echo "❌ SwarmClaw API: offline (HTTP $SC_STATUS)"
fi
echo ""

# robby-telegram
echo "--- robby-telegram ---"
RT_PID=$(pm2 pid robby-telegram 2>/dev/null)
if [ -n "$RT_PID" ] && [ "$RT_PID" != "0" ]; then
  echo "✅ robby-telegram: PID $RT_PID"
else
  echo "❌ robby-telegram: not running"
fi
echo ""

# DeepSeek agent count
echo "--- Agent Routing ---"
python3 -c "
import sqlite3, json
from collections import Counter
con = sqlite3.connect('/Users/rorysemeah/swarmclaw/data/swarmclaw.db')
rows = con.cursor().execute('SELECT data FROM agents').fetchall()
providers = Counter(json.loads(r[0]).get('provider','none') for r in rows)
print('Providers:', dict(providers))
print('Total agents:', len(rows))
con.close()
" 2>/dev/null
echo ""

echo "=== Done ==="
```

Make it executable: `chmod +x /Users/rorysemeah/swarmclaw/sc-health.sh`

---

### TASK 4 — SECURITY: Audit robby-telegram .env for completeness

File: `/Users/rorysemeah/Documents/Claude/Projects/RedLantern Studios/robby-telegram/.env`

Confirm all required fields are set (not placeholder values):
- TELEGRAM_TOKEN — must be set, not empty
- ALLOWED_CHAT_ID — must be a number (8876949268)
- SWARMCLAW_URL — must be http://localhost:3456
- SWARMCLAW_API_KEY — must be set
- ROBBY_AGENT_ID — must be set
- TIMEZONE — must be set
- WEBHOOK_PORT — must be set

Report: PASS or FAIL per field. If any field is placeholder/missing, flag it.

---

### TASK 5 — BACKEND: Verify sc-restart.sh covers both processes

File: `/Users/rorysemeah/swarmclaw/sc-restart.sh`

Read the current sc-restart.sh. Confirm it:
1. Stops both swarmclaw AND robby-telegram via PM2
2. Clears the Turbopack cache (.next/dev)
3. Restarts via `pm2 start ecosystem.config.cjs`

If it only restarts SwarmClaw, update it to also restart robby-telegram.

---

## DELIVERABLE

After completing all tasks, post a brief status report:
- What was verified clean
- What was fixed and what was changed
- Any remaining gaps that require Ro's action (sudo, Railway deploy, etc.)

Keep the report ≤15 lines. No filler.
