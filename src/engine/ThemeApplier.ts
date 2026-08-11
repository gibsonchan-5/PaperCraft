/**
 * 稿纸工坊 - 主题应用器
 * PaperCraft - Theme Applier
 */

import type { PaperCraftSettings } from '../data/PaperData';
import { CSSGenerator } from './CSSGenerator';

export class ThemeApplier {
  private styleEl: HTMLStyleElement | null = null;
  private generator: CSSGenerator;

  constructor() {
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
   * 注入 CSS 到文档
   */
  private injectCSS(css: string): void {
    if (!this.styleEl) {
      this.styleEl = document.createElement('style');
      this.styleEl.id = 'papercraft-theme';
      document.head.appendChild(this.styleEl);
    }
    this.styleEl.textContent = css;
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
