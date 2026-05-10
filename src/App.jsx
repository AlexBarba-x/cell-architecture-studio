import React, { useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useTime, useReducedMotion } from 'framer-motion';
import { 
  Grid, Book, Settings, ChevronDown, Plus, Heart, 
  Camera, Box, Layers, Target, EyeOff, Maximize, 
  Star, Info, ChevronRight, RotateCcw
} from 'lucide-react';

// --- ASSETS ---
const ASSETS = {
  hero: "https://raw.githubusercontent.com/AlexBarba-x/cell-architecture-core-assets/main/white_blood_cell_hero_original.png",
};

const FALLBACK_DATA_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='60%25'%3E%3Cstop offset='0%25' stop-color='%23fdfbf7'/%3E%3Cstop offset='100%25' stop-color='%23ebe4da'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='800' height='800' fill='url(%23g)'/%3E%3Ccircle cx='400' cy='400' r='220' fill='%236A4C93' fill-opacity='.16'/%3E%3Ctext x='400' y='415' text-anchor='middle' font-family='Inter,sans-serif' font-size='28' fill='%237A736E'%3EAsset loading…%3C/text%3E%3C/svg%3E";

const LayeredImage = ({ src, alt, className, style }) => {
  const [failed, setFailed] = useState(false);

  return (
    <motion.img
      src={failed ? FALLBACK_DATA_URI : src}
      alt={alt}
      className={className}
      style={style}
      draggable={false}
      loading="lazy"
      decoding="async"
      fetchPriority="high"
      crossOrigin="anonymous"
      onError={() => setFailed(true)}
    />
  );
};

// --- DATA ---
const CELL_TYPES = [
  { id: 'plant', name: 'Plant Cell', type: 'Eukaryotic Cell', icon: '🌿' },
  { id: 'wbc', name: 'White Blood Cell', type: 'Immune Cell', icon: '🦠', active: true, starred: true },
  { id: 'neuron', name: 'Neuron', type: 'Nerve Cell', icon: '⚡' },
  { id: 'epithelial', name: 'Epithelial Cell', type: 'Human Tissue Cell', icon: '🧱' },
  { id: 'bacteria', name: 'Bacteria Cell', type: 'Prokaryotic Cell', icon: '💊' },
  { id: 'animal', name: 'Animal Cell', type: 'Eukaryotic Cell', icon: '🦁' },
  { id: 'muscle', name: 'Muscle Cell', type: 'Muscle Fiber', icon: '💪' },
];

const ORGANELLES = [
  { id: 'nucleus', name: 'Nucleus', color: '#D986FF', summary: 'Houses DNA and coordinates core cellular decisions.', detail: 'The nucleus protects the genome and regulates transcription programs that determine immune response behavior.' },
  { id: 'lobed', name: 'Lobed Nucleus', color: '#C97AEE', summary: 'Segmented architecture that improves flexibility in transit.', detail: 'A lobed profile helps white blood cells deform and migrate through narrow endothelial junctions.' },
  { id: 'plasma', name: 'Plasma Membrane', color: '#D4B886', summary: 'Selective, signaling-rich cellular boundary.', detail: 'Membrane receptors detect chemotactic cues and coordinate movement toward inflammatory targets.' },
  { id: 'lysosome', name: 'Lysosome', color: '#B97CCB', summary: 'Acidic recycling center for biomolecular cleanup.', detail: 'Lysosomes digest engulfed pathogens and recycle macromolecules with pH-dependent hydrolase enzymes.' },
  { id: 'golgi', name: 'Golgi Apparatus', color: '#E8A598', summary: 'Modifies and routes proteins to functional destinations.', detail: 'The Golgi packages enzymes and membrane proteins required for secretion, trafficking, and immune signaling.' },
];

// --- COMPONENTS ---

const InteractiveCellViewer = () => {
  const prefersReducedMotion = useReducedMotion();
  // Core physical drag/hover coordinates
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const isDragging = useMotionValue(false);

  // Restrained spring for subtle inertial drag
  const springConfig = { damping: 58, stiffness: 112, mass: 2.05, restDelta: 0.001 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  // Gentle floating drift
  const time = useTime();
  const breathY = useTransform(time, [0, 14000, 28000], [0, -2, 0], { clamp: false });
  const breathScale = useTransform(time, [0, 14000, 28000], [1, 1.002, 1], { clamp: false });
  const floatRotate = useTransform(time, [0, 24000, 48000], [-0.15, 0.15, -0.15], { clamp: false });

  // Tiny interaction tilt only
  const rotateX = useTransform(y, [-240, 240], [3, -3]);
  const rotateY = useTransform(x, [-240, 240], [-3, 3]);

  // 3. DYNAMIC SPECULAR LIGHTING - Soft membrane gloss responding to cursor/drag
  const lightX = useTransform(x, [-240, 240], [56, 44]);
  const lightY = useTransform(y, [-240, 240], [56, 44]);
  
  const highlightBg = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 35%, rgba(255, 255, 255, 0) 65%)`;

  // Micro lighting shift for hero body, tied to interaction depth
  const heroBrightness = useTransform(y, [-240, 240], [1.01, 0.99]);
  const heroFilter = useMotionTemplate`brightness(${heroBrightness})`;

  // 4. ANCHORING SHADOWS - Moves opposite to interaction to ground the object
  const dropShadowX = useTransform(x, [-240, 240], [5, -5]);
  const dropShadowY = useTransform(y, [-240, 240], [5, -5]);

  // 5. MOUSE-REACTIVE DIMENSIONALITY - Subtle tracking without dragging
  const handlePointerMove = (e) => {
    if (isDragging.get()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Convert pointer distance from center into a subtle transform offset
    rawX.set((e.clientX - centerX) * 0.045);
    rawY.set((e.clientY - centerY) * 0.045);
  };

  const handlePointerLeave = () => {
    if (isDragging.get()) return;
    rawX.set(0);
    rawY.set(0);
  };

  const bgParticles = useMemo(() => Array.from({ length: 2 }, (_, i) => i), []);

  return (
    <>
      {/* Background Particles (z-index: 0, scoped to container bounds via overflow-hidden) */}
      <div className="absolute inset-0 z-0 pointer-events-none rounded-3xl overflow-hidden">
        {bgParticles.map((i) => (
          <motion.div
            key={`bg-part-${i}`}
            className="absolute rounded-full will-change-transform"
            style={{
              width: 18 + i * 10,
              height: 18 + i * 10,
              background: 'rgba(106, 76, 147, 0.06)',
              left: `${22 + i * 40}%`,
              top: `${28 + i * 20}%`,
              filter: 'blur(4px)',
            }}
            animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
            transition={{ duration: 15 + i * 2, repeat: Infinity, ease: [0.32, 0, 0.18, 1], delay: i * 0.7 }}
          />
        ))}
      </div>

      {/* --- CELL IMAGE MOUNT --- */}
      <div 
        style={{
          position: 'absolute',
          left: '50%',
          top: '56%',
          transform: 'translate(-50%, -50%)',
          width: 'min(96%, 980px)',
          zIndex: 2,
          perspective: '1400px'
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <motion.div
          className="relative w-full aspect-square pointer-events-auto cursor-grab active:cursor-grabbing"
          drag
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          dragTransition={{
            power: 0.14,
            timeConstant: 640,
            bounceStiffness: 120,
            bounceDamping: 40
          }}
          onDragStart={() => isDragging.set(true)}
          onDrag={(e, info) => {
            rawX.set(info.offset.x);
            rawY.set(info.offset.y);
          }}
          onDragEnd={() => {
            isDragging.set(false);
          }}
          style={{
            rotateX,
            rotateY,
            y: prefersReducedMotion ? 0 : breathY,
            scale: prefersReducedMotion ? 1 : breathScale,
            rotateZ: prefersReducedMotion ? 0 : floatRotate,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          {/* Restrained backlight */}
          <div 
            className="absolute inset-0 m-auto w-[68%] h-[68%] rounded-full bg-white/35 blur-[28px] pointer-events-none"
            style={{ transform: 'translateZ(-36px)' }}
          />

          {/* Grounding shadow */}
          <motion.div 
            className="absolute inset-0 m-auto w-[62%] h-[62%] rounded-full bg-black/16 blur-[22px] pointer-events-none"
            style={{ x: dropShadowX, y: dropShadowY, translateZ: -24 }}
          />

          {/* Primary hero layer only */}
          <LayeredImage
            src={ASSETS.hero}
            alt="White blood cell hero image"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_20px_rgba(0,0,0,0.1)]"
            style={{
              translateZ: 0,
              filter: heroFilter,
              willChange: 'transform, filter',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0.01px)'
            }}
          />

          {/* Restrained lighting response */}
          <motion.div 
            className="absolute inset-[8%] w-[84%] h-[84%] rounded-full pointer-events-none mix-blend-soft-light"
            style={{ background: highlightBg, translateZ: 8 }}
          />
        </motion.div>
      </div>
    </>
  );
};

// --- PREMIUM UI WRAPPERS ---

const PremiumButton = ({ children, active, className, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.015, y: -1.5 }}
    whileTap={{ scale: 0.985 }}
    transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
    className={`relative overflow-hidden transition-all duration-300 ${active ? 'bg-white shadow-sm border border-white/80' : 'hover:bg-white/55 hover:shadow-sm border border-transparent'} ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

const PremiumPanel = ({ children, className }) => (
  <motion.div
    whileHover={{ y: -1 }}
    transition={{ type: 'spring', stiffness: 250, damping: 26 }}
    className={`bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_34px_rgb(0,0,0,0.06)] rounded-3xl p-5 transition-shadow duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// --- ARCHITECTURE LAYOUT BLOCKS ---

const TopNav = () => (
  <header className="h-[72px] flex items-center justify-between px-4 md:px-8 border-b border-black/5 bg-[#F0EDE8]/80 backdrop-blur-xl shrink-0 z-40 relative">
    <div className="flex items-center gap-4">
      <motion.div 
        whileHover={{ rotate: 15, scale: 1.05 }}
        className="w-10 h-10 rounded-2xl bg-[#F0EDE8] flex items-center justify-center shadow-inner shadow-black/10"
      >
        <svg viewBox="0 0 128 128" className="w-8 h-8" role="img" aria-label="Dragon Hall crest">
          <path d="M64 14 96 25v27c0 24-13 45-32 58C45 97 32 76 32 52V25z" fill="#171713" />
          <path d="M49 46c6-8 18-7 26-2-7-1-12 2-15 6 6 0 11 2 14 7-6-3-14-2-21 3 2-6 6-10 11-14-6-1-11 0-15 4z" fill="#F0EDE8" />
          <circle cx="72" cy="44" r="2.2" fill="#D986FF" />
        </svg>
      </motion.div>
      <div className="flex flex-col justify-center">
        <h1 className="font-serif text-[22px] text-[#1D1B19] leading-none tracking-tight">Dragon Hall</h1>
      </div>
      <div className="hidden md:flex items-center gap-2 ml-4">
        <div className="h-4 w-px bg-black/10" />
        <span className="text-xs italic text-[#8A837A] font-serif pt-1">Biology Atlas</span>
      </div>
    </div>

    <nav className="hidden md:flex items-center gap-4 lg:gap-7">
      {[
        { icon: Grid, label: 'Gallery' },
        { icon: Layers, label: 'Library' },
        { icon: Book, label: 'Notebooks' },
        { icon: Settings, label: 'Settings' },
      ].map((item, idx) => (
        <motion.button key={idx} whileHover={{ y: -2 }} className="flex flex-col items-center gap-1 text-[#6E6961] hover:text-[#1D1B19] transition-colors group">
          <item.icon size={18} className="group-hover:drop-shadow-sm transition-all duration-300" />
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{item.label}</span>
        </motion.button>
      ))}
      <div className="w-px h-8 bg-black/10 mx-1"></div>
      <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-[#EDE7F4] p-0.5 shadow-sm overflow-hidden flex items-center justify-center border border-white">
           <img src="https://i.pravatar.cc/150?img=44" alt="User" className="w-full h-full rounded-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.opacity = "0.35"; }} />
        </div>
        <ChevronDown size={14} className="text-[#6E6961] group-hover:text-[#1D1B19] transition-colors" />
      </motion.div>
    </nav>
  </header>
);

const LeftColumn = ({ selectedOrganelleId, hoveredOrganelleId, setHoveredOrganelleId, onSelectOrganelle }) => (
  <aside className="flex flex-col gap-[20px] overflow-hidden h-full">
    <PremiumPanel className="flex flex-col flex-1">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xs uppercase tracking-widest text-[#6E6961] font-bold flex items-center gap-2">
          <Layers size={14} className="text-[#D986FF]" /> Cell Types
        </h2>
        <ChevronDown size={14} className="text-[#A39E98]" />
      </div>
      
      <div className="flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar flex-1 -mr-2">
        {CELL_TYPES.map((cell) => (
          <PremiumButton key={cell.id} active={cell.active} className="flex items-center gap-3 p-3 rounded-2xl w-full text-left">
            {cell.active && <motion.div layoutId="sidebarHighlight" className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#D986FF]" />}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${cell.active ? 'bg-[#F2EEF7] border border-[#EDE7F4]' : 'bg-black/5 border border-transparent'}`}>
              {cell.icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${cell.active ? 'text-[#1D1B19]' : 'text-[#4C4842]'}`}>{cell.name}</h3>
              <p className="text-xs text-[#8A837A]">{cell.type}</p>
            </div>
            {cell.starred && <Star size={14} className="text-[#B97CCB] fill-[#B97CCB]" />}
          </PremiumButton>
        ))}
      </div>
    </PremiumPanel>

    <PremiumPanel className="h-[280px] flex flex-col shrink-0">
       <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xs uppercase tracking-widest text-[#6E6961] font-bold flex items-center gap-2">
          <Target size={14} className="text-[#B97CCB]" /> Organelles
        </h2>
        <ChevronDown size={14} className="text-[#A39E98]" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {ORGANELLES.map(org => {
          const isActive = selectedOrganelleId === org.id;
          const isHovered = hoveredOrganelleId === org.id;
          return (
            <div key={org.id} className="relative">
              <PremiumButton
                active={isActive}
                onMouseEnter={() => setHoveredOrganelleId(org.id)}
                onMouseLeave={() => setHoveredOrganelleId(null)}
                onFocus={() => setHoveredOrganelleId(org.id)}
                onBlur={() => setHoveredOrganelleId(null)}
                onClick={() => onSelectOrganelle(org.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left transition-all duration-400 ${isHovered ? 'bg-white/85 border border-white shadow-[0_10px_20px_rgba(106,76,147,0.12)]' : ''}`}
              >
                <div className="w-3 h-3 rounded-full shadow-inner border border-black/10 transition-transform duration-300" style={{ backgroundColor: org.color, transform: isHovered ? 'scale(1.15)' : 'scale(1)' }} />
                <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-[#1D1B19]' : 'text-[#4C4842]'}`}>{org.name}</span>
              </PremiumButton>

              <motion.div
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                transition={{ duration: 0.24, ease: [0.32, 0, 0.18, 1] }}
                className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 w-56 z-20 bg-[#F0EDE8]/95 backdrop-blur-md border border-white rounded-xl shadow-lg px-3 py-2"
              >
                <p className="text-[11px] uppercase tracking-widest text-[#8A837A] font-semibold mb-1">Educational Note</p>
                <p className="text-xs text-[#4C4842] leading-relaxed">{org.summary}</p>
              </motion.div>
            </div>
          );
        })}

      </div>
      <motion.button 
        whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }}
        whileTap={{ scale: 0.99 }}
        className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-white/50 border border-[#DDD7CF] rounded-xl text-sm text-[#4C4842] font-medium transition-all shadow-sm text-[#1D1B19]"
      >
        <Plus size={16} /> Add Organelle
      </motion.button>
    </PremiumPanel>
  </aside>
);

const RightColumn = ({ selectedOrganelleId }) => {
  const selectedOrganelle = ORGANELLES.find((org) => org.id === selectedOrganelleId) || ORGANELLES[3];
  return (
  <aside className="flex flex-col gap-[20px] overflow-y-auto custom-scrollbar pr-1 h-full">
    <PremiumPanel>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif italic text-[#6E6961] uppercase tracking-widest text-[11px] font-bold">Organelle Details</h2>
        <motion.div whileHover={{ scale: 1.1 }} className="cursor-pointer">
           <Heart size={16} className="text-[#B97CCB] fill-[#B97CCB]" />
        </motion.div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-white to-[#EFEBE5] shadow-[0_2px_10px_rgb(0,0,0,0.05)] flex items-center justify-center border border-white">
          <div className="grid grid-cols-3 gap-[3px] p-2.5">
            {Array.from({length: 9}).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#D986FF] shadow-inner" />
            ))}
          </div>
        </div>
        <div>
          <motion.h3 key={selectedOrganelle.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-[22px] font-serif text-[#1D1B19] leading-tight">{selectedOrganelle.name}</motion.h3>
          <motion.p key={`${selectedOrganelle.id}-summary`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-xs text-[#8A837A] italic mt-0.5">{selectedOrganelle.summary}</motion.p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Size', value: 'About 7 - 20 μm' },
          { label: 'Location', value: 'Blood, lymph, tissues' },
          { label: 'Visible in LM', value: 'Yes, with stain' },
        ].map((stat, idx) => (
          <div key={idx} className="flex justify-between text-sm border-b border-black/5 pb-2">
            <span className="text-[#8A837A]">{stat.label}</span>
            <span className="text-[#1D1B19] font-semibold">{stat.value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center text-sm pt-1">
          <span className="text-[#8A837A]">Label Visiblity</span>
          <div className="flex items-center gap-3">
            <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-6 bg-[#D986FF] rounded-full p-1 cursor-pointer relative shadow-inner">
              <motion.div layout className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
            </motion.div>
            <div className="w-3 h-3 rounded-full bg-[#D986FF] shadow-sm border border-black/10" />
          </div>
        </div>
      </div>
    </PremiumPanel>

    <PremiumPanel>
      <h2 className="font-serif italic text-[#6E6961] uppercase tracking-widest text-[11px] font-bold mb-4">Biological Notes</h2>
      <motion.p key={`${selectedOrganelle.id}-detail`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-sm text-[#4C4842] leading-relaxed mb-4">
        {selectedOrganelle.detail}
      </motion.p>
      <motion.div whileHover={{ scale: 1.01 }} className="p-4 bg-gradient-to-br from-[#FDFBF7] to-[#EFEBE5] rounded-2xl border border-white shadow-sm flex items-start gap-3">
        <span className="text-xl leading-none pt-0.5">✨</span>
        <p className="text-xs text-[#D986FF] italic font-semibold leading-relaxed">
          Fun Fact: Some white blood cells can change shape to squeeze between blood vessel walls and reach infected tissue!
        </p>
      </motion.div>
    </PremiumPanel>

    <PremiumPanel>
      <h2 className="font-serif italic text-[#6E6961] uppercase tracking-widest text-[11px] font-bold mb-4">Where It Occurs</h2>
      <div className="h-36 bg-gradient-to-br from-white to-[#EFEBE5] rounded-2xl border border-white shadow-inner overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-100 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center gap-6">
           <motion.span animate={{ y: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: [0.32, 0, 0.18, 1] }} className="text-[50px] z-10 drop-shadow-md">
             🧍
           </motion.span>
           <div className="w-20 h-20 rounded-full border border-red-300/50 border-dashed animate-[spin_12s_linear_infinite] flex items-center justify-center p-1.5 z-10">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-red-100 to-white shadow-sm flex items-center justify-center text-2xl animate-[spin_12s_linear_infinite_reverse]">🩸</div>
           </div>
        </div>
      </div>
    </PremiumPanel>
  </aside>
  );
};

const CenterColumn = ({ selectedOrganelleId, hoveredOrganelleId, setHoveredOrganelleId, onSelectOrganelle }) => {
  const [viewMode, setViewMode] = useState('layers');
  const [crossSection, setCrossSection] = useState(true);
  const selectedOrganelle = ORGANELLES.find((org) => org.id === selectedOrganelleId) || ORGANELLES[3];
  const isolateLysosome = selectedOrganelleId === 'lysosome';

  return (
    <div className="flex flex-col gap-[20px] min-w-0 h-full">
      
      {/* --- HERO STAGE --- */}
      <div 
        className="relative flex-1 bg-gradient-to-br from-[#EFEBE5] to-[#DDD7CF]/40 rounded-3xl border border-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4),_0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
        style={{ minHeight: '520px', minWidth: 0 }}
      >
        {/* Floating Note (z-index: 5) */}
        <div className="absolute top-6 left-6 pointer-events-none" style={{ zIndex: 5 }}>
          <h1 className="font-serif text-5xl text-[#1D1B19] mb-1 tracking-tight drop-shadow-sm">White Blood Cell</h1>
          <p className="font-serif text-[22px] text-[#6E6961] italic">Immune Cell</p>
          
          <motion.div 
            initial={{ rotate: -5, scale: 0.9, opacity: 0 }}
            animate={{ rotate: -3, scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="mt-6 bg-[#F0EDE8]/90 backdrop-blur-md p-4 rounded-2xl shadow-lg w-56 rotate-[-3deg] pointer-events-auto border border-white"
          >
            <ul className="text-[13px] font-serif italic text-[#6A604A] space-y-2.5">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#B97CCB]"/> Drag cell to rotate</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#D986FF]"/> Observe dynamic depth</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#D4B886]"/> Physics-based interaction</li>
            </ul>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-2.5 bg-white/80 rounded-full shadow-sm" />
          </motion.div>
        </div>

        {/* View Mode Controls (z-index: 5) */}
        <div className="absolute top-6 right-6 bg-white/70 backdrop-blur-xl border border-white/80 p-3 rounded-2xl shadow-sm pointer-events-auto" style={{ zIndex: 5 }}>
          <div className="text-[10px] uppercase tracking-widest text-[#6E6961] font-bold mb-2 ml-1">View Mode</div>
          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl mb-4 relative">
            {['cube', 'layers', 'dot'].map((mode) => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`w-11 h-9 rounded-lg flex items-center justify-center relative transition-colors z-10 ${viewMode === mode ? 'text-[#D986FF]' : 'text-[#6E6961] hover:text-[#1D1B19]'}`}
              >
                {viewMode === mode && <motion.div layoutId="viewMode" className="absolute inset-0 bg-white rounded-lg shadow-sm border border-black/5 -z-10" />}
                {mode === 'cube' && <Box size={18} />}
                {mode === 'layers' && <Layers size={18} />}
                {mode === 'dot' && <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-current" />}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-1.5">
            <span className="text-xs text-[#4C4842] font-semibold">Cross-Section</span>
            <div 
              onClick={() => setCrossSection(!crossSection)}
              className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors relative shadow-inner ${crossSection ? 'bg-[#3B82F6]' : 'bg-black/20'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-all duration-300 ${crossSection ? 'left-6' : 'left-1'}`} />
            </div>
          </div>
        </div>

        {/* Interactive Cell Viewer Base System */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${isolateLysosome ? 'saturate-110' : ''}`}
          onMouseLeave={() => setHoveredOrganelleId(null)}
        >
          <InteractiveCellViewer />

          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{ opacity: isolateLysosome ? 1 : 0 }}
            transition={{ duration: 0.45 }}
            style={{ background: 'radial-gradient(circle at 56% 56%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 17%, rgba(55,45,44,0.22) 33%, rgba(55,45,44,0.3) 100%)' }}
          />

          <motion.button
            onMouseEnter={() => setHoveredOrganelleId('lysosome')}
            onMouseLeave={() => setHoveredOrganelleId(null)}
            onClick={() => onSelectOrganelle('lysosome')}
            className="absolute left-[52%] top-[56%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full pointer-events-auto"
            animate={{ scale: hoveredOrganelleId === 'lysosome' || isolateLysosome ? 1 : 0.96 }}
            transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            style={{ background: 'radial-gradient(circle, rgba(217,115,138,0.35), rgba(217,115,138,0.04))', boxShadow: hoveredOrganelleId === 'lysosome' || isolateLysosome ? '0 0 0 1px rgba(217,115,138,0.45), 0 0 24px rgba(217,115,138,0.35)' : '0 0 0 1px rgba(217,115,138,0.2)' }}
          >
            <span className="sr-only">Focus lysosome</span>
          </motion.button>
        </div>

        {/* Bottom Viewer Controls (z-index: 5) */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none" style={{ zIndex: 5 }}>
          <div className="flex gap-2 pointer-events-auto">
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#4C4842] hover:text-[#1D1B19]">
              <RotateCcw size={16} /> Rotate
            </PremiumButton>
            <PremiumButton onClick={() => onSelectOrganelle('lysosome')} active={selectedOrganelleId === 'lysosome'} className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#4C4842] hover:text-[#1D1B19]">
              <Target size={16} /> {selectedOrganelleId === 'lysosome' ? 'Lysosome Isolated' : 'Isolate Lysosome'}
            </PremiumButton>
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#4C4842] hover:text-[#1D1B19]">
              <EyeOff size={16} /> Hide Others
            </PremiumButton>
            <div className="w-px bg-black/10 mx-2 my-2" />
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#4C4842] hover:text-[#1D1B19]">
              <Maximize size={16} /> Reset View
            </PremiumButton>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#4C4842] hover:text-[#1D1B19]">
              <Camera size={16} /> Screenshot
            </PremiumButton>
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#4C4842] hover:text-[#1D1B19]">
              <Box size={16} /> 3D Export
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Bottom Panels Row */}
      <div className="flex gap-[20px] shrink-0 h-[200px]">
        {/* Microscope View */}
        <PremiumPanel className="flex-[2] flex flex-col p-5">
          <div className="flex items-center gap-2 mb-4 px-1">
            <h2 className="font-serif italic text-[#6E6961] uppercase tracking-widest text-[11px] font-bold">Microscope View</h2>
            <Info size={12} className="text-[#A39E98]" />
          </div>
          <div className="flex gap-4 flex-1 overflow-x-auto custom-scrollbar pb-2">
            {[
              { id: 1, name: 'Light Microscope', color: 'bg-[#F0EDE8] border-[#DDD7CF]' },
              { id: 2, name: 'Stained Selection', color: 'bg-purple-50 border-purple-200' },
              { id: 3, name: 'Electron Microscope', color: 'bg-gray-100 border-gray-300 grayscale' },
            ].map((view) => (
               <motion.div key={view.id} whileHover={{ y: -2 }} className="w-[160px] shrink-0 flex flex-col gap-2.5 cursor-pointer group">
                  <div className={`flex-1 rounded-2xl border-[1.5px] overflow-hidden relative ${view.color} transition-all shadow-sm group-hover:shadow-md`}>
                     <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                     <div className="w-full h-full flex items-center justify-center opacity-70 mix-blend-overlay text-4xl drop-shadow-sm">🦠</div>
                  </div>
                  <span className="text-xs font-semibold text-center text-[#4C4842] group-hover:text-[#1D1B19] transition-colors">{view.name}</span>
               </motion.div>
            ))}
            <motion.button whileHover={{ y: -2, backgroundColor: '#ffffff' }} className="w-[120px] shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#D1CFC9] bg-white/50 transition-colors text-[#6E6961] hover:text-[#1D1B19]">
              <Plus size={24} className="opacity-80" />
              <span className="text-[11px] font-semibold tracking-wide">Add Image</span>
            </motion.button>
          </div>
        </PremiumPanel>

        {/* Compare Cells */}
        <PremiumPanel className="flex-[1] flex flex-col p-5">
           <div className="flex items-center gap-2 mb-5 px-1">
            <h2 className="font-serif italic text-[#6E6961] uppercase tracking-widest text-[11px] font-bold">Compare Cells</h2>
            <Info size={12} className="text-[#A39E98]" />
          </div>
          <div className="bg-gradient-to-r from-white to-[#FDFBF7] rounded-2xl border border-[#DDD7CF] p-3.5 flex items-center justify-between relative mb-4 shadow-sm">
             <div className="flex items-center gap-3">
                <span className="text-2xl drop-shadow-sm">🦠</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1D1B19]">White Blood Cell</span>
                  <span className="text-[10px] text-[#8A837A] italic">(You are here)</span>
                </div>
             </div>
             
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#D986FF] to-[#C97AEE] text-white flex items-center justify-center text-[10px] font-black shadow-md z-10 border-2 border-white">
                VS
             </div>

             <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-[#1D1B19]">Epithelial Cell</span>
                  <span className="text-[10px] text-[#8A837A] italic">Tissue</span>
                </div>
                <span className="text-2xl drop-shadow-sm">🧱</span>
             </div>
          </div>
          <motion.button whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }} whileTap={{ scale: 0.99 }} className="w-full py-2.5 bg-white/50 rounded-xl border border-black/5 text-xs font-bold text-[#4C4842] hover:text-[#1D1B19] transition-all flex items-center justify-center gap-2 mt-auto shadow-sm">
            Open Comparison View <ChevronRight size={14} />
          </motion.button>
        </PremiumPanel>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedOrganelleId, setSelectedOrganelleId] = useState('lysosome');
  const [hoveredOrganelleId, setHoveredOrganelleId] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Manrope:wght@400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.15); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.25); }

        @media (max-width: 1279px) {
          main {
            grid-template-columns: minmax(210px, 240px) 1fr !important;
          }
          main > :last-child {
            display: none;
          }
        }

        @media (max-width: 1023px) {
          header {
            height: 64px;
          }
          main {
            grid-template-columns: 1fr !important;
            height: calc(100vh - 64px) !important;
          }
          main > :first-child {
            display: none;
          }
        }
      `}</style>
      
      <div className="h-screen w-screen bg-[#F0EDE8] text-[#1D1B19] font-sans flex flex-col overflow-hidden selection:bg-[#EDE7F4]">
        <TopNav />
        <main 
          className="grid gap-4 lg:gap-[20px] p-3 md:p-5 overflow-x-hidden"
          style={{ gridTemplateColumns: 'minmax(220px,260px) 1fr minmax(280px,330px)', height: 'calc(100vh - 72px)' }}
        >
          <LeftColumn
            selectedOrganelleId={selectedOrganelleId}
            hoveredOrganelleId={hoveredOrganelleId}
            setHoveredOrganelleId={setHoveredOrganelleId}
            onSelectOrganelle={setSelectedOrganelleId}
          />
          <CenterColumn
            selectedOrganelleId={selectedOrganelleId}
            hoveredOrganelleId={hoveredOrganelleId}
            setHoveredOrganelleId={setHoveredOrganelleId}
            onSelectOrganelle={setSelectedOrganelleId}
          />
          <RightColumn selectedOrganelleId={selectedOrganelleId} />
        </main>
      </div>
    </>
  );
}
