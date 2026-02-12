
import React, { useState, useRef } from 'react';
import { Document, Member, Case, User } from '../types';
import { Icons } from '../constants';
import { db } from '../services/db';

interface DocumentsProps {
  documents: Document[];
  members: Member[];
  cases: Case[];
  currentUser: User;
  onRefresh: () => void;
}

const Documents: React.FC<DocumentsProps> = ({ documents, members, cases, currentUser, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    associatedMemberId: '',
    associatedCaseId: '',
    fileData: '',
    fileName: '',
    fileSize: '',
    fileType: ''
  });

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData({
        ...formData,
        fileData: e.target?.result as string,
        fileName: file.name,
        name: formData.name || file.name.split('.')[0],
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        fileType: file.type || 'Documento'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    if (!formData.fileData || !formData.name) {
      alert('Carica un file e inserisci un nome.');
      return;
    }

    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      type: formData.fileType,
      dateAdded: new Date().toLocaleDateString('it-IT'),
      size: formData.fileSize,
      data: formData.fileData,
      sedeId: currentUser.sedeId,
      associatedMemberId: formData.associatedMemberId || undefined,
      associatedCaseId: formData.associatedCaseId || undefined
    };

    db.saveDocument(newDoc, currentUser);
    setIsModalOpen(false);
    setFormData({ name: '', associatedMemberId: '', associatedCaseId: '', fileData: '', fileName: '', fileSize: '', fileType: '' });
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo documento?')) {
      db.deleteDocument(id, currentUser);
      onRefresh();
    }
  };

  const handleDownload = (doc: Document) => {
    const link = window.document.createElement('a');
    link.href = doc.data;
    link.download = doc.name + (doc.type.includes('/') ? `.${doc.type.split('/')[1]}` : '');
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documenti Sede</h2>
          <p className="text-sm md:text-base text-gray-500">Archivio digitale della modulistica e dei regolamenti.</p>
        </div>
        <div className="w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-all font-medium text-xs md:text-sm"
          >
            <Icons.Plus /> Carica Documento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group active:scale-[0.98] flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:bg-blue-800 group-hover:text-white transition-colors">
                  <Icons.Folder />
               </div>
               <button 
                 onClick={() => handleDelete(doc.id)}
                 className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{doc.name}</h4>
            
            <div className="mb-4">
              {doc.associatedMemberId && (
                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mb-1">
                   <Icons.Users />
                   <span className="truncate">{members.find(m => m.id === doc.associatedMemberId)?.cognome}</span>
                </div>
              )}
              {doc.associatedCaseId && (
                <div className="flex items-center gap-1.5 text-[9px] text-blue-400">
                   <Icons.Briefcase />
                   <span className="truncate">{cases.find(c => c.id === doc.associatedCaseId)?.titolo}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 mt-auto">
              <span className="truncate max-w-[60%]">{doc.type.split('/')[1] || doc.type}</span>
              <span>{doc.size}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">{doc.dateAdded}</span>
              <button 
                onClick={() => handleDownload(doc)}
                className="p-2 text-blue-800 hover:bg-blue-50 rounded-lg transition-colors shadow-sm bg-gray-50/50"
              >
                <Icons.Download />
              </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all group min-h-[140px] md:min-h-[160px] active:scale-[0.98]"
        >
           <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
             <Icons.Plus />
           </div>
           <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Nuovo Documento</span>
        </button>
      </div>

      {documents.length === 0 && (
        <div className="mt-8 p-12 bg-white rounded-[1.5rem] md:rounded-2xl border border-gray-100 text-center text-gray-400 shadow-sm">
          <p className="text-sm font-medium italic">L'archivio è attualmente vuoto.</p>
        </div>
      )}

      {/* MODAL UPLOAD DOCUMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-blue-950/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div>
                  <h3 className="text-xl md:text-2xl font-black text-blue-950">Carica Documento</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Archiviazione sicura file di sede</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-1 space-y-6">
               {/* Drag and Drop Zone */}
               <div 
                 onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                 onDragLeave={() => setIsDragging(false)}
                 onDrop={handleDrop}
                 onClick={() => fileInputRef.current?.click()}
                 className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                   isDragging ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-300'
                 }`}
               >
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                   accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                 />
                 {formData.fileData ? (
                   <div className="flex items-center gap-4 w-full">
                      <div className="w-16 h-16 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center shrink-0">
                         <Icons.Folder />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{formData.fileName}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{formData.fileSize}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFormData({...formData, fileData: '', fileName: ''}); }}
                        className="text-red-500 font-bold text-xs hover:underline"
                      >
                        Sostituisci
                      </button>
                   </div>
                 ) : (
                   <>
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-300 mb-4 group-hover:scale-110 transition-transform">
                        <Icons.Download />
                     </div>
                     <p className="text-sm font-bold text-gray-900">Seleziona un file o trascinalo qui</p>
                     <p className="text-xs text-gray-400 mt-1">PDF, Word, Immagini (Max 5MB)</p>
                   </>
                 )}
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Documento *</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50 outline-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Esempio: Modulo Adesione 2024"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Associa a Iscritto</label>
                        <select 
                          className="w-full px-4 py-3 md:py-4 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.associatedMemberId}
                          onChange={e => setFormData({...formData, associatedMemberId: e.target.value})}
                        >
                          <option value="">Nessun Iscritto</option>
                          {members.map(m => (
                            <option key={m.id} value={m.id}>{m.cognome} {m.nome}</option>
                          ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Associa a Pratica</label>
                        <select 
                          className="w-full px-4 py-3 md:py-4 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.associatedCaseId}
                          onChange={e => setFormData({...formData, associatedCaseId: e.target.value})}
                        >
                          <option value="">Nessuna Pratica</option>
                          {cases.map(c => (
                            <option key={c.id} value={c.id}>{c.titolo}</option>
                          ))}
                        </select>
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
                  Salva Documento
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
