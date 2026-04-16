import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Language, 
  NavSection, 
  Master, 
  TrainingLocation, 
  Event, 
  GraduationSystem, 
  ChatMessage, 
  ForumPost, 
  GalleryItem, 
  Comment, 
  NavItemConfig, 
  INITIAL_EVENTS, 
  INITIAL_NAV_CONFIG, 
  FONT_OPTIONS, 
  Partner, 
  Product, 
  Payment 
} from './types';
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
  ChevronUp, ChevronDown, Eye, EyeOff, Layout, Edit3, Save, X, ShoppingBag, DollarSign, ShoppingCart, AlertCircle, CheckCircle2, Clock,
  Link, Copy, Menu
} from 'lucide-react';
import { auth, db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { where } from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  userService, 
  configService 
} from './services/firebaseService';
import { generateAppLinks, Web2AppConfig, Web2AppResult } from './services/web2appService';
import toast, { Toaster } from 'react-hot-toast';

// --- ICONS MAPPING ---
const ICON_MAP: Record<string, any> = {
  Home, Users, MessageCircle, Image: ImageIcon, Calendar, 
  MapPin, BookOpen, Video, Globe, Bot, Mic2, Sparkles, Shield, Heart,
  Camera, Map, Upload, Sliders, Menu: Layout, ShoppingBag, DollarSign, Link
};

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

const Header = ({ title, onBack, onLogout, onOpenMenu, isHome }: { title: string, onBack?: () => void, onLogout: () => void, onOpenMenu?: () => void, isHome?: boolean }) => (
  <header className="bg-brand-card shadow-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-gray-800">
    <div className="flex items-center gap-3">
      {isHome && onOpenMenu ? (
        <button onClick={onOpenMenu} className="p-2 rounded-full hover:bg-gray-800 text-brand-orange border border-gray-700">
          <Menu size={18} />
        </button>
      ) : onBack ? (
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-800 text-brand-red border border-gray-700">
          <ArrowLeft size={18} />
        </button>
      ) : null}
      <h1 className="font-suez text-base text-white tracking-wide truncate max-w-[200px] uppercase drop-shadow-md">{title}</h1>
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
  onOpenMenu?: () => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children, onBack, onLogout, showBottomNav, currentSection, onNavigate, navItems, style, onOpenMenu }) => (
  <div className="bg-brand-dark min-h-screen pb-24 text-white transition-colors duration-500" style={style}>
    <Header title={title} onLogout={onLogout} onBack={onBack} onOpenMenu={onOpenMenu} isHome={currentSection === NavSection.HOME} />
    <div className="p-4 animate-fade-in">
      {children}
    </div>
    {showBottomNav && currentSection && onNavigate && navItems && (
      <BottomNav currentSection={currentSection} onNavigate={onNavigate} items={navItems} />
    )}
  </div>
);

const Sidebar = ({ isOpen, onClose, navItems, currentSection, onNavigate, user, onLogout }: any) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 left-0 h-full w-72 bg-brand-dark border-r border-gray-800 z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-brand-card">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.nickname}&background=random`} className="w-10 h-10 rounded-full object-cover border border-gray-700" alt="Avatar" />
            <div>
              <p className="text-white font-bold text-sm">{user?.nickname}</p>
              <p className="text-brand-orange text-[10px] uppercase tracking-widest">{user?.graduation}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-800">
          {user?.role === UserRole.ADMIN && (
            <button 
              onClick={() => { onNavigate(NavSection.ADMIN_PANEL); onClose(); }}
              className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${currentSection === NavSection.ADMIN_PANEL ? 'bg-brand-red/10 text-brand-red border-r-4 border-brand-red' : 'text-brand-red hover:bg-gray-800'}`}
            >
              <Shield size={20} />
              <span className="font-bold text-sm uppercase tracking-wide">PAINEL ADM</span>
            </button>
          )}
          {navItems.map((item: any) => {
            const Icon = ICON_MAP[item.icon] || Home;
            const isActive = currentSection === item.section;
            return (
              <button 
                key={item.section}
                onClick={() => { onNavigate(item.section); onClose(); }}
                className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${isActive ? 'bg-brand-orange/10 text-brand-orange border-r-4 border-brand-orange' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Icon size={20} />
                <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-800 bg-brand-card">
          <button onClick={() => { onLogout(); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 text-brand-red hover:bg-red-900/20 rounded-xl transition-colors font-bold text-sm uppercase justify-center border border-red-900/30">
            <LogOut size={18} /> Sair do App
          </button>
        </div>
      </div>
    </>
  );
}

// --- MAIN APP ---

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>(Language.PT);
  const [currentSection, setCurrentSection] = useState<NavSection>(NavSection.HOME);
  const [loginMode, setLoginMode] = useState<'MEMBER' | 'ADMIN' | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- DATABASE STATE ---
  const [masters, setMasters] = useState<Master[]>([]);
  const [locations, setLocations] = useState<TrainingLocation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [historyText, setHistoryText] = useState('');
  const [members, setMembers] = useState<User[]>([]); 
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [liveLink, setLiveLink] = useState("https://meet.google.com");
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
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

  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        userService.getProfile(firebaseUser.uid, (profile) => {
          if (profile) {
            setUser(profile);
          } else {
            // Create profile if it doesn't exist
            const newUser: User = {
              id: firebaseUser.uid,
              nickname: firebaseUser.displayName || 'Capoeirista',
              role: UserRole.MEMBER,
              graduation: 'Iniciante',
              graduationColor: '#22c55e',
              name: firebaseUser.displayName || '',
            };
            userService.saveProfile(newUser);
            setUser(newUser);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!user) return;

    const unsubMasters = getCollection<Master>('masters', setMasters);
    const unsubLocations = getCollection<TrainingLocation>('locations', setLocations);
    const unsubEvents = getCollection<Event>('events', setEvents);
    const unsubGallery = getCollection<GalleryItem>('gallery', setGalleryItems);
    const unsubChat = getCollection<ChatMessage>('chat', setChatMessages);
    const unsubForum = getCollection<ForumPost>('forum', setForumPosts);
    const unsubUsers = getCollection<User>('users', setMembers);
    const unsubPartners = getCollection<Partner>('partners', setPartners);
    const unsubProducts = getCollection<Product>('products', setProducts);
    
    // Payments: Admins see all, members see only theirs
    const paymentConstraints = user.role === UserRole.ADMIN ? [] : [where('userId', '==', user.id)];
    const unsubPayments = getCollection<Payment>('payments', setPayments, paymentConstraints);
    
    const unsubHistory = configService.getHistory(setHistoryText);
    const unsubLayout = configService.getLayout(setLayoutConfig);
    const unsubNav = configService.getNavigation(setNavConfig);

    return () => {
      unsubMasters();
      unsubLocations();
      unsubEvents();
      unsubGallery();
      unsubChat();
      unsubForum();
      unsubUsers();
      unsubPartners();
      unsubProducts();
      unsubPayments();
      unsubHistory();
      unsubLayout();
      unsubNav();
    };
  }, [user]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingLocation, setEditingLocation] = useState<TrainingLocation | null>(null);
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

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

  const handleLogin = async (role: UserRole, nickname: string, pass: string, isGoogle: boolean = false) => {
    try {
      let res;
      if (isGoogle) {
        const provider = new GoogleAuthProvider();
        res = await signInWithPopup(auth, provider);
      } else {
        if (!nickname || !pass) return toast.error("Preencha todos os campos!");
        const email = `${nickname.toLowerCase().replace(/\s+/g, '')}@incendeia.com`;
        try {
          res = await signInWithEmailAndPassword(auth, email, pass);
        } catch (e: any) {
          if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
            res = await createUserWithEmailAndPassword(auth, email, pass);
          } else {
            throw e;
          }
        }
      }

      if (res && res.user) {
        // Check if user profile exists
        const profile = await userService.getProfileAsync(res.user.uid);
        if (!profile) {
          const newUser: User = {
            id: res.user.uid,
            nickname: res.user.displayName || nickname || 'Guerreiro',
            name: res.user.displayName || nickname || 'Guerreiro',
            role: role,
            graduation: 'Iniciante',
            graduationColor: '#22c55e',
            since: '1 mês',
            avatar: res.user.photoURL || undefined
          };
          await userService.saveProfile(newUser);
        }
        toast.success("Bem-vindo!");
      }

      setCurrentSection(NavSection.HOME);
      setLoginMode(null);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao entrar: " + error.message);
    }
  };

  const handleLogout = () => { signOut(auth); setCurrentSection(NavSection.HOME); setLoginMode(null); };
  const goHome = () => setCurrentSection(NavSection.HOME);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string, type: 'image'|'video') => void) => {
      const file = e.target.files?.[0];
      if (file) {
          const type = file.type.startsWith('video') ? 'video' : 'image';
          const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
          
          toast.promise(
            (async () => {
              await uploadBytes(storageRef, file);
              const url = await getDownloadURL(storageRef);
              callback(url, type);
              return url;
            })(),
            {
              loading: 'Enviando arquivo...',
              success: 'Arquivo enviado!',
              error: 'Erro ao enviar arquivo.',
            }
          );
      }
  };

  const handleGalleryUpload = async (url: string, type: 'image'|'video') => {
    if (!user) return;
    const newItem: GalleryItem = { 
      id: Date.now().toString(), 
      type, 
      url, 
      likes: [], 
      comments: [], 
      uploadedBy: user.id, 
      timestamp: Date.now() 
    };
    await addDocument('gallery', newItem);
    toast.success("Mídia enviada!");
  };

  const handleLike = async (itemId: string) => {
    if (!user) return;
    const item = galleryItems.find(i => i.id === itemId);
    if (!item) return;
    
    const newLikes = item.likes.includes(user.id) 
      ? item.likes.filter(id => id !== user.id) 
      : [...item.likes, user.id];
      
    await updateDocument<GalleryItem>('gallery', { id: itemId, likes: newLikes });
  };

  const handleComment = async (itemId: string, text: string) => {
    if (!user || !text.trim()) return;
    const item = galleryItems.find(i => i.id === itemId);
    if (!item) return;

    const newComments = [...item.comments, { 
      id: Date.now().toString(), 
      userId: user.id, 
      nickname: user.nickname, 
      text, 
      timestamp: Date.now() 
    }];
    
    await updateDocument<GalleryItem>('gallery', { id: itemId, comments: newComments });
    toast.success("Comentário enviado!");
  };

  const deleteGalleryItem = async (id: string) => {
    await deleteDocument('gallery', id);
    toast.success("Mídia removida!");
  };

  // --- NAV CONFIG ACTIONS ---
  const moveNavItem = async (index: number, direction: 'up' | 'down') => {
    const newConfig = [...navConfig];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newConfig.length) {
      [newConfig[index], newConfig[targetIndex]] = [newConfig[targetIndex], newConfig[index]];
      setNavConfig(newConfig);
      await configService.saveNavigation(newConfig);
    }
  };

  const updateNavItem = async (index: number, field: keyof NavItemConfig, value: any) => {
    const newConfig = [...navConfig];
    (newConfig[index] as any)[field] = value;
    setNavConfig(newConfig);
    await configService.saveNavigation(newConfig);
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
            <>
              <FlameButton label="MEMBROS" onClick={() => setLoginMode('MEMBER')} variant="secondary" className="w-full py-3 text-sm" />
              <FlameButton label="PAINEL ADM" onClick={() => setLoginMode('ADMIN')} variant="primary" className="w-full py-3 text-sm" />
            </>
          ) : (
             <LoginForm mode={loginMode} onCancel={() => setLoginMode(null)} onSubmit={(n, p, g) => handleLogin(loginMode === 'ADMIN' ? UserRole.ADMIN : UserRole.MEMBER, n, p, g)} />
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
                   <AdminMenuButton label="Parceiros" icon={Heart} onClick={() => setCurrentSection(NavSection.PARTNERS)} />
                   <AdminMenuButton label="Loja" icon={ShoppingBag} onClick={() => setCurrentSection(NavSection.STORE)} />
                   <AdminMenuButton label="Financeiro" icon={DollarSign} onClick={() => setCurrentSection(NavSection.FINANCIAL)} />
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
                 <FlameButton label="SALVAR TUDO" onClick={async () => {
                    await configService.saveLayout(layoutConfig);
                    toast.success("Layout salvo com sucesso!");
                 }} className="flex-1" />
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
                         <FlameButton label="SALVAR" iconSize={12} className="px-3 py-1" onClick={async () => {
                            await configService.saveHistory(historyText);
                            toast.success("Histórico atualizado!");
                         }} />
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
                     <FlameButton label={editingEvent ? "SALVAR" : "ADICIONAR"} onClick={async () => {
                        const title = (document.getElementById('evtTitle') as HTMLInputElement).value;
                        const date = (document.getElementById('evtDate') as HTMLInputElement).value;
                        const loc = (document.getElementById('evtLoc') as HTMLInputElement).value;
                        if(title) {
                           if (editingEvent) {
                              await updateDocument<Event>('events', { id: editingEvent.id, title, date, location: loc });
                              setEditingEvent(null);
                              toast.success("Evento atualizado!");
                           } else {
                              await addDocument<Event>('events', { title, date, location: loc });
                              toast.success("Evento adicionado!");
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
                                 const titleInput = document.getElementById('evtTitle') as HTMLInputElement;
                                 const dateInput = document.getElementById('evtDate') as HTMLInputElement;
                                 const locInput = document.getElementById('evtLoc') as HTMLInputElement;
                                 if (titleInput) titleInput.value = ev.title;
                                 if (dateInput) dateInput.value = ev.date;
                                 if (locInput) locInput.value = ev.location;
                              }, 0);
                           }} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"><Edit3 size={14}/></button>
                           <button onClick={async () => {
                              await deleteDocument('events', ev.id);
                              toast.success("Evento removido!");
                           }} className="p-2 bg-red-900/50 rounded-full text-red-500 hover:bg-red-900"><Trash2 size={14}/></button>
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
                       <FlameButton label={editingLocation ? "SALVAR" : "ADICIONAR"} onClick={async () => {
                          const addr = (document.getElementById('locAddr') as HTMLInputElement).value;
                          const resp = (document.getElementById('locResp') as HTMLInputElement).value;
                          if(addr) {
                             if (editingLocation) {
                                await updateDocument<TrainingLocation>('locations', { id: editingLocation.id, address: addr, responsible: resp });
                                setEditingLocation(null);
                                toast.success("Local atualizado!");
                             } else {
                                await addDocument<TrainingLocation>('locations', { address: addr, responsible: resp, phone: '', mapLink: '' });
                                toast.success("Local adicionado!");
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
                                 const addrInput = document.getElementById('locAddr') as HTMLInputElement;
                                 const respInput = document.getElementById('locResp') as HTMLInputElement;
                                 if (addrInput) addrInput.value = loc.address;
                                 if (respInput) respInput.value = loc.responsible;
                              }, 0);
                           }} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white"><Edit3 size={14}/></button>
                           <button onClick={async () => {
                              await deleteDocument('locations', loc.id);
                              toast.success("Local removido!");
                           }} className="p-2 bg-red-900/50 rounded-full text-red-500 hover:bg-red-900"><Trash2 size={14}/></button>
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
                             <FlameButton label="SALVAR" onClick={async () => {
                                const title = (document.getElementById('galTitle') as HTMLInputElement).value;
                                const desc = (document.getElementById('galDesc') as HTMLTextAreaElement).value;
                                await updateDocument('gallery', { id: editingGalleryItem.id, title, description: desc });
                                setEditingGalleryItem(null);
                                toast.success("Mídia atualizada!");
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
                     <FlameButton label={editingMaster ? "SALVAR" : "ADICIONAR"} onClick={async () => {
                        const name = (document.getElementById('masterName') as HTMLInputElement).value;
                        const grad = (document.getElementById('masterGrad') as HTMLInputElement).value;
                        if(name) {
                           if (editingMaster) {
                              await updateDocument<Master>('masters', { id: editingMaster.id, name, graduation: grad });
                              setEditingMaster(null);
                              toast.success("Mestre atualizado!");
                           } else {
                              await addDocument<Master>('masters', { name, graduation: grad, history: '' });
                              toast.success("Mestre adicionado!");
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
                              const nameInput = document.getElementById('masterName') as HTMLInputElement;
                              const gradInput = document.getElementById('masterGrad') as HTMLInputElement;
                              if (nameInput) nameInput.value = m.name;
                              if (gradInput) gradInput.value = m.graduation;
                           }, 0);
                        }} className="text-gray-400 hover:text-white p-2 bg-gray-800 rounded-full"><Edit3 size={14}/></button>
                        <button onClick={async () => {
                           await deleteDocument('masters', m.id);
                           toast.success("Mestre removido!");
                        }} className="text-red-500 hover:text-red-400 p-2 bg-gray-800 rounded-full"><Trash2 size={14}/></button>
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
                 <div className="grid grid-cols-3 gap-4">
                    <div className="bg-brand-dark/50 p-3 rounded-2xl border border-gray-800 shadow-inner">
                       <label className="text-[9px] font-black text-brand-orange uppercase block mb-1 tracking-tighter">Apelido</label>
                       <input type="text" value={user.nickname} onChange={(e) => setUser({...user, nickname: e.target.value})} className="w-full bg-transparent border-none text-white text-sm font-bold focus:outline-none" />
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

                 <FlameButton label="SALVAR PERFIL" onClick={async () => {
                    await userService.saveProfile(user);
                    toast.success("Perfil atualizado com sucesso!");
                 }} className="w-full py-4 mt-4 shadow-[0_10px_20px_rgba(217,4,41,0.2)]" />
              </div>
           </div>
        </PageLayout>
      );
    }
    
    // 6. STORE
    if (currentSection === NavSection.STORE) {
      return (
        <PageLayout title="LOJA DO GRUPO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           <div className="space-y-6">
              {user.role === UserRole.ADMIN && (
                <button 
                  onClick={() => setEditingProduct({ name: '', price: 0, color: '', qty: 0, img: 'https://picsum.photos/seed/product/400/400' })}
                  className="w-full bg-brand-orange/20 border border-brand-orange/50 text-brand-orange py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 mb-4"
                >
                  <Plus size={16} /> ADICIONAR PRODUTO
                </button>
              )}

              {editingProduct && (
                <div className="bg-brand-card p-5 rounded-3xl border border-brand-orange shadow-2xl space-y-4 mb-6">
                  <h3 className="font-suez text-brand-orange uppercase text-sm">Editor de Produto</h3>
                  <div className="space-y-3">
                    <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="Nome do Produto" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} placeholder="Preço" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                      <input type="number" value={editingProduct.qty} onChange={e => setEditingProduct({...editingProduct, qty: Number(e.target.value)})} placeholder="Estoque" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <input type="text" value={editingProduct.color} onChange={e => setEditingProduct({...editingProduct, color: e.target.value})} placeholder="Cor" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                    <div className="flex gap-2">
                      <input type="text" value={editingProduct.img} onChange={e => setEditingProduct({...editingProduct, img: e.target.value})} placeholder="URL da Imagem" className="flex-1 bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                      <label className="bg-gray-800 p-2 rounded-xl cursor-pointer border border-gray-700">
                        <Camera size={20} className="text-gray-400" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setEditingProduct({...editingProduct, img: url}))} />
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold text-xs">CANCELAR</button>
                      <button 
                        onClick={async () => {
                          if (editingProduct.id) await updateDocument<Product>('products', editingProduct);
                          else await addDocument<Product>('products', editingProduct);
                          setEditingProduct(null);
                          toast.success("Produto salvo!");
                        }}
                        className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold text-xs"
                      >
                        SALVAR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {products.map(product => (
                 <div key={product.id} className="bg-brand-card rounded-3xl overflow-hidden border border-gray-800 shadow-xl relative group">
                    <div className="relative h-64 bg-black">
                       <img src={product.img} className="w-full h-full object-cover opacity-80" alt={product.name} />
                       <div className="absolute top-4 right-4 bg-brand-red px-3 py-1 rounded-full text-xs font-black shadow-lg">R$ {product.price.toFixed(2)}</div>
                       
                       {user.role === UserRole.ADMIN && (
                        <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingProduct(product)} className="p-1.5 bg-gray-800/80 backdrop-blur rounded-lg text-blue-400 border border-gray-700"><Edit3 size={14}/></button>
                          <button onClick={async () => { if(confirm("Excluir produto?")) await deleteDocument('products', product.id!); toast.success("Removido!"); }} className="p-1.5 bg-gray-800/80 backdrop-blur rounded-lg text-brand-red border border-gray-700"><Trash2 size={14}/></button>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <h3 className="font-suez text-xl text-white">{product.name}</h3>
                             <p className="text-xs text-gray-500">Color: {product.color} • Stock: {product.qty}</p>
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
              {products.length === 0 && !editingProduct && (
                <div className="py-20 text-center text-gray-600">Nenhum produto cadastrado.</div>
              )}
           </div>
        </PageLayout>
      );
    }

    // 7. FINANCIAL
    if (currentSection === NavSection.FINANCIAL) {
      const userPayments = payments.filter(p => p.userId === user.id);
      const displayPayments = user.role === UserRole.ADMIN ? payments : userPayments;

      return (
        <PageLayout title="FINANCEIRO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
           <div className="space-y-6">
              {user.role === UserRole.ADMIN && (
                <button 
                  onClick={() => setEditingPayment({ userId: '', month: '', year: new Date().getFullYear(), value: 100, status: 'PENDING' })}
                  className="w-full bg-brand-orange/20 border border-brand-orange/50 text-brand-orange py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 mb-4"
                >
                  <Plus size={16} /> REGISTRAR PAGAMENTO
                </button>
              )}

              {editingPayment && (
                <div className="bg-brand-card p-5 rounded-3xl border border-brand-orange shadow-2xl space-y-4 mb-6">
                  <h3 className="font-suez text-brand-orange uppercase text-sm">Editor de Pagamento</h3>
                  <div className="space-y-3">
                    <input type="text" value={editingPayment.userId} onChange={e => setEditingPayment({...editingPayment, userId: e.target.value})} placeholder="ID do Usuário" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={editingPayment.month} onChange={e => setEditingPayment({...editingPayment, month: e.target.value})} placeholder="Mês" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                      <input type="number" value={editingPayment.year} onChange={e => setEditingPayment({...editingPayment, year: Number(e.target.value)})} placeholder="Ano" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={editingPayment.value} onChange={e => setEditingPayment({...editingPayment, value: Number(e.target.value)})} placeholder="Valor" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                      <select value={editingPayment.status} onChange={e => setEditingPayment({...editingPayment, status: e.target.value as any})} className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white">
                        <option value="PAID">PAGO</option>
                        <option value="PENDING">PENDENTE</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setEditingPayment(null)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold text-xs">CANCELAR</button>
                      <button 
                        onClick={async () => {
                          if (editingPayment.id) await updateDocument<Payment>('payments', editingPayment);
                          else await addDocument<Payment>('payments', editingPayment);
                          setEditingPayment(null);
                          toast.success("Pagamento salvo!");
                        }}
                        className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold text-xs"
                      >
                        SALVAR
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                 <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">
                   {user.role === UserRole.ADMIN ? 'Todos os Pagamentos' : 'Meu Histórico'}
                 </h4>
                 {displayPayments.map((p, i) => (
                    <div key={i} className="bg-brand-card p-4 rounded-2xl border border-gray-800 flex items-center justify-between shadow-md relative group">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${p.status === 'PAID' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                             {p.status === 'PAID' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-white">{p.month} {p.year}</p>
                             <p className="text-[10px] text-gray-500">Valor: R$ {p.value.toFixed(2)} {user.role === UserRole.ADMIN && `• User: ${p.userId}`}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${p.status === 'PAID' ? 'border-green-900/50 text-green-500' : 'border-red-900/50 text-red-500'}`}>
                            {p.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                        </span>
                        {user.role === UserRole.ADMIN && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingPayment(p)} className="p-1.5 bg-gray-800 rounded-lg text-blue-400 border border-gray-700"><Edit3 size={14}/></button>
                            <button onClick={async () => { if(confirm("Excluir registro?")) await deleteDocument('payments', p.id!); toast.success("Removido!"); }} className="p-1.5 bg-gray-800 rounded-lg text-brand-red border border-gray-700"><Trash2 size={14}/></button>
                          </div>
                        )}
                       </div>
                    </div>
                 ))}
                 {displayPayments.length === 0 && !editingPayment && (
                   <div className="py-10 text-center text-gray-600">Nenhum registro encontrado.</div>
                 )}
              </div>
           </div>
        </PageLayout>
      );
    }

    if (currentSection === NavSection.CHAT) {
      return (
        <PageLayout title="CHAT DO GRUPO" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex-1 overflow-y-auto space-y-4 p-2">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.userId === user.id ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.userId === user.id ? 'bg-brand-red text-white rounded-tr-none' : 'bg-brand-card text-gray-200 rounded-tl-none border border-gray-800'}`}>
                    <p className="text-[10px] font-bold text-brand-orange mb-1">{msg.nickname}</p>
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[8px] text-gray-600 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-brand-card border-t border-gray-800 flex gap-2">
              <input 
                id="chat-input"
                type="text" 
                placeholder="Digite sua mensagem..." 
                className="flex-1 bg-brand-dark border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    const text = (e.target as HTMLInputElement).value;
                    if (text.trim()) {
                      await addDocument<ChatMessage>('chat', { userId: user.id, nickname: user.nickname, text, timestamp: Date.now(), isAdmin: user.role === UserRole.ADMIN });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button 
                onClick={async () => {
                  const input = document.getElementById('chat-input') as HTMLInputElement;
                  if (input.value.trim()) {
                    await addDocument<ChatMessage>('chat', { userId: user.id, nickname: user.nickname, text: input.value, timestamp: Date.now(), isAdmin: user.role === UserRole.ADMIN });
                    input.value = '';
                  }
                }}
                className="bg-brand-red p-2 rounded-full text-white hover:bg-red-500 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </PageLayout>
      );
    }

    if (currentSection === NavSection.FORUM) {
      return (
        <PageLayout title="MURAL DA COMUNIDADE" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
          <div className="space-y-6">
            <div className="bg-brand-card p-4 rounded-2xl border border-gray-800">
              <h3 className="font-suez text-white text-sm mb-3 uppercase flex items-center gap-2"><Plus size={16} className="text-brand-orange"/> Novo Post</h3>
              <textarea 
                id="forum-input"
                placeholder="O que você quer compartilhar com o grupo?" 
                className="w-full bg-brand-dark border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-orange resize-none h-24 mb-3"
              />
              <FlameButton label="POSTAR NO MURAL" onClick={async () => {
                const input = document.getElementById('forum-input') as HTMLTextAreaElement;
                if (input.value.trim()) {
                  await addDocument<ForumPost>('forum', { 
                    userId: user.id, 
                    nickname: user.nickname, 
                    content: input.value, 
                    likes: [], 
                    comments: [], 
                    timestamp: Date.now() 
                  });
                  input.value = '';
                  toast.success("Postado com sucesso!");
                }
              }} className="w-full" />
            </div>

            <div className="space-y-4">
              {forumPosts.map(post => (
                <div key={post.id} className="bg-brand-card p-4 rounded-2xl border border-gray-800 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-brand-orange">
                      <Users size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{post.nickname}</p>
                      <p className="text-[10px] text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</p>
                    </div>
                    { (user.role === UserRole.ADMIN || post.userId === user.id) && (
                      <button 
                        onClick={async () => {
                          await deleteDocument('forum', post.id);
                          toast.success("Post removido!");
                        }}
                        className="ml-auto text-gray-600 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">{post.content}</p>
                  <div className="flex gap-4 pt-3 border-t border-gray-800">
                    <button 
                      onClick={async () => {
                        const newLikes = post.likes.includes(user.id) 
                          ? post.likes.filter(id => id !== user.id) 
                          : [...post.likes, user.id];
                        await updateDocument<ForumPost>('forum', { id: post.id, likes: newLikes });
                      }}
                      className={`flex items-center gap-1 text-xs font-bold ${post.likes.includes(user.id) ? 'text-brand-red' : 'text-gray-500'}`}
                    >
                      <Heart size={16} fill={post.likes.includes(user.id) ? "currentColor" : "none"} /> {post.likes.length}
                    </button>
                    <button className="flex items-center gap-1 text-xs font-bold text-gray-500">
                      <CommentIcon size={16} /> {post.comments.length}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageLayout>
      );
    }
    if (currentSection === NavSection.MEMBERS_WALL) {
      return (
        <PageLayout title="MURAL DE MEMBROS" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
          <div className="grid grid-cols-2 gap-4">
            {members.map(m => (
              <div key={m.id} className="bg-brand-card p-4 rounded-2xl border border-gray-800 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 border-2 mb-2 overflow-hidden" style={{ borderColor: m.graduationColor }}>
                  {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <Users size={32} className="text-gray-700 m-auto mt-3" />}
                </div>
                <h4 className="font-bold text-white text-sm">{m.nickname}</h4>
                <p className="text-[10px] uppercase font-black" style={{ color: m.graduationColor }}>{m.graduation}</p>
              </div>
            ))}
          </div>
        </PageLayout>
      );
    }

    if (currentSection === NavSection.PARTNERS) {
      return (
        <PageLayout title="PARCEIROS & DESCONTOS" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
          <div className="space-y-4">
            {user.role === UserRole.ADMIN && (
              <button 
                onClick={() => setEditingPartner({ name: '', type: '', discount: '', logo: 'https://picsum.photos/seed/partner/100/100' })}
                className="w-full bg-brand-orange/20 border border-brand-orange/50 text-brand-orange py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 mb-4"
              >
                <Plus size={16} /> ADICIONAR PARCEIRO
              </button>
            )}

            {editingPartner && (
              <div className="bg-brand-card p-5 rounded-3xl border border-brand-orange shadow-2xl space-y-4 mb-6">
                <h3 className="font-suez text-brand-orange uppercase text-sm">Editor de Parceiro</h3>
                <div className="space-y-3">
                  <input type="text" value={editingPartner.name} onChange={e => setEditingPartner({...editingPartner, name: e.target.value})} placeholder="Nome" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                  <input type="text" value={editingPartner.type} onChange={e => setEditingPartner({...editingPartner, type: e.target.value})} placeholder="Tipo (ex: Fitness)" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                  <input type="text" value={editingPartner.discount} onChange={e => setEditingPartner({...editingPartner, discount: e.target.value})} placeholder="Desconto (ex: 15%)" className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                  <div className="flex gap-2">
                    <input type="text" value={editingPartner.logo} onChange={e => setEditingPartner({...editingPartner, logo: e.target.value})} placeholder="URL do Logo" className="flex-1 bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white" />
                    <label className="bg-gray-800 p-2 rounded-xl cursor-pointer border border-gray-700">
                      <Camera size={20} className="text-gray-400" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setEditingPartner({...editingPartner, logo: url}))} />
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setEditingPartner(null)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold text-xs">CANCELAR</button>
                    <button 
                      onClick={async () => {
                        if (editingPartner.id) await updateDocument<Partner>('partners', editingPartner);
                        else await addDocument<Partner>('partners', editingPartner);
                        setEditingPartner(null);
                        toast.success("Parceiro salvo!");
                      }}
                      className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold text-xs"
                    >
                      SALVAR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {partners.map(p => (
              <div key={p.id} className="bg-brand-card p-4 rounded-2xl border border-gray-800 flex items-center gap-4 relative group">
                <img src={p.logo} className="w-16 h-16 rounded-xl object-cover" alt={p.name} />
                <div className="flex-1">
                  <h4 className="font-bold text-white">{p.name}</h4>
                  <p className="text-xs text-gray-500">{p.type}</p>
                </div>
                <div className="bg-brand-red px-3 py-1 rounded-full text-xs font-black shadow-lg">{p.discount} OFF</div>
                
                {user.role === UserRole.ADMIN && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingPartner(p)} className="p-1.5 bg-gray-800 rounded-lg text-blue-400 border border-gray-700"><Edit3 size={14}/></button>
                    <button onClick={async () => { if(confirm("Excluir parceiro?")) await deleteDocument('partners', p.id!); toast.success("Removido!"); }} className="p-1.5 bg-gray-800 rounded-lg text-brand-red border border-gray-700"><Trash2 size={14}/></button>
                  </div>
                )}
              </div>
            ))}
            {partners.length === 0 && !editingPartner && (
              <div className="py-20 text-center text-gray-600">Nenhum parceiro cadastrado.</div>
            )}
          </div>
        </PageLayout>
      );
    }

    if (currentSection === NavSection.WEB2APP) {
      const [inputUrl, setInputUrl] = useState('http://www.youtube.com/watch?v=dQw4w9WgXcQ');
      const [config, setConfig] = useState<Web2AppConfig>({
        ios_scheme: 'youtube://',
        android_scheme: 'youtube://',
        store_id: '544007664',
        package_name: 'com.google.android.youtube'
      });
      const [results, setResults] = useState<Web2AppResult[]>([]);

      const handleGenerate = () => {
        const res = generateAppLinks(inputUrl, config);
        setResults(res);
      };

      return (
        <PageLayout title="WEB TO APP" onBack={goHome} onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}>
          <div className="space-y-6">
            <div className="bg-brand-card p-6 rounded-3xl border border-gray-800 shadow-xl space-y-4">
              <h3 className="font-suez text-white text-lg uppercase flex items-center gap-2">
                <Globe size={20} className="text-brand-orange"/> Gerador de Links
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">URL da Web</label>
                  <input 
                    type="text" 
                    value={inputUrl} 
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange"
                    placeholder="https://example.com/path"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">iOS Scheme</label>
                    <input 
                      type="text" 
                      value={config.ios_scheme} 
                      onChange={(e) => setConfig({...config, ios_scheme: e.target.value})}
                      className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange"
                      placeholder="myapp://"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Android Scheme</label>
                    <input 
                      type="text" 
                      value={config.android_scheme} 
                      onChange={(e) => setConfig({...config, android_scheme: e.target.value})}
                      className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange"
                      placeholder="myapp://"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">App Store ID</label>
                    <input 
                      type="text" 
                      value={config.store_id} 
                      onChange={(e) => setConfig({...config, store_id: e.target.value})}
                      className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange"
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Package Name</label>
                    <input 
                      type="text" 
                      value={config.package_name} 
                      onChange={(e) => setConfig({...config, package_name: e.target.value})}
                      className="w-full bg-brand-dark border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange"
                      placeholder="com.example.app"
                    />
                  </div>
                </div>

                <FlameButton label="GERAR URIs" onClick={handleGenerate} className="w-full py-4 mt-2" />
              </div>
            </div>

            {results.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">Resultados Gerados</h4>
                {results.map((res, i) => (
                  <div key={i} className="bg-brand-card p-4 rounded-2xl border border-gray-800 shadow-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-brand-orange uppercase tracking-tighter">{res.name}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                        res.platform === 'Web' ? 'border-blue-900/50 text-blue-400' : 
                        res.platform === 'Android' ? 'border-green-900/50 text-green-400' : 
                        'border-indigo-900/50 text-indigo-400'
                      }`}>
                        {res.platform}
                      </span>
                    </div>
                    <div className="bg-brand-dark p-3 rounded-xl border border-gray-700 flex items-center gap-3">
                      <p className="text-[10px] font-mono text-gray-300 break-all flex-1">{res.uri}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(res.uri);
                          toast.success("Copiado!");
                        }}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="flex justify-center pt-2">
                       <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(res.uri)}`} 
                        className="w-20 h-20 invert opacity-80" 
                        alt="QR Code" 
                        referrerPolicy="no-referrer"
                       />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageLayout>
      );
    }

    if (currentSection === NavSection.AI_STUDIO) return <PageLayout title="AI STUDIO" onBack={goHome} onLogout={handleLogout} showBottomNav={showNav} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}><GeminiStudio /></PageLayout>;
    if (currentSection === NavSection.AI_CHAT) return <PageLayout title="ASSISTENTE IA" onBack={goHome} onLogout={handleLogout} showBottomNav={showNav} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}><AIChat /></PageLayout>;
    if (currentSection === NavSection.LIVE_SESSION) return <PageLayout title="LIVE VOICE" onBack={goHome} onLogout={handleLogout} showBottomNav={showNav} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}><LiveSession /></PageLayout>;

    // DEFAULT: HOME
    if (currentSection === NavSection.HOME) {
        const visibleTabs = navConfig.filter(item => item.isVisible && item.section !== NavSection.HOME);
        
        return (
          <PageLayout title="INCENDEIA" onLogout={handleLogout} showBottomNav={true} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle} onOpenMenu={() => setIsMenuOpen(true)}>
             <FloatingGradients />
             <div className="space-y-8 flex flex-col items-center relative z-10">
                {/* Notice Panel */}
                <div className="w-full bg-brand-red/20 border border-brand-red/30 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                   <AlertCircle className="text-brand-red" size={20} />
                   <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap animate-marquee">
                         Próxima Roda de Rua: 15 de Maio na Praça Central! Não perca! • Mensalidades em dia ajudam o grupo!
                      </p>
                   </div>
                </div>

                {/* Rotating Tabs Interface */}
                <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden mt-8">
                   {/* Central Logo with Fire Circle */}
                   <div className="relative z-20 w-40 h-40 flex items-center justify-center">
                      <FireCircle size="w-44 h-44" />
                      <div className="relative z-10 w-32 h-32 rounded-full border-2 border-brand-red bg-black shadow-[0_0_50px_rgba(217,4,41,0.4)] flex items-center justify-center overflow-hidden group">
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
                               className="absolute w-14 h-14 bg-brand-card border-2 border-gray-700 rounded-2xl flex flex-col items-center justify-center shadow-xl hover:border-brand-red hover:scale-110 transition-all duration-300 group"
                               style={{
                                  animation: `orbit-${idx} 30s linear infinite`,
                                  '--start-angle': `${angle}deg`,
                               } as any}
                            >
                               <Icon size={20} className="text-brand-orange group-hover:text-brand-red transition-colors" />
                               <span className="text-[7px] font-bold text-gray-500 mt-1 uppercase truncate w-full px-1 text-center">{item.label}</span>
                               
                               <style>{`
                                  @keyframes orbit-${idx} {
                                     from { transform: rotate(calc(var(--start-angle) + 0deg)) translateX(140px) rotate(calc(var(--start-angle) * -1 - 0deg)); }
                                     to { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(140px) rotate(calc(var(--start-angle) * -1 - 360deg)); }
                                  }
                               `}</style>
                            </button>
                         );
                      })}
                   </div>
                   
                   {/* Background Decorative Rings */}
                   <div className="absolute w-[280px] h-[280px] border border-gray-800 rounded-full opacity-20"></div>
                   <div className="absolute w-[340px] h-[340px] border border-gray-800 rounded-full opacity-10"></div>
                </div>
             </div>
          </PageLayout>
        );
    }
    return <PageLayout title={currentSection} onBack={goHome} onLogout={handleLogout} showBottomNav={showNav} currentSection={currentSection} onNavigate={setCurrentSection} navItems={resolvedNavItems} style={layoutStyle}><div className="flex flex-col items-center justify-center h-64 text-gray-500"><p>Seção em desenvolvimento...</p>{user.role === UserRole.ADMIN && <FlameButton label="ADICIONAR CONTEÚDO" variant="secondary" className="mt-4" />}</div></PageLayout>;
  };

  return (
    <div className="min-h-screen font-sans bg-brand-dark text-white selection:bg-brand-red selection:text-white">
      <Toaster position="top-center" />
      <div className="max-w-md mx-auto bg-brand-dark min-h-screen shadow-2xl relative border-x border-gray-800">
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <FireCircle size="w-32 h-32" />
          </div>
        ) : (
          <>
            {user && (
              <Sidebar 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                navItems={navConfig.filter(item => item.isVisible)} 
                currentSection={currentSection} 
                onNavigate={setCurrentSection} 
                user={user} 
                onLogout={handleLogout} 
              />
            )}
            {renderContent()}
          </>
        )}
      </div>
    </div>
  );
}

const LoginForm = ({ mode, onCancel, onSubmit }: { mode: 'MEMBER' | 'ADMIN', onCancel: () => void, onSubmit: (n: string, p: string, isGoogle?: boolean) => void }) => {
  const [nick, setNick] = useState('');
  const [pass, setPass] = useState('');
  return (
    <div className="bg-brand-card p-6 rounded-3xl shadow-2xl animate-fade-in-up border border-gray-700">
      <div className="flex items-center justify-between mb-6"><h2 className="font-suez text-xl text-white">{mode === 'ADMIN' ? 'ACESSO MESTRE' : 'ACESSO ALUNO'}</h2><button onClick={onCancel} className="text-gray-400 hover:text-brand-red"><LogOut size={20} /></button></div>
      <div className="space-y-5">
        <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Apelido (Obrigatório)</label><input type="text" value={nick} onChange={(e) => setNick(e.target.value)} className="w-full bg-brand-dark border-b-2 border-gray-700 py-2 focus:outline-none focus:border-brand-red font-bold text-lg text-white placeholder-gray-600 transition-colors" placeholder="Seu apelido" /></div>
        <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Senha (Obrigatório)</label><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full bg-brand-dark border-b-2 border-gray-700 py-2 focus:outline-none focus:border-brand-red font-bold text-lg text-white placeholder-gray-600 transition-colors" placeholder="••••••" /></div>
        <div className="pt-4 space-y-3">
          <FlameButton label="SALVAR E ENTRAR" onClick={() => onSubmit(nick, pass)} className="w-full py-4 text-sm" />
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-[1px] bg-gray-800"></div>
            <span className="text-[8px] font-black text-gray-600 uppercase">OU</span>
            <div className="flex-1 h-[1px] bg-gray-800"></div>
          </div>
          <button 
            onClick={() => onSubmit('', '', true)}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-full font-bold text-xs hover:bg-gray-200 transition-all shadow-lg"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            ENTRAR COM GOOGLE
          </button>
        </div>
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