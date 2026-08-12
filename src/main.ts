/**
 * 稿纸工坊 - 主入口
 * PaperCraft - Main Entry
 */

import { Plugin, MarkdownView } from 'obsidian';
import type { PaperCraftSettings } from './data/PaperData';
import { DEFAULT_SETTINGS, ensureCompleteSettings } from './data/Defaults';
import { TemplateManager } from './templates/TemplateManager';
import { ThemeApplier } from './engine/ThemeApplier';
import { PaperCraftView, VIEW_TYPE } from './sidebar/PaperCraftView';
import { SettingsTab } from './settings/SettingsTab';

export default class PaperCraftPlugin extends Plugin {
  settings: PaperCraftSettings = { ...DEFAULT_SETTINGS };
  templateManager!: TemplateManager;
  private themeApplier!: ThemeApplier;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.themeApplier = new ThemeApplier(this);
    this.templateManager = new TemplateManager(this);

    this.registerView(VIEW_TYPE, (leaf) => new PaperCraftView(leaf, this));

    this.addRibbonIcon('file-text', 'Open PaperCraft', () => {
      void this.activateView();
    });

    this.addSettingTab(new SettingsTab(this.app, this));

    this.applyThemeToActiveView();
  }

  onunload(): void {
    this.themeApplier.remove();
  }

  async loadSettings(): Promise<void> {
    const saved = await this.loadData();
    this.settings = ensureCompleteSettings(saved);
    await this.saveSettings();
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE);
    const leaf = leaves[0] || workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
      await workspace.revealLeaf(leaf);
    }
  }

  applyThemeToActiveView(): void {
    const { workspace } = this.app;
    const activeView = workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      if (this.settings.drawing?.enabled) {
        this.themeApplier.apply(this.settings);
      } else {
        this.themeApplier.clear();
      }
    }
  }

  refreshTheme(): void {
    this.applyThemeToActiveView();
    this.notifySidebarUpdate();
  }

  private notifySidebarUpdate(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof PaperCraftView) {
        view.refreshPreview();
      }
    }
  }
}
