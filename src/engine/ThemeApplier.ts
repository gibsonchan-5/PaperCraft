/**
 * 稿纸工坊 - 主题应用器
 * PaperCraft - Theme Applier
 */

import type { PaperCraftSettings } from '../data/PaperData';
import { CSSGenerator } from './CSSGenerator';

export class ThemeApplier {
  private generator: CSSGenerator;
  private styleEl: HTMLStyleElement | null = null;

  constructor(_plugin: unknown) {
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
   * 注入 CSS
   */
  private injectCSS(css: string): void {
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
    const style = document.createElement('style');
    style.id = 'papercraft-dynamic-style';
    style.textContent = css;
    document.head.appendChild(style);
    this.styleEl = style;
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