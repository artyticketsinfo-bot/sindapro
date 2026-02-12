import React, { useState } from 'react';
import { CalendarEvent, Case, CalendarEventType } from '../types';
import { Icons, COLORS } from '../constants';

interface CalendarProps {
  events: CalendarEvent[];
  cases: Case[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, cases, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(new Date().getDate());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<{ title: string; description: string; date: string; critical: boolean; type: CalendarEventType }>({ 
    title: '', 
    description: '', 
    date: '', 
    critical: false, 
    type: 'programma' 
  });

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const monthName = selectedDate.toLocaleString('it-IT', { month: 'long' });
  
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust first day for Monday start (0=Sun -> 0=Mon)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const handleSave = () => {
    if (editingEvent) {
      onUpdateEvent(editingEvent);
    } else {
      if (!newEvent.title || !newEvent.date) return;
      onAddEvent({
        id: Math.random().toString(36).substr(2, 9),
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        type: newEvent.type,
        critical: newEvent.type === 'urgente' || newEvent.critical,
        category: 'altro',
        sedeId: '' 
      });
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setNewEvent({ title: '', description: '', date: '', critical: false, type: 'programma' });
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDayClick = (dayNum: number) => {
    setActiveDay(dayNum);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setNewEvent(prev => ({ ...prev, date: dateStr }));
    setShowModal(true);
  };

  const toggleComplete = (event: CalendarEvent) => {
    onUpdateEvent({
      ...event,
      type: event.type === 'completato' ? 'programma' : 'completato'
    });
  };

  const getEventsForDay = (day: number) => {
    const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dStr);
    const dayDeadlines = cases
      .filter(c => c.scadenza === dStr)
      .map(c => ({
        id: `case-${c.id}`,
        title: `SCADENZA: ${c.titolo}`,
        description: c.descrizione,
        date: c.scadenza,
        type: 'urgente',
        critical: true
      } as CalendarEvent));
    
    return [...dayEvents, ...dayDeadlines];
  };

  const getEventStyle = (type: CalendarEventType) => {
    switch (type) {
      case 'urgente':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'completato':
        return 'bg-green-50 border-green-200 text-green-700 opacity-70 line-through';
      case 'annullato':
        return 'bg-gray-100 border-gray-200 text-gray-400 line-through';
      case 'rimandato':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'confermato':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'programma':
      default:
        return 'bg-blue-50/50 border-blue-100 text-blue-600';
    }
  };

  const getStatusLabel = (type: CalendarEventType) => {
    switch (type) {
      case 'urgente': return 'Urgente';
      case 'completato': return 'Completato';
      case 'annullato': return 'Annullato';
      case 'rimandato': return 'Rimandato';
      case 'confermato': return 'Confermato';
      case 'programma': return 'In programma';
      default: return type;
    }
  };

  const activeDayEvents = activeDay ? getEventsForDay(activeDay) : [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 md:gap-4 mb-1">
            <button 
              onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))}
              className="p-1.5 md:p-2 hover:bg-white rounded-lg transition-colors text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 capitalize min-w-[140px] md:min-w-[180px] text-center">{monthName} {currentYear}</h2>
            <button 
              onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))}
              className="p-1.5 md:p-2 hover:bg-white rounded-lg transition-colors text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-xs md:text-gray-500">Gestione appuntamenti e scadenze sede con stati operativi.</p>
        </div>
        <div className="w-full md:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-all font-medium text-xs md:text-sm"
          >
            <Icons.Plus /> Nuovo Evento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
              <div key={day} className="py-2 md:py-3 text-center text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-t border-gray-100">
            {Array.from({ length: 42 }).map((_, i) => {
              const dayNum = i - adjustedFirstDay + 1;
              const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth(currentMonth, currentYear);
              const dayEvents = isCurrentMonth ? getEventsForDay(dayNum) : [];
              const hasEvents = dayEvents.length > 0;
              const isToday = isCurrentMonth && dayNum === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

              return (
                <button 
                  key={i} 
                  onClick={() => isCurrentMonth && handleDayClick(dayNum)}
                  className={`min-h-[70px] md:min-h-[100px] p-1 md:p-2 border-r border-b border-gray-100 transition-all text-left group flex flex-col relative active:scale-[0.98] ${
                    isCurrentMonth ? 'bg-white hover:bg-blue-50/30' : 'bg-gray-50/50 cursor-default'
                  } ${activeDay === dayNum ? 'bg-blue-50/50 ring-2 ring-inset ring-blue-500 z-10' : ''}`}
                >
                  {isCurrentMonth && (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] md:text-xs font-bold ${isToday ? 'bg-blue-800 text-white w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full' : (hasEvents ? 'text-gray-900' : 'text-gray-400')}`}>
                          {dayNum}
                        </span>
                        {hasEvents && <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-500" />}
                      </div>
                      <div className="space-y-0.5 md:space-y-1 overflow-hidden">
                        {dayEvents.slice(0, window.innerWidth < 768 ? 1 : 3).map(e => (
                          <div 
                            key={e.id} 
                            className={`text-[7px] md:text-[8px] p-0.5 md:p-1 rounded border leading-none font-bold uppercase tracking-tighter truncate ${getEventStyle(e.type)}`}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > (window.innerWidth < 768 ? 1 : 3) && (
                          <div className="text-[6px] md:text-[8px] text-gray-400 font-bold px-1">+{dayEvents.length - (window.innerWidth < 768 ? 1 : 3)}</div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-fadeIn h-fit max-h-[500px] lg:max-h-none">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">
              {activeDay ? `${activeDay} ${monthName}` : 'Dettagli Giorno'}
            </h3>
            <Icons.Calendar />
          </div>
          <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">
            {activeDayEvents.length > 0 ? (
              activeDayEvents.map(e => (
                <div 
                  key={e.id} 
                  className={`p-3 md:p-4 rounded-xl border transition-all group bg-white border-gray-100 shadow-sm hover:shadow-md ${e.type === 'annullato' || e.type === 'completato' ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${getEventStyle(e.type)}`}>
                      {getStatusLabel(e.type)}
                    </span>
                    {!e.id.toString().startsWith('case-') && (
                      <div className="flex gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={(e_ev) => { e_ev.stopPropagation(); toggleComplete(e); }} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Segna come completato">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={(e_ev) => { e_ev.stopPropagation(); handleEdit(e); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Modifica">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                        <button onClick={(e_ev) => { e_ev.stopPropagation(); onDeleteEvent(e.id); }} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Elimina">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <h4 className={`text-sm font-bold text-gray-900 ${e.type === 'completato' || e.type === 'annullato' ? 'line-through' : ''}`}>{e.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-1">{e.description}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-8 opacity-40">
                <Icons.Calendar />
                <p className="text-[10px] md:text-xs font-bold mt-4 uppercase tracking-widest">Nessun evento</p>
                <p className="text-[9px] md:text-[10px] mt-1">Seleziona un giorno o crea un impegno.</p>
              </div>
            )}
          </div>
          {activeDay && (
             <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
               <button 
                 onClick={() => {
                   setNewEvent({...newEvent, date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`});
                   setShowModal(true);
                 }}
                 className="w-full py-2.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-lg hover:bg-blue-200 transition-colors uppercase tracking-widest active:scale-[0.98]"
               >
                 Aggiungi Impegno
               </button>
             </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[1.5rem] md:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{editingEvent ? 'Modifica Evento' : 'Nuovo Evento'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 md:p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Titolo dell'Evento *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                  value={editingEvent ? editingEvent.title : newEvent.title}
                  onChange={e => editingEvent ? setEditingEvent({...editingEvent, title: e.target.value}) : setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Incontro per Ricorso..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Data *</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    value={editingEvent ? editingEvent.date : newEvent.date}
                    onChange={e => editingEvent ? setEditingEvent({...editingEvent, date: e.target.value}) : setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Stato Operativo</label>
                   <select 
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                     value={editingEvent ? editingEvent.type : newEvent.type}
                     onChange={e => editingEvent ? setEditingEvent({...editingEvent, type: e.target.value as any}) : setNewEvent({...newEvent, type: e.target.value as any})}
                   >
                     <option value="programma">In programma</option>
                     <option value="confermato">Confermato</option>
                     <option value="urgente">Urgente</option>
                     <option value="completato">Completato</option>
                     <option value="annullato">Annullato</option>
                     <option value="rimandato">Rimandato</option>
                   </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Dettagli</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  rows={3}
                  value={editingEvent ? editingEvent.description : newEvent.description}
                  onChange={e => editingEvent ? setEditingEvent({...editingEvent, description: e.target.value}) : setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Annotazioni sede..."
                ></textarea>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="critical" 
                  className="w-5 h-5 rounded border-gray-200 text-blue-600 focus:ring-blue-500"
                  checked={editingEvent ? editingEvent.critical : newEvent.critical}
                  onChange={e => editingEvent ? setEditingEvent({...editingEvent, critical: e.target.checked}) : setNewEvent({...newEvent, critical: e.target.checked})}
                />
                <label htmlFor="critical" className="text-xs font-bold text-gray-700 select-none cursor-pointer uppercase tracking-tighter">Evidenzia come prioritario</label>
              </div>
            </div>
            <div className="p-5 md:p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-100 shrink-0">
              <button 
                onClick={closeModal}
                className="flex-1 py-3 font-bold text-gray-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 uppercase text-[10px] md:text-xs tracking-widest order-2 sm:order-1"
              >
                Annulla
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 font-bold bg-blue-800 text-white rounded-xl shadow-lg hover:bg-blue-900 transition-all uppercase text-[10px] md:text-xs tracking-widest active:scale-95 order-1 sm:order-2"
              >
                {editingEvent ? 'Aggiorna Evento' : 'Salva Evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;