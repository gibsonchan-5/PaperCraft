/**
 * 稿纸工坊 - 主题应用器
 * PaperCraft - Theme Applier
 */

import type PaperCraftPlugin from '../main';
import type { PaperCraftSettings } from '../data/PaperData';
import { CSSGenerator } from './CSSGenerator';

export class ThemeApplier {
  private plugin: PaperCraftPlugin;
  private generator: CSSGenerator;
  private styleEl: HTMLStyleElement | null = null;

  constructor(plugin: PaperCraftPlugin) {
    this.plugin = plugin;
    this.generator = new CSSGenerator();
  }

  /**
   * 应用主题到当前活动视图
   */
  apply(settings: PaperCraftSettings): void {
    const css = this.generator.generate(settings);
    this.injectCSS(css);
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
    // 移除旧样式
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
    // 使用 plugin.addStyle 添加新样式（Obsidian 推荐方式）
    // addStyle 返回 HTMLStyleElement 或 CSSStyleSheet，统一转为 HTMLStyleElement
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
