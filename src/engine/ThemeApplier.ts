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
   * 在容器上设置 CSS 变量
   */
  private setCssVariables(containerEl: HTMLElement, variables: Record<string, string>): void {
    Object.entries(variables).forEach(([key, value]) => {
      containerEl.style.setProperty(key, value);
    });
  }

  /**
   * 移除主题（保留接口兼容性）
   */
  remove(): void {
    // 不需要动态清理
  }
}