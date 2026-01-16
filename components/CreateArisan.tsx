import React, { useState } from 'react';
import { Loader2, Coins, Users, Calendar, Type, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Web3Service } from '../services/web3Service';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast } from './ToastCards';
import { PageTransition } from './PageTransition';

import { ethers } from 'ethers';
import { FACTORY_ABI } from '../contracts/abis';
import { SupabaseService } from '../services/supabaseService';

export const CreateArisan: React.FC = () => {
    const { isConnected, address } = useWeb3ModalAccount();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        entryFee: '',
        maxParticipants: '10',
        duration: 'Weekly'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) return alert("Please connect wallet first!");

        setLoading(true);
        try {
            if (isNaN(parseFloat(formData.entryFee)) || parseFloat(formData.entryFee) <= 0) {
                alert("Please enter a valid Entry Fee (must be a number greater than 0)");
                setLoading(false);
                return;
            }

            const txReceipt = await Web3Service.createGroup(
                formData.name,
                formData.description,
                formData.entryFee,
                parseInt(formData.maxParticipants)
            );

            // Sync to Supabase immediately for real-time UI
            if (txReceipt && txReceipt.logs) {
                try {
                    const iface = new ethers.Interface(FACTORY_ABI);
                    let newGroupAddress = '';

                    for (const log of txReceipt.logs) {
                        try {
                            const parsedLog = iface.parseLog({
                                topics: Array.from(log.topics),
                                data: log.data
                            });
                            if (parsedLog && parsedLog.name === 'ArisanCreated') {
                                newGroupAddress = parsedLog.args[0];
                                break;
                            }
                        } catch (e) { /* ignore non-factory logs */ }
                    }

                    if (newGroupAddress) {
                        console.log("Syncing new group to Supabase:", newGroupAddress);
                        await SupabaseService.createArisanGroup({
                            contract_address: newGroupAddress,
                            name: formData.name,
                            description: formData.description,
                            created_by: address || '',
                            entry_fee: formData.entryFee,
                            max_participants: parseInt(formData.maxParticipants),
                            duration: formData.duration
                        });
                    }
                } catch (err) {
                    console.error("Supabase Sync Error", err);
                }
            }

            showSuccessToast("Arisan Created!", "Metadata stored on-chain successfully.");

            // Wait longer for indexer (5 seconds)
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        } catch (error) {
            alert("Failed to create group.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition className="min-h-screen pb-20 pt-10">
            <div className="max-w-3xl mx-auto px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-lisk-600 to-blue-700 p-10 text-white">
                        <h1 className="text-3xl font-bold mb-2">Create New Arisan</h1>
                        <p className="opacity-90 max-w-lg">
                            Start your own saving circle on the blockchain. Set your rules, invite friends, and save together securely.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Type size={18} className="text-lisk-500" /> Arisan Name
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Office Savings Circle, Holiday Fund..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all text-lg font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Type size={18} className="text-lisk-500" /> Description
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Describe the purpose of this group..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all resize-none text-base"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Coins size={18} className="text-lisk-500" /> Entry Fee (USDT)
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type="number"
                                        step="0.001"
                                        placeholder="0.01"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all font-mono text-lg"
                                        value={formData.entryFee}
                                        onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                                    />
                                    <span className="absolute right-4 top-4 text-gray-400 font-bold">USDT</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Users size={18} className="text-lisk-500" /> Max Participants
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="2"
                                    max="100"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all text-lg"
                                    value={formData.maxParticipants}
                                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar size={18} className="text-lisk-500" /> Cycle Duration
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Weekly', 'Monthly', 'Daily'].map((type) => (
                                    <div
                                        key={type}
                                        onClick={() => setFormData({ ...formData, duration: type })}
                                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center transition-all ${formData.duration === type
                                            ? 'border-lisk-500 bg-lisk-50 text-lisk-700'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                            }`}
                                    >
                                        <span className="font-bold">{type}</span>
                                        <span className="text-xs mt-1">
                                            {type === 'Weekly' ? '7 Days' : type === 'Monthly' ? '30 Days' : 'Test Mode'}
                                        </span>
                                        {formData.duration === type && <CheckCircle2 size={16} className="mt-2 text-lisk-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading || !isConnected}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-gray-200 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Create Chain'}
                            </button>
                            {!isConnected && (
                                <p className="text-center text-red-500 text-sm mt-3 bg-red-50 py-2 rounded-lg">
                                    Please connect your wallet to create a group
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </PageTransition>
    );
};
