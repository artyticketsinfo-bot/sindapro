
import React from 'react';
import { ViewType, User, UserRole } from '../types';
import { Icons, COLORS } from '../constants';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard' as ViewType, label: 'Analisi Dati', icon: Icons.Dashboard, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { id: 'workflow' as ViewType, label: 'Workflow', icon: Icons.Briefcase, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { id: 'iscritti' as ViewType, label: 'Iscritti', icon: Icons.Users, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { id: 'pratiche' as ViewType, label: 'Pratiche', icon: Icons.Briefcase, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { id: 'documenti' as ViewType, label: 'Documenti', icon: Icons.Folder, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { id: 'calendario' as ViewType, label: 'Calendario', icon: Icons.Calendar, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { id: 'log' as ViewType, label: 'Log Attività', icon: Icons.Bell, roles: [UserRole.OWNER, UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-72 bg-white border-r border-gray-100 h-screen flex flex-col shrink-0 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex items-center gap-4 shrink-0">
        <div className="w-12 h-12 bg-blue-800 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-200">
          GS
        </div>
        <div>
          <h1 className="text-xl font-black text-blue-950 tracking-tighter leading-none">Gestione</h1>
          <h2 className="text-sm font-bold text-blue-600 tracking-tight uppercase">Sindacale</h2>
        </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-sidebar-scrollbar">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4 mb-4">Navigazione</p>
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group active:scale-[0.98] ${
              currentView === item.id
                ? 'bg-blue-800 text-white shadow-2xl shadow-blue-300 translate-x-1'
                : 'text-gray-500 hover:bg-gray-50 hover:text-blue-800'
            }`}
          >
            <div className={`transition-transform duration-300 shrink-0 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              <item.icon />
            </div>
            <span className="text-sm font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-6 border-t border-gray-50 shrink-0">
        <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-blue-800/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
          <p className="text-[9px] text-blue-600 font-black mb-1 uppercase tracking-widest opacity-60">Sessione Operatore</p>
          <p className="text-sm font-black text-blue-950 truncate mb-0.5">{user.operatore}</p>
          <div className="flex items-center gap-2 mb-4">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</span>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-200 rounded-xl hover:bg-white hover:text-red-600 hover:border-red-100 transition-all active:scale-[0.98]"
          >
            Disconnetti
          </button>
        </div>
      </div>

      <style>{`
        .custom-sidebar-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        /* Assicura che su Firefox sia visibile lo scroll */
        .custom-sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
