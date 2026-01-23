import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, BookOpen, GraduationCap, Users, DollarSign, Menu, X, LogOut, CheckCircle } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activePage, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getNavItems = (role: UserRole) => {
    switch (role) {
      case UserRole.TEACHER:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'gradebook', label: 'Gradebook', icon: BookOpen },
        ];
      case UserRole.EXAMS_OFFICE:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'approvals', label: 'Grade Approvals', icon: CheckCircle },
        ];
      case UserRole.PARENT:
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'fees', label: 'Fees Portal', icon: DollarSign },
          { id: 'results', label: 'Child Results', icon: GraduationCap },
        ];
      case UserRole.PUPIL:
        return [
          { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'classes', label: 'My Classes', icon: BookOpen },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems(user.role);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-femac-900 text-white p-4 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg tracking-wide">FAIMS</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 z-50 h-screen w-64 bg-femac-900 text-white transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 border-b border-femac-700">
          <h1 className="text-2xl font-bold tracking-wider text-femac-100">FAIMS</h1>
          <p className="text-xs text-femac-400 mt-1">Integrated Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${activePage === item.id 
                  ? 'bg-femac-700 text-white shadow-lg' 
                  : 'text-femac-200 hover:bg-femac-800 hover:text-white'}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-femac-700 bg-femac-800">
          <div className="flex items-center space-x-3 mb-4">
            <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-femac-500" />
            <div>
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-femac-300 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-md text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};