import React from 'react';
import { Wallet, Bell } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Header() {
  const isSidebarMinimized = useGameStore(state => state.isSidebarMinimized);

  return (
    <header className={``}>
      
    </header>
  );
}
