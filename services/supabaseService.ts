
import { supabase } from './supabaseClient';

export interface UserProfile {
    wallet_address: string;
    username: string;
    avatar_url: string;
    reputation_score: number;
}

export interface WinnerRecord {
    group_id: string;
    winner_address: string;
    cycle_number: number;
    prize_amount: string;
    tx_hash: string;
}

export const SupabaseService = {
    /**
     * Get user profile by wallet address
     */
    async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();

            if (error) {
                // If user not found, return null (don't log error as it's common for new users)
                if (error.code !== 'PGRST116') console.error('Error fetching user:', error);
                return null;
            }
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    /**
     * Create or Update User Profile
     */
    async upsertUser(profile: Partial<UserProfile> & { wallet_address: string }) {
        const { data, error } = await supabase
            .from('users')
            .upsert(
                {
                    wallet_address: profile.wallet_address,
                    username: profile.username || `User ${profile.wallet_address.slice(0, 6)}`,
                    avatar_url: profile.avatar_url,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'wallet_address' }
            )
            .select();

        if (error) console.error('Error upserting user:', error);
        return data;
    },

    /**
     * Record a winner when Admin calls Kocok
     */
    async recordWinner(record: WinnerRecord) {
        const { error } = await supabase
            .from('winners')
            .insert(record);

        if (error) console.error('Error recording winner:', error);
        return !error;
    },

    /**
     * Get Winners for a specific group (For "Siapa menang bulan apa")
     */
    async getGroupWinners(groupAddress: string) {
        const { data, error } = await supabase
            .from('winners')
            .select(`
                *,
                user:users(username, avatar_url)
            `)
            .eq('group_id', groupAddress)
            .order('cycle_number', { ascending: true });

        if (error) console.error('Error fetching winners:', error);
        return data || [];
    },

    /**
     * Get Global Stats for Admin
     */
    async getAdminStats() {
        const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: winnersCount } = await supabase.from('winners').select('*', { count: 'exact', head: true });

        // Sum prize amount (Postgres aggregation)
        // For simplicity in client-side prototype, fetching logic might be different or use RPC. 
        // We'll stick to counts for now.
        return {
            totalUsers: usersCount || 0,
            totalWinners: winnersCount || 0
        };
    },

    /**
     * Create Arisan Group Metadata
     */
    async createArisanGroup(group: {
        contract_address: string;
        name: string;
        description: string;
        created_by: string;
        entry_fee: string;
        max_participants: number;
        duration: string;
    }) {
        const { error } = await supabase
            .from('arisan_groups')
            .upsert({
                contract_address: group.contract_address,
                name: group.name,
                description: group.description,
                created_by: group.created_by,
                status: 'ACTIVE',
                created_at: new Date().toISOString()
            });

        if (error) console.error('Error creating arisan group in Supabase:', error);
        return !error;
    },

    /**
     * Get Recent Activity (Global Winners Log)
     */
    async getRecentActivity() {
        // Fetch winners joined with user info and group info (if possible, or just raw)
        // Since we don't have Arisan Group metadata table relation set up fully in code types yet,
        // we might join manually or just fetch winners.

        // Actually we do have 'arisan_groups' table now. 
        // Let's assuming FK relationship exists or we just fetch winners and users.
        const { data, error } = await supabase
            .from('winners')
            .select(`
                *,
                user:users(username, avatar_url),
                group:arisan_groups(name)
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error("Error fetching activity:", error);
            return [];
        }


        return data.map(record => ({
            groupName: record.group?.name || record.group_id.slice(0, 8) + '...',
            winner: record.user?.username || record.winner_address,
            amount: record.prize_amount,
            date: new Date(record.created_at).toLocaleDateString(),
            txHash: record.tx_hash
        }));
    },

    /**
     * Get All Arisan Groups (for Admin Dashboard)
     */
    async getAllArisanGroups() {
        const { data, error } = await supabase
            .from('arisan_groups')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching groups from Supabase:", error);
            return [];
        }
        return data;
    },

    /**
     * Get Arisan Groups created by a specific user (for User Dashboard)
     */
    async getUserCreatedGroups(walletAddress: string) {
        const { data, error } = await supabase
            .from('arisan_groups')
            .select('*')
            .eq('created_by', walletAddress)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching user groups:", error);
            return [];
        }
        return data;
    },

    /**
     * Join an Arisan Group (Sync from Blockchain)
     */
    async joinArisan(groupId: string, walletAddress: string) {
        const { error } = await supabase
            .from('arisan_participants')
            .upsert({
                group_id: groupId,
                wallet_address: walletAddress,
                joined_at: new Date().toISOString(),
                status: 'ACTIVE'
            }, { onConflict: 'group_id,wallet_address' });

        if (error) console.error("Error joining arisan in Supabase:", error);
        return !error;
    },

    /**
     * Get Arisan Groups where user is a participant
     */
    async getUserParticipatingGroups(walletAddress: string) {
        // Fetch group_ids first
        const { data: participations, error: partError } = await supabase
            .from('arisan_participants')
            .select('group_id')
            .eq('wallet_address', walletAddress);

        if (partError || !participations) return [];

        if (participations.length === 0) return [];

        const groupIds = participations.map(p => p.group_id);

        // Fetch Groups details
        const { data: groups, error: groupError } = await supabase
            .from('arisan_groups')
            .select('*')
            .in('contract_address', groupIds)
            .order('created_at', { ascending: false });

        if (groupError) return [];
        return groups;
    }
};
