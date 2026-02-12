
import React from 'react';
import { Member, Case, ViewType, CaseStatus, Document, ActivityLog, UserRole } from '../types';
import { Icons, COLORS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { exportReportPDF } from '../services/pdf';

interface DashboardProps {
  members: Member[];
  cases: Case[];
  documents: Document[];
  logs: ActivityLog[];
  onNavigate: (view: ViewType) => void;
  userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ members, cases, documents, logs, onNavigate, userRole }) => {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.quotaAttiva).length;
  const openCases = cases.filter(c => c.status !== CaseStatus.COMPLETATA).length;
  const urgentCases = cases.filter(c => c.status === CaseStatus.URGENTE).length;

  const caseDistribution = [
    { name: 'Attive', value: cases.filter(c => c.status === CaseStatus.NUOVA).length, color: COLORS.info },
    { name: 'In Lavorazione', value: cases.filter(c => c.status === CaseStatus.IN_LAVORAZIONE).length, color: COLORS.warning },
    { name: 'Urgenti', value: cases.filter(c => c.status === CaseStatus.URGENTE).length, color: COLORS.danger },
    { name: 'Chiuse', value: cases.filter(c => c.status === CaseStatus.COMPLETATA).length, color: COLORS.success },
  ];

  const handleExportQuickReport = () => {
    const reportData = [
      { metrica: 'Iscritti Totali', valore: totalMembers },
      { metrica: 'Iscritti Regolari', valore: activeMembers },
      { metrica: 'Pratiche Aperte', valore: openCases },
      { metrica: 'Urgenze Critiche', valore: urgentCases }
    ];
    exportReportPDF('Analisi Situazionale Sede', reportData, ['Indicatore Performance', 'Dato Riscontrato'], ['metrica', 'valore']);
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick, trend }: any) => (
    <button
      onClick={onClick}
      className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-all text-left group relative overflow-hidden active:scale-[0.98] w-full"
    >
      <div className="z-10">
        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">vs mese prec.</span>
          </div>
        )}
      </div>
      <div className="p-2 md:p-3 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-opacity-100 transition-colors z-10 shrink-0" style={{ color }}>
        <Icon />
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform" style={{ color }}>
        <Icon />
      </div>
    </button>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-blue-950">Analisi Gestionale</h2>
          <p className="text-sm md:text-gray-500 font-medium">Dashboard direzionale per il coordinamento della sede.</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
           <button 
             onClick={handleExportQuickReport}
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white border border-gray-200 rounded-xl text-xs md:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
             <Icons.Download /> <span className="hidden xs:inline">Analisi</span> Rapida
           </button>
           {userRole !== UserRole.VIEWER && (
             <button 
               onClick={() => onNavigate('pratiche')}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-800 text-white rounded-xl text-xs md:text-sm font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-200">
               <Icons.Plus /> Nuova <span className="hidden xs:inline">Attività</span>
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Iscritti" value={totalMembers} icon={Icons.Users} color={COLORS.primary} trend={12} onClick={() => onNavigate('iscritti')} />
        <StatCard title="Pratiche" value={openCases} icon={Icons.Briefcase} color={COLORS.info} trend={-5} onClick={() => onNavigate('pratiche')} />
        <StatCard title="Documenti" value={documents.length} icon={Icons.Folder} color={COLORS.warning} onClick={() => onNavigate('documenti')} />
        <StatCard title="Urgenze" value={urgentCases} icon={Icons.Bell} color={COLORS.danger} onClick={() => onNavigate('calendario')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Chart 1: Distribution */}
        <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 md:mb-8">
            <h3 className="text-sm md:text-lg font-black text-blue-950 uppercase tracking-widest">Distribuzione Pratiche</h3>
            <span className="text-[10px] md:text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Dati in tempo reale</span>
          </div>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caseDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 768 ? 30 : 45}>
                  {caseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Quick Status */}
        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm md:text-lg font-black text-blue-950 uppercase tracking-widest mb-6 md:mb-8">Composizione Iscritti</h3>
          <div className="flex-1 h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Regolari', value: activeMembers, color: COLORS.success },
                    { name: 'Irregolari', value: totalMembers - activeMembers, color: COLORS.danger },
                  ]}
                  innerRadius={window.innerWidth < 768 ? 50 : 60}
                  outerRadius={window.innerWidth < 768 ? 70 : 80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={COLORS.success} />
                  <Cell fill={COLORS.danger} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
             <div className="flex items-center justify-between text-[11px] md:text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="font-bold text-gray-500">Regolari</span>
                </div>
                <span className="font-black text-blue-950">{activeMembers}</span>
             </div>
             <div className="flex items-center justify-between text-[11px] md:text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-bold text-gray-500">Irregolari</span>
                </div>
                <span className="font-black text-blue-950">{totalMembers - activeMembers}</span>
             </div>
          </div>
        </div>

        {/* Activity Log Widget */}
        <div className="lg:col-span-1 bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm md:text-lg font-black text-blue-950 uppercase tracking-widest">Attività Sede</h3>
            <Icons.Briefcase />
          </div>
          <div className="space-y-5 md:space-y-6">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="relative pl-5 pb-5 md:pl-6 md:pb-6 border-l-2 border-gray-50 last:pb-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-100"></div>
                <p className="text-[9px] md:text-[10px] font-bold text-blue-800 uppercase tracking-tighter">{log.action}</p>
                <p className="text-[11px] md:text-xs font-bold text-gray-900 mt-1 line-clamp-1">{log.details}</p>
                <div className="flex items-center gap-2 mt-1 md:mt-2">
                   <p className="text-[8px] md:text-[9px] text-gray-400 font-bold">{log.userName}</p>
                   <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                   <p className="text-[8px] md:text-[9px] text-gray-300 font-medium">{log.timestamp.split(',')[1]}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-xs text-gray-400 italic text-center py-6 md:py-8">Nessuna attività registrata.</p>}
          </div>
          <button 
            onClick={() => onNavigate('log')}
            className="w-full mt-4 md:mt-6 py-2.5 md:py-3 bg-gray-50 text-gray-500 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all">
            Vedi Log Completo
          </button>
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="text-sm md:text-lg font-black text-blue-950 uppercase tracking-widest">Scadenze Imminenti</h3>
            <button onClick={() => onNavigate('calendario')} className="text-[11px] md:text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Vedi Calendario</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
             {cases.filter(c => c.status !== CaseStatus.COMPLETATA).slice(0, 4).map(c => (
               <div key={c.id} className="p-4 md:p-5 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <span className={`text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${c.status === CaseStatus.URGENTE ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.status}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-300 group-hover:text-blue-800 transition-colors">{c.scadenza}</span>
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-900 mb-1 truncate">{c.titolo}</h4>
                  <p className="text-[9px] md:text-[10px] text-gray-400 font-medium line-clamp-1">Assegnata a: {c.assegnatoA || 'Non assegnata'}</p>
               </div>
             ))}
             {cases.length === 0 && <p className="col-span-1 sm:col-span-2 text-center text-xs text-gray-400 py-10 md:py-12 italic">Nessuna scadenza programmata.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
