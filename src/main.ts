/**
 * 稿纸工坊 - 主入口
 * PaperCraft - Main Entry
 */

import { Plugin } from 'obsidian';
import type { PaperCraftSettings } from './data/PaperData';
import { DEFAULT_SETTINGS, ensureCompleteSettings } from './data/Defaults';
import { TemplateManager } from './templates/TemplateManager';
import { ThemeApplier } from './engine/ThemeApplier';
import { PaperCraftView, VIEW_TYPE } from './src/sidebar/PaperCraftView';
import { SettingsTab } from './settings/SettingsTab';

export default class PaperCraftPlugin extends Plugin {
  settings: PaperCraftSettings = DEFAULT_SETTINGS;
  templateManager!: TemplateManager;
  private themeApplier!: ThemeApplier;

  async onload(): Promise<void> {
    console.log('[PaperCraft] Loading plugin...');

    // 加载设置
    await this.loadSettings();

    // 初始化核心模块
    this.themeApplier = new ThemeApplier();
    this.templateManager = new TemplateManager(this);

    // 注册侧边栏视图
    this.registerView(VIEW_TYPE, (leaf) => new PaperCraftView(leaf, this));

    // 添加侧边栏图标
    this.addRibbonIcon('file-text', 'PaperCraft', () => {
      this.activateView();
    });

    // 注册设置面板
    this.addSettingTab(new SettingsTab(this.app, this));

    // 应用主题
    this.applyThemeToActiveView();

    console.log('[PaperCraft] Plugin loaded successfully');
  }

  onunload(): Promise<void> {
    console.log('[PaperCraft] Unloading plugin...');
    this.themeApplier.remove();
    return Promise.resolve();
  }

  /**
   * 加载设置（防御性）
   */
  async loadSettings(): Promise<void> {
    const saved = await this.loadData();
    this.settings = ensureCompleteSettings(saved);
    await this.saveSettings();
  }

  /**
   * 保存设置
   */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /**
   * 激活侧边栏视图
   */
  async activateView(): Promise<void> {
    const { workspace } = this.app;
    
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    
    if (!leaf) {
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        await rightLeaf.setViewState({ type: VIEW_TYPE, active: true });
        leaf = rightLeaf;
      }
    }
    
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  /**
   * 应用主题到当前活动的 Markdown 视图
   */
  applyThemeToActiveView(): void {
    const { workspace } = this.app;
    const activeLeaf = workspace.getMostRecentLeaf();
    
    if (activeLeaf && activeLeaf.view && activeLeaf.view.getViewType() === 'markdown') {
      if (this.settings.drawing?.enabled) {
        this.themeApplier.apply(this.settings);
      } else {
        this.themeApplier.clear();
      }
    }
  }

  /**
   * 刷新主题（模板应用后调用）
   */
  refreshTheme(): void {
    this.applyThemeToActiveView();
    this.notifySidebarUpdate();
  }

  /**
   * 通知侧边栏预览区更新
   */
  private notifySidebarUpdate(): void {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof PaperCraftView) {
        (view as any).refreshPreview();
      }
    }
  }
}
