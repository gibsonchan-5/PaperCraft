/**
 * 稿纸工坊 - 主题应用器
 * PaperCraft - Theme Applier
 */

import type { PaperCraftSettings } from '../data/PaperData';
import { CSSGenerator } from './CSSGenerator';

/**
 * 样式宿主接口（最小依赖）
 */
interface StyleHost {
  addStyle(content: string): HTMLStyleElement | CSSStyleSheet;
}

export class ThemeApplier {
  private plugin: StyleHost;
  private generator: CSSGenerator;
  private styleEl: HTMLStyleElement | null = null;

  constructor(plugin: StyleHost) {
    this.plugin = plugin;
    this.generator = new CSSGenerator();
  }

  /**
   * 应用主题到指定容器
   */
  apply(settings: PaperCraftSettings, containerEl: HTMLElement): void {
    const css = this.generator.generate(settings);
    this.injectCSS(css);
    containerEl.addClass('papercraft-active');
  }

  /**
   * 清除主题
   */
  clear(): void {
    const css = this.generator.clear();
    this.injectCSS(css);
  }

  /**
   * 注入 CSS（使用 Plugin.addStyle，符合 Obsidian 审核要求）
   */
  private injectCSS(css: string): void {
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
    const added = this.plugin.addStyle(css);
    if (added instanceof HTMLStyleElement) {
      this.styleEl = added;
    }
  }

  /**
   * 移除 CSS 元素
   */
  remove(): void {
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
  }
}