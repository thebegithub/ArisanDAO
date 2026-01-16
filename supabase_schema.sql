
-- Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    wallet_address VARCHAR(42) PRIMARY KEY,
    username TEXT,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Winners Table
CREATE TABLE IF NOT EXISTS public.winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id VARCHAR(42) NOT NULL, -- Contract Address
    winner_address VARCHAR(42) NOT NULL,
    cycle_number INTEGER,
    prize_amount NUMERIC,
    won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tx_hash TEXT
);

-- Create Arisan Metadata Table (Optional, for richer display)
CREATE TABLE IF NOT EXISTS public.arisan_groups (
    contract_address VARCHAR(42) PRIMARY KEY,
    name TEXT,
    description TEXT,
    created_by VARCHAR(42),
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Participants Table (Real-time tracking of joins)
CREATE TABLE IF NOT EXISTS public.arisan_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id VARCHAR(42) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, WINNER
    UNIQUE(group_id, wallet_address)
);

-- Create RLS Policies (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arisan_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arisan_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read users
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid()::text = wallet_address); -- Note: This assumes you handle auth mapping, or use open policy for demo
-- SIMPLIFIED POLICY FOR DEMO (Anyone can insert/update if they have the key - strictly for prototype)
DROP POLICY IF EXISTS "Public update users" ON public.users;
CREATE POLICY "Public update users" ON public.users FOR ALL USING (true);

-- Policy: Winners public read
CREATE POLICY "Winners are viewable by everyone" 
ON public.winners FOR SELECT 
USING (true);

-- Policy: Winners insert (public for prototype, ideally admin only)
CREATE POLICY "Public insert winners" ON public.winners FOR INSERT WITH CHECK (true);

-- Policy: Participants public access (for demo)
CREATE POLICY "Public participation" ON public.arisan_participants FOR ALL USING (true);
