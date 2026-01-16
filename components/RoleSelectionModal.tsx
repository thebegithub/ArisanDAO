import React from 'react';
import { ShieldCheck, User, X } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectionModalProps {
    isOpen: boolean;
    onSelectRole: (role: UserRole) => void;
    onClose: () => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onSelectRole, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-lisk-600 to-blue-700 p-8 text-center text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-3xl font-bold mb-2">Welcome to Lisk Arisan</h2>
                    <p className="opacity-90">Please select your role to continue</p>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-6">
                    <button
                        onClick={() => onSelectRole('ADMIN')}
                        className="group relative p-6 rounded-2xl border-2 border-gray-100 hover:border-lisk-500 hover:bg-lisk-50 transition-all text-left"
                    >
                        <div className="w-14 h-14 bg-lisk-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={32} className="text-lisk-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Admin / Manager</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Create new Arisan groups, invite participants, and manage the shaking (Kocok) process.
                        </p>
                    </button>

                    <button
                        onClick={() => onSelectRole('USER')}
                        className="group relative p-6 rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all text-left"
                    >
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <User size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Participant</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Join existing groups, contribute funds, and check for winnings.
                        </p>
                    </button>
                </div>

                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                    This selection helps tailor your experience.
                </div>
            </div>
        </div>
    );
};
