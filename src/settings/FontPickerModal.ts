/**
 * 稿纸工坊 - 系统字体选择器
 * PaperCraft - System Font Picker
 *
 * 字体来源有两条路径：
 * 1. Font Access API（Chromium 103+）：可直接枚举本机已安装的全部字体，需要用户授权。
 * 2. 内置候选清单 + Canvas 宽度比对检测：无需任何权限，跨平台可用，作为降级方案。
 */

import { App, SuggestModal } from 'obsidian';
import { FONT_PRESETS } from '../data/Defaults';

/** 单条字体信息 */
export interface FontItem {
  /** CSS font-family 使用的字体名 */
  family: string;
  /** 是否检测到本机已安装 */
  installed: boolean;
  /** 是否为最近使用过的字体 */
  pinned: boolean;
}

/** 字体枚举来源模式 */
export type FontEnumerationMode = 'font-access' | 'builtin';

/** 枚举结果 */
export interface FontEnumerationResult {
  mode: FontEnumerationMode;
  /** 已去重、排序后的字体名列表 */
  fonts: string[];
  /** 检测到已安装的数量（builtin 模式下才有意义） */
  installedCount: number;
}

/** Font Access API 的单条字体数据（非 TS 标准库，需自行声明） */
interface FontDataEntry {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
}

/** 带 fonts 扩展的 Navigator 声明，避免使用 any 类型 */
interface FontAccessNavigator {
  fonts?: {
    query(options?: { persistentAccess?: boolean }): Promise<FontDataEntry[]>;
  };
}

/**
 * 内置候选字体清单（覆盖 macOS / Windows / Linux 常见中英文字体）
 * 仅在 Font Access API 不可用时作为兜底使用。
 */
const EXTRA_FONT_CANDIDATES: string[] = [
  // ---- 京华系 / 老宋（用户常用） ----
  'KingHwaOldSong-GB', 'KingHwaOldSong', 'KingHwaSong', '京華老宋',

  // ---- macOS 中文 ----
  'PingFang SC', 'PingFang TC', 'PingFang HK', 'Songti SC', 'Songti TC',
  'Heiti SC', 'Heiti TC', 'Kaiti SC', 'Kaiti TC', 'Yuanti SC',
  'Libian SC', 'Wawati SC', 'Hanzipen SC', 'Hannotate SC', 'Baoli SC',
  'Xingkai SC', 'Lantinghei SC', 'Lantingxihei', 'Hiragino Sans GB',
  'Hiragino Mincho ProN', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN',
  'Osaka', 'Osaka-Mono', 'Yu Mincho', 'Yu Gothic', 'Meiryo',

  // ---- macOS 西文 ----
  'SF Pro Text', 'SF Pro Display', 'SF Mono', 'New York', 'Helvetica Neue',
  'Helvetica', 'Times', 'Geneva', 'Monaco', 'Menlo', 'Lucida Grande',
  'Avenir', 'Avenir Next', 'Futura', 'Gill Sans', 'Optima', 'Baskerville',
  'Didot', 'Copperplate', 'Hoefler Text', 'Skia', 'Chalkboard', 'Chalkboard SE',
  'Marker Felt', 'Apple Chancery', 'Bradley Hand', 'Brush Script MT',
  'American Typewriter', 'Zapfino', 'Chicago', 'Charcoal', 'Palatino',

  // ---- Windows 中文 ----
  'Microsoft YaHei', 'Microsoft YaHei Light', 'Microsoft YaHei UI',
  'SimSun', 'NSimSun', 'SimHei', 'KaiTi', 'FangSong', 'YouYuan', 'LiSu',
  'STXinwei', 'STLiti', 'STHupo', 'STCaiyun', 'STBaoli', 'STYuanti',
  'FZShuTi', 'FZYaoti', 'FZKaiti', 'FZHeiTi', 'FZSongTi', 'FZFangSong',
  'FZLanTingHei', 'FZLanTingKai', 'FZXiaoBiaoSong', 'FZDaBiaoSong',
  'MingLiU', 'PMingLiU', 'DFKai-SB', 'KaiU', 'SimSun-ExtB',
  'MingLiU-ExtB', 'PMingLiU-ExtB', 'Malgun Gothic', 'Microsoft JhengHei',

  // ---- Windows 西文 ----
  'Segoe UI', 'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Black',
  'Segoe Script', 'Segoe Print', 'Calibri', 'Cambria', 'Candara', 'Consolas',
  'Constantia', 'Corbel', 'Franklin Gothic Medium', 'Gabriola', 'Impact',
  'Century', 'Century Gothic', 'Bookman Old Style', 'Rockwell', 'Perpetua',
  'Tw Cen MT', 'Gill Sans MT', 'Arial Rounded MT Bold', 'Bahnschrift',
  'Sitka', 'Ebrima', 'Nirmala UI', 'Leelawadee UI', 'Comic Sans MS',
  'Arial', 'Arial Black', 'Arial Narrow', 'Verdana', 'Tahoma',
  'Trebuchet MS', 'Courier New', 'Georgia', 'Times New Roman',
  'Palatino Linotype', 'Book Antiqua', 'Garamond', 'MS Gothic', 'MS Mincho',

  // ---- Linux / 开源字体 ----
  'Noto Sans', 'Noto Serif', 'Noto Sans Mono', 'Noto Sans SC', 'Noto Serif SC',
  'Noto Sans TC', 'Noto Serif TC', 'Noto Sans JP', 'Noto Serif JP',
  'Noto Sans KR', 'Noto Serif KR', 'Noto Sans CJK SC', 'Noto Serif CJK SC',
  'Source Han Sans SC', 'Source Han Serif SC', 'Source Sans Pro',
  'Source Serif Pro', 'DejaVu Sans', 'DejaVu Serif', 'DejaVu Sans Mono',
  'Liberation Sans', 'Liberation Serif', 'Liberation Mono', 'Ubuntu',
  'Ubuntu Mono', 'FreeSans', 'FreeSerif', 'FreeMono', 'Droid Sans',
  'Droid Serif', 'Roboto', 'Roboto Mono', 'Roboto Slab', 'Open Sans',
  'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Inter', 'Poppins',
  'Nunito', 'Work Sans', 'Fira Sans', 'Fira Code', 'JetBrains Mono',
  'Cascadia Code', 'Cascadia Mono', 'Inconsolata', 'IBM Plex Sans',
  'IBM Plex Serif', 'IBM Plex Mono', 'Merriweather', 'Playfair Display',
  'Lora', 'Crimson Text', 'EB Garamond', 'Spectral', 'Alegreya',
  'Cormorant', 'Josefin Sans', 'Karla', 'Rubik', 'Quicksand', 'Archivo',
  'Manrope', 'Space Grotesk', 'Space Mono', 'DM Sans', 'DM Serif Display',
  'Bitter', 'Arimo', 'Tinos', 'Cousine', 'Pacifico', 'Dancing Script',
  'Lobster', 'Permanent Marker', 'Anton', 'Bebas Neue', 'Orbitron',
  'VT323', 'Press Start 2P', 'Kanit', 'Prompt', 'Sarabun',
];

/** 取全部内置候选字体（预设 + 扩展清单，去重） */
export function getBuiltinFontCandidates(): string[] {
  const set = new Set<string>();
  Object.keys(FONT_PRESETS).forEach(f => set.add(f));
  EXTRA_FONT_CANDIDATES.forEach(f => set.add(f));
  return Array.from(set);
}

/** 用于宽度比对的测试串与兜底字体栈 */
const MEASURE_TEXT = 'mmmmmmmmmmlliWW@#%&';
const FALLBACK_STACK = 'monospace';
const MEASURE_SIZE = 72;

let measureCtx: CanvasRenderingContext2D | null | undefined;

/** 懒创建用于文本测量的 canvas 上下文 */
function getMeasureContext(): CanvasRenderingContext2D | null {
  if (measureCtx !== undefined) return measureCtx;
  try {
    const canvas = document.createElement('canvas');
    measureCtx = canvas.getContext('2d');
  } catch {
    measureCtx = null;
  }
  return measureCtx;
}

/**
 * 用 Canvas 文本宽度比对判断字体是否可用。
 * 说明：document.fonts.check() 对不存在的字体同样返回 true（会命中兜底字体），
 * 因此不能用来判断字体是否安装，必须用宽度比对。
 */
export function isFontInstalled(family: string): boolean {
  if (!family) return false;
  const ctx = getMeasureContext();
  if (!ctx) return true; // 无法测量时不误判为未安装

  ctx.font = `${MEASURE_SIZE}px ${FALLBACK_STACK}`;
  const baseline = ctx.measureText(MEASURE_TEXT).width;

  ctx.font = `${MEASURE_SIZE}px "${family}", ${FALLBACK_STACK}`;
  const measured = ctx.measureText(MEASURE_TEXT).width;

  return Math.abs(measured - baseline) > 0.5;
}

/** 尝试通过 Font Access API 枚举本机字体，不可用时返回 null */
async function tryFontAccess(): Promise<string[] | null> {
  try {
    const nav = navigator as Navigator & FontAccessNavigator;
    if (!nav.fonts || typeof nav.fonts.query !== 'function') return null;

    const data = await nav.fonts.query();
    if (!data || data.length === 0) return null;

    const set = new Set<string>();
    for (const entry of data) {
      const family = entry?.family;
      if (family) set.add(family);
    }
    if (set.size === 0) return null;

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  } catch {
    return null;
  }
}

/** 枚举本机可用字体：优先 Font Access API，失败则降级到内置清单检测 */
export async function enumerateSystemFonts(): Promise<FontEnumerationResult> {
  const accessFonts = await tryFontAccess();
  if (accessFonts && accessFonts.length > 0) {
    return { mode: 'font-access', fonts: accessFonts, installedCount: accessFonts.length };
  }

  const candidates = getBuiltinFontCandidates();
  const installed = candidates.filter(f => isFontInstalled(f));
  const fonts = installed.length > 0 ? installed : candidates;
  return { mode: 'builtin', fonts, installedCount: installed.length };
}

/** 字体选择器配置项 */
export interface FontPickerOptions {
  /** 最近使用的字体，会在列表中置顶 */
  recentFonts?: string[];
  /** 当前已选字体，会在列表中高亮 */
  currentFont?: string;
  /** 字体来源模式 */
  mode: FontEnumerationMode;
  /** 已安装数量（用于底部提示） */
  installedCount: number;
  /** 选中回调 */
  onChoose: (family: string) => void;
}

/** 预览示例文字 */
const PREVIEW_SAMPLE = '永 ABC abc 123';

/**
 * 系统字体选择器：支持搜索、实时预览、最近使用置顶。
 */
export class FontPickerModal extends SuggestModal<FontItem> {
  private readonly fonts: string[];
  private readonly recent: string[];
  private readonly currentFont: string;
  private readonly mode: FontEnumerationMode;
  private readonly installedCount: number;
  private readonly onPick: (family: string) => void;
  private readonly installedCache: Map<string, boolean> = new Map();
  private hintEl: HTMLElement | null = null;

  constructor(app: App, fonts: string[], options: FontPickerOptions) {
    super(app);
    this.fonts = fonts;
    this.recent = options.recentFonts ?? [];
    this.currentFont = options.currentFont ?? '';
    this.mode = options.mode;
    this.installedCount = options.installedCount;
    this.onPick = options.onChoose;

    this.setPlaceholder('搜索字体名称，例如：Songti / 楷体 / Times');
    this.setInstructions([
      { command: '↑↓', purpose: '选择字体' },
      { command: '↵', purpose: '应用该字体' },
      { command: 'esc', purpose: '取消' },
    ]);
  }

  /** 缓存检测结果，避免重复测量 */
  private checkInstalled(family: string): boolean {
    if (this.mode === 'font-access') return true;
    let cached = this.installedCache.get(family);
    if (cached === undefined) {
      cached = isFontInstalled(family);
      this.installedCache.set(family, cached);
    }
    return cached;
  }

  async getSuggestions(query: string): Promise<FontItem[]> {
    const keyword = query.trim().toLowerCase();

    const matched = keyword
      ? this.fonts.filter(f => f.toLowerCase().includes(keyword))
      : this.fonts.slice();

    const items: FontItem[] = matched.map(family => ({
      family,
      installed: this.checkInstalled(family),
      pinned: this.recent.includes(family),
    }));

    // 排序：最近使用 > 已安装 > 未安装；同级按名称
    items.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.installed !== b.installed) return a.installed ? -1 : 1;
      return a.family.localeCompare(b.family);
    });

    // 最近使用的字体始终置顶在首位序列
    const pinnedItems = items
      .filter(i => i.pinned)
      .sort((a, b) => this.recent.indexOf(a.family) - this.recent.indexOf(b.family));
    const restItems = items.filter(i => !i.pinned);

    const merged = [...pinnedItems, ...restItems];
    // 限制单次渲染数量，避免字体过多时卡顿
    return merged.slice(0, 400);
  }

  renderSuggestion(item: FontItem, el: HTMLElement): void {
    el.empty();
    el.addClass('papercraft-font-suggestion');

    const mainRow = el.createDiv({ cls: 'papercraft-font-row' });

    const nameEl = mainRow.createDiv({ cls: 'papercraft-font-label' });
    nameEl.setText(item.family);
    nameEl.style.fontFamily = `"${item.family}"`;
    if (item.family === this.currentFont) {
      nameEl.addClass('is-current');
    }

    const sampleEl = mainRow.createDiv({ cls: 'papercraft-font-sample' });
    sampleEl.setText(PREVIEW_SAMPLE);
    sampleEl.style.fontFamily = `"${item.family}"`;

    const metaRow = el.createDiv({ cls: 'papercraft-font-meta' });

    if (item.pinned) {
      metaRow.createSpan({ cls: 'papercraft-font-tag', text: '最近使用' });
    }
    if (item.family === this.currentFont) {
      metaRow.createSpan({ cls: 'papercraft-font-tag is-current-tag', text: '当前' });
    }
    if (!item.installed) {
      metaRow.createSpan({ cls: 'papercraft-font-tag is-missing', text: '未检测到' });
    }
  }

  onChooseSuggestion(item: FontItem): void {
    this.onPick(item.family);
  }

  /** 底部提示当前字体来源与数量 */
  onOpen(): void {
    super.onOpen();
    const hint = this.mode === 'font-access'
      ? `已读取本机字体库，共 ${this.installedCount} 个字体`
      : `已检测到 ${this.installedCount} 个可用字体（来源：内置清单比对；系统字体接口不可用时启用）`;

    const hintEl = this.modalEl.createDiv({ cls: 'papercraft-font-hint' });
    hintEl.setText(hint);
    this.hintEl = hintEl;
  }

  onClose(): void {
    super.onClose();
    this.hintEl?.remove();
    this.hintEl = null;
  }
}
