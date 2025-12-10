import React, { useState } from 'react';
import { InvitationData, Language, LABELS, LocalizedContent, STICKER_ASSETS, FontStyle, FONT_OPTIONS } from '../types';
import { Sparkles, Image as ImageIcon, Sliders, Globe, Type, MapPin, Calendar, Heart, Palette, Music, Sticker as StickerIcon, Edit3, MoveHorizontal, Box, User, Maximize, Layout, Link, Copy, Check, Share2, UploadCloud, Plus, Download, AlertTriangle } from 'lucide-react';
import { generateStory } from '../services/geminiService';

// --- Components defined OUTSIDE EditorPanel ---

const InputGroup = ({ label, icon: Icon, children }: { label: string, icon?: any, children?: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3 text-rose-400" />}
      {label}
    </label>
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
}

const EditorPanel: React.FC<EditorPanelProps> = ({ data, onChange, lang, selectedId, onSelectElement }) => {
  const t = LABELS[lang];
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customStickerUrl, setCustomStickerUrl] = useState('');

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

  const handleGenerateConfig = () => {
    setShowConfigModal(true);
  };
  
  const copyToClipboard = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonStr);
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
    } else if (key === 'cover_date') {
       label = t.labelDate;
       value = data.date;
       onChangeHandler = (v) => handleSharedChange('date', v);
       return (
         <div className="mb-4">
           <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">{label}</label>
           <StyledInput type="date" value={value} onChange={(e) => onChangeHandler(e.target.value)} />
         </div>
       );
    } else if (key === 'cover_location') {
       label = t.labelLocation;
       value = data.content[lang].location;
       onChangeHandler = (v) => handleContentChange('location', v);
    } else if (key === 'story_title') {
       label = t.labelStoryTitle;
       value = data.content[lang].storyTitle;
       onChangeHandler = (v) => handleContentChange('storyTitle', v);
    } else if (key === 'story_content') {
       label = t.labelStory;
       value = data.content[lang].storyContent;
       onChangeHandler = (v) => handleContentChange('storyContent', v);
       isTextArea = true;
    } else {
      return null;
    }

    return (
      <div className="mb-4">
        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">{label}</label>
        {isTextArea ? (
          <StyledTextArea value={value} onChange={(e) => onChangeHandler(e.target.value)} rows={4} />
        ) : (
          <StyledInput value={value} onChange={(e) => onChangeHandler(e.target.value)} />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
      <div className="p-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md py-2 z-10 border-b border-gray-100 -mx-6 px-6">
          <h2 className={`text-xl font-bold text-gray-800 ${lang === 'zh' ? 'font-serif-cn' : 'font-serif-en'}`}>
            {t.editorTitle}
          </h2>
          <div className="flex gap-2">
             <button
               onClick={handleGenerateConfig}
               className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md transform hover:scale-105"
               title="Generate Configuration Code"
            >
              <Download className="w-3.5 h-3.5" />
              {t.btnDetailedExport}
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
              <Globe className="w-3 h-3" />
              {t.currentLangLabel}
            </div>
          </div>
        </div>

        {/* Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setShowConfigModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">×</button>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Configuration Generated!</h3>
                    <p className="text-sm text-gray-500">Your design is ready to be saved.</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-2 text-sm flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-blue-500" />
                        How to deploy:
                      </h4>
                      <ol className="list-decimal ml-5 text-sm text-gray-600 space-y-1.5">
                        <li>Copy the code block below.</li>
                        <li>Open the file <code>App.tsx</code> in your code editor.</li>
                        <li>Find <code>const INITIAL_DATA = ...</code>.</li>
                        <li>Replace that entire object with the code below.</li>
                        <li>Commit & Push to Cloudflare.</li>
                      </ol>
                   </div>

                   <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs flex gap-3 items-start leading-relaxed">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                      <div>
                        <strong>How to edit after deploying?</strong>
                        <br/>
                        For a professional look, the edit button is hidden for guests.
                        <br/>
                        To access the editor, simply add <code>?edit=true</code> to your website URL.
                        <br/>
                        <span className="opacity-70 mt-1 block">Example: <code>https://your-wedding.com/?edit=true</code></span>
                      </div>
                   </div>
                   
                   <div className="relative group">
                     <div className="absolute top-2 right-2">
                        <button 
                          onClick={(e) => {
                             copyToClipboard();
                             const btn = e.currentTarget;
                             btn.innerText = "Copied!";
                             setTimeout(() => btn.innerText = "Copy Code", 2000);
                          }}
                          className="bg-black/80 hover:bg-black text-white text-xs px-3 py-1.5 rounded-md transition-all"
                        >
                          Copy Code
                        </button>
                     </div>
                     <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto h-64 font-mono leading-relaxed">
{JSON.stringify(data, null, 2)}
                     </pre>
                   </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3">
                   <button onClick={() => setShowConfigModal(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700">
                     Close
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Selected Element Styling */}
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 transition-all duration-300 shadow-sm sticky top-14 z-10">
           <div className="flex items-center gap-2 mb-3">
             <Edit3 className="w-4 h-4 text-rose-600" />
             <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide">
               {selectedId ? (isSectionSelected ? "Section Styling" : t.selectedLabel) : "Text Styling"}
             </h3>
             {selectedId && <span className="text-xs text-rose-500 font-mono ml-auto bg-white px-2 py-0.5 rounded border border-rose-200">
                {isStickerSelected ? 'Sticker' : (isSectionSelected ? 'Section' : 'Text')}
             </span>}
           </div>
           
           {!selectedId ? (
             <p className="text-xs text-rose-400 italic flex items-center gap-2">
               <Type className="w-3 h-3" />
               {t.noSelection}
             </p>
           ) : (
             <div className="space-y-4 animate-fade-in">
                {renderContentEditor()}
                
                {isSectionSelected && (
                  <div className="mb-4">
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Background Color</label>
                     <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                       <input
                          type="color"
                          value={getElementStyle('backgroundColor', '#ffffff')}
                          onChange={(e) => handleElementStyleChange('backgroundColor', e.target.value)}
                          className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                       />
                       <span className="text-xs font-mono text-gray-500">{getElementStyle('backgroundColor', '#ffffff')}</span>
                     </div>
                  </div>
                )}
                
                <div className="border-t border-rose-200/50 my-3"></div>

                {/* Typography Controls */}
                {!isStickerSelected && !isSectionSelected && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                       <Type className="w-3 h-3 text-rose-400" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase">Typography ({t.currentLangLabel})</span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(FONT_OPTIONS[lang]) as FontStyle[]).map((fontKey) => (
                          <button
                            key={fontKey}
                            onClick={() => handleElementStyleChange('font', fontKey)}
                            className={`px-2 py-2 text-xs rounded-lg transition-all border text-left ${
                              getElementStyle('font', data.styles[lang].defaultFontStyle) === fontKey 
                                ? 'bg-rose-500 text-white border-rose-600 shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className="block font-bold">{FONT_OPTIONS[lang][fontKey]}</span>
                            <span className="text-[9px] opacity-70">Abc</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                       <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Text Color</label>
                          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                            <input
                               type="color"
                               value={getElementStyle('color', data.styles[lang].primaryColor)}
                               onChange={(e) => handleElementStyleChange('color', e.target.value)}
                               className="w-6 h-6 rounded border border-gray-200 cursor-pointer"
                            />
                            <span className="text-xs font-mono text-gray-500">{getElementStyle('color', data.styles[lang].primaryColor)}</span>
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Text Scale</label>
                          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center h-[42px]">
                             <input
                               type="range"
                               min="0.5"
                               max="3.0"
                               step="0.1"
                               value={getElementStyle('scale', 1)}
                               onChange={(e) => handleElementStyleChange('scale', parseFloat(e.target.value))}
                               className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                             />
                          </div>
                       </div>
                    </div>
                  </>
                )}
                
                {/* Sticker Controls */}
                {isStickerSelected && (
                   <div className="mb-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Sticker Size</label>
                      <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center h-[42px]">
                         <input
                           type="range"
                           min="0.5"
                           max="3.0"
                           step="0.1"
                           value={getElementStyle('scale', 1)}
                           onChange={(e) => handleElementStyleChange('scale', parseFloat(e.target.value))}
                           className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                         />
                      </div>
                   </div>
                )}

                {/* Box/Container Styling */}
                {canHaveBoxStyling && (
                  <div className="pt-2 border-t border-rose-200/50">
                     <div className="flex items-center gap-2 mb-2">
                       <Box className="w-3 h-3 text-rose-400" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase">Box Styling</span>
                     </div>

                     <div className="grid grid-cols-2 gap-3 mb-3">
                         <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Bg Color</label>
                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                              <input
                                 type="color"
                                 value={getElementStyle('backgroundColor', '#ffffff')}
                                 onChange={(e) => handleElementStyleChange('backgroundColor', e.target.value)}
                                 className="w-6 h-6 rounded border border-gray-200 cursor-pointer"
                              />
                              <span className="text-xs font-mono text-gray-500">
                                {getElementStyle('bgOpacity', 0) === 0 ? 'None' : 'Set'}
                              </span>
                            </div>
                         </div>
                         <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Opacity %</label>
                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center h-[42px]">
                               <input
                                 type="range"
                                 min="0"
                                 max="100"
                                 step="5"
                                 value={getElementStyle('bgOpacity', 0)}
                                 onChange={(e) => handleElementStyleChange('bgOpacity', parseInt(e.target.value))}
                                 className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                            </div>
                         </div>
                     </div>
                     
                     <div className="space-y-3">
                       <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 flex items-center justify-between">
                            <span>Box Width (px)</span>
                            <span className="text-rose-400 text-[10px] font-normal">{getElementStyle('width', 0) === 0 ? 'Auto' : getElementStyle('width', 0)}</span>
                          </label>
                          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center h-[42px]">
                             <input
                               type="range"
                               min="0"
                               max="380"
                               step="10"
                               value={getElementStyle('width', 0)}
                               onChange={(e) => handleElementStyleChange('width', parseInt(e.target.value))}
                               className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                             />
                          </div>
                          {getElementStyle('width', 0) === 0 && <p className="text-[9px] text-gray-400 mt-1 pl-1">Slide right to set fixed width</p>}
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Padding</label>
                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center h-[42px]">
                               <input
                                 type="range"
                                 min="0"
                                 max="40"
                                 step="2"
                                 value={getElementStyle('padding', 0)}
                                 onChange={(e) => handleElementStyleChange('padding', parseInt(e.target.value))}
                                 className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Radius</label>
                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center h-[42px]">
                               <input
                                 type="range"
                                 min="0"
                                 max="50"
                                 step="2"
                                 value={getElementStyle('borderRadius', 0)}
                                 onChange={(e) => handleElementStyleChange('borderRadius', parseInt(e.target.value))}
                                 className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                            </div>
                          </div>
                       </div>
                       
                       <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Border / Line Width</label>
                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center h-[42px]">
                               <input
                                 type="range"
                                 min="0"
                                 max="10"
                                 step="0.5"
                                 value={getElementStyle('borderWidth', 0)}
                                 onChange={(e) => handleElementStyleChange('borderWidth', parseFloat(e.target.value))}
                                 className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                               />
                            </div>
                       </div>
                     </div>
                  </div>
                )}

             </div>
           )}
        </div>

        {/* Standard Form Content */}
        <div className="space-y-6 opacity-80 hover:opacity-100 transition-opacity">
          
          <InputGroup label={t.labelIntro} icon={Sparkles}>
            <StyledInput
              value={data.content[lang].intro}
              onChange={(e) => handleContentChange('intro', e.target.value)}
              className={selectedId === `cover_intro_${lang}` ? 'border-rose-400 ring-2 ring-rose-100 bg-white' : 'border-gray-200 bg-gray-50/50'}
            />
          </InputGroup>

          {/* Sticker Selector */}
          <div className="pt-2 border-t border-gray-100">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
               <StickerIcon className="w-3 h-3 inline mr-1 text-rose-400" /> {t.labelStickers}
             </label>
             <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-3">
               {STICKER_ASSETS.map((sticker, idx) => (
                 <button 
                  key={idx}
                  onClick={() => handleAddSticker(sticker.url)}
                  className="flex-shrink-0 w-14 h-14 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-rose-400 hover:bg-rose-50 flex items-center justify-center transition-all hover:scale-105 group"
                  title={sticker.name}
                 >
                   <img src={sticker.url} alt={sticker.name} className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform" />
                 </button>
               ))}
             </div>
             
             {/* Custom Sticker Input */}
             <div className="flex items-center gap-2">
               <div className="flex-1">
                 <StyledInput 
                   placeholder={lang === 'zh' ? '输入文件名 e.g. sticker.png' : 'Enter filename e.g. sticker.png'}
                   value={customStickerUrl}
                   onChange={(e) => setCustomStickerUrl(e.target.value)}
                   className="py-2 text-xs font-mono"
                 />
               </div>
               <button 
                 onClick={() => handleAddSticker(customStickerUrl)}
                 disabled={!customStickerUrl}
                 className="bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-600 rounded-xl p-2.5 transition-colors disabled:opacity-50"
                 title="Add Custom Sticker"
               >
                 <Plus className="w-4 h-4" />
               </button>
             </div>
          </div>

          {/* Story & AI Section */}
          <div className={`space-y-4 bg-rose-50/50 p-4 rounded-2xl border border-rose-100 transition-all ${selectedId?.includes('story') ? 'ring-2 ring-rose-400 bg-rose-50' : ''}`}>
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3 h-3" />
                  {t.labelStory}
                </label>
                <button
                  onClick={handleAiStory}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1.5 text-white bg-rose-400 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {isGenerating ? '...' : t.btnGenerateStory}
                </button>
             </div>
             <StyledInput
                type="text"
                value={data.content[lang].storyTitle}
                onChange={(e) => handleContentChange('storyTitle', e.target.value)}
                placeholder={t.labelStoryTitle}
                className="bg-white border-rose-100 focus:border-rose-300"
              />
             <StyledTextArea
                value={data.content[lang].storyContent}
                onChange={(e) => handleContentChange('storyContent', e.target.value)}
                rows={6}
                className="bg-white border-rose-100 focus:border-rose-300"
             />
          </div>
          
           {/* Date & Location */}
           <div className="space-y-4 pt-4 border-t border-gray-100">
             <div className="grid grid-cols-2 gap-4">
               <InputGroup label={t.labelDate} icon={Calendar}>
                <StyledInput type="date" value={data.date} onChange={(e) => handleSharedChange('date', e.target.value)} />
               </InputGroup>
               <InputGroup label={t.labelTime} icon={Calendar}>
                <StyledInput type="time" value={data.time} onChange={(e) => handleSharedChange('time', e.target.value)} />
               </InputGroup>
             </div>
             <InputGroup label={t.labelLocation} icon={MapPin}>
              <StyledInput value={data.content[lang].location} onChange={(e) => handleContentChange('location', e.target.value)} />
             </InputGroup>
             <InputGroup label={t.labelAddress} icon={MapPin}>
              <StyledInput value={data.content[lang].address} onChange={(e) => handleContentChange('address', e.target.value)} />
             </InputGroup>
           </div>
           
           {/* Music & Images */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <InputGroup label={t.labelMusic} icon={Music}>
               <StyledInput
                type="text"
                value={data.musicUrl}
                onChange={(e) => handleSharedChange('musicUrl', e.target.value)}
                placeholder="e.g. music.mp3"
                className="font-mono text-xs text-gray-500"
              />
            </InputGroup>
  
            <InputGroup label={t.labelCover} icon={ImageIcon}>
              <StyledInput
                type="text"
                value={data.coverImage}
                onChange={(e) => handleSharedChange('coverImage', e.target.value)}
                 placeholder="e.g. cover.jpg"
                className="font-mono text-xs text-gray-500"
              />
            </InputGroup>
            
            <InputGroup label={t.labelGallery} icon={ImageIcon}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-gray-400">One filename per line</span>
                {onSelectElement && (
                  <button 
                    onClick={() => onSelectElement('section_gallery')}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-600 px-2 py-1 rounded text-[10px] font-bold transition-colors"
                    title="Change Background Color"
                  >
                    <Palette className="w-3 h-3" />
                    BG Color
                  </button>
                )}
              </div>
              <StyledTextArea
                value={data.galleryImages.join('\n')}
                onChange={(e) => handleGalleryChange(e.target.value)}
                rows={4}
                placeholder="e.g. photo1.jpg"
                className="font-mono text-xs text-gray-500 whitespace-nowrap overflow-x-auto"
              />
            </InputGroup>

            {/* RSVP Endpoint */}
            <InputGroup label={t.labelRsvpUrl} icon={Link}>
              <div className="text-[10px] text-gray-400 mb-1 leading-tight">
                {lang === 'zh' ? '在 formspree.io 创建表单，将 URL 填入此处即可接收邮件。' : 'Create form at formspree.io, paste URL here to receive emails.'}
              </div>
              <StyledInput
                type="text"
                value={data.rsvpUrl}
                onChange={(e) => handleSharedChange('rsvpUrl', e.target.value)}
                placeholder="https://formspree.io/f/..."
                className="font-mono text-xs text-gray-500"
              />
            </InputGroup>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EditorPanel;