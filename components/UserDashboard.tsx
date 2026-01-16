import React, { useState } from 'react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Clock, Trophy, ExternalLink, Users, Coins, AlertCircle, ArrowDownLeft, Wallet, CheckCircle2, Activity } from 'lucide-react';
import { MOCK_GROUPS, MOCK_USERS } from '../constants';
import { Web3Service } from '../services/web3Service';
import { SocialFeatures } from './SocialFeatures';
import { ArisanGroup, UserRole } from '../types';
import { showSuccessToast } from './ToastCards';
import { PageTransition } from './PageTransition';
import { SupabaseService, UserProfile } from '../services/supabaseService';

interface UserDashboardProps {
    userRole?: UserRole;
    listArisans?: ArisanGroup[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ userRole, listArisans = [] }) => {
    const { address, isConnected } = useWeb3ModalAccount();

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const activeGroup = listArisans.find(g => g.id === selectedGroupId) || listArisans[0] || null;

    const [loading, setLoading] = useState(false);
    const [pendingPrize, setPendingPrize] = useState<string>('0');
    const [usdtBalance, setUsdtBalance] = useState<string>('---');
    const [loadingClaim, setLoadingClaim] = useState(false);
    const [historyLogs, setHistoryLogs] = useState<any[]>([]);

    // Supabase State
    const [supabaseGroups, setSupabaseGroups] = useState<any[]>([]);
    const [participatingGroups, setParticipatingGroups] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Fetch USDT Balance
    React.useEffect(() => {
        const fetchBalance = async () => {
            if (isConnected && address) {
                const balance = await Web3Service.getUSDTBalance(address);
                const formatted = parseFloat(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                setUsdtBalance(formatted);
            }
        };
        fetchBalance();
        const interval = setInterval(fetchBalance, 15000);
        return () => clearInterval(interval);
    }, [isConnected, address]);

    // Fetch Pending Prize
    React.useEffect(() => {
        const checkPrize = async () => {
            if (isConnected && address && activeGroup) {
                const prize = await Web3Service.checkPendingPrize(activeGroup.id, address);
                setPendingPrize(prize);
            }
        };
        checkPrize();
        const interval = setInterval(checkPrize, 10000);
        return () => clearInterval(interval);
    }, [isConnected, address, activeGroup]);

    // Fetch Supabase Profile
    React.useEffect(() => {
        const fetchProfile = async () => {
            if (address) {
                const profile = await SupabaseService.getUserProfile(address);
                setUserProfile(profile);
            }
        };
        fetchProfile();
    }, [address]);

    // Fetch History Logs
    React.useEffect(() => {
        const fetchHistory = async () => {
            if (activeGroup?.id) {
                const logs = await Web3Service.getArisanHistory(activeGroup.id);
                setHistoryLogs(logs);
            }
        };
        fetchHistory();
        const interval = setInterval(fetchHistory, 15000);
        return () => clearInterval(interval);
    }, [activeGroup]);

    // Fetch User's Created Groups AND Participating Groups from Supabase
    React.useEffect(() => {
        const fetchUserGroups = async () => {
            if (address) {
                const created = await SupabaseService.getUserCreatedGroups(address);
                setSupabaseGroups(created);

                const participating = await SupabaseService.getUserParticipatingGroups(address);
                setParticipatingGroups(participating);
            }
        };
        fetchUserGroups();
        const interval = setInterval(fetchUserGroups, 5000);
        return () => clearInterval(interval);
    }, [address]);

    // --- Derived State for Stats ---
    // Merge Blockchain List (listArisans) with Supabase List (supabaseGroups & participatingGroups)
    const joinedGroups = React.useMemo(() => {
        const map = new Map();

        // 1. Add Blockchain groups where user is participant
        listArisans.forEach(g => {
            if (g.participants.some(p => p.walletAddress === address)) {
                map.set(g.id.toLowerCase(), g);
            }
        });

        const mergeSupabaseGroup = (g: any, isCreator: boolean) => {
            const id = (g.contract_address || g.id).toLowerCase();
            if (!map.has(id)) {
                map.set(id, {
                    id: g.contract_address || g.id,
                    name: g.name,
                    description: g.description,
                    currency: 'USDT',
                    entryFee: g.entry_fee || '0',
                    amountPerCycle: g.entry_fee || '0',
                    maxParticipants: g.max_participants || 10,
                    cyclePeriod: g.duration || 'Weekly',
                    poolBalance: '0',
                    participants: [{ walletAddress: address, hasWon: false }],
                    status: g.status,
                    currentCycle: 1,
                    isCreator: isCreator
                });
            }
        };

        // 2. Add User Created Groups
        supabaseGroups.forEach(g => mergeSupabaseGroup(g, true));

        // 3. Add Participating Groups
        participatingGroups.forEach(g => mergeSupabaseGroup(g, false));

        return Array.from(map.values());
    }, [listArisans, supabaseGroups, participatingGroups, address]);

    const activeArisanCount = joinedGroups.length;

    const totalDisimpan = historyLogs
        .filter(log => log.type === 'JOINED' && log.participant === address)
        .reduce((acc, log) => acc + (parseFloat(log.amount) || 0), 0);

    const totalKemenangan = historyLogs
        .filter(log => log.type === 'WINNER' && log.participant === address)
        .reduce((acc, log) => acc + (parseFloat(log.amount) || 0), 0);

    const pembayaranBerikutnya = joinedGroups.reduce((acc: any, g: any) => acc + (parseFloat(g.amountPerCycle) || 0), 0);

    const handleClaim = async () => {
        if (!activeGroup) return;
        setLoadingClaim(true);
        const success = await Web3Service.claimPrize(activeGroup.id);
        if (success) {
            showSuccessToast("Reward Claimed!", "Funds have been sent to your wallet.");
            setPendingPrize('0');
        }
        setLoadingClaim(false);
    };

    return (
        <PageTransition>
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Selamat Datang, <span className="text-lisk-600">{userProfile?.username || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'User')}</span>
                        </h1>
                        <p className="text-gray-500 mt-1">Berikut adalah ringkasan keuangan Anda.</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 divide-x divide-gray-100">
                        <div className="px-2 text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">SKOR KEPERCAYAAN</p>
                            <div className="flex items-center justify-center gap-1 text-lisk-600 font-bold text-lg">
                                <ShieldCheck size={18} /> 850
                            </div>
                        </div>
                        <div className="px-4 text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">KEKAYAAN BERSIH</p>
                            <p className="font-bold text-gray-900 text-lg">{(totalDisimpan + totalKemenangan).toFixed(2)} USDT</p>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Grid (4 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Disimpan */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Wallet size={24} />
                            </div>
                            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Total Disimpan</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalDisimpan.toFixed(2)} USDT</h3>
                    </div>

                    {/* Arisan Aktif */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                <Activity size={24} />
                            </div>
                            <span className="text-gray-400 text-xs font-medium">Aktif</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Arisan Aktif</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{activeArisanCount} Kelompok</h3>
                    </div>

                    {/* Total Kemenangan */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                                <Trophy size={24} />
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Total Kemenangan</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalKemenangan.toFixed(2)} USDT</h3>
                    </div>

                    {/* Pembayaran Berikutnya */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                                <Clock size={24} />
                            </div>
                            <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-full">Tempo 2 hari</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Pembayaran Berikutnya</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{pembayaranBerikutnya.toFixed(2)} USDT</h3>
                    </div>
                </div>

                {/* 3. Main Content Split View */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Arisan Aktif Anda */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Arisan Aktif Anda</h3>
                            <button className="text-sm font-bold text-lisk-600 hover:text-lisk-700">Lihat Semua</button>
                        </div>

                        {joinedGroups.length > 0 ? (
                            <div className="space-y-4">
                                {joinedGroups.map((group: any) => {
                                    const userParticipant = group.participants.find((p: any) => p.walletAddress === address);
                                    const hasWon = userParticipant?.hasWon;

                                    return (
                                        <div key={group.id} className="bg-white p-5 rounded-3xl border border-gray-100 hover:border-gray-200 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                                                    {['💰', '💎', '🚀', '🌟'][parseInt(group.id) % 4] || '💰'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{group.name}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {group.cyclePeriod}</span>
                                                        <span className="flex items-center gap-1"><Users size={12} /> Pool: {group.poolBalance}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Contribution</p>
                                                <p className="text-lg font-bold text-lisk-600">{group.amountPerCycle} {group.currency}</p>
                                                <div className="mt-2 text-xs">
                                                    {hasWon ? (
                                                        <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full font-bold">Winner 🏆</span>
                                                    ) : (
                                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full font-bold">Active</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <AlertCircle size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Belum ada Arisan Aktif</h4>
                                <p className="text-gray-500 mt-2 mb-6 text-sm">Anda belum bergabung dengan kelompok arisan manapun.</p>
                                <a href="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
                                    Explore Arisan
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Aktivitas Terkini (Timeline) */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Aktivitas Terkini</h3>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 h-fit">
                            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                {historyLogs.length > 0 ? historyLogs.slice(0, 5).map((log, index) => (
                                    <div key={index} className="relative pl-10">
                                        <div className={`absolute left-[13px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 
                                            ${log.type === 'WINNER' ? 'bg-yellow-500' :
                                                log.type === 'CLAIMED' ? 'bg-green-500' : 'bg-blue-500'}`}
                                        />

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {log.type === 'WINNER' ? 'Menang Arisan' :
                                                        log.type === 'CLAIMED' ? 'Claim Reward' : 'Bayar Iuran'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {log.type === 'WINNER' ? '1 day ago • Completed' :
                                                        '2 hours ago • Completed'}
                                                </p>
                                            </div>
                                            <p className={`text-sm font-bold 
                                                ${log.type === 'WINNER' || log.type === 'CLAIMED' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {log.type === 'WINNER' || log.type === 'CLAIMED' ? '+' : '-'}{log.amount} USDT
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-400 text-sm py-4">Belum ada aktivitas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
