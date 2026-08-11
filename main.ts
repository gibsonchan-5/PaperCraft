import { Plugin, MarkdownView, WorkspaceLeaf } from 'obsidian';
import { PaperCraftSettings } from './src/data/PaperData';
import { DEFAULT_SETTINGS, ensureCompleteSettings } from './src/data/Defaults';
import { SettingsTab } from './src/settings/SettingsTab';
import { ThemeApplier } from './src/engine/ThemeApplier';
import { TemplateManager } from './src/templates/TemplateManager';
import { PaperCraftView, VIEW_TYPE } from './src/sidebar/PaperCraftView';
import { DrawingCanvas } from './src/drawing/DrawingCanvas';

export default class PaperCraftPlugin extends Plugin {
  settings: PaperCraftSettings;
  themeApplier: ThemeApplier;
  drawingCanvas: DrawingCanvas;
  templateManager: TemplateManager;

  async onload() {
    console.log('[PaperCraft] Loading plugin...');

    // 防御性加载设置
    await this.loadSettings();

    this.themeApplier = new ThemeApplier();
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
      this.activateSidebar();
    });

    // 添加命令
    this.addCommand({
      id: 'toggle-papercraft-sidebar',
      name: '打开/关闭稿纸工坊侧边栏',
      callback: () => this.activateSidebar(),
    });

    this.addCommand({
      id: 'toggle-papercraft-theme',
      name: '切换稿纸主题',
      callback: () => this.toggleThemeOnActiveView(),
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

    console.log('[PaperCraft] Plugin loaded successfully');
  }

  onunload() {
    console.log('[PaperCraft] Unloading plugin');
    this.themeApplier.remove();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  // 防御性加载：确保所有字段都存在
  async loadSettings() {
    const savedData = await this.loadData();
    this.settings = ensureCompleteSettings(savedData);
    await this.saveSettings();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async resetSettings() {
    this.settings = ensureCompleteSettings(null);
    await this.saveSettings();
  }

  /**
   * 刷新主题
   */
  refreshTheme() {
    this.applyThemeToAllViews();
    this.updateSidebarPreview();
  }

  /**
   * 打开或关闭侧边栏
   */
  async activateSidebar() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      const leaf = existing[0];
      const parent = leaf.parent;
      if (parent && (parent as any).collapsed) {
        (parent as any).toggle();
      } else {
        leaf.detach();
      }
    } else {
      const leaf = this.app.workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE, active: true });
        this.app.workspace.revealLeaf(leaf);
      }
    }
  }

  /**
   * 更新侧边栏预览
   */
  updateSidebarPreview() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    leaves.forEach(leaf => {
      const view = leaf.view;
      if (view instanceof PaperCraftView) {
        (view as any).render?.();
      }
    });
  }

  /**
   * 切换当前视图的主题
   */
  toggleThemeOnActiveView() {
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
  applyThemeToAllViews() {
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
  applyThemeToActiveView() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) return;

    this.themeApplier.apply(this.settings, activeView.containerEl);

    // 安全检查 drawing 字段
    if (this.settings.drawing?.enabled) {
      this.drawingCanvas.attachToView(activeView);
    }
  }
}
