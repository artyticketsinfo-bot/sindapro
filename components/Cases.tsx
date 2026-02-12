
import React, { useState, useRef } from 'react';
import { Case, Member, CaseStatus, CaseFile, User } from '../types';
import { Icons, COLORS } from '../constants';
import { exportCasePDF, exportReportPDF } from '../services/pdf';
import { db } from '../services/db';

interface CasesProps {
  cases: Case[];
  members: Member[];
  onRefresh?: () => void;
  currentUser: User;
}

const Cases: React.FC<CasesProps> = ({ cases, members, onRefresh, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [detailCase, setDetailCase] = useState<Case | null>(null);
  const [fileToUpload, setFileToUpload] = useState<CaseFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    membroId: '',
    scadenza: '',
    priorita: 'media' as 'bassa' | 'media' | 'alta',
    status: CaseStatus.NUOVA
  });

  const getMemberName = (id: string) => {
    const m = members.find(item => item.id === id);
    return m ? `${m.nome} ${m.cognome}` : 'Sconosciuto';
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.COMPLETATA:
        return <span className="px-2 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase bg-green-100 text-green-700">Completato</span>;
      case CaseStatus.URGENTE:
        return <span className="px-2 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase bg-red-100 text-red-700">Urgente</span>;
      case CaseStatus.IN_LAVORAZIONE:
        return <span className="px-2 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase bg-orange-100 text-orange-700">In Lavorazione</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase bg-blue-100 text-blue-700">Attivo</span>;
    }
  };

  const handleExportCasesList = () => {
    const data = cases.map(c => ({
      ...c,
      membro: getMemberName(c.membroId),
      stato: c.status.toUpperCase()
    }));
    exportReportPDF('Registro Pratiche', data, ['Titolo', 'Associato', 'Scadenza', 'Stato'], ['titolo', 'membro', 'scadenza', 'stato']);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileToUpload({
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(2) + ' KB',
          data: event.target?.result as string,
          uploadedBy: currentUser.operatore,
          uploadedAt: new Date().toISOString(),
          id: Math.random().toString(36).substr(2, 9)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const openNewModal = () => {
    setEditingCase(null);
    setFormData({
      titolo: '',
      descrizione: '',
      membroId: members[0]?.id || '',
      scadenza: '',
      priorita: 'media',
      status: CaseStatus.NUOVA
    });
    setFileToUpload(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Case) => {
    setEditingCase(c);
    setFormData({
      titolo: c.titolo,
      descrizione: c.descrizione,
      membroId: c.membroId,
      scadenza: c.scadenza,
      priorita: c.priorita,
      status: c.status
    });
    setFileToUpload(c.files?.[0] || null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.titolo || !formData.membroId || !formData.scadenza) {
      alert('Per favore compila i campi obbligatori (Titolo, Membro, Scadenza).');
      return;
    }

    const caseData: Case = {
      id: editingCase ? editingCase.id : Math.random().toString(36).substr(2, 9),
      titolo: formData.titolo,
      descrizione: formData.descrizione,
      membroId: formData.membroId,
      dataApertura: editingCase ? editingCase.dataApertura : new Date().toISOString().split('T')[0],
      scadenza: formData.scadenza,
      status: formData.status,
      priorita: formData.priorita,
      files: fileToUpload ? [fileToUpload] : [],
      timeline: editingCase ? editingCase.timeline : [],
      sedeId: currentUser.sedeId
    };

    db.saveCase(caseData, currentUser);
    setIsModalOpen(false);
    if (onRefresh) onRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa pratica?')) {
      db.deleteCase(id, currentUser);
      if (onRefresh) onRefresh();
    }
  };

  const downloadAssociatedFile = (file: CaseFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Pratiche</h2>
          <p className="text-sm md:text-gray-500">Monitoraggio e gestione delle vertenze e dei ricorsi.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportCasesList}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all font-medium text-xs md:text-sm"
          >
            <Icons.Download /> <span className="hidden xs:inline">Esporta Registro</span>
          </button>
          <button 
            onClick={openNewModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-all font-medium text-xs md:text-sm">
            <Icons.Plus /> Nuova <span className="hidden xs:inline">Pratica</span>
          </button>
        </div>
      </div>

      {cases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {cases.map((c) => (
            <div key={c.id} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col justify-between animate-slideUp">
              <div>
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(c.status)}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(c)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100" title="Modifica">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100" title="Elimina">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-1">{c.titolo}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{c.descrizione}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Icons.Users />
                    <span className="font-semibold text-gray-700 truncate">{getMemberName(c.membroId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Icons.Calendar />
                    <span>Scadenza: <span className={`font-semibold ${c.status === CaseStatus.URGENTE ? 'text-red-600' : 'text-gray-900'}`}>{c.scadenza}</span></span>
                  </div>
                  {c.files?.[0] && (
                    <div className="flex items-center gap-2 text-[11px] md:text-xs text-blue-600 font-bold bg-blue-50 p-2.5 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => downloadAssociatedFile(c.files[0]!)}>
                      <Icons.Folder />
                      <span className="truncate flex-1">{c.files[0].name}</span>
                      <Icons.Download />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button 
                  onClick={() => exportCasePDF(c, getMemberName(c.membroId))}
                  className="flex items-center gap-2 text-xs md:text-sm font-bold text-blue-800 hover:text-blue-900 transition-colors"
                >
                  <Icons.Download /> <span className="hidden xs:inline">Report</span> PDF
                </button>
                <button 
                  onClick={() => setDetailCase(c)}
                  className="px-3 py-1.5 text-xs md:text-sm font-semibold text-gray-500 hover:text-blue-800 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Dettagli
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[1.5rem] md:rounded-2xl border border-dashed border-gray-200 p-8 md:p-12 text-center text-gray-400">
           <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                <Icons.Briefcase />
              </div>
           </div>
           <h3 className="text-lg font-bold text-gray-900 mb-1">Nessuna pratica presente</h3>
           <p className="text-sm max-w-xs mx-auto">Inizia a gestire la sede creando la prima pratica per i tuoi iscritti.</p>
           <button onClick={openNewModal} className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-all font-medium">
             <Icons.Plus /> Crea Prima Pratica
           </button>
        </div>
      )}

      {/* MODAL: CREATE / EDIT CASE RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{editingCase ? 'Modifica Pratica' : 'Nuova Pratica'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Titolo Pratica *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                  placeholder="Esempio: Ricorso Pensionistico INPS"
                  value={formData.titolo}
                  onChange={e => setFormData({...formData, titolo: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Iscritto Associato *</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    value={formData.membroId}
                    onChange={e => setFormData({...formData, membroId: e.target.value})}
                  >
                    <option value="">Seleziona Iscritto</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.cognome} {m.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Scadenza *</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    value={formData.scadenza}
                    onChange={e => setFormData({...formData, scadenza: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Priorità</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    value={formData.priorita}
                    onChange={e => setFormData({...formData, priorita: e.target.value as any})}
                  >
                    <option value="bassa">Bassa</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Stato Pratica</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value={CaseStatus.NUOVA}>Nuova</option>
                    <option value={CaseStatus.IN_LAVORAZIONE}>In Lavorazione</option>
                    <option value={CaseStatus.URGENTE}>Urgente</option>
                    <option value={CaseStatus.COMPLETATA}>Chiusa (Completato)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Descrizione Pratica</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  rows={3}
                  placeholder="Dettagli aggiuntivi, note legali, etc."
                  value={formData.descrizione}
                  onChange={e => setFormData({...formData, descrizione: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Documento Allegato</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  {fileToUpload ? (
                    <div className="flex items-center gap-3 w-full">
                       <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0">
                         <Icons.Folder />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-xs font-bold text-gray-900 truncate">{fileToUpload.name}</p>
                         <p className="text-[10px] text-gray-400">{fileToUpload.size}</p>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setFileToUpload(null); }}
                         className="p-1.5 text-red-400 hover:text-red-600">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-gray-300 mb-2"><Icons.Download /></div>
                      <p className="text-xs font-bold text-gray-500">Tocca per allegare un documento</p>
                      <p className="text-[10px] text-gray-400 mt-1">PDF, Immagini (Max 2MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 order-2 sm:order-1"
              >
                Annulla
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 text-[10px] md:text-xs font-bold bg-blue-800 text-white rounded-xl shadow-lg hover:bg-blue-900 transition-all uppercase tracking-widest active:scale-[0.98] order-1 sm:order-2"
              >
                {editingCase ? 'Salva Modifiche' : 'Crea Pratica'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL RESPONSIVE */}
      {detailCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-blue-800 text-white shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 truncate">Dettaglio Pratica #{detailCase.id}</p>
                <h3 className="text-lg md:text-xl font-bold truncate">{detailCase.titolo}</h3>
              </div>
              <button onClick={() => setDetailCase(null)} className="p-1 text-white/70 hover:text-white transition-colors shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 overflow-y-auto no-scrollbar">
               <div className="space-y-6">
                 <div>
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Info Principali</h4>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-xs text-gray-500">Iscritto:</span>
                        <span className="text-xs md:text-sm font-bold text-gray-900 truncate ml-2">{getMemberName(detailCase.membroId)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-xs text-gray-500">Aperta il:</span>
                        <span className="text-xs md:text-sm font-bold text-gray-900">{detailCase.dataApertura}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-xs text-gray-500">Scadenza:</span>
                        <span className="text-xs md:text-sm font-bold text-red-600">{detailCase.scadenza}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-xs text-gray-500">Priorità:</span>
                        <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${detailCase.priorita === 'alta' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {detailCase.priorita}
                        </span>
                      </div>
                   </div>
                 </div>

                 {detailCase.files?.[0] && (
                   <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                     <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-3 ml-1">Allegato</h4>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-800 shadow-sm shrink-0">
                          <Icons.Folder />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{detailCase.files[0].name}</p>
                          <p className="text-[10px] text-gray-500">{detailCase.files[0].size}</p>
                        </div>
                        <button 
                          onClick={() => downloadAssociatedFile(detailCase.files[0]!)}
                          className="p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors shrink-0">
                          <Icons.Download />
                        </button>
                     </div>
                   </div>
                 )}
               </div>

               <div>
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Descrizione</h4>
                 <div className="p-4 bg-gray-50 rounded-2xl text-xs md:text-sm text-gray-600 min-h-[120px] leading-relaxed">
                   {detailCase.descrizione || "Nessuna descrizione aggiuntiva fornita."}
                 </div>
                 
                 <div className="mt-8 flex flex-col sm:flex-row gap-3">
                   <button 
                     onClick={() => { openEditModal(detailCase); setDetailCase(null); }}
                     className="flex-1 py-3 bg-blue-50 text-blue-800 text-[10px] md:text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors uppercase tracking-widest"
                   >
                     Modifica
                   </button>
                   <button 
                     onClick={() => { exportCasePDF(detailCase, getMemberName(detailCase.membroId)); }}
                     className="flex-1 py-3 bg-gray-100 text-gray-600 text-[10px] md:text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest"
                   >
                     Esporta PDF
                   </button>
                 </div>
               </div>
            </div>
            
            <div className="p-5 md:p-6 bg-gray-50 border-t border-gray-100 text-center shrink-0">
              <button 
                onClick={() => setDetailCase(null)}
                className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
