
import { Member, Case, CalendarEvent, Document, User, Notification, ActivityLog, UserRole } from '../types';

const STORAGE_KEYS = {
  USERS: 'gs_users',
  SESSION: 'gs_current_session',
  MEMBERS: 'gs_members',
  CASES: 'gs_cases',
  EVENTS: 'gs_events',
  DOCS: 'gs_documents',
  NOTIFICATIONS: 'gs_notifications',
  LOGS: 'gs_activity_logs'
};

/**
 * GESTIONE SINDACALE - Database Service (Simulated Production API)
 * Questo modulo gestisce la persistenza e l'isolamento dei dati per sede (sedeId).
 */
export const db = {
  // --- HELPERS PRIVATI ---
  _getRaw: (key: string) => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  _setRaw: (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- AUTENTICAZIONE E SESSIONE ---
  getUsers: (): User[] => db._getRaw(STORAGE_KEYS.USERS),
  
  registerUser: (user: User) => {
    const users = db.getUsers();
    // Verifica se la sede esiste già per assegnare il ruolo corretto
    const sameSedeUsers = users.filter(u => u.nomeSede.toLowerCase() === user.nomeSede.toLowerCase());
    
    // Se è il primo utente della sede, è OWNER, altrimenti OPERATOR
    user.role = sameSedeUsers.length === 0 ? UserRole.OWNER : UserRole.OPERATOR;
    // Se la sede esiste già, usa lo stesso sedeId
    if (sameSedeUsers.length > 0) {
      user.sedeId = sameSedeUsers[0].sedeId;
    }

    users.push(user);
    db._setRaw(STORAGE_KEYS.USERS, users);
    db.logActivity(user.id, user.operatore, 'Registrazione', `Nuovo account creato per la sede: ${user.nomeSede}`, user.sedeId);
  },

  authenticate: (email: string, pass: string): User | null => {
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      const sessionUser = { ...user };
      delete sessionUser.password; // Non salviamo mai la password in sessione
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
      db.logActivity(user.id, user.operatore, 'Login', 'Accesso al gestionale effettuato', user.sedeId);
      return sessionUser;
    }
    return null;
  },

  getCurrentSession: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },

  logout: () => {
    const session = db.getCurrentSession();
    if (session) {
      db.logActivity(session.id, session.operatore, 'Logout', 'Chiusura sessione', session.sedeId);
    }
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // --- LOG ATTIVITÀ (Solo per Owner/Admin della sede) ---
  logActivity: (userId: string, userName: string, action: string, details: string, sedeId: string) => {
    const logs = db._getRaw(STORAGE_KEYS.LOGS);
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toLocaleString('it-IT'),
      sedeId
    };
    logs.unshift(newLog);
    db._setRaw(STORAGE_KEYS.LOGS, logs.slice(0, 2000)); // Manteniamo gli ultimi 2000 log
  },

  getLogs: (sedeId: string): ActivityLog[] => {
    return db._getRaw(STORAGE_KEYS.LOGS).filter((l: ActivityLog) => l.sedeId === sedeId);
  },

  // --- ISCRITTI (Tenant Isolated) ---
  getMembers: (sedeId: string): Member[] => {
    return db._getRaw(STORAGE_KEYS.MEMBERS).filter((m: Member) => m.sedeId === sedeId);
  },
  saveMember: (member: Member, currentUser: User) => {
    const allMembers = db._getRaw(STORAGE_KEYS.MEMBERS);
    const index = allMembers.findIndex((m: Member) => m.id === member.id && m.sedeId === currentUser.sedeId);
    
    member.sedeId = currentUser.sedeId; // Forza la proprietà della sede

    if (index > -1) {
      allMembers[index] = member;
      db.logActivity(currentUser.id, currentUser.operatore, 'Modifica Iscritto', `Aggiornata anagrafica di ${member.cognome} ${member.nome}`, currentUser.sedeId);
    } else {
      allMembers.push(member);
      db.logActivity(currentUser.id, currentUser.operatore, 'Nuovo Iscritto', `Inserito ${member.cognome} ${member.nome} nel database`, currentUser.sedeId);
    }
    db._setRaw(STORAGE_KEYS.MEMBERS, allMembers);
  },
  deleteMember: (id: string, currentUser: User) => {
    const filtered = db._getRaw(STORAGE_KEYS.MEMBERS).filter((m: Member) => !(m.id === id && m.sedeId === currentUser.sedeId));
    db._setRaw(STORAGE_KEYS.MEMBERS, filtered);
    db.logActivity(currentUser.id, currentUser.operatore, 'Eliminazione Iscritto', `Rimosso iscritto ID: ${id}`, currentUser.sedeId);
  },

  // --- PRATICHE (Tenant Isolated) ---
  getCases: (sedeId: string): Case[] => {
    return db._getRaw(STORAGE_KEYS.CASES).filter((c: Case) => c.sedeId === sedeId);
  },
  saveCase: (c: Case, currentUser: User) => {
    const allCases = db._getRaw(STORAGE_KEYS.CASES);
    const index = allCases.findIndex((item: Case) => item.id === c.id && item.sedeId === currentUser.sedeId);
    
    c.sedeId = currentUser.sedeId;

    if (index > -1) {
      allCases[index] = c;
      db.logActivity(currentUser.id, currentUser.operatore, 'Aggiornamento Pratica', `Modificata pratica: ${c.titolo}`, currentUser.sedeId);
    } else {
      allCases.push(c);
      db.logActivity(currentUser.id, currentUser.operatore, 'Nuova Pratica', `Creata nuova pratica: ${c.titolo}`, currentUser.sedeId);
    }
    db._setRaw(STORAGE_KEYS.CASES, allCases);
  },
  deleteCase: (id: string, currentUser: User) => {
    const filtered = db._getRaw(STORAGE_KEYS.CASES).filter((c: Case) => !(c.id === id && c.sedeId === currentUser.sedeId));
    db._setRaw(STORAGE_KEYS.CASES, filtered);
    db.logActivity(currentUser.id, currentUser.operatore, 'Eliminazione Pratica', `Archiviata/Rimossa pratica ID: ${id}`, currentUser.sedeId);
  },

  // --- CALENDARIO (Tenant Isolated) ---
  getEvents: (sedeId: string): CalendarEvent[] => {
    return db._getRaw(STORAGE_KEYS.EVENTS).filter((e: CalendarEvent) => e.sedeId === sedeId);
  },
  saveEvent: (event: CalendarEvent, currentUser: User) => {
    const allEvents = db._getRaw(STORAGE_KEYS.EVENTS);
    event.sedeId = currentUser.sedeId;
    allEvents.push(event);
    db._setRaw(STORAGE_KEYS.EVENTS, allEvents);
    db.logActivity(currentUser.id, currentUser.operatore, 'Nuovo Evento', `Pianificato: ${event.title}`, currentUser.sedeId);
  },
  updateEvent: (event: CalendarEvent, currentUser: User) => {
    const allEvents = db._getRaw(STORAGE_KEYS.EVENTS);
    const index = allEvents.findIndex((e: CalendarEvent) => e.id === event.id && e.sedeId === currentUser.sedeId);
    if (index > -1) {
      allEvents[index] = event;
      db._setRaw(STORAGE_KEYS.EVENTS, allEvents);
      db.logActivity(currentUser.id, currentUser.operatore, 'Modifica Evento', `Aggiornato: ${event.title}`, currentUser.sedeId);
    }
  },
  deleteEvent: (id: string, currentUser: User) => {
    const filtered = db._getRaw(STORAGE_KEYS.EVENTS).filter((e: CalendarEvent) => !(e.id === id && e.sedeId === currentUser.sedeId));
    db._setRaw(STORAGE_KEYS.EVENTS, filtered);
    db.logActivity(currentUser.id, currentUser.operatore, 'Eliminazione Evento', `Rimosso appuntamento ID: ${id}`, currentUser.sedeId);
  },

  // --- DOCUMENTI (Tenant Isolated) ---
  getDocuments: (sedeId: string): Document[] => {
    return db._getRaw(STORAGE_KEYS.DOCS).filter((d: Document) => d.sedeId === sedeId);
  },
  saveDocument: (doc: Document, currentUser: User) => {
    const allDocs = db._getRaw(STORAGE_KEYS.DOCS);
    doc.sedeId = currentUser.sedeId;
    allDocs.push(doc);
    db._setRaw(STORAGE_KEYS.DOCS, allDocs);
    db.logActivity(currentUser.id, currentUser.operatore, 'Archiviazione Documento', `Salvato file: ${doc.name}`, currentUser.sedeId);
  },
  deleteDocument: (id: string, currentUser: User) => {
    const filtered = db._getRaw(STORAGE_KEYS.DOCS).filter((d: Document) => !(d.id === id && d.sedeId === currentUser.sedeId));
    db._setRaw(STORAGE_KEYS.DOCS, filtered);
    db.logActivity(currentUser.id, currentUser.operatore, 'Eliminazione Documento', `Rimosso file ID: ${id}`, currentUser.sedeId);
  },

  // --- NOTIFICHE ---
  getNotifications: (sedeId: string): Notification[] => {
    return db._getRaw(STORAGE_KEYS.NOTIFICATIONS).filter((n: Notification) => n.sedeId === sedeId);
  },
  saveNotification: (notification: Notification) => {
    const all = db._getRaw(STORAGE_KEYS.NOTIFICATIONS);
    // Evita duplicati per la stessa pratica nello stesso giorno
    if (!all.some((n: Notification) => n.id === notification.id)) {
      all.unshift(notification);
      db._setRaw(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },
  markAsRead: (id: string) => {
    const all = db._getRaw(STORAGE_KEYS.NOTIFICATIONS);
    const index = all.findIndex((n: Notification) => n.id === id);
    if (index > -1) {
      all[index].isRead = true;
      db._setRaw(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }
};
