/**
 * 稿纸工坊 - 设置面板（独立预览 + 模板保存）
 * PaperCraft - Settings Tab with Independent Preview & Template Saving
 */

import { App, PluginSettingTab, Setting, Modal, TextComponent, Notice } from 'obsidian';
import type PaperCraftPlugin from '../main';
import type { TextureType, LinePattern, PartialTemplateSettings, PaperCraftSettings, PaperTemplate } from '../data/PaperData';
import { FONT_PRESETS, DEFAULT_SETTINGS } from '../data/Defaults';

/**
 * CSS 导入对话框
 */
class CSSImportModal extends Modal {
  private plugin: PaperCraftPlugin;
  private onImport: (settings: PartialTemplateSettings) => void;

  constructor(app: App, plugin: PaperCraftPlugin, onImport: (settings: PartialTemplateSettings) => void) {
    super(app);
    this.plugin = plugin;
    this.onImport = onImport;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: '导入 CSS 文件' });
    contentEl.createEl('p', { text: '选择要导入的 CSS 文件，系统将自动解析其中的样式属性。' });

    const fileInput = contentEl.createEl('input', {
      attr: { type: 'file', accept: '.css' },
    });
    fileInput.addClass('papercraft-file-input');

    const statusEl = contentEl.createEl('div', { cls: 'papercraft-import-status' });

    const buttonContainer = contentEl.createDiv({ cls: 'papercraft-modal-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: '取消' });
    cancelBtn.addEventListener('click', () => this.close());

    const importBtn = buttonContainer.createEl('button', { text: '导入', cls: 'mod-cta' });
    importBtn.disabled = true;

    let importedSettings: PartialTemplateSettings | null = null;

    fileInput.addEventListener('change', (e: Event) => {
      void this.handleFileSelect(e, statusEl, importBtn, (settings) => {
        importedSettings = settings;
      });
    });

    importBtn.addEventListener('click', () => {
      if (importedSettings) {
        this.onImport(importedSettings);
        new Notice('CSS 样式已导入到预览区');
        this.close();
      }
    });
  }

  /**
   * 处理文件选择事件（异步逻辑拆出，避免 Promise 警告）
   */
  private async handleFileSelect(
    e: Event,
    statusEl: HTMLElement,
    importBtn: HTMLButtonElement,
    onSuccess: (settings: PartialTemplateSettings) => void
  ): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    statusEl.textContent = '正在解析 CSS 文件...';

    try {
      const text = await file.text();
      const settings = this.parseCSS(text);
      onSuccess(settings);

      statusEl.textContent = '✓ 解析成功！可以导入。';
      statusEl.addClass('papercraft-status-success');
      statusEl.removeClass('papercraft-status-error');
      importBtn.disabled = false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      statusEl.textContent = `✗ 解析失败: ${msg}`;
      statusEl.addClass('papercraft-status-error');
      statusEl.removeClass('papercraft-status-success');
      importBtn.disabled = true;
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  private parseCSS(css: string): PartialTemplateSettings {
    const settings: PartialTemplateSettings = {
      texture: { type: 'none', textureOpacity: 0.15, textureScale: 1.0 },
      lines: { pattern: 'none', gap: 38, thickness: 0.5, color: 'rgba(100, 100, 100, 0.3)' },
      colors: { paperBackground: '', textColor: '', preset: 'custom' },
      typography: {
        fontFamily: '',
        fontSize: 16,
        letterSpacing: 0,
        lineHeight: 1.6,
        paragraphSpacing: 0,
        pageMargin: { top: 0, right: 0, bottom: 0, left: 0 }
      }
    };

    const bgMatch = css.match(/background-color\s*:\s*([^;]+);/i);
    if (bgMatch && settings.colors) {
      settings.colors.paperBackground = this.normalizeColor(bgMatch[1].trim());
    }

    const colorMatch = css.match(/(?<!\w)color\s*:\s*([^;]+);/i);
    if (colorMatch && settings.colors) {
      settings.colors.textColor = this.normalizeColor(colorMatch[1].trim());
    }

    const fontMatch = css.match(/font-family\s*:\s*([^;]+);/i);
    if (fontMatch && settings.typography) {
      settings.typography.fontFamily = fontMatch[1].trim().replace(/['"]/g, '');
    }

    const fontSizeMatch = css.match(/font-size\s*:\s*(\d+(?:\.\d+)?)px/i);
    if (fontSizeMatch && settings.typography) {
      settings.typography.fontSize = parseFloat(fontSizeMatch[1]);
    }

    const lineHeightMatch = css.match(/line-height\s*:\s*(\d+(?:\.\d+)?)/i);
    if (lineHeightMatch && settings.typography) {
      settings.typography.lineHeight = parseFloat(lineHeightMatch[1]);
    }

    const letterSpacingMatch = css.match(/letter-spacing\s*:\s*(\d+(?:\.\d+)?)em/i);
    if (letterSpacingMatch && settings.typography) {
      settings.typography.letterSpacing = parseFloat(letterSpacingMatch[1]);
    }

    const paddingMatch = css.match(/padding\s*:\s*([^;]+);/i);
    if (paddingMatch && settings.typography) {
      const paddingValues = paddingMatch[1].trim().split(/\s+/).map(v => {
        const match = v.match(/(\d+(?:\.\d+)?)px/);
        return match ? parseFloat(match[1]) : 0;
      });

      if (paddingValues.length === 1) {
        settings.typography.pageMargin = {
          top: paddingValues[0], right: paddingValues[0],
          bottom: paddingValues[0], left: paddingValues[0]
        };
      } else if (paddingValues.length === 2) {
        settings.typography.pageMargin = {
          top: paddingValues[0], right: paddingValues[1],
          bottom: paddingValues[0], left: paddingValues[1]
        };
      } else if (paddingValues.length === 4) {
        settings.typography.pageMargin = {
          top: paddingValues[0], right: paddingValues[1],
          bottom: paddingValues[2], left: paddingValues[3]
        };
      }
    }

    const gradientMatch = css.match(/background-image\s*:\s*repeating-linear-gradient\([^)]+\)/i);
    if (gradientMatch && settings.lines) {
      const gradient = gradientMatch[0];

      if (gradient.match(/0deg|to top/)) {
        settings.lines.pattern = 'horizontal';
      } else if (gradient.match(/90deg|to right/)) {
        settings.lines.pattern = 'vertical';
      } else if (gradient.match(/radial-gradient/)) {
        settings.lines.pattern = 'dot';
      }

      const colorInGradient = gradient.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,6}/g);
      if (colorInGradient && colorInGradient.length > 0) {
        const lastColor = colorInGradient[colorInGradient.length - 1];
        if (lastColor !== 'transparent') {
          settings.lines.color = this.normalizeColor(lastColor);
        }
      }

      const spacingMatch = gradient.match(/transparent\s+\d+px.*?(\d+(?:\.\d+)?)px\s+\d+/);
      if (spacingMatch) {
        settings.lines.gap = parseFloat(spacingMatch[1]);
      }
    }

    return settings;
  }

  private normalizeColor(color: string): string {
    color = color.trim().replace(/['"]/g, '');

    if (color.startsWith('rgb')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      }
    }

    return color;
  }
}

/**
 * 模板命名对话框
 */
class TemplateNameModal extends Modal {
  private plugin: PaperCraftPlugin;
  private onSubmit: (name: string) => void;

  constructor(app: App, plugin: PaperCraftPlugin, onSubmit: (name: string) => void) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: '保存为新模板' });

    const inputContainer = contentEl.createDiv({ cls: 'papercraft-modal-input' });
    const textInput = new TextComponent(inputContainer);
    textInput.setPlaceholder('输入模板名称...');
    textInput.inputEl.addClass('papercraft-text-input');

    const buttonContainer = contentEl.createDiv({ cls: 'papercraft-modal-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: '取消' });
    cancelBtn.addEventListener('click', () => this.close());

    const saveBtn = buttonContainer.createEl('button', { text: '保存', cls: 'mod-cta' });
    const doSubmit = (): void => {
      const name = textInput.getValue().trim();
      if (name) {
        this.onSubmit(name);
        this.close();
      }
    };
    saveBtn.addEventListener('click', doSubmit);

    textInput.inputEl.focus();
    textInput.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSubmit();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export class SettingsTab extends PluginSettingTab {
  plugin: PaperCraftPlugin;
  private previewPage: HTMLElement | null = null;
  private draftSettings: PaperCraftSettings | null = null;
  private activeTab: string = 'texture'; // 当前激活的标签页

  constructor(app: App, plugin: PaperCraftPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // === 1. 实时预览区 ===
    this.buildPreview(containerEl);

    // === 2. 标签导航条 ===
    const tabBar = containerEl.createDiv({ cls: 'papercraft-tab-bar' });
    const tabs = [
      { id: 'texture', label: '纸张质感' },
      { id: 'lines', label: '条纹图案' },
      { id: 'colors', label: '颜色配色' },
      { id: 'typography', label: '字体排版' },
    ];

    tabs.forEach(tab => {
      const tabBtn = tabBar.createEl('button', {
        text: tab.label,
        cls: `papercraft-tab-btn ${this.activeTab === tab.id ? 'active' : ''}`,
      });
      tabBtn.addEventListener('click', () => {
        this.activeTab = tab.id;
        tabBar.querySelectorAll('.papercraft-tab-btn').forEach(b => b.removeClass('active'));
        tabBtn.addClass('active');
        this.renderTabContent();
      });
    });

    // === 4. 标签内容区 ===
    this.tabContentEl = containerEl.createDiv({ cls: 'papercraft-tab-content' });
    this.renderTabContent();

    // === 5. 操作按钮（竖向排列，放在参数下方）===
    this.buildActionButtons(containerEl);

    // === 版本信息 ===
    containerEl.createEl('hr');
    containerEl.createEl('p', { text: `PaperCraft v${this.plugin.manifest.version}`, cls: 'papercraft-version' });
  }

  /**
   * Obsidian 1.13.0+ 的声明式设置 API
   * 返回空数组表示使用传统的 display() 方法，
   * 因为本插件设置面板包含实时预览区和复杂的自定义组件，不适合声明式 API
   */
  getSettingDefinitions(): unknown[] {
    return [];
  }

  private tabContentEl: HTMLElement | null = null;

  /**
   * 渲染当前标签页内容
   */
  private renderTabContent(): void {
    if (!this.tabContentEl) return;
    this.tabContentEl.empty();

    switch (this.activeTab) {
      case 'texture':
        this.renderTextureTab(this.tabContentEl);
        break;
      case 'lines':
        this.renderLinesTab(this.tabContentEl);
        break;
      case 'colors':
        this.renderColorsTab(this.tabContentEl);
        break;
      case 'typography':
        this.renderTypographyTab(this.tabContentEl);
        break;
    }
  }

  private renderTextureTab(container: HTMLElement): void {
    new Setting(container)
      .setName('纹理类型')
      .addDropdown(dropdown => {
        dropdown.addOption('none', '无');
        dropdown.addOption('kraft', '牛皮纸');
        dropdown.addOption('xuan', '宣纸');
        dropdown.addOption('concrete', '混凝土');
        dropdown.addOption('linen', '亚麻');
        dropdown.setValue(this.getDraft().texture.type);
        dropdown.onChange((value) => {
          this.getDraft().texture.type = value as TextureType;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName('纹理透明度')
      .setDesc('控制纹理的可见程度')
      .addSlider(slider => {
        slider.setLimits(0, 1, 0.01);
        slider.setValue(this.getDraft().texture.textureOpacity);
        slider.onChange((value) => {
          this.getDraft().texture.textureOpacity = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName('纹理缩放')
      .setDesc('调整纹理的大小比例')
      .addSlider(slider => {
        slider.setLimits(0.5, 2, 0.1);
        slider.setValue(this.getDraft().texture.textureScale);
        slider.onChange((value) => {
          this.getDraft().texture.textureScale = value;
          this.refreshPreview();
        });
      });
  }

  private renderLinesTab(container: HTMLElement): void {
    new Setting(container)
      .setName('线条类型')
      .addDropdown(dropdown => {
        dropdown.addOption('none', '无');
        dropdown.addOption('horizontal', '横线');
        dropdown.addOption('vertical', '竖线');
        dropdown.addOption('grid', '方格');
        dropdown.addOption('dot', '点阵');
        dropdown.setValue(this.getDraft().lines.pattern);
        dropdown.onChange((value) => {
          this.getDraft().lines.pattern = value as LinePattern;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName('线条间距 (px)')
      .addText(text => {
        text.setValue(String(this.getDraft().lines.gap));
        text.onChange((value) => {
          const num = parseInt(value);
          if (!isNaN(num) && num > 0) {
            this.getDraft().lines.gap = num;
            this.refreshPreview();
          }
        });
      });

    new Setting(container)
      .setName('线条粗细 (px)')
      .setDesc('调整线条的粗细')
      .addSlider(slider => {
        slider.setLimits(0.1, 2, 0.1);
        slider.setValue(this.getDraft().lines.thickness);
        slider.onChange((value) => {
          this.getDraft().lines.thickness = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName('线条颜色')
      .addColorPicker(color => {
        color.setValue(this.rgbToHex(this.getDraft().lines.color));
        color.onChange((value) => {
          this.getDraft().lines.color = value;
          this.refreshPreview();
        });
      });
  }

  private renderColorsTab(container: HTMLElement): void {
    new Setting(container)
      .setName('纸张背景色')
      .addColorPicker(color => {
        color.setValue(this.rgbToHex(this.getDraft().colors.paperBackground));
        color.onChange((value) => {
          this.getDraft().colors.paperBackground = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName('文字颜色')
      .addColorPicker(color => {
        color.setValue(this.rgbToHex(this.getDraft().colors.textColor));
        color.onChange((value) => {
          this.getDraft().colors.textColor = value;
          this.refreshPreview();
        });
      });
  }

  private renderTypographyTab(container: HTMLElement): void {
    new Setting(container)
      .setName('字体')
      .addDropdown(dropdown => {
        dropdown.addOption('', '自定义（手动输入）');
        Object.entries(FONT_PRESETS).forEach(([value, label]) => {
          dropdown.addOption(value, label);
        });
        dropdown.setValue(this.getDraft().typography.fontFamily);
        dropdown.onChange((value) => {
          this.getDraft().typography.fontFamily = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName('自定义字体名称')
      .setDesc('如果预设字体不满足需求，可在此手动输入字体名称')
      .addText(text => {
        text.setValue(this.getDraft().typography.fontFamily);
        text.setPlaceholder('输入字体名称...');
        text.onChange((value) => {
          this.getDraft().typography.fontFamily = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName('字号 (px)')
      .addText(text => {
        text.setValue(String(this.getDraft().typography.fontSize));
        text.onChange((value) => {
          const num = parseInt(value);
          if (!isNaN(num) && num > 0) {
            this.getDraft().typography.fontSize = num;
            this.refreshPreview();
          }
        });
      });

    new Setting(container)
      .setName('字间距 (em)')
      .setDesc('调整字符之间的间距')
      .addSlider(slider => {
        slider.setLimits(0, 0.5, 0.01);
        slider.setValue(this.getDraft().typography.letterSpacing);
        slider.onChange((value) => {
          this.getDraft().typography.letterSpacing = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName('行高')
      .setDesc('调整行与行之间的间距')
      .addSlider(slider => {
        slider.setLimits(1, 3, 0.1);
        slider.setValue(this.getDraft().typography.lineHeight);
        slider.onChange((value) => {
          this.getDraft().typography.lineHeight = value;
          this.refreshPreview();
        });
      });
  }

  /**
   * 获取或初始化草稿
   */
  private getDraft(): PaperCraftSettings {
    if (!this.draftSettings) {
      this.draftSettings = JSON.parse(JSON.stringify(this.plugin.settings));
    }
    return this.draftSettings;
  }

  /**
   * 构建操作按钮区（竖向排列）
   */
  private buildActionButtons(container: HTMLElement): void {
    const btnContainer = container.createDiv({ cls: 'papercraft-action-buttons-vertical' });

    // 应用到笔记
    const applyBtn = btnContainer.createEl('button', {
      text: '应用到笔记',
      cls: 'papercraft-action-btn mod-cta',
    });
    applyBtn.addEventListener('click', () => {
      void this.handleApplyClick();
    });

    // 保存为新模板
    const saveBtn = btnContainer.createEl('button', {
      text: '保存为新模板',
      cls: 'papercraft-action-btn',
    });
    saveBtn.addEventListener('click', () => {
      if (this.draftSettings) {
        new TemplateNameModal(this.app, this.plugin, (name) => {
          void this.handleSaveTemplate(name);
        }).open();
      }
    });

    // 导入 CSS
    const importBtn = btnContainer.createEl('button', {
      text: '导入 CSS',
      cls: 'papercraft-action-btn',
    });
    importBtn.addEventListener('click', () => {
      new CSSImportModal(this.app, this.plugin, (importedSettings) => {
        this.draftSettings = importedSettings;
        this.refreshPreview();
        this.display();
      }).open();
    });

    // 重置（只重置预览草稿，不影响笔记）
    const resetBtn = btnContainer.createEl('button', {
      text: '重置预览',
      cls: 'papercraft-action-btn',
    });
    resetBtn.addEventListener('click', () => {
      this.draftSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      this.refreshPreview();
      this.display();
      new Notice('预览已重置');
    });
  }

  /**
   * 处理"应用到笔记"按钮点击（异步逻辑拆出，避免 Promise 警告）
   */
  private async handleApplyClick(): Promise<void> {
    if (this.draftSettings) {
      Object.assign(this.plugin.settings, JSON.parse(JSON.stringify(this.draftSettings)));
      await this.plugin.saveSettings();
      this.plugin.refreshTheme();
      new Notice('已应用到当前笔记');
    }
  }

  /**
   * 处理"保存为模板"回调（异步逻辑拆出，避免 Promise 警告）
   */
  private async handleSaveTemplate(name: string): Promise<void> {
    if (!this.draftSettings) return;
    const template: PaperTemplate = {
      id: `custom-${Date.now()}`,
      name,
      category: 'user',
      settings: {
        texture: this.draftSettings.texture,
        lines: this.draftSettings.lines,
        colors: this.draftSettings.colors,
        typography: this.draftSettings.typography,
      },
    };
    this.plugin.templateManager.addUserTemplate(template);
    new Notice(`模板"${name}"已保存`);
  }

  /**
   * 构建实时预览区
   */
  private buildPreview(container: HTMLElement): void {
    const wrapper = container.createDiv({ cls: 'papercraft-preview-wrapper' });
    wrapper.createDiv({ cls: 'papercraft-preview-title', text: '实时预览（调整参数此处变化，点击"应用到笔记"才生效）' });

    const previewBox = wrapper.createDiv({ cls: 'papercraft-preview-box' });
    this.previewPage = previewBox.createDiv({ cls: 'papercraft-preview-page' });

    const sampleTexts = [
      '落霞与孤鹜齐飞，秋水共长天一色。',
      '渔舟唱晚，响穷彭蠡之滨；',
      '雁阵惊寒，声断衡阳之浦。',
      '遥襟甫畅，逸兴遄飞。',
    ];
    sampleTexts.forEach(text => {
      this.previewPage.createDiv({ cls: 'papercraft-preview-line', text });
    });

    this.refreshPreview();
  }

  /**
   * 刷新预览区样式（包含纹理渲染）
   */
  private refreshPreview(): void {
    if (!this.previewPage) return;

    const draft = this.getDraft();

    // 背景色
    const bgColor = draft.colors.paperBackground || '#FFFFFF';

    // 纹理层
    const allLayers: string[] = [];
    const allSizes: string[] = [];
    const allRepeats: string[] = [];

    // 纹理
    if (draft.texture.type !== 'none') {
      const opacity = draft.texture.textureOpacity || 0.15;
      switch (draft.texture.type) {
        case 'kraft':
          allLayers.push(
            `repeating-linear-gradient(45deg, rgba(139,90,43,${opacity * 0.5}) 0px, transparent 2px, transparent 6px)`,
            `repeating-linear-gradient(-30deg, rgba(160,120,60,${opacity * 0.3}) 0px, transparent 1px, transparent 8px)`
          );
          allSizes.push('100% 100%', '100% 100%');
          allRepeats.push('repeat', 'repeat');
          break;
        case 'xuan':
          allLayers.push(
            `repeating-linear-gradient(0deg, rgba(200,180,150,${opacity * 0.4}) 0px, transparent 1px, transparent 12px)`,
            `repeating-linear-gradient(90deg, rgba(200,180,150,${opacity * 0.3}) 0px, transparent 1px, transparent 15px)`
          );
          allSizes.push('100% 100%', '100% 100%');
          allRepeats.push('repeat', 'repeat');
          break;
        case 'concrete':
          allLayers.push(
            `repeating-linear-gradient(60deg, rgba(120,120,120,${opacity * 0.4}) 0px, transparent 1px, transparent 5px)`,
            `repeating-linear-gradient(-45deg, rgba(100,100,100,${opacity * 0.3}) 0px, transparent 1px, transparent 7px)`
          );
          allSizes.push('100% 100%', '100% 100%');
          allRepeats.push('repeat', 'repeat');
          break;
        case 'linen':
          allLayers.push(
            `repeating-linear-gradient(0deg, rgba(180,160,140,${opacity * 0.5}) 0px, transparent 1px, transparent 3px)`,
            `repeating-linear-gradient(90deg, rgba(180,160,140,${opacity * 0.4}) 0px, transparent 1px, transparent 4px)`
          );
          allSizes.push('100% 100%', '100% 100%');
          allRepeats.push('repeat', 'repeat');
          break;
      }
    }

    // 线条层
    const lines = draft.lines;
    if (lines.pattern !== 'none') {
      const gap = lines.gap || 32;
      const thick = lines.thickness || 0.5;
      const gapMinus = gap - thick;
      const color = lines.color || 'rgba(100, 100, 100, 0.3)';

      switch (lines.pattern) {
        case 'horizontal':
          allLayers.push(`repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`);
          allSizes.push('100% 100%');
          allRepeats.push('repeat');
          break;
        case 'vertical':
          allLayers.push(`repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`);
          allSizes.push('100% 100%');
          allRepeats.push('repeat');
          break;
        case 'grid':
          allLayers.push(
            `repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`,
            `repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`
          );
          allSizes.push('100% 100%', '100% 100%');
          allRepeats.push('repeat', 'repeat');
          break;
        case 'dot':
          allLayers.push(`radial-gradient(circle at center, ${color} 0.6px, transparent 1px)`);
          allSizes.push(`${gap}px ${gap}px`);
          allRepeats.push('repeat');
          break;
      }
    }

    const backgroundImage = allLayers.length > 0 ? allLayers.join(', ') : 'none';
    const backgroundSize = allSizes.length > 0 ? allSizes.join(', ') : '';
    const backgroundRepeat = allRepeats.length > 0 ? allRepeats.join(', ') : '';

    // 边距（缩放）
    const scale = 0.5;
    const pm = draft.typography.pageMargin;
    const paddingTop = `${Math.round((pm?.top || 0) * scale)}px`;
    const paddingRight = `${Math.round((pm?.right || 0) * scale)}px`;
    const paddingBottom = `${Math.round((pm?.bottom || 0) * scale)}px`;
    const paddingLeft = `${Math.round((pm?.left || 0) * scale)}px`;

    // 字体
    const fontFamily = draft.typography.fontFamily || '';
    const fontSize = Math.max(10, Math.round((draft.typography.fontSize || 16) * 0.7));
    const lineHeight = String(draft.typography.lineHeight || 1.65);
    const letterSpacing = `${draft.typography.letterSpacing || 0}em`;
    const color = draft.colors.textColor || '#333333';

    this.previewPage.setCssStyles({
      backgroundColor: bgColor,
      backgroundImage,
      backgroundSize,
      backgroundRepeat,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      fontFamily,
      fontSize: `${fontSize}px`,
      lineHeight,
      letterSpacing,
      color,
    });
  }

  /**
   * RGB 转 Hex
   */
  private rgbToHex(color: string): string {
    if (!color) return '#FFFFFF';
    if (color.startsWith('#')) return color;

    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    return '#FFFFFF';
  }
}
