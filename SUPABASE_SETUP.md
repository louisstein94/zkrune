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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For ceremony zkey uploads
```

> **Note**: Get the Service Role key from **Settings > API > service_role key**

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

## 5. Setup Ceremony Storage (for Trusted Setup)

The trusted setup ceremony uses Supabase Storage to share zkey files between contributors.

### Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Name: `ceremony-zkeys`
4. Set to **Public** (for read access) or configure RLS
5. Click **Create**

### Configure Bucket Policies

Go to **Storage > Policies** and add:

```sql
-- Allow public read access
CREATE POLICY "Public read ceremony zkeys"
ON storage.objects FOR SELECT
USING (bucket_id = 'ceremony-zkeys');

-- Allow authenticated uploads (or service role only)
CREATE POLICY "Service role upload ceremony zkeys"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ceremony-zkeys');
```

### Initialize Ceremony

After setup, the admin runs:

```bash
# 1. Initialize locally (creates _0000 zkeys)
./scripts/ceremony.sh init

# 2. Upload to server
./scripts/ceremony.sh upload-init
```

### For Contributors

Contributors can now participate without cloning the repo:

```bash
# Clone and contribute
git clone https://github.com/louisstein94/zkrune.git
cd zkrune
./scripts/ceremony.sh contribute-remote "Your Name"
```

This downloads zkeys from server, adds contribution, and uploads back.

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
| `/api/ceremony` | GET, POST | Ceremony contributions |
| `/api/ceremony/zkey` | GET, POST | Download/upload zkeys |
| `/api/ceremony/status` | GET | Full ceremony status |
