
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { 
  Briefcase, Settings, Plus, Trash2, Sparkles, Linkedin, Mail, 
  Edit3, Eye, MessageSquare, ChevronRight, TrendingUp, Target, 
  Rocket, Star, ArrowUpRight, Globe, Zap, Lightbulb, Users, BarChart3,
  ShieldCheck, Award, Image as ImageIcon, Link as LinkIcon, Camera, Maximize2, Menu, X, Move, MessageCircle, Smartphone
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { FaWhatsapp, FaLinkedin, FaGlobe, FaMobileAlt } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import { Skill, ProfileData, AppMode, Project, Stat } from './types';
import { doc, onSnapshot, setDoc, getDocFromServer } from 'firebase/firestore';
import { db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined,
      email: undefined,
      emailVerified: undefined,
      isAnonymous: undefined,
      tenantId: undefined,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const INITIAL_DATA: ProfileData = {
  name: "",
  title: "",
  bio: "",
  profileImage: "",
  skills: [],
  projects: [],
  galleryImages: [],
  stats: [],
  social: {
    linkedin: 'https://www.linkedin.com/in/%D8%A7%D9%84%D8%B3%D9%8A%D8%AF-%D8%B7%D9%87-878906352?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    twitter: '',
    email: 'st4792453@gmail.com',
    website: '',
    whatsapp: '01067461059',
    appLink: 'https://mnmknk.com/'
  },
  aiReadinessScore: 0,
  roadmap: []
};

const IconMap: Record<string, any> = {
  TrendingUp, Users, Target, ShieldCheck, Rocket, Star, Globe, Zap, Lightbulb, BarChart3, Award, Briefcase, Settings
};

const CATEGORIES: (Skill['category'] | 'الكل')[] = ['الكل', 'Strategy', 'AI Development', 'Growth', 'Operations', 'Other'];

const StatCard: React.FC<{ icon: any, label: string, value: string, sub: string, color: string }> = ({ icon: Icon, label, value, sub, color }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className="glass p-6 md:p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group shadow-xl"
  >
    <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[80px] opacity-30 bg-${color}-500 transition-all group-hover:opacity-50`} />
    <div className="relative z-10 flex flex-col gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-500/20 text-${color}-400 group-hover:scale-110 group-hover:bg-${color}-500/30 transition-all duration-300 shadow-lg relative`}>
        <div className={`absolute inset-0 rounded-2xl bg-${color}-400/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <Icon size={28} className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" />
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-black mb-1">{value}</div>
        <div className="text-sm font-bold text-slate-400 tracking-wide uppercase">{label}</div>
      </div>
      <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-400/10 self-start px-2 py-1 rounded-md">
        <TrendingUp size={12} /> {sub}
      </div>
    </div>
  </motion.div>
);

const Gallery3D: React.FC<{ images: string[] }> = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!images || images.length === 0) return null;

  const rotate = useMotionValue(0);
  const springRotate = useSpring(rotate, { stiffness: 200, damping: 25 });

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length);
    rotate.set(rotate.get() - (360 / images.length));
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
    rotate.set(rotate.get() + (360 / images.length));
  };

  const radius = isMobile ? 280 : 450;
  const cardWidth = isMobile ? "180px" : "280px";
  const cardHeight = isMobile ? "240px" : "380px";

  return (
    <section className="py-24 md:py-32 space-y-16 overflow-hidden">
      <div className="text-center px-4 space-y-4">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          className="text-4xl md:text-6xl font-black"
        >
          معرض الرؤية الاستراتيجية
        </motion.h3>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">لحظات من العمل، الإلهام، والتطوير الريادي في بيئة ثلاثية الأبعاد تفاعلية.</p>
      </div>

      <div className="relative h-[450px] md:h-[600px] flex items-center justify-center perspective-container">
        {/* FIX: Merged duplicate style properties into a single style object to resolve JSX attribute error */}
        <motion.div 
          style={{ 
            rotateY: springRotate, 
            transformStyle: "preserve-3d", 
            width: cardWidth, 
            height: cardHeight 
          }}
          className="relative transition-all"
        >
          {images.map((img, i) => {
            const angle = (360 / images.length) * i;
            return (
              <motion.div
                key={i}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: "hidden",
                  position: "absolute",
                  inset: 0,
                  width: '100%',
                  height: '100%'
                }}
                className="glass rounded-[2rem] overflow-hidden border-2 border-white/10 group cursor-pointer shadow-2xl"
              >
                <img src={img || null} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                   <button className="w-full py-3 glass rounded-xl text-xs font-bold flex items-center justify-center gap-2 border-white/20">
                     <Maximize2 size={16} /> تكبير الرؤية
                   </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Floating Controls */}
        <div className="absolute bottom-4 flex gap-6 z-20">
          <button onClick={prev} className="w-16 h-16 glass rounded-full flex items-center justify-center hover:bg-emerald-500 hover:scale-110 active:scale-90 transition-all shadow-xl border-white/10">
            <ChevronRight className="rotate-180" size={28} />
          </button>
          <button onClick={next} className="w-16 h-16 glass rounded-full flex items-center justify-center hover:bg-emerald-500 hover:scale-110 active:scale-90 transition-all shadow-xl border-white/10">
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
};

const Roadmap: React.FC<{ items: ProfileData['roadmap'] }> = ({ items }) => (
  <section className="py-24 md:py-32 space-y-16">
    <div className="text-center space-y-4">
      <motion.h3 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        className="text-4xl md:text-6xl font-black"
      >
        خارطة الطريق المستقبلية
      </motion.h3>
      <p className="text-slate-500 max-w-2xl mx-auto text-lg">رؤية واضحة للنمو، الابتكار، والريادة في عالم الذكاء الاصطناعي.</p>
    </div>

    <div className="relative max-w-4xl mx-auto px-6">
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-emerald-500/50 via-blue-500/50 to-transparent hidden md:block" />
      
      <div className="space-y-12 md:space-y-24">
        {items.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`relative flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
          >
            <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full glass border-4 border-slate-900 z-10 hidden md:flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full ${item.status === 'completed' ? 'bg-emerald-500' : item.status === 'current' ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <div className={`glass p-8 rounded-[2.5rem] border-white/10 relative group hover:border-emerald-500/30 transition-all shadow-2xl ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                <div className="text-4xl font-black text-emerald-400/20 absolute top-4 right-8 group-hover:text-emerald-400/40 transition-all">{item.year}</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : item.status === 'current' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                  {item.status === 'completed' ? 'مكتمل' : item.status === 'current' ? 'قيد التنفيذ' : 'مخطط له'}
                </div>
                <h4 className="text-2xl font-black mb-2">{item.title}</h4>
                <p className="text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const App: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.VIEW);
  const [activeFilter, setActiveFilter] = useState<Skill['category'] | 'الكل'>('الكل');
  const [editTab, setEditTab] = useState<'profile' | 'skills' | 'projects' | 'gallery' | 'stats' | 'social' | 'roadmap'>('profile');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0.9]);

  const clickCount = useRef(0);
  const lastClickTime = useRef(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current > 1500) {
      clickCount.current = 1;
    } else {
      clickCount.current += 1;
    }
    lastClickTime.current = now;

    if (clickCount.current === 5) {
      clickCount.current = 0;
      setShowAuthModal(true);
      setAuthPassword('');
      setAuthError('');
    }
  };

  const handleAuthSubmit = () => {
    if (authPassword === "admin1234" || authPassword === "1234" || authPassword === "admin 1234") {
      setMode(AppMode.EDIT);
      setShowAuthModal(false);
    } else {
      setAuthError("كلمة المرور غير صحيحة");
    }
  };

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'portfolio', 'connection_test'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();

    const unsub = onSnapshot(doc(db, 'portfolio', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ProfileData;
        setProfile({
          ...INITIAL_DATA,
          ...data,
          skills: data.skills || INITIAL_DATA.skills,
          projects: data.projects || INITIAL_DATA.projects,
          galleryImages: data.galleryImages || INITIAL_DATA.galleryImages,
          stats: data.stats || INITIAL_DATA.stats,
          roadmap: data.roadmap || INITIAL_DATA.roadmap,
          social: { ...INITIAL_DATA.social, ...(data.social || {}) }
        });
      }
      setIsLoaded(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'portfolio/main');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isLoaded && mode === AppMode.EDIT) {
      const saveToFirestore = async () => {
        try {
          await setDoc(doc(db, 'portfolio', 'main'), profile);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'portfolio/main');
        }
      };
      const timeoutId = setTimeout(saveToFirestore, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [profile, isLoaded, mode]);

  const filteredSkills = useMemo(() => 
    profile.skills.filter(s => activeFilter === 'الكل' || s.category === activeFilter),
    [profile.skills, activeFilter]
  );

  const addProject = () => {
    const newProj: Project = {
      id: Date.now().toString(),
      title: 'مشروع استراتيجي جديد',
      impact: 'تأثير إيجابي ملحوظ',
      tech: ['Strategy', 'AI'],
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800'
    };
    setProfile({ ...profile, projects: [...profile.projects, newProj] });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProfile({
      ...profile,
      projects: profile.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const deleteProject = (id: string) => {
    setProfile({ ...profile, projects: profile.projects.filter(p => p.id !== id) });
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: 'مهارة جديدة',
      level: 80,
      category: 'Other',
      description: 'وصف موجز للمهارة'
    };
    setProfile({ ...profile, skills: [...profile.skills, newSkill] });
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setProfile({
      ...profile,
      skills: profile.skills.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const deleteSkill = (id: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s.id !== id) });
  };

  const addStat = () => {
    const newStat: Stat = {
      id: Date.now().toString(),
      label: 'إحصائية جديدة',
      value: '0',
      sub: 'تفاصيل',
      icon: 'Zap',
      color: 'emerald'
    };
    setProfile({ ...profile, stats: [...profile.stats, newStat] });
  };

  const updateStat = (id: string, updates: Partial<Stat>) => {
    setProfile({
      ...profile,
      stats: profile.stats.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const deleteStat = (id: string) => {
    setProfile({ ...profile, stats: profile.stats.filter(s => s.id !== id) });
  };

  const addGalleryImage = () => {
    const url = prompt('أدخل رابط الصورة:');
    if (url) {
      setProfile({ ...profile, galleryImages: [...profile.galleryImages, url] });
    }
  };

  const removeGalleryImage = (idx: number) => {
    if(confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      setProfile({ ...profile, galleryImages: profile.galleryImages.filter((_, i) => i !== idx) });
    }
  };

  const addRoadmapItem = () => {
    const newItem: ProfileData['roadmap'][0] = {
      id: Date.now().toString(),
      year: '202X',
      title: 'هدف جديد',
      description: 'وصف الهدف الاستراتيجي',
      status: 'upcoming'
    };
    setProfile({ ...profile, roadmap: [...profile.roadmap, newItem] });
  };

  const updateRoadmapItem = (id: string, updates: Partial<ProfileData['roadmap'][0]>) => {
    setProfile({
      ...profile,
      roadmap: profile.roadmap.map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const deleteRoadmapItem = (id: string) => {
    if(confirm('هل أنت متأكد من حذف هذا الهدف؟')) {
      setProfile({ ...profile, roadmap: profile.roadmap.filter(item => item.id !== id) });
    }
  };

  return (
    <div className="min-h-screen relative bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-emerald-500/30">
      {/* Immersive Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)]" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Responsive Navbar */}
      <nav className="fixed top-0 w-full z-[100] p-4 md:p-6">
        <motion.div style={{ opacity }} className="max-w-7xl mx-auto glass rounded-[2rem] p-3 md:p-4 flex items-center justify-between border-white/10 shadow-2xl">
          <div onClick={handleLogoClick} className="flex items-center gap-3 md:gap-4 group cursor-pointer pl-2 select-none">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all group-hover:scale-105">
              <span className="font-black text-lg md:text-xl">ST</span>
            </div>
            <div className="block">
              <h1 className="text-base md:text-lg font-black tracking-tight leading-none mb-1">{profile.name || "الاسم"}</h1>
              <p className="text-[8px] md:text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em]">{profile.title || "المسمى الوظيفي"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {mode === AppMode.EDIT && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(AppMode.VIEW)}
                className="px-5 py-2.5 md:px-8 md:py-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm shadow-lg bg-blue-600 text-white hover:bg-blue-500"
              >
                <Eye size={18} />
                <span>إنهاء التعديل</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </nav>

      <main className="relative z-10 pt-32 pb-24 md:pt-48 max-w-7xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {mode === AppMode.VIEW ? (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-32 md:space-y-48">
              
              {/* Hero Section */}
              <section className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
                <div className="space-y-8 md:space-y-10 order-2 lg:order-1">
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border-emerald-500/20 mb-8 bg-emerald-500/5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[10px] md:text-xs text-emerald-400 font-black uppercase tracking-widest">متاح للاستشارات والنمو الاستراتيجي</span>
                    </div>
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-[1.1] mb-8 hero-title">
                      {profile.name ? (
                        <>
                          {profile.name.split(' ')[0]} <span className="gradient-text">{profile.name.split(' ').slice(1).join(' ')}</span> <br />
                        </>
                      ) : (
                        <>
                          <span className="text-slate-600">الاسم</span> <br />
                        </>
                      )}
                      يصنع <span className="text-emerald-400">المستقبل</span>.
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-400 max-w-xl leading-relaxed font-medium">
                      {profile.bio || "نبذة تعريفية..."}
                    </p>
                  </motion.div>

                  <div className="flex flex-wrap items-center gap-4 md:gap-8">
                    <motion.a 
                      href={profile.social.whatsapp ? `https://wa.me/2${profile.social.whatsapp}` : '#'}
                      target="_blank"
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-black px-10 py-5 rounded-[1.5rem] font-black text-lg md:text-xl shadow-2xl flex items-center gap-3 hover:bg-emerald-50 transition-all"
                    >
                      تواصل الآن <Rocket size={22} className="text-emerald-600" />
                    </motion.a>
                    <div className="flex flex-wrap items-center gap-4">
                      {profile.social.whatsapp && (
                        <motion.a href={`https://wa.me/2${profile.social.whatsapp}`} target="_blank" whileHover={{ y: -5, scale: 1.1 }} className="w-14 h-14 md:w-16 md:h-16 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#25D366] hover:border-[#25D366]/50 transition-all shadow-lg">
                          <FaWhatsapp size={28} />
                        </motion.a>
                      )}
                      {profile.social.linkedin && (
                        <motion.a href={profile.social.linkedin} target="_blank" whileHover={{ y: -5, scale: 1.1 }} className="w-14 h-14 md:w-16 md:h-16 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0A66C2] hover:border-[#0A66C2]/50 transition-all shadow-lg">
                          <FaLinkedin size={28} />
                        </motion.a>
                      )}
                      {profile.social.appLink && (
                        <motion.a href={profile.social.appLink} target="_blank" whileHover={{ y: -5, scale: 1.1 }} className="w-14 h-14 md:w-16 md:h-16 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-lg">
                          <FaMobileAlt size={28} />
                        </motion.a>
                      )}
                      {profile.social.website && (
                        <motion.a href={profile.social.website} target="_blank" whileHover={{ y: -5, scale: 1.1 }} className="w-14 h-14 md:w-16 md:h-16 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-lg">
                          <FaGlobe size={28} />
                        </motion.a>
                      )}
                      {profile.social.email && (
                        <motion.a href={`mailto:${profile.social.email}`} whileHover={{ y: -5, scale: 1.1 }} className="w-14 h-14 md:w-16 md:h-16 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#EA4335] hover:border-[#EA4335]/50 transition-all shadow-lg">
                          <SiGmail size={28} />
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative flex justify-center order-1 lg:order-2">
                  <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-full max-w-[320px] md:max-w-[480px] aspect-square group"
                  >
                    <div className="absolute inset-0 bg-emerald-500/30 blur-[120px] rounded-full group-hover:bg-emerald-500/40 transition-all duration-700" />
                    <div className="relative w-full h-full glass rounded-[3rem] md:rounded-[4.5rem] border-2 border-white/10 overflow-hidden p-3 shadow-2xl">
                      {profile.profileImage ? (
                        <img 
                          src={profile.profileImage} 
                          className="w-full h-full object-cover rounded-[2.5rem] md:rounded-[4rem] bg-slate-900" 
                          style={{ objectPosition: `${profile.imagePosition?.x ?? 50}% ${profile.imagePosition?.y ?? 50}%` }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-[2.5rem] md:rounded-[4rem] bg-slate-800 flex items-center justify-center">
                          <ImageIcon size={64} className="text-slate-600" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Enhanced KPI Section */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {profile.stats.map(stat => (
                  <StatCard 
                    key={stat.id}
                    icon={IconMap[stat.icon] || Zap} 
                    label={stat.label} 
                    value={stat.value} 
                    sub={stat.sub} 
                    color={stat.color} 
                  />
                ))}
              </section>

              {/* 3D Dynamic Gallery */}
              <Gallery3D images={profile.galleryImages} />

              {/* Capability Matrix Section */}
              <section className="space-y-20">
                <div className="flex flex-col items-center text-center gap-6">
                  <h3 className="text-4xl md:text-6xl font-black tracking-tight">مصفوفة القدرات الاستراتيجية</h3>
                  <div className="w-32 h-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full" />
                </div>
                
                <div className="grid lg:grid-cols-3 gap-12 md:gap-16 items-start">
                  <div className="lg:col-span-1 glass p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl order-2 lg:order-1">
                    <div className="aspect-square w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={profile.skills}>
                          <PolarGrid stroke="rgba(255,255,255,0.05)" />
                          <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                          <Radar dataKey="level" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-10 order-1 lg:order-2">
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      {CATEGORIES.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveFilter(cat)} 
                          className={`px-8 py-3 rounded-2xl text-xs font-black transition-all border ${activeFilter === cat ? 'bg-emerald-600 border-emerald-400 shadow-xl shadow-emerald-500/30 scale-105' : 'glass border-white/5 text-slate-400 hover:border-white/20'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {filteredSkills.map(skill => (
                        <motion.div key={skill.id} layout className="glass p-8 rounded-[2rem] border-white/5 group relative overflow-hidden transition-all hover:border-emerald-500/30 shadow-lg">
                          <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                              <h4 className="font-black text-xl group-hover:text-emerald-400 transition-colors tracking-tight">{skill.name}</h4>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">{skill.description}</p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">{skill.category}</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>الكفاءة الاستراتيجية</span>
                              <span>{skill.level}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-emerald-500 to-blue-600" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Strategic Projects Grid */}
              <section className="space-y-16">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                  <div className="space-y-4">
                    <h3 className="text-4xl md:text-5xl font-black">قصص النجاح الاستراتيجي</h3>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl">تحويل البيانات والرؤى المجردة إلى نتائج ملموسة وأرقام حقيقية تنبض بالنمو.</p>
                  </div>
                  <button className="text-emerald-400 font-black text-sm flex items-center gap-2 group border-b-2 border-transparent hover:border-emerald-500 transition-all pb-1 mb-2">
                    تصفح الأرشيف الكامل <ChevronRight size={20} className="rotate-180 transition-transform group-hover:translate-x-[-4px]" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {profile.projects.map(proj => (
                    <motion.div 
                      key={proj.id} 
                      whileHover={{ y: -12 }}
                      className="glass rounded-[3rem] overflow-hidden border-white/5 group shadow-2xl relative"
                    >
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img src={proj.image || null} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90" />
                        <div className="absolute bottom-8 left-8 right-8">
                           <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3 bg-emerald-400/10 px-3 py-1 rounded-full w-fit backdrop-blur-md">{proj.impact}</div>
                           <h4 className="text-2xl md:text-3xl font-black leading-tight tracking-tight">{proj.title}</h4>
                        </div>
                      </div>
                      <div className="p-8 md:p-10 space-y-8">
                        <div className="flex flex-wrap gap-2.5">
                          {proj.tech.map(t => <span key={t} className="text-[10px] md:text-xs px-4 py-1.5 glass rounded-full text-slate-400 font-bold border-white/10 uppercase tracking-wider">{t}</span>)}
                        </div>
                        {proj.link ? (
                          <motion.a 
                            href={proj.link}
                            target="_blank"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4.5 rounded-2xl bg-white text-black font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all shadow-xl"
                          >
                            تحليل العائد الاستثماري <ArrowUpRight size={20} className="text-emerald-600" />
                          </motion.a>
                        ) : (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4.5 rounded-2xl bg-white text-black font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all shadow-xl"
                          >
                            تحليل العائد الاستثماري <ArrowUpRight size={20} className="text-emerald-600" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Roadmap Section */}
              <Roadmap items={profile.roadmap} />

            </motion.div>
          ) : (
            <motion.div key="edit" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto glass p-6 md:p-12 rounded-[3rem] md:rounded-[4rem] space-y-12 mb-24 border-white/10 shadow-3xl">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8">
                  <div className="text-center md:text-right">
                    <h2 className="text-4xl md:text-5xl font-black mb-2">غرفة القيادة</h2>
                    <p className="text-slate-500 font-medium text-lg tracking-wide">التحكم الكامل في الهوية الرقمية والاستراتيجية.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        if(confirm('هل أنت متأكد من إعادة تعيين جميع البيانات إلى القيم الافتراضية؟')) {
                          setProfile(INITIAL_DATA);
                        }
                      }}
                      className="px-6 py-3 glass rounded-2xl text-emerald-500 font-bold text-sm border-emerald-500/20 hover:bg-emerald-500/10"
                    >
                      إعادة تعيين
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
                          setProfile({ ...INITIAL_DATA, name: '', title: '', bio: '', skills: [], projects: [], galleryImages: [], stats: [], roadmap: [] });
                        }
                      }}
                      className="px-6 py-3 glass rounded-2xl text-red-500 font-bold text-sm border-red-500/20 hover:bg-red-500/10"
                    >
                      تصفير البيانات
                    </button>
                    <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/30">
                      <Settings size={28} className="animate-spin-slow" />
                    </div>
                  </div>
               </div>

               {/* Control Tabs */}
               <div className="flex flex-wrap gap-2 justify-center md:justify-start border-b border-white/5 pb-6">
                  {[
                    { id: 'profile', label: 'الملف الشخصي', icon: Users },
                    { id: 'skills', label: 'المهارات', icon: Zap },
                    { id: 'projects', label: 'المشاريع', icon: Briefcase },
                    { id: 'gallery', label: 'المعرض', icon: ImageIcon },
                    { id: 'stats', label: 'الإحصائيات', icon: BarChart3 },
                    { id: 'roadmap', label: 'خارطة الطريق', icon: Target },
                    { id: 'social', label: 'التواصل', icon: LinkIcon },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setEditTab(tab.id as any)}
                      className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${editTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'glass text-slate-400 hover:text-white'}`}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  ))}
               </div>

               <div className="mt-8">
                 {editTab === 'profile' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                     <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <label className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">الاسم المهني</label>
                          <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full glass bg-white/5 rounded-2xl px-8 py-5 outline-none border border-white/10 focus:border-emerald-500 transition-all font-bold text-lg" />
                        </div>
                        <div className="space-y-4">
                          <label className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">المسمى الوظيفي</label>
                          <input value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} className="w-full glass bg-white/5 rounded-2xl px-8 py-5 outline-none border border-white/10 focus:border-emerald-500 transition-all font-bold text-lg" />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">النبذة التعريفية</label>
                        <textarea rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full glass bg-white/5 rounded-3xl px-8 py-6 outline-none border border-white/10 focus:border-emerald-500 transition-all text-lg font-medium leading-relaxed resize-none" />
                     </div>
                     <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">صورة البروفايل</label>
                        <div className="flex items-center gap-4">
                          {profile.profileImage && (
                            <img 
                              src={profile.profileImage} 
                              alt="Profile Preview" 
                              className="w-16 h-16 rounded-2xl object-cover bg-slate-900 border border-white/10" 
                              style={{ objectPosition: `${profile.imagePosition?.x ?? 50}% ${profile.imagePosition?.y ?? 50}%` }}
                            />
                          )}
                          <label className="flex-1 cursor-pointer glass bg-white/5 hover:bg-white/10 rounded-2xl px-8 py-5 border border-white/10 focus-within:border-emerald-500 transition-all flex items-center justify-center gap-3">
                            <ImageIcon size={20} className="text-slate-400" />
                            <span className="font-bold text-sm text-slate-300">اختر صورة من الجهاز</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setProfile({...profile, profileImage: reader.result as string, imagePosition: { x: 50, y: 50 }});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                            />
                          </label>
                        </div>
                        {profile.profileImage && (
                          <div className="grid grid-cols-2 gap-4 mt-2 p-4 glass bg-white/5 rounded-2xl border border-white/10">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">تحريك أفقي</label>
                              <input 
                                type="range" min="0" max="100" 
                                value={profile.imagePosition?.x ?? 50} 
                                onChange={e => setProfile({...profile, imagePosition: { x: parseInt(e.target.value), y: profile.imagePosition?.y ?? 50 }})} 
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">تحريك رأسي</label>
                              <input 
                                type="range" min="0" max="100" 
                                value={profile.imagePosition?.y ?? 50} 
                                onChange={e => setProfile({...profile, imagePosition: { x: profile.imagePosition?.x ?? 50, y: parseInt(e.target.value) }})} 
                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                              />
                            </div>
                          </div>
                        )}
                     </div>
                     <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">مستوى الجاهزية للذكاء الاصطناعي ({profile.aiReadinessScore}%)</label>
                        <input type="range" min="0" max="100" value={profile.aiReadinessScore} onChange={e => setProfile({...profile, aiReadinessScore: parseInt(e.target.value)})} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                     </div>
                   </motion.div>
                 )}

                 {editTab === 'skills' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <div className="flex justify-between items-center">
                       <h3 className="text-xl font-black">إدارة المهارات</h3>
                       <button onClick={addSkill} className="px-6 py-2 bg-emerald-600 rounded-xl text-sm font-bold">+ إضافة مهارة</button>
                     </div>
                     <div className="grid gap-4">
                       {profile.skills.map(skill => (
                         <div key={skill.id} className="glass p-6 rounded-2xl border-white/5 flex flex-col md:flex-row gap-4 items-center">
                           <input value={skill.name} onChange={e => updateSkill(skill.id, {name: e.target.value})} className="flex-1 bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 font-bold" />
                           <select value={skill.category} onChange={e => updateSkill(skill.id, {category: e.target.value as any})} className="bg-slate-800 rounded-lg px-4 py-2 text-xs outline-none">
                             {CATEGORIES.filter(c => c !== 'الكل').map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                           <div className="flex items-center gap-3 w-48">
                             <input type="range" min="0" max="100" value={skill.level} onChange={e => updateSkill(skill.id, {level: parseInt(e.target.value)})} className="flex-1 h-1 accent-emerald-500" />
                             <span className="text-xs font-mono w-8">{skill.level}%</span>
                           </div>
                           <button onClick={() => { if(confirm('حذف المهارة؟')) deleteSkill(skill.id); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {editTab === 'projects' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <div className="flex justify-between items-center">
                       <h3 className="text-xl font-black">إدارة المشاريع</h3>
                       <button onClick={addProject} className="px-6 py-2 bg-emerald-600 rounded-xl text-sm font-bold">+ إضافة مشروع</button>
                     </div>
                     <div className="grid gap-6">
                       {profile.projects.map(proj => (
                         <div key={proj.id} className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 relative">
                           <button onClick={() => { if(confirm('حذف المشروع؟')) deleteProject(proj.id); }} className="absolute top-6 left-6 text-red-500 hover:scale-110 transition-all"><Trash2 size={20} /></button>
                           <div className="grid md:grid-cols-2 gap-6">
                             <input value={proj.title} onChange={e => updateProject(proj.id, {title: e.target.value})} placeholder="عنوان المشروع" className="bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 font-bold text-lg" />
                             <input value={proj.impact} onChange={e => updateProject(proj.id, {impact: e.target.value})} placeholder="الأثر (مثال: نمو 20%)" className="bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 text-emerald-400 font-bold" />
                           </div>
                           <div className="grid md:grid-cols-3 gap-6">
                             <input value={proj.image} onChange={e => updateProject(proj.id, {image: e.target.value})} placeholder="رابط الصورة" className="bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 text-xs font-mono" />
                             <input value={proj.link || ''} onChange={e => updateProject(proj.id, {link: e.target.value})} placeholder="رابط المشروع" className="bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 text-xs font-mono" />
                             <input value={proj.tech.join(', ')} onChange={e => updateProject(proj.id, {tech: e.target.value.split(',').map(t => t.trim())})} placeholder="التقنيات (فاصلة)" className="bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 text-sm" />
                           </div>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {editTab === 'gallery' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <div className="flex justify-between items-center">
                       <h3 className="text-xl font-black">معرض الصور</h3>
                       <button onClick={addGalleryImage} className="px-6 py-2 bg-emerald-600 rounded-xl text-sm font-bold">+ إضافة صورة</button>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {profile.galleryImages.map((img, i) => (
                         <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden glass border-white/10">
                           <img src={img || null} className="w-full h-full object-cover" />
                           <button onClick={() => removeGalleryImage(i)} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"><Trash2 size={24} /></button>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {editTab === 'stats' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <div className="flex justify-between items-center">
                       <h3 className="text-xl font-black">الإحصائيات الحيوية</h3>
                       <button onClick={addStat} className="px-6 py-2 bg-emerald-600 rounded-xl text-sm font-bold">+ إضافة إحصائية</button>
                     </div>
                     <div className="grid gap-4">
                       {profile.stats.map(stat => (
                         <div key={stat.id} className="glass p-6 rounded-2xl border-white/5 grid md:grid-cols-5 gap-4 items-center">
                           <input value={stat.label} onChange={e => updateStat(stat.id, {label: e.target.value})} placeholder="العنوان" className="bg-transparent border-b border-white/10 outline-none py-2 font-bold" />
                           <input value={stat.value} onChange={e => updateStat(stat.id, {value: e.target.value})} placeholder="القيمة" className="bg-transparent border-b border-white/10 outline-none py-2 font-black text-emerald-400" />
                           <input value={stat.sub} onChange={e => updateStat(stat.id, {sub: e.target.value})} placeholder="التفاصيل" className="bg-transparent border-b border-white/10 outline-none py-2 text-xs" />
                           <select value={stat.icon} onChange={e => updateStat(stat.id, {icon: e.target.value})} className="bg-slate-800 rounded-lg px-4 py-2 text-xs">
                             {Object.keys(IconMap).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                           </select>
                           <div className="flex justify-end">
                             <button onClick={() => { if(confirm('حذف الإحصائية؟')) deleteStat(stat.id); }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {editTab === 'social' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <h3 className="text-xl font-black">روابط التواصل الاجتماعي</h3>
                     <div className="grid md:grid-cols-2 gap-8">
                       {[
                         { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                         { id: 'twitter', label: 'Twitter / X', icon: Globe },
                         { id: 'email', label: 'Email', icon: Mail },
                         { id: 'website', label: 'Website', icon: ArrowUpRight },
                         { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                         { id: 'appLink', label: 'App Link', icon: Smartphone },
                       ].map(social => (
                         <div key={social.id} className="space-y-3">
                           <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><social.icon size={14} /> {social.label}</label>
                           <input 
                            value={(profile.social as any)[social.id] || ''} 
                            onChange={e => setProfile({...profile, social: {...profile.social, [social.id]: e.target.value}})} 
                            className="w-full glass bg-white/5 rounded-xl px-6 py-4 outline-none border border-white/10 focus:border-emerald-500 transition-all text-sm" 
                           />
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {editTab === 'roadmap' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <div className="flex justify-between items-center">
                       <h3 className="text-xl font-black">خارطة الطريق</h3>
                       <button onClick={addRoadmapItem} className="px-6 py-2 bg-emerald-600 rounded-xl text-sm font-bold">+ إضافة هدف</button>
                     </div>
                     <div className="grid gap-6">
                       {profile.roadmap.map(item => (
                         <div key={item.id} className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 relative">
                           <button onClick={() => deleteRoadmapItem(item.id)} className="absolute top-6 left-6 text-red-500 hover:scale-110 transition-all"><Trash2 size={20} /></button>
                           <div className="grid md:grid-cols-3 gap-6">
                             <input value={item.year} onChange={e => updateRoadmapItem(item.id, {year: e.target.value})} placeholder="السنة" className="bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 font-bold text-lg" />
                             <input value={item.title} onChange={e => updateRoadmapItem(item.id, {title: e.target.value})} placeholder="العنوان" className="bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 font-bold" />
                             <select value={item.status} onChange={e => updateRoadmapItem(item.id, {status: e.target.value as any})} className="bg-slate-800 rounded-lg px-4 py-2 text-xs">
                               <option value="completed">مكتمل</option>
                               <option value="current">قيد التنفيذ</option>
                               <option value="upcoming">مخطط له</option>
                             </select>
                           </div>
                           <textarea rows={2} value={item.description} onChange={e => updateRoadmapItem(item.id, {description: e.target.value})} placeholder="الوصف" className="w-full bg-transparent border-b border-white/10 outline-none focus:border-emerald-500 py-2 text-sm resize-none" />
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass p-6 md:p-8 rounded-3xl max-w-sm w-full border border-white/10 shadow-2xl"
              >
                <h3 className="text-xl font-bold mb-4 text-center">غرفة التحكم</h3>
                <p className="text-sm text-slate-400 mb-6 text-center">الرجاء إدخال الرقم السري للمتابعة</p>
                
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => {
                    setAuthPassword(e.target.value);
                    setAuthError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAuthSubmit();
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 text-center text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="الرقم السري"
                  autoFocus
                />
                
                {authError && (
                  <p className="text-red-400 text-sm mb-4 text-center">{authError}</p>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleAuthSubmit}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-colors font-bold"
                  >
                    دخول
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-20 md:py-32 text-center border-t border-white/5 glass">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-right space-y-4">
             <h5 className="text-3xl md:text-4xl font-black gradient-text tracking-tighter">{profile.name || "الاسم"}</h5>
             <p className="text-slate-500 text-sm font-black uppercase tracking-[0.4em]">{profile.title || "المسمى الوظيفي"}</p>
          </div>
          <div className="flex gap-8 items-center text-slate-600 text-sm font-bold">
            <a href="#" className="hover:text-emerald-500 transition-colors">استراتيجيات</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">عن الشركة</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">تواصل</a>
          </div>
          
          <div className="flex items-center gap-4">
            {profile.social.whatsapp && (
              <a href={`https://wa.me/2${profile.social.whatsapp}`} target="_blank" className="text-slate-500 hover:text-[#25D366] transition-colors">
                <FaWhatsapp size={24} />
              </a>
            )}
            {profile.social.linkedin && (
              <a href={profile.social.linkedin} target="_blank" className="text-slate-500 hover:text-[#0A66C2] transition-colors">
                <FaLinkedin size={24} />
              </a>
            )}
            {profile.social.email && (
              <a href={`mailto:${profile.social.email}`} className="text-slate-500 hover:text-[#EA4335] transition-colors">
                <SiGmail size={24} />
              </a>
            )}
          </div>

          <p className="text-slate-600 text-xs font-black uppercase tracking-widest">© {new Date().getFullYear()} {profile.name || "الاسم"}.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
