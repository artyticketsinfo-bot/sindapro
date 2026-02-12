
import React, { useState } from 'react';
import { Case, CaseStatus, Member, User, UserRole } from '../types';
import { Icons, COLORS } from '../constants';
import { db } from '../services/db';

interface WorkflowProps {
  cases: Case[];
  members: Member[];
  onRefresh: () => void;
  currentUser: User;
}

const Workflow: React.FC<WorkflowProps> = ({ cases, members, onRefresh, currentUser }) => {
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null);

  const columns = [
    { id: CaseStatus.NUOVA, label: 'Nuova', color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { id: CaseStatus.IN_LAVORAZIONE, label: 'In Lavorazione', color: 'bg-orange-50 border-orange-100 text-orange-700' },
    { id: CaseStatus.ATTESA_DOCUMENTI, label: 'In Attesa Doc', color: 'bg-amber-50 border-amber-100 text-amber-700' },
    { id: CaseStatus.IN_VERIFICA, label: 'In Verifica', color: 'bg-purple-50 border-purple-100 text-purple-700' },
    { id: CaseStatus.COMPLETATA, label: 'Completata', color: 'bg-green-50 border-green-100 text-green-700' },
    { id: CaseStatus.ARCHIVIATA, label: 'Archiviata', color: 'bg-gray-100 border-gray-200 text-gray-600' },
  ];

  const getMemberName = (id: string) => {
    const m = members.find(item => item.id === id);
    return m ? `${m.nome} ${m.cognome}` : 'Sconosciuto';
  };

  const handleDragStart = (id: string) => {
    setDraggedCaseId(id);
  };

  const handleDrop = (newStatus: CaseStatus) => {
    if (draggedCaseId) {
      const caseToUpdate = cases.find(c => c.id === draggedCaseId);
      if (caseToUpdate && caseToUpdate.status !== newStatus) {
        const updatedCase: Case = {
          ...caseToUpdate,
          status: newStatus,
          ultimaModifica: new Date().toLocaleString('it-IT'),
          timeline: [
            ...caseToUpdate.timeline,
            {
              id: Math.random().toString(36).substr(2, 9),
              date: new Date().toLocaleString('it-IT'),
              user: currentUser.operatore,
              content: `Spostata in stato: ${newStatus.toUpperCase().replace(/_/g, ' ')}`
            }
          ]
        };
        db.saveCase(updatedCase, currentUser);
        onRefresh();
      }
      setDraggedCaseId(null);
    }
  };

  const getDaysRemaining = (scadenza: string) => {
    const today = new Date();
    const expiry = new Date(scadenza);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-blue-950">Workflow Operativo</h2>
        <p className="text-gray-500 font-medium">Gestione visualizzata dei flussi di lavoro e delle vertenze.</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar min-h-[600px] items-start">
        {columns.map(col => (
          <div 
            key={col.id} 
            className="flex-shrink-0 w-80 bg-gray-50/50 rounded-[2rem] border border-gray-100 p-4 flex flex-col min-h-[500px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            <div className={`flex items-center justify-between p-3 rounded-2xl border mb-4 ${col.color}`}>
              <h3 className="text-xs font-black uppercase tracking-widest">{col.label}</h3>
              <span className="px-2 py-0.5 bg-white/50 rounded-lg text-[10px] font-black">
                {cases.filter(c => c.status === col.id).length}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              {cases.filter(c => c.status === col.id).map(c => {
                const daysLeft = getDaysRemaining(c.scadenza);
                const isDelayed = daysLeft < 0;

                return (
                  <div 
                    key={c.id}
                    draggable
                    onDragStart={() => handleDragStart(c.id)}
                    className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group ${isDelayed ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        c.priorita === 'alta' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {c.priorita}
                      </span>
                      <div className="text-[9px] font-bold text-gray-300 group-hover:text-blue-500 transition-colors">
                        #{c.id.substr(0,4)}
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-black text-blue-950 mb-2 line-clamp-2 leading-tight">{c.titolo}</h4>
                    
                    <div className="flex items-center gap-2 mb-4">
                       <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-black">
                         {getMemberName(c.membroId)[0]}
                       </div>
                       <span className="text-[10px] font-bold text-gray-500 truncate">{getMemberName(c.membroId)}</span>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Responsabile</span>
                        <span className="text-[10px] font-bold text-blue-800">{c.assegnatoA || currentUser.operatore}</span>
                      </div>
                      <div className={`text-right ${isDelayed ? 'text-red-500' : 'text-gray-400'}`}>
                         <p className="text-[8px] font-black uppercase tracking-widest">Scadenza</p>
                         <p className="text-[10px] font-bold">{c.scadenza}</p>
                      </div>
                    </div>
                    
                    {isDelayed && (
                      <div className="mt-3 py-1 px-3 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase text-center animate-pulse">
                        Ritardo: {Math.abs(daysLeft)} giorni
                      </div>
                    )}
                  </div>
                );
              })}
              
              {cases.filter(c => c.status === col.id).length === 0 && (
                <div className="py-12 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest opacity-40">
                  Vuoto
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workflow;
