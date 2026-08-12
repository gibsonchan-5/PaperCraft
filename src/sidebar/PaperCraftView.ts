/**
 * 稿纸工坊 - 侧边栏视图（纯模板选择）
 * PaperCraft - Sidebar View
 */

import { ItemView, WorkspaceLeaf } from 'obsidian';
import type PaperCraftPlugin from '../../main';
import type { PaperTemplate, Language } from '../data/PaperData';
import { t } from '../i18n/i18n';

export const VIEW_TYPE = 'papercraft-view';

export class PaperCraftView extends ItemView {
  private plugin: PaperCraftPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: PaperCraftPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return t('sidebar.title', this.getLang());
  }

  getIcon(): string {
    return 'file-text';
  }

  async onOpen(): Promise<void> {
    this.render();

    // 事件委托：只在 onOpen 绑定一次
    this.contentEl.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.papercraft-template-card');
      if (card) {
        const templateId = (card as HTMLElement).dataset.templateId;
        if (templateId) {
          this.plugin.templateManager.applyTemplate(templateId);
          this.updateActiveCard(templateId);
        }
      }
    });
  }

  async onClose(): Promise<void> {}

  /**
   * 公共刷新入口：供 main.ts 在设置变更时调用
   */
  refresh(): void {
    this.render();
  }

  private getLang(): Language {
    return this.plugin.settings.language || 'zh-CN';
  }

  /**
   * 渲染侧边栏
   */
  private render(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass('papercraft-sidebar');

    const lang = this.getLang();

    // === 标题区 ===
    const header = container.createDiv({ cls: 'papercraft-sidebar-header' });
    const headerTop = header.createDiv({ cls: 'papercraft-sidebar-header-top' });
    headerTop.createEl('h2', { text: t('sidebar.title', lang) });

    const iconGroup = headerTop.createDiv({ cls: 'papercraft-header-icons' });

    // 清除格式按钮
    const clearBtn = iconGroup.createEl('button', {
      cls: 'papercraft-header-icon-btn',
      attr: { 'aria-label': '清除格式', title: '清除格式（重置当前笔记样式）' },
    });
    clearBtn.setText('↺');
    clearBtn.addEventListener('click', () => {
      this.plugin.settings.lines.pattern = 'none';
      this.plugin.settings.texture.type = 'none';
      this.plugin.settings.texture.textureOpacity = 0;
      this.plugin.settings.colors.paperBackground = '';
      this.plugin.settings.colors.textColor = '';
      this.plugin.settings.colors.preset = 'custom';
      this.plugin.settings.typography.fontFamily = '';
      this.plugin.settings.typography.fontSize = 16;
      this.plugin.settings.typography.letterSpacing = 0;
      this.plugin.settings.typography.lineHeight = 1.6;
      this.plugin.settings.typography.paragraphSpacing = 0;
      this.plugin.settings.typography.pageMargin = { top: 0, right: 0, bottom: 0, left: 0 };
      this.plugin.settings.activeTemplate = '';
      void this.plugin.saveSettings();
      this.plugin.refreshTheme();
      this.render();
    });

    // 打开设置按钮
    const settingsBtn = iconGroup.createEl('button', {
      cls: 'papercraft-header-icon-btn',
      attr: { 'aria-label': '设置', title: '设置' },
    });
    settingsBtn.setText('⚙');
    settingsBtn.addEventListener('click', () => {
      const app = this.app as unknown as {
        setting: {
          open(): void;
          openTabById(id: string): void;
        };
      };
      if (app.setting) {
        app.setting.open();
        app.setting.openTabById('papercraft');
      }
    });

    // === 模板网格 ===
    const builtinTemplates = this.plugin.templateManager.getBuiltinTemplates();
    const userTemplates = this.plugin.templateManager.getUserTemplates();
    const activeTemplateId = this.plugin.settings.activeTemplate || '';

    // 内置模板
    if (builtinTemplates.length > 0) {
      const section = container.createDiv({ cls: 'papercraft-section' });
      section.createEl('h3', { text: t('sidebar.builtin', lang), cls: 'papercraft-section-title' });
      const grid = section.createDiv({ cls: 'papercraft-template-grid' });

      builtinTemplates.forEach(template => {
        this.createTemplateCard(grid, template, template.id === activeTemplateId);
      });
    }

    // 自定义模板
    const customSection = container.createDiv({ cls: 'papercraft-section' });
    customSection.createEl('h3', { text: t('sidebar.custom', lang), cls: 'papercraft-section-title' });

    if (userTemplates.length > 0) {
      const grid = customSection.createDiv({ cls: 'papercraft-template-grid' });
      userTemplates.forEach(template => {
        this.createTemplateCard(grid, template, template.id === activeTemplateId);
      });
    } else {
      customSection.createDiv({ cls: 'papercraft-empty-hint' }).setText(t('sidebar.noCustom', lang));
    }
  }

  /**
   * 更新选中状态的卡片
   */
  private updateActiveCard(templateId: string): void {
    const cards = this.contentEl.querySelectorAll('.papercraft-template-card');
    cards.forEach(card => {
      const htmlCard = card as HTMLElement;
      if (htmlCard.dataset.templateId === templateId) {
        htmlCard.classList.add('active');
      } else {
        htmlCard.classList.remove('active');
      }
    });
  }

  /**
   * 创建模板卡片
   */
  private createTemplateCard(
    parent: HTMLElement,
    template: PaperTemplate,
    isActive: boolean
  ): void {
    const card = parent.createDiv({
      cls: `papercraft-template-card ${isActive ? 'active' : ''}`,
    });
    card.dataset.templateId = template.id;

    // 缩略图
    const thumb = card.createDiv({ cls: 'papercraft-template-thumb' });
    this.applyThumbnailStyle(thumb, template);

    // 名称
    card.createDiv({ cls: 'papercraft-template-name', text: template.name });
  }

  /**
   * 应用缩略图样式
   */
  private applyThumbnailStyle(thumb: HTMLElement, template: PaperTemplate): void {
    const settings = template.settings;

    // 通过 CSS 变量传递背景色
    thumb.setCssStyles({
      backgroundColor: settings.colors?.paperBackground || '#FFFFFF',
    });

    const lines = settings.lines;
    if (lines && lines.pattern !== 'none') {
      const gap = 8;
      const thickness = 0.5;
      const gapMinus = gap - thickness;
      const color = lines.color || 'rgba(100, 100, 100, 0.3)';

      let bgImage = '';
      let bgSize = '';
      let bgRepeat = '';

      switch (lines.pattern) {
        case 'horizontal':
          bgImage = `repeating-linear-gradient(0deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
          break;
        case 'vertical':
          bgImage = `repeating-linear-gradient(90deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
          break;
        case 'grid': {
          const h = `repeating-linear-gradient(0deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
          const v = `repeating-linear-gradient(90deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
          bgImage = `${h}, ${v}`;
          break;
        }
        case 'dot':
          bgImage = `radial-gradient(circle at center, ${color} 0.5px, transparent 1px)`;
          bgSize = `${gap}px ${gap}px`;
          bgRepeat = 'repeat';
          break;
      }

      if (bgImage) {
        thumb.setCssStyles({
          backgroundImage: bgImage,
          ...(bgSize && { backgroundSize: bgSize }),
          ...(bgRepeat && { backgroundRepeat: bgRepeat }),
        });
      }
    }
  }
}
