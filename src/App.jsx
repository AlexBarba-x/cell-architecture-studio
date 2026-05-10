import React, { useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useTime, useReducedMotion } from 'framer-motion';
import { 
  Grid, Book, Settings, ChevronDown, Plus, Heart, 
  Camera, Box, Layers, Target, EyeOff, Maximize, 
  Star, Info, ChevronRight, RotateCcw
} from 'lucide-react';

// --- ASSETS ---
const ASSETS = {
  ui: "https://raw.githubusercontent.com/AlexBarba-x/cell-architecture-core-assets/main/cell_architecture_studio_ui.png",
  hero: "https://raw.githubusercontent.com/AlexBarba-x/cell-architecture-core-assets/main/white_blood_cell_hero_original.png",
  depth: "https://raw.githubusercontent.com/AlexBarba-x/cell-architecture-core-assets/main/white_blood_cell_depth_map.png",
  relief: "https://raw.githubusercontent.com/AlexBarba-x/cell-architecture-core-assets/main/white_blood_cell_relief_map.png",
  organelles: "https://raw.githubusercontent.com/AlexBarba-x/cell-architecture-core-assets/main/white_blood_cell_organelle_sheet.png"
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
  { id: 'nucleus', name: 'Nucleus', color: '#6A4C93', summary: 'Houses DNA and coordinates core cellular decisions.', detail: 'The nucleus protects the genome and regulates transcription programs that determine immune response behavior.' },
  { id: 'lobed', name: 'Lobed Nucleus', color: '#8A68B4', summary: 'Segmented architecture that improves flexibility in transit.', detail: 'A lobed profile helps white blood cells deform and migrate through narrow endothelial junctions.' },
  { id: 'plasma', name: 'Plasma Membrane', color: '#D4B886', summary: 'Selective, signaling-rich cellular boundary.', detail: 'Membrane receptors detect chemotactic cues and coordinate movement toward inflammatory targets.' },
  { id: 'lysosome', name: 'Lysosome', color: '#D9738A', summary: 'Acidic recycling center for biomolecular cleanup.', detail: 'Lysosomes digest engulfed pathogens and recycle macromolecules with pH-dependent hydrolase enzymes.' },
  { id: 'golgi', name: 'Golgi Apparatus', color: '#E8A598', summary: 'Modifies and routes proteins to functional destinations.', detail: 'The Golgi packages enzymes and membrane proteins required for secretion, trafficking, and immune signaling.' },
];

// --- COMPONENTS ---

const InteractiveCellViewer = () => {
  const prefersReducedMotion = useReducedMotion();
  // Core physical drag/hover coordinates
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const isDragging = useMotionValue(false);

  // Premium Apple-style spring physics: heavy mass, high damping for silky smooth, suspended momentum
  const springConfig = { damping: 52, stiffness: 132, mass: 1.95, restDelta: 0.001 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  // Slow cinematic drift for museum-grade suspension
  const time = useTime();
  const breathY = useTransform(time, [0, 12000, 24000], [0, -5, 0], { clamp: false });
  const breathScale = useTransform(time, [0, 11000, 22000], [1, 1.005, 1], { clamp: false });
  const floatRotate = useTransform(time, [0, 18000, 36000], [-0.45, 0.45, -0.45], { clamp: false });

  // 1. 2.5D ROTATION - Restricted bounds to maintain illusion integrity
  const rotateX = useTransform(y, [-400, 400], [8.5, -8.5]);
  const rotateY = useTransform(x, [-400, 400], [-8.5, 8.5]);

  // 2. TACTILE PARALLAX SHIFTS - Layers translate slightly off-axis to simulate internal volume
  const reliefX = useTransform(x, [-400, 400], [8, -8]);
  const reliefY = useTransform(y, [-400, 400], [8, -8]);
  
  const depthX = useTransform(x, [-400, 400], [-10, 10]);
  const depthY = useTransform(y, [-400, 400], [-10, 10]);
  
  const organelleX = useTransform(x, [-400, 400], [-20, 20]);
  const organelleY = useTransform(y, [-400, 400], [-20, 20]);

  // 3. DYNAMIC SPECULAR LIGHTING - Soft membrane gloss responding to cursor/drag
  const lightX = useTransform(x, [-400, 400], [70, 30]);
  const lightY = useTransform(y, [-400, 400], [68, 32]);
  
  const highlightBg = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 28%, rgba(255, 255, 255, 0.03) 48%, rgba(255, 255, 255, 0) 68%)`;
  const rimLightBg = useMotionTemplate`radial-gradient(65% 60% at ${lightX}% ${lightY}%, rgba(255,255,255,0.24), rgba(255,255,255,0) 70%)`;

  // Multi-layer organelle drift: restrained depth stacking from a single sheet
  const organelleMidX = useTransform(x, [-400, 400], [-13, 13]);
  const organelleMidY = useTransform(y, [-400, 400], [-13, 13]);

  // Depth map driven tonality shifts for perceived light direction changes
  const depthBrightness = useTransform(y, [-400, 0, 400], [1.08, 1.0, 0.94]);
  const depthContrast = useTransform(x, [-400, 0, 400], [1.02, 1.0, 1.06]);
  const depthSaturate = useTransform(x, [-400, 400], [0.98, 1.04]);
  const depthFilter = useMotionTemplate`brightness(${depthBrightness}) contrast(${depthContrast}) saturate(${depthSaturate})`;

  // Micro lighting shift for hero body, tied to interaction depth
  const heroBrightness = useTransform(y, [-400, 400], [1.02, 0.985]);
  const heroFilter = useMotionTemplate`brightness(${heroBrightness})`;

  // 4. ANCHORING SHADOWS - Moves opposite to interaction to ground the object
  const dropShadowX = useTransform(x, [-400, 400], [16, -16]);
  const dropShadowY = useTransform(y, [-400, 400], [16, -16]);

  // 5. MOUSE-REACTIVE DIMENSIONALITY - Subtle tracking without dragging
  const handlePointerMove = (e) => {
    if (isDragging.get()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Convert pointer distance from center into a subtle transform offset
    rawX.set((e.clientX - centerX) * 0.12);
    rawY.set((e.clientY - centerY) * 0.12);
  };

  const handlePointerLeave = () => {
    if (isDragging.get()) return;
    rawX.set(0);
    rawY.set(0);
  };

  const bgParticles = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);
  const fgParticles = useMemo(() => Array.from({ length: 3 }, (_, i) => i), []);

  return (
    <>
      {/* Background Particles (z-index: 0, scoped to container bounds via overflow-hidden) */}
      <div className="absolute inset-0 z-0 pointer-events-none rounded-3xl overflow-hidden">
        {bgParticles.map((i) => (
          <motion.div
            key={`bg-part-${i}`}
            className="absolute rounded-full will-change-transform"
            style={{
              width: 20 + i * 15,
              height: 20 + i * 15,
              background: i % 2 === 0 ? 'rgba(106, 76, 147, 0.12)' : 'rgba(217, 115, 138, 0.12)',
              left: `${15 + i * 18}%`,
              top: `${15 + (i % 3) * 25}%`,
              filter: `blur(${8 + i * 2}px)`,
            }}
            animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
            transition={{ duration: 12 + i * 2, repeat: Infinity, ease: [0.32, 0, 0.18, 1], delay: i * 0.5 }}
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
          dragElastic={0.14}
          dragMomentum
          dragTransition={{
            power: 0.24,
            timeConstant: 520,
            bounceStiffness: 160,
            bounceDamping: 34
          }}
          onDragStart={() => isDragging.set(true)}
          onDrag={(e, info) => {
            rawX.set(info.offset.x);
            rawY.set(info.offset.y);
          }}
          onDragEnd={() => {
            isDragging.set(false);
          }}
          // Organic, near-imperceptible breathing motion
          animate={prefersReducedMotion ? undefined : { }}
          style={{ rotateX, rotateY, y: breathY, scale: breathScale, rotateZ: floatRotate, transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          {/* Subtle Ambient Backlight Glow for Cinematic Depth */}
          <div 
            className="absolute inset-0 m-auto w-[75%] h-[75%] rounded-full bg-white opacity-[0.35] blur-[80px] pointer-events-none"
            style={{ transform: 'translateZ(-100px)' }}
          />

          {/* Deep External Drop Shadow */}
          <motion.div 
            className="absolute inset-0 m-auto w-[65%] h-[65%] rounded-full bg-black/25 blur-[50px] pointer-events-none"
            style={{ x: dropShadowX, y: dropShadowY, translateZ: -60 }}
          />

          {/* 1. Base Relief Map - Subtle rear shadows tracking away from light */}
          <motion.img
            src={ASSETS.relief}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-multiply opacity-[0.35]"
            style={{ x: reliefX, y: reliefY, translateZ: -10, willChange: 'transform' }}
            draggable={false}
          />

          {/* 2. PRISTINE HERO LAYER */}
          <motion.img
            src={ASSETS.hero}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            style={{ translateZ: 0, filter: heroFilter, willChange: 'transform, filter' }}
            draggable={false}
          />

          {/* 3. Depth Map Parallax - Volumetric highlights and internal depth */}
          <motion.img
            src={ASSETS.depth}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-screen opacity-[0.32]"
            style={{ x: depthX, y: depthY, filter: depthFilter, translateZ: 15, willChange: 'transform, filter' }}
            draggable={false}
          />

          {/* 4. Organelles Parallax - Foreground elements popping off the surface */}
          <motion.img
            src={ASSETS.organelles}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-overlay opacity-[0.3]"
            style={{ x: organelleMidX, y: organelleMidY, translateZ: 22, willChange: 'transform' }}
            draggable={false}
          />
          <motion.img
            src={ASSETS.organelles}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-overlay opacity-[0.38]"
            style={{ x: organelleX, y: organelleY, translateZ: 34, willChange: 'transform' }}
            draggable={false}
          />

          {/* 5. Responsive Lighting Gradient - Membrane specularity */}
          <motion.div 
            className="absolute inset-0 w-full h-full rounded-full pointer-events-none mix-blend-overlay"
            style={{ background: highlightBg, translateZ: 40 }}
          />
          <motion.div 
            className="absolute inset-0 w-full h-full rounded-full pointer-events-none mix-blend-screen opacity-60"
            style={{ background: rimLightBg, translateZ: 18 }}
          />
        </motion.div>
      </div>

      {/* Foreground Particles (z-index: 1) */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden rounded-3xl">
        {fgParticles.map((i) => (
          <motion.div
            key={`fg-part-${i}`}
            className="absolute rounded-full border border-white/30 backdrop-blur-md shadow-sm will-change-transform"
            style={{
              width: 30 + i * 20,
              height: 30 + i * 20,
              background: i % 2 === 0 ? 'rgba(106, 76, 147, 0.15)' : 'rgba(217, 115, 138, 0.15)',
              right: `${20 + i * 25}%`,
              bottom: `${15 + (i % 2) * 40}%`,
              filter: `blur(${1.5 + i}px)`,
            }}
            animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: [0.32, 0, 0.18, 1], delay: i * 0.4 }}
          />
        ))}
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
  <header className="h-[72px] flex items-center justify-between px-8 border-b border-black/5 bg-[#FDFBF7]/80 backdrop-blur-xl shrink-0 z-40 relative">
    <div className="flex items-center gap-4">
      <motion.div 
        whileHover={{ rotate: 15, scale: 1.05 }}
        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6A4C93] to-[#D9738A] flex items-center justify-center text-white shadow-inner shadow-black/20"
      >
        <span className="text-xl drop-shadow-md">🦠</span>
      </motion.div>
      <div className="flex flex-col justify-center">
        <h1 className="font-serif text-[22px] text-[#2D2926] leading-none tracking-tight">Cell Architecture Studio</h1>
      </div>
      <div className="hidden md:flex items-center gap-2 ml-4">
        <div className="h-4 w-px bg-black/10" />
        <span className="text-xs italic text-[#8B847C] font-serif pt-1">Explore life at the microscopic level ✦</span>
      </div>
    </div>

    <nav className="flex items-center gap-7">
      {[
        { icon: Grid, label: 'Gallery' },
        { icon: Layers, label: 'Library' },
        { icon: Book, label: 'Notebooks' },
        { icon: Settings, label: 'Settings' },
      ].map((item, idx) => (
        <motion.button key={idx} whileHover={{ y: -2 }} className="flex flex-col items-center gap-1 text-[#7A736E] hover:text-[#2D2926] transition-colors group">
          <item.icon size={18} className="group-hover:drop-shadow-sm transition-all duration-300" />
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{item.label}</span>
        </motion.button>
      ))}
      <div className="w-px h-8 bg-black/10 mx-1"></div>
      <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-[#E8E2F0] p-0.5 shadow-sm overflow-hidden flex items-center justify-center border border-white">
           <img src="https://i.pravatar.cc/150?img=44" alt="User" className="w-full h-full rounded-full object-cover" />
        </div>
        <ChevronDown size={14} className="text-[#7A736E] group-hover:text-[#2D2926] transition-colors" />
      </motion.div>
    </nav>
  </header>
);

const LeftColumn = ({ selectedOrganelleId, hoveredOrganelleId, setHoveredOrganelleId, onSelectOrganelle }) => (
  <aside className="flex flex-col gap-[20px] overflow-hidden h-full">
    <PremiumPanel className="flex flex-col flex-1">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xs uppercase tracking-widest text-[#7A736E] font-bold flex items-center gap-2">
          <Layers size={14} className="text-[#6A4C93]" /> Cell Types
        </h2>
        <ChevronDown size={14} className="text-[#A39E98]" />
      </div>
      
      <div className="flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar flex-1 -mr-2">
        {CELL_TYPES.map((cell) => (
          <PremiumButton key={cell.id} active={cell.active} className="flex items-center gap-3 p-3 rounded-2xl w-full text-left">
            {cell.active && <motion.div layoutId="sidebarHighlight" className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#6A4C93]" />}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${cell.active ? 'bg-[#F2EEF7] border border-[#E8E2F0]' : 'bg-black/5 border border-transparent'}`}>
              {cell.icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${cell.active ? 'text-[#2D2926]' : 'text-[#5A544F]'}`}>{cell.name}</h3>
              <p className="text-xs text-[#8B847C]">{cell.type}</p>
            </div>
            {cell.starred && <Star size={14} className="text-[#D9738A] fill-[#D9738A]" />}
          </PremiumButton>
        ))}
      </div>
    </PremiumPanel>

    <PremiumPanel className="h-[280px] flex flex-col shrink-0">
       <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xs uppercase tracking-widest text-[#7A736E] font-bold flex items-center gap-2">
          <Target size={14} className="text-[#D9738A]" /> Organelles
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
                <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-[#2D2926]' : 'text-[#5A544F]'}`}>{org.name}</span>
              </PremiumButton>

              <motion.div
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                transition={{ duration: 0.24, ease: [0.32, 0, 0.18, 1] }}
                className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 w-56 z-20 bg-[#FDFBF7]/95 backdrop-blur-md border border-white rounded-xl shadow-lg px-3 py-2"
              >
                <p className="text-[11px] uppercase tracking-widest text-[#8B847C] font-semibold mb-1">Educational Note</p>
                <p className="text-xs text-[#5A544F] leading-relaxed">{org.summary}</p>
              </motion.div>
            </div>
          );
        })}

      </div>
      <motion.button 
        whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }}
        whileTap={{ scale: 0.99 }}
        className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-white/50 border border-[#EBE4DA] rounded-xl text-sm text-[#5A544F] font-medium transition-all shadow-sm text-[#2D2926]"
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
        <h2 className="font-serif italic text-[#7A736E] uppercase tracking-widest text-[11px] font-bold">Organelle Details</h2>
        <motion.div whileHover={{ scale: 1.1 }} className="cursor-pointer">
           <Heart size={16} className="text-[#D9738A] fill-[#D9738A]" />
        </motion.div>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-white to-[#F6F1EA] shadow-[0_2px_10px_rgb(0,0,0,0.05)] flex items-center justify-center border border-white">
          <div className="grid grid-cols-3 gap-[3px] p-2.5">
            {Array.from({length: 9}).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#6A4C93] shadow-inner" />
            ))}
          </div>
        </div>
        <div>
          <motion.h3 key={selectedOrganelle.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-[22px] font-serif text-[#2D2926] leading-tight">{selectedOrganelle.name}</motion.h3>
          <motion.p key={`${selectedOrganelle.id}-summary`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-xs text-[#8B847C] italic mt-0.5">{selectedOrganelle.summary}</motion.p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Size', value: 'About 7 - 20 μm' },
          { label: 'Location', value: 'Blood, lymph, tissues' },
          { label: 'Visible in LM', value: 'Yes, with stain' },
        ].map((stat, idx) => (
          <div key={idx} className="flex justify-between text-sm border-b border-black/5 pb-2">
            <span className="text-[#8B847C]">{stat.label}</span>
            <span className="text-[#2D2926] font-semibold">{stat.value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center text-sm pt-1">
          <span className="text-[#8B847C]">Label Visiblity</span>
          <div className="flex items-center gap-3">
            <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-6 bg-[#6A4C93] rounded-full p-1 cursor-pointer relative shadow-inner">
              <motion.div layout className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
            </motion.div>
            <div className="w-3 h-3 rounded-full bg-[#6A4C93] shadow-sm border border-black/10" />
          </div>
        </div>
      </div>
    </PremiumPanel>

    <PremiumPanel>
      <h2 className="font-serif italic text-[#7A736E] uppercase tracking-widest text-[11px] font-bold mb-4">Biological Notes</h2>
      <motion.p key={`${selectedOrganelle.id}-detail`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-sm text-[#5A544F] leading-relaxed mb-4">
        {selectedOrganelle.detail}
      </motion.p>
      <motion.div whileHover={{ scale: 1.01 }} className="p-4 bg-gradient-to-br from-[#FDFBF7] to-[#F6F1EA] rounded-2xl border border-white shadow-sm flex items-start gap-3">
        <span className="text-xl leading-none pt-0.5">✨</span>
        <p className="text-xs text-[#6A4C93] italic font-semibold leading-relaxed">
          Fun Fact: Some white blood cells can change shape to squeeze between blood vessel walls and reach infected tissue!
        </p>
      </motion.div>
    </PremiumPanel>

    <PremiumPanel>
      <h2 className="font-serif italic text-[#7A736E] uppercase tracking-widest text-[11px] font-bold mb-4">Where It Occurs</h2>
      <div className="h-36 bg-gradient-to-br from-white to-[#F6F1EA] rounded-2xl border border-white shadow-inner overflow-hidden relative flex items-center justify-center">
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
        className="relative flex-1 bg-gradient-to-br from-[#F6F1EA] to-[#EBE4DA]/40 rounded-3xl border border-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4),_0_8px_30px_rgb(0,0,0,0.04)]"
        style={{ minHeight: '520px', minWidth: 0, overflow: 'visible' }}
      >
        {/* Floating Note (z-index: 5) */}
        <div className="absolute top-6 left-6 pointer-events-none" style={{ zIndex: 5 }}>
          <h1 className="font-serif text-5xl text-[#2D2926] mb-1 tracking-tight drop-shadow-sm">White Blood Cell</h1>
          <p className="font-serif text-[22px] text-[#7A736E] italic">Immune Cell</p>
          
          <motion.div 
            initial={{ rotate: -5, scale: 0.9, opacity: 0 }}
            animate={{ rotate: -3, scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="mt-6 bg-[#FDFBF7]/90 backdrop-blur-md p-4 rounded-2xl shadow-lg w-56 rotate-[-3deg] pointer-events-auto border border-white"
          >
            <ul className="text-[13px] font-serif italic text-[#6A604A] space-y-2.5">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#D9738A]"/> Drag cell to rotate</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#6A4C93]"/> Observe dynamic depth</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#D4B886]"/> Physics-based interaction</li>
            </ul>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-2.5 bg-white/80 rounded-full shadow-sm" />
          </motion.div>
        </div>

        {/* View Mode Controls (z-index: 5) */}
        <div className="absolute top-6 right-6 bg-white/70 backdrop-blur-xl border border-white/80 p-3 rounded-2xl shadow-sm pointer-events-auto" style={{ zIndex: 5 }}>
          <div className="text-[10px] uppercase tracking-widest text-[#7A736E] font-bold mb-2 ml-1">View Mode</div>
          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl mb-4 relative">
            {['cube', 'layers', 'dot'].map((mode) => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`w-11 h-9 rounded-lg flex items-center justify-center relative transition-colors z-10 ${viewMode === mode ? 'text-[#6A4C93]' : 'text-[#7A736E] hover:text-[#2D2926]'}`}
              >
                {viewMode === mode && <motion.div layoutId="viewMode" className="absolute inset-0 bg-white rounded-lg shadow-sm border border-black/5 -z-10" />}
                {mode === 'cube' && <Box size={18} />}
                {mode === 'layers' && <Layers size={18} />}
                {mode === 'dot' && <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-current" />}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-1.5">
            <span className="text-xs text-[#5A544F] font-semibold">Cross-Section</span>
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
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#5A544F] hover:text-[#2D2926]">
              <RotateCcw size={16} /> Rotate
            </PremiumButton>
            <PremiumButton onClick={() => onSelectOrganelle('lysosome')} active={selectedOrganelleId === 'lysosome'} className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#5A544F] hover:text-[#2D2926]">
              <Target size={16} /> {selectedOrganelleId === 'lysosome' ? 'Lysosome Isolated' : 'Isolate Lysosome'}
            </PremiumButton>
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#5A544F] hover:text-[#2D2926]">
              <EyeOff size={16} /> Hide Others
            </PremiumButton>
            <div className="w-px bg-black/10 mx-2 my-2" />
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#5A544F] hover:text-[#2D2926]">
              <Maximize size={16} /> Reset View
            </PremiumButton>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#5A544F] hover:text-[#2D2926]">
              <Camera size={16} /> Screenshot
            </PremiumButton>
            <PremiumButton className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-sm font-semibold text-[#5A544F] hover:text-[#2D2926]">
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
            <h2 className="font-serif italic text-[#7A736E] uppercase tracking-widest text-[11px] font-bold">Microscope View</h2>
            <Info size={12} className="text-[#A39E98]" />
          </div>
          <div className="flex gap-4 flex-1 overflow-x-auto custom-scrollbar pb-2">
            {[
              { id: 1, name: 'Light Microscope', color: 'bg-[#FDFBF7] border-[#EBE4DA]' },
              { id: 2, name: 'Stained Selection', color: 'bg-purple-50 border-purple-200' },
              { id: 3, name: 'Electron Microscope', color: 'bg-gray-100 border-gray-300 grayscale' },
            ].map((view) => (
               <motion.div key={view.id} whileHover={{ y: -2 }} className="w-[160px] shrink-0 flex flex-col gap-2.5 cursor-pointer group">
                  <div className={`flex-1 rounded-2xl border-[1.5px] overflow-hidden relative ${view.color} transition-all shadow-sm group-hover:shadow-md`}>
                     <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                     <div className="w-full h-full flex items-center justify-center opacity-70 mix-blend-overlay text-4xl drop-shadow-sm">🦠</div>
                  </div>
                  <span className="text-xs font-semibold text-center text-[#5A544F] group-hover:text-[#2D2926] transition-colors">{view.name}</span>
               </motion.div>
            ))}
            <motion.button whileHover={{ y: -2, backgroundColor: '#ffffff' }} className="w-[120px] shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#D1CFC9] bg-white/50 transition-colors text-[#7A736E] hover:text-[#2D2926]">
              <Plus size={24} className="opacity-80" />
              <span className="text-[11px] font-semibold tracking-wide">Add Image</span>
            </motion.button>
          </div>
        </PremiumPanel>

        {/* Compare Cells */}
        <PremiumPanel className="flex-[1] flex flex-col p-5">
           <div className="flex items-center gap-2 mb-5 px-1">
            <h2 className="font-serif italic text-[#7A736E] uppercase tracking-widest text-[11px] font-bold">Compare Cells</h2>
            <Info size={12} className="text-[#A39E98]" />
          </div>
          <div className="bg-gradient-to-r from-white to-[#FDFBF7] rounded-2xl border border-[#EBE4DA] p-3.5 flex items-center justify-between relative mb-4 shadow-sm">
             <div className="flex items-center gap-3">
                <span className="text-2xl drop-shadow-sm">🦠</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#2D2926]">White Blood Cell</span>
                  <span className="text-[10px] text-[#8B847C] italic">(You are here)</span>
                </div>
             </div>
             
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#6A4C93] to-[#8A68B4] text-white flex items-center justify-center text-[10px] font-black shadow-md z-10 border-2 border-white">
                VS
             </div>

             <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-[#2D2926]">Epithelial Cell</span>
                  <span className="text-[10px] text-[#8B847C] italic">Tissue</span>
                </div>
                <span className="text-2xl drop-shadow-sm">🧱</span>
             </div>
          </div>
          <motion.button whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }} whileTap={{ scale: 0.99 }} className="w-full py-2.5 bg-white/50 rounded-xl border border-black/5 text-xs font-bold text-[#5A544F] hover:text-[#2D2926] transition-all flex items-center justify-center gap-2 mt-auto shadow-sm">
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.15); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.25); }
      `}</style>
      
      <div className="h-screen w-screen bg-[#FDFBF7] text-[#2D2926] font-sans flex flex-col overflow-hidden selection:bg-[#E8E2F0]">
        <TopNav />
        <main 
          className="grid gap-[20px] p-5"
          style={{ gridTemplateColumns: '260px 1fr 330px', height: 'calc(100vh - 72px)' }}
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
