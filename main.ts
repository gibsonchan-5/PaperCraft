/**
 * 稿纸工坊 - 主入口
 * PaperCraft - Main Entry
 */

import { Plugin, MarkdownView, WorkspaceLeaf, MarkdownRenderChild, getLanguage, type MarkdownPostProcessorContext } from 'obsidian';
import type { PaperCraftSettings } from './src/data/PaperData';
import { ensureCompleteSettings, hasActiveStyle } from './src/data/Defaults';
import { SettingsTab } from './src/settings/SettingsTab';
import { ThemeApplier } from './src/engine/ThemeApplier';
import { TemplateManager } from './src/templates/TemplateManager';
import { PaperCraftView, VIEW_TYPE } from './src/sidebar/PaperCraftView';
import { DrawingCanvas } from './src/drawing/DrawingCanvas';
import { setLanguage, matchLanguage, t } from './src/i18n/i18n';

/**
 * 读取 Obsidian 的界面语言，用于新装用户的默认语言。
 * 优先用官方 getLanguage()；极老版本取不到时回退读取 localStorage。
 */
function detectObsidianLanguage(): string | null {
  try {
    const lang = getLanguage();
    if (lang) return lang;
  } catch {
    // 旧版本可能没有该 API
  }
  try {
    return window.localStorage.getItem('language');
  } catch {
    return null;
  }
}

export default class PaperCraftPlugin extends Plugin {
  settings: PaperCraftSettings = ensureCompleteSettings(null);
  themeApplier!: ThemeApplier;
  drawingCanvas!: DrawingCanvas;
  templateManager!: TemplateManager;

  async onload(): Promise<void> {
    await this.loadSettings();
    // 必须在注册命令 / Ribbon 之前设置语言，它们的名称在注册时就固定了
    setLanguage(this.settings.language);

    this.themeApplier = new ThemeApplier(this);
    this.drawingCanvas = new DrawingCanvas(this);
    this.templateManager = new TemplateManager(this);

    // 注册设置面板
    this.addSettingTab(new SettingsTab(this.app, this));

    // 注册侧边栏视图
    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => {
      return new PaperCraftView(leaf, this);
    });

    // 添加 Ribbon 图标
    this.addRibbonIcon('scroll', t('app.name'), () => {
      void this.activateSidebar();
    });

    // 添加命令
    this.addCommand({
      id: 'toggle-sidebar',
      name: t('command.toggleSidebar'),
      callback: () => {
        void this.activateSidebar();
      },
    });

    this.addCommand({
      id: 'toggle-theme',
      name: t('command.toggleTheme'),
      callback: () => {
        this.toggleThemeOnActiveView();
      },
    });

    // 布局就绪后应用主题
    this.app.workspace.onLayoutReady(() => {
      this.applyThemeToAllViews();
    });

    // 监听活动叶子变化
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.applyThemeToActiveView();
      })
    );
  }

  onunload(): void {
    // 注意：不要在 onunload 中 detachLeavesOfType，
    // 否则插件重新加载时会重置用户自定义的 leaf 位置。
    if (this.themeApplier) {
      try {
        const leaves = this.app.workspace.getLeavesOfType('markdown');
        leaves.forEach(leaf => {
          const view = leaf.view;
          if (view instanceof MarkdownView && view.containerEl) {
            this.themeApplier.remove(view.containerEl);
          }
        });
      } catch (e) {
        console.warn('PaperCraft: Failed to remove theme applier', e);
      }
    }
  }

  /**
   * 防御性加载：确保所有字段都存在
   */
  async loadSettings(): Promise<void> {
    const savedData = await this.loadData() as Partial<PaperCraftSettings> | null;
    const complete = ensureCompleteSettings(savedData);
    // 首次安装（data.json 尚未保存语言）时，默认跟随 Obsidian 界面语言
    if (!savedData?.language) {
      complete.language = matchLanguage(detectObsidianLanguage());
    }
    this.settings = complete;
    await this.saveSettings();
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async resetSettings(): Promise<void> {
    this.settings = ensureCompleteSettings(null);
    // 重置时语言同样回到「跟随 Obsidian 界面语言」的默认值
    this.settings.language = matchLanguage(detectObsidianLanguage());
    await this.saveSettings();
  }

  /**
   * 刷新主题
   */
  refreshTheme(): void {
    this.applyThemeToAllViews();
    this.updateSidebarPreview();
  }

  /**
   * 打开或关闭侧边栏
   */
  activateSidebar(): void {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      existing[0].detach();
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      // setViewState 和 revealLeaf 都是 minAppVersion 1.7.2 后的 API
      // 使用 .catch() 兼容 fire-and-forget 模式
      leaf.setViewState({ type: VIEW_TYPE, active: true }).catch(() => {});
      this.app.workspace.revealLeaf(leaf).catch(() => {});
    }
  }

  /**
   * 更新侧边栏预览
   */
  updateSidebarPreview(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    leaves.forEach(leaf => {
      const view = leaf.view;
      if (view instanceof PaperCraftView) {
        view.refresh();
      }
    });
  }

  /**
   * 切换稿纸工坊总开关（全局启用/停用）
   * 启用后所有笔记套用稿纸样式；停用后插件完全不介入笔记外观
   */
  toggleThemeOnActiveView(): void {
    this.settings.enabled = !this.settings.enabled;
    void this.saveSettings();
    this.applyThemeToAllViews();
    this.updateSidebarPreview();
  }

  /**
   * 应用到所有 Markdown 视图
   * 当 settings.enabled 为 false 时，插件不介入任何笔记样式（清理可能残留的样式）
   */
  applyThemeToAllViews(): void {
    const leaves = this.app.workspace.getLeavesOfType('markdown');
    // 仅在「已启用」且「存在实际样式」时才注入；否则清理并确保不覆盖用户原有主题
    if (!this.settings.enabled || !hasActiveStyle(this.settings)) {
      leaves.forEach(leaf => {
        const view = leaf.view;
        if (view instanceof MarkdownView && view.containerEl) {
          this.themeApplier.remove(view.containerEl);
        }
      });
      return;
    }
    leaves.forEach(leaf => {
      const view = leaf.view;
      if (view instanceof MarkdownView && view.containerEl) {
        this.themeApplier.apply(this.settings, view.containerEl);
      }
    });
  }

  /**
   * 应用到当前活动视图
   */
  applyThemeToActiveView(): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) return;

    if (!this.settings.enabled || !hasActiveStyle(this.settings)) {
      this.themeApplier.remove(activeView.containerEl);
      return;
    }

    this.themeApplier.apply(this.settings, activeView.containerEl);

    if (this.settings.drawing?.enabled) {
      this.drawingCanvas.attachToView(activeView);
    }
  }

  /**
   * 类型守卫：判断是否为可折叠的容器（含 toggle 方法）
   */
  private isCollapsibleContainer(parent: unknown): boolean {
    if (parent === null || parent === undefined) return false;
    const candidate = parent as { collapsed?: unknown; toggle?: unknown };
    return typeof candidate.toggle === 'function' && typeof candidate.collapsed === 'boolean';
  }
}