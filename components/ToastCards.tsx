import React from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Trophy, Coins, ExternalLink } from 'lucide-react';

interface ToastCardProps {
    t: any;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'winner';
    txHash?: string;
}

export const ToastCard: React.FC<ToastCardProps> = ({ t, title, message, type = 'success', txHash }) => {
    return (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
        >
            <div className={`w-2 ${type === 'success' ? 'bg-green-500' : type === 'winner' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <div className="flex-1 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        {type === 'success' && <CheckCircle2 className="h-10 w-10 text-green-500" />}
                        {type === 'error' && <XCircle className="h-10 w-10 text-red-500" />}
                        {type === 'winner' && <Trophy className="h-10 w-10 text-yellow-500" />}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-bold text-gray-900">{title}</p>
                        <p className="mt-1 text-sm text-gray-500">{message}</p>
                        {txHash && (
                            <a
                                href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center text-xs text-lisk-600 hover:text-lisk-700 font-medium"
                            >
                                View Transaction <ExternalLink size={10} className="ml-1" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex border-l border-gray-200">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export const showSuccessToast = (title: string, message: string, txHash?: string) => {
    toast.custom((t) => <ToastCard t={t} title={title} message={message} type="success" txHash={txHash} />, { duration: 5000 });
};

export const showWinnerToast = (title: string, message: string) => {
    toast.custom((t) => <ToastCard t={t} title={title} message={message} type="winner" />, { duration: 8000 });
};

export const showErrorToast = (title: string, message: string) => {
    toast.custom((t) => <ToastCard t={t} title={title} message={message} type="error" />, { duration: 5000 });
};
