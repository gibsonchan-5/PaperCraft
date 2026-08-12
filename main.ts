/**
 * 稿纸工坊 - 主入口
 * PaperCraft - Main Entry
 */

import { Plugin, MarkdownView, WorkspaceLeaf, WorkspaceSplit } from 'obsidian';
import type { PaperCraftSettings } from './src/data/PaperData';
import { ensureCompleteSettings } from './src/data/Defaults';
import { SettingsTab } from './src/settings/SettingsTab';
import { ThemeApplier } from './src/engine/ThemeApplier';
import { TemplateManager } from './src/templates/TemplateManager';
import { PaperCraftView, VIEW_TYPE } from './src/sidebar/PaperCraftView';
import { DrawingCanvas } from './src/drawing/DrawingCanvas';

export default class PaperCraftPlugin extends Plugin {
  settings: PaperCraftSettings = ensureCompleteSettings(null);
  themeApplier!: ThemeApplier;
  drawingCanvas!: DrawingCanvas;
  templateManager!: TemplateManager;

  async onload(): Promise<void> {
    await this.loadSettings();

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
    this.addRibbonIcon('scroll', '稿纸工坊', () => {
      void this.activateSidebar();
    });

    // 添加命令
    this.addCommand({
      id: 'toggle-sidebar',
      name: '打开/关闭稿纸工坊侧边栏',
      callback: () => {
        void this.activateSidebar();
      },
    });

    this.addCommand({
      id: 'toggle-theme',
      name: '切换稿纸主题',
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
    this.themeApplier.remove();
  }

  /**
   * 防御性加载：确保所有字段都存在
   */
  async loadSettings(): Promise<void> {
    const savedData: unknown = await this.loadData();
    const complete = ensureCompleteSettings(savedData as Parameters<typeof ensureCompleteSettings>[0]);
    this.settings = complete;
    await this.saveSettings();
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async resetSettings(): Promise<void> {
    this.settings = ensureCompleteSettings(null);
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
  async activateSidebar(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      existing[0].detach();
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
      await this.app.workspace.revealLeaf(leaf);
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
   * 切换当前视图的主题
   */
  toggleThemeOnActiveView(): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) return;

    const container = activeView.containerEl;
    if (container.hasClass('papercraft-active')) {
      container.removeClass('papercraft-active');
      this.themeApplier.remove();
    } else {
      this.applyThemeToActiveView();
    }
  }

  /**
   * 应用到所有 Markdown 视图
   */
  applyThemeToAllViews(): void {
    const leaves = this.app.workspace.getLeavesOfType('markdown');
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

    this.themeApplier.apply(this.settings, activeView.containerEl);

    if (this.settings.drawing?.enabled) {
      this.drawingCanvas.attachToView(activeView);
    }
  }

  /**
   * 类型守卫：判断是否为可折叠的 Split 容器
   */
  private isCollapsibleSplit(parent: WorkspaceLeaf['parent']): parent is WorkspaceSplit & { collapsed: boolean; toggle: () => void } {
    return parent !== null && typeof (parent as WorkspaceSplit).toggle === 'function';
  }
}