export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}

export enum Language {
  PT = 'PT',
  ES = 'ES'
}

export interface User {
  id: string;
  nickname: string;
  role: UserRole;
  graduation: string;
  graduationColor: string;
  name?: string;
  since?: string; // Tempo de capoeira
  avatar?: string;
  mood?: string;
  bio?: string;
  birthDate?: string;
  notes?: string;
  reactions?: string[];
}

export enum NavSection {
  HOME = 'HOME',
  PROFILE = 'PROFILE',
  GALLERY = 'GALLERY',
  MASTERS = 'MASTERS',
  HISTORY = 'HISTORY',
  EVENTS = 'EVENTS',
  LOCATIONS = 'LOCATIONS',
  AI_STUDIO = 'AI_STUDIO',
  AI_CHAT = 'AI_CHAT',
  LIVE_SESSION = 'LIVE_SESSION',
  ADMIN_PANEL = 'ADMIN_PANEL',
  CHAT = 'CHAT',
  FORUM = 'FORUM',
  PARTNERS = 'PARTNERS',
  LIVE = 'LIVE',
  MEETING_ROOM = 'MEETING_ROOM',
  MEMBERS_WALL = 'MEMBERS_WALL',
  LAYOUT_EDITOR = 'LAYOUT_EDITOR',
  STORE = 'STORE',
  FINANCIAL = 'FINANCIAL',
  GRADUATIONS = 'GRADUATIONS'
}

// Data Models for the CMS
export interface Master {
  id: string;
  name: string;
  graduation: string;
  history: string;
  photo?: string;
}

export interface TrainingLocation {
  id: string;
  address: string;
  responsible: string;
  phone: string;
  mapLink: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  poster?: string;
}

export interface GraduationSystem {
  id: string;
  name: string;
  color: string;
  meaning: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  comments: { author: string; text: string }[];
}

export interface Comment {
  id: string;
  userId: string;
  nickname: string;
  text: string;
  timestamp: number;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  description?: string;
  likes: string[]; // Array of user IDs
  comments: Comment[];
  uploadedBy: string; // User ID
  timestamp: number;
}

export interface NavItemConfig {
  section: NavSection;
  label: string;
  icon: string;
  isVisible: boolean;
  showInBottomNav: boolean;
}

export const INITIAL_EVENTS: Event[] = [
  { id: '1', title: 'Batizado e Troca de Cordas', date: '2026-05-15', location: 'Ginásio Municipal' },
  { id: '2', title: 'Roda de Rua - Praça da Sé', date: '2026-04-20', location: 'Praça da Sé' },
  { id: '3', title: 'Workshop de Berimbau', date: '2026-04-25', location: 'Sede do Grupo' },
  { id: '4', title: 'Treino Especial de Saltos', date: '2026-05-02', location: 'Academia Fire' }
];

export const INITIAL_NAV_CONFIG: NavItemConfig[] = [
  { section: NavSection.HOME, label: 'Início', icon: 'Home', isVisible: true, showInBottomNav: true },
  { section: NavSection.PROFILE, label: 'Perfil', icon: 'Users', isVisible: true, showInBottomNav: true },
  { section: NavSection.CHAT, label: 'Chat', icon: 'MessageCircle', isVisible: true, showInBottomNav: true },
  { section: NavSection.STORE, label: 'Loja', icon: 'ShoppingBag', isVisible: true, showInBottomNav: true },
  { section: NavSection.FINANCIAL, label: 'Financeiro', icon: 'DollarSign', isVisible: true, showInBottomNav: true },
  { section: NavSection.GALLERY, label: 'Galeria', icon: 'Image', isVisible: true, showInBottomNav: false },
  { section: NavSection.EVENTS, label: 'Agenda', icon: 'Calendar', isVisible: true, showInBottomNav: false },
  { section: NavSection.LOCATIONS, label: 'Locais', icon: 'MapPin', isVisible: true, showInBottomNav: false },
  { section: NavSection.HISTORY, label: 'História', icon: 'BookOpen', isVisible: true, showInBottomNav: false },
  { section: NavSection.LIVE_SESSION, label: 'Live', icon: 'Video', isVisible: true, showInBottomNav: false },
  { section: NavSection.MEMBERS_WALL, label: 'Mural', icon: 'Globe', isVisible: true, showInBottomNav: false },
  { section: NavSection.AI_CHAT, label: 'AI Chat', icon: 'Bot', isVisible: true, showInBottomNav: false },
  { section: NavSection.AI_STUDIO, label: 'Studio', icon: 'Sparkles', isVisible: true, showInBottomNav: false },
  { section: NavSection.GRADUATIONS, label: 'Graduações', icon: 'Award', isVisible: true, showInBottomNav: false }
];

export const GRADUATION_LEVELS = [
  'Aluno', 'Graduado', 'Instrutor', 'Professor', 'Mestrando', 'Mestre'
];

export const INITIAL_GRADUATIONS: GraduationSystem[] = [
  { id: '1', name: 'Iniciante', color: '#22c55e', meaning: 'O início da jornada, a semente que brota.' },
  { id: '2', name: 'Batizado', color: '#eab308', meaning: 'O reconhecimento do aluno no mundo da capoeira.' },
  { id: '3', name: 'Graduado', color: '#3b82f6', meaning: 'Domínio técnico e compromisso com o grupo.' },
  { id: '4', name: 'Instrutor', color: '#a855f7', meaning: 'Capacidade de transmitir conhecimentos básicos.' },
  { id: '5', name: 'Professor', color: '#ef4444', meaning: 'Maturidade técnica e pedagógica.' },
  { id: '6', name: 'Mestre', color: '#ffffff', meaning: 'A sabedoria máxima e a guarda da tradição.' }
];

export const FONT_OPTIONS = [
  'Suez One', 'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Oswald', 'Raleway', 'Playfair Display'
];