/**
 * 稿纸工坊 - 设置面板（独立预览 + 模板保存）
 * PaperCraft - Settings Tab with Independent Preview & Template Saving
 */

import { App, PluginSettingTab, Setting, Modal, TextComponent, Notice, Platform, SettingDefinitionItem } from 'obsidian';
import type PaperCraftPlugin from '../../main';
import type { TextureType, LinePattern, PartialTemplateSettings, PaperCraftSettings, PaperTemplate, MarginLineSettings, Language } from '../data/PaperData';
import { FONT_PRESETS, DEFAULT_SETTINGS, DEFAULT_MARGIN_LINE } from '../data/Defaults';
import { FontPickerModal, enumerateSystemFonts } from './FontPickerModal';
import { t, fontLabel, templateName, setLanguage, getLanguage, getAvailableLanguages, LANGUAGE_LABELS, type TranslationKey } from '../i18n/i18n';

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
    contentEl.createEl('h3', { text: t('cssImport.title') });
    contentEl.createEl('p', { text: t('cssImport.desc') });

    const fileInput = contentEl.createEl('input', {
      attr: { type: 'file', accept: '.css' },
    });
    fileInput.addClass('papercraft-file-input');

    const statusEl = contentEl.createDiv({ cls: 'papercraft-import-status' });

    const buttonContainer = contentEl.createDiv({ cls: 'papercraft-modal-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: t('common.cancel') });
    cancelBtn.addEventListener('click', () => this.close());

    const importBtn = buttonContainer.createEl('button', { text: t('common.import'), cls: 'mod-cta' });
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
        new Notice(t('cssImport.done'));
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

    statusEl.textContent = t('cssImport.parsing');

    try {
      const text = await file.text();
      const settings = this.parseCSS(text);
      onSuccess(settings);

      statusEl.textContent = t('cssImport.success');
      statusEl.addClass('papercraft-status-success');
      statusEl.removeClass('papercraft-status-error');
      importBtn.disabled = false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.unknownError');
      statusEl.textContent = t('cssImport.failure', { msg });
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
    contentEl.createEl('h3', { text: t('templateName.title') });

    const inputContainer = contentEl.createDiv({ cls: 'papercraft-modal-input' });
    const textInput = new TextComponent(inputContainer);
    textInput.setPlaceholder(t('templateName.placeholder'));
    textInput.inputEl.addClass('papercraft-text-input');

    const buttonContainer = contentEl.createDiv({ cls: 'papercraft-modal-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: t('common.cancel') });
    cancelBtn.addEventListener('click', () => this.close());

    const saveBtn = buttonContainer.createEl('button', { text: t('common.save'), cls: 'mod-cta' });
    const doSubmit = (): void => {
      const name = textInput.getValue().trim();
      if (name) {
        this.onSubmit(name);
        this.close();
      }
    };
    saveBtn.addEventListener('click', doSubmit);

    // 仅桌面端自动聚焦：Android WebView 对程序化 focus 只给光标不弹软键盘，
    // 且输入框保持聚焦时用户再点击也不会重新唤起键盘；
    // 移动端改为用户点击输入框后由系统唤起键盘（用户手势 focus 才触发 IME）
    if (!Platform.isMobile) {
      textInput.inputEl.focus();
    }
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
  private activeTab: string = 'general'; // 当前激活的标签页（默认选中首个「通用」标签）
  private armedDeleteIds: Set<string> = new Set(); // 模板删除按钮的两段式确认状态
  private uiHost: HTMLElement | null = null; // 声明式设置宿主容器（render 钩子创建）

  constructor(app: App, plugin: PaperCraftPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * 实际渲染设置面板的方法。
   * 由声明式 getSettingDefinitions() 的 render 钩子调用，
   * containerEl 为钩子创建的宿主容器（整块设置 UI 的唯一根）。
   */
  private renderUI(containerEl: HTMLElement): void {
    containerEl.empty();

    // === 0. 顶部重要提示：参数只影响实时预览，不影响当前笔记 ===
    this.buildPreviewNotice(containerEl);

    // === 1. 实时预览区 ===
    this.buildPreview(containerEl);

    // === 2. 标签导航条 ===
    const tabBar = containerEl.createDiv({ cls: 'papercraft-tab-bar' });
    const tabs = [
      { id: 'general', label: t('settings.general') },
      { id: 'texture', label: t('settings.texture') },
      { id: 'lines', label: t('settings.lines') },
      { id: 'colors', label: t('settings.colors') },
      { id: 'typography', label: t('settings.typography') },
      { id: 'templates', label: t('settings.template') },
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
   * 构建预览专属提示：强调参数只影响实时预览
   */
  private buildPreviewNotice(container: HTMLElement): void {
    const notice = container.createDiv({ cls: 'papercraft-preview-notice' });
    notice.createEl('strong', { text: t('preview.noticeTitle') });
    notice.createSpan({ text: t('preview.noticeBody1') });
    notice.createEl('br');
    notice.createSpan({ text: t('preview.noticeBody2') });
  }

  /**
   * Obsidian 1.13.0+ 声明式设置 API。
   *
   * 面板包含实时预览、标签页切换、模板管理与两段式删除确认等复杂交互，
   * 无法用纯 `control` 类型表达，故通过单个 `render` 类型定义承载：
   * 框架先创建一行 Setting，随后 render 回调把该行改造成全宽宿主容器，
   * 整块设置 UI 由 renderUI() 及其子方法在此宿主内全权渲染与交互。
   */
  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: t('settings.title'),
        searchable: false,
        render: (setting): void => {
          // 将框架生成的 Setting 行改造成全宽自定义宿主
          setting.settingEl.empty();
          setting.settingEl.addClass('papercraft-custom-setting');
          setting.infoEl.detach();
          setting.controlEl.detach();
          const host = setting.settingEl.createDiv({ cls: 'papercraft-custom-host' });
          this.uiHost = host;
          this.renderUI(host);
        },
      },
    ];
  }

  private tabContentEl: HTMLElement | null = null;

  /**
   * 渲染当前标签页内容
   */
  private renderTabContent(): void {
    if (!this.tabContentEl) return;
    this.tabContentEl.empty();
    // 重渲染时清空模板删除 armed 状态，避免旧按钮引用泄漏
    this.armedDeleteIds.clear();

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
      case 'templates':
        this.renderTemplatesTab(this.tabContentEl);
        break;
      case 'general':
        this.renderGeneralTab(this.tabContentEl);
        break;
    }
  }

  /**
   * 渲染模板管理标签页
   */
  private renderTemplatesTab(container: HTMLElement): void {
    const userTemplates = this.plugin.templateManager.getUserTemplates();

    // 标题
    new Setting(container)
      .setName(t('templates.myTemplates'))
      .setDesc(t('templates.myTemplatesDesc'));

    if (userTemplates.length === 0) {
      const empty = container.createDiv({ cls: 'papercraft-template-empty' });
      empty.createEl('p', {
        text: t('templates.empty'),
        cls: 'papercraft-template-empty-title',
      });
      empty.createEl('p', {
        text: t('templates.emptyHint'),
        cls: 'papercraft-template-empty-hint',
      });
      return;
    }

    // 模板列表
    const listEl = container.createDiv({ cls: 'papercraft-template-list' });
    userTemplates.forEach(template => {
      const itemEl = listEl.createDiv({ cls: 'papercraft-template-item' });
      const infoEl = itemEl.createDiv({ cls: 'papercraft-template-item-info' });
      infoEl.createDiv({ text: templateName(template.id, template.name), cls: 'papercraft-template-item-name' });
      const desc = template.settings.lines?.pattern === 'none'
        ? t('templates.solidColor')
        : t('templates.lineInfo', {
            pattern: this.patternLabel(template.settings.lines?.pattern),
            size: template.settings.typography?.fontSize ?? 16,
          });
      infoEl.createDiv({ text: desc, cls: 'papercraft-template-item-desc' });

      const actionsEl = itemEl.createDiv({ cls: 'papercraft-template-item-actions' });
      const applyBtn = actionsEl.createEl('button', {
        text: t('common.apply'),
        cls: 'papercraft-template-item-apply',
      });
      applyBtn.addEventListener('click', () => {
        this.plugin.templateManager.applyTemplate(template.id);
        // 模板是直接写入正式设置的（与侧边栏保持一致、立即生效），
        // 草稿必须同步过去，否则预览看不到效果、且随后的「应用到笔记」
        // 会用旧草稿把刚应用的模板回滚掉
        this.draftSettings = this.cloneSettings(this.plugin.settings);
        this.refreshPreview();
        this.renderTabContent();
        new Notice(t('notice.templateApplied', { name: templateName(template.id, template.name) }));
      });

      const deleteBtn = actionsEl.createEl('button', {
        text: t('common.delete'),
        cls: 'papercraft-template-item-delete',
      });
      deleteBtn.addEventListener('click', () => {
        // 两段式确认：第一次进入 armed，第二次才真正删除
        if (!this.armedDeleteIds.has(template.id)) {
          this.armedDeleteIds.add(template.id);
          deleteBtn.textContent = t('templates.confirmDelete');
          deleteBtn.addClass('papercraft-armed');
          window.setTimeout(() => {
            this.armedDeleteIds.delete(template.id);
            if (deleteBtn.isConnected) {
              deleteBtn.textContent = t('common.delete');
              deleteBtn.removeClass('papercraft-armed');
            }
          }, 5000);
          return;
        }
        this.armedDeleteIds.delete(template.id);
        this.plugin.templateManager.deleteUserTemplate(template.id);
        new Notice(t('notice.templateDeleted', { name: templateName(template.id, template.name) }));
        this.renderTabContent();
      });
    });
  }

  /**
   * 线条模式标签（跟随当前语言）
   */
  private patternLabel(pattern: string | undefined): string {
    switch (pattern) {
      case 'horizontal': return t('pattern.horizontal');
      case 'vertical': return t('pattern.vertical');
      case 'grid': return t('pattern.grid');
      case 'dot': return t('pattern.dot');
      default: return t('pattern.none');
    }
  }

  /**
   * 渲染通用标签页：语言与版本。
   * 语言选项本身不翻译，始终用各自语言的自称书写。
   */
  private renderGeneralTab(container: HTMLElement): void {
    new Setting(container)
      .setName(t('settings.language'))
      .setDesc(t('settings.languageDesc'))
      .addDropdown(dropdown => {
        getAvailableLanguages().forEach(lang => {
          dropdown.addOption(lang, LANGUAGE_LABELS[lang]);
        });
        dropdown.setValue(getLanguage());
        dropdown.onChange((value) => {
          const lang = value as Language;
          if (lang === getLanguage()) return;
          setLanguage(lang);
          this.plugin.settings.language = lang;
          void this.plugin.saveSettings();
          // 侧边栏立即跟随新语言
          this.plugin.updateSidebarPreview();
          // 整块设置 UI 重新渲染（所有文案在渲染期求值）
          if (this.uiHost) this.renderUI(this.uiHost);
        });
      });
  }

  private renderTextureTab(container: HTMLElement): void {
    new Setting(container)
      .setName(t('texture.type'))
      .addDropdown(dropdown => {
        dropdown.addOption('none', t('common.none'));
        dropdown.addOption('kraft', t('texture.kraft'));
        dropdown.addOption('xuan', t('texture.xuan'));
        dropdown.addOption('concrete', t('texture.concrete'));
        dropdown.addOption('linen', t('texture.linen'));
        dropdown.setValue(this.getDraft().texture.type);
        dropdown.onChange((value) => {
          this.getDraft().texture.type = value as TextureType;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName(t('texture.opacity'))
      .setDesc(t('texture.opacityDesc'))
      .addSlider(slider => {
        slider.setLimits(0, 1, 0.01);
        slider.setValue(this.getDraft().texture.textureOpacity);
        slider.onChange((value) => {
          this.getDraft().texture.textureOpacity = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName(t('texture.scale'))
      .setDesc(t('texture.scaleDesc'))
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
      .setName(t('lines.type'))
      .addDropdown(dropdown => {
        dropdown.addOption('none', t('pattern.none'));
        dropdown.addOption('horizontal', t('pattern.horizontal'));
        dropdown.addOption('vertical', t('pattern.vertical'));
        dropdown.addOption('grid', t('pattern.grid'));
        dropdown.addOption('dot', t('pattern.dot'));
        dropdown.setValue(this.getDraft().lines.pattern);
        dropdown.onChange((value) => {
          this.getDraft().lines.pattern = value as LinePattern;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName(t('lines.gap'))
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
      .setName(t('lines.thickness'))
      .setDesc(t('lines.thicknessDesc'))
      .addSlider(slider => {
        slider.setLimits(0.1, 2, 0.1);
        slider.setValue(this.getDraft().lines.thickness);
        slider.onChange((value) => {
          this.getDraft().lines.thickness = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName(t('lines.color'))
      .addColorPicker(color => {
        color.setValue(this.rgbToHex(this.getDraft().lines.color));
        color.onChange((value) => {
          this.getDraft().lines.color = value;
          this.refreshPreview();
        });
      });

    // === 装订线 ===
    new Setting(container).setName(t('marginLine.heading')).setHeading();

    const marginLine = this.getMarginLine();

    new Setting(container)
      .setName(t('marginLine.show'))
      .setDesc(t('marginLine.showDesc'))
      .addToggle(toggle => {
        toggle.setValue(marginLine.enabled);
        toggle.onChange((value) => {
          marginLine.enabled = value;
          this.refreshPreview();
          this.renderTabContent();
        });
      });

    if (marginLine.enabled) {
      new Setting(container)
        .setName(t('marginLine.position'))
        .setDesc(t('marginLine.positionDesc'))
        .addSlider(slider => {
          slider.setLimits(0, 200, 1);
          slider.setValue(marginLine.position);
          slider.setDynamicTooltip();
          slider.onChange((value) => {
            marginLine.position = value;
            this.refreshPreview();
          });
        });

      new Setting(container)
        .setName(t('marginLine.width'))
        .addSlider(slider => {
          slider.setLimits(0.5, 6, 0.5);
          slider.setValue(marginLine.width);
          slider.setDynamicTooltip();
          slider.onChange((value) => {
            marginLine.width = value;
            this.refreshPreview();
          });
        });

      new Setting(container)
        .setName(t('marginLine.color'))
        .addColorPicker(color => {
          color.setValue(this.rgbToHex(marginLine.color));
          color.onChange((value) => {
            marginLine.color = value;
            this.refreshPreview();
          });
        });
    }
  }

  /**
   * 获取草稿中的装订线设置（不存在时补默认值）
   */
  private getMarginLine(): MarginLineSettings {
    const lines = this.getDraft().lines;
    if (!lines.marginLine) {
      lines.marginLine = { ...DEFAULT_MARGIN_LINE };
    }
    return lines.marginLine;
  }

  private renderColorsTab(container: HTMLElement): void {
    new Setting(container)
      .setName(t('colors.paperBackground'))
      .addColorPicker(color => {
        color.setValue(this.rgbToHex(this.getDraft().colors.paperBackground));
        color.onChange((value) => {
          this.getDraft().colors.paperBackground = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName(t('colors.textColor'))
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
      .setName(t('typography.font'))
      .addDropdown(dropdown => {
        const currentFont = this.getDraft().typography.fontFamily;
        dropdown.addOption('', t('typography.fontCustom'));
        // 已选字体不在预设清单内（如从本机字体库挑的自装字体）时，
        // 动态补一条同名选项，否则下拉框会回落显示「自定义」而看不到真值
        if (currentFont && !FONT_PRESETS.includes(currentFont)) {
          dropdown.addOption(currentFont, t('typography.fontCurrent', { font: currentFont }));
        }
        FONT_PRESETS.forEach(family => {
          dropdown.addOption(family, fontLabel(family));
        });
        dropdown.setValue(currentFont);
        dropdown.onChange((value) => {
          this.getDraft().typography.fontFamily = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName(t('typography.systemFonts'))
      .setDesc(t('typography.systemFontsDesc'))
      .addButton(btn => {
        btn.setButtonText(t('typography.browseFonts'));
        btn.setTooltip(t('typography.browseFontsTooltip'));
        btn.onClick(() => {
          void this.openFontPicker();
        });
      });

    new Setting(container)
      .setName(t('typography.customFontName'))
      .setDesc(t('typography.customFontNameDesc'))
      .addText(text => {
        text.setValue(this.getDraft().typography.fontFamily);
        text.setPlaceholder(t('typography.fontPlaceholder'));
        text.onChange((value) => {
          this.getDraft().typography.fontFamily = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName(t('typography.fontSize'))
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
      .setName(t('typography.letterSpacing'))
      .setDesc(t('typography.letterSpacingDesc'))
      .addSlider(slider => {
        slider.setLimits(0, 0.5, 0.01);
        slider.setValue(this.getDraft().typography.letterSpacing);
        slider.onChange((value) => {
          this.getDraft().typography.letterSpacing = value;
          this.refreshPreview();
        });
      });

    new Setting(container)
      .setName(t('typography.lineHeight'))
      .setDesc(t('typography.lineHeightDesc'))
      .addSlider(slider => {
        slider.setLimits(1, 3, 0.1);
        slider.setValue(this.getDraft().typography.lineHeight);
        slider.onChange((value) => {
          this.getDraft().typography.lineHeight = value;
          this.refreshPreview();
        });
      });

    // ===== 页面边距 =====
    new Setting(container).setName(t('typography.pageMargins')).setHeading();

    this.addMarginSetting(container, 'top', t('margin.top'), t('margin.topDesc'));
    this.addMarginSetting(container, 'bottom', t('margin.bottom'), t('margin.bottomDesc'));
    this.addMarginSetting(container, 'left', t('margin.left'), t('margin.leftDesc'));
    this.addMarginSetting(container, 'right', t('margin.right'), t('margin.rightDesc'));
  }

  /**
   * 渲染单个页边距输入项
   */
  private addMarginSetting(
    container: HTMLElement,
    side: 'top' | 'bottom' | 'left' | 'right',
    name: string,
    desc: string
  ): void {
    new Setting(container)
      .setName(name)
      .setDesc(desc)
      .addText(text => {
        text.setValue(String(this.getDraft().typography.pageMargin[side]));
        text.setPlaceholder('0');
        text.inputEl.type = 'number';
        text.inputEl.min = '0';
        text.inputEl.max = '600';
        text.onChange((value) => {
          const num = parseInt(value, 10);
          if (!isNaN(num) && num >= 0 && num <= 600) {
            this.getDraft().typography.pageMargin[side] = num;
            this.refreshPreview();
          }
        });
      });
  }

  /**
   * 打开系统字体选择器：先枚举本机字体，再弹出搜索式选择面板
   */
  private async openFontPicker(): Promise<void> {
    const scanning = new Notice(t('fontPicker.scanning'), 0);

    try {
      const result = await enumerateSystemFonts();
      scanning.hide();

      if (!result.fonts || result.fonts.length === 0) {
        new Notice(t('fontPicker.noFonts'));
        return;
      }

      const recentFonts = this.plugin.settings.recentFonts ?? [];
      // 兜底路径的候选清单不可能穷举自装字体，把「最近使用」与「当前字体」
      // 一并并入列表，确保曾经选过的字体不会在下次打开时消失
      const fonts = Array.from(
        new Set([...recentFonts, this.getDraft().typography.fontFamily, ...result.fonts].filter(Boolean))
      );

      new FontPickerModal(this.app, fonts, {
        mode: result.mode,
        installed: result.installed,
        installedCount: result.installedCount,
        totalCount: result.totalCount,
        accessNote: result.accessNote,
        recentFonts,
        currentFont: this.getDraft().typography.fontFamily,
        onChoose: (family: string) => {
          this.getDraft().typography.fontFamily = family;
          void this.rememberFont(family);
          this.refreshPreview();
          this.renderTabContent();
        },
      }).open();
    } catch (err) {
      scanning.hide();
      const msg = err instanceof Error ? err.message : t('common.unknownError');
      new Notice(t('fontPicker.scanFailed', { msg }));
    }
  }

  /**
   * 记住最近选用的字体（最多 10 个，最近使用的排在最前）
   * 同时写入草稿，避免随后「应用到笔记」用旧快照把刚选的字体挤掉
   */
  private async rememberFont(family: string): Promise<void> {
    if (!family) return;
    const current = this.plugin.settings.recentFonts ?? [];
    const next = [family, ...current.filter(f => f !== family)].slice(0, 10);
    this.plugin.settings.recentFonts = next;
    if (this.draftSettings) {
      this.draftSettings.recentFonts = next.slice();
    }
    await this.plugin.saveSettings();
  }

  /**
   * 获取或初始化草稿
   */
  private getDraft(): PaperCraftSettings {
    if (!this.draftSettings) {
      this.draftSettings = this.cloneSettings(this.plugin.settings);
    }
    return this.draftSettings;
  }

  /**
   * 类型安全地深克隆 settings
   */
  private cloneSettings(settings: PaperCraftSettings): PaperCraftSettings {
    return JSON.parse(JSON.stringify(settings)) as PaperCraftSettings;
  }

  /**
   * 构建操作按钮区（竖向排列）
   */
  private buildActionButtons(container: HTMLElement): void {
    const btnContainer = container.createDiv({ cls: 'papercraft-action-buttons-vertical' });

    // 应用到笔记
    const applyBtn = btnContainer.createEl('button', {
      text: t('action.applyToNote'),
      cls: 'papercraft-action-btn',
    });
    applyBtn.addEventListener('click', () => {
      void this.handleApplyClick();
    });

    // 保存为新模板
    const saveBtn = btnContainer.createEl('button', {
      text: t('action.saveAsTemplate'),
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
      text: t('action.importCss'),
      cls: 'papercraft-action-btn',
    });
    importBtn.addEventListener('click', () => {
      new CSSImportModal(this.app, this.plugin, (importedSettings) => {
        this.draftSettings = this.cloneSettings(DEFAULT_SETTINGS);
        // 用导入的字段覆盖
        if (importedSettings.texture) {
          this.draftSettings.texture = { ...this.draftSettings.texture, ...importedSettings.texture };
        }
        if (importedSettings.lines) {
          this.draftSettings.lines = { ...this.draftSettings.lines, ...importedSettings.lines };
        }
        if (importedSettings.colors) {
          this.draftSettings.colors = { ...this.draftSettings.colors, ...importedSettings.colors };
        }
        if (importedSettings.typography) {
          this.draftSettings.typography = { ...this.draftSettings.typography, ...importedSettings.typography };
        }
        this.refreshPreview();
        if (this.uiHost) this.renderUI(this.uiHost);
      }).open();
    });

    // 重置（只重置预览草稿，不影响笔记）
    const resetBtn = btnContainer.createEl('button', {
      text: t('action.resetPreview'),
      cls: 'papercraft-action-btn',
    });
    resetBtn.addEventListener('click', () => {
      this.draftSettings = this.cloneSettings(DEFAULT_SETTINGS);
      this.refreshPreview();
      if (this.uiHost) this.renderUI(this.uiHost);
      new Notice(t('notice.previewReset'));
    });
  }

  /**
   * 处理"应用到笔记"按钮点击（异步逻辑拆出，避免 Promise 警告）
   */
  private async handleApplyClick(): Promise<void> {
    if (this.draftSettings) {
      // 只回写草稿真正负责的四个板块。
      // 不能用整包 Object.assign：草稿是打开面板时的快照，会把期间由别处
      // 实时写入的 recentFonts（选字体）与 activeTemplate（应用模板）一并回滚。
      const draft = this.cloneSettings(this.draftSettings);
      const live = this.plugin.settings;
      live.texture = draft.texture;
      live.lines = draft.lines;
      live.colors = draft.colors;
      live.typography = draft.typography;

      await this.plugin.saveSettings();
      this.plugin.refreshTheme();
      new Notice(t('notice.appliedToNote'));
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
    new Notice(t('notice.templateSaved', { name }));
    // 即时刷新「模板管理」标签页，让新模板马上出现在列表里（否则要手动切一次标签）
    this.renderTabContent();
  }

  /**
   * 构建实时预览区
   */
  private buildPreview(container: HTMLElement): void {
    const wrapper = container.createDiv({ cls: 'papercraft-preview-wrapper' });
    wrapper.createDiv({ cls: 'papercraft-preview-title', text: t('preview.title') });

    const previewBox = wrapper.createDiv({ cls: 'papercraft-preview-box' });
    this.previewPage = previewBox.createDiv({ cls: 'papercraft-preview-page' });

    const sampleTexts = [1, 2, 3, 4, 5, 6].map(n => t(`preview.sample.${n}` as TranslationKey));
    sampleTexts.forEach(text => {
      this.previewPage?.createDiv({ cls: 'papercraft-preview-line', text });
    });

    this.refreshPreview();
  }

  /**
   * 刷新预览区样式（包含纹理渲染）
   */
  private refreshPreview(): void {
    if (!this.previewPage) return;

    const draft = this.getDraft();

    // 预览按真实尺寸 1:1 渲染（所见即所得），不做缩小。
    // 预览框通过 max-height + overflow-y 滚动查看，确保字号/行距/边距/线条间距与真实笔记完全一致
    const scale = 1;

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
      // 预览框小于真实纸张，所有几何尺寸按统一比例 scale 缩放，保证与真实笔记比例一致
      const gap = (lines.gap || 32) * scale;
      const thick = Math.max(0.5, (lines.thickness || 0.5) * scale);
      const gapMinus = gap - thick;
      const color = lines.color || 'rgba(100, 100, 100, 0.3)';

      switch (lines.pattern) {
        case 'horizontal':
          allLayers.push(`repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`);
          allSizes.push(`100% ${gap}px`);
          allRepeats.push('repeat');
          break;
        case 'vertical':
          allLayers.push(`repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`);
          allSizes.push(`${gap}px 100%`);
          allRepeats.push('repeat');
          break;
        case 'grid':
          allLayers.push(
            `repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`,
            `repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`
          );
          allSizes.push(`100% ${gap}px`, `${gap}px 100%`);
          allRepeats.push('repeat', 'repeat');
          break;
        case 'dot':
          allLayers.push(`radial-gradient(circle at center, ${color} 0.6px, transparent 1px)`);
          allSizes.push(`${gap}px ${gap}px`);
          allRepeats.push('repeat');
          break;
      }
    }

    // 装订线层（置顶显示，unshift 到数组最前 = CSS 最上层）
    const marginLine = draft.lines.marginLine;
    if (marginLine && marginLine.enabled) {
      const mlStart = Math.max(0, Math.round((marginLine.position || 0) * scale));
      const mlEnd = mlStart + Math.max(0.5, (marginLine.width || 1) * scale);
      const mlColor = marginLine.color || 'rgba(180, 50, 40, 0.4)';
      allLayers.unshift(`linear-gradient(90deg, transparent 0px, transparent ${mlStart}px, ${mlColor} ${mlStart}px, ${mlColor} ${mlEnd}px, transparent ${mlEnd}px, transparent 100%)`);
      allSizes.unshift('100% 100%');
      allRepeats.unshift('no-repeat');
    }

    const backgroundImage = allLayers.length > 0 ? allLayers.join(', ') : 'none';
    const backgroundSize = allSizes.length > 0 ? allSizes.join(', ') : '';
    const backgroundRepeat = allRepeats.length > 0 ? allRepeats.join(', ') : '';

    // 边距（缩放）
    const pm = draft.typography.pageMargin;
    const paddingTop = `${Math.round((pm?.top || 0) * scale)}px`;
    const paddingRight = `${Math.round((pm?.right || 0) * scale)}px`;
    const paddingBottom = `${Math.round((pm?.bottom || 0) * scale)}px`;
    const paddingLeft = `${Math.round((pm?.left || 0) * scale)}px`;

    // 字体
    const fontFamily = draft.typography.fontFamily || '';
    const fontSize = Math.max(8, Math.round((draft.typography.fontSize || 16) * scale));
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
