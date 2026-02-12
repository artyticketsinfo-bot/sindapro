
import React, { useState } from 'react';
import { Member, MemberStatus, User } from '../types';
import { Icons } from '../constants';
import { exportMemberPDF, exportReportPDF } from '../services/pdf';
import { db } from '../services/db';

interface MembersProps {
  members: Member[];
  currentUser?: User;
  onRefresh?: () => void;
}

const Members: React.FC<MembersProps> = ({ members, currentUser, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Form State
  const initialForm = {
    nome: '',
    cognome: '',
    dataNascita: '',
    dataInizioCollaborazione: '',
    codiceFiscale: '',
    telefono: '',
    email: '',
    ruolo: 'dipendente' as 'dipendente' | 'responsabile'
  };
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredMembers = members.filter(m => 
    `${m.nome} ${m.cognome}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codiceFiscale.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = 'Campo obbligatorio';
    if (!formData.cognome) newErrors.cognome = 'Campo obbligatorio';
    if (!formData.dataNascita) newErrors.dataNascita = 'Campo obbligatorio';
    if (!formData.dataInizioCollaborazione) newErrors.dataInizioCollaborazione = 'Campo obbligatorio';
    if (!formData.telefono) newErrors.telefono = 'Campo obbligatorio';
    
    // CF Validation (Basic regex for Italian CF)
    const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
    if (!formData.codiceFiscale) {
      newErrors.codiceFiscale = 'Campo obbligatorio';
    } else if (!cfRegex.test(formData.codiceFiscale)) {
      newErrors.codiceFiscale = 'Formato non valido';
    }

    // Email Validation (Optional but must be valid if present)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (!currentUser) return;

    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      nome: formData.nome,
      cognome: formData.cognome,
      dataNascita: formData.dataNascita,
      dataInizioCollaborazione: formData.dataInizioCollaborazione,
      codiceFiscale: formData.codiceFiscale.toUpperCase(),
      telefono: formData.telefono,
      email: formData.email,
      ruolo: formData.ruolo,
      dataIscrizione: new Date().toISOString().split('T')[0],
      quotaAttiva: true,
      status: MemberStatus.ATTIVO,
      sedeId: currentUser.sedeId,
      note: `Creato da ${currentUser.operatore} il ${new Date().toLocaleDateString()}`
    };

    db.saveMember(newMember, currentUser);
    setIsModalOpen(false);
    setFormData(initialForm);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
    if (onRefresh) onRefresh();
  };

  const handleExportMembersList = () => {
    const data = filteredMembers.map(m => ({
      ...m,
      nominativo: `${m.cognome} ${m.nome}`,
      stato: m.quotaAttiva ? 'In Regola' : 'Irregolare'
    }));
    exportReportPDF('Elenco Iscritti', data, ['Nominativo', 'Codice Fiscale', 'Data Iscr.', 'Stato'], ['nominativo', 'codiceFiscale', 'dataIscrizione', 'stato']);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Conferma */}
      {showConfirm && (
        <div className="fixed top-20 md:top-24 right-4 md:right-10 z-[110] bg-emerald-600 text-white px-5 md:px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
           <span className="text-xs md:text-sm font-bold">Iscritto salvato con successo!</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Iscritti</h2>
          <p className="text-sm md:text-base text-gray-500">Anagrafica completa dei membri della sede sindacale.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportMembersList}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all font-medium text-xs md:text-sm"
          >
            <Icons.Download /> <span className="hidden xs:inline">Esporta</span> Elenco
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-all font-medium text-xs md:text-sm"
          >
            <Icons.Plus /> Nuovo <span className="hidden xs:inline">Iscritto</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cerca per nome, cognome o CF..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nominativo</th>
                <th className="px-6 py-4">Codice Fiscale</th>
                <th className="px-6 py-4">Data Iscrizione</th>
                <th className="px-6 py-4">Ruolo</th>
                <th className="px-6 py-4">Stato Quota</th>
                <th className="px-6 py-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {m.nome[0]}{m.cognome[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{m.nome} {m.cognome}</p>
                        <p className="text-[11px] text-gray-500 truncate">{m.email || 'Nessuna Email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm font-mono text-gray-600">{m.codiceFiscale}</td>
                  <td className="px-6 py-4 text-xs md:text-sm text-gray-600">{m.dataIscrizione}</td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] md:text-xs font-medium text-gray-600 capitalize">{m.ruolo || 'Dipendente'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                      m.quotaAttiva ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {m.quotaAttiva ? 'In Regola' : 'Irregolare'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => exportMemberPDF(m)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Scarica Scheda">
                        <Icons.Download />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                    Nessun iscritto trovato per i criteri di ricerca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE INSERIMENTO RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div>
                  <h3 className="text-xl md:text-2xl font-black text-blue-950">Nuovo Iscritto</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Inserimento anagrafica certificata</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome *</label>
                    <input
                      type="text"
                      className={`w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border ${errors.nome ? 'border-red-300' : 'border-gray-100'} bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="Mario"
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                    />
                    {errors.nome && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.nome}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Cognome *</label>
                    <input
                      type="text"
                      className={`w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border ${errors.cognome ? 'border-red-300' : 'border-gray-100'} bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="Rossi"
                      value={formData.cognome}
                      onChange={e => setFormData({...formData, cognome: e.target.value})}
                    />
                    {errors.cognome && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.cognome}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Data di Nascita *</label>
                    <input
                      type="date"
                      className={`w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border ${errors.dataNascita ? 'border-red-300' : 'border-gray-100'} bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all`}
                      value={formData.dataNascita}
                      onChange={e => setFormData({...formData, dataNascita: e.target.value})}
                    />
                    {errors.dataNascita && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.dataNascita}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Inizio Collaborazione *</label>
                    <input
                      type="date"
                      className={`w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border ${errors.dataInizioCollaborazione ? 'border-red-300' : 'border-gray-100'} bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all`}
                      value={formData.dataInizioCollaborazione}
                      onChange={e => setFormData({...formData, dataInizioCollaborazione: e.target.value})}
                    />
                    {errors.dataInizioCollaborazione && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.dataInizioCollaborazione}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Codice Fiscale *</label>
                    <input
                      type="text"
                      className={`w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border ${errors.codiceFiscale ? 'border-red-300' : 'border-gray-100'} bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all uppercase`}
                      placeholder="CF..."
                      maxLength={16}
                      value={formData.codiceFiscale}
                      onChange={e => setFormData({...formData, codiceFiscale: e.target.value})}
                    />
                    {errors.codiceFiscale && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.codiceFiscale}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Telefono *</label>
                    <input
                      type="tel"
                      className={`w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border ${errors.telefono ? 'border-red-300' : 'border-gray-100'} bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="333..."
                      value={formData.telefono}
                      onChange={e => setFormData({...formData, telefono: e.target.value})}
                    />
                    {errors.telefono && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.telefono}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email (campo non obbligatorio)</label>
                    <input
                      type="email"
                      className={`w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border ${errors.email ? 'border-red-300' : 'border-gray-100'} bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="email@esempio.it"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    {errors.email && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.email}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Ruolo Associativo</label>
                    <div className="flex flex-col xs:flex-row gap-4 xs:gap-8">
                       <label className="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-xl border border-gray-100 xs:bg-transparent xs:border-0 xs:p-0">
                          <input 
                            type="radio" 
                            name="ruolo" 
                            className="w-5 h-5 text-blue-800 border-gray-200 focus:ring-blue-500"
                            checked={formData.ruolo === 'dipendente'}
                            onChange={() => setFormData({...formData, ruolo: 'dipendente'})}
                          />
                          <span className="text-sm font-bold text-gray-600 group-hover:text-blue-800 transition-colors">Dipendente</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-xl border border-gray-100 xs:bg-transparent xs:border-0 xs:p-0">
                          <input 
                            type="radio" 
                            name="ruolo" 
                            className="w-5 h-5 text-blue-800 border-gray-200 focus:ring-blue-500"
                            checked={formData.ruolo === 'responsabile'}
                            onChange={() => setFormData({...formData, ruolo: 'responsabile'})}
                          />
                          <span className="text-sm font-bold text-gray-600 group-hover:text-blue-800 transition-colors">Responsabile</span>
                       </label>
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-4 shrink-0">
               <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 md:py-4 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-white rounded-xl md:rounded-2xl transition-all border border-transparent hover:border-gray-200 order-2 sm:order-1"
               >
                  Annulla
               </button>
               <button 
                  onClick={handleSave}
                  className="flex-1 py-3 md:py-4 bg-blue-800 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-900 transition-all active:scale-[0.98] order-1 sm:order-2"
               >
                  Salva Iscritto
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
