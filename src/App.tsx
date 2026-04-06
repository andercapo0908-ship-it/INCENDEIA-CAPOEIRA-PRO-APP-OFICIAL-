import React, { useState, useEffect } from 'react';
import { User, UserRole, Language, NavSection, Master, TrainingLocation, Event, GraduationSystem, ChatMessage, ForumPost, GalleryItem, Comment, NavItemConfig, INITIAL_EVENTS, INITIAL_NAV_CONFIG, FONT_OPTIONS, INITIAL_GRADUATIONS, GRADUATION_LEVELS } from './types';
import { FlameButton } from './components/FlameButton';
import { GeminiStudio } from './components/GeminiStudio';
import { AIChat } from './components/AIChat';
import { LiveSession } from './components/LiveSession';
import { BottomNav } from './components/BottomNav';
import { 
  Users, LogOut, ArrowLeft, Calendar, 
  MessageCircle, MapPin, Image as ImageIcon, BookOpen, Shield, Home, 
  Video, Globe, PenTool, Trash2, Plus, Camera, Map, Upload,
  Type, Palette, Sliders, Bot, Mic2, Sparkles, Heart, MessageCircle as CommentIcon, Send,
  ChevronUp, ChevronDown, Eye, EyeOff, Layout, Edit3, Save, X, ShoppingBag, DollarSign, ShoppingCart, AlertCircle, CheckCircle2, Clock, Award
} from 'lucide-react';

// --- ICONS MAPPING ---
const ICON_MAP: Record<string, any> = {
  Home, Users, MessageCircle, Image: ImageIcon, Calendar, 
  MapPin, BookOpen, Video, Globe, Bot, Mic2, Sparkles, Shield, Heart,
  Camera, Map, Upload, Sliders, Menu: Layout, ShoppingBag, DollarSign, Award
};

// --- INITIAL MOCK DATA ---
const INITIAL_MASTERS: Master[] = [
  { id: '1', name: 'Mestre Duende', graduation: 'Corda Vermelha', history: 'Fundador do grupo...', photo: undefined },
  { id: '2', name: 'Mestre Gato', graduation: 'Corda Vermelha', history: 'Mestre renomado...', photo: undefined },
  { id: '3', name: 'Mestre Cobra', graduation: 'Corda Vermelha', history: 'Especialista em rasteiras...', photo: undefined }
];
const INITIAL_LOCATIONS: TrainingLocation[] = [
  { id: '1', address: 'Centro Comunitário', responsible: 'Mestre Duende', phone: '551199999999', mapLink: '' },
  { id: '2', address: 'Academia Fire', responsible: 'Mestre Gato', phone: '551188888888', mapLink: '' },
  { id: '3', address: 'Parque do Ibirapuera', responsible: 'Mestre Cobra', phone: '551177777777', mapLink: '' }
];

// --- COMPONENTS ---

const FireCircle: React.FC<{ size?: string }> = ({ size = "w-48 h-48" }) => (
  <div className={`absolute ${size} flex items-center justify-center pointer-events-none`}>
    <div className="absolute inset-0 rounded-full border-[6px] border-brand-red opacity-40 blur-sm animate-fire-orbit shadow-[0_0_20px_#D90429]"></div>
    <div className="absolute inset-2 rounded-full border-[4px] border-brand-orange opacity-60 blur-md animate-fire-orbit shadow-[0_0_30px_#FB8500]" style={{ animationDirection: 'reverse', animationDuration: '6s' }}></div>
    <div className="absolute inset-4 rounded-full border-[2px] border-brand-yellow opacity-80 blur-lg animate-fire-orbit shadow-[0_0_40px_#FFB703]" style={{ animationDuration: '3s' }}></div>
  </div>
);

const FloatingGradients = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-red/20 rounded-full blur-[100px] animate-float"></div>
    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-orange/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-5s' }}></div>
  </div>
);

const Sidebar = ({ isOpen, onClose, onNavigate, currentSection, navItems, user, onLogout }: any) => (
  <>
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div className={`fixed top-0 left-0 h-full w-72 bg-brand-dark border-r border-gray-800 z-[70] transition-transform duration-500 ease-out shadow-[10px_0_30px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center shadow-[0_0_15px_rgba(217,4,41,0.5)]">
              <img src="https://i.ibb.co/V0WppRbR/1770855196310.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-suez text-lg text-white tracking-tighter">INCENDEIA</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors"><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {navItems.map((item: any) => {
            const Icon = ICON_MAP[item.icon] || Home;
            const isActive = currentSection === item.section;
            return (
              <button
                key={item.section}
                onClick={() => { onNavigate(item.section); onClose(); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-brand-red text-white shadow-[0_5px_15px_rgba(217,4,41,0.3)]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-brand-orange transition-colors'} />
                <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-6 p-3 bg-brand-card rounded-2xl border border-gray-800">
            <div className="w-10 h-10 rounded-full border-2 border-brand-orange overflow-hidden">
              <img src={user?.avatar || "https://picsum.photos/seed/user/100/100"} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-white truncate uppercase">{user?.nickname}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{user?.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 hover:bg-red-900/20 text-gray-400 hover:text-brand-red rounded-2xl transition-all border border-gray-800 hover:border-brand-red/30">
            <LogOut size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Sair do App</span>
          </button>
        </div>
      </div>
    </div>
  </>
);

const Header = ({ title, onBack, onLogout, onMenu }: { title: string, onBack?: () => void, onLogout: () => void, onMenu?: () => void }) => (
  <header className="bg-brand-card shadow-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-gray-800">
    <div className="flex items-center gap-3">
      {onMenu && (
        <button onClick={onMenu} className="p-2 rounded-xl hover:bg-gray-800 text-brand-orange border border-gray-700 transition-all active:scale-90">
          <Layout size={20} />
        </button>
      )}
      {onBack && !onMenu && (
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-800 text-brand-red border border-gray-700">
          <ArrowLeft size={18} />
        </button>
      )}
    </div>
    
    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
      <div className="flex items-center gap-2">
        <img src="https://i.ibb.co/V0WppRbR/1770855196310.png" alt="Logo" className="w-5 h-5 object-contain" />
        <h1 className="font-suez text-[10px] text-white tracking-[0.2em] uppercase drop-shadow-[0_0_5px_rgba(217,4,41,0.5)]">INCENDEIA</h1>
      </div>
      <span className="text-[6px] font-black text-brand-orange tracking-[0.4em] -mt-0.5 opacity-80">CAPOEIRA</span>
    </div>

    <button onClick={onLogout} className="group p-2 flex flex-col items-center justify-center rounded-full hover:bg-gray-800 transition-colors">
      <LogOut size={16} className="text-brand-red group-hover:text-red-400" />
      <span className="text-[7px] font-bold text-gray-500 group-hover:text-gray-300 mt-1">SAIR</span>
    </button>
  </header>
);

const SectionButton = ({ label, icon: Icon, onClick, colorClass }: any) => (
  <button
    onClick={onClick}
    className="bg-brand-card border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 p-2 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 aspect-square transition-all hover:border-brand-red/50 hover:bg-gray-800 h-full w-full group"
  >
    <div className={`${colorClass} p-2.5 rounded-full bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={24} className={colorClass.replace('bg-', 'text-').replace('/20', '')} />
    </div>
    <span className="font-suez text-[10px] text-center leading-tight uppercase text-gray-200 group-hover:text-white">{label}</span>
  </button>
);

// --- SHARED LAYOUT ---
interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  onLogout: () => void;
  showBottomNav?: boolean;
  currentSection?: NavSection;
  onNavigate?: (s: NavSection) => void;
  navItems?: { section: NavSection; icon: any; label: string }[];
  style?: React.CSSProperties;
  onMenu?: () => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children, onBack, onLogout, showBottomNav, currentSection, onNavigate, navItems, style, onMenu }) => (
  <div className="bg-brand-dark min-h-screen pb-24 text-white transition-colors duration-500" style={style}>
    <Header title={title} onLogout={onLogout} onBack={onBack} onMenu={onMenu} />
    <div className="p-4 animate-fade-in relative z-10">
      {children}
    </div>
    {showBottomNav && currentSection && onNavigate && navItems && (
      <BottomNav currentSection={currentSection} onNavigate={onNavigate} items={navItems} />
    )}
  </div>
);

// --- MAIN APP ---

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>(Language.PT);
  const [currentSection, setCurrentSection] = useState<NavSection>(NavSection.HOME);
  const [loginMode, setLoginMode] = useState<'MEMBER' | 'ADMIN' | null>(null);

  // --- DATABASE STATE (Simulating Backend) ---
  const [masters, setMasters] = useState<Master[]>(INITIAL_MASTERS);
  const [locations, setLocations] = useState<TrainingLocation[]>(INITIAL_LOCATIONS);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [historyText, setHistoryText] = useState(`A Capoeira é uma expressão cultural brasileira que mistura arte marcial, esporte, cultura popular, dança e música. 

Fundado em 1998 pelo Mestre Duende, o Grupo Incendeia Capoeira nasceu com a missão de preservar as raízes da capoeira angola e regional, focando na disciplina, respeito e evolução constante dos seus membros.

Nossa linhagem remonta aos grandes mestres do passado, mantendo viva a chama da ancestralidade através de treinos rigorosos, rodas vibrantes e um forte senso de comunidade. Hoje, o grupo conta com núcleos em diversas cidades, levando a arte da capoeira para jovens e adultos de todas as idades.`);
  const [members, setMembers] = useState<User[]>([]); 
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    { id: 'g1', type: 'image', url: 'https://picsum.photos/seed/capo1/800/600', title: 'Roda de Batizado', description: 'Momento épico do último batizado.', likes: [], comments: [], uploadedBy: 'admin', timestamp: Date.now() },
    { id: 'g2', type: 'image', url: 'https://picsum.photos/seed/capo2/800/600', title: 'Treino de Salto', description: 'Foco na agilidade.', likes: [], comments: [], uploadedBy: 'admin', timestamp: Date.now() - 100000 },
  ]);
  const [liveLink, setLiveLink] = useState("https://meet.google.com");
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([
    { id: '1', author: 'Mestre Duende', title: 'Dicas para a Roda de Rua', content: 'Sempre mantenha o olho no seu oponente e respeite o ritmo do berimbau.', comments: [] },
    { id: '2', author: 'Gafanhoto', title: 'Como melhorar a ponte?', content: 'Estou tendo dificuldade na flexibilidade das costas. Alguém tem exercícios?', comments: [] },
    { id: '3', author: 'Candeia', title: 'Músicas novas para o treino', content: 'Fiz uma playlist com as melhores ladainhas e corridos. Quem quer?', comments: [] }
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', userId: 'admin', nickname: 'Mestre Duende', text: 'Salve capoeira! Treino hoje às 19h.', timestamp: Date.now() - 3600000, isAdmin: true },
    { id: '2', userId: 'u1', nickname: 'Gafanhoto', text: 'Opa, estarei lá!', timestamp: Date.now() - 1800000, isAdmin: false }
  ]);
  
  // --- LAYOUT & NAV STATE ---
  const [layoutConfig, setLayoutConfig] = useState({
    themeColor: '#121212',
    gradientEndColor: '#000000',
    fontFamily: 'Suez One',
    bgStyle: 'Solid' as 'Solid' | 'Gradient' | 'Image',
    bgImageUrl: '',
    bgImageMode: 'cover' as 'cover' | 'contain',
    textEffect: 'None' as 'None' | 'Shadow' | 'Neon',
    fontSize: 16,
  });
  const [navConfig, setNavConfig] = useState<NavItemConfig[]>(INITIAL_NAV_CONFIG);
  const [graduations, setGraduations] = useState<GraduationSystem[]>(INITIAL_GRADUATIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- ADMIN STATE ---
  const [adminCount, setAdminCount] = useState(0);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingLocation, setEditingLocation] = useState<TrainingLocation | null>(null);
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [editingGraduation, setEditingGraduation] = useState<GraduationSystem | null>(null);

  // --- DYNAMIC FONT LOADING ---
  useEffect(() => {
    if (layoutConfig.fontFamily && layoutConfig.fontFamily !== 'Suez One') {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${layoutConfig.fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
  }, [layoutConfig.fontFamily]);

  // --- ACTIONS ---

  const handleLogin = (role: UserRole, nickname: string, pass: string) => {
    if (!nickname || !pass) return alert("Preencha todos os campos!");
    if (role === UserRole.ADMIN) {
      if (adminCount >= 2) { /* Logic for limiting admins */ }
      setAdminCount(prev => prev + 1);
    }
    const newUser: User = {
      id: Date.now().toString(),
      nickname, name: nickname, role, graduation: role === UserRole.MEMBER ? (graduations[0]?.name || 'Iniciante') : 'Mestre',
      graduationColor: role === UserRole.MEMBER ? (graduations[0]?.color || '#22c55e') : '#FFFFFF', since: '1 mês'
    };
    setMembers(prev => [...prev, newUser]);
    setUser(newUser);
    setCurrentSection(NavSection.HOME);
    setLoginMode(null);
  };

  const handleLogout = () => { setUser(null); setCurrentSection(NavSection.HOME); setLoginMode(null); };
  const goHome = () => setCurrentSection(NavSection.HOME);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string, type: 'image'|'video') => void) => {
      const file = e.target.files?.[0];
      if (file) {
          const type = file.type.startsWith('video') ? 'video' : 'image';
          const reader = new FileReader();
          reader.onloadend = () => callback(reader.result as string, type);
          reader.readAsDataURL(file);
      }
  };

  const handleGalleryUpload = (url: string, type: 'image'|'video') => {
    if (!user) return;
    const newItem: GalleryItem = { id: Date.now().toString(), type, url, likes: [], comments: [], uploadedBy: user.id, timestamp: Date.now() };
    setGalleryItems(prev => [newItem, ...prev]);
  };

  const handleLike = (itemId: string) => {
    if (!user) return;
    setGalleryItems(prev => prev.map(item => item.id === itemId ? { ...item, likes: item.likes.includes(user.id) ? item.likes.filter(id => id !== user.id) : [...item.likes, user.id] } : item));
  };

  const handleComment = (itemId: string, text: string) => {
    if (!user || !text.trim()) return;
    setGalleryItems(prev => prev.map(item => item.id === itemId ? { ...item, comments: [...item.comments, { id: Date.now().toString(), userId: user.id, nickname: user.nickname, text, timestamp: Date.now() }] } : item));
  };

  const deleteGalleryItem = (id: string) => setGalleryItems(prev => prev.filter(i => i.id !== id));

  // --- NAV CONFIG ACTIONS ---
  const moveNavItem = (index: number, direction: 'up' | 'down') => {
    const newConfig = [...navConfig];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newConfig.length) {
      [newConfig[index], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[index]];
      setNavConfig(newConfig);
    }
  };

  const updateNavItem = (index: number, field: keyof NavItemConfig, value: any) => {
    const newConfig = [...navConfig];
    (newConfig[index] as any)[field] = value;
    setNavConfig(newConfig);
  };

  const getResolvedBottomNavItems = () => {
    return navConfig.filter(item => item.showInBottomNav && item.isVisible).map(item => ({ section: item.section, icon: ICON_MAP[item.icon] || Home, label: item.label }));
  };

  // --- STYLES HELPER ---
  const getGlobalStyle = () => ({
    fontFamily: `"${layoutConfig.fontFamily}", sans-serif`,
    background: layoutConfig.bgStyle === 'Gradient' 
        ? `linear-gradient(135deg, ${layoutConfig.themeColor} 0%, ${layoutConfig.gradientEndColor} 100%)` 
        : layoutConfig.bgStyle === 'Image' && layoutConfig.bgImageUrl
        ? `url(${layoutConfig.bgImageUrl}) center/${layoutConfig.bgImageMode} no-repeat fixed`
        : layoutConfig.themeColor,
    textShadow: layoutConfig.textEffect === 'Shadow' ? '2px 2px 4px rgba(0,0,0,0.7)' 
              : layoutConfig.textEffect === 'Neon' ? '0 0 10px rgba(255,255,255,0.5)' 
              : 'none'
  });

  // --- RENDERERS ---

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center relative overflow-hidden p-4">
        <FloatingGradients />
        
        {/* Language Selector: Top Center-Right */}
        <div className="absolute top-8 right-1/4 translate-x-1/2 flex gap-4 z-20 bg-brand-card/50 p-2 rounded-full backdrop-blur-md border border-gray-700 shadow-xl">
           <button onClick={() => setLang(Language.PT)} className="text-xl hover:scale-125 transition-transform drop-shadow-md">🇧🇷</button>
           <button onClick={() => setLang(Language.ES)} className="text-xl hover:scale-125 transition-transform drop-shadow-md">🇪🇸</button>
        </div>

        <div className="mb-8 flex flex-col items-center z-10 w-full">
            <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                <FireCircle />
                <div className="relative z-10 w-40 h-40 rounded-full shadow-2xl flex items-center justify-center border-4 border-brand-card bg-black overflow-hidden group">
                   <img src="https://i.ibb.co/V0WppRbR/1770855196310.png" alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-suez text-center leading-tight tracking-tight drop-shadow-lg flex flex-col gap-1">
              <span className="text-brazil block">INCENDEIA</span>
              <span className="text-spain block">CAPOEIRA</span>
            </h1>
        </div>
        <div className="w-full max-w-xs space-y-4 z-10 mb-12">
          {!loginMode ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              <FlameButton label="MEMBROS" onClick={() => setLoginMode('MEMBER')} variant="secondary" className="py-2.5 text-xs shadow-lg" />
              <FlameButton label="PAINEL ADM" onClick={() => setLoginMode('ADMIN')} variant="primary" className="py-2.5 text-xs shadow-lg" />
            </div>
          ) : (
             <LoginForm mode={loginMode} onCancel={() => setLoginMode(null)} onSubmit={(n, p) => handleLogin(loginMode === 'ADMIN' ? UserRole.ADMIN : UserRole.MEMBER, n, p)} />
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const resolvedNavItems = getResolvedBottomNavItems();
  const showNav = resolvedNavItems.some(i => i.section === currentSection) || currentSection === NavSection.HOME;
  const layoutStyle = getGlobalStyle();

  const renderContent = () => {
    // 2. ADMIN PANEL
    if (currentSection === NavSection.ADMIN_PANEL) {
       return (
         <PageLayout title="PAINEL ADMINISTRATIVO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
            <div className="space-y-6">
              <div className="bg-brand-card/90 backdrop-blur p-5 rounded-2xl shadow-lg border border-gray-700">
                <h3 className="font-suez text-white mb-4 flex items-center gap-2 border-b border-gray-700 pb-2"><PenTool size={18} className="text-brand-orange"/> GERENCIAR CONTEÚDO</h3>
                <div className="grid grid-cols-2 gap-3">
                   <AdminMenuButton label="Layout & App" icon={Layout} onClick={() => setCurrentSection(NavSection.LAYOUT_EDITOR)} />
                   <AdminMenuButton label="Mestres" icon={Users} onClick={() => setCurrentSection(NavSection.MASTERS)} />
                   <AdminMenuButton label="Galeria" icon={ImageIcon} onClick={() => setCurrentSection(NavSection.GALLERY)} />
                   <AdminMenuButton label="Histórico" icon={BookOpen} onClick={() => setCurrentSection(NavSection.HISTORY)} />
                   <AdminMenuButton label="Locais" icon={MapPin} onClick={() => setCurrentSection(NavSection.LOCATIONS)} />
                   <AdminMenuButton label="Agenda" icon={Calendar} onClick={() => setCurrentSection(NavSection.EVENTS)} />
                   <AdminMenuButton label="Graduação" icon={Award} onClick={() => setCurrentSection(NavSection.GRADUATIONS)} />
                   <AdminMenuButton label="Live Link" icon={Video} onClick={() => {
                      const newLink = prompt("Link Live:", liveLink);
                      if(newLink) setLiveLink(newLink);
                   }} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-900/40 to-black p-5 rounded-2xl border border-red-900/50">
                <h3 className="font-suez text-brand-red mb-2 flex items-center gap-2"><Shield size={18}/> SALA DE MESTRES</h3>
                <FlameButton label="ENTRAR NA SALA" variant="primary" className="w-full" onClick={() => setCurrentSection(NavSection.MEETING_ROOM)} />
              </div>
            </div>
         </PageLayout>
       );
    }

    // LAYOUT EDITOR
    if (currentSection === NavSection.LAYOUT_EDITOR) {
      return (
        <PageLayout title="EDITOR DE LAYOUT" onBack={() => setCurrentSection(NavSection.ADMIN_PANEL)} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           <div className="bg-brand-card/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-gray-700 space-y-8">
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-2 bg-brand-orange/20 rounded-lg"><Sliders className="text-brand-orange" size={24} /></div>
                 <h2 className="font-suez text-white text-xl">Personalização Avançada</h2>
              </div>
              
              {/* --- 1. FONTS & STYLE --- */}
              <div className="bg-brand-dark/50 p-4 rounded-xl border border-gray-800 space-y-4">
                 <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 border-b border-gray-700 pb-2"><Type size={14} /> Estilo & Tipografia</h3>
                 
                 <div>
                    <label className="text-xs text-gray-300 block mb-1">Fonte Principal (+100 Opções)</label>
                    <select 
                      value={layoutConfig.fontFamily}
                      onChange={(e) => setLayoutConfig({...layoutConfig, fontFamily: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-orange outline-none"
                    >
                        {FONT_OPTIONS.map(font => (
                            <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                    </select>
                 </div>

                 <div>
                    <label className="text-xs text-gray-300 block mb-1">Cor de Fundo (Tema)</label>
                    <div className="flex flex-col gap-2">
                        <select 
                          value={layoutConfig.bgStyle} 
                          onChange={(e: any) => setLayoutConfig({...layoutConfig, bgStyle: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-orange"
                        >
                            <option value="Solid">Cor Sólida</option>
                            <option value="Gradient">Gradiente</option>
                            <option value="Image">Imagem</option>
                        </select>
                        
                        {layoutConfig.bgStyle === 'Solid' && (
                            <div className="flex items-center gap-2 mt-1">
                                <input type="color" value={layoutConfig.themeColor} onChange={(e) => setLayoutConfig({...layoutConfig, themeColor: e.target.value})} className="h-10 w-10 rounded cursor-pointer bg-transparent border-0" />
                                <span className="text-xs text-gray-400">Cor Principal</span>
                            </div>
                        )}
                        {layoutConfig.bgStyle === 'Gradient' && (
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-2">
                                    <input type="color" value={layoutConfig.themeColor} onChange={(e) => setLayoutConfig({...layoutConfig, themeColor: e.target.value})} className="h-10 w-10 rounded cursor-pointer bg-transparent border-0" />
                                    <span className="text-xs text-gray-400">Cor 1</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={layoutConfig.gradientEndColor} onChange={(e) => setLayoutConfig({...layoutConfig, gradientEndColor: e.target.value})} className="h-10 w-10 rounded cursor-pointer bg-transparent border-0" />
                                    <span className="text-xs text-gray-400">Cor 2</span>
                                </div>
                            </div>
                        )}
                        {layoutConfig.bgStyle === 'Image' && (
                            <div className="flex flex-col gap-2 mt-1">
                                <label className="flex items-center justify-center border border-dashed border-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors">
                                    <Upload size={16} className="text-brand-orange mr-2" />
                                    <span className="text-xs text-gray-400">Upload Imagem de Fundo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setLayoutConfig({...layoutConfig, bgImageUrl: url}))} />
                                </label>
                                {layoutConfig.bgImageUrl && (
                                    <div className="space-y-2">
                                        <div className="h-20 rounded-lg bg-center border border-gray-600" style={{ backgroundImage: `url(${layoutConfig.bgImageUrl})`, backgroundSize: layoutConfig.bgImageMode }}></div>
                                        <div className="flex gap-2">
                                            {['cover', 'contain'].map((mode) => (
                                                <button 
                                                    key={mode}
                                                    onClick={() => setLayoutConfig({...layoutConfig, bgImageMode: mode as any})}
                                                    className={`flex-1 py-1 text-[10px] border rounded uppercase font-bold transition-all ${layoutConfig.bgImageMode === mode ? 'border-brand-orange text-brand-orange bg-brand-orange/10' : 'border-gray-700 text-gray-500'}`}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs text-gray-300 block mb-1">Efeito de Texto</label>
                    <div className="flex gap-2">
                       {['None', 'Shadow', 'Neon'].map((eff) => (
                           <button 
                             key={eff}
                             onClick={() => setLayoutConfig({...layoutConfig, textEffect: eff as any})}
                             className={`flex-1 py-1 text-xs border rounded ${layoutConfig.textEffect === eff ? 'border-brand-orange text-brand-orange' : 'border-gray-700 text-gray-500'}`}
                           >
                              {eff}
                           </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* --- 2. NAVIGATION CONFIG --- */}
              <div className="bg-brand-dark/50 p-4 rounded-xl border border-gray-800">
                  <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 border-b border-gray-700 pb-2 mb-4">
                     <Layout size={14} /> Menu & Abas
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {navConfig.map((item, index) => {
                      const ItemIcon = ICON_MAP[item.icon] || Home;
                      return (
                        <div key={item.section} className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                           <div className="flex items-center gap-1 bg-gray-800 rounded p-1">
                             <ItemIcon size={16} className="text-gray-400 ml-1" />
                             <select
                               value={item.icon}
                               onChange={(e) => updateNavItem(index, 'icon', e.target.value)}
                               className="bg-transparent text-[10px] text-gray-400 outline-none cursor-pointer w-16 appearance-none"
                             >
                               {Object.keys(ICON_MAP).map(iconName => (
                                 <option key={iconName} value={iconName} className="bg-gray-800 text-white">{iconName}</option>
                               ))}
                             </select>
                           </div>
                           <input type="text" value={item.label} onChange={(e) => updateNavItem(index, 'label', e.target.value)} className="bg-transparent border-b border-gray-700 text-xs text-white w-24 focus:outline-none focus:border-brand-orange" />
                           <div className="flex-1"></div>
                           <button onClick={() => updateNavItem(index, 'showInBottomNav', !item.showInBottomNav)} className={`p-1 rounded ${item.showInBottomNav ? 'text-brand-orange' : 'text-gray-600'}`} title="Menu Inferior"><Layout size={16} /></button>
                           <button onClick={() => updateNavItem(index, 'isVisible', !item.isVisible)} className={`p-1 rounded ${item.isVisible ? 'text-brand-orange' : 'text-gray-600'}`} title="Visível">{item.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                           <div className="flex flex-col">
                             <button onClick={() => moveNavItem(index, 'up')} className="text-gray-500 hover:text-white"><ChevronUp size={12}/></button>
                             <button onClick={() => moveNavItem(index, 'down')} className="text-gray-500 hover:text-white"><ChevronDown size={12}/></button>
                           </div>
                        </div>
                      )
                    })}
                  </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                 <FlameButton label="SALVAR TUDO" onClick={() => alert("Layout salvo com sucesso!")} className="flex-1" />
              </div>
           </div>
        </PageLayout>
      )
    }

    // HISTORY (EDITABLE)
    if (currentSection === NavSection.HISTORY) {
       return (
         <PageLayout title="HISTÓRIA & FILOSOFIA" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
            <div className="bg-brand-card/90 backdrop-blur p-6 rounded-2xl shadow-xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                   <h2 className="font-suez text-2xl text-white">Nossa História</h2>
                   {user.role === UserRole.ADMIN && (
                      <div className="flex gap-2">
                         <FlameButton label="SALVAR" iconSize={12} className="px-3 py-1" onClick={() => alert("Histórico Atualizado!")} />
                      </div>
                   )}
                </div>
                {user.role === UserRole.ADMIN ? (
                   <textarea 
                     value={historyText}
                     onChange={(e) => setHistoryText(e.target.value)}
                     className="w-full h-96 bg-brand-dark/50 border border-gray-600 rounded-xl p-4 text-white text-sm leading-relaxed focus:border-brand-orange outline-none resize-none"
                   />
                ) : (
                   <div className="prose prose-invert text-gray-300 leading-relaxed whitespace-pre-wrap">{historyText}</div>
                )}
            </div>
         </PageLayout>
       );
    }

    // EVENTS (CRUD)
    if (currentSection === NavSection.EVENTS) {
      return (
        <PageLayout title="AGENDA DE EVENTOS" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           {user.role === UserRole.ADMIN && (
             <div className="mb-6 bg-brand-card/80 p-4 rounded-xl border border-gray-700">
                <h4 className="font-suez text-brand-orange text-sm mb-3 flex items-center gap-2">
                   {editingEvent ? <Edit3 size={16}/> : <Plus size={16}/>} 
                   {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                </h4>
                <div className="space-y-3">
                   <input id="evtTitle" type="text" placeholder="Título do Evento" defaultValue={editingEvent?.title || ''} className="w-full bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm" />
                   <div className="grid grid-cols-2 gap-3">
                      <input id="evtDate" type="date" defaultValue={editingEvent?.date || ''} className="bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm" />
                      <input id="evtLoc" type="text" placeholder="Local" defaultValue={editingEvent?.location || ''} className="bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm" />
                   </div>
                   <div className="flex gap-2">
                     <FlameButton label={editingEvent ? "SALVAR" : "ADICIONAR"} onClick={() => {
                        const title = (document.getElementById('evtTitle') as HTMLInputElement).value;
                        const date = (document.getElementById('evtDate') as HTMLInputElement).value;
                        const loc = (document.getElementById('evtLoc') as HTMLInputElement).value;
                        if(title) {
                           if (editingEvent) {
                              setEvents(events.map(e => e.id === editingEvent.id ? { ...e, title, date, location: loc } : e));
                              setEditingEvent(null);
                           } else {
                              setEvents([...events, { id: Date.now().toString(), title, date, location: loc }]);
                           }
                           (document.getElementById('evtTitle') as HTMLInputElement).value = '';
                           (document.getElementById('evtDate') as HTMLInputElement).value = '';
                           (document.getElementById('evtLoc') as HTMLInputElement).value = '';
                        }
                     }} className="flex-1" />
                     {editingEvent && <FlameButton label="CANCELAR" variant="secondary" onClick={() => setEditingEvent(null)} />}
                   </div>
                </div>
             </div>
           )}
           <div className="space-y-4">
             {events.map(ev => (
               <div key={ev.id} className="bg-brand-card rounded-2xl p-0 overflow-hidden shadow-lg border border-gray-800 flex">
                  <div className="w-24 bg-brand-red flex flex-col items-center justify-center p-2 text-center">
                     <span className="text-2xl font-black text-white">{ev.date.split('-')[2]}</span>
                     <span className="text-xs font-bold text-red-200 uppercase">{ev.date.split('-')[1]}/24</span>
                  </div>
                  <div className="p-4 flex-1 flex justify-between items-center bg-brand-dark/50">
                     <div>
                        <h3 className="font-suez text-white text-lg">{ev.title}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10}/> {ev.location}</p>
                     </div>
                     {user.role === UserRole.ADMIN && (
                        <div className="flex gap-2">
                           <button onClick={() => {
                              setEditingEvent(ev);
                              setTimeout(() => {
                                 (document.getElementById('evtTitle') as HTMLInputElement).value = ev.title;
                                 (document.getElementById('evtDate') as HTMLInputElement).value = ev.date;
                                 (document.getElementById('evtLoc') as HTMLInputElement).value = ev.location;
                              }, 0);
                           }} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"><Edit3 size={14}/></button>
                           <button onClick={() => setEvents(events.filter(e => e.id !== ev.id))} className="p-2 bg-red-900/50 rounded-full text-red-500 hover:bg-red-900"><Trash2 size={14}/></button>
                        </div>
                     )}
                  </div>
               </div>
             ))}
           </div>
        </PageLayout>
      );
    }

    // LOCATIONS (CRUD)
    if (currentSection === NavSection.LOCATIONS) {
        return (
          <PageLayout title="LOCAIS DE TREINO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
             {user.role === UserRole.ADMIN && (
               <div className="mb-6 bg-brand-card/80 p-4 rounded-xl border border-gray-700">
                  <h4 className="font-suez text-brand-orange text-sm mb-3 flex items-center gap-2">
                     {editingLocation ? <Edit3 size={16}/> : <Plus size={16}/>} 
                     {editingLocation ? 'Editar Local' : 'Novo Local'}
                  </h4>
                  <div className="space-y-3">
                     <input id="locAddr" type="text" placeholder="Endereço" defaultValue={editingLocation?.address || ''} className="w-full bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm" />
                     <input id="locResp" type="text" placeholder="Responsável" defaultValue={editingLocation?.responsible || ''} className="w-full bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm" />
                     <div className="flex gap-2">
                       <FlameButton label={editingLocation ? "SALVAR" : "ADICIONAR"} onClick={() => {
                          const addr = (document.getElementById('locAddr') as HTMLInputElement).value;
                          const resp = (document.getElementById('locResp') as HTMLInputElement).value;
                          if(addr) {
                             if (editingLocation) {
                                setLocations(locations.map(l => l.id === editingLocation.id ? { ...l, address: addr, responsible: resp } : l));
                                setEditingLocation(null);
                             } else {
                                setLocations([...locations, { id: Date.now().toString(), address: addr, responsible: resp, phone: '', mapLink: '' }]);
                             }
                             (document.getElementById('locAddr') as HTMLInputElement).value = '';
                             (document.getElementById('locResp') as HTMLInputElement).value = '';
                          }
                       }} className="flex-1" />
                       {editingLocation && <FlameButton label="CANCELAR" variant="secondary" onClick={() => setEditingLocation(null)} />}
                     </div>
                  </div>
               </div>
             )}
             <div className="space-y-4">
                {locations.map(loc => (
                   <div key={loc.id} className="bg-brand-card p-4 rounded-xl border border-gray-800 flex justify-between items-center shadow-md">
                      <div>
                         <h3 className="text-white font-bold">{loc.address}</h3>
                         <p className="text-xs text-brand-orange">Prof: {loc.responsible}</p>
                      </div>
                      {user.role === UserRole.ADMIN && (
                        <div className="flex gap-2">
                           <button onClick={() => {
                              setEditingLocation(loc);
                              setTimeout(() => {
                                 (document.getElementById('locAddr') as HTMLInputElement).value = loc.address;
                                 (document.getElementById('locResp') as HTMLInputElement).value = loc.responsible;
                              }, 0);
                           }} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"><Edit3 size={14}/></button>
                           <button onClick={() => setLocations(locations.filter(l => l.id !== loc.id))} className="p-2 bg-red-900/50 rounded-full text-red-500 hover:bg-red-900"><Trash2 size={14}/></button>
                        </div>
                      )}
                   </div>
                ))}
             </div>
          </PageLayout>
        );
    }
    
    // 3. GALLERY
    if (currentSection === NavSection.GALLERY) {
        return (
            <PageLayout title="GALERIA DO GRUPO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
                {(user.role === UserRole.ADMIN || (editingGalleryItem && editingGalleryItem.uploadedBy === user.id)) && editingGalleryItem && (
                    <div className="mb-6 bg-brand-card p-4 rounded-xl shadow-lg border border-gray-700">
                        <h4 className="font-suez text-brand-orange text-sm mb-3 flex items-center gap-2"><Edit3 size={16}/> Editar Mídia</h4>
                        <div className="space-y-3">
                           <input id="galTitle" type="text" placeholder="Título" defaultValue={editingGalleryItem.title || ''} className="w-full bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm" />
                           <textarea id="galDesc" placeholder="Descrição" defaultValue={editingGalleryItem.description || ''} className="w-full bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm resize-none h-20" />
                           <div className="flex gap-2">
                             <FlameButton label="SALVAR" onClick={() => {
                                const title = (document.getElementById('galTitle') as HTMLInputElement).value;
                                const desc = (document.getElementById('galDesc') as HTMLTextAreaElement).value;
                                setGalleryItems(galleryItems.map(i => i.id === editingGalleryItem.id ? { ...i, title, description: desc } : i));
                                setEditingGalleryItem(null);
                             }} className="flex-1" />
                             <FlameButton label="CANCELAR" variant="secondary" onClick={() => setEditingGalleryItem(null)} />
                           </div>
                        </div>
                    </div>
                )}
                {!editingGalleryItem && (
                    <div className="mb-6 bg-brand-card p-4 rounded-xl shadow-lg border border-gray-700">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
                            <Upload size={32} className="text-brand-orange mb-2" />
                            <span className="font-suez text-xs text-white uppercase">Carregar Foto ou Vídeo</span>
                            <span className="text-[9px] text-gray-500 mt-1">Do armazenamento interno</span>
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, handleGalleryUpload)} />
                        </label>
                    </div>
                )}
                <div className="space-y-6">
                    {galleryItems.length === 0 && (
                        <div className="text-center py-10 text-gray-500"><ImageIcon size={48} className="mx-auto mb-2 opacity-20" /><p className="text-xs">A galeria está vazia.</p></div>
                    )}
                    {galleryItems.map(item => (
                        <div key={item.id} className="bg-brand-card rounded-2xl overflow-hidden shadow-lg border border-gray-800">
                            <div className="w-full bg-black flex items-center justify-center min-h-[200px]">
                                {item.type === 'image' ? (
                                    <img src={item.url} alt="Gallery" className="w-full h-auto max-h-[400px] object-contain" />
                                ) : (
                                    <video src={item.url} controls className="w-full h-auto max-h-[400px]" />
                                )}
                            </div>
                            { (item.title || item.description) && (
                                <div className="p-3 border-b border-gray-800">
                                    {item.title && <h4 className="font-bold text-white text-sm">{item.title}</h4>}
                                    {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
                                </div>
                            )}
                            <div className="p-3 flex items-center justify-between border-b border-gray-800">
                                <div className="flex gap-4">
                                    <button onClick={() => handleLike(item.id)} className={`flex items-center gap-1 text-xs font-bold transition-colors ${item.likes.includes(user.id) ? 'text-brand-red' : 'text-gray-400 hover:text-white'}`}>
                                        <Heart size={18} fill={item.likes.includes(user.id) ? "currentColor" : "none"} /> {item.likes.length}
                                    </button>
                                    <button className="flex items-center gap-1 text-xs font-bold text-gray-400"><CommentIcon size={18} /> {item.comments.length}</button>
                                </div>
                                {(user.role === UserRole.ADMIN || item.uploadedBy === user.id) && (
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                           setEditingGalleryItem(item);
                                           setTimeout(() => {
                                              const titleInput = document.getElementById('galTitle') as HTMLInputElement;
                                              const descInput = document.getElementById('galDesc') as HTMLTextAreaElement;
                                              if (titleInput) titleInput.value = item.title || '';
                                              if (descInput) descInput.value = item.description || '';
                                           }, 0);
                                        }} className="text-gray-400 hover:text-white"><Edit3 size={16} /></button>
                                        <button onClick={() => deleteGalleryItem(item.id)} className="text-red-900 hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-brand-dark/30">
                                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                                    {item.comments.map(c => (
                                        <div key={c.id} className="text-xs">
                                            <span className="font-bold text-brand-orange mr-1">{c.nickname}:</span><span className="text-gray-300">{c.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Comente algo..." className="flex-1 bg-brand-dark border border-gray-700 rounded-full px-3 py-1 text-xs text-white focus:outline-none focus:border-brand-orange"
                                        onKeyDown={(e) => { if (e.key === 'Enter') { handleComment(item.id, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} id={`comment-input-${item.id}`} />
                                    <button onClick={() => { const input = document.getElementById(`comment-input-${item.id}`) as HTMLInputElement; handleComment(item.id, input.value); input.value = ''; }} className="text-brand-orange hover:text-white"><Send size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </PageLayout>
        );
    }
    
    // 3. MASTERS LIST (CRUD & VIEW)
    if (currentSection === NavSection.MASTERS) {
      return (
        <PageLayout title="MESTRES" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           {user.role === UserRole.ADMIN && (
             <div className="mb-6 bg-brand-card p-4 rounded-xl shadow-lg border border-gray-700">
                <h4 className="font-suez text-brand-orange text-sm mb-4 uppercase flex items-center gap-2">
                   {editingMaster ? <Edit3 size={16}/> : <Plus size={16}/>} 
                   {editingMaster ? 'Editar Mestre' : 'Adicionar Mestre'}
                </h4>
                <div className="space-y-3">
                   <input id="masterName" type="text" placeholder="Nome do Mestre" defaultValue={editingMaster?.name || ''} className="w-full bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-brand-red focus:outline-none" />
                   <input id="masterGrad" type="text" placeholder="Graduação" defaultValue={editingMaster?.graduation || ''} className="w-full bg-brand-dark border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-brand-red focus:outline-none" />
                   <div className="flex gap-2">
                     <label className="flex-1 bg-brand-dark border border-dashed border-gray-600 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-gray-800">
                        <Camera size={20} className="text-gray-400" /><span className="ml-2 text-xs text-gray-400">FOTO</span><input type="file" className="hidden" accept="image/*" />
                     </label>
                   </div>
                   <div className="pt-2 flex gap-2">
                     <FlameButton label={editingMaster ? "SALVAR" : "ADICIONAR"} onClick={() => {
                        const name = (document.getElementById('masterName') as HTMLInputElement).value;
                        const grad = (document.getElementById('masterGrad') as HTMLInputElement).value;
                        if(name) {
                           if (editingMaster) {
                              setMasters(masters.map(m => m.id === editingMaster.id ? { ...m, name, graduation: grad } : m));
                              setEditingMaster(null);
                           } else {
                              setMasters([...masters, { id: Date.now().toString(), name, graduation: grad, history: '' }]);
                           }
                           (document.getElementById('masterName') as HTMLInputElement).value = '';
                           (document.getElementById('masterGrad') as HTMLInputElement).value = '';
                        }
                     }} className="flex-1" />
                     {editingMaster && <FlameButton label="CANCELAR" variant="secondary" onClick={() => setEditingMaster(null)} />}
                   </div>
                </div>
             </div>
           )}
           <div className="space-y-4">
             {masters.map(m => (
               <div key={m.id} className="bg-brand-card p-4 rounded-2xl shadow-md border border-gray-800 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex-shrink-0 border-2 border-brand-orange overflow-hidden">
                     <Users className="w-full h-full p-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-suez text-white text-lg">{m.name}</h3>
                    <p className="text-xs text-brand-orange font-bold uppercase">{m.graduation}</p>
                  </div>
                  {user.role === UserRole.ADMIN && (
                    <div className="flex flex-col gap-2">
                        <button onClick={() => {
                           setEditingMaster(m);
                           setTimeout(() => {
                              (document.getElementById('masterName') as HTMLInputElement).value = m.name;
                              (document.getElementById('masterGrad') as HTMLInputElement).value = m.graduation;
                           }, 0);
                        }} className="text-gray-400 hover:text-white p-2 bg-gray-800 rounded-full"><Edit3 size={14}/></button>
                        <button onClick={() => setMasters(masters.filter(x => x.id !== m.id))} className="text-red-500 hover:text-red-400 p-2 bg-gray-800 rounded-full"><Trash2 size={14}/></button>
                    </div>
                  )}
               </div>
             ))}
           </div>
        </PageLayout>
      );
    }

    // 5. PROFILE
    if (currentSection === NavSection.PROFILE) {
      return (
        <PageLayout title="MEU PERFIL" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           <div className="bg-brand-card rounded-3xl shadow-lg p-6 mb-6 flex flex-col items-center border border-gray-700 relative overflow-hidden">
              {/* Fire Circle Animation */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent animate-pulse"></div>
              
              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  {/* Animated Fire Rings */}
                  <div className="absolute inset-0 rounded-full border-4 opacity-30 animate-spin-slow" style={{ borderColor: user.graduationColor }}></div>
                  <div className="absolute -inset-2 rounded-full border-2 border-brand-orange/20 animate-pulse"></div>
                  <div className="absolute -inset-4 rounded-full border border-brand-red/10 animate-ping"></div>
                  
                  <div className="relative w-32 h-32 rounded-full bg-brand-dark border-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden" style={{ borderColor: user.graduationColor }}>
                     {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <Users size={64} className="text-gray-700" />}
                  </div>
                  
                  <label className="absolute bottom-2 right-2 bg-brand-red p-2.5 rounded-full cursor-pointer shadow-xl hover:bg-red-500 transition-all hover:scale-110 z-20">
                      <Camera size={18} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setUser({...user, avatar: url}))} />
                  </label>
              </div>

              <div className="text-center mb-8">
                 <h2 className="font-suez text-3xl text-white mb-1 drop-shadow-lg">{user.nickname}</h2>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">{user.name}</p>
                 <span className="px-6 py-1.5 bg-brand-dark rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-inner" style={{ color: user.graduationColor, borderColor: user.graduationColor }}>
                    {user.graduation}
                 </span>
              </div>

              <div className="w-full space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-dark/50 p-3 rounded-2xl border border-gray-800 shadow-inner">
                       <label className="text-[9px] font-black text-brand-orange uppercase block mb-1 tracking-tighter">Apelido</label>
                       <input type="text" value={user.nickname} onChange={(e) => setUser({...user, nickname: e.target.value})} className="w-full bg-transparent border-none text-white text-sm font-bold focus:outline-none" />
                    </div>
                    <div className="bg-brand-dark/50 p-3 rounded-2xl border border-gray-800 shadow-inner">
                       <label className="text-[9px] font-black text-brand-orange uppercase block mb-1 tracking-tighter">Nível</label>
                       <select 
                          value={user.graduation} 
                          onChange={(e) => setUser({...user, graduation: e.target.value})}
                          className="w-full bg-transparent border-none text-white text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                       >
                          {GRADUATION_LEVELS.map(level => (
                             <option key={level} value={level} className="bg-brand-dark text-white">{level}</option>
                          ))}
                       </select>
                    </div>
                    <div className="bg-brand-dark/50 p-3 rounded-2xl border border-gray-800 shadow-inner">
                       <label className="text-[9px] font-black text-brand-orange uppercase block mb-1 tracking-tighter">Data Nasc.</label>
                       <input type="date" value={user.birthDate || ''} onChange={(e) => setUser({...user, birthDate: e.target.value})} className="w-full bg-transparent border-none text-white text-sm font-bold focus:outline-none" />
                    </div>
                    <div className="bg-brand-dark/50 p-3 rounded-2xl border border-gray-800 shadow-inner">
                       <label className="text-[9px] font-black text-brand-orange uppercase block mb-1 tracking-tighter">Cor Corda</label>
                       <div className="flex items-center gap-2">
                          <input type="color" value={user.graduationColor} onChange={(e) => setUser({...user, graduationColor: e.target.value})} className="h-6 w-6 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-[8px] text-gray-500 uppercase font-bold">Alterar</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-brand-dark/50 p-3 rounded-2xl border border-gray-800 shadow-inner">
                    <label className="text-[9px] font-black text-brand-orange uppercase block mb-1 tracking-tighter">Biografia</label>
                    <textarea value={user.bio || ''} onChange={(e) => setUser({...user, bio: e.target.value})} placeholder="Conte sua história na capoeira..." className="w-full bg-transparent border-none text-white text-xs leading-relaxed focus:outline-none resize-none h-20" />
                 </div>

                 <div className="bg-brand-dark/50 p-3 rounded-2xl border border-gray-800 shadow-inner">
                    <label className="text-[9px] font-black text-brand-orange uppercase block mb-1 tracking-tighter">Anotações Pessoais</label>
                    <textarea value={user.notes || ''} onChange={(e) => setUser({...user, notes: e.target.value})} placeholder="Seus treinos, golpes aprendidos..." className="w-full bg-transparent border-none text-white text-xs leading-relaxed focus:outline-none resize-none h-20" />
                 </div>

                 {/* Reaction Panel */}
                 <div className="bg-brand-dark/50 p-3 rounded-2xl border border-gray-800 shadow-inner">
                    <label className="text-[9px] font-black text-brand-orange uppercase block mb-1 tracking-tighter">Reações Favoritas</label>
                    <div className="flex gap-3 text-xl py-1">
                       {['🔥', '🥋', '💪', '⚡', '🏆', '🤜'].map(emoji => (
                          <button key={emoji} className="hover:scale-125 transition-transform">{emoji}</button>
                       ))}
                    </div>
                 </div>

                 <FlameButton label="SALVAR PERFIL" onClick={() => alert("Perfil atualizado com sucesso!")} className="w-full py-4 mt-4 shadow-[0_10px_20px_rgba(217,4,41,0.2)]" />
              </div>
           </div>
        </PageLayout>
      );
    }
    
    // 6. STORE
    if (currentSection === NavSection.STORE) {
      const products = [
        { id: '1', name: 'Abadá Oficial', price: 85.00, color: 'Branco', qty: 10, img: 'https://picsum.photos/seed/abada/400/400' },
        { id: '2', name: 'Camiseta Grupo', price: 45.00, color: 'Preto', qty: 25, img: 'https://picsum.photos/seed/shirt/400/400' },
        { id: '3', name: 'Berimbau Completo', price: 150.00, color: 'Natural', qty: 5, img: 'https://picsum.photos/seed/berimbau/400/400' },
      ];

      return (
        <PageLayout title="LOJA DO GRUPO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           <div className="space-y-6">
              {products.map(product => (
                 <div key={product.id} className="bg-brand-card rounded-3xl overflow-hidden border border-gray-800 shadow-xl">
                    <div className="relative h-64 bg-black">
                       <img src={product.img} className="w-full h-full object-cover opacity-80" alt={product.name} />
                       <div className="absolute top-4 right-4 bg-brand-red px-3 py-1 rounded-full text-xs font-black shadow-lg">R$ {product.price.toFixed(2)}</div>
                    </div>
                    <div className="p-5 space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <h3 className="font-suez text-xl text-white">{product.name}</h3>
                             <p className="text-xs text-gray-500">Cor: {product.color} • Estoque: {product.qty}</p>
                          </div>
                          <div className="bg-brand-dark p-2 rounded-xl border border-gray-700">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=pix-key-placeholder-${product.id}`} className="w-10 h-10 invert opacity-70" alt="PIX QR" />
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                          <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-bold border border-gray-700">
                             <ShoppingCart size={16} /> ADICIONAR
                          </button>
                          <button className="flex-1 bg-brand-red hover:bg-red-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-bold shadow-[0_5px_15px_rgba(217,4,41,0.3)]">
                             COMPRAR AGORA
                          </button>
                       </div>
                       <a href="https://wa.me/551199999999" target="_blank" rel="noreferrer" className="block text-center text-[10px] text-green-500 font-bold hover:underline">Falar com Vendedor no WhatsApp</a>
                    </div>
                 </div>
              ))}
           </div>
        </PageLayout>
      );
    }

    // 8. GRADUATIONS
    if (currentSection === NavSection.GRADUATIONS) {
      return (
        <PageLayout title="SISTEMA DE GRADUAÇÃO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           <div className="space-y-6">
              {user.role === UserRole.ADMIN && (
                <div className="bg-brand-card p-5 rounded-2xl border border-gray-700 shadow-lg">
                   <h3 className="font-suez text-white mb-4 flex items-center gap-2"><Award className="text-brand-orange" size={18}/> {editingGraduation ? 'EDITAR GRADUAÇÃO' : 'NOVA GRADUAÇÃO'}</h3>
                   <div className="space-y-4">
                      <input type="text" placeholder="Nome da Graduação" value={editingGraduation?.name || ''} onChange={(e) => setEditingGraduation(prev => prev ? {...prev, name: e.target.value} : {id: '', name: e.target.value, color: '#ffffff', meaning: ''})} className="w-full bg-brand-dark p-3 rounded-xl border border-gray-700 text-white text-sm" />
                      <div className="flex items-center gap-3">
                         <input type="color" value={editingGraduation?.color || '#ffffff'} onChange={(e) => setEditingGraduation(prev => prev ? {...prev, color: e.target.value} : {id: '', name: '', color: e.target.value, meaning: ''})} className="h-10 w-10 rounded cursor-pointer bg-transparent border-0" />
                         <span className="text-xs text-gray-400">Cor da Corda</span>
                      </div>
                      <textarea placeholder="Significado" value={editingGraduation?.meaning || ''} onChange={(e) => setEditingGraduation(prev => prev ? {...prev, meaning: e.target.value} : {id: '', name: '', color: '#ffffff', meaning: e.target.value})} className="w-full bg-brand-dark p-3 rounded-xl border border-gray-700 text-white text-sm h-24" />
                      <div className="flex gap-2">
                         <FlameButton label={editingGraduation?.id ? "ATUALIZAR" : "ADICIONAR"} onClick={() => {
                            if(!editingGraduation?.name) return;
                            if(editingGraduation.id) {
                               setGraduations(prev => prev.map(g => g.id === editingGraduation.id ? editingGraduation : g));
                            } else {
                               setGraduations(prev => [...prev, {...editingGraduation, id: Date.now().toString()}]);
                            }
                            setEditingGraduation(null);
                         }} className="flex-1 py-3" />
                         {editingGraduation && <button onClick={() => setEditingGraduation(null)} className="px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700"><X size={18}/></button>}
                      </div>
                   </div>
                </div>
              )}

              <div className="space-y-4">
                 <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">Graduações do Grupo</h4>
                 {graduations.map((g) => (
                    <div key={g.id} className="bg-brand-card p-5 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: g.color }}></div>
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-suez text-xl text-white flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color, boxShadow: `0 0 10px ${g.color}` }}></div>
                             {g.name}
                          </h3>
                          {user.role === UserRole.ADMIN && (
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingGraduation(g)} className="p-2 bg-gray-800 rounded-lg text-blue-400 hover:bg-gray-700"><Edit3 size={14}/></button>
                                <button onClick={() => setGraduations(prev => prev.filter(item => item.id !== g.id))} className="p-2 bg-gray-800 rounded-lg text-brand-red hover:bg-gray-700"><Trash2 size={14}/></button>
                             </div>
                          )}
                       </div>
                       <p className="text-xs text-gray-400 leading-relaxed italic">"{g.meaning}"</p>
                    </div>
                 ))}
              </div>
           </div>
        </PageLayout>
      );
    }

    // 7. FINANCIAL
    if (currentSection === NavSection.FINANCIAL) {
      const payments = [
        { month: 'Abril', year: 2026, value: 100.00, status: 'PAID' },
        { month: 'Março', year: 2026, value: 100.00, status: 'PAID' },
        { month: 'Maio', year: 2026, value: 100.00, status: 'PENDING' },
      ];

      return (
        <PageLayout title="FINANCEIRO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           <div className="space-y-6">
              <div className="bg-gradient-to-br from-brand-card to-brand-dark p-6 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-red/10 rounded-full blur-3xl"></div>
                 <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Mensalidade Atual</h3>
                 <div className="flex justify-between items-end mb-6">
                    <div>
                       <p className="text-4xl font-suez text-white">R$ 100,00</p>
                       <p className="text-xs text-brand-orange font-bold">Vencimento: 10/05/2026</p>
                    </div>
                    <div className="bg-brand-dark p-3 rounded-2xl border border-gray-700 shadow-xl">
                       <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=pix-key-incendeia-capoeira" className="w-16 h-16 invert" alt="PIX QR" />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] text-gray-400 text-center font-mono">Chave PIX: cnpj-ou-email-do-grupo@pix.com</p>
                    <FlameButton label="PAGAR AGORA (PIX)" className="w-full py-4 shadow-lg" />
                 </div>
              </div>

              <div className="space-y-3">
                 <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">Histórico de Pagamentos</h4>
                 {payments.map((p, i) => (
                    <div key={i} className="bg-brand-card p-4 rounded-2xl border border-gray-800 flex items-center justify-between shadow-md">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${p.status === 'PAID' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                             {p.status === 'PAID' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-white">{p.month} {p.year}</p>
                             <p className="text-[10px] text-gray-500">Valor: R$ {p.value.toFixed(2)}</p>
                          </div>
                       </div>
                       <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${p.status === 'PAID' ? 'border-green-900/50 text-green-500' : 'border-red-900/50 text-red-500'}`}>
                          {p.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                       </span>
                    </div>
                 ))}
              </div>
           </div>
        </PageLayout>
      );
    }

    // Fallback/AI Sections
    if (currentSection === NavSection.AI_STUDIO) return <PageLayout title="AI STUDIO" onBack={goHome} onLogout={handleLogout} showBottomNav={showNav} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}><GeminiStudio /></PageLayout>;
    if (currentSection === NavSection.AI_CHAT) return <PageLayout title="ASSISTENTE IA" onBack={goHome} onLogout={handleLogout} showBottomNav={showNav} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}><AIChat /></PageLayout>;
    if (currentSection === NavSection.LIVE_SESSION) return <PageLayout title="LIVE VOICE" onBack={goHome} onLogout={handleLogout} showBottomNav={showNav} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}><LiveSession /></PageLayout>;

    // DEFAULT: HOME
    if (currentSection === NavSection.HOME) {
        const visibleTabs = navConfig.filter(item => item.isVisible && item.section !== NavSection.HOME);
        
        return (
          <PageLayout title="INCENDEIA" onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle} onMenu={() => setIsSidebarOpen(true)}>
             <FloatingGradients />
             <div className="space-y-8 flex flex-col items-center relative z-10 pt-10">
                {/* Rotating Tabs Interface */}
                <div className="relative w-full h-[450px] flex items-center justify-center overflow-hidden">
                   {/* Central Logo with Fire Circle */}
                   <div className="relative z-20 w-48 h-48 flex items-center justify-center">
                      <FireCircle size="w-56 h-56" />
                      <div className="relative z-10 w-40 h-40 rounded-full border-2 border-brand-red bg-black shadow-[0_0_60px_rgba(217,4,41,0.5)] flex items-center justify-center overflow-hidden group">
                         <img src="https://i.ibb.co/V0WppRbR/1770855196310.png" alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-brand-red/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                   </div>

                   {/* Rotating Items */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      {visibleTabs.map((item, idx) => {
                         const Icon = ICON_MAP[item.icon] || Home;
                         const angle = (idx * (360 / visibleTabs.length));
                         return (
                            <button
                               key={item.section}
                               onClick={() => setCurrentSection(item.section)}
                               className="absolute w-16 h-16 bg-brand-card border-2 border-gray-700 rounded-2xl flex flex-col items-center justify-center shadow-2xl hover:border-brand-red hover:scale-110 transition-all duration-300 group z-30"
                               style={{
                                  animation: `orbit-${idx} 40s linear infinite`,
                                  '--start-angle': `${angle}deg`,
                               } as any}
                            >
                               <Icon size={24} className="text-brand-orange group-hover:text-brand-red transition-colors" />
                               <span className="text-[8px] font-black text-gray-500 mt-1 uppercase truncate w-full px-1">{item.label}</span>
                               
                               <style>{`
                                  @keyframes orbit-${idx} {
                                     from { transform: rotate(calc(var(--start-angle) + 0deg)) translateX(150px) rotate(calc(var(--start-angle) * -1 - 0deg)); }
                                     to { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(150px) rotate(calc(var(--start-angle) * -1 - 360deg)); }
                                  }
                                `}</style>
                            </button>
                         );
                      })}
                   </div>
                   
                   {/* Background Decorative Rings */}
                   <div className="absolute w-[300px] h-[300px] border border-gray-800 rounded-full opacity-20"></div>
                   <div className="absolute w-[380px] h-[380px] border border-gray-800 rounded-full opacity-10"></div>
                </div>

                {/* Notice Panel */}
                <div className="w-full bg-brand-red/20 border border-brand-red/30 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                   <AlertCircle className="text-brand-red" size={20} />
                   <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap animate-marquee">
                         Próxima Roda de Rua: 15 de Maio na Praça Central! Não perca! • Mensalidades em dia ajudam o grupo!
                      </p>
                   </div>
                </div>
             </div>
          </PageLayout>
        );
    }
    return <PageLayout title={currentSection} onBack={goHome} onLogout={handleLogout} showBottomNav={showNav} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}><div className="flex flex-col items-center justify-center h-64 text-gray-500"><p>Seção em desenvolvimento...</p>{user.role === UserRole.ADMIN && <FlameButton label="ADICIONAR CONTEÚDO" variant="secondary" className="mt-4" />}</div></PageLayout>;
  };

  return <div className="min-h-screen font-sans bg-brand-dark text-white selection:bg-brand-red selection:text-white">
    <Sidebar 
      isOpen={isSidebarOpen} 
      onClose={() => setIsSidebarOpen(false)} 
      onNavigate={setCurrentSection} 
      currentSection={currentSection} 
      navItems={navConfig.filter(i => i.isVisible)} 
      user={user}
      onLogout={handleLogout}
    />
    <div className="max-w-md mx-auto bg-brand-dark min-h-screen shadow-2xl relative border-x border-gray-800">{renderContent()}</div>
  </div>;
}

const LoginForm = ({ mode, onCancel, onSubmit }: { mode: 'MEMBER' | 'ADMIN', onCancel: () => void, onSubmit: (n: string, p: string) => void }) => {
  const [nick, setNick] = useState('');
  const [pass, setPass] = useState('');
  return (
    <div className="bg-brand-card p-6 rounded-3xl shadow-2xl animate-fade-in-up border border-gray-700">
      <div className="flex items-center justify-between mb-6"><h2 className="font-suez text-xl text-white">{mode === 'ADMIN' ? 'ACESSO MESTRE' : 'ACESSO ALUNO'}</h2><button onClick={onCancel} className="text-gray-400 hover:text-brand-red"><LogOut size={20} /></button></div>
      <div className="space-y-5">
        <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Apelido (Obrigatório)</label><input type="text" value={nick} onChange={(e) => setNick(e.target.value)} className="w-full bg-brand-dark border-b-2 border-gray-700 py-2 focus:outline-none focus:border-brand-red font-bold text-lg text-white placeholder-gray-600 transition-colors" placeholder="Seu apelido" /></div>
        <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Senha (Obrigatório)</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full bg-brand-dark border-b-2 border-gray-700 py-2 focus:outline-none focus:border-brand-red font-bold text-lg text-white placeholder-gray-600 transition-colors" placeholder="••••••" /></div>
        <div className="pt-4"><FlameButton label="SALVAR E ENTRAR" onClick={() => onSubmit(nick, pass)} className="w-full py-4 text-sm" /></div>
      </div>
    </div>
  );
};

const AdminMenuButton = ({ label, icon: Icon, onClick }: any) => (
  <button onClick={onClick} className="bg-brand-dark hover:bg-gray-800 p-3 rounded-xl flex flex-col items-center gap-2 border border-gray-700 transition-all active:scale-95 group">
     <Icon className="text-gray-400 group-hover:text-brand-orange" size={20} />
     <span className="text-[10px] font-bold text-gray-500 uppercase group-hover:text-white">{label}</span>
  </button>
);

const Footer = () => (
  <footer className="w-full py-8 flex flex-col items-center justify-center opacity-30 z-0">
    <div className="flex items-center gap-2 mb-1"><Globe size={12} className="text-gray-400"/><span className="text-[10px] font-bold text-gray-500 tracking-widest">INCENDEIA SYSTEM</span></div>
    <p className="text-[8px] text-gray-600 font-mono">&copy; {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
  </footer>
);