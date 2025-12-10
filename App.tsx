import React, { useState, useEffect } from 'react';
import { InvitationData, Language, LABELS, DEFAULT_IMAGES } from './types';
import LanguageToggle from './components/LanguageToggle';
import EditorPanel from './components/EditorPanel';
import MobileViewer from './components/MobileViewer';
import { Smartphone, PenTool, Lock, Unlock } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  
  // State to control Admin/Edit mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState<'edit' | 'view'>('view'); 
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params for explicit edit mode
    const searchParams = new URLSearchParams(window.location.search);
    const isEditParam = searchParams.get('edit') === 'true';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Auto-enter admin on localhost, otherwise rely on manual trigger via URL
    if (isLocalhost || isEditParam) {
      setIsAdmin(true);
      setMode('edit');
    }
  }, []);
  
  // --- IMPORTANT: PASTE YOUR EXPORTED JSON HERE TO REPLACE THIS OBJECT ---
  // When you are ready to deploy, click "Copy Config" in the editor,
  // and overwrite this INITIAL_DATA object with your clipboard content.
  const INITIAL_DATA: InvitationData = {
    // Shared
    date: new Date().toISOString().split('T')[0],
    time: '17:30',
    coverImage: DEFAULT_IMAGES[0],
    galleryImages: DEFAULT_IMAGES,
    musicEnabled: true,
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Default sample music
    stickers: [], // Start with no stickers
    
    // Data Collection (Default empty, user needs to fill this)
    rsvpUrl: '',

    // Localized Content
    content: {
      en: {
        intro: 'WE ARE GETTING MARRIED',
        groom: 'Romeo',
        bride: 'Juliet',
        location: 'Grand Hotel',
        address: '123 Love Avenue, Paris, France',
        storyTitle: 'Our Story',
        storyContent: 'From the moment we met, we knew this was forever. We invite you to join our journey.',
      },
      zh: {
        intro: '我们结婚了',
        groom: '李雷',
        bride: '韩梅梅',
        location: '希尔顿大酒店',
        address: '北京市朝阳区建国路88号',
        storyTitle: '我们的故事',
        storyContent: '从相识到相知，从相知到相爱。感谢命运让我们相遇，决定携手共度余生。',
      }
    },

    // Localized Styles
    styles: {
      en: {
        titleScale: 1.0,
        bodyScale: 1.0,
        spacingScale: 1.0,
        primaryColor: '#ffffff',
        defaultFontStyle: 'handwriting'
      },
      zh: {
        titleScale: 1.0,
        bodyScale: 1.0,
        spacingScale: 1.0,
        primaryColor: '#ffffff',
        defaultFontStyle: 'handwriting'
      }
    },

    // Default Positions
    positions: {
      'cover_intro_en': { x: 0, y: -150 },
      'cover_names_en': { x: 0, y: -50 },
      'cover_date_en': { x: 0, y: 80 },
      'cover_location_en': { x: 0, y: 130 },
      'cover_intro_zh': { x: 0, y: -150 },
      'cover_names_zh': { x: 0, y: -50 },
      'cover_date_zh': { x: 0, y: 80 },
      'cover_location_zh': { x: 0, y: 130 },
      // Story Elements default positions
      'story_title_en': { x: 0, y: -120 },
      'story_content_en': { x: 0, y: 20 },
      'story_title_zh': { x: 0, y: -120 },
      'story_content_zh': { x: 0, y: 20 },
    },

    // Initial Styles (Festive / Oriental Theme Defaults)
    elementStyles: {
      // English Story Title Box
      'story_title_en': {
        backgroundColor: '#fff1f2', // Rose-50
        bgOpacity: 0, // Transparent text
        padding: 0,
        borderRadius: 0,
        color: '#be123c', // Rose-700
      },
      // English Story Content Box
      'story_content_en': {
        backgroundColor: '#fff1f2', // Very light warm paper color
        bgOpacity: 95,
        padding: 30,
        borderRadius: 4, // Slightly squared for elegance
        width: 300,
        color: '#881337', // Deep Red text
      },
      // Chinese Story Title Box
      'story_title_zh': {
        backgroundColor: '#ffffff',
        bgOpacity: 0, 
        padding: 10,
        borderRadius: 0,
        color: '#be123c', // Festive Red
      },
      // Chinese Story Content Box
      'story_content_zh': {
        backgroundColor: '#fffbfb', // Warm Rice Paper white
        bgOpacity: 95,
        padding: 30,
        borderRadius: 6,
        width: 300,
        color: '#4a0404', // Deep decorative brown/red
      },
      // Cover Location
      'cover_location_zh': {
        backgroundColor: '#be123c', // Festive Red pill
        bgOpacity: 80,
        padding: 8,
        borderRadius: 50,
        color: '#ffffff',
      },
      // Gallery Section Background (New)
      'section_gallery': {
        backgroundColor: '#ffffff',
        bgOpacity: 100,
      }
    }
  };
  // -----------------------------------------------------------------------

  const [data, setData] = useState<InvitationData>(INITIAL_DATA);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setSelectedElementId(null); // Clear selection on lang switch
  };

  const toggleAdmin = () => {
    setIsAdmin(prev => !prev);
    setMode(prev => prev === 'edit' ? 'view' : 'edit');
  };

  // 1. GUEST VIEW (Production Default)
  if (!isAdmin) {
    return (
       <div className="h-screen w-screen bg-black flex justify-center items-center overflow-hidden relative">
         <div className="w-full h-full max-w-[500px] bg-white relative shadow-2xl">
            <MobileViewer 
              data={data} 
              lang={lang} 
              // No update handler for guests
              onUpdate={undefined}
              selectedId={null}
              onSelect={() => {}} 
            />
            
            {/* Language Toggle for Guests */}
            <div className="absolute top-6 left-6 z-50">
               <LanguageToggle currentLang={lang} onToggle={handleLanguageChange} />
            </div>

            {/* Note: Hidden Admin Trigger removed for professionalism. 
                Use ?edit=true in URL to access admin mode. */}
         </div>
       </div>
    );
  }

  // 2. ADMIN / EDITOR VIEW
  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden font-sans">
      
      {/* Navbar */}
      <nav className="flex-none bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex justify-between items-center z-50 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
             <Smartphone className="w-5 h-5" />
           </div>
           <span className={`font-bold text-gray-800 text-lg hidden sm:block ${lang === 'zh' ? 'font-serif-cn' : 'font-serif-en'}`}>
             H5 Invitation Builder
           </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="md:hidden flex bg-gray-100 rounded-lg p-1">
             <button 
               onClick={() => setMode('edit')}
               className={`p-2 rounded-md transition-all ${mode === 'edit' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}
             >
               <PenTool className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setMode('view')}
               className={`p-2 rounded-md transition-all ${mode === 'view' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}
             >
               <Smartphone className="w-4 h-4" />
             </button>
          </div>
          <LanguageToggle currentLang={lang} onToggle={handleLanguageChange} />
          
          <button 
            onClick={toggleAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Unlock className="w-4 h-4" />
            <span>Exit Admin</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Panel */}
        <div className={`
          flex-1 md:flex-none md:w-[420px] bg-white border-r border-gray-200 shadow-xl z-20
          ${mode === 'edit' ? 'block' : 'hidden md:block'}
        `}>
           <EditorPanel 
             data={data} 
             onChange={setData} 
             lang={lang} 
             selectedId={selectedElementId}
             onSelectElement={setSelectedElementId} 
           />
        </div>

        {/* Preview Area (With Phone Mockup) */}
        <div className={`
          flex-1 bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden
          ${mode === 'view' ? 'block' : 'hidden md:flex'}
        `}>
          
          {/* Backgrounds */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>

          {/* Phone Mockup */}
          <div className="relative z-10 w-full h-full max-w-[390px] max-h-[844px] bg-gray-900 rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden ring-1 ring-white/20">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-50 pointer-events-none"></div>
             
             <div className="w-full h-full bg-white relative">
                <MobileViewer 
                  data={data} 
                  lang={lang} 
                  onUpdate={setData}
                  selectedId={selectedElementId}
                  onSelect={setSelectedElementId}
                />
             </div>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default App;