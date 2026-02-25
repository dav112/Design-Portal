import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  CheckCircle2, 
  X, 
  Layout, 
  Monitor, 
  Smartphone, 
  Calendar, 
  User, 
  Briefcase,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Image as ImageIcon,
  Trash2,
  Settings
} from 'lucide-react';
import { cn } from './lib/utils';

// ===== DEMO MODE (GitHub Pages) =====
// Auto aktif kalau dibuka dari *.github.io
const DEMO_MODE =
  ((import.meta as any).env?.VITE_DEMO_MODE === 'true') ||
  window.location.hostname.endsWith('github.io');

const DEMO_USER = ((import.meta as any).env?.VITE_DEMO_USER as string) || 'admin';
const DEMO_PASS = ((import.meta as any).env?.VITE_DEMO_PASS as string) || 'admin123';

type PortoItem = { id: number; title: string; image_url: string; category?: string };

const DEMO_PORTFOLIO_KEY = 'demo_portfolio_items_v1';
const DEMO_AUTH_KEY = 'demo_admin_authed_v1';

const getDemoPortfolio = (): PortoItem[] => {
  try {
    const raw = localStorage.getItem(DEMO_PORTFOLIO_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveDemoPortfolio = (items: PortoItem[]) => {
  localStorage.setItem(DEMO_PORTFOLIO_KEY, JSON.stringify(items));
};

// --- Components ---

const PortfolioSection = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  useEffect(() => {
    setLoading(true);

    // ✅ DEMO: GitHub Pages tanpa backend
    if (DEMO_MODE) {
      const data = getDemoPortfolio();
      setItems(data);
      setLoading(false);
      return;
    }

    // ✅ NORMAL: pakai backend
    fetch('/api/portfolio')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load masterpieces');
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items.length]);

  if (loading) {
    return (
      <section className="w-full max-w-6xl mt-32 mb-24 px-6 z-10 text-center">
        <div className="inline-block w-8 h-8 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin mb-4" />
        <p className="text-white/20 uppercase tracking-widest text-[10px] font-bold">Loading Showcase...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-6xl mt-32 mb-24 px-6 z-10 text-center">
        <p className="text-red-500/50 uppercase tracking-widest text-[10px] font-bold">{error}</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="w-full max-w-6xl mt-32 mb-24 px-6 z-10 text-center">
        <p className="text-white/20 uppercase tracking-widest text-[10px] font-bold italic">No masterpieces published yet.</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-6xl mt-32 mb-24 px-6 z-10 min-h-[400px]">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full glass border-white/10 text-white/40 text-[10px] font-bold tracking-widest uppercase mb-4"
        >
          Showcase
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase italic">My Masterpieces</h2>
        <div className="w-24 h-1 bg-neon-green mx-auto rounded-full shadow-[0_0_10px_rgba(57,255,20,0.5)]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedIndex(i)}
            className="glass rounded-[32px] overflow-hidden group border-white/5 hover:border-neon-green/30 transition-all duration-500 cursor-pointer"
          >
            <div className="aspect-[4/3] overflow-hidden relative bg-white/5">
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
                onError={(e: any) => {
                  if (e.target.src !== 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop') {
                    e.target.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop';
                  } else {
                    e.target.style.display = 'none';
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white text-black px-6 py-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">View Details</span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_5px_rgba(57,255,20,1)]" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[150px]">{item.category || 'Visual Design'}</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-neon-green transition-colors line-clamp-2">{item.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox - iPhone App Switcher Style */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
              onClick={() => setSelectedIndex(null)}
            />
            
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Desktop Navigation */}
              <div className="absolute inset-y-0 left-0 w-20 md:w-40 flex items-center justify-center z-50 hidden md:flex">
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="p-4 text-white/20 hover:text-neon-green transition-all transform hover:scale-125 active:scale-95"
                >
                  <ChevronLeft size={64} strokeWidth={1} />
                </button>
              </div>
              
              <div className="absolute inset-y-0 right-0 w-20 md:w-40 flex items-center justify-center z-50 hidden md:flex">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="p-4 text-white/20 hover:text-neon-green transition-all transform hover:scale-125 active:scale-95"
                >
                  <ChevronRight size={64} strokeWidth={1} />
                </button>
              </div>

              <div className="relative w-full max-w-[95vw] md:max-w-5xl h-[85vh] flex items-center justify-center pointer-events-none perspective-1000">
                <AnimatePresence mode="popLayout" initial={false}>
                  {/* Ghost Card Left */}
                  {selectedIndex > 0 && (
                    <motion.div
                      key={`ghost-left-${items[selectedIndex-1].id}`}
                      initial={{ x: -400, opacity: 0, scale: 0.8, rotateY: -25 }}
                      animate={{ x: -280, opacity: 0.3, scale: 0.85, rotateY: -15 }}
                      exit={{ x: -400, opacity: 0 }}
                      className="absolute w-full h-full max-w-[400px] md:max-w-2xl hidden md:block pointer-events-none"
                    >
                      <div className="w-full h-full bg-white/5 rounded-[60px] border border-white/10" />
                    </motion.div>
                  )}

                  <motion.div
                    key={items[selectedIndex].id}
                    initial={{ x: 500, opacity: 0, scale: 0.5, rotateY: 45 }}
                    animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ x: -500, opacity: 0, scale: 0.5, rotateY: -45 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 26
                    }}
                    className="absolute w-full h-full max-w-[450px] md:max-w-3xl pointer-events-auto z-[60]"
                  >
                    <div className="w-full h-full bg-[#000] rounded-[60px] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col relative group">
                      {/* Glass Close Button - Top Right of Image */}
                      <div className="absolute top-6 right-6 z-[70] pointer-events-auto">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                          className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center text-white transition-all border border-white/10 shadow-lg active:scale-90 group/close"
                        >
                          <X size={24} className="group-hover/close:rotate-90 transition-transform duration-300" />
                        </button>
                      </div>

                      {/* Image Area - Full Space, No Crop */}
                      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
                        <motion.img 
                          initial={{ filter: 'blur(60px)', scale: 0.9, opacity: 0 }}
                          animate={{ filter: 'blur(0px)', scale: 1, opacity: 1 }}
                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                          src={items[selectedIndex].image_url} 
                          alt={items[selectedIndex].title}
                          className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="max-w-2xl"
                        >
                          <h3 className="text-2xl md:text-4xl font-black text-white leading-none tracking-tighter uppercase italic mb-3 drop-shadow-md">
                            {items[selectedIndex].title}
                          </h3>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-1">
                              {items.map((_, idx) => (
                                <div 
                                  key={idx} 
                                  className={cn(
                                    "h-1 rounded-full transition-all duration-500", 
                                    idx === selectedIndex ? "bg-neon-green w-8" : "bg-white/10 w-1.5"
                                  )} 
                                />
                              ))}
                            </div>
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                              {selectedIndex + 1} / {items.length}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Ghost Card Right */}
                  {selectedIndex < items.length - 1 && (
                    <motion.div
                      key={`ghost-right-${items[selectedIndex+1].id}`}
                      initial={{ x: 400, opacity: 0, scale: 0.8, rotateY: 25 }}
                      animate={{ x: 280, opacity: 0.3, scale: 0.85, rotateY: 15 }}
                      exit={{ x: 400, opacity: 0 }}
                      className="absolute w-full h-full max-w-[400px] md:max-w-2xl hidden md:block pointer-events-none"
                    >
                      <div className="w-full h-full bg-white/5 rounded-[60px] border border-white/10" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const AdminPortal = ({ onClose }: { onClose: () => void }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (!DEMO_MODE) return false;
    return localStorage.getItem(DEMO_AUTH_KEY) === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [items, setItems] = useState<any[]>([]);
  
  const [newPorto, setNewPorto] = useState({ title: '', image_url: '', category: '' });

  useEffect(() => {
    if (isLoggedIn && activeTab === 'manage') {
      if (DEMO_MODE) {
        setItems(getDemoPortfolio());
        return;
      }
      fetch('/api/portfolio').then(res => res.json()).then(setItems);
    }
  }, [isLoggedIn, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // ✅ DEMO LOGIN (tanpa backend)
      if (DEMO_MODE) {
        const ok = username === DEMO_USER && password === DEMO_PASS;
        if (ok) {
          localStorage.setItem(DEMO_AUTH_KEY, 'true');
          setIsLoggedIn(true);
        } else {
          setError('Invalid credentials');
        }
        return;
      }

      // ✅ NORMAL LOGIN (pakai backend)
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      if (res.ok) setIsLoggedIn(true);
      else setError('Invalid credentials');
    } catch (err) {
      setError('Connection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPorto({ ...newPorto, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPorto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPorto.title || !newPorto.image_url) {
      alert('Title and Image are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // ✅ DEMO ADD (localStorage)
      if (DEMO_MODE) {
        const current = getDemoPortfolio();
        const newItem: PortoItem = {
          id: Date.now(),
          title: newPorto.title,
          image_url: newPorto.image_url,
          category: newPorto.category || ''
        };
        const next = [newItem, ...current];
        saveDemoPortfolio(next);

        alert('Portfolio added! (DEMO)');
        setNewPorto({ title: '', image_url: '', category: '' });
        window.location.reload();
        return;
      }

      // ✅ NORMAL ADD (backend)
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPorto),
        credentials: 'include'
      });
      if (res.ok) {
        alert('Portfolio added!');
        setNewPorto({ title: '', image_url: '', category: '' });
        window.location.reload();
      } else {
        alert('Failed to add portfolio');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    // ✅ DEMO DELETE (localStorage)
    if (DEMO_MODE) {
      const current = getDemoPortfolio();
      const next = current.filter(item => item.id !== id);
      saveDemoPortfolio(next);
      setItems(next);
      return;
    }

    // ✅ NORMAL DELETE (backend)
    try {
      const res = await fetch(`/api/portfolio/${id}`, { 
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
      } else {
        const errorMsg = data.error || 'Unknown error';
        console.error(`Delete failed: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={cn(
          "glass p-8 md:p-10 rounded-[40px] border-white/10 w-full z-20 relative overflow-hidden",
          isLoggedIn ? "max-w-3xl" : "max-w-md"
        )}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[100] w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-xl active:scale-90 group/admin-close"
        >
          <X size={24} className="group-hover/admin-close:rotate-90 transition-transform duration-300" />
        </button>

        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <User className="text-white/40" size={32} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Admin Login</h2>
              <p className="text-white/40 text-sm">Portfolio Management Access</p>
            </div>
            <Input 
              label="Username" 
              placeholder="admin"
              value={username} 
              onChange={(e: any) => setUsername(e.target.value)} 
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e: any) => setPassword(e.target.value)} 
            />
            {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>}
            <Button variant="neon" className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Unlock Portal'}
            </Button>

            {DEMO_MODE && (
              <p className="text-center text-[10px] uppercase tracking-widest text-white/30">
                Demo login: <span className="text-white/60 font-bold">admin / admin123</span>
              </p>
            )}
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('add')}
                className={cn(
                  "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'add' ? "bg-neon-green text-black" : "text-white/40 hover:text-white"
                )}
              >
                Add New
              </button>
              <button 
                onClick={() => setActiveTab('manage')}
                className={cn(
                  "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'manage' ? "bg-neon-green text-black" : "text-white/40 hover:text-white"
                )}
              >
                Manage
              </button>
            </div>

            {activeTab === 'add' ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-neon-green/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-neon-green/20">
                    <Plus className="text-neon-green" size={24} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">New Work</h2>
                  <p className="text-white/40 text-xs">Add a masterpiece to your showcase</p>
                </div>
                <form onSubmit={handleAddPorto} className="space-y-4">
                  <Input label="Project Title" placeholder="Futuristic Poster" value={newPorto.title} onChange={(e: any) => setNewPorto({...newPorto, title: e.target.value})} />
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Project Image</label>
                    <div className="flex flex-col gap-3">
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group-hover:border-neon-green/50 transition-all">
                          {newPorto.image_url ? (
                            <img src={newPorto.image_url} className="w-full h-24 object-cover rounded-lg" />
                          ) : (
                            <>
                              <ImageIcon className="text-white/20" size={20} />
                              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center">Click or drag to upload</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-[9px] font-bold text-white/20 uppercase">OR</span>
                        </div>
                        <input 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/50 pl-12 text-xs"
                          placeholder="Paste Image URL here..."
                          value={newPorto.image_url.startsWith('data:') ? '' : newPorto.image_url}
                          onChange={(e: any) => setNewPorto({...newPorto, image_url: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <Input label="Category" placeholder="Branding / UI / Print" value={newPorto.category} onChange={(e: any) => setNewPorto({...newPorto, category: e.target.value})} />
                  <Button variant="neon" className="w-full py-3" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing...' : 'Publish Work'}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.length === 0 ? (
                  <p className="text-center text-white/20 py-10 italic">No items to manage</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group/item">
                        <img src={item.image_url} className="w-10 h-10 rounded-lg object-cover" onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop'} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold truncate">{item.title} <span className="text-[8px] opacity-30">#{item.id}</span></h4>
                          <p className="text-[9px] text-white/40 uppercase tracking-widest truncate">{item.category}</p>
                        </div>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-6 border-t border-white/5">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={async () => {
                  if (DEMO_MODE) {
                    localStorage.removeItem(DEMO_AUTH_KEY);
                    setIsLoggedIn(false);
                    return;
                  }
                  await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
                  setIsLoggedIn(false);
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const SprayText = ({ text }: { text: string }) => {
  return (
    <div className="spray-text gap-y-0 gap-x-1">
      {text.split(' ').map((word, i) => (
        <span 
          key={i} 
          className="spray-word" 
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'neon' }) => {
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md",
    outline: "border border-white/20 text-white hover:bg-white/5",
    neon: "bg-neon-green text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] transition-all duration-300"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const Input = ({ label, error, icon, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 transition-all",
          icon && "pl-12",
          error && "border-red-500 focus:ring-red-500/50"
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
  </div>
);

const TextArea = ({ label, error, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">{label}</label>}
    <textarea
      className={cn(
        "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/50 focus:border-neon-green/50 transition-all min-h-[120px]",
        error && "border-red-500 focus:ring-red-500/50"
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
  </div>
);

const RadioGroup = ({ label, options, value, onChange }: any) => (
  <div className="space-y-2">
    {label && <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">{label}</label>}
    <div className="flex flex-wrap gap-2">
      {options.map((opt: string) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "px-4 py-2 rounded-lg border text-sm font-semibold transition-all",
            value === opt 
              ? "bg-neon-green/20 border-neon-green text-neon-green" 
              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

// --- Pages ---

const HomePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    type: 'Online',
    description: '',
    deadline: '',
    media: 'Instagram',
    file_format: 'JPG/PNG',
    print_media_type: 'Poster',
    size: 'A4',
    finishing: 'Glossy',
    isUrgent: false
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.description) newErrors.description = 'Description is required';
    else if (formData.description.length < 20) newErrors.description = 'Minimum 20 characters';
    
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    else {
      const deadline = new Date(formData.deadline);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      if (deadline < tomorrow && !formData.isUrgent) {
        newErrors.deadline = 'Minimal deadline is tomorrow';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadline < today) newErrors.deadline = 'Cannot be in the past';
      }
    }

    if (formData.type === 'Online') {
      if (!formData.media) newErrors.media = 'Media is required';
      if (!formData.file_format) newErrors.file_format = 'Format is required';
    } else {
      if (!formData.print_media_type) newErrors.print_media_type = 'Media type is required';
      if (!formData.size) newErrors.size = 'Size is required';
      if (!formData.finishing) newErrors.finishing = 'Finishing is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.telegramStatus || '');
        setShowSuccess(true);
        setFormData({ 
          name: '', role: '', type: 'Online', description: '', deadline: '',
          media: 'Instagram', file_format: 'JPG/PNG', print_media_type: 'Poster', size: 'A4', finishing: 'Glossy',
          isUrgent: false
        });
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      alert('Failed to connect to server. Please check if the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-24 p-6 relative">
      {/* Decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-green/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full z-10"
      >
        <header className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full glass border-neon-green/20 text-neon-green text-xs font-bold tracking-widest uppercase mb-4"
          >
            Premium Design Service
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
            <span className="flicker-neon">DESIGN</span> <span className="rainbow-text drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">PORTAL</span>
          </h1>
          <div className="text-white/40 text-sm md:text-base max-w-md mx-auto leading-[1.1] font-medium tracking-tight">
            <SprayText text="Tuangin ide lo sekarang, biar tim kita yang eksekusi sampe jadi nyata, iziinn.." />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="glass p-8 md:p-10 rounded-[32px] border-white/5 space-y-8 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Full Name" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={(e: any) => setFormData({...formData, name: e.target.value})}
              error={errors.name}
              icon={<User size={18} />}
            />
            <Input 
              label="Job Role" 
              placeholder="Marketing Manager" 
              value={formData.role}
              onChange={(e: any) => setFormData({...formData, role: e.target.value})}
              error={errors.role}
              icon={<Briefcase size={18} />}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Design Category</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'Online'})}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all",
                  formData.type === 'Online' 
                    ? "bg-neon-green/10 border-neon-green text-neon-green" 
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                )}
              >
                <Monitor size={20} />
                <span className="font-bold">Online</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'Offline'})}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all",
                  formData.type === 'Offline' 
                    ? "bg-neon-green/10 border-neon-green text-neon-green" 
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                )}
              >
                <Layout size={20} />
                <span className="font-bold">Offline</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {formData.type === 'Online' ? (
              <motion.div
                key="online-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RadioGroup 
                    label="Media" 
                    options={['Instagram', 'TikTok']} 
                    value={formData.media} 
                    onChange={(val: string) => setFormData({...formData, media: val})}
                  />
                  <RadioGroup 
                    label="Format File" 
                    options={['JPG/PNG', 'MP4']} 
                    value={formData.file_format} 
                    onChange={(val: string) => setFormData({...formData, file_format: val})}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="offline-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RadioGroup 
                    label="Jenis Media Cetak" 
                    options={['Poster', 'Banner', 'Brosur']} 
                    value={formData.print_media_type} 
                    onChange={(val: string) => setFormData({...formData, print_media_type: val})}
                  />
                  <RadioGroup 
                    label="Ukuran" 
                    options={['A4', 'A3', '60x160cm', '80x200cm', 'Custom']} 
                    value={formData.size} 
                    onChange={(val: string) => setFormData({...formData, size: val})}
                  />
                </div>
                <RadioGroup 
                  label="Finishing" 
                  options={['Glossy', 'Doff']} 
                  value={formData.finishing} 
                  onChange={(val: string) => setFormData({...formData, finishing: val})}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <TextArea 
            label="Project Description" 
            placeholder="Describe your design needs in detail (min 20 chars)..." 
            value={formData.description}
            onChange={(e: any) => setFormData({...formData, description: e.target.value})}
            error={errors.description}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Target Deadline" 
              type="date" 
              value={formData.deadline}
              onChange={(e: any) => setFormData({...formData, deadline: e.target.value})}
              error={errors.deadline}
            />
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 block">Priority</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isUrgent: !formData.isUrgent })}
                className={cn(
                  "w-full h-[52px] rounded-xl border flex items-center justify-between px-4 transition-all duration-300",
                  formData.isUrgent 
                    ? "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
                    : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    formData.isUrgent ? "bg-red-500/20" : "bg-white/5"
                  )}>
                    <AlertCircle size={18} className={formData.isUrgent ? "text-red-400" : "text-white/20"} />
                  </div>
                  <span className="font-bold text-sm">URGENT REQUEST</span>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  formData.isUrgent ? "border-red-400 bg-red-400" : "border-white/20"
                )}>
                  {formData.isUrgent && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="neon" 
            className="w-full py-4 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit Request"}
            <Send size={20} />
          </Button>
        </form>
      </motion.div>

      <PortfolioSection />

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowSuccess(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass p-10 rounded-[40px] border-neon-green/30 max-w-md w-full text-center z-10 relative"
            >
              <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-neon-green" size={40} />
              </div>
              <h2 className="text-3xl font-black mb-2">REQUEST SENT!</h2>
              <p className="text-white/60 mb-4">
                Your design request has been successfully received.
              </p>
              {statusMsg && (
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest p-2 rounded-lg mb-8",
                  statusMsg === 'Sent' ? "bg-neon-green/10 text-neon-green" : "bg-red-500/10 text-red-400"
                )}>
                  Telegram: {statusMsg}
                </div>
              )}
              <Button 
                variant="neon" 
                className="w-full"
                onClick={() => setShowSuccess(false)}
              >
                Close Portal
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-12 mb-12 text-white/20 text-xs font-medium tracking-widest uppercase flex flex-col items-center gap-6 z-10">
        <div className="flex items-center gap-4">
          <span>© 2026 DESIGN PORTAL</span>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <button 
            onClick={() => setShowAdmin(true)}
            className="hover:text-neon-green transition-colors"
          >
            ADMIN ACCESS
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {showAdmin && <AdminPortal onClose={() => setShowAdmin(false)} />}
      </AnimatePresence>
    </div>
  );
};

const CursorLight = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, rgba(57, 255, 20, 0.07), transparent 80%)`
      }}
    />
  );
};

export default function App() {
  return (
    <div className="relative min-h-screen">
      <div className="grain" />
      <CursorLight />
      <HomePage />
    </div>
  );
}
