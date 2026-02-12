
import React, { useState } from 'react';
import { db } from '../services/db';
import { User, UserRole, ViewType } from '../types';
import { Icons } from '../constants';
import { PrivacyView, TermsView } from './LegalViews';
import SupportView from './SupportView';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [publicView, setPublicView] = useState<ViewType | 'none'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeSede, setNomeSede] = useState('');
  const [operatore, setOperatore] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!email || !password || !nomeSede || !operatore) {
          setError('Tutti i campi sono obbligatori.');
          setIsLoading(false);
          return;
        }
        const existing = db.getUsers().find(u => u.email === email);
        if (existing) {
          setError('Email già registrata.');
          setIsLoading(false);
          return;
        }
        const newUser: User = { 
          id: Math.random().toString(36).substr(2, 9), 
          email, 
          password, 
          nomeSede, 
          operatore,
          role: UserRole.OWNER,
          sedeId: Math.random().toString(36).substr(2, 9)
        };
        db.registerUser(newUser);
        setIsRegistering(false);
        setError('Registrazione completata. Effettua il login.');
      } else {
        const user = db.authenticate(email, password);
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('Email o password errati.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore imprevisto.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPublicView = () => {
    if (publicView === 'none') return null;
    
    return (
      <div className="fixed inset-0 z-[150] bg-white overflow-y-auto pt-20 animate-fadeIn">
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 h-20 flex items-center px-6 md:px-10 justify-between z-[160]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold">GS</div>
             <span className="font-black text-blue-900 hidden sm:inline">Gestione Sindacale</span>
          </div>
          <button 
            onClick={() => setPublicView('none')}
            className="px-6 py-2 bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-200"
          >
            Torna al Login
          </button>
        </nav>
        <div className="p-6 md:p-10">
          {publicView === 'privacy' && <PrivacyView />}
          {publicView === 'terms' && <TermsView />}
          {publicView === 'support' && <SupportView />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center justify-center p-6">
      {renderPublicView()}

      <div className="w-full max-w-md animate-slideUp">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-800 rounded-[2rem] text-white font-bold text-3xl shadow-2xl shadow-blue-200 mb-6">GS</div>
          <h1 className="text-3xl font-black text-blue-950 mb-2">Gestione Sindacale</h1>
          <p className="text-gray-500 font-medium">Accesso riservato agli operatori di sede</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10">
          <div className="flex gap-4 mb-8">
            <button 
              type="button"
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isRegistering ? 'bg-blue-50 text-blue-800 shadow-inner' : 'text-gray-400 hover:text-blue-800'}`}
            >
              Accedi
            </button>
            <button 
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isRegistering ? 'bg-blue-50 text-blue-800 shadow-inner' : 'text-gray-400 hover:text-blue-800'}`}
            >
              Registra Sede
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className={`p-4 rounded-2xl text-[11px] font-bold ${error.includes('inviata') || error.includes('completata') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" 
                  placeholder="operatore@sede.it" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>

              {isRegistering && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Denominazione Sede</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" 
                      placeholder="Sede Roma Centro" 
                      value={nomeSede} 
                      onChange={(e) => setNomeSede(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Responsabile</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" 
                      placeholder="Mario Rossi" 
                      value={operatore} 
                      onChange={(e) => setOperatore(e.target.value)} 
                    />
                  </div>
                </>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-5 bg-blue-800 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-900 transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isRegistering ? 'Attiva Account Sede' : 'Accedi al Sistema'}
            </button>
          </form>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <button onClick={() => setPublicView('privacy')} className="hover:text-blue-800 transition-colors">Privacy</button>
            <button onClick={() => setPublicView('terms')} className="hover:text-blue-800 transition-colors">Termini</button>
            <button onClick={() => setPublicView('support')} className="hover:text-blue-800 transition-colors">Supporto</button>
          </div>
          <p className="text-[10px] font-medium text-gray-400">© {new Date().getFullYear()} Gestione Sindacale Professional</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
