
import React, { useState, useEffect, useRef } from 'react';
import { InvitationData, Language, LABELS, LocalizedContent, STICKER_ASSETS, FontStyle, FONT_OPTIONS } from '../types';
import { Sparkles, Image as ImageIcon, Globe, Type, MapPin, Calendar, Heart, Palette, Music, Sticker as StickerIcon, Edit3, Box, UploadCloud, Plus, Download, Save, CheckCircle2, AlertCircle, Link, Settings, Trash2, FolderOpen, Send, Layout, HelpCircle, Copy, ExternalLink, Eye } from 'lucide-react';
import { generateStory, saveInvitationData } from '../services';

// --- Components defined OUTSIDE EditorPanel ---
const InputGroup = ({ label, icon: Icon, children, extraAction }: { label: string, icon?: any, children?: React.ReactNode, extraAction?: React.ReactNode }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-rose-400" />}
        {label}
        </label>
        {extraAction}
    </div>
    {children}
  </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none text-sm transition-all ${props.className || ''}`}
  />
);

const StyledTextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none text-sm transition-all resize-none ${props.className || ''}`}
  />
);

// -----------------------------------------------------------------------------------

interface EditorPanelProps {
  data: InvitationData;
  onChange: (data: InvitationData) => void;
  lang: Language;
  selectedId: string | null;
  onSelectElement?: (id: string | null) => void;
  binId: string | null;
  onBinIdChange: (id: string) => void;
  previewRsvpSuccess: boolean;
  onTogglePreviewRsvpSuccess: (val: boolean) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ data, onChange, lang, selectedId, onSelectElement, binId, onBinIdChange, previewRsvpSuccess, onTogglePreviewRsvpSuccess }) => {
  const t = LABELS[lang];
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showRsvpHelp, setShowRsvpHelp] = useState(false);
  const [customStickerUrl, setCustomStickerUrl] = useState('');

  // Refs for file inputs
  const musicInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const storyBgInputRef = useRef<HTMLInputElement>(null);
  const rsvpBgInputRef = useRef<HTMLInputElement>(null);

  // Cloud Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [inputBinId, setInputBinId] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load configuration from local storage/props on mount or when modal opens
  useEffect(() => {
    const savedKey = localStorage.getItem('jsonbin_api_key');
    if (savedKey) setApiKey(savedKey);
    if (binId) setInputBinId(binId);
  }, [binId, showConfigModal]);

  // Helper functions
  const handleSharedChange = (field: keyof InvitationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleContentChange = (field: keyof LocalizedContent, value: string) => {
    onChange({
      ...data,
      content: {
        ...data.content,
        [lang]: {
          ...data.content[lang],
          [field]: value
        }
      }
    });
  };

  const handleElementStyleChange = (field: string, value: any) => {
    if (!selectedId) return;
    const currentStyle = data.elementStyles[selectedId] || {};
    onChange({
      ...data,
      elementStyles: {
        ...data.elementStyles,
        [selectedId]: {
          ...currentStyle,
          [field]: value
        }
      }
    });
  };

  const getElementStyle = (field: string, defaultValue: any) => {
    if (!selectedId) return defaultValue;
    return data.elementStyles[selectedId]?.[field as keyof typeof data.elementStyles[string]] ?? defaultValue;
  };

  const handleGalleryChange = (text: string) => {
    const urls = text.split('\n').filter(url => url.trim() !== '');
    handleSharedChange('galleryImages', urls);
  };

  const handleAddSticker = (url: string) => {
    if (!url) return;
    const newSticker = {
      id: `sticker_${Date.now()}`,
      url,
      x: 0,
      y: 0, 
      scale: 1
    };
    onChange({
      ...data,
      stickers: [...data.stickers, newSticker]
    });
    setCustomStickerUrl('');
  };

  const handleAiStory = async () => {
    setIsGenerating(true);
    try {
      const currentContent = data.content[lang];
      const story = await generateStory(lang, currentContent.groom, currentContent.bride);
      if (story) {
        handleContentChange('storyContent', story);
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveConnection = () => {
    const cleanedBinId = inputBinId.trim();
    if (cleanedBinId) {
      onBinIdChange(cleanedBinId);
    }
    if (apiKey.trim()) {
      localStorage.setItem('jsonbin_api_key', apiKey.trim());
    }
    setShowConfigModal(false);
  };

  const handleDisconnect = () => {
    if (window.confirm("Are you sure? This will clear the Bin ID from this browser.")) {
        localStorage.removeItem('jsonbin_bin_id');
        onBinIdChange(''); 
        setInputBinId('');
        setShowConfigModal(false);
    }
  };

  const handlePublishClick = async () => {
    if (!binId) {
      setShowConfigModal(true);
      return;
    }
    if (!apiKey) {
      alert("Please enter your JSONBin API Key (Master Key) in Config to save.");
      setShowConfigModal(true); 
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    localStorage.setItem('jsonbin_api_key', apiKey);

    const success = await saveInvitationData(binId, apiKey, data);
    
    setIsSaving(false);
    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  };
  
  const copyToClipboard = (text: string, btn: HTMLButtonElement | null) => {
    navigator.clipboard.writeText(text);
    if (btn) {
        const original = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = original, 2000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'music' | 'cover' | 'gallery' | 'sticker' | 'storyBg' | 'rsvpBg') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileName = file.name;

    if (type === 'music') {
      handleSharedChange('musicUrl', fileName);
      alert(`${t.uploadTooltip}\nFile: ${fileName}`);
    } else if (type === 'cover') {
      handleSharedChange('coverImage', fileName);
      alert(`${t.uploadTooltip}\nFile: ${fileName}`);
    } else if (type === 'storyBg') {
        handleSharedChange('storyBackgroundImage', fileName);
        alert(`${t.uploadTooltip}\nFile: ${fileName}`);
    } else if (type === 'rsvpBg') {
        handleSharedChange('rsvpBackgroundImage', fileName);
        alert(`${t.uploadTooltip}\nFile: ${fileName}`);
    } else if (type === 'gallery') {
      const newFiles = Array.from(files).map((f: File) => f.name);
      handleSharedChange('galleryImages', [...data.galleryImages, ...newFiles]);
      alert(`${t.uploadTooltip}\nFiles added: ${newFiles.join(', ')}`);
    } else if (type === 'sticker') {
      handleAddSticker(fileName);
      alert(`${t.uploadTooltip}\nAdded: ${fileName}`);
    }
    e.target.value = '';
  };


  const isStickerSelected = selectedId?.startsWith('sticker_');
  const isSectionSelected = selectedId?.startsWith('section_');
  const canHaveBoxStyling = selectedId && !isStickerSelected && !isSectionSelected;

  const renderContentEditor = () => {
    if (!selectedId || isStickerSelected || isSectionSelected) return null;
    const parts = selectedId.split('_');
    parts.pop();
    const key = parts.join('_');
    
    let label = '';
    let value = '';
    let onChangeHandler = (v: string) => {};
    let isTextArea = false;

    if (key === 'cover_intro') {
      label = t.labelIntro;
      value = data.content[lang].intro;
      onChangeHandler = (v) => handleContentChange('intro', v);
    } else if (key === 'cover_names') {
       return (
         <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-white rounded-lg border border-rose-100">
           <div>
             <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">{t.labelGroom}</label>
             <StyledInput value={data.content[lang].groom} onChange={(e) => handleContentChange('groom', e.target.value)} />
           </div>
           <div>
             <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">{t.labelBride}</label>
             <StyledInput value={data.content[lang].bride} onChange={(e) => handleContentChange('bride', e.target.value)} />
           </div>
         </div>
       );
    } else if (key === 'story_title') {
      label = t.labelStoryTitle;
      value = data.content[lang].storyTitle;
      onChangeHandler = (v) => handleContentChange('storyTitle', v);
    } else if (key === 'story_content') {
      label = t.labelStory;
      value = data.content[lang].storyContent;
      onChangeHandler = (v) => handleContentChange('storyContent', v);
      isTextArea = true;
    } else if (key === 'rsvp_title') {
      label = t.labelRsvpTitle;
      value = data.content[lang].rsvpTitle;
      onChangeHandler = (v) => handleContentChange('rsvpTitle', v);
    } else if (key === 'rsvp_subtitle') {
      label = t.labelRsvpSubtitle;
      value = data.content[lang].rsvpSubtitle;
      onChangeHandler = (v) => handleContentChange('rsvpSubtitle', v);
    } else if (key === 'rsvp_success_msg') {
        label = t.labelRsvpSuccess;
        value = data.content[lang].rsvpSuccessMsg || t.rsvpSuccess;
        onChangeHandler = (v) => handleContentChange('rsvpSuccessMsg', v);
        isTextArea = true;
    }

    if (!label) return null;

    return (
      <div className="mb-4 p-3 bg-white rounded-lg border border-rose-100">
        <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> {t.selectedLabel} {label}
        </label>
        {isTextArea ? (
          <StyledTextArea value={value} onChange={(e) => onChangeHandler(e.target.value)} rows={3} />
        ) : (
          <StyledInput value={value} onChange={(e) => onChangeHandler(e.target.value)} />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-8 scrollbar-hide">
        
        {/* HEADER */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">{t.editorTitle}</h2>
          <p className="text-sm text-gray-500">{t.currentLangLabel}</p>
        </div>

        {/* --- DYNAMIC STYLE EDITOR (Context Aware) --- */}
        {selectedId ? (
          <div className="animate-fade-in space-y-4">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-rose-500" />
                    Element Style
                </h3>
                <button 
                    onClick={() => onSelectElement && onSelectElement(null)} 
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                    Close
                </button>
             </div>
             
             {/* Content Editor if Applicable */}
             {renderContentEditor()}

             <div className="grid grid-cols-2 gap-3">
               {/* Font Family (Not for stickers/sections) */}
               {!isStickerSelected && !isSectionSelected && (
                 <div className="col-span-2 space-y-1">
                   <label className="text-[10px] text-gray-400 uppercase font-bold">{t.labelFont}</label>
                   <div className="grid grid-cols-2 gap-2">
                     {(['serif', 'sans', 'handwriting', 'display'] as FontStyle[]).map(f => (
                       <button
                         key={f}
                         onClick={() => handleElementStyleChange('font', f)}
                         className={`px-2 py-1.5 rounded-md text-xs border text-left truncate transition-colors ${
                           (getElementStyle('font', data.styles[lang].defaultFontStyle) === f) 
                           ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' 
                           : 'border-gray-100 hover:border-gray-200 text-gray-600'
                         }`}
                       >
                         {FONT_OPTIONS[lang][f].split('(')[0]}
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {/* Color Picker */}
               {!isStickerSelected && (
                 <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">{t.labelColor}</label>
                    <div className="flex items-center gap-2 border border-gray-200 p-1.5 rounded-lg bg-gray-50/50">
                        <input 
                            type="color" 
                            value={getElementStyle('color', data.styles[lang].primaryColor)}
                            onChange={(e) => handleElementStyleChange('color', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-gray-500 font-mono uppercase">{getElementStyle('color', data.styles[lang].primaryColor)}</span>
                    </div>
                 </div>
               )}

               {/* Scale Slider */}
               <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">Size / Scale</label>
                  <input 
                    type="range" min="0.5" max="3" step="0.1"
                    value={getElementStyle('scale', isStickerSelected ? 1 : 1)}
                    onChange={(e) => handleElementStyleChange('scale', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
               </div>

               {/* Background Color & Opacity (For Box Elements) */}
               {canHaveBoxStyling && (
                  <>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Bg Color</label>
                        <div className="flex items-center gap-2 border border-gray-200 p-1.5 rounded-lg bg-gray-50/50">
                            <input 
                                type="color" 
                                value={getElementStyle('backgroundColor', '#ffffff')}
                                onChange={(e) => handleElementStyleChange('backgroundColor', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Bg Opacity</label>
                        <input 
                            type="range" min="0" max="100" step="5"
                            value={getElementStyle('bgOpacity', 0)}
                            onChange={(e) => handleElementStyleChange('bgOpacity', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                    </div>
                    
                    {/* Padding & Corner Radius */}
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Padding</label>
                        <input 
                            type="range" min="0" max="50" step="2"
                            value={getElementStyle('padding', 0)}
                            onChange={(e) => handleElementStyleChange('padding', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Roundness</label>
                        <input 
                            type="range" min="0" max="50" step="2"
                            value={getElementStyle('borderRadius', 0)}
                            onChange={(e) => handleElementStyleChange('borderRadius', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Border Width</label>
                        <input 
                            type="range" min="0" max="10" step="1"
                            value={getElementStyle('borderWidth', 0)}
                            onChange={(e) => handleElementStyleChange('borderWidth', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                    </div>
                    
                    {/* Fixed Width Control */}
                    <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold flex justify-between">
                            <span>Width constraint</span>
                            <span className="text-gray-400 font-normal">{getElementStyle('width', 0) === 0 ? 'Auto' : getElementStyle('width', 0) + 'px'}</span>
                        </label>
                        <input 
                            type="range" min="0" max="350" step="10"
                            value={getElementStyle('width', 0)}
                            onChange={(e) => handleElementStyleChange('width', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                        <div className="text-[9px] text-gray-400 text-right">0 = Auto Fit</div>
                    </div>
                  </>
               )}
             </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-gray-400 text-sm mb-6">
             <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
             <p>{t.noSelection}</p>
             <p className="text-xs mt-1 opacity-70">{t.selectionTip}</p>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* --- GLOBAL SECTIONS --- */}
        
        {/* 1. Basic Info */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-3 h-3" /> Basic Info
          </h3>
          <InputGroup label={t.labelDate} icon={Calendar}>
             <StyledInput type="date" value={data.date} onChange={(e) => handleSharedChange('date', e.target.value)} />
          </InputGroup>
          <div className="grid grid-cols-2 gap-3">
             <InputGroup label={t.labelTime}>
                <StyledInput type="time" value={data.time} onChange={(e) => handleSharedChange('time', e.target.value)} />
             </InputGroup>
             <InputGroup label={t.labelTimeFormat}>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-rose-100 outline-none text-sm"
                  value={data.timeFormat} 
                  onChange={(e) => handleSharedChange('timeFormat', e.target.value)}
                >
                  <option value="24h">24 Hour (17:30)</option>
                  <option value="12h">12 Hour (5:30 PM)</option>
                </select>
             </InputGroup>
          </div>
          <InputGroup label={t.labelLocation} icon={MapPin}>
             <StyledInput value={data.content[lang].location} onChange={(e) => handleContentChange('location', e.target.value)} />
          </InputGroup>
          <InputGroup label={t.labelAddress}>
             <StyledTextArea rows={2} value={data.content[lang].address} onChange={(e) => handleContentChange('address', e.target.value)} />
          </InputGroup>
        </section>

        {/* 2. Media Assets */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> Media & Assets
          </h3>
          
          <InputGroup label={t.labelCover}>
             <div className="flex gap-2">
                <StyledInput value={data.coverImage} onChange={(e) => handleSharedChange('coverImage', e.target.value)} placeholder="image.jpg or URL" />
                <button onClick={() => coverInputRef.current?.click()} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"><FolderOpen className="w-4 h-4" /></button>
                <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'cover')} />
             </div>
          </InputGroup>

          <InputGroup label={t.labelStoryBg}>
             <div className="flex gap-2">
                <StyledInput value={data.storyBackgroundImage || ''} onChange={(e) => handleSharedChange('storyBackgroundImage', e.target.value)} placeholder="Optional: Story BG" />
                <button onClick={() => storyBgInputRef.current?.click()} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"><FolderOpen className="w-4 h-4" /></button>
                <input ref={storyBgInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'storyBg')} />
             </div>
          </InputGroup>

          <InputGroup label={t.labelGallery} icon={ImageIcon}>
             <StyledTextArea 
                rows={4} 
                value={data.galleryImages.join('\n')} 
                onChange={(e) => handleGalleryChange(e.target.value)} 
                placeholder="One URL per line..."
                className="font-mono text-xs"
             />
             <div className="flex justify-end mt-1">
               <button onClick={() => galleryInputRef.current?.click()} className="text-xs flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium">
                 <Plus className="w-3 h-3" /> {t.labelAddImages}
               </button>
               <input ref={galleryInputRef} type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileSelect(e, 'gallery')} />
             </div>
          </InputGroup>

          <InputGroup label={t.labelMusic} icon={Music}>
             <div className="flex gap-2">
               <StyledInput value={data.musicUrl} onChange={(e) => handleSharedChange('musicUrl', e.target.value)} />
               <button onClick={() => musicInputRef.current?.click()} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"><FolderOpen className="w-4 h-4" /></button>
               <input ref={musicInputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileSelect(e, 'music')} />
             </div>
             <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="musicEnabled" checked={data.musicEnabled} onChange={(e) => handleSharedChange('musicEnabled', e.target.checked)} className="rounded text-rose-500 focus:ring-rose-500" />
                <label htmlFor="musicEnabled" className="text-sm text-gray-600">Auto-play Music</label>
             </div>
          </InputGroup>
        </section>

        {/* 3. Story & AI */}
        <section className="space-y-4">
           <div className="flex justify-between items-center">
             <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"><Sparkles className="w-3 h-3" /> Love Story</h3>
             <button 
                onClick={handleAiStory} 
                disabled={isGenerating}
                className="text-[10px] bg-gradient-to-r from-rose-400 to-orange-400 text-white px-2 py-1 rounded-full flex items-center gap-1 hover:shadow-md transition-all disabled:opacity-50"
             >
                {isGenerating ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-3 h-3" />}
                {t.btnGenerateStory}
             </button>
           </div>
           {/* Note: Actual Story Text is edited via selection now to support styling */}
           <p className="text-xs text-gray-400 italic">Click the story text in the preview to edit content & style.</p>
        </section>

        {/* 4. Stickers */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <StickerIcon className="w-3 h-3" /> {t.labelStickers}
          </h3>
          <div className="flex flex-wrap gap-2">
            {STICKER_ASSETS.map((s, i) => (
              <button key={i} onClick={() => handleAddSticker(s.url)} className="w-10 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center p-1 transition-transform hover:scale-110" title={s.name}>
                <img src={s.url} alt={s.name} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
             <StyledInput 
               placeholder="Custom Sticker URL..." 
               value={customStickerUrl} 
               onChange={(e) => setCustomStickerUrl(e.target.value)} 
             />
             <button onClick={() => stickerInputRef.current?.click()} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600"><FolderOpen className="w-4 h-4" /></button>
             <input ref={stickerInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'sticker')} />
             <button onClick={() => handleAddSticker(customStickerUrl)} className="bg-gray-800 text-white px-3 rounded-lg text-xs font-medium hover:bg-black">Add</button>
          </div>
        </section>

        {/* 5. RSVP Config */}
        <section className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
           <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
             <Send className="w-3 h-3" /> RSVP Configuration
           </h3>
           
           {/* RSVP Background Image */}
           <InputGroup label={t.labelRsvpBg}>
             <div className="flex gap-2">
                <StyledInput value={data.rsvpBackgroundImage || ''} onChange={(e) => handleSharedChange('rsvpBackgroundImage', e.target.value)} placeholder="Optional: RSVP BG" />
                <button onClick={() => rsvpBgInputRef.current?.click()} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"><FolderOpen className="w-4 h-4" /></button>
                <input ref={rsvpBgInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'rsvpBg')} />
             </div>
           </InputGroup>

           {/* Toggle Preview Success State */}
           <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
              <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
                 <Eye className="w-3 h-3 text-rose-500" />
                 {t.toggleRsvpPreview}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={previewRsvpSuccess} 
                  onChange={(e) => onTogglePreviewRsvpSuccess(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
           </div>
           
           <InputGroup 
             label={t.labelRsvpUrl} 
             extraAction={<button onClick={() => setShowRsvpHelp(true)} className="text-[10px] text-rose-500 flex items-center gap-1 hover:underline"><HelpCircle className="w-3 h-3" /> Setup Guide</button>}
           >
              <StyledTextArea 
                value={data.rsvpUrl} 
                onChange={(e) => handleSharedChange('rsvpUrl', e.target.value)} 
                placeholder="https://script.google.com/..."
                rows={2}
                className="font-mono text-xs break-all"
              />
           </InputGroup>
        </section>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 flex flex-col gap-3 shadow-lg z-20">
         <div className="flex gap-2">
            <button 
                onClick={handlePublishClick}
                disabled={isSaving}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all shadow-md ${saveStatus === 'success' ? 'bg-green-500' : saveStatus === 'error' ? 'bg-red-500' : 'bg-rose-500 hover:bg-rose-600'}`}
            >
                {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <UploadCloud className="w-4 h-4" />}
                {saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Failed' : 'Save to Cloud'}
            </button>
            <button 
                onClick={() => setShowConfigModal(true)}
                className={`p-3 rounded-xl border transition-colors ${binId ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}`}
                title="Cloud Settings"
            >
                <Settings className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* CONFIG MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
                <div className="bg-rose-50 p-4 border-b border-rose-100 flex justify-between items-center">
                    <h3 className="font-bold text-rose-800 flex items-center gap-2"><UploadCloud className="w-5 h-5"/> Cloud Storage (JSONBin)</h3>
                    <button onClick={() => setShowConfigModal(false)} className="text-rose-400 hover:text-rose-600">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        To save and share your invitation across devices, you need a free <b>JSONBin.io</b> account.
                    </p>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Master API Key</label>
                            <input 
                                type="password" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)} 
                                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                                placeholder="X-Master-Key from API Keys"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bin ID (Optional)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={inputBinId} 
                                    onChange={(e) => setInputBinId(e.target.value)} 
                                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                                    placeholder="Leave empty to create new"
                                />
                                {binId && (
                                    <button onClick={handleDisconnect} className="px-3 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-sm">
                                        Disconnect
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">If you have an existing Bin ID, paste it here to edit that specific invitation.</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button onClick={handleSaveConnection} className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors">
                            Confirm Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* RSVP HELP MODAL */}
      {showRsvpHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-up max-h-[90vh] flex flex-col">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-rose-500"/> Google Sheets RSVP Setup Guide</h3>
                  <button onClick={() => setShowRsvpHelp(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2">&times;</button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
                  
                  {/* Step 1 */}
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">1</div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-base">Create Sheet</h4>
                        <p>Go to <a href="https://sheets.new" target="_blank" className="text-blue-600 underline">Google Sheets</a> and create a blank sheet.</p>
                     </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">2</div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-base">Open Script Editor</h4>
                        <p>Click <b>Extensions</b> &gt; <b>Apps Script</b> in the top menu.</p>
                     </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">3</div>
                     <div className="space-y-2 w-full">
                        <h4 className="font-bold text-base">Paste Code</h4>
                        <p>Delete existing code and paste this:</p>
                        <div className="relative group">
                           <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto font-mono">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var params = e.parameter;
  sheet.appendRow([new Date(), params.name, params.guests, params.status]);
  return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);
}`}
                           </pre>
                           <button 
                             onClick={(e) => copyToClipboard(`function doPost(e) {\n  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();\n  var params = e.parameter;\n  sheet.appendRow([new Date(), params.name, params.guests, params.status]);\n  return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);\n}`, e.currentTarget)}
                             className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/40 rounded text-white text-xs"
                           >
                              <Copy className="w-3 h-3" />
                           </button>
                        </div>
                        <p className="text-xs text-gray-500">Click Save (Floppy Disk Icon).</p>
                     </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">4</div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-base">Deploy (Critical!)</h4>
                        <ul className="list-disc pl-4 space-y-1">
                           <li>Click <b>Deploy</b> &gt; <b>New deployment</b>.</li>
                           <li>Select type: <b>Web app</b>.</li>
                           <li>Execute as: <b>Me</b>.</li>
                           <li>Who has access: <b className="text-red-600">Anyone</b> (Must select this!).</li>
                           <li>Click Deploy &gt; Authorize Access &gt; Copy URL.</li>
                        </ul>
                     </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">5</div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-base">Paste URL</h4>
                        <p>Paste the <code>script.google.com</code> URL into the input field below.</p>
                     </div>
                  </div>

              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center shrink-0">
                  <button onClick={() => setShowRsvpHelp(false)} className="px-6 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors">
                      Got it!
                  </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default EditorPanel;
