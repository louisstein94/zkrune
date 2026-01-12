# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

## 2. Set Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Create Database Tables

Go to **SQL Editor** in Supabase Dashboard and run the SQL from:

```
lib/supabase/schema.sql
```

This will create:
- `proposals` - Governance proposals
- `votes` - Governance votes
- `marketplace_templates` - Marketplace templates
- `purchases` - Template purchases
- `staking_positions` - Staking positions
- `premium_status` - User premium tiers
- `burn_history` - Token burn records

## 4. Verify Setup

After running the schema:
1. Check **Table Editor** to see tables
2. Default proposals and templates should be seeded
3. Your app will now use live database instead of localStorage

## Fallback Mode

If Supabase is not configured, the app automatically falls back to mock data.
This allows development without a database connection.

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/governance/proposals` | GET, POST | Manage proposals |
| `/api/governance/votes` | GET, POST | Cast votes |
| `/api/marketplace/templates` | GET, POST | Marketplace templates |
| `/api/marketplace/purchases` | GET, POST | Template purchases |
| `/api/staking` | GET, POST, PATCH | Staking positions |
| `/api/premium` | GET, POST | Premium status & burns |
| `/api/premium/history` | GET | Burn history |
| `/api/token-stats` | GET | Live token data |
