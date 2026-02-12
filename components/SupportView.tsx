
import React, { useState } from 'react';
import { Icons } from '../constants';

const SupportView: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', msg: string }>({ type: 'none', msg: '' });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatus({ type: 'none', msg: '' });

    try {
      // Funzionalità email disabilitata come richiesto. Simulazione salvataggio locale.
      setTimeout(() => {
        setStatus({ type: 'success', msg: 'La tua richiesta è stata registrata nel sistema. (Invio email disabilitato)' });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSending(false);
      }, 800);
    } catch (err: any) {
      setStatus({ type: 'error', msg: 'Si è verificato un errore imprevisto.' });
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-blue-950 mb-4">Centro Supporto</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Siamo qui per aiutarti a ottimizzare la gestione della tua sede sindacale. Compila il modulo o scrivici direttamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                  placeholder="Mario Rossi"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email di Contatto</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                  placeholder="m.rossi@sede.it"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Oggetto della Richiesta</label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="Configurazione multi-sede, Problemi login, etc."
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Messaggio</label>
              <textarea
                required
                rows={5}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="Descrivi dettagliatamente la tua richiesta..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            {status.type !== 'none' && (
              <div className={`p-4 rounded-2xl text-xs font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {status.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-5 bg-blue-800 text-white rounded-2xl font-bold text-base shadow-xl hover:bg-blue-900 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isSending ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Invia Messaggio'
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
            <h3 className="text-xl font-bold mb-4">Informazioni Dirette</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icons.Bell />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Email Supporto</p>
                  <p className="text-sm font-bold">supporto@gestionesindacale.it</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icons.Dashboard />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Disponibilità</p>
                  <p className="text-sm font-bold">Lun - Ven / 09:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
            <h3 className="text-lg font-bold text-blue-950 mb-4 text-center">FAQ Veloci</h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="list-none flex justify-between items-center cursor-pointer font-bold text-xs text-gray-700 hover:text-blue-800 transition-colors">
                  Come recupero la password?
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">Rivolgiti all'amministratore della sede sindacale per resettare le credenziali.</p>
              </details>
              <details className="group">
                <summary className="list-none flex justify-between items-center cursor-pointer font-bold text-xs text-gray-700 hover:text-blue-800 transition-colors">
                  I miei dati sono al sicuro?
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">Tutti i dati sono isolati per sede e salvati in modo sicuro nella tua infrastruttura locale.</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportView;