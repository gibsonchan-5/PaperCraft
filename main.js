var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PaperCraftPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/data/Defaults.ts
var PLUGIN_VERSION = "1.0.1";
var DEFAULT_SETTINGS = {
  version: PLUGIN_VERSION,
  language: "zh-CN",
  texture: {
    type: "none",
    textureOpacity: 0.15,
    textureScale: 1
  },
  lines: {
    pattern: "none",
    gap: 38,
    thickness: 0.5,
    color: "rgba(100, 100, 100, 0.3)"
  },
  colors: {
    paperBackground: "",
    textColor: "",
    preset: "custom"
  },
  typography: {
    fontFamily: "",
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 1.6,
    paragraphSpacing: 0,
    pageMargin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  },
  drawing: {
    enabled: false,
    showDrawingLayer: true,
    drawings: []
  },
  activeTemplate: ""
};
function ensureCompleteSettings(saved) {
  if (!saved) {
    return { ...DEFAULT_SETTINGS };
  }
  return {
    version: saved.version || PLUGIN_VERSION,
    language: saved.language || DEFAULT_SETTINGS.language,
    texture: {
      ...DEFAULT_SETTINGS.texture,
      ...saved.texture || {}
    },
    lines: {
      ...DEFAULT_SETTINGS.lines,
      ...saved.lines || {}
    },
    colors: {
      ...DEFAULT_SETTINGS.colors,
      ...saved.colors || {}
    },
    typography: {
      ...DEFAULT_SETTINGS.typography,
      ...saved.typography || {},
      pageMargin: {
        ...DEFAULT_SETTINGS.typography.pageMargin,
        ...(saved.typography || {}).pageMargin || {}
      }
    },
    drawing: {
      ...DEFAULT_SETTINGS.drawing,
      ...saved.drawing || {},
      drawings: (saved.drawing || {}).drawings || []
    },
    activeTemplate: saved.activeTemplate || ""
  };
}
var FONT_PRESETS = {
  // 中文宋体类
  "SimSun": "\u5B8B\u4F53 (SimSun)",
  "STSong": "\u534E\u6587\u5B8B\u4F53 (STSong)",
  "Songti SC": "\u5B8B\u4F53-\u7B80 (Songti SC)",
  "NSimSun": "\u65B0\u5B8B\u4F53 (NSimSun)",
  "SimSun-ExtB": "\u5B8B\u4F53-ExtB (SimSun-ExtB)",
  "FZSongti-B01S": "\u65B9\u6B63\u5B8B\u4F53 (FZSongti)",
  "Source Han Serif SC": "\u601D\u6E90\u5B8B\u4F53 (Source Han Serif SC)",
  "Noto Serif CJK SC": "\u601D\u6E90\u5B8B\u4F53 (Noto Serif CJK SC)",
  // 中文仿宋类
  "FangSong": "\u4EFF\u5B8B (FangSong)",
  "STFangsong": "\u534E\u6587\u4EFF\u5B8B (STFangsong)",
  "FZFangsong-Z02": "\u65B9\u6B63\u4EFF\u5B8B (FZFangsong)",
  // 中文黑体类
  "Microsoft YaHei": "\u5FAE\u8F6F\u96C5\u9ED1 (Microsoft YaHei)",
  "SimHei": "\u9ED1\u4F53 (SimHei)",
  "STHeiti": "\u534E\u6587\u9ED1\u4F53 (STHeiti)",
  "Source Han Sans SC": "\u601D\u6E90\u9ED1\u4F53 (Source Han Sans SC)",
  "Noto Sans CJK SC": "\u601D\u6E90\u9ED1\u4F53 (Noto Sans CJK SC)",
  "PingFang SC": "\u82F9\u65B9-\u7B80 (PingFang SC)",
  "Hiragino Sans GB": "\u51AC\u9752\u9ED1\u4F53 (Hiragino Sans GB)",
  // 中文楷体类
  "KaiTi": "\u6977\u4F53 (KaiTi)",
  "STKaiti": "\u534E\u6587\u6977\u4F53 (STKaiti)",
  "FZKaiti-Z04": "\u65B9\u6B63\u6977\u4F53 (FZKaiti)",
  "AR PL UKai CN": "\u6587\u6CC9\u9A7F\u6B63\u9ED1 (AR PL UKai CN)",
  // 中文其他
  "STXihei": "\u534E\u6587\u7EC6\u9ED1 (STXihei)",
  "LiSu": "\u96B6\u4E66 (LiSu)",
  "YouYuan": "\u5E7C\u5706 (YouYuan)",
  "STXingkai": "\u534E\u6587\u884C\u6977 (STXingkai)",
  "STXinwei": "\u534E\u6587\u65B0\u9B4F (STXinwei)",
  // 英文经典
  "Times New Roman": "Times New Roman",
  "Georgia": "Georgia",
  "Arial": "Arial",
  "Helvetica": "Helvetica",
  "Helvetica Neue": "Helvetica Neue",
  "Verdana": "Verdana",
  "Tahoma": "Tahoma",
  "Trebuchet MS": "Trebuchet MS",
  "Lucida Console": "Lucida Console",
  "Courier New": "Courier New",
  "Garamond": "Garamond",
  "Palatino": "Palatino",
  "Book Antiqua": "Book Antiqua"
};

// src/settings/SettingsTab.ts
var import_obsidian = require("obsidian");
var CSSImportModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onImport) {
    super(app);
    this.plugin = plugin;
    this.onImport = onImport;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "\u5BFC\u5165 CSS \u6587\u4EF6" });
    contentEl.createEl("p", { text: "\u9009\u62E9\u8981\u5BFC\u5165\u7684 CSS \u6587\u4EF6\uFF0C\u7CFB\u7EDF\u5C06\u81EA\u52A8\u89E3\u6790\u5176\u4E2D\u7684\u6837\u5F0F\u5C5E\u6027\u3002" });
    const fileInput = contentEl.createEl("input", {
      attr: { type: "file", accept: ".css" }
    });
    fileInput.addClass("papercraft-file-input");
    const statusEl = contentEl.createDiv({ cls: "papercraft-import-status" });
    const buttonContainer = contentEl.createDiv({ cls: "papercraft-modal-buttons" });
    const cancelBtn = buttonContainer.createEl("button", { text: "\u53D6\u6D88" });
    cancelBtn.addEventListener("click", () => this.close());
    const importBtn = buttonContainer.createEl("button", { text: "\u5BFC\u5165", cls: "mod-cta" });
    importBtn.disabled = true;
    let importedSettings = null;
    fileInput.addEventListener("change", (e) => {
      void this.handleFileSelect(e, statusEl, importBtn, (settings) => {
        importedSettings = settings;
      });
    });
    importBtn.addEventListener("click", () => {
      if (importedSettings) {
        this.onImport(importedSettings);
        new import_obsidian.Notice("CSS \u6837\u5F0F\u5DF2\u5BFC\u5165\u5230\u9884\u89C8\u533A");
        this.close();
      }
    });
  }
  /**
   * 处理文件选择事件（异步逻辑拆出，避免 Promise 警告）
   */
  async handleFileSelect(e, statusEl, importBtn, onSuccess) {
    var _a;
    const input = e.target;
    const file = (_a = input.files) == null ? void 0 : _a[0];
    if (!file)
      return;
    statusEl.textContent = "\u6B63\u5728\u89E3\u6790 CSS \u6587\u4EF6...";
    try {
      const text = await file.text();
      const settings = this.parseCSS(text);
      onSuccess(settings);
      statusEl.textContent = "\u2713 \u89E3\u6790\u6210\u529F\uFF01\u53EF\u4EE5\u5BFC\u5165\u3002";
      statusEl.addClass("papercraft-status-success");
      statusEl.removeClass("papercraft-status-error");
      importBtn.disabled = false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "\u672A\u77E5\u9519\u8BEF";
      statusEl.textContent = `\u2717 \u89E3\u6790\u5931\u8D25: ${msg}`;
      statusEl.addClass("papercraft-status-error");
      statusEl.removeClass("papercraft-status-success");
      importBtn.disabled = true;
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
  parseCSS(css) {
    const settings = {
      texture: { type: "none", textureOpacity: 0.15, textureScale: 1 },
      lines: { pattern: "none", gap: 38, thickness: 0.5, color: "rgba(100, 100, 100, 0.3)" },
      colors: { paperBackground: "", textColor: "", preset: "custom" },
      typography: {
        fontFamily: "",
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
      settings.typography.fontFamily = fontMatch[1].trim().replace(/['"]/g, "");
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
      const paddingValues = paddingMatch[1].trim().split(/\s+/).map((v) => {
        const match = v.match(/(\d+(?:\.\d+)?)px/);
        return match ? parseFloat(match[1]) : 0;
      });
      if (paddingValues.length === 1) {
        settings.typography.pageMargin = {
          top: paddingValues[0],
          right: paddingValues[0],
          bottom: paddingValues[0],
          left: paddingValues[0]
        };
      } else if (paddingValues.length === 2) {
        settings.typography.pageMargin = {
          top: paddingValues[0],
          right: paddingValues[1],
          bottom: paddingValues[0],
          left: paddingValues[1]
        };
      } else if (paddingValues.length === 4) {
        settings.typography.pageMargin = {
          top: paddingValues[0],
          right: paddingValues[1],
          bottom: paddingValues[2],
          left: paddingValues[3]
        };
      }
    }
    const gradientMatch = css.match(/background-image\s*:\s*repeating-linear-gradient\([^)]+\)/i);
    if (gradientMatch && settings.lines) {
      const gradient = gradientMatch[0];
      if (gradient.match(/0deg|to top/)) {
        settings.lines.pattern = "horizontal";
      } else if (gradient.match(/90deg|to right/)) {
        settings.lines.pattern = "vertical";
      } else if (gradient.match(/radial-gradient/)) {
        settings.lines.pattern = "dot";
      }
      const colorInGradient = gradient.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,6}/g);
      if (colorInGradient && colorInGradient.length > 0) {
        const lastColor = colorInGradient[colorInGradient.length - 1];
        if (lastColor !== "transparent") {
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
  normalizeColor(color) {
    color = color.trim().replace(/['"]/g, "");
    if (color.startsWith("rgb")) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
      }
    }
    return color;
  }
};
var TemplateNameModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onSubmit) {
    super(app);
    this.plugin = plugin;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "\u4FDD\u5B58\u4E3A\u65B0\u6A21\u677F" });
    const inputContainer = contentEl.createDiv({ cls: "papercraft-modal-input" });
    const textInput = new import_obsidian.TextComponent(inputContainer);
    textInput.setPlaceholder("\u8F93\u5165\u6A21\u677F\u540D\u79F0...");
    textInput.inputEl.addClass("papercraft-text-input");
    const buttonContainer = contentEl.createDiv({ cls: "papercraft-modal-buttons" });
    const cancelBtn = buttonContainer.createEl("button", { text: "\u53D6\u6D88" });
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = buttonContainer.createEl("button", { text: "\u4FDD\u5B58", cls: "mod-cta" });
    const doSubmit = () => {
      const name = textInput.getValue().trim();
      if (name) {
        this.onSubmit(name);
        this.close();
      }
    };
    saveBtn.addEventListener("click", doSubmit);
    textInput.inputEl.focus();
    textInput.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        doSubmit();
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var SettingsTab = class extends import_obsidian.PluginSettingTab {
  // 当前激活的标签页
  constructor(app, plugin) {
    super(app, plugin);
    this.previewPage = null;
    this.draftSettings = null;
    this.activeTab = "texture";
    this.tabContentEl = null;
    this.plugin = plugin;
  }
  /**
   * 重写 display 方法（避免 deprecation 警告）：调用自定义的 renderUI
   */
  display() {
    this.renderUI();
  }
  /**
   * 实际渲染设置面板的方法
   */
  renderUI() {
    const { containerEl } = this;
    containerEl.empty();
    this.buildPreviewNotice(containerEl);
    this.buildPreview(containerEl);
    const tabBar = containerEl.createDiv({ cls: "papercraft-tab-bar" });
    const tabs = [
      { id: "texture", label: "\u7EB8\u5F20\u8D28\u611F" },
      { id: "lines", label: "\u6761\u7EB9\u56FE\u6848" },
      { id: "colors", label: "\u989C\u8272\u914D\u8272" },
      { id: "typography", label: "\u5B57\u4F53\u6392\u7248" },
      { id: "templates", label: "\u6A21\u677F\u7BA1\u7406" }
    ];
    tabs.forEach((tab) => {
      const tabBtn = tabBar.createEl("button", {
        text: tab.label,
        cls: `papercraft-tab-btn ${this.activeTab === tab.id ? "active" : ""}`
      });
      tabBtn.addEventListener("click", () => {
        this.activeTab = tab.id;
        tabBar.querySelectorAll(".papercraft-tab-btn").forEach((b) => b.removeClass("active"));
        tabBtn.addClass("active");
        this.renderTabContent();
      });
    });
    this.tabContentEl = containerEl.createDiv({ cls: "papercraft-tab-content" });
    this.renderTabContent();
    this.buildActionButtons(containerEl);
    containerEl.createEl("hr");
    containerEl.createEl("p", { text: `PaperCraft v${this.plugin.manifest.version}`, cls: "papercraft-version" });
  }
  /**
   * 构建预览专属提示：强调参数只影响实时预览
   */
  buildPreviewNotice(container) {
    const notice = container.createDiv({ cls: "papercraft-preview-notice" });
    notice.createEl("strong", { text: "\u26A0\uFE0F \u63D0\u793A\uFF1A" });
    notice.createSpan({ text: "\u6B64\u5904\u7684\u6240\u6709\u53C2\u6570\u8C03\u6574\u4EC5\u5F71\u54CD\u4E0A\u65B9\u7684\u5B9E\u65F6\u9884\u89C8\u533A\uFF0C" });
    notice.createEl("br");
    notice.createSpan({ text: "\u4E0D\u4F1A\u81EA\u52A8\u5E94\u7528\u5230\u5F53\u524D\u7B14\u8BB0\u3002\u6EE1\u610F\u540E\u8BF7\u70B9\u51FB\u5E95\u90E8\u300C\u5E94\u7528\u5230\u7B14\u8BB0\u300D\u6309\u94AE\u3002" });
  }
  /**
   * Obsidian 1.13.0+ 的声明式设置 API
   * 返回空数组表示使用传统的 display() 方法，
   * 因为本插件设置面板包含实时预览区和复杂的自定义组件，不适合声明式 API
   */
  getSettingDefinitions() {
    return [];
  }
  /**
   * 渲染当前标签页内容
   */
  renderTabContent() {
    if (!this.tabContentEl)
      return;
    this.tabContentEl.empty();
    switch (this.activeTab) {
      case "texture":
        this.renderTextureTab(this.tabContentEl);
        break;
      case "lines":
        this.renderLinesTab(this.tabContentEl);
        break;
      case "colors":
        this.renderColorsTab(this.tabContentEl);
        break;
      case "typography":
        this.renderTypographyTab(this.tabContentEl);
        break;
      case "templates":
        this.renderTemplatesTab(this.tabContentEl);
        break;
    }
  }
  /**
   * 渲染模板管理标签页
   */
  renderTemplatesTab(container) {
    const userTemplates = this.plugin.templateManager.getUserTemplates();
    new import_obsidian.Setting(container).setName("\u6211\u7684\u6A21\u677F").setDesc("\u7BA1\u7406\u4F60\u4FDD\u5B58\u7684\u81EA\u5B9A\u4E49\u6A21\u677F\uFF08\u7CFB\u7EDF\u5185\u7F6E\u6A21\u677F\u4E0D\u53EF\u5220\u9664\uFF09");
    if (userTemplates.length === 0) {
      const empty = container.createDiv({ cls: "papercraft-template-empty" });
      empty.createEl("p", {
        text: "\u{1F4DD} \u6682\u65E0\u81EA\u5B9A\u4E49\u6A21\u677F",
        cls: "papercraft-template-empty-title"
      });
      empty.createEl("p", {
        text: "\u5728\u8BBE\u7F6E\u9762\u677F\u5E95\u90E8\u70B9\u51FB\u300C\u4FDD\u5B58\u4E3A\u65B0\u6A21\u677F\u300D\u53EF\u521B\u5EFA\u81EA\u5B9A\u4E49\u6A21\u677F\u3002",
        cls: "papercraft-template-empty-hint"
      });
      return;
    }
    const listEl = container.createDiv({ cls: "papercraft-template-list" });
    userTemplates.forEach((template) => {
      var _a, _b, _c, _d;
      const itemEl = listEl.createDiv({ cls: "papercraft-template-item" });
      const infoEl = itemEl.createDiv({ cls: "papercraft-template-item-info" });
      infoEl.createEl("div", { text: template.name, cls: "papercraft-template-item-name" });
      const desc = ((_a = template.settings.lines) == null ? void 0 : _a.pattern) === "none" ? "\u7EAF\u8272\u6A21\u677F" : `\u7EBF\u6761\uFF1A${this.patternLabel((_b = template.settings.lines) == null ? void 0 : _b.pattern)} \xB7 \u5B57\u53F7\uFF1A${(_d = (_c = template.settings.typography) == null ? void 0 : _c.fontSize) != null ? _d : 16}px`;
      infoEl.createEl("div", { text: desc, cls: "papercraft-template-item-desc" });
      const actionsEl = itemEl.createDiv({ cls: "papercraft-template-item-actions" });
      const applyBtn = actionsEl.createEl("button", {
        text: "\u5E94\u7528",
        cls: "papercraft-template-item-apply"
      });
      applyBtn.addEventListener("click", () => {
        this.plugin.templateManager.applyTemplate(template.id);
        new import_obsidian.Notice(`\u5DF2\u5E94\u7528\u6A21\u677F\uFF1A${template.name}`);
      });
      const deleteBtn = actionsEl.createEl("button", {
        text: "\u5220\u9664",
        cls: "papercraft-template-item-delete"
      });
      deleteBtn.addEventListener("click", () => {
        const confirmed = confirm(`\u786E\u5B9A\u8981\u5220\u9664\u6A21\u677F\u300C${template.name}\u300D\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`);
        if (confirmed) {
          this.plugin.templateManager.deleteUserTemplate(template.id);
          new import_obsidian.Notice(`\u5DF2\u5220\u9664\u6A21\u677F\uFF1A${template.name}`);
          this.renderTabContent();
        }
      });
    });
  }
  /**
   * 线条模式中文标签
   */
  patternLabel(pattern) {
    var _a;
    const map = {
      none: "\u65E0",
      horizontal: "\u6A2A\u7EBF",
      vertical: "\u7AD6\u7EBF",
      grid: "\u65B9\u683C",
      dot: "\u70B9\u9635"
    };
    return (_a = map[pattern != null ? pattern : "none"]) != null ? _a : "\u65E0";
  }
  renderTextureTab(container) {
    new import_obsidian.Setting(container).setName("\u7EB9\u7406\u7C7B\u578B").addDropdown((dropdown) => {
      dropdown.addOption("none", "\u65E0");
      dropdown.addOption("kraft", "\u725B\u76AE\u7EB8");
      dropdown.addOption("xuan", "\u5BA3\u7EB8");
      dropdown.addOption("concrete", "\u6DF7\u51DD\u571F");
      dropdown.addOption("linen", "\u4E9A\u9EBB");
      dropdown.setValue(this.getDraft().texture.type);
      dropdown.onChange((value) => {
        this.getDraft().texture.type = value;
        this.refreshPreview();
      });
    });
    new import_obsidian.Setting(container).setName("\u7EB9\u7406\u900F\u660E\u5EA6").setDesc("\u63A7\u5236\u7EB9\u7406\u7684\u53EF\u89C1\u7A0B\u5EA6").addSlider((slider) => {
      slider.setLimits(0, 1, 0.01);
      slider.setValue(this.getDraft().texture.textureOpacity);
      slider.onChange((value) => {
        this.getDraft().texture.textureOpacity = value;
        this.refreshPreview();
      });
    });
    new import_obsidian.Setting(container).setName("\u7EB9\u7406\u7F29\u653E").setDesc("\u8C03\u6574\u7EB9\u7406\u7684\u5927\u5C0F\u6BD4\u4F8B").addSlider((slider) => {
      slider.setLimits(0.5, 2, 0.1);
      slider.setValue(this.getDraft().texture.textureScale);
      slider.onChange((value) => {
        this.getDraft().texture.textureScale = value;
        this.refreshPreview();
      });
    });
  }
  renderLinesTab(container) {
    new import_obsidian.Setting(container).setName("\u7EBF\u6761\u7C7B\u578B").addDropdown((dropdown) => {
      dropdown.addOption("none", "\u65E0");
      dropdown.addOption("horizontal", "\u6A2A\u7EBF");
      dropdown.addOption("vertical", "\u7AD6\u7EBF");
      dropdown.addOption("grid", "\u65B9\u683C");
      dropdown.addOption("dot", "\u70B9\u9635");
      dropdown.setValue(this.getDraft().lines.pattern);
      dropdown.onChange((value) => {
        this.getDraft().lines.pattern = value;
        this.refreshPreview();
      });
    });
    new import_obsidian.Setting(container).setName("\u7EBF\u6761\u95F4\u8DDD (px)").addText((text) => {
      text.setValue(String(this.getDraft().lines.gap));
      text.onChange((value) => {
        const num = parseInt(value);
        if (!isNaN(num) && num > 0) {
          this.getDraft().lines.gap = num;
          this.refreshPreview();
        }
      });
    });
    new import_obsidian.Setting(container).setName("\u7EBF\u6761\u7C97\u7EC6 (px)").setDesc("\u8C03\u6574\u7EBF\u6761\u7684\u7C97\u7EC6").addSlider((slider) => {
      slider.setLimits(0.1, 2, 0.1);
      slider.setValue(this.getDraft().lines.thickness);
      slider.onChange((value) => {
        this.getDraft().lines.thickness = value;
        this.refreshPreview();
      });
    });
    new import_obsidian.Setting(container).setName("\u7EBF\u6761\u989C\u8272").addColorPicker((color) => {
      color.setValue(this.rgbToHex(this.getDraft().lines.color));
      color.onChange((value) => {
        this.getDraft().lines.color = value;
        this.refreshPreview();
      });
    });
  }
  renderColorsTab(container) {
    new import_obsidian.Setting(container).setName("\u7EB8\u5F20\u80CC\u666F\u8272").addColorPicker((color) => {
      color.setValue(this.rgbToHex(this.getDraft().colors.paperBackground));
      color.onChange((value) => {
        this.getDraft().colors.paperBackground = value;
        this.refreshPreview();
      });
    });
    new import_obsidian.Setting(container).setName("\u6587\u5B57\u989C\u8272").addColorPicker((color) => {
      color.setValue(this.rgbToHex(this.getDraft().colors.textColor));
      color.onChange((value) => {
        this.getDraft().colors.textColor = value;
        this.refreshPreview();
      });
    });
  }
  renderTypographyTab(container) {
    new import_obsidian.Setting(container).setName("\u5B57\u4F53").addDropdown((dropdown) => {
      dropdown.addOption("", "\u81EA\u5B9A\u4E49\uFF08\u624B\u52A8\u8F93\u5165\uFF09");
      Object.entries(FONT_PRESETS).forEach(([value, label]) => {
        dropdown.addOption(value, label);
      });
      dropdown.setValue(this.getDraft().typography.fontFamily);
      dropdown.onChange((value) => {
        this.getDraft().typography.fontFamily = value;
        this.refreshPreview();
      });
    });
    new import_obsidian.Setting(container).setName("\u81EA\u5B9A\u4E49\u5B57\u4F53\u540D\u79F0").setDesc("\u5982\u679C\u9884\u8BBE\u5B57\u4F53\u4E0D\u6EE1\u8DB3\u9700\u6C42\uFF0C\u53EF\u5728\u6B64\u624B\u52A8\u8F93\u5165\u5B57\u4F53\u540D\u79F0").addText((text) => {
      text.setValue(this.getDraft().typography.fontFamily);
      text.setPlaceholder("\u8F93\u5165\u5B57\u4F53\u540D\u79F0...");
      text.onChange((value) => {
        this.getDraft().typography.fontFamily = value;
        this.refreshPreview();
      });
    });
    new import_obsidian.Setting(container).setName("\u5B57\u53F7 (px)").addText((text) => {
      text.setValue(String(this.getDraft().typography.fontSize));
      text.onChange((value) => {
        const num = parseInt(value);
        if (!isNaN(num) && num > 0) {
          this.getDraft().typography.fontSize = num;
          this.refreshPreview();
        }
      });
    });
    new import_obsidian.Setting(container).setName("\u5B57\u95F4\u8DDD (em)").setDesc("\u8C03\u6574\u5B57\u7B26\u4E4B\u95F4\u7684\u95F4\u8DDD").addSlider((slider) => {
      slider.setLimits(0, 0.5, 0.01);
      slider.setValue(this.getDraft().typography.letterSpacing);
      slider.onChange((value) => {
        this.getDraft().typography.letterSpacing = value;
        this.refreshPreview();
      });
    });
    new import_obsidian.Setting(container).setName("\u884C\u9AD8").setDesc("\u8C03\u6574\u884C\u4E0E\u884C\u4E4B\u95F4\u7684\u95F4\u8DDD").addSlider((slider) => {
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
  getDraft() {
    if (!this.draftSettings) {
      this.draftSettings = this.cloneSettings(this.plugin.settings);
    }
    return this.draftSettings;
  }
  /**
   * 类型安全地深克隆 settings
   */
  cloneSettings(settings) {
    return JSON.parse(JSON.stringify(settings));
  }
  /**
   * 构建操作按钮区（竖向排列）
   */
  buildActionButtons(container) {
    const btnContainer = container.createDiv({ cls: "papercraft-action-buttons-vertical" });
    const applyBtn = btnContainer.createEl("button", {
      text: "\u5E94\u7528\u5230\u7B14\u8BB0",
      cls: "papercraft-action-btn mod-cta"
    });
    applyBtn.addEventListener("click", () => {
      void this.handleApplyClick();
    });
    const saveBtn = btnContainer.createEl("button", {
      text: "\u4FDD\u5B58\u4E3A\u65B0\u6A21\u677F",
      cls: "papercraft-action-btn"
    });
    saveBtn.addEventListener("click", () => {
      if (this.draftSettings) {
        new TemplateNameModal(this.app, this.plugin, (name) => {
          void this.handleSaveTemplate(name);
        }).open();
      }
    });
    const importBtn = btnContainer.createEl("button", {
      text: "\u5BFC\u5165 CSS",
      cls: "papercraft-action-btn"
    });
    importBtn.addEventListener("click", () => {
      new CSSImportModal(this.app, this.plugin, (importedSettings) => {
        this.draftSettings = this.cloneSettings(DEFAULT_SETTINGS);
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
        this.renderUI();
      }).open();
    });
    const resetBtn = btnContainer.createEl("button", {
      text: "\u91CD\u7F6E\u9884\u89C8",
      cls: "papercraft-action-btn"
    });
    resetBtn.addEventListener("click", () => {
      this.draftSettings = this.cloneSettings(DEFAULT_SETTINGS);
      this.refreshPreview();
      this.renderUI();
      new import_obsidian.Notice("\u9884\u89C8\u5DF2\u91CD\u7F6E");
    });
  }
  /**
   * 处理"应用到笔记"按钮点击（异步逻辑拆出，避免 Promise 警告）
   */
  async handleApplyClick() {
    if (this.draftSettings) {
      Object.assign(this.plugin.settings, this.cloneSettings(this.draftSettings));
      await this.plugin.saveSettings();
      this.plugin.refreshTheme();
      new import_obsidian.Notice("\u5DF2\u5E94\u7528\u5230\u5F53\u524D\u7B14\u8BB0");
    }
  }
  /**
   * 处理"保存为模板"回调（异步逻辑拆出，避免 Promise 警告）
   */
  async handleSaveTemplate(name) {
    if (!this.draftSettings)
      return;
    const template = {
      id: `custom-${Date.now()}`,
      name,
      category: "user",
      settings: {
        texture: this.draftSettings.texture,
        lines: this.draftSettings.lines,
        colors: this.draftSettings.colors,
        typography: this.draftSettings.typography
      }
    };
    this.plugin.templateManager.addUserTemplate(template);
    new import_obsidian.Notice(`\u6A21\u677F"${name}"\u5DF2\u4FDD\u5B58`);
  }
  /**
   * 构建实时预览区
   */
  buildPreview(container) {
    const wrapper = container.createDiv({ cls: "papercraft-preview-wrapper" });
    wrapper.createDiv({ cls: "papercraft-preview-title", text: '\u5B9E\u65F6\u9884\u89C8\uFF08\u8C03\u6574\u53C2\u6570\u6B64\u5904\u53D8\u5316\uFF0C\u70B9\u51FB"\u5E94\u7528\u5230\u7B14\u8BB0"\u624D\u751F\u6548\uFF09' });
    const previewBox = wrapper.createDiv({ cls: "papercraft-preview-box" });
    this.previewPage = previewBox.createDiv({ cls: "papercraft-preview-page" });
    const sampleTexts = [
      "\u843D\u971E\u4E0E\u5B64\u9E5C\u9F50\u98DE\uFF0C\u79CB\u6C34\u5171\u957F\u5929\u4E00\u8272\u3002",
      "\u6E14\u821F\u5531\u665A\uFF0C\u54CD\u7A77\u5F6D\u8821\u4E4B\u6EE8\uFF1B",
      "\u96C1\u9635\u60CA\u5BD2\uFF0C\u58F0\u65AD\u8861\u9633\u4E4B\u6D66\u3002",
      "\u9065\u895F\u752B\u7545\uFF0C\u9038\u5174\u9044\u98DE\u3002"
    ];
    sampleTexts.forEach((text) => {
      var _a;
      (_a = this.previewPage) == null ? void 0 : _a.createDiv({ cls: "papercraft-preview-line", text });
    });
    this.refreshPreview();
  }
  /**
   * 刷新预览区样式（包含纹理渲染）
   */
  refreshPreview() {
    if (!this.previewPage)
      return;
    const draft = this.getDraft();
    const bgColor = draft.colors.paperBackground || "#FFFFFF";
    const allLayers = [];
    const allSizes = [];
    const allRepeats = [];
    if (draft.texture.type !== "none") {
      const opacity = draft.texture.textureOpacity || 0.15;
      switch (draft.texture.type) {
        case "kraft":
          allLayers.push(
            `repeating-linear-gradient(45deg, rgba(139,90,43,${opacity * 0.5}) 0px, transparent 2px, transparent 6px)`,
            `repeating-linear-gradient(-30deg, rgba(160,120,60,${opacity * 0.3}) 0px, transparent 1px, transparent 8px)`
          );
          allSizes.push("100% 100%", "100% 100%");
          allRepeats.push("repeat", "repeat");
          break;
        case "xuan":
          allLayers.push(
            `repeating-linear-gradient(0deg, rgba(200,180,150,${opacity * 0.4}) 0px, transparent 1px, transparent 12px)`,
            `repeating-linear-gradient(90deg, rgba(200,180,150,${opacity * 0.3}) 0px, transparent 1px, transparent 15px)`
          );
          allSizes.push("100% 100%", "100% 100%");
          allRepeats.push("repeat", "repeat");
          break;
        case "concrete":
          allLayers.push(
            `repeating-linear-gradient(60deg, rgba(120,120,120,${opacity * 0.4}) 0px, transparent 1px, transparent 5px)`,
            `repeating-linear-gradient(-45deg, rgba(100,100,100,${opacity * 0.3}) 0px, transparent 1px, transparent 7px)`
          );
          allSizes.push("100% 100%", "100% 100%");
          allRepeats.push("repeat", "repeat");
          break;
        case "linen":
          allLayers.push(
            `repeating-linear-gradient(0deg, rgba(180,160,140,${opacity * 0.5}) 0px, transparent 1px, transparent 3px)`,
            `repeating-linear-gradient(90deg, rgba(180,160,140,${opacity * 0.4}) 0px, transparent 1px, transparent 4px)`
          );
          allSizes.push("100% 100%", "100% 100%");
          allRepeats.push("repeat", "repeat");
          break;
      }
    }
    const lines = draft.lines;
    if (lines.pattern !== "none") {
      const gap = lines.gap || 32;
      const thick = lines.thickness || 0.5;
      const gapMinus = gap - thick;
      const color2 = lines.color || "rgba(100, 100, 100, 0.3)";
      switch (lines.pattern) {
        case "horizontal":
          allLayers.push(`repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color2} ${gapMinus}px, ${color2} ${gap}px)`);
          allSizes.push("100% 100%");
          allRepeats.push("repeat");
          break;
        case "vertical":
          allLayers.push(`repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color2} ${gapMinus}px, ${color2} ${gap}px)`);
          allSizes.push("100% 100%");
          allRepeats.push("repeat");
          break;
        case "grid":
          allLayers.push(
            `repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color2} ${gapMinus}px, ${color2} ${gap}px)`,
            `repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color2} ${gapMinus}px, ${color2} ${gap}px)`
          );
          allSizes.push("100% 100%", "100% 100%");
          allRepeats.push("repeat", "repeat");
          break;
        case "dot":
          allLayers.push(`radial-gradient(circle at center, ${color2} 0.6px, transparent 1px)`);
          allSizes.push(`${gap}px ${gap}px`);
          allRepeats.push("repeat");
          break;
      }
    }
    const backgroundImage = allLayers.length > 0 ? allLayers.join(", ") : "none";
    const backgroundSize = allSizes.length > 0 ? allSizes.join(", ") : "";
    const backgroundRepeat = allRepeats.length > 0 ? allRepeats.join(", ") : "";
    const scale = 0.5;
    const pm = draft.typography.pageMargin;
    const paddingTop = `${Math.round(((pm == null ? void 0 : pm.top) || 0) * scale)}px`;
    const paddingRight = `${Math.round(((pm == null ? void 0 : pm.right) || 0) * scale)}px`;
    const paddingBottom = `${Math.round(((pm == null ? void 0 : pm.bottom) || 0) * scale)}px`;
    const paddingLeft = `${Math.round(((pm == null ? void 0 : pm.left) || 0) * scale)}px`;
    const fontFamily = draft.typography.fontFamily || "";
    const fontSize = Math.max(10, Math.round((draft.typography.fontSize || 16) * 0.7));
    const lineHeight = String(draft.typography.lineHeight || 1.65);
    const letterSpacing = `${draft.typography.letterSpacing || 0}em`;
    const color = draft.colors.textColor || "#333333";
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
      color
    });
  }
  /**
   * RGB 转 Hex
   */
  rgbToHex(color) {
    if (!color)
      return "#FFFFFF";
    if (color.startsWith("#"))
      return color;
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
    }
    return "#FFFFFF";
  }
};

// src/engine/CSSGenerator.ts
var CSSGenerator = class {
  /**
   * 生成 CSS 变量字典
   */
  generateVariables(settings) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const variables = {};
    variables["--papercraft-paper-bg"] = ((_a = settings.colors) == null ? void 0 : _a.paperBackground) || "#FFFFFF";
    variables["--papercraft-text-color"] = ((_b = settings.colors) == null ? void 0 : _b.textColor) || "#333333";
    variables["--papercraft-line-color"] = ((_c = settings.lines) == null ? void 0 : _c.color) || "rgba(100, 100, 100, 0.3)";
    variables["--papercraft-font-family"] = ((_d = settings.typography) == null ? void 0 : _d.fontFamily) || "inherit";
    variables["--papercraft-font-size"] = `${((_e = settings.typography) == null ? void 0 : _e.fontSize) || 16}px`;
    variables["--papercraft-line-height"] = String(((_f = settings.typography) == null ? void 0 : _f.lineHeight) || 1.6);
    variables["--papercraft-letter-spacing"] = `${((_g = settings.typography) == null ? void 0 : _g.letterSpacing) || 0}em`;
    const pm = (_h = settings.typography) == null ? void 0 : _h.pageMargin;
    variables["--papercraft-padding-top"] = `${(pm == null ? void 0 : pm.top) || 0}px`;
    variables["--papercraft-padding-right"] = `${(pm == null ? void 0 : pm.right) || 0}px`;
    variables["--papercraft-padding-bottom"] = `${(pm == null ? void 0 : pm.bottom) || 0}px`;
    variables["--papercraft-padding-left"] = `${(pm == null ? void 0 : pm.left) || 0}px`;
    variables["--papercraft-bg-image"] = this.buildBackgroundImage(settings);
    variables["--papercraft-bg-size"] = this.buildBackgroundSize(settings);
    variables["--papercraft-bg-repeat"] = "repeat";
    return variables;
  }
  /**
   * 生成空变量（用于清除）
   */
  generateClearVariables() {
    return {
      "--papercraft-paper-bg": "#FFFFFF",
      "--papercraft-text-color": "#333333",
      "--papercraft-line-color": "rgba(100, 100, 100, 0.3)",
      "--papercraft-font-family": "inherit",
      "--papercraft-font-size": "16px",
      "--papercraft-line-height": "1.6",
      "--papercraft-letter-spacing": "0em",
      "--papercraft-bg-image": "none",
      "--papercraft-bg-size": "auto",
      "--papercraft-bg-repeat": "repeat",
      "--papercraft-padding-top": "0px",
      "--papercraft-padding-right": "0px",
      "--papercraft-padding-bottom": "0px",
      "--papercraft-padding-left": "0px"
    };
  }
  /**
   * 构建 background-image 值
   */
  buildBackgroundImage(settings) {
    const layers = [];
    const textureLayer = this.buildTextureLayer(settings);
    if (textureLayer)
      layers.push(textureLayer);
    const lineLayers = this.buildLineLayers(settings);
    layers.push(...lineLayers);
    return layers.length > 0 ? layers.join(", ") : "none";
  }
  /**
   * 构建 background-size 值
   */
  buildBackgroundSize(settings) {
    var _a, _b;
    const sizes = [];
    if (((_a = settings.texture) == null ? void 0 : _a.type) && settings.texture.type !== "none") {
      sizes.push("100% 100%", "100% 100%");
    }
    if (((_b = settings.lines) == null ? void 0 : _b.pattern) && settings.lines.pattern !== "none") {
      const gap = settings.lines.gap || 32;
      if (settings.lines.pattern === "dot") {
        sizes.push(`${gap}px ${gap}px`);
      } else {
        sizes.push("100% 100%");
        if (settings.lines.pattern === "grid") {
          sizes.push("100% 100%");
        }
      }
    }
    return sizes.length > 0 ? sizes.join(", ") : "auto";
  }
  /**
   * 纹理层
   */
  buildTextureLayer(settings) {
    const texture = settings.texture;
    if (!texture || texture.type === "none")
      return null;
    const opacity = texture.textureOpacity || 0.15;
    switch (texture.type) {
      case "kraft":
        return `repeating-linear-gradient(45deg, rgba(139,90,43,${opacity * 0.5}) 0px, transparent 2px, transparent 6px), repeating-linear-gradient(-30deg, rgba(160,120,60,${opacity * 0.3}) 0px, transparent 1px, transparent 8px)`;
      case "xuan":
        return `repeating-linear-gradient(0deg, rgba(200,180,150,${opacity * 0.4}) 0px, transparent 1px, transparent 12px), repeating-linear-gradient(90deg, rgba(200,180,150,${opacity * 0.3}) 0px, transparent 1px, transparent 15px)`;
      case "concrete":
        return `repeating-linear-gradient(60deg, rgba(120,120,120,${opacity * 0.4}) 0px, transparent 1px, transparent 5px), repeating-linear-gradient(-45deg, rgba(100,100,100,${opacity * 0.3}) 0px, transparent 1px, transparent 7px)`;
      case "linen":
        return `repeating-linear-gradient(0deg, rgba(180,160,140,${opacity * 0.5}) 0px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(180,160,140,${opacity * 0.4}) 0px, transparent 1px, transparent 4px)`;
      default:
        return null;
    }
  }
  /**
   * 线条层
   */
  buildLineLayers(settings) {
    const lines = settings.lines;
    if (!lines || lines.pattern === "none")
      return [];
    const gap = lines.gap || 32;
    const thick = lines.thickness || 0.5;
    const gapMinus = gap - thick;
    const color = lines.color || "rgba(100, 100, 100, 0.3)";
    switch (lines.pattern) {
      case "horizontal":
        return [`repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`];
      case "vertical":
        return [`repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`];
      case "grid":
        return [
          `repeating-linear-gradient(0deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`,
          `repeating-linear-gradient(90deg, transparent 0px, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`
        ];
      case "dot":
        return [`radial-gradient(circle at center, ${color} 0.6px, transparent 1px)`];
      default:
        return [];
    }
  }
};

// src/engine/ThemeApplier.ts
var ThemeApplier = class {
  constructor(_plugin) {
    this.generator = new CSSGenerator();
  }
  /**
   * 应用主题：通过设置容器 CSS 变量动态改变样式
   */
  apply(settings, containerEl) {
    const variables = this.generator.generateVariables(settings);
    this.setCssVariables(containerEl, variables);
    containerEl.addClass("papercraft-active");
  }
  /**
   * 清除主题
   */
  clear() {
  }
  /**
   * 在容器上设置 CSS 变量
   */
  setCssVariables(containerEl, variables) {
    Object.entries(variables).forEach(([key, value]) => {
      containerEl.style.setProperty(key, value);
    });
  }
  /**
   * 移除主题（保留接口兼容性）
   */
  remove() {
  }
};

// src/templates/TemplateManager.ts
var TemplateManager = class {
  constructor(plugin) {
    this.builtinTemplates = [];
    this.userTemplates = [];
    this.plugin = plugin;
    this.loadBuiltinTemplates();
    this.loadUserTemplates();
  }
  /**
   * 加载内置模板
   */
  loadBuiltinTemplates() {
    this.builtinTemplates = [
      // 8 个从用户 snippets 提取的模板
      {
        id: "moon-white",
        name: "\u6708\u767D",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "horizontal", gap: 38, thickness: 0.5, color: "rgba(180, 195, 220, 0.30)" },
          colors: { paperBackground: "#F0F3F8", textColor: "#2C3E50", preset: "custom" },
          typography: { fontFamily: "KaiTi", fontSize: 20, letterSpacing: 0.02, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 30, right: 40, bottom: 30, left: 60 } }
        }
      },
      {
        id: "star-dot",
        name: "\u661F\u70B9",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 28, thickness: 1.5, color: "rgba(155, 150, 140, 0.45)" },
          colors: { paperBackground: "#F7F5F0", textColor: "#4A4A3A", preset: "custom" },
          typography: { fontFamily: "STKaiti", fontSize: 20, letterSpacing: 0.03, lineHeight: 1.7, paragraphSpacing: 10, pageMargin: { top: 35, right: 45, bottom: 35, left: 55 } }
        }
      },
      {
        id: "mint-shadow",
        name: "\u8584\u8377\u788E\u5F71",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "horizontal", gap: 36, thickness: 0.6, color: "rgba(100, 180, 140, 0.28)" },
          colors: { paperBackground: "#E8F5E9", textColor: "#2D4A32", preset: "custom" },
          typography: { fontFamily: "Microsoft YaHei", fontSize: 20, letterSpacing: 0.01, lineHeight: 1.75, paragraphSpacing: 14, pageMargin: { top: 32, right: 38, bottom: 32, left: 58 } }
        }
      },
      {
        id: "old-book-grid",
        name: "\u65E7\u5377\u661F\u7802",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 32, thickness: 1, color: "rgba(139, 90, 43, 0.35)" },
          colors: { paperBackground: "#F5ECD6", textColor: "#4A3A2A", preset: "custom" },
          typography: { fontFamily: "STSong", fontSize: 21, letterSpacing: 0.05, lineHeight: 1.65, paragraphSpacing: 8, pageMargin: { top: 40, right: 50, bottom: 40, left: 65 } }
        }
      },
      {
        id: "rose-letter",
        name: "\u73AB\u7470\u843D\u82F1",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 38, thickness: 1.2, color: "rgba(200, 120, 140, 0.40)" },
          colors: { paperBackground: "#FFF8F2", textColor: "#5A3040", preset: "custom" },
          typography: { fontFamily: "KaiTi", fontSize: 20, letterSpacing: 0.04, lineHeight: 1.9, paragraphSpacing: 16, pageMargin: { top: 38, right: 55, bottom: 38, left: 75 } }
        }
      },
      {
        id: "sky-blue-grid",
        name: "\u6674\u7A7A\u788E\u7389",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 30, thickness: 1.2, color: "rgba(86, 170, 225, 0.40)" },
          colors: { paperBackground: "#E3F2FD", textColor: "#1A3A5A", preset: "custom" },
          typography: { fontFamily: "PingFang SC", fontSize: 20, letterSpacing: 0.02, lineHeight: 1.7, paragraphSpacing: 10, pageMargin: { top: 34, right: 42, bottom: 34, left: 62 } }
        }
      },
      {
        id: "bean-green",
        name: "\u8C46\u6C99\u6E05\u68A6",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "horizontal", gap: 40, thickness: 0.5, color: "rgba(100, 140, 110, 0.30)" },
          colors: { paperBackground: "#CCE8CF", textColor: "#2D4A32", preset: "custom" },
          typography: { fontFamily: "STFangsong", fontSize: 20, letterSpacing: 0.03, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 36, right: 48, bottom: 36, left: 68 } }
        }
      },
      // 8 个新增模板
      {
        id: "pure-white-grid",
        name: "\u7D20\u7B3A\u767D\u9732",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 28, thickness: 1, color: "rgba(180, 180, 180, 0.30)" },
          colors: { paperBackground: "#FFFFFF", textColor: "#1A1A1A", preset: "custom" },
          typography: { fontFamily: "Microsoft YaHei", fontSize: 20, letterSpacing: 0.01, lineHeight: 1.6, paragraphSpacing: 8, pageMargin: { top: 30, right: 40, bottom: 30, left: 60 } }
        }
      },
      {
        id: "ink-blue-lines",
        name: "\u58A8\u84DD\u6A2A\u7EBF",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "horizontal", gap: 36, thickness: 0.7, color: "rgba(40, 80, 120, 0.35)" },
          colors: { paperBackground: "#F5F9FC", textColor: "#2C3E50", preset: "custom" },
          typography: { fontFamily: "SimSun", fontSize: 20, letterSpacing: 0.02, lineHeight: 1.8, paragraphSpacing: 12, pageMargin: { top: 34, right: 44, bottom: 34, left: 64 } }
        }
      },
      {
        id: "light-purple-grid",
        name: "\u6DE1\u7D2B\u5FAE\u96E8",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 32, thickness: 1.2, color: "rgba(150, 120, 180, 0.35)" },
          colors: { paperBackground: "#F3E5F5", textColor: "#4A148C", preset: "custom" },
          typography: { fontFamily: "KaiTi", fontSize: 20, letterSpacing: 0.03, lineHeight: 1.75, paragraphSpacing: 10, pageMargin: { top: 36, right: 46, bottom: 36, left: 66 } }
        }
      },
      {
        id: "mint-lines",
        name: "\u8584\u8377\u6A2A\u7EBF",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "horizontal", gap: 38, thickness: 0.5, color: "rgba(80, 160, 120, 0.30)" },
          colors: { paperBackground: "#E8F5E9", textColor: "#1B5E20", preset: "custom" },
          typography: { fontFamily: "PingFang SC", fontSize: 20, letterSpacing: 0.02, lineHeight: 1.8, paragraphSpacing: 14, pageMargin: { top: 32, right: 42, bottom: 32, left: 62 } }
        }
      },
      {
        id: "charcoal-dots",
        name: "\u70AD\u7070\u661F\u70B9",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 30, thickness: 1, color: "rgba(100, 100, 100, 0.40)" },
          colors: { paperBackground: "#F5F5F5", textColor: "#212121", preset: "custom" },
          typography: { fontFamily: "STKaiti", fontSize: 20, letterSpacing: 0.02, lineHeight: 1.7, paragraphSpacing: 9, pageMargin: { top: 34, right: 44, bottom: 34, left: 64 } }
        }
      },
      {
        id: "warm-yellow",
        name: "\u6696\u9EC4\u6D41\u5149",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 34, thickness: 1.2, color: "rgba(180, 140, 80, 0.40)" },
          colors: { paperBackground: "#FFF8E1", textColor: "#4A3A1A", preset: "custom" },
          typography: { fontFamily: "STSong", fontSize: 21, letterSpacing: 0.04, lineHeight: 1.75, paragraphSpacing: 11, pageMargin: { top: 38, right: 50, bottom: 38, left: 70 } }
        }
      },
      {
        id: "peach-paper",
        name: "\u6843\u82B1\u62FE\u9057",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "dot", gap: 40, thickness: 1.2, color: "rgba(220, 120, 140, 0.35)" },
          colors: { paperBackground: "#FCE4EC", textColor: "#880E4F", preset: "custom" },
          typography: { fontFamily: "STFangsong", fontSize: 20, letterSpacing: 0.04, lineHeight: 1.9, paragraphSpacing: 16, pageMargin: { top: 40, right: 55, bottom: 40, left: 75 } }
        }
      },
      {
        id: "ancient-vertical",
        name: "\u53E4\u98CE\u9057\u97F5",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "vertical", gap: 36, thickness: 0.4, color: "rgba(120, 100, 80, 0.30)" },
          colors: { paperBackground: "#F5ECD6", textColor: "#3E2723", preset: "custom" },
          typography: { fontFamily: "STSong", fontSize: 21, letterSpacing: 0.06, lineHeight: 1.8, paragraphSpacing: 10, pageMargin: { top: 45, right: 60, bottom: 45, left: 80 } }
        }
      },
      {
        id: "modern-minimal",
        name: "\u73B0\u4EE3\u6781\u7B80",
        category: "builtin",
        settings: {
          texture: { type: "none", textureOpacity: 0, textureScale: 1 },
          lines: { pattern: "none", gap: 38, thickness: 0.5, color: "rgba(0, 0, 0, 0)" },
          colors: { paperBackground: "#FAFAFA", textColor: "#424242", preset: "custom" },
          typography: { fontFamily: "Helvetica Neue", fontSize: 20, letterSpacing: 0.01, lineHeight: 1.65, paragraphSpacing: 12, pageMargin: { top: 30, right: 40, bottom: 30, left: 60 } }
        }
      }
    ];
  }
  /**
   * 加载用户自定义模板
   */
  loadUserTemplates() {
    this.userTemplates = [];
  }
  /**
   * 获取所有内置模板
   */
  getBuiltinTemplates() {
    return this.builtinTemplates;
  }
  /**
   * 获取所有用户模板
   */
  getUserTemplates() {
    return this.userTemplates;
  }
  /**
   * 根据 ID 获取模板
   */
  getTemplateById(id) {
    return this.builtinTemplates.find((t2) => t2.id === id) || this.userTemplates.find((t2) => t2.id === id);
  }
  /**
   * 应用模板（深合并）
   */
  applyTemplate(templateId) {
    const template = this.getTemplateById(templateId);
    if (!template) {
      return false;
    }
    const s = template.settings;
    const settings = this.plugin.settings;
    if (s.texture) {
      settings.texture = { ...settings.texture, ...s.texture };
    }
    if (s.lines) {
      settings.lines = { ...settings.lines, ...s.lines };
    }
    if (s.colors) {
      settings.colors = { ...settings.colors, ...s.colors };
    }
    if (s.typography) {
      settings.typography = { ...settings.typography, ...s.typography };
      if (s.typography.pageMargin) {
        settings.typography.pageMargin = {
          ...settings.typography.pageMargin,
          ...s.typography.pageMargin
        };
      }
    }
    settings.activeTemplate = templateId;
    void this.plugin.saveSettings();
    this.plugin.refreshTheme();
    return true;
  }
  /**
   * 添加用户模板
   */
  addUserTemplate(template) {
    this.userTemplates.push(template);
  }
  /**
   * 删除用户模板
   */
  deleteUserTemplate(templateId) {
    const index = this.userTemplates.findIndex((t2) => t2.id === templateId);
    if (index === -1)
      return false;
    this.userTemplates.splice(index, 1);
    return true;
  }
};

// src/sidebar/PaperCraftView.ts
var import_obsidian2 = require("obsidian");

// src/i18n/i18n.ts
var translations = {
  "zh-CN": {
    "sidebar.title": "PaperCraft",
    "sidebar.builtin": "\u5185\u7F6E\u6A21\u677F",
    "sidebar.custom": "\u81EA\u5B9A\u4E49\u6A21\u677F",
    "sidebar.noCustom": "\u6682\u65E0\u81EA\u5B9A\u4E49\u6A21\u677F",
    "sidebar.clearFormat": "\u6E05\u9664\u683C\u5F0F",
    "sidebar.openSettings": "\u6253\u5F00\u8BBE\u7F6E",
    "settings.title": "PaperCraft \u8BBE\u7F6E",
    "settings.texture": "\u7EB8\u5F20\u8D28\u611F",
    "settings.lines": "\u6761\u7EB9\u56FE\u6848",
    "settings.colors": "\u989C\u8272\u914D\u8272",
    "settings.typography": "\u5B57\u4F53\u6392\u7248",
    "settings.drawing": "\u624B\u7ED8\u56FE\u5C42",
    "settings.template": "\u6A21\u677F\u7BA1\u7406",
    "settings.language": "\u8BED\u8A00",
    "settings.version": "\u7248\u672C"
  },
  "en": {
    "sidebar.title": "PaperCraft",
    "sidebar.builtin": "Built-in Templates",
    "sidebar.custom": "Custom Templates",
    "sidebar.noCustom": "No custom templates yet",
    "sidebar.clearFormat": "Clear Format",
    "sidebar.openSettings": "Open Settings",
    "settings.title": "PaperCraft Settings",
    "settings.texture": "Paper Texture",
    "settings.lines": "Line Pattern",
    "settings.colors": "Color Scheme",
    "settings.typography": "Typography",
    "settings.drawing": "Drawing Layer",
    "settings.template": "Template Management",
    "settings.language": "Language",
    "settings.version": "Version"
  },
  "ja": {
    "sidebar.title": "\u7A3F\u7D19\u5DE5\u623F",
    "sidebar.builtin": "\u7D44\u307F\u8FBC\u307F\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8",
    "sidebar.custom": "\u30AB\u30B9\u30BF\u30E0\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8",
    "sidebar.noCustom": "\u30AB\u30B9\u30BF\u30E0\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304C\u3042\u308A\u307E\u305B\u3093",
    "sidebar.clearFormat": "\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8\u3092\u30AF\u30EA\u30A2",
    "sidebar.openSettings": "\u8A2D\u5B9A\u3092\u958B\u304F",
    "settings.title": "\u7A3F\u7D19\u5DE5\u623F\u306E\u8A2D\u5B9A",
    "settings.texture": "\u7528\u7D19\u30C6\u30AF\u30B9\u30C1\u30E3",
    "settings.lines": "\u7DDA\u30D1\u30BF\u30FC\u30F3",
    "settings.colors": "\u914D\u8272",
    "settings.typography": "\u30BF\u30A4\u30DD\u30B0\u30E9\u30D5\u30A3",
    "settings.drawing": "\u624B\u63CF\u304D\u30EC\u30A4\u30E4\u30FC",
    "settings.template": "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u7BA1\u7406",
    "settings.language": "\u8A00\u8A9E",
    "settings.version": "\u30D0\u30FC\u30B8\u30E7\u30F3"
  }
};
function t(key, lang) {
  var _a;
  return ((_a = translations[lang]) == null ? void 0 : _a[key]) || translations["zh-CN"][key] || key;
}

// src/sidebar/PaperCraftView.ts
var VIEW_TYPE = "papercraft-view";
var PaperCraftView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return t("sidebar.title", this.getLang());
  }
  getIcon() {
    return "file-text";
  }
  async onOpen() {
    this.render();
    this.contentEl.addEventListener("click", (e) => {
      const target = e.target;
      const card = target.closest(".papercraft-template-card");
      if (card) {
        const templateId = card.dataset.templateId;
        if (templateId) {
          this.plugin.templateManager.applyTemplate(templateId);
          this.updateActiveCard(templateId);
        }
      }
    });
  }
  async onClose() {
  }
  /**
   * 公共刷新入口：供 main.ts 在设置变更时调用
   */
  refresh() {
    this.render();
  }
  getLang() {
    return this.plugin.settings.language || "zh-CN";
  }
  /**
   * 渲染侧边栏
   */
  render() {
    const container = this.contentEl;
    container.empty();
    container.addClass("papercraft-sidebar");
    const lang = this.getLang();
    const header = container.createDiv({ cls: "papercraft-sidebar-header" });
    const headerTop = header.createDiv({ cls: "papercraft-sidebar-header-top" });
    headerTop.createEl("h2", { text: t("sidebar.title", lang) });
    const iconGroup = headerTop.createDiv({ cls: "papercraft-header-icons" });
    const clearBtn = iconGroup.createEl("button", {
      cls: "papercraft-header-icon-btn",
      attr: { "aria-label": "\u6E05\u9664\u683C\u5F0F", title: "\u6E05\u9664\u683C\u5F0F\uFF08\u91CD\u7F6E\u5F53\u524D\u7B14\u8BB0\u6837\u5F0F\uFF09" }
    });
    clearBtn.setText("\u21BA");
    clearBtn.addEventListener("click", () => {
      this.plugin.settings.lines.pattern = "none";
      this.plugin.settings.texture.type = "none";
      this.plugin.settings.texture.textureOpacity = 0;
      this.plugin.settings.colors.paperBackground = "";
      this.plugin.settings.colors.textColor = "";
      this.plugin.settings.colors.preset = "custom";
      this.plugin.settings.typography.fontFamily = "";
      this.plugin.settings.typography.fontSize = 16;
      this.plugin.settings.typography.letterSpacing = 0;
      this.plugin.settings.typography.lineHeight = 1.6;
      this.plugin.settings.typography.paragraphSpacing = 0;
      this.plugin.settings.typography.pageMargin = { top: 0, right: 0, bottom: 0, left: 0 };
      this.plugin.settings.activeTemplate = "";
      void this.plugin.saveSettings();
      this.plugin.refreshTheme();
      this.render();
    });
    const settingsBtn = iconGroup.createEl("button", {
      cls: "papercraft-header-icon-btn",
      attr: { "aria-label": "\u8BBE\u7F6E", title: "\u8BBE\u7F6E" }
    });
    settingsBtn.setText("\u2699");
    settingsBtn.addEventListener("click", () => {
      const app = this.app;
      if (app.setting) {
        app.setting.open();
        app.setting.openTabById("papercraft");
      }
    });
    const builtinTemplates = this.plugin.templateManager.getBuiltinTemplates();
    const userTemplates = this.plugin.templateManager.getUserTemplates();
    const activeTemplateId = this.plugin.settings.activeTemplate || "";
    if (builtinTemplates.length > 0) {
      const section = container.createDiv({ cls: "papercraft-section" });
      section.createEl("h3", { text: t("sidebar.builtin", lang), cls: "papercraft-section-title" });
      const grid = section.createDiv({ cls: "papercraft-template-grid" });
      builtinTemplates.forEach((template) => {
        this.createTemplateCard(grid, template, template.id === activeTemplateId);
      });
    }
    const customSection = container.createDiv({ cls: "papercraft-section" });
    customSection.createEl("h3", { text: t("sidebar.custom", lang), cls: "papercraft-section-title" });
    if (userTemplates.length > 0) {
      const grid = customSection.createDiv({ cls: "papercraft-template-grid" });
      userTemplates.forEach((template) => {
        this.createTemplateCard(grid, template, template.id === activeTemplateId);
      });
    } else {
      customSection.createDiv({ cls: "papercraft-empty-hint" }).setText(t("sidebar.noCustom", lang));
    }
  }
  /**
   * 更新选中状态的卡片
   */
  updateActiveCard(templateId) {
    const cards = this.contentEl.querySelectorAll(".papercraft-template-card");
    cards.forEach((card) => {
      const htmlCard = card;
      if (htmlCard.dataset.templateId === templateId) {
        htmlCard.classList.add("active");
      } else {
        htmlCard.classList.remove("active");
      }
    });
  }
  /**
   * 创建模板卡片
   */
  createTemplateCard(parent, template, isActive) {
    const card = parent.createDiv({
      cls: `papercraft-template-card ${isActive ? "active" : ""}`
    });
    card.dataset.templateId = template.id;
    const thumb = card.createDiv({ cls: "papercraft-template-thumb" });
    this.applyThumbnailStyle(thumb, template);
    card.createDiv({ cls: "papercraft-template-name", text: template.name });
  }
  /**
   * 应用缩略图样式
   */
  applyThumbnailStyle(thumb, template) {
    var _a;
    const settings = template.settings;
    thumb.setCssStyles({
      backgroundColor: ((_a = settings.colors) == null ? void 0 : _a.paperBackground) || "#FFFFFF"
    });
    const lines = settings.lines;
    if (lines && lines.pattern !== "none") {
      const gap = 8;
      const thickness = 0.5;
      const gapMinus = gap - thickness;
      const color = lines.color || "rgba(100, 100, 100, 0.3)";
      let bgImage = "";
      let bgSize = "";
      let bgRepeat = "";
      switch (lines.pattern) {
        case "horizontal":
          bgImage = `repeating-linear-gradient(0deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
          break;
        case "vertical":
          bgImage = `repeating-linear-gradient(90deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
          break;
        case "grid": {
          const h = `repeating-linear-gradient(0deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
          const v = `repeating-linear-gradient(90deg, transparent 0, transparent ${gapMinus}px, ${color} ${gapMinus}px, ${color} ${gap}px)`;
          bgImage = `${h}, ${v}`;
          break;
        }
        case "dot":
          bgImage = `radial-gradient(circle at center, ${color} 0.5px, transparent 1px)`;
          bgSize = `${gap}px ${gap}px`;
          bgRepeat = "repeat";
          break;
      }
      if (bgImage) {
        thumb.setCssStyles({
          backgroundImage: bgImage,
          ...bgSize && { backgroundSize: bgSize },
          ...bgRepeat && { backgroundRepeat: bgRepeat }
        });
      }
    }
  }
};

// src/drawing/DrawingCanvas.ts
var import_obsidian3 = require("obsidian");
var SVG_NS = "http://www.w3.org/2000/svg";
var DrawingCanvas = class {
  constructor(plugin) {
    this.svgEl = null;
    this.activeTool = "select";
    this.toolConfig = {
      type: "select",
      strokeColor: "#E24B4A",
      strokeWidth: 1.5,
      opacity: 0.7
    };
    this.isDrawing = false;
    this.startPoint = [0, 0];
    this.currentPath = [];
    this.currentElement = null;
    this.plugin = plugin;
  }
  /**
   * 启用绘图功能
   */
  enable() {
    const activeView = this.plugin.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (activeView) {
      this.attachToView(activeView);
    }
  }
  /**
   * 禁用绘图功能
   */
  disable() {
    this.detach();
  }
  /**
   * 附加到指定视图
   */
  attachToView(view) {
    if (!this.plugin.settings.drawing.enabled)
      return;
    this.detach();
    const container = view.containerEl;
    const editorEl = container.querySelector(".markdown-source-view .cm-content") || container.querySelector(".markdown-preview-view");
    if (!editorEl)
      return;
    this.svgEl = document.createElementNS(SVG_NS, "svg");
    this.svgEl.classList.add("papercraft-drawing-layer");
    this.svgEl.setAttribute("width", "100%");
    this.svgEl.setAttribute("height", "100%");
    if (this.activeTool === "select") {
      this.svgEl.classList.add("papercraft-drawing-inactive");
    } else {
      this.svgEl.classList.remove("papercraft-drawing-inactive");
    }
    editorEl.addClass("papercraft-drawing-container");
    editorEl.appendChild(this.svgEl);
    this.loadDrawingData();
    this.bindEvents(editorEl);
  }
  /**
   * 分离画布
   */
  detach() {
    if (this.svgEl) {
      this.svgEl.remove();
      this.svgEl = null;
    }
  }
  /**
   * 销毁画布
   */
  destroy() {
    this.detach();
  }
  /**
   * 设置当前工具
   */
  setTool(tool, config) {
    this.activeTool = tool;
    if (config) {
      Object.assign(this.toolConfig, config);
    }
    this.toolConfig.type = tool;
    if (this.svgEl) {
      if (tool === "select") {
        this.svgEl.classList.add("papercraft-drawing-inactive");
      } else {
        this.svgEl.classList.remove("papercraft-drawing-inactive");
      }
      this.svgEl.dataset.tool = tool;
    }
  }
  /**
   * 绑定鼠标事件
   */
  bindEvents(editorEl) {
    if (!this.svgEl)
      return;
    editorEl.addEventListener("mousedown", this.handleMouseDown.bind(this));
    editorEl.addEventListener("mousemove", this.handleMouseMove.bind(this));
    editorEl.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }
  /**
   * 鼠标按下
   */
  handleMouseDown(e) {
    if (this.activeTool === "select")
      return;
    this.isDrawing = true;
    const rect = this.svgEl.getBoundingClientRect();
    this.startPoint = [e.clientX - rect.left, e.clientY - rect.top];
    this.currentPath = [this.startPoint];
    const tempEl = this.createTempElement();
    if (tempEl) {
      this.currentElement = tempEl;
      this.svgEl.appendChild(tempEl);
    }
  }
  /**
   * 鼠标移动
   */
  handleMouseMove(e) {
    if (!this.isDrawing || !this.svgEl || !this.currentElement)
      return;
    const rect = this.svgEl.getBoundingClientRect();
    const currentPoint = [e.clientX - rect.left, e.clientY - rect.top];
    if (this.activeTool === "freehand") {
      this.currentPath.push(currentPoint);
      this.updateFreehandPath();
    } else {
      this.updateShapeElement(currentPoint);
    }
  }
  /**
   * 鼠标释放
   */
  handleMouseUp(e) {
    if (!this.isDrawing || !this.svgEl)
      return;
    this.isDrawing = false;
    const rect = this.svgEl.getBoundingClientRect();
    const endPoint = [e.clientX - rect.left, e.clientY - rect.top];
    if (this.currentElement) {
      const element = this.createElementData(endPoint);
      if (element) {
        this.saveElement(element);
      }
    }
    this.currentElement = null;
    this.currentPath = [];
  }
  /**
   * 创建临时绘制元素
   */
  createTempElement() {
    const { strokeColor, strokeWidth, opacity } = this.toolConfig;
    switch (this.activeTool) {
      case "line": {
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("stroke", strokeColor);
        line.setAttribute("stroke-width", String(strokeWidth));
        line.setAttribute("opacity", String(opacity));
        line.setAttribute("x1", String(this.startPoint[0]));
        line.setAttribute("y1", String(this.startPoint[1]));
        line.setAttribute("x2", String(this.startPoint[0]));
        line.setAttribute("y2", String(this.startPoint[1]));
        return line;
      }
      case "rect": {
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("stroke", strokeColor);
        rect.setAttribute("stroke-width", String(strokeWidth));
        rect.setAttribute("fill", "none");
        rect.setAttribute("opacity", String(opacity));
        return rect;
      }
      case "circle": {
        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("stroke", strokeColor);
        circle.setAttribute("stroke-width", String(strokeWidth));
        circle.setAttribute("fill", "none");
        circle.setAttribute("opacity", String(opacity));
        return circle;
      }
      case "freehand": {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", String(strokeWidth));
        path.setAttribute("fill", "none");
        path.setAttribute("opacity", String(opacity));
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        return path;
      }
      default:
        return null;
    }
  }
  /**
   * 更新形状元素
   */
  updateShapeElement(currentPoint) {
    if (!this.currentElement)
      return;
    switch (this.activeTool) {
      case "line": {
        const line = this.currentElement;
        line.setAttribute("x2", String(currentPoint[0]));
        line.setAttribute("y2", String(currentPoint[1]));
        break;
      }
      case "rect": {
        const rect = this.currentElement;
        const x = Math.min(this.startPoint[0], currentPoint[0]);
        const y = Math.min(this.startPoint[1], currentPoint[1]);
        const w = Math.abs(currentPoint[0] - this.startPoint[0]);
        const h = Math.abs(currentPoint[1] - this.startPoint[1]);
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("width", String(w));
        rect.setAttribute("height", String(h));
        break;
      }
      case "circle": {
        const circle = this.currentElement;
        const dx = currentPoint[0] - this.startPoint[0];
        const dy = currentPoint[1] - this.startPoint[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        circle.setAttribute("cx", String(this.startPoint[0]));
        circle.setAttribute("cy", String(this.startPoint[1]));
        circle.setAttribute("r", String(radius));
        break;
      }
    }
  }
  /**
   * 更新自由绘制的路径
   */
  updateFreehandPath() {
    if (!this.currentElement || this.currentPath.length < 2)
      return;
    const path = this.currentElement;
    let d = `M ${this.currentPath[0][0]} ${this.currentPath[0][1]}`;
    for (let i = 1; i < this.currentPath.length; i++) {
      d += ` L ${this.currentPath[i][0]} ${this.currentPath[i][1]}`;
    }
    path.setAttribute("d", d);
  }
  /**
   * 创建元素数据
   */
  createElementData(endPoint) {
    const toPoints = (pts) => pts.map(([x, y]) => ({ x, y }));
    switch (this.activeTool) {
      case "line":
        return {
          id: "",
          type: "line",
          points: toPoints([this.startPoint, endPoint]),
          color: this.toolConfig.strokeColor,
          lineWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity
        };
      case "rect": {
        const x = Math.min(this.startPoint[0], endPoint[0]);
        const y = Math.min(this.startPoint[1], endPoint[1]);
        const w = Math.abs(endPoint[0] - this.startPoint[0]);
        const h = Math.abs(endPoint[1] - this.startPoint[1]);
        return {
          id: "",
          type: "rect",
          points: toPoints([[x, y], [x + w, y + h]]),
          color: this.toolConfig.strokeColor,
          lineWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity
        };
      }
      case "circle": {
        const dx = endPoint[0] - this.startPoint[0];
        const dy = endPoint[1] - this.startPoint[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        return {
          id: "",
          type: "circle",
          points: toPoints([this.startPoint, [radius, 0]]),
          color: this.toolConfig.strokeColor,
          lineWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity
        };
      }
      case "freehand":
        return {
          id: "",
          type: "freehand",
          points: toPoints(this.currentPath),
          color: this.toolConfig.strokeColor,
          lineWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity
        };
      default:
        return null;
    }
  }
  /**
   * 保存元素
   */
  saveElement(element) {
    if (!element.type)
      return;
    const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    element.id = id;
    this.plugin.settings.drawing.drawings.push(element);
    void this.plugin.saveSettings();
  }
  /**
   * 加载绘图数据并渲染
   */
  loadDrawingData() {
    if (!this.svgEl)
      return;
    while (this.svgEl.firstChild) {
      this.svgEl.removeChild(this.svgEl.firstChild);
    }
    for (const element of this.plugin.settings.drawing.drawings) {
      this.renderElement(element);
    }
  }
  /**
   * 渲染单个元素到 SVG
   */
  renderElement(element) {
    if (!this.svgEl)
      return;
    let svgElement = null;
    const getX = (p) => p.x;
    const getY = (p) => p.y;
    switch (element.type) {
      case "line": {
        svgElement = document.createElementNS(SVG_NS, "line");
        svgElement.setAttribute("x1", String(getX(element.points[0])));
        svgElement.setAttribute("y1", String(getY(element.points[0])));
        svgElement.setAttribute("x2", String(getX(element.points[1])));
        svgElement.setAttribute("y2", String(getY(element.points[1])));
        break;
      }
      case "rect": {
        svgElement = document.createElementNS(SVG_NS, "rect");
        const rx = getX(element.points[0]);
        const ry = getY(element.points[0]);
        const rw = getX(element.points[1]) - rx;
        const rh = getY(element.points[1]) - ry;
        svgElement.setAttribute("x", String(rx));
        svgElement.setAttribute("y", String(ry));
        svgElement.setAttribute("width", String(rw));
        svgElement.setAttribute("height", String(rh));
        break;
      }
      case "circle": {
        svgElement = document.createElementNS(SVG_NS, "circle");
        svgElement.setAttribute("cx", String(getX(element.points[0])));
        svgElement.setAttribute("cy", String(getY(element.points[0])));
        svgElement.setAttribute("r", String(getX(element.points[1])));
        break;
      }
      case "freehand": {
        svgElement = document.createElementNS(SVG_NS, "path");
        if (element.points.length < 2)
          break;
        let d = `M ${getX(element.points[0])} ${getY(element.points[0])}`;
        for (let i = 1; i < element.points.length; i++) {
          d += ` L ${getX(element.points[i])} ${getY(element.points[i])}`;
        }
        svgElement.setAttribute("d", d);
        break;
      }
    }
    if (svgElement) {
      svgElement.setAttribute("stroke", element.color);
      svgElement.setAttribute("stroke-width", String(element.lineWidth));
      svgElement.setAttribute("opacity", String(element.opacity));
      svgElement.setAttribute("fill", "none");
      svgElement.setAttribute("stroke-linecap", "round");
      svgElement.setAttribute("stroke-linejoin", "round");
      this.svgEl.appendChild(svgElement);
    }
  }
  /**
   * 清除当前绘图
   */
  clearLayer() {
    this.plugin.settings.drawing.drawings = [];
    void this.plugin.saveSettings();
    this.loadDrawingData();
  }
  /**
   * 撤销最后一个元素
   */
  undo() {
    const drawings = this.plugin.settings.drawing.drawings;
    if (drawings.length > 0) {
      drawings.pop();
      void this.plugin.saveSettings();
      this.loadDrawingData();
    }
  }
};

// main.ts
var PaperCraftPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = ensureCompleteSettings(null);
  }
  async onload() {
    await this.loadSettings();
    this.themeApplier = new ThemeApplier(this);
    this.drawingCanvas = new DrawingCanvas(this);
    this.templateManager = new TemplateManager(this);
    this.addSettingTab(new SettingsTab(this.app, this));
    this.registerView(VIEW_TYPE, (leaf) => {
      return new PaperCraftView(leaf, this);
    });
    this.addRibbonIcon("scroll", "\u7A3F\u7EB8\u5DE5\u574A", () => {
      void this.activateSidebar();
    });
    this.addCommand({
      id: "toggle-sidebar",
      name: "\u6253\u5F00/\u5173\u95ED\u7A3F\u7EB8\u5DE5\u574A\u4FA7\u8FB9\u680F",
      callback: () => {
        void this.activateSidebar();
      }
    });
    this.addCommand({
      id: "toggle-theme",
      name: "\u5207\u6362\u7A3F\u7EB8\u4E3B\u9898",
      callback: () => {
        this.toggleThemeOnActiveView();
      }
    });
    this.app.workspace.onLayoutReady(() => {
      this.applyThemeToAllViews();
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.applyThemeToActiveView();
      })
    );
  }
  onunload() {
    this.themeApplier.remove();
  }
  /**
   * 防御性加载：确保所有字段都存在
   */
  async loadSettings() {
    const savedData = await this.loadData();
    const complete = ensureCompleteSettings(savedData);
    this.settings = complete;
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
  activateSidebar() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existing.length > 0) {
      existing[0].detach();
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      leaf.setViewState({ type: VIEW_TYPE, active: true }).catch(() => {
      });
      this.app.workspace.revealLeaf(leaf).catch(() => {
      });
    }
  }
  /**
   * 更新侧边栏预览
   */
  updateSidebarPreview() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    leaves.forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof PaperCraftView) {
        view.refresh();
      }
    });
  }
  /**
   * 切换当前视图的主题
   */
  toggleThemeOnActiveView() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
    if (!activeView)
      return;
    const container = activeView.containerEl;
    if (container.hasClass("papercraft-active")) {
      container.removeClass("papercraft-active");
      this.themeApplier.remove();
    } else {
      this.applyThemeToActiveView();
    }
  }
  /**
   * 应用到所有 Markdown 视图
   */
  applyThemeToAllViews() {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    leaves.forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof import_obsidian4.MarkdownView && view.containerEl) {
        this.themeApplier.apply(this.settings, view.containerEl);
      }
    });
  }
  /**
   * 应用到当前活动视图
   */
  applyThemeToActiveView() {
    var _a;
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian4.MarkdownView);
    if (!activeView)
      return;
    this.themeApplier.apply(this.settings, activeView.containerEl);
    if ((_a = this.settings.drawing) == null ? void 0 : _a.enabled) {
      this.drawingCanvas.attachToView(activeView);
    }
  }
  /**
   * 类型守卫：判断是否为可折叠的容器（含 toggle 方法）
   */
  isCollapsibleContainer(parent) {
    if (parent === null || parent === void 0)
      return false;
    const candidate = parent;
    return typeof candidate.toggle === "function" && typeof candidate.collapsed === "boolean";
  }
};
