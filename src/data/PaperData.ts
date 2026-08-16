/**
 * 稿纸工坊 - 数据结构定义
 * PaperCraft - Data Type Definitions
 */

// 纹理类型
export type TextureType = 'none' | 'kraft' | 'xuan' | 'concrete' | 'linen';

// 线条图案
export type LinePattern = 'none' | 'horizontal' | 'vertical' | 'grid' | 'dot';

// 颜色预设
export type ColorPreset = 'custom' | 'pure-white' | 'eye-protection' | 'light-pink' | 'antique-paper' | 'light-blue' | 'light-yellow';

// 语言
export type Language = 'zh-CN' | 'en' | 'ja';

// 纹理设置
export interface TextureSettings {
  type: TextureType;
  textureOpacity: number;    // 0-1
  textureScale: number;      // 0.5-2.0
}

// 线条设置
export interface LineSettings {
  pattern: LinePattern;
  gap: number;               // 线条间距 (px)
  thickness: number;         // 线条粗细 (px)
  color: string;             // 线条颜色
}

// 颜色设置
export interface ColorSettings {
  paperBackground: string;   // 纸张背景色
  textColor: string;         // 文字颜色
  preset: ColorPreset;       // 颜色预设
}

// 页边距
export interface PageMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// 排版设置
export interface TypographySettings {
  fontFamily: string;
  fontSize: number;
  letterSpacing: number;     // em
  lineHeight: number;
  paragraphSpacing: number;  // px
  pageMargin: PageMargin;
}

// 绘图设置
export interface DrawingSettings {
  enabled: boolean;
  showDrawingLayer: boolean;
  drawings: DrawingElement[];
}

// 绘图元素
export interface DrawingElement {
  id: string;
  type: 'freehand' | 'line' | 'rect' | 'circle' | 'text';
  points: Array<{ x: number; y: number }>;
  color: string;
  lineWidth: number;
  opacity: number;
  text?: string;
  fontSize?: number;
}

// 完整设置
export interface PaperCraftSettings {
  version: string;
  language: Language;
  texture: TextureSettings;
  lines: LineSettings;
  colors: ColorSettings;
  typography: TypographySettings;
  drawing: DrawingSettings;
  activeTemplate: string;    // 当前激活的模板ID
}

// 模板设置（部分设置即可）
export interface PartialTemplateSettings {
  texture?: Partial<TextureSettings>;
  lines?: Partial<LineSettings>;
  colors?: Partial<ColorSettings>;
  typography?: Partial<TypographySettings>;
}

// 模板定义
export interface PaperTemplate {
  id: string;
  name: string;
  category: 'builtin' | 'user';
  mode?: 'day' | 'night'; // 白天/夜间模式分类
  settings: PartialTemplateSettings;
}
