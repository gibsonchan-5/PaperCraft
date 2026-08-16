/**
 * 稿纸工坊 - CSS 变量生成器
 * PaperCraft - CSS Variable Generator
 *
 * 生成 CSS 变量字典，配合 styles.css 中的预定义样式使用
 * 避免动态创建 style 元素（Obsidian 审核要求）
 */

import type { PaperCraftSettings } from '../data/PaperData';

export class CSSGenerator {
  /**
   * 生成 CSS 变量字典
   */
  generateVariables(settings: PaperCraftSettings): Record<string, string> {
    const variables: Record<string, string> = {};

    // 颜色
    variables['--papercraft-paper-bg'] = settings.colors?.paperBackground || '#FFFFFF';
    variables['--papercraft-text-color'] = settings.colors?.textColor || '#333333';
    variables['--papercraft-line-color'] = settings.lines?.color || 'rgba(100, 100, 100, 0.3)';

    // 字体
    variables['--papercraft-font-family'] = settings.typography?.fontFamily || 'inherit';
    variables['--papercraft-font-size'] = `${settings.typography?.fontSize || 16}px`;
    variables['--papercraft-line-height'] = String(settings.typography?.lineHeight || 1.6);
    variables['--papercraft-letter-spacing'] = `${settings.typography?.letterSpacing || 0}em`;

    // 边距
    const pm = settings.typography?.pageMargin;
    variables['--papercraft-padding-top'] = `${pm?.top || 0}px`;
    variables['--papercraft-padding-right'] = `${pm?.right || 0}px`;
    variables['--papercraft-padding-bottom'] = `${pm?.bottom || 0}px`;
    variables['--papercraft-padding-left'] = `${pm?.left || 0}px`;

    // 背景层（合并成单一 background-image 变量）
    variables['--papercraft-bg-image'] = this.buildBackgroundImage(settings);
    variables['--papercraft-bg-size'] = this.buildBackgroundSize(settings);
    variables['--papercraft-bg-repeat'] = 'repeat';

    return variables;
  }

  /**
   * 生成空变量（用于清除）
   */
  generateClearVariables(): Record<string, string> {
    return {
      '--papercraft-paper-bg': '#FFFFFF',
      '--papercraft-text-color': '#333333',
      '--papercraft-line-color': 'rgba(100, 100, 100, 0.3)',
      '--papercraft-font-family': 'inherit',
      '--papercraft-font-size': '16px',
      '--papercraft-line-height': '1.6',
      '--papercraft-letter-spacing': '0em',
      '--papercraft-bg-image': 'none',
      '--papercraft-bg-size': 'auto',
      '--papercraft-bg-repeat': 'repeat',
      '--papercraft-padding-top': '0px',
      '--papercraft-padding-right': '0px',
      '--papercraft-padding-bottom': '0px',
      '--papercraft-padding-left': '0px',
    };
  }

  /**
   * 构建 background-image 值
   */
  private buildBackgroundImage(settings: PaperCraftSettings): string {
    const layers: string[] = [];

    // 纹理层
    const textureLayer = this.buildTextureLayer(settings);
    if (textureLayer) layers.push(textureLayer);

    // 线条层
    const lineLayers = this.buildLineLayers(settings);
    layers.push(...lineLayers);

    return layers.length > 0 ? layers.join(', ') : 'none';
  }

  /**
   * 构建 background-size 值
   */
  private buildBackgroundSize(settings: PaperCraftSettings): string {
    const hasTexture = settings.texture?.type && settings.texture.type !== 'none';
    const hasLines = settings.lines?.pattern && settings.lines.pattern !== 'none';

    // 纹理层需要 100% 100% 拉伸覆盖
    // 线条层必须用 auto，否则 repeating-linear-gradient 会被拉伸而非重复
    if (hasTexture && hasLines) {
      return '100% 100%, auto';
    } else if (hasTexture) {
      return '100% 100%';
    } else if (hasLines) {
      return 'auto';
    }
    return 'auto';
  }

  /**
   * 纹理层
   */
  private buildTextureLayer(settings: PaperCraftSettings): string | null {
    const texture = settings.texture;
    if (!texture || texture.type === 'none') return null;

    const opacity = texture.textureOpacity || 0.15;
    switch (texture.type) {
      case 'kraft':
        return `repeating-linear-gradient(45deg, rgba(139,90,43,${opacity * 0.5}) 0px, transparent 2px, transparent 6px), repeating-linear-gradient(-30deg, rgba(160,120,60,${opacity * 0.3}) 0px, transparent 1px, transparent 8px)`;
      case 'xuan':
        return `repeating-linear-gradient(0deg, rgba(200,180,150,${opacity * 0.4}) 0px, transparent 1px, transparent 12px), repeating-linear-gradient(90deg, rgba(200,180,150,${opacity * 0.3}) 0px, transparent 1px, transparent 15px)`;
      case 'concrete':
        return `repeating-linear-gradient(60deg, rgba(120,120,120,${opacity * 0.4}) 0px, transparent 1px, transparent 5px), repeating-linear-gradient(-45deg, rgba(100,100,100,${opacity * 0.3}) 0px, transparent 1px, transparent 7px)`;
      case 'linen':
        return `repeating-linear-gradient(0deg, rgba(180,160,140,${opacity * 0.5}) 0px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(180,160,140,${opacity * 0.4}) 0px, transparent 1px, transparent 4px)`;
      default:
        return null;
    }
  }

  /**
   * 线条层
   */
  private buildLineLayers(settings: PaperCraftSettings): string[] {
    const lines = settings.lines;
    if (!lines || lines.pattern === 'none') return [];

    const gap = lines.gap || 32;
    const thick = lines.thickness || 0.5;
    const gapMinus = gap - thick;
    const color = lines.color || 'rgba(100, 100, 100, 0.3)';

    switch (lines.pattern) {
      case 'horizontal':
        return [`repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`];
      case 'vertical':
        return [`repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`];
      case 'grid':
        return [
          `repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`,
          `repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`,
        ];
      case 'dot':
        return [`radial-gradient(circle at center, ${color} 0.6px, transparent 1px)`];
      default:
        return [];
    }
  }
}