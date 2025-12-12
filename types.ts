

export type Language = 'en' | 'zh';

export type FontStyle = 'serif' | 'sans' | 'handwriting' | 'display';

export interface StyleConfig {
  titleScale: number;
  bodyScale: number;
  spacingScale: number;
  primaryColor: string;
  defaultFontStyle: FontStyle; 
}

export interface Position {
  x: number;
  y: number;
}

// Updated: Comprehensive Element Styling
export interface ElementStyle {
  font?: FontStyle;
  color?: string;       // Text Color
  scale?: number;       // Transform Scale
  
  // Container Properties
  width?: number;       // Fixed width in px (0 or undefined = auto)
  backgroundColor?: string; // Hex code
  bgOpacity?: number;   // 0 to 100
  padding?: number;     // px
  borderRadius?: number;// px
  borderWidth?: number; // px (New: Controls stroke width or border width)
}

export interface Sticker {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
}

export interface LocalizedContent {
  intro: string; 
  groom: string;
  bride: string;
  location: string;
  address: string;
  storyTitle: string;
  storyContent: string;
  // New Editable RSVP Fields
  rsvpTitle: string;
  rsvpSubtitle: string;
  rsvpSuccessMsg: string; // New: Editable success message
}

export interface InvitationData {
  // Shared Data
  date: string;
  time: string;
  timeFormat: '12h' | '24h'; // New field for time format preference
  coverImage: string;
  galleryImages: string[];
  musicEnabled: boolean;
  musicUrl: string;
  stickers: Sticker[];
  
  // New Backgrounds
  storyBackgroundImage: string; 
  rsvpBackgroundImage: string;

  // Data Collection
  rsvpUrl: string; // New: Formspree or generic endpoint URL

  // Localized Data
  content: Record<Language, LocalizedContent>;

  // Localized Styles
  styles: Record<Language, StyleConfig>;
  
  // Element Positions (Keyed by element ID + Language)
  positions: Record<string, Position>;
  
  // Element Styles (Keyed by element ID)
  elementStyles: Record<string, ElementStyle>;
}

export interface Translations {
  // UI Controls
  editorTitle: string;
  previewMode: string;
  editMode: string;
  currentLangLabel: string;
  dragTip: string;
  selectionTip: string;
  
  // Form Labels
  labelIntro: string;
  labelGroom: string;
  labelBride: string;
  labelDate: string;
  labelTime: string;
  labelTimeFormat: string; // New label
  labelLocation: string;
  labelAddress: string;
  labelCover: string;
  labelStoryTitle: string;
  labelStory: string;
  labelStoryBg: string; // New
  labelGallery: string;
  labelMusic: string;
  labelStickers: string;
  labelCustomSticker: string;
  btnDetailedExport: string;
  labelRsvpUrl: string;
  labelRsvpBg: string; // New
  labelRsvpTitle: string; // New
  labelRsvpSubtitle: string; // New
  labelRsvpSuccess: string; // New
  toggleRsvpPreview: string; // New
  
  // Helper Labels
  labelSelectFile: string;
  labelAddImages: string;
  uploadTooltip: string;
  
  // Style Labels
  styleSection: string;
  labelTitleScale: string;
  labelBodyScale: string;
  labelSpacingScale: string;
  labelColor: string;
  labelFont: string;
  
  // Selection Tools
  selectedLabel: string;
  noSelection: string;

  // Invitation Viewer Text
  saveTheDate: string; // Default fallback
  ourStory: string;
  gallery: string;
  whenWhere: string;
  rsvpTitle: string; // Default fallback
  rsvpNamePlaceholder: string;
  rsvpGuestsPlaceholder: string;
  rsvpWishesPlaceholder: string;
  rsvpAttend: string;
  rsvpDecline: string;
  rsvpSubmit: string;
  rsvpSuccess: string;
  rsvpError: string;
  
  // Navigation
  navGoogle: string;
  navWaze: string;

  // AI
  aiStoryPrompt: string;
  btnGenerateStory: string;
}

export const LABELS: Record<Language, Translations> = {
  en: {
    editorTitle: "Editor",
    previewMode: "Preview",
    editMode: "Edit",
    currentLangLabel: "Editing English",
    dragTip: "Drag to move",
    selectionTip: "Click text to edit style",
    
    labelIntro: "Intro Text",
    labelGroom: "Groom",
    labelBride: "Bride",
    labelDate: "Date",
    labelTime: "Time",
    labelTimeFormat: "Time Format",
    labelLocation: "Venue",
    labelAddress: "Address",
    labelCover: "Cover Photo",
    labelStoryTitle: "Story Title",
    labelStory: "Story Content",
    labelStoryBg: "Story Background",
    labelGallery: "Gallery Photos",
    labelMusic: "Music File",
    labelStickers: "Stickers",
    labelCustomSticker: "Add Custom Sticker",
    labelRsvpUrl: "RSVP URL",
    labelRsvpBg: "RSVP Background",
    labelRsvpTitle: "RSVP Title",
    labelRsvpSubtitle: "RSVP Subtitle",
    labelRsvpSuccess: "Success Message",
    toggleRsvpPreview: "Preview Success State",
    btnDetailedExport: "Generate Config",

    labelSelectFile: "Select File",
    labelAddImages: "Add Images",
    uploadTooltip: "Selected filename will be filled. Please ensure you move the actual file to your 'public' folder!",
    
    styleSection: "Global Settings",
    labelTitleScale: "Global Title Size",
    labelBodyScale: "Global Body Size",
    labelSpacingScale: "Spacing",
    labelColor: "Default Color",
    labelFont: "Default Font",
    
    selectedLabel: "Editing Selected:",
    noSelection: "Select an element to edit style",

    saveTheDate: "Save The Date",
    ourStory: "Our Love Story",
    gallery: "Sweet Moments",
    whenWhere: "When & Where",
    rsvpTitle: "Will You Join Us?",
    rsvpNamePlaceholder: "Your Name",
    rsvpGuestsPlaceholder: "Guests Count",
    rsvpWishesPlaceholder: "Best Wishes",
    rsvpAttend: "Accept",
    rsvpDecline: "Decline",
    rsvpSubmit: "Send RSVP",
    rsvpSuccess: "Thank you! RSVP Sent.",
    rsvpError: "Failed to send. Please try again.",
    
    navGoogle: "Google Maps",
    navWaze: "Waze",
    
    aiStoryPrompt: "Write a short, romantic story (max 60 words) about a couple named [GROOM] and [BRIDE] meeting and falling in love.",
    btnGenerateStory: "AI Write Story",
  },
  zh: {
    editorTitle: "模版配置",
    previewMode: "预览",
    editMode: "编辑",
    currentLangLabel: "正在编辑中文",
    dragTip: "拖拽可移动元素",
    selectionTip: "点击文字可单独修改样式",
    
    labelIntro: "开场白",
    labelGroom: "新郎",
    labelBride: "新娘",
    labelDate: "日期",
    labelTime: "时间",
    labelTimeFormat: "时间格式",
    labelLocation: "场地",
    labelAddress: "地址",
    labelCover: "封面图文件名",
    labelStoryTitle: "故事标题",
    labelStory: "故事内容",
    labelStoryBg: "故事页背景图",
    labelGallery: "相册文件名",
    labelMusic: "音乐文件名",
    labelStickers: "贴纸",
    labelCustomSticker: "添加自定义贴纸",
    labelRsvpUrl: "回执提交地址",
    labelRsvpBg: "回执页背景图",
    labelRsvpTitle: "回执页主标题",
    labelRsvpSubtitle: "回执页副标题",
    labelRsvpSuccess: "提交成功提示语",
    toggleRsvpPreview: "预览成功状态",
    btnDetailedExport: "生成配置代码",

    labelSelectFile: "选择文件",
    labelAddImages: "添加图片",
    uploadTooltip: "系统将自动填入文件名。请务必将对应的文件手动复制到项目的 'public' 文件夹中！",
    
    styleSection: "全局设置",
    labelTitleScale: "全局标题大小",
    labelBodyScale: "全局正文大小",
    labelSpacingScale: "间距",
    labelColor: "默认颜色",
    labelFont: "默认字体",

    selectedLabel: "正在编辑选中元素:",
    noSelection: "请点击屏幕上的文字进行修改",

    saveTheDate: "诚挚邀请",
    ourStory: "我们的故事",
    gallery: "幸福瞬间",
    whenWhere: "时间与地点",
    rsvpTitle: "诚挚邀请您的光临",
    rsvpNamePlaceholder: "您的姓名",
    rsvpGuestsPlaceholder: "出席人数",
    rsvpWishesPlaceholder: "送上祝福",
    rsvpAttend: "准时赴约",
    rsvpDecline: "遗憾缺席",
    rsvpSubmit: "提交回执",
    rsvpSuccess: "收到！感谢您的祝福！",
    rsvpError: "发送失败，请稍后重试",
    
    navGoogle: "谷歌地图",
    navWaze: "Waze 导航",

    aiStoryPrompt: "为新郎[GROOM]和新娘[BRIDE]写一段简短动人的爱情故事（60字以内）。",
    btnGenerateStory: "AI 生成故事",
  }
};

export const FONT_OPTIONS: Record<Language, Record<FontStyle, string>> = {
  zh: {
    serif: '宋体 (Songti)',
    sans: '黑体 (Heiti)',
    handwriting: '书法 (Calligraphy)',
    display: '行楷 (Xingkai)'
  },
  en: {
    serif: 'Serif (Elegant)',
    sans: 'Sans (Modern)',
    handwriting: 'Script (Vibes)',
    display: 'Display (Luxury)'
  }
};

export const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1522673607200-1645062ac2d0?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1532712938310-34cb3958d42d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1520854221256-17451cc330e7?auto=format&fit=crop&q=80&w=800"
];

// Cute sticker assets
export const STICKER_ASSETS = [
  { name: "Couple A", url: "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" }, // Groom
  { name: "Couple B", url: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png" }, // Bride
  { name: "Heart", url: "https://cdn-icons-png.flaticon.com/512/2530/2530867.png" },
  { name: "Rings", url: "https://cdn-icons-png.flaticon.com/512/2659/2659356.png" },
  { name: "Balloon", url: "https://cdn-icons-png.flaticon.com/512/2454/2454269.png" }
];

/**
 * Helper to resolve assets from the public folder or external URLs.
 * If url starts with http/https/data, use as is.
 * Otherwise, treat it as a file in the public root.
 */
export const resolveAssetUrl = (url: string) => {
  if (!url) return '';
  
  let finalUrl = url.trim();

  // Fix common GitHub raw file issue
  if (finalUrl.includes('github.com') && finalUrl.includes('/blob/')) {
    finalUrl = finalUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  }

  // If it's a full URL, return as is
  if (finalUrl.startsWith('http') || finalUrl.startsWith('data:') || finalUrl.startsWith('blob:')) {
    return finalUrl;
  }
  
  // Handle local files (relative paths)
  // Remove leading slash for cleaner processing
  const cleanPath = finalUrl.startsWith('/') ? finalUrl.slice(1) : finalUrl;
  
  // Encode URI components to handle Chinese characters (e.g., "歌名.mp3" -> "%E6%AD%8C%E5%90%8D.mp3")
  // We split by '/' to ensure we encode filenames but not the path separators
  const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  
  return `/${encodedPath}`;
};
