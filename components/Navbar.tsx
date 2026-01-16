import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { WalletState } from '../types';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { Web3Service } from '../services/web3Service';

interface NavbarProps {
  wallet: WalletState;
  setWallet: React.Dispatch<React.SetStateAction<WalletState>>;
  userRole?: UserRole;
}

import { UserRole } from '../types';

export const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  const location = useLocation();
  // AppKit handles wallet state internally
  const { address, isConnected } = useWeb3ModalAccount();
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && address) {
        const balance = await Web3Service.getUSDTBalance(address);
        // Format nicely: 1,234.56
        const formatted = parseFloat(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setUsdtBalance(formatted);
      } else {
        setUsdtBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [isConnected, address]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.hash = ''}>
          <img src="/logo.png" alt="ArisanDAO Logo" className="w-12 h-12 object-contain drop-shadow-sm" />
          <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-lisk-600">
            ArisanDAO
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-500">
          {[
            { name: "Explore", path: "/" },
            ...(userRole === 'ADMIN' ? [{ name: "Create Arisan", path: "/create" }] : []),
            { name: "My Dashboard", path: "/dashboard" }
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'text-lisk-600 font-bold' : 'text-gray-600 hover:text-lisk-600'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-blue-50 bg-opacity-80 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {/* AppKit Button handles Connect, Account View, Balance, and Disconnect */}
          {isConnected && usdtBalance && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-900">{usdtBalance} USDT</span>
              <span className="text-xs text-xs text-gray-500">Testnet</span>
            </div>
          )}

          {/* AppKit Button with HIDDEN native balance so we show USDT instead */}
          <w3m-button balance="hide" />

          <button className="md:hidden p-2 text-gray-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
