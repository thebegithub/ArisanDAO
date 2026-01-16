import React, { useState, useEffect } from 'react';
import { Send, Users, MessageCircle, Clock, Award } from 'lucide-react';
import { MOCK_USERS } from '../constants';

// Types for our "Supabase" data
interface ChatMessage {
    id: string;
    user_id: string;
    username: string;
    avatar_url: string;
    message: string;
    created_at: string;
}

interface LeaderboardEntry {
    user_id: string;
    username: string;
    wallet_address: string;
    join_date: string;
    total_deposited: string; // Formatting purpose
}

export const SocialFeatures: React.FC = () => {
    // --- Mock State (Replacing Supabase Realtime for now) ---
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', user_id: 'u1', username: 'CryptoKing', avatar_url: MOCK_USERS[0].avatarUrl, message: 'Semoga saya menang bulan ini! 🚀', created_at: '10:00 AM' },
        { id: '2', user_id: 'u2', username: 'LiskFan', avatar_url: MOCK_USERS[1].avatarUrl, message: 'Arisan trustless is the future.', created_at: '10:05 AM' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const [leaderboard] = useState<LeaderboardEntry[]>([
        { user_id: 'u1', username: 'CryptoKing', wallet_address: '0x71C...9A21', join_date: '2024-01-10', total_deposited: '1.5 ETH' },
        { user_id: 'u2', username: 'LiskFan', wallet_address: '0xA2B...3C4D', join_date: '2024-01-12', total_deposited: '0.5 ETH' },
        { user_id: 'u3', username: 'HODLer', wallet_address: '0xDEF...5678', join_date: '2024-01-15', total_deposited: '0.5 ETH' },
    ]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // In real Supabase: await supabase.from('messages').insert(...)
        const msg: ChatMessage = {
            id: Date.now().toString(),
            user_id: 'current_user',
            username: 'You',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
            message: newMessage,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, msg]);
        setNewMessage('');
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8">

            {/* 1. Leaderboard / Daftar Peserta */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Users className="text-lisk-500" size={20} />
                        Community Leaderboard
                    </h3>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                        Latest Deposits
                    </span>
                </div>

                <div className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-3">Participant</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Total Contributed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leaderboard.map((entry, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{entry.username}</p>
                                                <p className="text-xs text-gray-400 font-mono">{entry.wallet_address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} /> {entry.join_date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900 text-sm">
                                        {entry.total_deposited}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 2. Live Chat / Shoutbox */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <MessageCircle className="text-lisk-500" size={20} />
                        Community Chat
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Say hello to other Arisan members!</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.username === 'You' ? 'flex-row-reverse' : ''}`}>
                            <img src={msg.avatar_url} alt="av" className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm" />
                            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.username === 'You'
                                    ? 'bg-lisk-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                                }`}>
                                <div className={`flex items-baseline justify-between gap-4 mb-1 ${msg.username === 'You' ? 'text-lisk-100' : 'text-gray-400'}`}>
                                    <span className="font-bold text-xs">{msg.username}</span>
                                    <span className="text-[10px]">{msg.created_at}</span>
                                </div>
                                <p>{msg.message}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lisk-500 transition-all"
                        />
                        <button
                            type="submit"
                            className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
                            disabled={!newMessage.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </section>

        </div>
    );
};
