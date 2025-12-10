
import React, { useState, useEffect } from 'react';
import { InvitationData, Language, LABELS, DEFAULT_IMAGES } from './types';
import LanguageToggle from './components/LanguageToggle';
import EditorPanel from './components/EditorPanel';
import MobileViewer from './components/MobileViewer';
import { Smartphone, PenTool, Unlock, Loader2, Cloud } from 'lucide-react';
import { fetchInvitationData } from './services/storageService';

// --- CLOUD CONFIGURATION ---
// 1. Go to https://jsonbin.io and Sign up/Login.
// 2. Click "Create Bin" (paste your initial JSON there).
// 3. COPY the "Bin ID" (e.g., 65f2a...) and paste it below.
// 4. IMPORTANT: In JSONBin dashboard, go to the Bin settings and make it "PUBLIC" (Unlock icon) 
//    so your guests can read it without an API key. 
//    (Only YOU need the API Key to write/save).
const CLOUD_BIN_ID = "693986f9d0ea881f401fafdb"; // <--- PASTE YOUR BIN ID HERE (e.g. "65f2a...")

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  
  // State to control Admin/Edit mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState<'edit' | 'view'>('view'); 
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<InvitationData | null>(null);

  // --- INITIAL DATA FALLBACK (Used if Cloud ID is empty or fails) ---
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
      'story_title_en': { x: 0, y: -120 },
      'story_content_en': { x: 0, y: 20 },
      'story_title_zh': { x: 0, y: -120 },
      'story_content_zh': { x: 0, y: 20 },
    },

    // Initial Styles
    elementStyles: {
      'story_title_en': { backgroundColor: '#fff1f2', bgOpacity: 0, padding: 0, borderRadius: 0, color: '#be123c' },
      'story_content_en': { backgroundColor: '#fff1f2', bgOpacity: 95, padding: 30, borderRadius: 4, width: 300, color: '#881337' },
      'story_title_zh': { backgroundColor: '#ffffff', bgOpacity: 0, padding: 10, borderRadius: 0, color: '#be123c' },
      'story_content_zh': { backgroundColor: '#fffbfb', bgOpacity: 95, padding: 30, borderRadius: 6, width: 300, color: '#4a0404' },
      'cover_location_zh': { backgroundColor: '#be123c', bgOpacity: 80, padding: 8, borderRadius: 50, color: '#ffffff' },
      'section_gallery': { backgroundColor: '#ffffff', bgOpacity: 100 }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Check URL params for explicit edit mode
      const searchParams = new URLSearchParams(window.location.search);
      const isEditParam = searchParams.get('edit') === 'true';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost || isEditParam) {
        setIsAdmin(true);
        setMode('edit');
      }

      // Check if we have a Bin ID configured
      if (CLOUD_BIN_ID) {
        try {
          const cloudData = await fetchInvitationData(CLOUD_BIN_ID);
          // Check if cloudData is valid AND not an empty object (which happens on fresh bin creation)
          if (cloudData && Object.keys(cloudData).length > 0 && cloudData.content) {
            console.log("Loaded data from cloud");
            setData(cloudData);
          } else {
            console.warn("Cloud data is empty or invalid, using local fallback");
            setData(INITIAL_DATA);
          }
        } catch (e) {
          console.error(e);
          setData(INITIAL_DATA);
        }
      } else {
        // No cloud config, use local
        setData(INITIAL_DATA);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setSelectedElementId(null);
  };

  const toggleAdmin = () => {
    setIsAdmin(prev => !prev);
    setMode(prev => prev === 'edit' ? 'view' : 'edit');
  };

  if (isLoading || !data) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-rose-50 text-rose-400 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-serif-en text-lg animate-pulse">Loading Invitation...</p>
      </div>
    );
  }

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
            <div className="absolute top-6 left-6 z-50">
               <LanguageToggle currentLang={lang} onToggle={handleLanguageChange} />
            </div>
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
             H5 Builder {CLOUD_BIN_ID ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2 border border-green-200 flex inline-flex items-center gap-1"><Cloud className="w-3 h-3"/> Cloud Active</span> : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2">Local Mode</span>}
           </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="md:hidden flex bg-gray-100 rounded-lg p-1">
             <button onClick={() => setMode('edit')} className={`p-2 rounded-md transition-all ${mode === 'edit' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}><PenTool className="w-4 h-4" /></button>
             <button onClick={() => setMode('view')} className={`p-2 rounded-md transition-all ${mode === 'view' ? 'bg-white shadow text-rose-600' : 'text-gray-500'}`}><Smartphone className="w-4 h-4" /></button>
          </div>
          <LanguageToggle currentLang={lang} onToggle={handleLanguageChange} />
          <button onClick={toggleAdmin} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"><Unlock className="w-4 h-4" /><span>Exit Admin</span></button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 md:flex-none md:w-[420px] bg-white border-r border-gray-200 shadow-xl z-20 ${mode === 'edit' ? 'block' : 'hidden md:block'}`}>
           <EditorPanel 
             data={data} 
             onChange={setData} 
             lang={lang} 
             selectedId={selectedElementId}
             onSelectElement={setSelectedElementId} 
             binId={CLOUD_BIN_ID}
           />
        </div>

        <div className={`flex-1 bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden ${mode === 'view' ? 'block' : 'hidden md:flex'}`}>
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>

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
       <style>{`@keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } } .animate-blob { animation: blob 7s infinite; } .animation-delay-2000 { animation-delay: 2s; }`}</style>
    </div>
  );
};

export default App;
