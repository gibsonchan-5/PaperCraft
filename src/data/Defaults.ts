/**
 * 稿纸工坊 - 默认值与防御性加载
 * PaperCraft - Defaults & Defensive Loading
 */

import type { MarginLineSettings, PaperCraftSettings } from '../data/PaperData';

export const PLUGIN_VERSION = '1.0.1';

/**
 * 装订线默认值：默认关闭
 */
export const DEFAULT_MARGIN_LINE: MarginLineSettings = {
  enabled: false,
  position: 30,
  width: 2,
  color: 'rgba(180, 50, 40, 0.4)',
};

export const DEFAULT_SETTINGS: PaperCraftSettings = {
  version: PLUGIN_VERSION,
  language: 'zh-CN',
  // 默认启用插件；但仅当用户套用模板或自定义过样式时才注入 CSS 变量，
  // 否则保持中性默认值，不覆盖用户原有主题（见 hasActiveStyle 的启用判定）
  enabled: true,
  texture: {
    type: 'none',
    textureOpacity: 0.15,
    textureScale: 1.0,
  },
  lines: {
    pattern: 'none',
    gap: 38,
    thickness: 0.5,
    color: 'rgba(100, 100, 100, 0.3)',
    marginLine: { ...DEFAULT_MARGIN_LINE },
  },
  colors: {
    paperBackground: '',
    textColor: '',
    preset: 'custom',
  },
  typography: {
    fontFamily: '',
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 1.6,
    paragraphSpacing: 0,
    pageMargin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  drawing: {
    enabled: false,
    showDrawingLayer: true,
    drawings: [],
  },
  activeTemplate: '',
  recentFonts: [],
};

/**
 * 判断配置里是否存在「实际会生效」的样式。
 * 用于两处：
 * 1. 注入 CSS 前的启用判定 —— 仅当存在非中性默认样式时才注入，
 *    否则保持中性默认值，不覆盖用户原有主题字体/配色；
 * 2. 升级旧版 data.json（没有 enabled 字段）时推断启用状态，
 *    避免老用户升级后已经应用到笔记的样式突然消失。
 */
export function hasActiveStyle(saved: Partial<PaperCraftSettings>): boolean {
  if (saved.activeTemplate) return true;

  const d = DEFAULT_SETTINGS;

  if (saved.texture?.type && saved.texture.type !== d.texture.type) return true;
  if (saved.lines?.pattern && saved.lines.pattern !== d.lines.pattern) return true;
  if (saved.lines?.marginLine?.enabled) return true;
  if (saved.colors?.paperBackground) return true;
  if (saved.colors?.textColor) return true;
  if (saved.colors?.preset && saved.colors.preset !== 'custom') return true;

  const t = saved.typography;
  if (t) {
    if (t.fontFamily) return true;
    if (t.fontSize !== undefined && t.fontSize !== d.typography.fontSize) return true;
    if (t.lineHeight !== undefined && t.lineHeight !== d.typography.lineHeight) return true;
    if (t.letterSpacing !== undefined && t.letterSpacing !== d.typography.letterSpacing) return true;
    if (t.paragraphSpacing !== undefined && t.paragraphSpacing !== d.typography.paragraphSpacing) return true;
    const pm = t.pageMargin;
    if (pm && (pm.top || pm.right || pm.bottom || pm.left)) return true;
  }

  return false;
}

/**
 * 确保 settings 包含所有必需字段
 * 如果 data.json 损坏或缺少字段，自动补全默认值
 */
export function ensureCompleteSettings(saved: Partial<PaperCraftSettings> | null): PaperCraftSettings {
  if (!saved) {
    return { ...DEFAULT_SETTINGS };
  }

  return {
    version: saved.version || PLUGIN_VERSION,
    language: saved.language || DEFAULT_SETTINGS.language,
    // 升级兼容：旧 data.json 没有 enabled 字段时，按是否自定义过样式推断
    // - 已自定义过（模板/纹理/线条/颜色/排版）：保持启用，避免老用户样式突然消失
    // - 全新安装或未自定义：默认关闭，插件启动后不改变用户原有主题
    enabled: saved.enabled !== undefined ? saved.enabled : hasActiveStyle(saved),
    texture: {
      ...DEFAULT_SETTINGS.texture,
      ...(saved.texture || {}),
    },
    lines: {
      ...DEFAULT_SETTINGS.lines,
      ...(saved.lines || {}),
      marginLine: {
        ...DEFAULT_MARGIN_LINE,
        ...((saved.lines || {}).marginLine || {}),
      },
    },
    colors: {
      ...DEFAULT_SETTINGS.colors,
      ...(saved.colors || {}),
    },
    typography: {
      ...DEFAULT_SETTINGS.typography,
      ...(saved.typography || {}),
      pageMargin: {
        ...DEFAULT_SETTINGS.typography.pageMargin,
        ...((saved.typography || {}).pageMargin || {}),
      },
    },
  drawing: {
    ...DEFAULT_SETTINGS.drawing,
    ...(saved.drawing || {}),
    drawings: (saved.drawing || {}).drawings || [],
  },
  activeTemplate: saved.activeTemplate || '',
  recentFonts: Array.isArray(saved.recentFonts) ? saved.recentFonts.slice(0, 10) : [],
};
}

/**
 * 颜色预设定义
 */
export const COLOR_PRESETS = {
  'pure-white': { background: '#FFFFFF', text: '#1A1A1A' },
  'eye-protection': { background: '#CCE8CF', text: '#2D4A32' },
  'light-pink': { background: '#F8E7E7', text: '#5A3040' },
  'antique-paper': { background: '#F5ECD6', text: '#4A3A2A' },
  'light-blue': { background: '#E3F2FD', text: '#1A3A5A' },
  'light-yellow': { background: '#FFF8E1', text: '#4A3A1A' },
  'custom': { background: '', text: '' },
};

/**
 * 字体预设定义（中文字体 + 英文字体）
 */
export const FONT_PRESETS = {
  // 中文宋体类
  'SimSun': '宋体 (SimSun)',
  'STSong': '华文宋体 (STSong)',
  'Songti SC': '宋体-简 (Songti SC)',
  'NSimSun': '新宋体 (NSimSun)',
  'SimSun-ExtB': '宋体-ExtB (SimSun-ExtB)',
  'FZSongti-B01S': '方正宋体 (FZSongti)',
  'Source Han Serif SC': '思源宋体 (Source Han Serif SC)',
  'Noto Serif CJK SC': '思源宋体 (Noto Serif CJK SC)',
  
  // 中文仿宋类
  'FangSong': '仿宋 (FangSong)',
  'STFangsong': '华文仿宋 (STFangsong)',
  'FZFangsong-Z02': '方正仿宋 (FZFangsong)',
  
  // 中文黑体类
  'Microsoft YaHei': '微软雅黑 (Microsoft YaHei)',
  'SimHei': '黑体 (SimHei)',
  'STHeiti': '华文黑体 (STHeiti)',
  'Source Han Sans SC': '思源黑体 (Source Han Sans SC)',
  'Noto Sans CJK SC': '思源黑体 (Noto Sans CJK SC)',
  'PingFang SC': '苹方-简 (PingFang SC)',
  'Hiragino Sans GB': '冬青黑体 (Hiragino Sans GB)',
  
  // 中文楷体类
  'KaiTi': '楷体 (KaiTi)',
  'STKaiti': '华文楷体 (STKaiti)',
  'FZKaiti-Z04': '方正楷体 (FZKaiti)',
  'AR PL UKai CN': '文泉驿正黑 (AR PL UKai CN)',
  
  // 中文其他
  'STXihei': '华文细黑 (STXihei)',
  'LiSu': '隶书 (LiSu)',
  'YouYuan': '幼圆 (YouYuan)',
  'STXingkai': '华文行楷 (STXingkai)',
  'STXinwei': '华文新魏 (STXinwei)',
  
  // 英文经典
  'Times New Roman': 'Times New Roman',
  'Georgia': 'Georgia',
  'Arial': 'Arial',
  'Helvetica': 'Helvetica',
  'Helvetica Neue': 'Helvetica Neue',
  'Verdana': 'Verdana',
  'Tahoma': 'Tahoma',
  'Trebuchet MS': 'Trebuchet MS',
  'Lucida Console': 'Lucida Console',
  'Courier New': 'Courier New',
  'Garamond': 'Garamond',
  'Palatino': 'Palatino',
  'Book Antiqua': 'Book Antiqua',
};
