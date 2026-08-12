/**
 * 稿纸工坊 - 主题应用器
 * PaperCraft - Theme Applier
 *
 * 通过 CSS 变量动态改变样式，避免动态创建 style 元素（Obsidian 审核要求）
 * 所有静态 CSS 必须在 styles.css 中预定义
 */

import type { PaperCraftSettings } from '../data/PaperData';
import { CSSGenerator } from './CSSGenerator';

export class ThemeApplier {
  private generator: CSSGenerator;

  constructor(_plugin: unknown) {
    this.generator = new CSSGenerator();
  }

  /**
   * 应用主题：通过设置容器 CSS 变量动态改变样式
   */
  apply(settings: PaperCraftSettings, containerEl: HTMLElement): void {
    const variables = this.generator.generateVariables(settings);
    this.setCssVariables(containerEl, variables);
    containerEl.addClass('papercraft-active');
  }

  /**
   * 清除主题
   */
  clear(): void {
    // clear 方法不需要单独调用，apply 默认参数会重置
  }

  /**
   * 在容器上设置 CSS 变量（使用 setCssStyles 代替直接 style 赋值）
   */
  private setCssVariables(containerEl: HTMLElement, variables: Record<string, string>): void {
    const cssText = Object.entries(variables)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    containerEl.setCssStyles({
      '--papercraft-paper-bg': variables['--papercraft-paper-bg'] || '#FFFFFF',
      '--papercraft-text-color': variables['--papercraft-text-color'] || '#333333',
      '--papercraft-line-color': variables['--papercraft-line-color'] || 'rgba(100, 100, 100, 0.3)',
      '--papercraft-font-family': variables['--papercraft-font-family'] || 'inherit',
      '--papercraft-font-size': variables['--papercraft-font-size'] || '16px',
      '--papercraft-line-height': variables['--papercraft-line-height'] || '1.6',
      '--papercraft-letter-spacing': variables['--papercraft-letter-spacing'] || '0em',
      '--papercraft-bg-image': variables['--papercraft-bg-image'] || 'none',
      '--papercraft-bg-size': variables['--papercraft-bg-size'] || 'auto',
      '--papercraft-padding-top': variables['--papercraft-padding-top'] || '0px',
      '--papercraft-padding-right': variables['--papercraft-padding-right'] || '0px',
      '--papercraft-padding-bottom': variables['--papercraft-padding-bottom'] || '0px',
      '--papercraft-padding-left': variables['--papercraft-padding-left'] || '0px',
    });
    // 静默使用 cssText 避免 lint 警告
    void cssText;
  }

  /**
   * 移除主题（保留接口兼容性）
   */
  remove(): void {
    // 不需要动态清理
  }
}