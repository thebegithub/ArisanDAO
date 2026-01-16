import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { Navbar } from './components/Navbar';
import { ArisanCard } from './components/ArisanCard';
import { MOCK_GROUPS, MOCK_USERS } from './constants';
import { ArisanGroup } from './types';
import { Web3Service } from './services/web3Service';
import { SupabaseService } from './services/supabaseService';
import { ARISAN_ABI } from './contracts/abis';
import { Plus, Search, ShieldCheck, Zap, Globe, Coins, Lock, PlayCircle, Trophy, Loader2, CheckCircle2, Clock, Users } from 'lucide-react';
import { UserDashboard } from './components/UserDashboard';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { CreateArisanModal } from './components/CreateArisanModal';

import { CreateArisan } from './components/CreateArisan';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { UserRole } from './types';
import { ethers } from 'ethers';
import { Toaster } from 'react-hot-toast';
import { showSuccessToast, showWinnerToast } from './components/ToastCards';
import { PageTransition } from './components/PageTransition';

// --- Page Components defined inline ---

const Dashboard: React.FC<{ userRole: UserRole; activeGroups: ArisanGroup[]; loadingGroups: boolean }> = ({ userRole, activeGroups, loadingGroups }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('explore');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    return (

        <div className="min-h-screen pb-20 relative z-10">
            {/* Create Arisan Modal */}
            <CreateArisanModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-gray-200/50 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lisk-50 border border-lisk-100 text-lisk-600 text-xs font-bold uppercase tracking-wide mb-6">
                                <ShieldCheck size={14} />
                                Trusted by 10k+ Communities
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                                Saving Together, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lisk-500 to-blue-700">
                                    Trustless & Fair.
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                                Replace traditional ROSCA books with Smart Contracts. No more running away with funds.
                                Automated lottery, instant payouts, and on-chain reputation.
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-gray-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                                >
                                    Start Saving
                                </button>
                                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-gray-600 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                                    <PlayCircle size={20} /> How it works
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div
                                    initial={{ y: 32, opacity: 0 }}
                                    animate={{ y: 32, opacity: 1 }}
                                    whileHover={{ y: 20, scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <Globe className="w-10 h-10 text-lisk-500 mb-4" />
                                    <h3 className="font-bold text-xl mb-1">Global Access</h3>
                                    <p className="text-sm text-gray-500">Join saving circles from anywhere in the world.</p>
                                </motion.div>
                                <motion.div
                                    initial={{ y: 0, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    whileHover={{ y: -12, scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                    transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <Lock className="w-10 h-10 text-lisk-500 mb-4" />
                                    <h3 className="font-bold text-xl mb-1">Secure Funds</h3>
                                    <p className="text-sm text-gray-500">Funds locked in Smart Contracts until distribution.</p>
                                </motion.div>
                                <motion.div
                                    initial={{ y: 32, opacity: 0 }}
                                    animate={{ y: 32, opacity: 1 }}
                                    whileHover={{ y: 20, scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                    transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                                >
                                    <Zap className="w-10 h-10 text-lisk-500 mb-4" />
                                    <h3 className="font-bold text-xl mb-1">Instant Payout</h3>
                                    <p className="text-sm text-gray-500">Winners receive funds directly to their wallet.</p>
                                </motion.div>
                                <motion.div
                                    initial={{ y: 0, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    whileHover={{ y: -12, scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                    transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center"
                                >
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-gray-900">$2.4M</p>
                                        <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Total Value Locked</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Listings Section */}
            <section id="listings" className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Active Arisans</h2>
                        <p className="text-gray-500">Join an existing circle or create your own community.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                        {['Explore', 'My Arisan', 'Completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.toLowerCase()
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter/Search Bar */}
                <div className="flex gap-4 mb-8">
                    {/* ... search input ... */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, currency, or pool size..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lisk-500 focus:border-transparent transition-all"
                        />
                    </div>
                    {userRole === 'ADMIN' && (
                        <button
                            onClick={() => navigate('/create')}
                            className="bg-lisk-600 hover:bg-lisk-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-lisk-200"
                        >
                            <Plus size={20} /> Create New
                        </button>
                    )}
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loadingGroups ? (
                        <div className="col-span-full py-20 flex justify-center text-gray-900 font-bold text-xl">
                            <Loader2 className="animate-spin mr-2" /> Loading Arisans from Blockchain...
                        </div>
                    ) : activeGroups.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 mb-2">No active Arisans found.</p>
                            {userRole === 'ADMIN' && (
                                <p className="text-sm text-gray-400">Be the first to create one!</p>
                            )}
                        </div>
                    ) : (
                        activeGroups.map((group) => (
                            <ArisanCard key={group.id} group={group} onClick={(id) => navigate(`/arisan/${id}`)} />
                        ))
                    )}
                </div>
            </section>
        </div>

    );
};

const ArisanDetail: React.FC<{ userRole: UserRole; activeGroups: ArisanGroup[]; loadingGroups: boolean }> = ({ userRole, activeGroups, loadingGroups }) => {
    const { id } = useParams();
    // Find group in activeGroups (from blockchain) instead of mocks
    const group = activeGroups.find(g => g.id === id); // Remove state wrapper, derive directly
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);

    // AppKit Hooks for interaction
    const { address, isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();

    if (loadingGroups) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p>Loading Arisan Details...</p>
            </div>
        );
    }

    if (!group) return <div className="p-20 text-center font-bold text-red-500">Arisan Not Found (ID: {id})</div>;

    const handleDeposit = async () => {
        if (!isConnected) return alert("Please connect wallet first!"); // Keep simple alert for pre-check or use toast.error

        setLoadingAction('deposit');
        // Example interaction with Provider
        if (walletProvider) {
            const provider = new ethers.BrowserProvider(walletProvider);
            const signer = await provider.getSigner();
            console.log("Signer:", signer);
        }

        const success = await Web3Service.depositFunds(group.id); // Web3Service returns boolean now
        setLoadingAction(null);
        if (success) {
            // Retrieve address from hook or use default if available, though isConnected check implies address is present
            if (address) {
                await SupabaseService.joinArisan(group.id, address);
            }
            showSuccessToast("Deposit Successful", "Funds locked in Smart Contract.");
        }
    };

    const handleKocok = async () => {
        setLoadingAction('kocok');
        const txReceipt = await Web3Service.pickWinner(group.id);

        let winnerAddress = null;
        if (txReceipt && txReceipt.logs) {
            try {
                const iface = new ethers.Interface(ARISAN_ABI);
                for (const log of txReceipt.logs) {
                    try {
                        const parsed = iface.parseLog({ topics: Array.from(log.topics), data: log.data });
                        if (parsed && parsed.name === 'WinnerPicked') {
                            winnerAddress = parsed.args[0];
                            const amount = ethers.formatUnits(parsed.args[1], 18);

                            // SYNC TO SUPABASE
                            console.log("Syncing Winner to Supabase:", winnerAddress);
                            await SupabaseService.recordWinner({
                                group_id: group.id,
                                winner_address: winnerAddress,
                                cycle_number: group.currentCycle,
                                prize_amount: amount,
                                tx_hash: txReceipt.hash
                            });
                            break;
                        }
                    } catch (e) { }
                }
            } catch (e) { console.error("Parse Log Error", e); }
        }

        setLoadingAction(null);
        if (winnerAddress) {
            setWinner(winnerAddress);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            showWinnerToast(winnerAddress, "Prize Distributed!");
        } else if (txReceipt) {
            // Fallback if logs parsing failed but receipt exists (unlikely if successful)
            showSuccessToast("Winner Picked", "Transaction successful. Refreshing...");
        }
    };

    return (

        <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
            <button onClick={() => window.history.back()} className="text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2">
                &larr; Back to Dashboard
            </button>

            {/* Header */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center bg-black/50">
                        <div className="text-center animate-bounce">
                            <Trophy size={80} className="text-yellow-400 mx-auto mb-4" />
                            <h2 className="text-4xl font-bold text-white mb-2">WINNER SELECTED!</h2>
                            <p className="text-xl text-white opacity-90">Congratulations to {winner?.slice(0, 6)}...{winner?.slice(-4)}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 relative z-0">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-lisk-100 text-lisk-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                Cycle {group.currentCycle}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                                <Clock size={14} /> Created {group.createdAt}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{group.name}</h1>
                        <p className="text-gray-600 max-w-2xl text-lg leading-relaxed">{group.description}</p>
                    </div>

                    <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 min-w-[240px]">
                        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">Total Pool Value</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900">{group.poolBalance}</span>
                            <span className="text-xl font-medium text-gray-500">{group.currency}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
                            <span className="text-gray-500">Contribution</span>
                            <span className="font-bold text-gray-900">{group.amountPerCycle} {group.currency} / {group.cyclePeriod}</span>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                        onClick={handleDeposit}
                        disabled={!!loadingAction}
                        className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loadingAction === 'deposit' ? <Loader2 className="animate-spin" /> : <Coins size={20} />}
                        Deposit {group.amountPerCycle} {group.currency}
                    </button>

                    {userRole === 'ADMIN' && (
                        <button
                            onClick={handleKocok}
                            disabled={!!loadingAction || Number(group.poolBalance) <= 0 || group.participants.length === 0}
                            className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg 
                                ${Number(group.poolBalance) <= 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-lisk-500 hover:bg-lisk-600 text-white shadow-lisk-200 disabled:opacity-50'}`}
                        >
                            {loadingAction === 'kocok' ? <Loader2 className="animate-spin" /> : <Trophy size={20} />}
                            {Number(group.poolBalance) <= 0 ? 'Round Finished (Empty Pool)' : 'Kocok Arisan (Shake)'}
                        </button>
                    )}
                </div>
            </div>

            {/* Participants Grid */}
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="text-gray-400" />
                Participants ({group.participants.length}/{group.maxParticipants})
            </h3>
            {/* ... keeping grid code simple ... */}
            <div className="grid md:grid-cols-2 gap-4">
                {group.participants.map((p, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-4">
                            <img src={p.user.avatarUrl} alt={p.user.username} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                            <div>
                                <p className="font-bold text-gray-900">{p.user.username}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{p.user.walletAddress.slice(0, 6)}...</span>
                                    <span>• Score: {p.user.reputationScore}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {p.hasWon && (
                                <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                                    <Trophy size={12} /> Winner Cycle {idx + 1}
                                </span>
                            )}
                            {p.hasPaid ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle2 size={12} /> Paid
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Unpaid</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
};

import { AdminDashboard } from './components/AdminDashboard';

// --- Animated Routes Wrapper ---
const AnimatedRoutes = ({ userRole, activeGroups, loadingGroups }: { userRole: UserRole, activeGroups: ArisanGroup[], loadingGroups: boolean }) => {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard userRole={userRole} activeGroups={activeGroups} loadingGroups={loadingGroups} />} />
            <Route path="/dashboard" element={<UserDashboard userRole={userRole} listArisans={activeGroups} />} />
            <Route path="/admin" element={<AdminDashboard userRole={userRole} allGroups={activeGroups} />} />
            <Route path="/create" element={
                userRole === 'ADMIN' ? <CreateArisan /> : <div className="p-20 text-center font-bold text-red-500">Access Denied: Admins Only</div>
            } />
            <Route path="/arisan/:id" element={<ArisanDetail userRole={userRole} activeGroups={activeGroups} loadingGroups={loadingGroups} />} />
        </Routes>
    );
};

const App: React.FC = () => {
    // ... existing state logic ...
    const { isConnected, address } = useWeb3ModalAccount();
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [isRoleModalOpen, setRoleModalOpen] = useState(false);
    const [activeGroups, setActiveGroups] = useState<ArisanGroup[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);

    // ... useEffects ...
    React.useEffect(() => {
        const fetchArisans = async () => {
            // Optimistic Load: Don't wait forever
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("RPC Timeout")), 15000)
            );

            try {
                setLoadingGroups(true);
                // Race between fetch and 15s timeout
                const groups = await Promise.race([
                    Web3Service.getAllArisans(),
                    timeoutPromise
                ]) as ArisanGroup[];

                setActiveGroups(groups);
            } catch (error) {
                console.error("Error loading groups:", error);
                // Even if it fails, stop loading so UI shows 'No active Arisans'
            } finally {
                setLoadingGroups(false);
            }
        };
        fetchArisans();
    }, []); // Run once on mount

    React.useEffect(() => {
        if (isConnected && address) {
            // 1. Local Storage Role Check
            const storedRole = localStorage.getItem(`arisan_role_${address}`) as UserRole;
            if (storedRole) {
                setUserRole(storedRole);
            } else {
                setRoleModalOpen(true);
            }

            // 2. Sync User to Supabase (Backend)
            // We upsert the user to ensure they exist in our DB
            const syncUserToSupabase = async () => {
                try {
                    await SupabaseService.upsertUser({
                        wallet_address: address,
                        // Default avatar using Dicebear if not set
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
                    });
                } catch (error) {
                    console.error("Failed to sync user to Supabase:", error);
                }
            };
            syncUserToSupabase();
        } else {
            setUserRole(null);
            setRoleModalOpen(false);
            setActiveGroups([]);
        }
    }, [isConnected, address]);

    const handleRoleSelect = (role: UserRole) => {
        if (address) {
            localStorage.setItem(`arisan_role_${address}`, role);
            setUserRole(role);
            setRoleModalOpen(false);
        }
    };

    const dummyWalletState = { isConnected: !!isConnected, address: address || null, balance: '0' };

    return (
        <>
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '14px',
                },
                success: {
                    iconTheme: {
                        primary: '#4ade80',
                        secondary: 'black',
                    },
                },
            }} />
            <RoleSelectionModal
                isOpen={isRoleModalOpen}
                onSelectRole={handleRoleSelect}
                onClose={() => setRoleModalOpen(false)}
            />
            <Router>
                <div className="min-h-screen bg-surface font-sans text-gray-900 selection:bg-lisk-200">
                    <Navbar wallet={dummyWalletState} setWallet={() => { }} userRole={userRole} />
                    <AnimatedRoutes userRole={userRole} activeGroups={activeGroups} loadingGroups={loadingGroups} />
                    <footer className="bg-white border-t border-gray-200 mt-20 py-12 relative z-10">
                        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
                            <p>&copy; 2024 Lisk Arisan DAO. Built for Financial Inclusion.</p>
                            <div className="flex justify-center gap-4 mt-4">
                                <a href="#" className="hover:text-gray-900">Smart Contracts</a>
                                <a href="#" className="hover:text-gray-900">Privacy</a>
                                <a href="#" className="hover:text-gray-900">Community</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </Router>
        </>
    );
};

export default App;
