import React, { useState } from 'react';
import {
  Home,
  TrendingUp,
  Building,
  Wallet,
  CreditCard,
  Calendar,
  Menu,
  X,
  Settings,
  User,
  Bell,
  Target,
  Calculator
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'placements', label: 'Placements', icon: TrendingUp },
  { id: 'immobilier', label: 'Immobilier', icon: Building },
  { id: 'comptes', label: 'Comptes', icon: Wallet },
  { id: 'credits', label: 'Crédits', icon: CreditCard },
  { id: 'historique', label: 'Historique', icon: Calendar },
  { id: 'objectifs', label: 'Objectifs', icon: Target },
  { id: 'fiscal', label: 'Fiscal', icon: Calculator },
  { id: 'connections', label: 'Connexions', icon: Settings },
];

const bottomMenuItems = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-20 xl:w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center xl:justify-start h-16 px-4 border-b border-gray-800">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center xl:mr-3 shadow-lg">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="hidden xl:block text-lg font-semibold">Patrimoine</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`sidebar-item w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-smooth group ${
                  isActive
                    ? 'active bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} xl:mr-3 transition-smooth`} />
                <span className="hidden xl:block">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom menu */}
        <div className="px-2 py-4 border-t border-gray-800">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`sidebar-item w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-smooth group ${
                  isActive
                    ? 'active bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} xl:mr-3 transition-smooth`} />
                <span className="hidden xl:block">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 fade-in">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 w-64 h-full shadow-lg text-white slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-semibold">Patrimoine</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white transition-smooth"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-smooth ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="mr-3 transition-smooth" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <div className="pt-4 border-t border-gray-800 mt-4">
                {bottomMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onPageChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-smooth ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon size={20} className="mr-3 transition-smooth" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-smooth"
          >
            <Menu size={20} />
          </button>

          {/* Page title - will be updated dynamically */}
          <h1 className="hidden lg:block text-2xl font-bold text-gray-900">
            {menuItems.find(item => item.id === currentPage)?.label ||
             bottomMenuItems.find(item => item.id === currentPage)?.label ||
             'Dashboard'}
          </h1>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 relative transition-smooth">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full notification-dot"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">Jules Koehler</p>
                <p className="text-xs text-gray-500">Investisseur</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};