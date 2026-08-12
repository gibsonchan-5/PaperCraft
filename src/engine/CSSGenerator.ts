/**
 * 稿纸工坊 - CSS 生成器
 * PaperCraft - CSS Generator
 */

import type { PaperCraftSettings } from '../data/PaperData';

interface BackgroundLayer {
  image: string;
  size: string;
  repeat: string;
  position?: string;
}

export class CSSGenerator {
  /**
   * 根据设置生成完整的 CSS
   */
  generate(settings: PaperCraftSettings): string {
    const layers: BackgroundLayer[] = [];

    // 纹理层（在底下）
    const textureLayer = this.buildTextureLayer(settings);
    if (textureLayer) layers.push(textureLayer);

    // 线条层（在纹理之上）
    const lineLayers = this.buildLineLayers(settings);
    layers.push(...lineLayers);

    // 合并成一条 background 声明
    const bgCSS = this.combineLayers(layers, settings);

    const typographyCSS = this.buildTypographyCSS(settings);

    return `
/* PaperCraft Generated CSS */
.workspace-leaf-content[data-type="markdown"] .cm-scroller,
.workspace-leaf-content[data-type="markdown"] .markdown-preview-view {
  ${bgCSS}
  background-attachment: local;
}

.workspace-leaf-content[data-type="markdown"] .cm-editor,
.workspace-leaf-content[data-type="markdown"] .cm-content,
.workspace-leaf-content[data-type="markdown"] .markdown-preview-sizer {
  background: transparent;
}

/* 表格边框保护 */
.workspace-leaf-content[data-type="markdown"] table {
  border-color: var(--background-modifier-border);
}
.workspace-leaf-content[data-type="markdown"] td,
.workspace-leaf-content[data-type="markdown"] th {
  border-color: var(--background-modifier-border);
}

/* 排版 */
.workspace-leaf-content[data-type="markdown"] .cm-content,
.workspace-leaf-content[data-type="markdown"] .markdown-preview-sizer {
  ${typographyCSS}
}

/* 文字颜色 */
.workspace-leaf-content[data-type="markdown"] .cm-content,
.workspace-leaf-content[data-type="markdown"] .markdown-preview-view {
  color: ${settings.colors.textColor || 'var(--text-normal)'};
}
`;
  }

  /**
   * 合并多个背景层为一条 CSS 声明
   */
  private combineLayers(layers: BackgroundLayer[], settings: PaperCraftSettings): string {
    const bgColor = settings.colors.paperBackground || 'var(--background-primary)';

    if (layers.length === 0) {
      return `background-color: ${bgColor};`;
    }

    const images = layers.map(l => l.image).join(',\n    ');
    const sizes = layers.map(l => l.size).join(', ');
    const repeats = layers.map(l => l.repeat).join(', ');
    const positions = layers.map(l => l.position || '0 0').join(', ');

    return `background-image:
    ${images};
  background-size: ${sizes};
  background-repeat: ${repeats};
  background-position: ${positions};
  background-color: ${bgColor};`;
  }

  /**
   * 构建纹理层
   */
  private buildTextureLayer(settings: PaperCraftSettings): BackgroundLayer | null {
    const { texture } = settings;

    if (texture.type === 'none') return null;

    const opacity = texture.textureOpacity;
    const scale = texture.textureScale;

    switch (texture.type) {
      case 'kraft':
        return {
          image: `repeating-linear-gradient(
      45deg,
      rgba(139, 90, 43, ${opacity * 0.3}) 0,
      rgba(139, 90, 43, ${opacity * 0.3}) 2px,
      transparent 2px,
      transparent 6px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(160, 120, 60, ${opacity * 0.2}) 0,
      rgba(160, 120, 60, ${opacity * 0.2}) 3px,
      transparent 3px,
      transparent 8px
    )`,
          size: `${8 * scale}px ${8 * scale}px, ${12 * scale}px ${12 * scale}px`,
          repeat: 'repeat, repeat',
        };

      case 'xuan':
        return {
          image: `linear-gradient(
      to bottom,
      rgba(255, 250, 240, ${opacity * 0.1}) 0%,
      rgba(240, 230, 210, ${opacity * 0.15}) 50%,
      rgba(255, 250, 240, ${opacity * 0.1}) 100%
    )`,
          size: '100% 100%',
          repeat: 'no-repeat',
        };

      case 'concrete':
        return {
          image: `repeating-linear-gradient(
      0deg,
      rgba(120, 120, 120, ${opacity * 0.15}) 0,
      rgba(120, 120, 120, ${opacity * 0.15}) 1px,
      transparent 1px,
      transparent 4px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(100, 100, 100, ${opacity * 0.1}) 0,
      rgba(100, 100, 100, ${opacity * 0.1}) 1px,
      transparent 1px,
      transparent 4px
    )`,
          size: `${4 * scale}px ${4 * scale}px, ${4 * scale}px ${4 * scale}px`,
          repeat: 'repeat, repeat',
        };

      case 'linen':
        return {
          image: `repeating-linear-gradient(
      0deg,
      rgba(200, 180, 150, ${opacity * 0.2}) 0,
      rgba(200, 180, 150, ${opacity * 0.2}) 1px,
      transparent 1px,
      transparent 3px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(180, 160, 130, ${opacity * 0.15}) 0,
      rgba(180, 160, 130, ${opacity * 0.15}) 1px,
      transparent 1px,
      transparent 3px
    )`,
          size: `${3 * scale}px ${3 * scale}px, ${3 * scale}px ${3 * scale}px`,
          repeat: 'repeat, repeat',
        };

      default:
        return null;
    }
  }

  /**
   * 构建线条层（可能返回多个层，如 grid 是两条渐变）
   */
  private buildLineLayers(settings: PaperCraftSettings): BackgroundLayer[] {
    const { lines } = settings;

    if (lines.pattern === 'none') return [];

    const gap = lines.gap;
    const thickness = lines.thickness;
    const color = lines.color;
    const gapMinus = Math.max(0, gap - thickness);

    switch (lines.pattern) {
      case 'horizontal': {
        const grad = `repeating-linear-gradient(0deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
        return [{ image: grad, size: 'auto', repeat: 'repeat' }];
      }

      case 'vertical': {
        const grad = `repeating-linear-gradient(90deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
        return [{ image: grad, size: 'auto', repeat: 'repeat' }];
      }

      case 'grid': {
        const horizontal = `repeating-linear-gradient(0deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
        const vertical = `repeating-linear-gradient(90deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
        return [
          { image: horizontal, size: 'auto', repeat: 'repeat' },
          { image: vertical, size: 'auto', repeat: 'repeat' },
        ];
      }

      case 'dot': {
        const grad = `radial-gradient(circle at center, ${color} ${thickness / 2}px, transparent ${thickness / 2 + 0.5}px)`;
        return [{ image: grad, size: `${gap}px ${gap}px`, repeat: 'repeat' }];
      }

      default:
        return [];
    }
  }

  /**
   * 构建排版 CSS
   */
  private buildTypographyCSS(settings: PaperCraftSettings): string {
    const { typography } = settings;
    const rules: string[] = [];

    if (typography.fontFamily) {
      rules.push(`font-family: ${typography.fontFamily}, var(--font-text);`);
    }
    if (typography.fontSize !== 16) {
      rules.push(`font-size: ${typography.fontSize}px;`);
    }
    if (typography.letterSpacing !== 0) {
      rules.push(`letter-spacing: ${typography.letterSpacing}em;`);
    }
    if (typography.lineHeight !== 1.6) {
      rules.push(`line-height: ${typography.lineHeight};`);
    }
    if (typography.paragraphSpacing !== 0) {
      rules.push(`margin-bottom: ${typography.paragraphSpacing}px;`);
    }
    if (
      typography.pageMargin.top !== 0 ||
      typography.pageMargin.right !== 0 ||
      typography.pageMargin.bottom !== 0 ||
      typography.pageMargin.left !== 0
    ) {
      rules.push(
        `padding: ${typography.pageMargin.top}px ${typography.pageMargin.right}px ${typography.pageMargin.bottom}px ${typography.pageMargin.left}px;`
      );
    }

    return rules.join('\n  ');
  }

  /**
   * 清除 CSS
   */
  clear(): string {
    return `
/* PaperCraft Cleared */
.workspace-leaf-content[data-type="markdown"] .cm-scroller,
.workspace-leaf-content[data-type="markdown"] .markdown-preview-view,
.workspace-leaf-content[data-type="markdown"] .cm-editor,
.workspace-leaf-content[data-type="markdown"] .cm-content,
.workspace-leaf-content[data-type="markdown"] .markdown-preview-sizer {
  background: none;
  background-image: none;
  color: var(--text-normal);
}
`;
  }
}
