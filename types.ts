
export enum UserRole {
  OWNER = 'proprietaria',
  ADMIN = 'amministratore',
  OPERATOR = 'operatore',
  VIEWER = 'visualizzatore'
}

export enum CaseStatus {
  NUOVA = 'nuova',
  IN_LAVORAZIONE = 'in_lavorazione',
  ATTESA_DOCUMENTI = 'in_attesa_documenti',
  IN_VERIFICA = 'in_verifica',
  COMPLETATA = 'completata',
  ARCHIVIATA = 'archiviata',
  URGENTE = 'urgente'
}

export enum MemberStatus {
  ATTIVO = 'attivo',
  SOSPESO = 'sospeso'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  nomeSede: string;
  operatore: string;
  role: UserRole;
  sedeId: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  sedeId: string;
}

export interface Member {
  id: string;
  nome: string;
  cognome: string;
  dataNascita: string;
  dataInizioCollaborazione: string;
  codiceFiscale: string;
  email: string;
  telefono: string;
  ruolo: 'dipendente' | 'responsabile';
  dataIscrizione: string;
  quotaAttiva: boolean;
  status: MemberStatus;
  sedeId: string;
  note?: string;
  storico?: { date: string; action: string }[];
}

export interface CaseFile {
  id: string;
  name: string;
  type: string;
  size: string;
  data: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CaseTimelineEvent {
  id: string;
  date: string;
  user: string;
  content: string;
}

export interface Case {
  id: string;
  titolo: string;
  descrizione: string;
  membroId: string;
  assegnatoA?: string;
  dataApertura: string;
  scadenza: string;
  status: CaseStatus;
  priorita: 'bassa' | 'media' | 'alta';
  files: CaseFile[];
  timeline: CaseTimelineEvent[];
  sedeId: string;
  ultimaModifica?: string;
}

export type CalendarEventType = 
  | 'programma' 
  | 'confermato' 
  | 'urgente' 
  | 'completato' 
  | 'annullato' 
  | 'rimandato';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: CalendarEventType;
  category: 'riunione' | 'pratica' | 'scadenza' | 'altro';
  critical: boolean;
  description: string;
  sedeId: string;
  relatedId?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  dateAdded: string;
  size: string;
  data: string; // Base64 file content
  sedeId: string;
  associatedMemberId?: string;
  associatedCaseId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger';
  date: string;
  isRead: boolean;
  targetView: ViewType;
  sedeId: string;
}

export type ViewType = 
  | 'dashboard' 
  | 'iscritti' 
  | 'pratiche' 
  | 'documenti' 
  | 'calendario' 
  | 'log' 
  | 'workflow' 
  | 'privacy' 
  | 'terms' 
  | 'support';
