/**
 * 稿纸工坊 - 系统字体选择器
 * PaperCraft - System Font Picker
 *
 * 字体来源有两条路径：
 * 1. Local Font Access API（Chromium 103+）。注意正式入口是 `window.queryLocalFonts()`，
 *    早期草案中的 `navigator.fonts.query()` 在正式版里并不存在，两者都要探测。
 *    该接口可直接枚举本机全部字族，精确且不依赖内置清单。
 * 2. 内置候选清单 + Canvas 文本宽度比对。接口不可用时启用。
 *    宽度比对存在固有误差（等宽字体与系统别名都容易误判），因此检测结果
 *    只用于排序与标注，绝不作为过滤条件——否则会把真实存在的字体误删。
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
  /** 是否为用户直接输入、不在候选清单内的名称 */
  custom?: boolean;
}

/** 字体枚举来源模式 */
export type FontEnumerationMode = 'font-access' | 'builtin';

/** 枚举结果 */
export interface FontEnumerationResult {
  mode: FontEnumerationMode;
  /** 去重、排序后的字体名列表（builtin 模式下为完整候选清单，不做过滤） */
  fonts: string[];
  /** 检测为已安装的字体集合（font-access 模式下等于 fonts 全集） */
  installed: Set<string>;
  /** 已安装数量 */
  installedCount: number;
  /** 候选总数 */
  totalCount: number;
  /** 本机字体接口不可用或被拒绝时的说明，用于底部提示 */
  accessNote?: string;
}

/** Local Font Access API 的单条字体数据（非 TS 标准库，需自行声明） */
interface LocalFontData {
  family: string;
  fullName?: string;
  postscriptName?: string;
  style?: string;
}

/** 正式入口：window.queryLocalFonts() */
interface LocalFontAccessWindow {
  queryLocalFonts?: (options?: { postscriptNames?: string[] }) => Promise<LocalFontData[]>;
}

/** 早期草案入口：navigator.fonts.query()，仍有部分 Chromium 变体保留 */
interface FontAccessNavigator {
  fonts?: {
    query(options?: { persistentAccess?: boolean }): Promise<LocalFontData[]>;
  };
}

/**
 * 内置候选字体清单（覆盖 macOS / Windows / Linux 常见中英文字体）
 * 仅在本机字体接口不可用时作为兜底使用。
 */
const EXTRA_FONT_CANDIDATES: string[] = [
  // ---- 京华老宋体系列（华文排印常用字形） ----
  'KingHwaOldSong-GB', 'KingHwaOldSong-GJ', 'KingHwaOldSong-LT',
  'KingHwaOldSong-HK', 'KingHwaOldSong', 'KingHwaSong',

  // ---- 国内公文字体（Windows 常见） ----
  'FangSong_GB2312', 'KaiTi_GB2312', '仿宋_GB2312', '楷体_GB2312',
  '方正小标宋简体', '方正小标宋_GBK', '方正书宋简体', '方正黑体简体',
  '方正楷体简体', '方正仿宋简体', '方正大标宋简体', '华文中宋', '华文宋体',
  '华文仿宋', '华文楷体', '华文细黑', '华文黑体',

  // ---- macOS 中文 ----
  'PingFang SC', 'PingFang TC', 'PingFang HK', 'Songti SC', 'Songti TC',
  'Heiti SC', 'Heiti TC', 'Kaiti SC', 'Kaiti TC', 'Yuanti SC',
  'Libian SC', 'Wawati SC', 'Hanzipen SC', 'Hannotate SC', 'Baoli SC',
  'Xingkai SC', 'Lantinghei SC', 'Lantingxihei', 'Hiragino Sans GB',
  'Hiragino Mincho ProN', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN',
  'Osaka', 'Osaka-Mono', 'Yu Mincho', 'Yu Gothic', 'Meiryo',
  'Apple LiGothic', 'Apple LiSung', 'STHeiti', 'STSong', 'STFangsong',
  'STKaiti', 'STZhongsong', 'STXihei', 'Songti SC Black',

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

/**
 * 用于宽度比对的测试串与兜底字体栈。
 * 三条兜底基线（等宽 / 无衬线 / 衬线）必须都试：只比 monospace 会把字体宽度
 * 恰好与等宽兜底一致的字体（如 Monaco、Courier New）误判为未安装。
 */
const MEASURE_TEXTS = ['mmmmmmmmmmlliWW@#%&', '永国字體测试I1l'];
const FALLBACK_STACKS = ['monospace', 'sans-serif', 'serif'];
const MEASURE_SIZE = 72;
const WIDTH_EPSILON = 0.5;

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

/** 转义字体名中的引号与反斜杠，避免拼进 font 简写时语法出错 */
function escapeFamily(family: string): string {
  return family.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * 用 Canvas 文本宽度比对判断字体是否可用。
 * 说明：document.fonts.check() 对不存在的字体同样返回 true（会命中兜底字体），
 * 因此不能用来判断字体是否安装，必须用宽度比对。
 * 局限：系统别名（如 macOS 上的 Times）会解析到真实字体而被判定为可用，
 * 但这类名称确实能渲染出与兜底不同的字形，作为候选使用是有效的。
 */
export function isFontInstalled(family: string): boolean {
  if (!family) return false;
  const ctx = getMeasureContext();
  if (!ctx) return true; // 无法测量时不误判为未安装

  const escaped = escapeFamily(family);

  for (const stack of FALLBACK_STACKS) {
    for (const text of MEASURE_TEXTS) {
      ctx.font = `${MEASURE_SIZE}px ${stack}`;
      const baseline = ctx.measureText(text).width;

      ctx.font = `${MEASURE_SIZE}px "${escaped}", ${stack}`;
      const measured = ctx.measureText(text).width;

      if (Math.abs(measured - baseline) > WIDTH_EPSILON) return true;
    }
  }

  return false;
}

/**
 * 调用本机字体接口枚举字体数据。
 * 两条入口都探测：正式 API 优先，草案写法兜底。
 * 返回 data 表示接口可用，返回 null 表示接口不存在；
 * 接口存在但调用失败（如权限被拒）通过 outError 回传原因。
 */
async function queryFontData(outError: { message?: string }): Promise<LocalFontData[] | null> {
  const win = window as Window & LocalFontAccessWindow;
  let apiFound = false;

  if (typeof win.queryLocalFonts === 'function') {
    apiFound = true;
    try {
      const data = await win.queryLocalFonts();
      if (data && data.length > 0) return data;
    } catch (err) {
      outError.message = err instanceof Error ? err.message : String(err);
    }
  }

  const nav = navigator as Navigator & FontAccessNavigator;
  if (nav.fonts && typeof nav.fonts.query === 'function') {
    apiFound = true;
    try {
      const data = await nav.fonts.query();
      if (data && data.length > 0) return data;
    } catch (err) {
      outError.message = err instanceof Error ? err.message : String(err);
    }
  }

  if (!apiFound) outError.message = '';
  return null;
}

/** 尝试通过本机字体接口枚举字族；fonts 为 null 表示不可用，note 为失败原因 */
async function tryFontAccess(): Promise<{ fonts: string[] | null; note: string }> {
  const outError: { message?: string } = {};
  const data = await queryFontData(outError);
  const note = outError.message ?? '';
  if (!data) {
    return { fonts: null, note };
  }

  const set = new Set<string>();
  for (const entry of data) {
    const family = entry?.family;
    if (family) set.add(family);
  }
  if (set.size === 0) return { fonts: null, note };

  return {
    fonts: Array.from(set).sort((a, b) => a.localeCompare(b)),
    note,
  };
}

/** 枚举本机可用字体：优先本机字体接口，失败则降级到内置清单检测 */
export async function enumerateSystemFonts(): Promise<FontEnumerationResult> {
  const access = await tryFontAccess();
  if (access.fonts && access.fonts.length > 0) {
    return {
      mode: 'font-access',
      fonts: access.fonts,
      installed: new Set(access.fonts),
      installedCount: access.fonts.length,
      totalCount: access.fonts.length,
    };
  }

  const candidates = getBuiltinFontCandidates();
  const installedSet = new Set<string>();
  for (const family of candidates) {
    if (isFontInstalled(family)) installedSet.add(family);
  }

  return {
    mode: 'builtin',
    // 关键：降级路径返回完整候选清单。检测只用于排序与标注，
    // 不能把未命中的候选项整条丢弃——宽度比对会漏判真实存在的字体。
    fonts: candidates,
    installed: installedSet,
    installedCount: installedSet.size,
    totalCount: candidates.length,
    accessNote: access.note,
  };
}

/** 字体选择器配置项 */
export interface FontPickerOptions {
  /** 最近使用的字体，会在列表中置顶 */
  recentFonts?: string[];
  /** 当前已选字体，会在列表中高亮 */
  currentFont?: string;
  /** 字体来源模式 */
  mode: FontEnumerationMode;
  /** 检测为已安装的字体集合 */
  installed: Set<string>;
  /** 已安装数量（用于底部提示） */
  installedCount: number;
  /** 候选总数（用于底部提示） */
  totalCount: number;
  /** 本机字体接口不可用或被拒绝的原因 */
  accessNote?: string;
  /** 选中回调 */
  onChoose: (family: string) => void;
}

/** 预览示例文字 */
const PREVIEW_SAMPLE = '永 ABC abc 123';

/**
 * 单次渲染上限，避免字体上千时卡顿。
 *
 * 注意：这只是**我们自己**的上限。Obsidian 的 `SuggestModal` 另有一个 `limit` 字段，
 * 默认值为 100，其 `updateSuggestions()` 会在渲染前再执行一次 `slice(0, limit)`。
 * 不覆盖它的话，即使这里返回了完整字族列表，界面上也只会出现字母序的前 100 条，
 * 排在后面的字族全部不可见。因此构造函数中必须显式放宽 `this.limit`。
 */
const MAX_SUGGESTIONS = 2000;

/**
 * 系统字体选择器：支持搜索、实时预览、最近使用置顶。
 * 当输入的名称不在候选清单内时，额外提供「直接使用该名称」的兜底项，
 * 保证自装字体（候选清单不可能穷举）依然可选。
 */
export class FontPickerModal extends SuggestModal<FontItem> {
  private readonly fonts: string[];
  /** 预计算的小写名，避免每次按键都对全量字体重复 toLowerCase() */
  private readonly loweredFonts: Array<{ family: string; lower: string }>;
  private readonly fontKeys: Set<string>;
  private readonly recent: string[];
  private readonly currentFont: string;
  private readonly mode: FontEnumerationMode;
  private readonly installedSet: Set<string>;
  private readonly installedCount: number;
  private readonly totalCount: number;
  private readonly accessNote: string;
  private readonly onPick: (family: string) => void;
  private hintEl: HTMLElement | null = null;

  constructor(app: App, fonts: string[], options: FontPickerOptions) {
    super(app);
    this.fonts = fonts;
    this.loweredFonts = fonts.map(family => ({ family, lower: family.toLowerCase() }));
    this.fontKeys = new Set(this.loweredFonts.map(f => f.lower));
    this.recent = options.recentFonts ?? [];
    this.currentFont = options.currentFont ?? '';
    this.mode = options.mode;
    this.installedSet = options.installed;
    this.installedCount = options.installedCount;
    this.totalCount = options.totalCount;
    this.accessNote = options.accessNote ?? '';
    this.onPick = options.onChoose;

    // 关键：Obsidian 的 SuggestModal 默认 limit = 100，会在渲染前对建议列表做
    // slice(0, limit)。字体库动辄数百条，必须放宽，否则大量字体永远无法显示。
    this.limit = MAX_SUGGESTIONS;

    this.setPlaceholder('搜索字体名称，例如：KingHwa / 楷体 / Times');
    this.setInstructions([
      { command: '↑↓', purpose: '选择字体' },
      { command: '↵', purpose: '应用该字体' },
      { command: 'esc', purpose: '取消' },
    ]);
  }

  private checkInstalled(family: string): boolean {
    if (this.mode === 'font-access') {
      return this.fontKeys.has(family.toLowerCase());
    }
    return this.installedSet.has(family);
  }

  async getSuggestions(query: string): Promise<FontItem[]> {
    const keyword = query.trim().toLowerCase();

    const matched = keyword
      ? this.loweredFonts.filter(f => f.lower.includes(keyword)).map(f => f.family)
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

    const merged = [...pinnedItems, ...restItems].slice(0, MAX_SUGGESTIONS);

    // 输入的名称不在候选清单内时，提供唯一直选入口。
    // 仅在完全无匹配时出现：避免无匹配搜索下回车误应用一个拼错的名称。
    const typed = query.trim();
    if (typed && matched.length === 0 && !this.fontKeys.has(typed.toLowerCase())) {
      merged.push({
        family: typed,
        installed: this.checkInstalled(typed),
        pinned: false,
        custom: true,
      });
    }

    return merged;
  }

  renderSuggestion(item: FontItem, el: HTMLElement): void {
    el.empty();
    el.addClass('papercraft-font-suggestion');

    const mainRow = el.createDiv({ cls: 'papercraft-font-row' });

    const nameEl = mainRow.createDiv({ cls: 'papercraft-font-label' });
    nameEl.setText(item.family);
    if (!item.custom) {
      nameEl.style.fontFamily = `"${item.family}"`;
    }
    if (item.family === this.currentFont) {
      nameEl.addClass('is-current');
    }

    const sampleEl = mainRow.createDiv({ cls: 'papercraft-font-sample' });
    sampleEl.setText(item.custom ? '按输入的名称使用' : PREVIEW_SAMPLE);
    if (!item.custom) {
      sampleEl.style.fontFamily = `"${item.family}"`;
    }

    const metaRow = el.createDiv({ cls: 'papercraft-font-meta' });

    if (item.pinned) {
      metaRow.createSpan({ cls: 'papercraft-font-tag', text: '最近使用' });
    }
    if (item.family === this.currentFont) {
      metaRow.createSpan({ cls: 'papercraft-font-tag is-current-tag', text: '当前' });
    }
    if (item.custom) {
      metaRow.createSpan({ cls: 'papercraft-font-tag is-custom', text: '清单外名称' });
    } else if (!item.installed) {
      metaRow.createSpan({ cls: 'papercraft-font-tag is-missing', text: '未检测到' });
    }
  }

  onChooseSuggestion(item: FontItem): void {
    this.onPick(item.family);
  }

  /** 底部提示当前字体来源与数量 */
  onOpen(): void {
    super.onOpen();
    const parts: string[] = [];

    if (this.mode === 'font-access') {
      parts.push(`已读取本机字体库，共 ${this.installedCount} 个字族`);
    } else {
      const reason = this.accessNote
        ? `本机字体接口调用失败：${this.accessNote}`
        : '本机字体接口不可用';
      parts.push(`已检测到 ${this.installedCount} / ${this.totalCount} 个候选字体（${reason}，当前为内置清单宽度比对结果，仅供参考）`);
    }

    if (this.fonts.length > MAX_SUGGESTIONS) {
      parts.push(`共 ${this.fonts.length} 个字体，列表最多显示前 ${MAX_SUGGESTIONS} 项，可用搜索缩小范围`);
    }

    const hintEl = this.modalEl.createDiv({ cls: 'papercraft-font-hint' });
    hintEl.setText(parts.join('；'));
    this.hintEl = hintEl;
  }

  onClose(): void {
    super.onClose();
    this.hintEl?.remove();
    this.hintEl = null;
  }
}
