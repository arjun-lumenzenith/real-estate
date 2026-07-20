# Quick Start: Database Seeding in 3 Steps

## ⚡ 30-Second Setup

### Step 1: Set Environment Variable
```bash
export DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname"
```

### Step 2: Run Seed Script
```bash
pnpm seed
```

### Step 3: Verify
```bash
# Open Neon console and run:
SELECT COUNT(*) as builders FROM builder;
SELECT COUNT(*) as properties FROM property;
```

**Expected output: 6 builders, 3 properties ✓**

---

## 📊 What Gets Inserted

### 6 Top Builders
- Prestige Group (60 projects)
- Brigade Group (250 projects) 
- Sobha Limited (100 projects)
- Godrej Properties (85 projects)
- Puravankara (60 projects)
- Embassy Group (45 projects)

### 3 Properties
- The Prestige City (Sarjapur Road) - 2, 3, 4 BHK
- Brigade Orchards (Devanahalli) - 1, 2, 3 BHK  
- Sobha City (Whitefield) - 2, 3, 4 BHK

---

## ✅ Verify It Works

After seeding, test the APIs:

```bash
# Test Builders API
curl http://localhost:3000/api/builders | jq '.data | length'
# Should return: 6

# Test Properties API
curl http://localhost:3000/api/properties | jq '.data | length'
# Should return: 3

# Check a specific builder
curl http://localhost:3000/api/builders | jq '.data[0]'
# Should show Prestige Group details
```

---

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| `Connection refused` | Check DATABASE_URL is set: `echo $DATABASE_URL` |
| `Module not found` | Install deps: `pnpm install` |
| `Unique constraint` | Data already exists (normal on re-run, gets skipped) |
| `ENOENT: no such file` | Run from project root: `cd /vercel/share/v0-project` |

---

## 📁 Files Used

- **Seed Script**: `/scripts/seed.js`
- **Server Action**: `/app/actions/seed.ts`  
- **Full Guide**: `/SEEDING_GUIDE.md`
- **Data Structure**: `/DATA_STRUCTURE.md`

---

## 🚀 Next Steps

1. ✓ Seed database: `pnpm seed`
2. ✓ Verify data in Neon console
3. ✓ Test APIs are returning real data
4. ✓ Deploy to production
5. ✓ Seed production database (same command)

---

**That's it! Your database is now populated with real builder and property data.**

For more details, see `SEEDING_GUIDE.md` or `DATA_STRUCTURE.md`
