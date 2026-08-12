/**
 * 稿纸工坊 - 模板管理器
 * PaperCraft - Template Manager
 */

import type { PaperTemplate } from '../data/PaperData';
import type PaperCraftPlugin from '../main';

export class TemplateManager {
  private plugin: PaperCraftPlugin;
  private builtinTemplates: PaperTemplate[] = [];
  private userTemplates: PaperTemplate[] = [];

  constructor(plugin: PaperCraftPlugin) {
    this.plugin = plugin;
    this.loadBuiltinTemplates();
    this.loadUserTemplates();
  }

  /**
   * 加载内置模板
   */
  private loadBuiltinTemplates(): void {
    this.builtinTemplates = [
      // 8 个从用户 snippets 提取的模板
      {
        id: 'moon-white',
        name: '月白',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 38, thickness: 0.5, color: 'rgba(180, 195, 220, 0.30)' },
          colors: { paperBackground: '#F0F3F8', textColor: '#2C3E50', preset: 'custom' },
          typography: { fontFamily: 'KaiTi', fontSize: 18, letterSpacing: 0.02, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 30, right: 40, bottom: 30, left: 60 } },
        },
      },
      {
        id: 'star-dot',
        name: '星点',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 28, thickness: 1.5, color: 'rgba(155, 150, 140, 0.45)' },
          colors: { paperBackground: '#F7F5F0', textColor: '#4A4A3A', preset: 'custom' },
          typography: { fontFamily: 'STKaiti', fontSize: 17, letterSpacing: 0.03, lineHeight: 1.7, paragraphSpacing: 10, pageMargin: { top: 35, right: 45, bottom: 35, left: 55 } },
        },
      },
      {
        id: 'mint-shadow',
        name: '薄荷碎影',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 36, thickness: 0.6, color: 'rgba(100, 180, 140, 0.28)' },
          colors: { paperBackground: '#E8F5E9', textColor: '#2D4A32', preset: 'custom' },
          typography: { fontFamily: 'Microsoft YaHei', fontSize: 15, letterSpacing: 0.01, lineHeight: 1.75, paragraphSpacing: 14, pageMargin: { top: 32, right: 38, bottom: 32, left: 58 } },
        },
      },
      {
        id: 'old-book-grid',
        name: '旧卷星砂',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 32, thickness: 1.0, color: 'rgba(139, 90, 43, 0.35)' },
          colors: { paperBackground: '#F5ECD6', textColor: '#4A3A2A', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 16, letterSpacing: 0.05, lineHeight: 1.65, paragraphSpacing: 8, pageMargin: { top: 40, right: 50, bottom: 40, left: 65 } },
        },
      },
      {
        id: 'rose-letter',
        name: '玫瑰落英',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 38, thickness: 1.2, color: 'rgba(200, 120, 140, 0.40)' },
          colors: { paperBackground: '#FFF8F2', textColor: '#5A3040', preset: 'custom' },
          typography: { fontFamily: 'KaiTi', fontSize: 19, letterSpacing: 0.04, lineHeight: 1.9, paragraphSpacing: 16, pageMargin: { top: 38, right: 55, bottom: 38, left: 75 } },
        },
      },
      {
        id: 'sky-blue-grid',
        name: '晴空碎玉',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 30, thickness: 1.2, color: 'rgba(86, 170, 225, 0.40)' },
          colors: { paperBackground: '#E3F2FD', textColor: '#1A3A5A', preset: 'custom' },
          typography: { fontFamily: 'PingFang SC', fontSize: 16, letterSpacing: 0.02, lineHeight: 1.7, paragraphSpacing: 10, pageMargin: { top: 34, right: 42, bottom: 34, left: 62 } },
        },
      },
      {
        id: 'bean-green',
        name: '豆沙清梦',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 40, thickness: 0.5, color: 'rgba(100, 140, 110, 0.30)' },
          colors: { paperBackground: '#CCE8CF', textColor: '#2D4A32', preset: 'custom' },
          typography: { fontFamily: 'STFangsong', fontSize: 17, letterSpacing: 0.03, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 36, right: 48, bottom: 36, left: 68 } },
        },
      },
      // 8 个新增模板
      {
        id: 'pure-white-grid',
        name: '素笺白露',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 28, thickness: 1.0, color: 'rgba(180, 180, 180, 0.30)' },
          colors: { paperBackground: '#FFFFFF', textColor: '#1A1A1A', preset: 'custom' },
          typography: { fontFamily: 'Microsoft YaHei', fontSize: 15, letterSpacing: 0.01, lineHeight: 1.6, paragraphSpacing: 8, pageMargin: { top: 30, right: 40, bottom: 30, left: 60 } },
        },
      },
      {
        id: 'ink-blue-lines',
        name: '墨蓝横线',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 36, thickness: 0.7, color: 'rgba(40, 80, 120, 0.35)' },
          colors: { paperBackground: '#F5F9FC', textColor: '#2C3E50', preset: 'custom' },
          typography: { fontFamily: 'SimSun', fontSize: 16, letterSpacing: 0.02, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 34, right: 44, bottom: 34, left: 64 } },
        },
      },
      {
        id: 'light-purple-grid',
        name: '淡紫微雨',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 32, thickness: 1.2, color: 'rgba(150, 120, 180, 0.35)' },
          colors: { paperBackground: '#F3E5F5', textColor: '#4A148C', preset: 'custom' },
          typography: { fontFamily: 'KaiTi', fontSize: 17, letterSpacing: 0.03, lineHeight: 1.75, paragraphSpacing: 10, pageMargin: { top: 36, right: 46, bottom: 36, left: 66 } },
        },
      },
      {
        id: 'mint-lines',
        name: '薄荷横线',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'horizontal', gap: 38, thickness: 0.5, color: 'rgba(80, 160, 120, 0.30)' },
          colors: { paperBackground: '#E8F5E9', textColor: '#1B5E20', preset: 'custom' },
          typography: { fontFamily: 'PingFang SC', fontSize: 16, letterSpacing: 0.02, lineHeight: 1.8, paragraphSpacing: 14, pageMargin: { top: 32, right: 42, bottom: 32, left: 62 } },
        },
      },
      {
        id: 'charcoal-dots',
        name: '炭灰星点',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 30, thickness: 1.0, color: 'rgba(100, 100, 100, 0.40)' },
          colors: { paperBackground: '#F5F5F5', textColor: '#212121', preset: 'custom' },
          typography: { fontFamily: 'STKaiti', fontSize: 15, letterSpacing: 0.02, lineHeight: 1.7, paragraphSpacing: 9, pageMargin: { top: 34, right: 44, bottom: 34, left: 64 } },
        },
      },
      {
        id: 'warm-yellow',
        name: '暖黄流光',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 34, thickness: 1.2, color: 'rgba(180, 140, 80, 0.40)' },
          colors: { paperBackground: '#FFF8E1', textColor: '#4A3A1A', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 16, letterSpacing: 0.04, lineHeight: 1.75, paragraphSpacing: 11, pageMargin: { top: 38, right: 50, bottom: 38, left: 70 } },
        },
      },
      {
        id: 'peach-paper',
        name: '桃花拾遗',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'dot', gap: 40, thickness: 1.2, color: 'rgba(220, 120, 140, 0.35)' },
          colors: { paperBackground: '#FCE4EC', textColor: '#880E4F', preset: 'custom' },
          typography: { fontFamily: 'STFangsong', fontSize: 18, letterSpacing: 0.04, lineHeight: 1.9, paragraphSpacing: 16, pageMargin: { top: 40, right: 55, bottom: 40, left: 75 } },
        },
      },
      {
        id: 'ancient-vertical',
        name: '古风遗韵',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'vertical', gap: 36, thickness: 0.4, color: 'rgba(120, 100, 80, 0.30)' },
          colors: { paperBackground: '#F5ECD6', textColor: '#3E2723', preset: 'custom' },
          typography: { fontFamily: 'STSong', fontSize: 17, letterSpacing: 0.06, lineHeight: 1.8, paragraphSpacing: 10, pageMargin: { top: 45, right: 60, bottom: 45, left: 80 } },
        },
      },
      {
        id: 'modern-minimal',
        name: '现代极简',
        category: 'builtin',
        settings: {
          texture: { type: 'none', textureOpacity: 0, textureScale: 1 },
          lines: { pattern: 'none', gap: 38, thickness: 0.5, color: 'rgba(0, 0, 0, 0)' },
          colors: { paperBackground: '#FAFAFA', textColor: '#424242', preset: 'custom' },
          typography: { fontFamily: 'Helvetica Neue', fontSize: 16, letterSpacing: 0.01, lineHeight: 1.65, paragraphSpacing: 12, pageMargin: { top: 30, right: 40, bottom: 30, left: 60 } },
        },
      },
    ];
  }

  /**
   * 加载用户自定义模板
   */
  private loadUserTemplates(): void {
    // TODO: 从 localStorage 或 data.json 加载用户模板
    this.userTemplates = [];
  }

  /**
   * 获取所有内置模板
   */
  getBuiltinTemplates(): PaperTemplate[] {
    return this.builtinTemplates;
  }

  /**
   * 获取所有用户模板
   */
  getUserTemplates(): PaperTemplate[] {
    return this.userTemplates;
  }

  /**
   * 根据 ID 获取模板
   */
  getTemplateById(id: string): PaperTemplate | undefined {
    return this.builtinTemplates.find(t => t.id === id) || 
           this.userTemplates.find(t => t.id === id);
  }

  /**
   * 应用模板（深合并）
   */
  applyTemplate(templateId: string): boolean {
    const template = this.getTemplateById(templateId);
    if (!template) {
      return false;
    }

    const s = template.settings;
    const settings = this.plugin.settings;

    // 深合并：只合并模板中实际存在的字段
    if (s.texture) {
      settings.texture = { ...settings.texture, ...s.texture };
    }
    if (s.lines) {
      settings.lines = { ...settings.lines, ...s.lines };
    }
    if (s.colors) {
      settings.colors = { ...settings.colors, ...s.colors };
    }
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

  /**
   * 添加用户模板
   */
  addUserTemplate(template: PaperTemplate): void {
    this.userTemplates.push(template);
    // TODO: 保存到 localStorage 或 data.json
  }

  /**
   * 删除用户模板
   */
  deleteUserTemplate(templateId: string): boolean {
    const index = this.userTemplates.findIndex(t => t.id === templateId);
    if (index === -1) return false;
    this.userTemplates.splice(index, 1);
    // TODO: 保存到 localStorage 或 data.json
    return true;
  }
}
