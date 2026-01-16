import React, { useState } from 'react';
import { X, Loader2, Coins, Users, Calendar, Type } from 'lucide-react';
import { Web3Service } from '../services/web3Service';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';

interface CreateArisanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateArisanModal: React.FC<CreateArisanModalProps> = ({ isOpen, onClose }) => {
    const { isConnected } = useWeb3ModalAccount();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        entryFee: '',
        maxParticipants: '10',
        duration: 'Weekly'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) return alert("Please connect wallet first!");

        setLoading(true);
        try {
            await Web3Service.createGroup(
                formData.name,
                formData.entryFee,
                parseInt(formData.maxParticipants)
            );
            alert("Arisan Group Created Successfully!");
            onClose();
        } catch (error) {
            alert("Failed to create group.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Create New Arisan</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Type size={16} /> Arisan Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Keluarga Besar Crypto"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Type size={16} /> Description
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Short description of the group..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Coins size={16} /> Entry Fee (USDT)
                            </label>
                            <input
                                required
                                type="number"
                                step="0.001"
                                placeholder="0.01"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all"
                                value={formData.entryFee}
                                onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Users size={16} /> Max Participants
                            </label>
                            <input
                                required
                                type="number"
                                min="2"
                                max="100"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all"
                                value={formData.maxParticipants}
                                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar size={16} /> Cycle Duration
                        </label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lisk-500 focus:outline-none transition-all"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        >
                            <option value="Weekly">Weekly (7 Days)</option>
                            <option value="Monthly">Monthly (30 Days)</option>
                            <option value="Daily">Daily (Test Mode)</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !isConnected}
                            className="w-full bg-lisk-600 hover:bg-lisk-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-lisk-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Arisan Group'}
                        </button>
                        {!isConnected && (
                            <p className="text-center text-red-500 text-xs mt-2">Please connect wallet to create group</p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
