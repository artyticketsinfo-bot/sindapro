import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Cases from './components/Cases';
import Calendar from './components/Calendar';
import Documents from './components/Documents';
import Login from './components/Login';
import NotificationsPanel from './components/NotificationsPanel';
import Workflow from './components/Workflow';
import { PrivacyView, TermsView } from './components/LegalViews';
import SupportView from './components/SupportView';
import { ViewType, Member, Case, CalendarEvent, Document, User, Notification, ActivityLog, UserRole } from './types';
import { db } from './services/db';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Caricamento dati isolati per sede
  const loadAppData = useCallback((user?: User) => {
    const activeUser = user || currentUser;
    if (!activeUser) return;

    const sedeId = activeUser.sedeId;
    
    setMembers(db.getMembers(sedeId));
    setCases(db.getCases(sedeId));
    setEvents(db.getEvents(sedeId));
    setDocuments(db.getDocuments(sedeId));
    setNotifications(db.getNotifications(sedeId));
    setLogs(db.getLogs(sedeId));

    checkDeadlines(db.getCases(sedeId), activeUser);
  }, [currentUser]);

  useEffect(() => {
    const session = db.getCurrentSession();
    if (session) {
      setCurrentUser(session);
      const sedeId = session.sedeId;
      setMembers(db.getMembers(sedeId));
      setCases(db.getCases(sedeId));
      setEvents(db.getEvents(sedeId));
      setDocuments(db.getDocuments(sedeId));
      setNotifications(db.getNotifications(sedeId));
      setLogs(db.getLogs(sedeId));
    }
    setIsReady(true);
  }, []);

  const checkDeadlines = (allCases: Case[], user: User) => {
    const today = new Date();
    allCases.forEach((c) => {
      const expiry = new Date(c.scadenza);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7 && diffDays >= 0) {
        const notif: Notification = {
          id: `deadline-${c.id}-${new Date().toDateString()}`,
          title: 'Scadenza Pratica',
          message: `La pratica "${c.titolo}" scade tra ${diffDays} giorni.`,
          type: diffDays <= 2 ? 'danger' : 'warning',
          date: new Date().toLocaleString('it-IT'),
          isRead: false,
          targetView: 'pratiche',
          sedeId: user.sedeId
        };
        db.saveNotification(notif);
      }
    });
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
    setIsNotifPanelOpen(false);
    setIsSidebarOpen(false);
  };

  const handleMarkAsRead = (id: string) => {
    db.markAsRead(id);
    if (currentUser) setNotifications(db.getNotifications(currentUser.sedeId));
  };

  const renderContent = () => {
    if (!currentUser) return null;
    switch (currentView) {
      case 'dashboard':
        return <Dashboard members={members} cases={cases} documents={documents} logs={logs} onNavigate={setCurrentView} userRole={currentUser.role} />;
      case 'iscritti':
        return <Members members={members} currentUser={currentUser} onRefresh={() => loadAppData()} />;
      case 'pratiche':
        return <Cases cases={cases} members={members} onRefresh={() => loadAppData()} currentUser={currentUser} />;
      case 'workflow':
        return <Workflow cases={cases} members={members} onRefresh={() => loadAppData()} currentUser={currentUser} />;
      case 'documenti':
        return <Documents documents={documents} members={members} cases={cases} currentUser={currentUser} onRefresh={() => loadAppData()} />;
      case 'privacy':
        return <PrivacyView />;
      case 'terms':
        return <TermsView />;
      case 'support':
        return <SupportView />;
      case 'calendario':
        return (
          <Calendar 
            events={events} 
            cases={cases}
            onAddEvent={(e) => { db.saveEvent(e, currentUser); loadAppData(); }} 
            onUpdateEvent={(e) => { db.updateEvent(e, currentUser); loadAppData(); }}
            onDeleteEvent={(id) => { db.deleteEvent(id, currentUser); loadAppData(); }}
          />
        );
      case 'log':
        return (
          <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl md:text-2xl font-black text-blue-950 uppercase tracking-widest">Registro Attività Sede</h2>
                <span className="px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase">{currentUser.nomeSede}</span>
             </div>
             <div className="space-y-4">
                {logs.length > 0 ? logs.map(log => (
                  <div key={log.id} className="p-4 bg-gray-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-blue-50 transition-all gap-3 sm:gap-4 border border-transparent hover:border-blue-100">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-800 font-bold shadow-sm shrink-0 border border-gray-100">
                          {log.userName[0]}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-blue-900 uppercase tracking-tighter">{log.action}</p>
                           <p className="text-sm text-gray-600 font-medium">{log.details}</p>
                        </div>
                     </div>
                     <div className="text-left sm:text-right shrink-0">
                        <p className="text-[10px] font-bold text-gray-500">{log.userName}</p>
                        <p className="text-[9px] text-gray-400 font-medium tracking-tight italic">{log.timestamp}</p>
                     </div>
                  </div>
                )) : (
                  <div className="py-20 text-center text-gray-400 font-medium italic">Nessuna attività registrata.</div>
                )}
             </div>
          </div>
        );
      default:
        return <Dashboard members={members} cases={cases} documents={documents} logs={logs} onNavigate={setCurrentView} userRole={currentUser.role} />;
    }
  };

  if (!isReady) return null;
  if (!currentUser) return <Login onLoginSuccess={(u) => { setCurrentUser(u); loadAppData(u); }} />;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-gray-900 antialiased font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out z-[60] lg:z-auto`}>
        <Sidebar currentView={currentView} onViewChange={(v) => { setCurrentView(v); setIsSidebarOpen(false); }} user={currentUser} onLogout={handleLogout} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-10 shrink-0 z-40">
          <div className="flex items-center gap-3 md:gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-500 hover:text-blue-800 lg:hidden">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
             <div className="px-3 md:px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100">
               <span className="text-[9px] md:text-[10px] font-black text-blue-800 uppercase tracking-widest">{currentView}</span>
             </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)} className={`relative p-2 md:p-3 rounded-2xl transition-all ${isNotifPanelOpen ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-blue-800 hover:bg-gray-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {notifications.some(n => !n.isRead) && <span className="absolute top-1.5 right-1.5 md:top-2.5 md:right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-xl"></span>}
            </button>
            <div className="flex items-center gap-3 md:gap-4 pl-4 md:pl-8 border-l border-gray-100">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-black text-blue-950 leading-none">{currentUser.operatore}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1.5">{currentUser.role}</p>
               </div>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-tr from-blue-800 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 shrink-0">
                 {currentUser.operatore[0]}
               </div>
            </div>
          </div>
        </header>

        {isNotifPanelOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotifPanelOpen(false)} onMarkAsRead={handleMarkAsRead} onNavigate={setCurrentView} />}

        <section className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar flex flex-col">
          <div className="max-w-screen-2xl mx-auto flex-1 w-full">{renderContent()}</div>
          <footer className="mt-12 md:mt-20 py-8 border-t border-gray-100 max-w-screen-2xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] md:text-xs text-gray-400 font-medium tracking-tight">© {new Date().getFullYear()} Gestione Sindacale Professional - Tenant ID: {currentUser.sedeId}</p>
            <div className="flex gap-4 md:gap-6 text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
               <button onClick={() => setCurrentView('privacy')} className="hover:text-blue-800 transition-colors">Privacy</button>
               <button onClick={() => setCurrentView('terms')} className="hover:text-blue-800 transition-colors">Termini</button>
               <button onClick={() => setCurrentView('support')} className="hover:text-blue-800 transition-colors">Supporto</button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default App;