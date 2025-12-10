import React, { useState, useRef, useEffect } from 'react';
import { InvitationData, Language, LABELS, FontStyle, resolveAssetUrl } from '../types';
import { Music, MapPin, Clock, Calendar, ChevronDown, Heart, Send, Sparkles, Quote, Move, Trash2 } from 'lucide-react';

interface MobileViewerProps {
  data: InvitationData;
  lang: Language;
  onUpdate?: (data: InvitationData) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

// Draggable Component Wrapper with Selection
const DraggableElement: React.FC<{
  id: string;
  x: number;
  y: number;
  onDrag: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ id, x, y, onDrag, children, className, onRemove, isSelected, onSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only respond to main button (Left Click/Touch)
    if (e.button !== 0) return;

    e.preventDefault(); // Prevent scroll/default for DRAGGABLE items
    e.stopPropagation();
    setIsDragging(true);
    hasMoved.current = false;
    startPos.current = { x: e.clientX - x, y: e.clientY - y };
    
    // Immediate select on mouse down for responsiveness
    onSelect();
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = Math.abs(e.clientX - (startPos.current.x + x));
      const dy = Math.abs(e.clientY - (startPos.current.y + y));
      
      // Add threshold to distinguish clicks from drags
      if (dx > 2 || dy > 2) {
         hasMoved.current = true;
         onDrag(id, e.clientX - startPos.current.x, e.clientY - startPos.current.y);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, id, onDrag, x, y]);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{ transform: `translate(${x}px, ${y}px)`, touchAction: 'none' }}
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-move select-none z-30 group ${className}`}
    >
      <div className={`relative transition-all duration-200 ${isSelected ? 'ring-2 ring-rose-400 ring-dashed p-1 rounded-lg' : ''}`}>
        {children}
        
        {/* Controls Overlay */}
        {(isSelected || (!isSelected && isDragging)) && (
          <div className="absolute -top-8 -right-8 flex gap-1 animate-fade-in z-50">
             <div className="bg-rose-500 text-white rounded-full p-1.5 shadow-md">
               <Move className="w-3 h-3" />
             </div>
             {onRemove && (
               <div 
                 onPointerDown={(e) => { e.stopPropagation(); onRemove(); }}
                 className="bg-white text-red-500 rounded-full p-1.5 shadow-md cursor-pointer hover:bg-red-50"
               >
                 <Trash2 className="w-3 h-3" />
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const MobileViewer: React.FC<MobileViewerProps> = ({ data, lang, onUpdate, selectedId, onSelect }) => {
  const t = LABELS[lang];
  const content = data.content[lang];
  const style = data.styles[lang];
  
  // Font mapping helper
  const getFontClass = (fontStyle: FontStyle | undefined, fallback: FontStyle) => {
    const finalStyle = fontStyle || fallback;
    const prefix = lang === 'en' ? 'font-en-' : 'font-cn-';
    return prefix + finalStyle;
  };

  // Helper: Hex to RGBA
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  // Get specific element style
  const getElStyle = (id: string) => {
    const elStyle = data.elementStyles[id] || {};
    const fontClass = getFontClass(elStyle.font, style.defaultFontStyle);
    const color = elStyle.color || (id.startsWith('cover_') ? 'text-white' : style.primaryColor);
    const scale = elStyle.scale || 1;
    
    // Container props
    const width = elStyle.width || 0; // 0 means auto
    const backgroundColor = elStyle.backgroundColor || '#ffffff';
    const bgOpacity = elStyle.bgOpacity ?? 0; // Default to 0 (transparent)
    const padding = elStyle.padding ?? 0;
    const borderRadius = elStyle.borderRadius ?? 0;
    const borderWidth = elStyle.borderWidth !== undefined ? elStyle.borderWidth : 1; // Default 1px

    const background = bgOpacity > 0 ? hexToRgba(backgroundColor, bgOpacity) : 'transparent';
    
    return { fontClass, color, scale, width, background, padding, borderRadius, borderWidth };
  };

  // Extract style config
  const { titleScale, bodyScale, spacingScale } = style;

  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpError, setRsvpError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (data.musicEnabled && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [data.musicEnabled, data.musicUrl]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const pageHeight = scrollContainerRef.current.clientHeight;
        const scrollPos = scrollContainerRef.current.scrollTop;
        const pageIndex = Math.round(scrollPos / pageHeight);
        setActivePage(pageIndex);
      }
    };
    const el = scrollContainerRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    if (onUpdate) {
      if (id.startsWith('sticker_')) {
        const stickers = data.stickers.map(s => 
          s.id === id ? { ...s, x, y } : s
        );
        onUpdate({ ...data, stickers });
      } else {
        onUpdate({
          ...data,
          positions: {
            ...data.positions,
            [id]: { x, y }
          }
        });
      }
    }
  };

  const handleRemoveSticker = (id: string) => {
    if (onUpdate) {
      onUpdate({
        ...data,
        stickers: data.stickers.filter(s => s.id !== id)
      });
      onSelect(null);
    }
  };

  const getPos = (id: string) => data.positions[id] || { x: 0, y: 0 };
  
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRsvpError(false);

    // Collect form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // If a custom URL (e.g., Formspree) is provided
    if (data.rsvpUrl && data.rsvpUrl.trim() !== '') {
      try {
        const response = await fetch(data.rsvpUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          setRsvpSent(true);
        } else {
          setRsvpError(true);
        }
      } catch (err) {
        console.error("Submission failed", err);
        setRsvpError(true);
      }
    } else {
      // Simulation mode if no URL
      setTimeout(() => setRsvpSent(true), 600);
    }
    
    setIsSubmitting(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return lang === 'en' 
      ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
      : date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getAnimClass = (pageIndex: number, delayClass: string = 'delay-300') => {
    const isActive = activePage === pageIndex;
    return `transition-all duration-1000 ease-out transform ${
      isActive ? `opacity-100 translate-y-0 ${delayClass}` : 'opacity-0 translate-y-12'
    }`;
  };

  const sp = (units: number) => `${units * 0.25 * spacingScale}rem`;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(content.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const pStyle = { fontSize: `${1 * bodyScale}rem` };

  // Festive Falling Petals Animation Component
  const FallingPetals = () => {
    // Generate static petals to avoid hydration mismatch, or use deterministic random in a real app
    // Here we just render a fixed set for visual effect
    const petals = Array.from({ length: 12 }).map((_, i) => ({
      left: `${(i * 15) % 90 + 5}%`,
      delay: `${i * 1.5}s`,
      duration: `${10 + (i % 5)}s`
    }));

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {petals.map((p, i) => (
          <div 
            key={i}
            className="petal"
            style={{
              left: p.left,
              animation: `fall ${p.duration} linear infinite`,
              animationDelay: p.delay,
              width: `${Math.random() * 10 + 10}px`,
              height: `${Math.random() * 10 + 10}px`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="relative w-full h-full bg-[#fcfcfc] overflow-hidden text-[#2c2c2c] bg-noise select-none"
      onClick={() => onSelect(null)} 
      onContextMenu={(e) => e.preventDefault()} // Disable Right Click Menu
    >
      <audio ref={audioRef} src={resolveAssetUrl(data.musicUrl)} loop />

      {data.musicEnabled && (
        <button 
          onClick={(e) => { e.stopPropagation(); toggleMusic(); }}
          className={`absolute top-6 right-6 z-50 w-8 h-8 flex items-center justify-center transition-all duration-700 ease-in-out ${isPlaying ? 'animate-spin-slow' : 'opacity-40'}`}
        >
          <Music className={`w-5 h-5 ${activePage === 0 ? 'text-white' : 'text-gray-800'}`} strokeWidth={1.5} />
        </button>
      )}

      <div 
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        
        {/* PAGE 1: COVER */}
        <section className="w-full h-full snap-start relative flex flex-col items-center justify-center text-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
             <img src={resolveAssetUrl(data.coverImage)} className="w-full h-full object-cover animate-ken-burns origin-center" alt="Cover" />
             <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className={`relative z-10 w-full h-full pointer-events-none`}> 
             {/* Note: Children Draggables will be pointer-events-auto */}
             
             {/* Draggable Intro */}
             <DraggableElement 
               id={`cover_intro_${lang}`} 
               {...getPos(`cover_intro_${lang}`)} 
               onDrag={handleUpdatePosition}
               isSelected={selectedId === `cover_intro_${lang}`}
               onSelect={() => onSelect(`cover_intro_${lang}`)}
               className="pointer-events-auto"
             >
                {(() => {
                  const s = getElStyle(`cover_intro_${lang}`);
                  return (
                    <div 
                      style={{ 
                        backgroundColor: s.background,
                        padding: `${s.padding}px`,
                        borderRadius: `${s.borderRadius}px`,
                        width: s.width ? `${s.width}px` : 'auto',
                        border: s.borderWidth > 0 && s.background !== 'transparent' ? `${s.borderWidth}px solid ${s.color}` : 'none'
                      }}
                    >
                      <p 
                        className={`${s.fontClass} tracking-[0.4em]`} 
                        style={{ fontSize: `${0.8 * bodyScale * s.scale}rem`, color: s.color === 'text-white' ? undefined : s.color }}
                      >
                        {content.intro}
                      </p>
                    </div>
                  );
                })()}
             </DraggableElement>
             
             {/* Draggable Names */}
             <DraggableElement 
               id={`cover_names_${lang}`} 
               {...getPos(`cover_names_${lang}`)} 
               onDrag={handleUpdatePosition}
               isSelected={selectedId === `cover_names_${lang}`}
               onSelect={() => onSelect(`cover_names_${lang}`)}
               className="pointer-events-auto"
             >
                {(() => {
                   const s = getElStyle(`cover_names_${lang}`);
                   const fontSize = `${3.5 * titleScale * s.scale}rem`;
                   return (
                    <div 
                      className="flex flex-col items-center"
                      style={{ 
                        backgroundColor: s.background,
                        padding: `${s.padding}px`,
                        borderRadius: `${s.borderRadius}px`,
                        width: s.width ? `${s.width}px` : 'auto',
                        border: s.borderWidth > 0 && s.background !== 'transparent' ? `${s.borderWidth}px solid ${s.color}` : 'none'
                      }}
                    >
                      <h1 className={`${s.fontClass} whitespace-nowrap drop-shadow-md`} style={{ fontSize, lineHeight: 1.1, color: s.color === 'text-white' ? undefined : s.color }}>
                        {content.groom}
                      </h1>
                      <span className="text-xl font-light text-white/80 my-1">&</span>
                      <h1 className={`${s.fontClass} whitespace-nowrap drop-shadow-md`} style={{ fontSize, lineHeight: 1.1, color: s.color === 'text-white' ? undefined : s.color }}>
                        {content.bride}
                      </h1>
                    </div>
                   );
                })()}
             </DraggableElement>

             {/* Draggable Date */}
             <DraggableElement 
               id={`cover_date_${lang}`} 
               {...getPos(`cover_date_${lang}`)} 
               onDrag={handleUpdatePosition}
               isSelected={selectedId === `cover_date_${lang}`}
               onSelect={() => onSelect(`cover_date_${lang}`)}
               className="pointer-events-auto"
             >
               {(() => {
                  const s = getElStyle(`cover_date_${lang}`);
                  return (
                    <div 
                      className="flex flex-col items-center"
                      style={{ 
                        backgroundColor: s.background,
                        padding: `${s.padding}px`,
                        borderRadius: `${s.borderRadius}px`,
                        width: s.width ? `${s.width}px` : 'auto',
                        border: s.borderWidth > 0 && s.background !== 'transparent' ? `${s.borderWidth}px solid ${s.color}` : 'none'
                      }}
                    >
                      <div className="w-px h-8 bg-white/50 mb-2"></div>
                      <p className={`${s.fontClass} tracking-[0.2em] uppercase text-lg border-y border-white/30 py-1 px-4`} style={{ color: s.color === 'text-white' ? undefined : s.color, transform: `scale(${s.scale})` }}>
                        {formatDate(data.date)}
                      </p>
                    </div>
                  );
               })()}
             </DraggableElement>
             
             {/* Draggable Location */}
             <DraggableElement 
                id={`cover_location_${lang}`} 
                {...getPos(`cover_location_${lang}`)} 
                onDrag={handleUpdatePosition}
                isSelected={selectedId === `cover_location_${lang}`}
                onSelect={() => onSelect(`cover_location_${lang}`)}
                className="pointer-events-auto"
             >
                {(() => {
                   const s = getElStyle(`cover_location_${lang}`);
                   return (
                     <div
                      style={{ 
                        backgroundColor: s.background,
                        padding: `${s.padding}px`,
                        borderRadius: `${s.borderRadius}px`,
                        width: s.width ? `${s.width}px` : 'auto',
                        border: s.borderWidth > 0 && s.background !== 'transparent' ? `${s.borderWidth}px solid ${s.color}` : 'none'
                      }}
                     >
                       <p 
                         className={`${s.fontClass} tracking-widest uppercase text-[10px] text-white/90`}
                         style={{ color: s.color === 'text-white' ? undefined : s.color, transform: `scale(${s.scale})` }}
                       >
                         {content.location}
                       </p>
                     </div>
                   );
                })()}
             </DraggableElement>
          </div>

          <div className="absolute bottom-6 animate-bounce opacity-60 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-white" strokeWidth={1} />
          </div>
        </section>

        {/* PAGE 2: STORY & STICKERS */}
        <section className="w-full h-full snap-start relative flex flex-col bg-[#FDFCF8] overflow-hidden" style={{ padding: 0 }}>
           {/* Background */}
           <div className="absolute inset-0 z-0">
             <img src={resolveAssetUrl(data.galleryImages[0] || data.coverImage)} className="w-full h-full object-cover" alt="Story BG" />
             {/* Warm Overlay + Gradient */}
             <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-rose-100/60 backdrop-blur-[1px]"></div>
           </div>

           {/* Festive Particles */}
           <FallingPetals />
           
           {/* Draggable Area for Text */}
           <div className="relative z-10 w-full h-full pointer-events-none">
             
              {/* Story Title */}
              <DraggableElement 
                id={`story_title_${lang}`} 
                {...getPos(`story_title_${lang}`)}
                onDrag={handleUpdatePosition}
                isSelected={selectedId === `story_title_${lang}`}
                onSelect={() => onSelect(`story_title_${lang}`)}
                className="pointer-events-auto"
              >
                 {(() => {
                   const s = getElStyle(`story_title_${lang}`);
                   return (
                     <div 
                      className="backdrop-blur-sm"
                      style={{ 
                        backgroundColor: s.background,
                        padding: `${s.padding}px`,
                        borderRadius: `${s.borderRadius}px`,
                        width: s.width ? `${s.width}px` : 'auto',
                        // Don't show border for title box if it's transparent, usually it's text-only or pill
                        border: s.borderWidth > 0 && s.background !== 'transparent' ? `${s.borderWidth}px solid ${s.color}` : 'none'
                      }}
                     >
                        {/* Decorative lines for Title */}
                        <div className="flex items-center gap-2 justify-center">
                           {/* Left Line */}
                           <div 
                             style={{
                               width: '24px',
                               height: `${Math.max(1, s.borderWidth)}px`, // Dynamic height based on border width
                               backgroundColor: s.color, // Match text color
                               opacity: 0.6
                             }}
                           ></div>

                           <h2 className={`${s.fontClass} uppercase tracking-widest text-sm text-center`} style={{ color: s.color, transform: `scale(${s.scale})` }}>
                             {content.storyTitle || t.ourStory}
                           </h2>
                           
                           {/* Right Line */}
                           <div 
                             style={{
                               width: '24px',
                               height: `${Math.max(1, s.borderWidth)}px`, // Dynamic height based on border width
                               backgroundColor: s.color,
                               opacity: 0.6
                             }}
                           ></div>
                        </div>
                     </div>
                   );
                 })()}
              </DraggableElement>

              {/* Story Content */}
              <DraggableElement 
                id={`story_content_${lang}`} 
                {...getPos(`story_content_${lang}`)}
                onDrag={handleUpdatePosition}
                isSelected={selectedId === `story_content_${lang}`}
                onSelect={() => onSelect(`story_content_${lang}`)}
                className="pointer-events-auto"
              >
                 {(() => {
                   const s = getElStyle(`story_content_${lang}`);
                   return (
                     <div 
                       className="shadow-lg transition-all duration-200"
                       style={{ 
                         backgroundColor: s.background,
                         padding: `${s.padding}px`,
                         borderRadius: `${s.borderRadius}px`,
                         width: s.width ? `${s.width}px` : '300px', // Default to 300 if not set
                         // Apply dynamic border to the content box if set
                         border: s.borderWidth > 0 ? `${s.borderWidth}px solid ${s.background !== 'transparent' ? 'rgba(255,255,255,0.4)' : s.color}` : 'none'
                       }}
                     >
                       <p className={`${s.fontClass} font-light leading-loose text-center text-sm relative z-10`} style={{ fontSize: `${1.05 * bodyScale * s.scale}rem`, lineHeight: 1.8, color: s.color || '#374151' }}>
                         {content.storyContent}
                       </p>
                     </div>
                   );
                 })()}
              </DraggableElement>
           </div>
           
           {/* Stickers Layer */}
           <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
             <div className="w-full h-full relative">
               {data.stickers.map((sticker) => (
                 <DraggableElement 
                   key={sticker.id}
                   id={sticker.id}
                   x={sticker.x}
                   y={sticker.y}
                   onDrag={handleUpdatePosition}
                   onRemove={() => handleRemoveSticker(sticker.id)}
                   isSelected={selectedId === sticker.id}
                   onSelect={() => onSelect(sticker.id)}
                   className="pointer-events-auto"
                 >
                   <img src={resolveAssetUrl(sticker.url)} className="w-20 h-20 object-contain drop-shadow-md" alt="sticker" />
                 </DraggableElement>
               ))}
             </div>
           </div>
        </section>

        {/* PAGE 3: GALLERY - Fixed Layout */}
        <section 
           className={`w-full h-full snap-start relative flex flex-col transition-colors duration-300 ${selectedId === 'section_gallery' ? 'ring-4 ring-rose-400 ring-inset' : ''}`} 
           style={{ 
             paddingTop: sp(12),
             backgroundColor: data.elementStyles['section_gallery']?.backgroundColor || '#ffffff',
           }}
           onClick={(e) => {
             // Allow selecting the background section
             e.stopPropagation();
             onSelect('section_gallery');
           }}
        >
           <div className={`h-full flex flex-col ${getAnimClass(2)} px-4 pb-12`}>
             <div className="text-center mb-4 shrink-0 pointer-events-none">
                <h2 className={`${getFontClass(style.defaultFontStyle, 'handwriting')} text-rose-400 opacity-80 mb-1`} style={{fontSize: '2.5rem'}}>{t.gallery}</h2>
                <div className="w-8 h-0.5 bg-gray-200 mx-auto"></div>
             </div>
             
             {/* Full Height Grid */}
             <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2 h-full">
               {data.galleryImages.slice(0, 6).map((img, i) => (
                 <div key={i} className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 shadow-sm group" onClick={(e) => e.stopPropagation() /* Prevent selecting BG */}>
                    <img 
                      src={resolveAssetUrl(img)} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={`Gallery ${i}`} 
                      loading="lazy" 
                    />
                 </div>
               ))}
               {[...Array(Math.max(0, 6 - data.galleryImages.length))].map((_, i) => (
                  <div key={`empty-${i}`} className="bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-gray-200" />
                  </div>
               ))}
             </div>
           </div>
           
           {/* Section Label (Visible when hovered or selected) */}
           {selectedId === 'section_gallery' && (
              <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs px-2 py-1 rounded-full shadow-lg pointer-events-none">
                Editing Background
              </div>
           )}
        </section>

        {/* PAGE 4: INFO & MAP */}
        <section className="w-full h-full snap-start relative flex flex-col justify-center items-center bg-[#F4F4F5]" style={{ padding: 0 }}>
           <div className={`w-full bg-white px-8 py-10 rounded-b-[3rem] shadow-lg z-10 ${getAnimClass(3)}`}>
              <h2 className={`${getFontClass(style.defaultFontStyle, 'serif')} text-gray-900 mb-8 uppercase tracking-[0.2em] text-center`} style={{ fontSize: `${2.25 * titleScale}rem` }}>{t.whenWhere}</h2>
              <div className="flex justify-between items-start gap-4">
                 <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 mx-auto mb-2">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <p className={`${getFontClass(style.defaultFontStyle, 'serif')} text-gray-900 font-bold`}>{formatDate(data.date)}</p>
                    <p className="text-xs text-gray-500">{data.time}</p>
                 </div>
                 <div className="w-px h-16 bg-gray-100"></div>
                 <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 mx-auto mb-2">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <p className={`${getFontClass(style.defaultFontStyle, 'serif')} text-gray-900 font-bold`}>{content.location}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[100px] mx-auto">{content.address}</p>
                 </div>
              </div>
           </div>
           <div className="flex-1 w-full relative bg-gray-200">
              <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={mapUrl} className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"></iframe>
           </div>
        </section>

        {/* PAGE 5: RSVP */}
        <section className="w-full h-full snap-start relative flex flex-col justify-center items-center bg-[#1a1a1a] text-white overflow-hidden">
           <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
           <div className={`w-full max-w-sm px-10 relative z-10 ${getAnimClass(4)}`}>
             {rsvpSent ? (
               <div className="text-center py-16 border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl">
                  <div className="mb-6 inline-block p-4 rounded-full border border-white/20 bg-green-500/20"><Send className="w-6 h-6 text-green-400" strokeWidth={1} /></div>
                  <h2 className={`${getFontClass(style.defaultFontStyle, 'serif')} text-2xl mb-2 tracking-wide uppercase`}>{t.rsvpSuccess}</h2>
               </div>
             ) : (
               <>
                 <div className="text-center mb-10">
                   <h2 className={`${getFontClass(style.defaultFontStyle, 'serif')} text-3xl mb-1 text-white`}>{t.rsvpTitle}</h2>
                   <p className="text-white/40 tracking-[0.3em] uppercase text-[10px]">{t.saveTheDate}</p>
                 </div>
                 <form onSubmit={handleRsvpSubmit} className="space-y-6">
                    <input required type="text" name="name" placeholder={t.rsvpNamePlaceholder} className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/60 transition-colors text-center font-light" style={pStyle} />
                    <input type="number" name="guests" placeholder={t.rsvpGuestsPlaceholder} className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/60 transition-colors text-center font-light" style={pStyle} />
                    <div className="relative">
                        <select name="status" className="w-full bg-transparent border-b border-white/20 py-3 text-white/90 focus:outline-none focus:border-white/60 transition-colors text-center appearance-none font-light" style={pStyle}>
                          <option value="accept" className="text-gray-900">{t.rsvpAttend}</option>
                          <option value="decline" className="text-gray-900">{t.rsvpDecline}</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black font-medium py-3.5 mt-4 hover:bg-gray-200 transition-colors uppercase tracking-[0.2em] text-xs rounded-sm disabled:opacity-50">
                      {isSubmitting ? '...' : t.rsvpSubmit}
                    </button>
                    {rsvpError && <p className="text-red-400 text-xs text-center mt-2">{t.rsvpError}</p>}
                 </form>
               </>
             )}
           </div>
        </section>

      </div>
    </div>
  );
};

export default MobileViewer;