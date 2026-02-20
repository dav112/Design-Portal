import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  CheckCircle2,
  Layout,
  Monitor,
  User,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { cn } from './lib/utils';

/** =========================
 *  TELEGRAM (OPSI 2 - CEPAT, TIDAK AMAN)
 *  ========================= */
const BOT_TOKEN = '8176258662:AAF0meeeM7XVU88__nP3YkPs3tKCQ26Eb18';
const CHAT_ID = '1341641647';

async function sendToTelegram(text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Telegram error');
  return data;
}

// --- Components ---

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
      // bikin pesan rapih untuk Telegram
      const lines: string[] = [];
      lines.push('🟢 NEW DESIGN REQUEST');
      lines.push(`Nama: ${formData.name}`);
      lines.push(`Role: ${formData.role}`);
      lines.push(`Kategori: ${formData.type}`);
      lines.push(`Deadline: ${formData.deadline}`);
      lines.push(`Urgent: ${formData.isUrgent ? 'YES' : 'NO'}`);

      if (formData.type === 'Online') {
        lines.push(`Media: ${formData.media}`);
        lines.push(`Format: ${formData.file_format}`);
      } else {
        lines.push(`Media Cetak: ${formData.print_media_type}`);
        lines.push(`Ukuran: ${formData.size}`);
        lines.push(`Finishing: ${formData.finishing}`);
      }

      lines.push('');
      lines.push('Deskripsi:');
      lines.push(formData.description);

      const message = lines.join('\n');

      await sendToTelegram(message);

      setStatusMsg('Sent');
      setShowSuccess(true);
      setFormData({
        name: '', role: '', type: 'Online', description: '', deadline: '',
        media: 'Instagram', file_format: 'JPG/PNG', print_media_type: 'Poster', size: 'A4', finishing: 'Glossy',
        isUrgent: false
      });
    } catch (err: any) {
      setStatusMsg('Failed');
      alert('Gagal kirim ke Telegram: ' + (err?.message || 'unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
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
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              icon={<User size={18} />}
            />
            <Input
              label="Job Role"
              placeholder="Marketing Manager"
              value={formData.role}
              onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
              error={errors.role}
              icon={<Briefcase size={18} />}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Design Category</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Online' })}
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
                onClick={() => setFormData({ ...formData, type: 'Offline' })}
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
                    onChange={(val: string) => setFormData({ ...formData, media: val })}
                  />
                  <RadioGroup
                    label="Format File"
                    options={['JPG/PNG', 'MP4']}
                    value={formData.file_format}
                    onChange={(val: string) => setFormData({ ...formData, file_format: val })}
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
                    onChange={(val: string) => setFormData({ ...formData, print_media_type: val })}
                  />
                  <RadioGroup
                    label="Ukuran"
                    options={['A4', 'A3', '60x160cm', '80x200cm', 'Custom']}
                    value={formData.size}
                    onChange={(val: string) => setFormData({ ...formData, size: val })}
                  />
                </div>
                <RadioGroup
                  label="Finishing"
                  options={['Glossy', 'Doff']}
                  value={formData.finishing}
                  onChange={(val: string) => setFormData({ ...formData, finishing: val })}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <TextArea
            label="Project Description"
            placeholder="Describe your design needs in detail (min 20 chars)..."
            value={formData.description}
            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Target Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e: any) => setFormData({ ...formData, deadline: e.target.value })}
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

      <footer className="mt-12 text-white/20 text-xs font-medium tracking-widest uppercase flex items-center gap-4 z-10">
        <span>© 2026 DESIGN PORTAL</span>
        <div className="w-1 h-1 bg-white/20 rounded-full" />
        <a href="/admin" className="hover:text-neon-green transition-colors">ADMIN ACCESS</a>
      </footer>
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
