import React from 'react';
import { Users, Clock, Trophy, ChevronRight } from 'lucide-react';
import { ArisanGroup, ArisanStatus } from '../types';

interface ArisanCardProps {
  group: ArisanGroup;
  onClick: (id: string) => void;
}

export const ArisanCard: React.FC<ArisanCardProps> = ({ group, onClick }) => {
  const isFull = group.participants.length >= group.maxParticipants;
  const progress = (group.participants.length / group.maxParticipants) * 100;

  return (
    <div 
      onClick={() => onClick(group.id)}
      className="group bg-white rounded-2xl p-5 border border-gray-200 hover:border-lisk-300 hover:shadow-xl hover:shadow-lisk-100/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
        <Trophy size={64} className="text-lisk-900 rotate-12" />
      </div>

      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
          group.status === ArisanStatus.ACTIVE 
            ? 'bg-green-100 text-green-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {group.status}
        </span>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Pool Prize</p>
          <p className="text-xl font-bold text-gray-900">{group.amountPerCycle * group.maxParticipants} {group.currency}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-lisk-600 transition-colors line-clamp-1">
        {group.name}
      </h3>
      <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">
        {group.description}
      </p>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-gray-600 flex items-center gap-1"><Users size={12} /> {group.participants.length} / {group.maxParticipants} Joined</span>
            <span className="text-lisk-600">{Math.round(progress)}% Full</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-lisk-500 rounded-full transition-all duration-500 group-hover:bg-lisk-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>{group.cyclePeriod}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 group-hover:translate-x-1 transition-transform">
            View Details <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
