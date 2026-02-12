
import React from 'react';
import { Notification, ViewType } from '../types';
import { Icons } from '../constants';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onNavigate: (view: ViewType) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  onClose, 
  onMarkAsRead, 
  onNavigate 
}) => {
  const handleItemClick = (n: Notification) => {
    onMarkAsRead(n.id);
    onNavigate(n.targetView);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose}></div>
      <div className="absolute top-16 right-8 w-80 max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[70] flex flex-col animate-slideUp overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900">Notifiche Centro Sede</h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">
            {notifications.filter(n => !n.isRead).length} Nuove
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${
                    n.type === 'danger' ? 'bg-red-500' : 
                    n.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[9px] text-gray-400 mt-2 font-medium">{n.date}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-3 text-gray-300">
                <Icons.Bell />
              </div>
              <p className="text-xs font-medium text-gray-400 italic">Nessuna notifica presente</p>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-100 text-center bg-gray-50/30">
          <button 
            onClick={onClose}
            className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
          >
            Chiudi Pannello
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
