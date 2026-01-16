
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Users, Coins, Activity, Search, Trophy, ArrowRight, Wallet, Clock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArisanGroup, UserRole } from '../types';
import { CreateArisanModal } from './CreateArisanModal';
import { SupabaseService } from '../services/supabaseService';
import { Web3Service } from '../services/web3Service';

interface AdminDashboardProps {
    userRole: UserRole;
    allGroups: ArisanGroup[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole, allGroups }) => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [realtimeWinners, setRealtimeWinners] = useState<any[]>([]);
    const [realtimeGroups, setRealtimeGroups] = useState<any[]>([]); // State for groups fetched from Supabase

    // Combine Sources: Supabase (Fast/Index) + Blockchain (Rich Data)
    // We prioritize Supabase for existence (showing up fast), and Blockchain for balance/status if available.
    const mergedGroups = useMemo(() => {
        const map = new Map<string, ArisanGroup>();

        // 1. Add Blockchain groups first (rich data)
        allGroups.forEach(g => map.set(g.id.toLowerCase(), g));

        // 2. Add/Overlay Supabase groups (fast data)
        realtimeGroups.forEach(g => {
            const id = (g.contract_address || g.id).toLowerCase();
            const existing = map.get(id);
            if (!existing) {
                // New group found in Supabase not yet in Blockchain props!
                map.set(id, {
                    id: g.contract_address,
                    name: g.name,
                    description: g.description,
                    currency: 'USDT', // Default
                    entryFee: g.entry_fee || '0',
                    entryFeeWei: '0',
                    maxParticipants: g.max_participants || 10,
                    cyclePeriod: g.duration || 'Weekly',
                    poolBalance: '0', // Not synced yet
                    participants: [], // Not synced yet
                    status: g.status,
                    currentCycle: 1,
                    createdAt: new Date(g.created_at).toLocaleDateString()
                });
            } else {
                // If group exists, update its status from Supabase if available
                map.set(id, { ...existing, status: g.status });
            }
        });

        return Array.from(map.values());
    }, [allGroups, realtimeGroups]);

    // Filter groups based on search
    const filteredGroups = mergedGroups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Stats
    const totalGroups = mergedGroups.length;
    const totalVolume = mergedGroups.reduce((acc, g) => acc + parseFloat(g.poolBalance || '0'), 0);
    const totalUsers = new Set(mergedGroups.flatMap(g => g.participants ? g.participants.map(p => p.walletAddress) : [])).size;

    // Fetch Real-time Data from Supabase
    useEffect(() => {
        const fetchDashboardData = async () => {
            // 1. Fetch Recent Logs
            const winners = await SupabaseService.getRecentActivity();
            setRealtimeWinners(winners);

            // 2. Fetch Active Arisans (Sync with Supabase for speed)
            const groups = await SupabaseService.getAllArisanGroups();
            setRealtimeGroups(groups);
        };
        fetchDashboardData();

        // Poll every 3 seconds for fast updates
        const interval = setInterval(fetchDashboardData, 3000);
        return () => clearInterval(interval);
    }, []);


    if (userRole !== 'ADMIN') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <ShieldCheck size={64} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
                <p className="text-gray-500">You do not have permission to view this dashboard.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-10 space-y-10">
            <CreateArisanModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-500">Monitor platform activity, manage arisans, and track growth.</p>
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-lisk-600 hover:bg-lisk-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-lisk-200"
                >
                    <Plus size={20} /> Deploy New Arisan
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Groups</p>
                        <h3 className="text-3xl font-bold text-gray-900">{allGroups.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Active Participants</p>
                        <h3 className="text-3xl font-bold text-gray-900">{totalUsers}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
                        <Coins size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">TVL (Total Volume)</p>
                        <h3 className="text-3xl font-bold text-gray-900">{totalVolume.toLocaleString()} <span className="text-sm font-normal text-gray-400">USDT</span></h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Platform Fees</p>
                        <h3 className="text-3xl font-bold text-gray-900">0.00 <span className="text-sm font-normal text-gray-400">ETH</span></h3>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Active Arisans Tracker */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-lisk-500" /> Active Arisans Tracker
                        </h3>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search ID or Name..."
                                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lisk-100 w-64 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {filteredGroups.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No active arisans found.</p>
                        ) : (
                            filteredGroups.map((group: any, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-lisk-50 transition-colors cursor-pointer border border-transparent hover:border-lisk-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 text-lisk-600 font-bold shadow-sm">
                                            {group.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{group.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><Users size={12} /> {group.participants.length}/{group.maxParticipants} Members</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {group.status || 'Active'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">{group.poolBalance} USDT</div>
                                        <button onClick={() => navigate(`/arisan/${group.id}`)} className="text-xs text-lisk-600 font-bold hover:underline mt-1">Manage</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Winners Log */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-fit">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Winners Log</h3>
                        <button className="text-lisk-600 text-sm font-bold hover:text-lisk-700">View All</button>
                    </div>

                    <div className="space-y-4">
                        {realtimeWinners.length === 0 ? (
                            <p className="text-gray-400 text-center text-sm py-4">No winners recorded yet.</p>
                        ) : (
                            realtimeWinners.map((log: any, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                                        <Trophy size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-900 font-medium">
                                            <span className="font-bold text-lisk-600">{log.winner}</span> won
                                            <span className="font-bold text-gray-900 mx-1">{log.amount} USDT</span>
                                            in {log.groupName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">{log.date}</span>
                                            <a href={`https://sepolia-blockscout.lisk.com/tx/${log.txHash}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
                                                View Tx <Globe size={10} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
