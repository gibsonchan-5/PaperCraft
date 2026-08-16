/**
 * 稿纸工坊 - 模板管理器
 * PaperCraft - Template Manager
 */

import type { PaperTemplate } from '../data/PaperData';
import type PaperCraftPlugin from '../../main';

export class TemplateManager {
  private plugin: PaperCraftPlugin;
  private builtinTemplates: PaperTemplate[] = [];
  private userTemplates: PaperTemplate[] = [];

  constructor(plugin: PaperCraftPlugin) {
    this.plugin = plugin;
    this.loadBuiltinTemplates();
    this.loadUserTemplates();
  }

  private loadBuiltinTemplates(): void {
    this.builtinTemplates = [
      // ===== 白天主题 =====
      {
        id: 'moon-white',
        name: '月白',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 38, thickness: 0.5, color: 'rgba(180, 195, 220, 0.30)' },
          colors: { paperBackground: '#F0F3F8', textColor: '#2C3E50', preset: 'custom' },
          typography: { fontFamily: 'KaiTi', fontSize: 20, letterSpacing: 0.02, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 30, right: 40, bottom: 30, left: 60 } },
        },
      },
      {
        id: 'star-dot',
        name: '星点',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 28, thickness: 1.5, color: 'rgba(155, 150, 140, 0.20)' },
          colors: { paperBackground: '#F7F5F0', textColor: '#4A4A3A', preset: 'custom' },
          typography: { fontFamily: 'STKaiti', fontSize: 20, letterSpacing: 0.03, lineHeight: 1.7, paragraphSpacing: 10, pageMargin: { top: 35, right: 45, bottom: 35, left: 55 } },
        },
      },
      {
        id: 'mint-shadow',
        name: '薄荷碎影',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 36, thickness: 0.6, color: 'rgba(100, 180, 140, 0.28)' },
          colors: { paperBackground: '#E8F5E9', textColor: '#2D4A32', preset: 'custom' },
          typography: { fontFamily: 'Microsoft YaHei', fontSize: 20, letterSpacing: 0.01, lineHeight: 1.75, paragraphSpacing: 14, pageMargin: { top: 32, right: 38, bottom: 32, left: 58 } },
        },
      },
      {
        id: 'old-book-grid',
        name: '旧卷星砂',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 32, thickness: 1.0, color: 'rgba(139, 90, 43, 0.18)' },
          colors: { paperBackground: '#F5ECD6', textColor: '#4A3A2A', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 21, letterSpacing: 0.05, lineHeight: 1.65, paragraphSpacing: 8, pageMargin: { top: 40, right: 50, bottom: 40, left: 65 } },
        },
      },
      {
        id: 'rose-letter',
        name: '落英缤纷',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 38, thickness: 1.2, color: 'rgba(200, 120, 140, 0.22)' },
          colors: { paperBackground: '#FFF8F2', textColor: '#5A3040', preset: 'custom' },
          typography: { fontFamily: 'KaiTi', fontSize: 20, letterSpacing: 0.04, lineHeight: 1.9, paragraphSpacing: 16, pageMargin: { top: 38, right: 55, bottom: 38, left: 75 } },
        },
      },
      {
        id: 'sky-blue-grid',
        name: '晴空碎玉',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 30, thickness: 1.2, color: 'rgba(86, 170, 225, 0.22)' },
          colors: { paperBackground: '#E3F2FD', textColor: '#1A3A5A', preset: 'custom' },
          typography: { fontFamily: 'PingFang SC', fontSize: 20, letterSpacing: 0.02, lineHeight: 1.7, paragraphSpacing: 10, pageMargin: { top: 34, right: 42, bottom: 34, left: 62 } },
        },
      },
      {
        id: 'bean-green',
        name: '莲叶田田',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 40, thickness: 0.5, color: 'rgba(100, 140, 110, 0.30)' },
          colors: { paperBackground: '#CCE8CF', textColor: '#2D4A32', preset: 'custom' },
          typography: { fontFamily: 'STFangsong', fontSize: 20, letterSpacing: 0.03, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 36, right: 48, bottom: 36, left: 68 } },
        },
      },
      {
        id: 'pure-white-grid',
        name: '素笺白露',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 28, thickness: 1.0, color: 'rgba(180, 180, 180, 0.15)' },
          colors: { paperBackground: '#FFFFFF', textColor: '#1A1A1A', preset: 'custom' },
          typography: { fontFamily: 'Microsoft YaHei', fontSize: 20, letterSpacing: 0.01, lineHeight: 1.6, paragraphSpacing: 8, pageMargin: { top: 30, right: 40, bottom: 30, left: 60 } },
        },
      },
      {
        id: 'ink-blue-lines',
        name: '窗外麻雀',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 36, thickness: 0.6, color: 'rgba(30, 50, 90, 0.32)' },
          colors: { paperBackground: '#D6E8F5', textColor: '#1A3050', preset: 'custom' },
          typography: { fontFamily: 'STFangsong', fontSize: 20, letterSpacing: 0.02, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 34, right: 44, bottom: 34, left: 64 } },
        },
      },
      {
        id: 'light-purple-grid',
        name: '淡紫微雨',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 32, thickness: 1.2, color: 'rgba(150, 120, 180, 0.20)' },
          colors: { paperBackground: '#F3E5F5', textColor: '#4A148C', preset: 'custom' },
          typography: { fontFamily: 'KaiTi', fontSize: 20, letterSpacing: 0.03, lineHeight: 1.75, paragraphSpacing: 10, pageMargin: { top: 36, right: 46, bottom: 36, left: 66 } },
        },
      },
      {
        id: 'charcoal-dots',
        name: '炭灰星点',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 30, thickness: 1.0, color: 'rgba(100, 100, 100, 0.20)' },
          colors: { paperBackground: '#F5F5F5', textColor: '#212121', preset: 'custom' },
          typography: { fontFamily: 'STKaiti', fontSize: 20, letterSpacing: 0.02, lineHeight: 1.7, paragraphSpacing: 9, pageMargin: { top: 34, right: 44, bottom: 34, left: 64 } },
        },
      },
      {
        id: 'warm-yellow',
        name: '暖黄流光',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 34, thickness: 1.2, color: 'rgba(180, 140, 80, 0.22)' },
          colors: { paperBackground: '#FFF8E1', textColor: '#4A3A1A', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 21, letterSpacing: 0.04, lineHeight: 1.75, paragraphSpacing: 11, pageMargin: { top: 38, right: 50, bottom: 38, left: 70 } },
        },
      },
      {
        id: 'peach-paper',
        name: '桃花拾遗',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 40, thickness: 1.2, color: 'rgba(220, 120, 140, 0.20)' },
          colors: { paperBackground: '#FCE4EC', textColor: '#880E4F', preset: 'custom' },
          typography: { fontFamily: 'STFangsong', fontSize: 20, letterSpacing: 0.04, lineHeight: 1.9, paragraphSpacing: 16, pageMargin: { top: 40, right: 55, bottom: 40, left: 75 } },
        },
      },
      {
        id: 'green-fat-red-thin',
        name: '绿肥红瘦',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 38, thickness: 0.6, color: 'rgba(90, 160, 100, 0.28)' },
          colors: { paperBackground: '#E8F5E9', textColor: '#7B2D5E', preset: 'custom' },
          typography: { fontFamily: 'STKaiti', fontSize: 20, letterSpacing: 0.03, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 34, right: 48, bottom: 34, left: 66 } },
        },
      },
      {
        id: 'snow-goose-tracks',
        name: '雪泥鸿爪',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 34, thickness: 1.0, color: 'rgba(160, 130, 100, 0.20)' },
          colors: { paperBackground: '#F0EDE8', textColor: '#4A4030', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 20, letterSpacing: 0.04, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 36, right: 50, bottom: 36, left: 68 } },
        },
      },
      {
        id: 'zen-garden',
        name: '禅房花木',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'xuan', textureOpacity: 0.08, textureScale: 1 },
          lines: { pattern: 'vertical', gap: 38, thickness: 0.5, color: 'rgba(120, 140, 100, 0.25)' },
          colors: { paperBackground: '#F5F0E0', textColor: '#3A4A2A', preset: 'custom' },
          typography: { fontFamily: 'STFangsong', fontSize: 21, letterSpacing: 0.04, lineHeight: 1.85, paragraphSpacing: 14, pageMargin: { top: 40, right: 55, bottom: 40, left: 75 } },
        },
      },
      {
        id: 'ancient-vertical',
        name: '埋首故纸',
        category: 'builtin',
        mode: 'day',
        settings: {
          texture: { type: 'xuan', textureOpacity: 0.12, textureScale: 1 },
          lines: { pattern: 'vertical', gap: 36, thickness: 0.4, color: 'rgba(120, 100, 80, 0.30)' },
          colors: { paperBackground: '#EDE4CE', textColor: '#3E2723', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 21, letterSpacing: 0.06, lineHeight: 1.8, paragraphSpacing: 10, pageMargin: { top: 45, right: 60, bottom: 45, left: 80 } },
        },
      },
      // ===== 夜间主题 =====
      {
        id: 'bridge-night-frost',
        name: '板桥夜霜',
        category: 'builtin',
        mode: 'night',
        settings: {
          texture: { type: 'concrete', textureOpacity: 0.08, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 38, thickness: 0.5, color: 'rgba(200, 210, 220, 0.20)' },
          colors: { paperBackground: '#1E2A3A', textColor: '#B8C8D8', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 20, letterSpacing: 0.03, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 34, right: 48, bottom: 34, left: 66 } },
        },
      },
      {
        id: 'moon-bright-stars',
        name: '冬夜旅人',
        category: 'builtin',
        mode: 'night',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 40, thickness: 1.0, color: 'rgba(200, 200, 220, 0.25)' },
          colors: { paperBackground: '#1A1E2E', textColor: '#C0C8D8', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 20, letterSpacing: 0.03, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 34, right: 48, bottom: 34, left: 66 } },
        },
      },
      {
        id: 'mystic-gate',
        name: '荷塘月色',
        category: 'builtin',
        mode: 'night',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 38, thickness: 1.0, color: 'rgba(180, 200, 180, 0.20)' },
          colors: { paperBackground: '#1A2020', textColor: '#B0C8B0', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 20, letterSpacing: 0.03, lineHeight: 1.85, paragraphSpacing: 14, pageMargin: { top: 36, right: 50, bottom: 36, left: 70 } },
        },
      },
      {
        id: 'blue-sea-green-sky',
        name: '碧海青天',
        category: 'builtin',
        mode: 'night',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 42, thickness: 0.8, color: 'rgba(150, 190, 220, 0.20)' },
          colors: { paperBackground: '#1A2030', textColor: '#A8C0D8', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 20, letterSpacing: 0.03, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 34, right: 48, bottom: 34, left: 66 } },
        },
      },
    ];
  }

  private loadUserTemplates(): void {
    this.userTemplates = [];
  }

  getBuiltinTemplates(): PaperTemplate[] {
    return this.builtinTemplates;
  }

  getUserTemplates(): PaperTemplate[] {
    return this.userTemplates;
  }

  getTemplateById(id: string): PaperTemplate | undefined {
    return this.builtinTemplates.find(t => t.id === id) || 
           this.userTemplates.find(t => t.id === id);
  }

  applyTemplate(templateId: string): boolean {
    const template = this.getTemplateById(templateId);
    if (!template) return false;

    const s = template.settings;
    const settings = this.plugin.settings;

    if (s.texture) settings.texture = { ...settings.texture, ...s.texture };
    if (s.lines) settings.lines = { ...settings.lines, ...s.lines };
    if (s.colors) settings.colors = { ...settings.colors, ...s.colors };
    if (s.typography) {
      settings.typography = { ...settings.typography, ...s.typography };
      if (s.typography.pageMargin) {
        settings.typography.pageMargin = { 
          ...settings.typography.pageMargin, 
          ...s.typography.pageMargin 
        };
      }
    }

    settings.activeTemplate = templateId;
    void this.plugin.saveSettings();
    this.plugin.refreshTheme();
    return true;
  }

  addUserTemplate(template: PaperTemplate): void {
    this.userTemplates.push(template);
  }

  deleteUserTemplate(templateId: string): boolean {
    const index = this.userTemplates.findIndex(t => t.id === templateId);
    if (index === -1) return false;
    this.userTemplates.splice(index, 1);
    return true;
  }
}
