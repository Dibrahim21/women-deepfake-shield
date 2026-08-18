import React from 'react';
import { LayoutGrid, ScanFace, History, ShieldCheck, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutGrid },
    { id: 'analyze' as const, label: 'Analyze', icon: ScanFace },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'safety' as const, label: 'Safety', icon: ShieldCheck },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 no-print max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-1 transition-transform ${
                  isActive ? 'stroke-[2.5px]' : 'stroke-2'
                }`}
              />
              <span className="text-[11px] tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
