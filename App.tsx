import React, { useState } from 'react';
import { User, UserRole } from './types';
import { MOCK_USERS } from './constants';
import { Layout } from './components/Layout';
import { TeacherPortal } from './pages/TeacherPortal';
import { ExamsPortal } from './pages/ExamsPortal';
import { ParentPortal } from './pages/ParentPortal';
import { StudentPortal } from './pages/StudentPortal';
import { Key } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = (userId: string) => {
    const foundUser = MOCK_USERS.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setActivePage('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Login Screen Component (Inline for simplicity of single file output context)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
           <div className="md:w-1/2 bg-femac-900 p-12 text-white flex flex-col justify-center">
             <h1 className="text-4xl font-bold mb-4">FAIMS</h1>
             <p className="text-femac-200 text-lg mb-8">FEMAC ACADEMY Integrated Management System</p>
             <p className="text-sm text-femac-400">Secure, Reliable, Integrated.</p>
           </div>
           
           <div className="md:w-1/2 p-12 flex flex-col justify-center">
             <h2 className="text-2xl font-bold text-slate-800 mb-6">Select Demo Role</h2>
             <div className="space-y-3">
               {MOCK_USERS.map(u => (
                 <button
                   key={u.id}
                   onClick={() => handleLogin(u.id)}
                   className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-femac-500 hover:bg-blue-50 transition-all group"
                 >
                   <div className="flex items-center space-x-3">
                      <div className="bg-slate-100 p-2 rounded-full group-hover:bg-white">
                        <Key size={16} className="text-slate-500 group-hover:text-femac-600"/>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-700 group-hover:text-femac-900">{u.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{u.role.replace('_', ' ').toLowerCase()}</p>
                      </div>
                   </div>
                 </button>
               ))}
             </div>
           </div>
        </div>
      </div>
    );
  }

  // Routing Logic
  const renderContent = () => {
    if (user.role === UserRole.TEACHER) {
      return <TeacherPortal />;
    }
    if (user.role === UserRole.EXAMS_OFFICE) {
      return <ExamsPortal />;
    }
    if (user.role === UserRole.PARENT) {
      return <ParentPortal />;
    }
    if (user.role === UserRole.PUPIL) {
      return <StudentPortal />;
    }
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl text-slate-400">Dashboard for {user.role} coming soon.</h2>
      </div>
    );
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activePage={activePage} 
      onNavigate={setActivePage}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;