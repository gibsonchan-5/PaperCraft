/**
 * PaperCraft - Internationalization
 *
 * 词表按功能分组平铺，所有键值都必须写齐三种语言，
 * 由 `satisfies Record<string, Record<Language, string>>` 在编译期强制。
 *
 * 语言状态存在模块级：插件加载时与用户切换语言时调用 setLanguage()，
 * 之后所有 t() 调用无需再显式传语言，调用点保持简洁。
 */

import type { Language } from '../data/PaperData';

export type { Language };

/** 单条翻译：三种语言必须齐全 */
type StringEntry = Record<Language, string>;

/** 运行期查表用的宽松类型（支持动态键：字体名、模板 ID） */
type StringTable = Record<string, StringEntry | undefined>;

let currentLanguage: Language = 'en';

/** 切换当前语言（插件加载与用户在设置中改语言时调用） */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

/** 当前语言 */
export function getLanguage(): Language {
  return currentLanguage;
}

/** 可选语言列表 */
export function getAvailableLanguages(): Language[] {
  return ['en', 'zh-CN', 'ja'];
}

/** 语言显示名：始终用自己的语言书写，不参与翻译 */
export const LANGUAGE_LABELS: Record<Language, string> = {
  'en': 'English',
  'zh-CN': '简体中文',
  'ja': '日本語',
};

/**
 * 把 Obsidian 界面语言代码（如 'zh' / 'zh-TW' / 'ja' / 'de'）映射为本插件支持的语言。
 * 只识别中文与日文，其余一律回退英文。
 */
export function matchLanguage(code: string | null | undefined): Language {
  const normalized = (code || '').trim().toLowerCase();
  if (normalized.startsWith('zh')) return 'zh-CN';
  if (normalized.startsWith('ja')) return 'ja';
  return 'en';
}

const strings = {
  // ===== 应用 / 命令（onload 时按当时语言注册） =====
  'app.name': {
    'zh-CN': '稿纸工坊',
    'en': 'PaperCraft',
    'ja': '稿紙工房',
  },
  'command.toggleSidebar': {
    'zh-CN': '打开/关闭稿纸工坊侧边栏',
    'en': 'Toggle PaperCraft sidebar',
    'ja': 'PaperCraft サイドバーの開閉',
  },
  'command.toggleTheme': {
    'zh-CN': '切换稿纸主题',
    'en': 'Toggle PaperCraft theme',
    'ja': 'PaperCraft テーマの切り替え',
  },

  // ===== 侧边栏 =====
  'sidebar.title': {
    'zh-CN': 'PaperCraft',
    'en': 'PaperCraft',
    'ja': '稿紙工房',
  },
  'sidebar.dayThemes': {
    'zh-CN': '白天主题',
    'en': 'Day Themes',
    'ja': 'デイテーマ',
  },
  'sidebar.nightThemes': {
    'zh-CN': '夜间主题',
    'en': 'Night Themes',
    'ja': 'ナイトテーマ',
  },
  'sidebar.nightHint': {
    'zh-CN': '（建议在深色模式下使用）',
    'en': ' (recommended in dark mode)',
    'ja': '（ダークモードでの利用を推奨）',
  },
  'sidebar.custom': {
    'zh-CN': '自定义模板',
    'en': 'Custom Templates',
    'ja': 'カスタムテンプレート',
  },
  'sidebar.noCustom': {
    'zh-CN': '（暂无自定义模板）',
    'en': ' (no custom templates yet)',
    'ja': '（カスタムテンプレートなし）',
  },
  'sidebar.clearFormat': {
    'zh-CN': '清除格式',
    'en': 'Clear format',
    'ja': 'フォーマットをクリア',
  },
  'sidebar.clearFormatTooltip': {
    'zh-CN': '清除格式（重置当前笔记样式）',
    'en': 'Clear format (reset the styles of this note)',
    'ja': 'フォーマットをクリア（このノートのスタイルをリセット）',
  },
  'sidebar.openSettings': {
    'zh-CN': '打开设置',
    'en': 'Open settings',
    'ja': '設定を開く',
  },

  // ===== 设置面板：整体 =====
  'settings.title': {
    'zh-CN': 'PaperCraft 设置',
    'en': 'PaperCraft Settings',
    'ja': 'PaperCraft の設定',
  },
  'settings.texture': {
    'zh-CN': '纸张质感',
    'en': 'Paper Texture',
    'ja': '用紙テクスチャ',
  },
  'settings.lines': {
    'zh-CN': '条纹图案',
    'en': 'Line Pattern',
    'ja': '線パターン',
  },
  'settings.colors': {
    'zh-CN': '颜色配色',
    'en': 'Color Scheme',
    'ja': '配色',
  },
  'settings.typography': {
    'zh-CN': '字体排版',
    'en': 'Typography',
    'ja': 'タイポグラフィ',
  },
  'settings.template': {
    'zh-CN': '模板管理',
    'en': 'Templates',
    'ja': 'テンプレート',
  },
  'settings.general': {
    'zh-CN': '通用',
    'en': 'General',
    'ja': '一般',
  },
  'settings.language': {
    'zh-CN': '语言',
    'en': 'Language',
    'ja': '言語',
  },
  'settings.languageDesc': {
    'zh-CN': '更改界面语言。命令面板中的插件命令名需重启 Obsidian 或重载插件后才会更新',
    'en': 'Change the UI language. Command names in the command palette only update after restarting Obsidian or reloading the plugin',
    'ja': 'UI言語を変更します。コマンドパレット上のコマンド名は Obsidian の再起動またはプラグインの再読み込み後に更新されます',
  },

  // ===== 实时预览 =====
  'preview.noticeTitle': {
    'zh-CN': '⚠️ 提示：',
    'en': '⚠️ Note: ',
    'ja': '⚠️ ヒント：',
  },
  'preview.noticeBody1': {
    'zh-CN': '此处的所有参数调整仅影响上方的实时预览区，',
    'en': 'every parameter change below affects only the live preview,',
    'ja': 'ここでのパラメータ変更は上のライブプレビューにのみ影響し、',
  },
  'preview.noticeBody2': {
    'zh-CN': '不会自动应用到当前笔记。满意后请点击底部「应用到笔记」按钮。',
    'en': ' it is never applied to the current note automatically. Click "Apply to note" below when you are happy with the result.',
    'ja': ' 現在のノートには自動で適用されません。結果に満足したら下の「ノートに適用」を押してください。',
  },
  'preview.title': {
    'zh-CN': '实时预览（1:1 真实尺寸，可滚动；调整参数此处实时变化，点击"应用到笔记"才生效）',
    'en': 'Live preview (1:1 actual size, scrollable; changes show here instantly and reach the note only after "Apply to note")',
    'ja': 'ライブプレビュー（1:1 の実寸、スクロール可能。変更は即時反映され、「ノートに適用」を押したときだけノートに反映されます）',
  },
  'preview.sample.1': {
    'zh-CN': '落霞与孤鹜齐飞，秋水共长天一色。',
    'en': 'The quick brown fox jumps over the lazy dog.',
    'ja': 'いろはにほへとちりぬるを',
  },
  'preview.sample.2': {
    'zh-CN': '渔舟唱晚，响穷彭蠡之滨；',
    'en': 'Pack my box with five dozen liquor jugs.',
    'ja': 'わがいおくやまけふこえて',
  },
  'preview.sample.3': {
    'zh-CN': '雁阵惊寒，声断衡阳之浦。',
    'en': 'Sphinx of black quartz, judge my vow.',
    'ja': 'あさきゆめみしゑひもせす',
  },
  'preview.sample.4': {
    'zh-CN': '遥襟甫畅，逸兴遄飞。',
    'en': 'How vexingly quick daft zebras jump!',
    'ja': '吾輩は猫である。名前はまだ無い。',
  },
  'preview.sample.5': {
    'zh-CN': '爽籁发而清风生，纤歌凝而白云遏。',
    'en': 'Jackdaws love my big sphinx of quartz.',
    'ja': '仮名交じり文の行間を確かめるための文章です。',
  },
  'preview.sample.6': {
    'zh-CN': '睢园绿竹，气凌彭泽之樽；',
    'en': 'The five boxing wizards jump quickly.',
    'ja': '暗い夜を越えて、朝日が山の端から昇る。',
  },

  // ===== 通用按钮 / 状态 =====
  'common.cancel': {
    'zh-CN': '取消',
    'en': 'Cancel',
    'ja': 'キャンセル',
  },
  'common.import': {
    'zh-CN': '导入',
    'en': 'Import',
    'ja': 'インポート',
  },
  'common.save': {
    'zh-CN': '保存',
    'en': 'Save',
    'ja': '保存',
  },
  'common.delete': {
    'zh-CN': '删除',
    'en': 'Delete',
    'ja': '削除',
  },
  'common.apply': {
    'zh-CN': '应用',
    'en': 'Apply',
    'ja': '適用',
  },
  'common.none': {
    'zh-CN': '无',
    'en': 'None',
    'ja': 'なし',
  },
  'common.unknownError': {
    'zh-CN': '未知错误',
    'en': 'Unknown error',
    'ja': '不明なエラー',
  },
  'common.listSeparator': {
    'zh-CN': '；',
    'en': '; ',
    'ja': '；',
  },

  // ===== CSS 导入对话框 =====
  'cssImport.title': {
    'zh-CN': '导入 CSS 文件',
    'en': 'Import a CSS file',
    'ja': 'CSS ファイルをインポート',
  },
  'cssImport.desc': {
    'zh-CN': '选择要导入的 CSS 文件，系统将自动解析其中的样式属性。',
    'en': 'Choose a CSS file and its style properties will be parsed automatically.',
    'ja': 'インポートする CSS ファイルを選ぶと、スタイル属性が自動的に解析されます。',
  },
  'cssImport.parsing': {
    'zh-CN': '正在解析 CSS 文件...',
    'en': 'Parsing CSS file...',
    'ja': 'CSS ファイルを解析中...',
  },
  'cssImport.success': {
    'zh-CN': '✓ 解析成功！可以导入。',
    'en': '✓ Parsed successfully. Ready to import.',
    'ja': '✓ 解析成功。インポートできます。',
  },
  'cssImport.failure': {
    'zh-CN': '✗ 解析失败: {msg}',
    'en': '✗ Parse failed: {msg}',
    'ja': '✗ 解析失敗: {msg}',
  },
  'cssImport.done': {
    'zh-CN': 'CSS 样式已导入到预览区',
    'en': 'CSS styles imported into the preview',
    'ja': 'CSS スタイルをプレビューにインポートしました',
  },

  // ===== 模板命名对话框 =====
  'templateName.title': {
    'zh-CN': '保存为新模板',
    'en': 'Save as new template',
    'ja': '新テンプレートとして保存',
  },
  'templateName.placeholder': {
    'zh-CN': '输入模板名称...',
    'en': 'Enter a template name...',
    'ja': 'テンプレート名を入力...',
  },

  // ===== 操作按钮 =====
  'action.applyToNote': {
    'zh-CN': '应用到笔记',
    'en': 'Apply to note',
    'ja': 'ノートに適用',
  },
  'action.saveAsTemplate': {
    'zh-CN': '保存为新模板',
    'en': 'Save as new template',
    'ja': '新テンプレートとして保存',
  },
  'action.importCss': {
    'zh-CN': '导入 CSS',
    'en': 'Import CSS',
    'ja': 'CSS をインポート',
  },
  'action.resetPreview': {
    'zh-CN': '重置预览',
    'en': 'Reset preview',
    'ja': 'プレビューをリセット',
  },

  // ===== 提示 =====
  'notice.previewReset': {
    'zh-CN': '预览已重置',
    'en': 'Preview reset',
    'ja': 'プレビューをリセットしました',
  },
  'notice.appliedToNote': {
    'zh-CN': '已应用到当前笔记',
    'en': 'Applied to the current note',
    'ja': '現在のノートに適用しました',
  },
  'notice.templateSaved': {
    'zh-CN': '模板"{name}"已保存',
    'en': 'Template "{name}" saved',
    'ja': 'テンプレート「{name}」を保存しました',
  },
  'notice.templateApplied': {
    'zh-CN': '已应用模板：{name}',
    'en': 'Applied template: {name}',
    'ja': 'テンプレートを適用しました: {name}',
  },
  'notice.templateDeleted': {
    'zh-CN': '已删除模板：{name}',
    'en': 'Deleted template: {name}',
    'ja': 'テンプレートを削除しました: {name}',
  },

  // ===== 模板管理标签页 =====
  'templates.myTemplates': {
    'zh-CN': '我的模板',
    'en': 'My templates',
    'ja': 'マイテンプレート',
  },
  'templates.myTemplatesDesc': {
    'zh-CN': '管理你保存的自定义模板（系统内置模板不可删除）',
    'en': 'Manage the custom templates you saved (built-in templates cannot be deleted)',
    'ja': '保存したカスタムテンプレートを管理します（組み込みテンプレートは削除できません）',
  },
  'templates.empty': {
    'zh-CN': '📝 暂无自定义模板',
    'en': '📝 No custom templates yet',
    'ja': '📝 カスタムテンプレートはありません',
  },
  'templates.emptyHint': {
    'zh-CN': '在设置面板底部点击「保存为新模板」可创建自定义模板。',
    'en': 'Click "Save as new template" at the bottom of this panel to create one.',
    'ja': 'パネル下部の「新テンプレートとして保存」を押すと作成できます。',
  },
  'templates.solidColor': {
    'zh-CN': '纯色模板',
    'en': 'Solid color template',
    'ja': '単色テンプレート',
  },
  'templates.lineInfo': {
    'zh-CN': '线条：{pattern} · 字号：{size}px',
    'en': 'Lines: {pattern} · Size: {size}px',
    'ja': '線: {pattern} · 文字サイズ: {size}px',
  },
  'templates.confirmDelete': {
    'zh-CN': '再次点击确认',
    'en': 'Click again to confirm',
    'ja': 'もう一度クリックで確認',
  },

  // ===== 线条图案标签（下拉框与模板描述共用） =====
  'pattern.none': {
    'zh-CN': '无',
    'en': 'None',
    'ja': 'なし',
  },
  'pattern.horizontal': {
    'zh-CN': '横线',
    'en': 'Horizontal',
    'ja': '横線',
  },
  'pattern.vertical': {
    'zh-CN': '竖线',
    'en': 'Vertical',
    'ja': '縦線',
  },
  'pattern.grid': {
    'zh-CN': '方格',
    'en': 'Grid',
    'ja': 'マス目',
  },
  'pattern.dot': {
    'zh-CN': '点阵',
    'en': 'Dots',
    'ja': 'ドット',
  },

  // ===== 纸张质感标签页 =====
  'texture.type': {
    'zh-CN': '纹理类型',
    'en': 'Texture type',
    'ja': 'テクスチャの種類',
  },
  'texture.opacity': {
    'zh-CN': '纹理透明度',
    'en': 'Texture opacity',
    'ja': 'テクスチャの不透明度',
  },
  'texture.opacityDesc': {
    'zh-CN': '控制纹理的可见程度',
    'en': 'Controls how visible the texture is',
    'ja': 'テクスチャの見え方を調整します',
  },
  'texture.scale': {
    'zh-CN': '纹理缩放',
    'en': 'Texture scale',
    'ja': 'テクスチャの拡大縮小',
  },
  'texture.scaleDesc': {
    'zh-CN': '调整纹理的大小比例',
    'en': 'Adjusts the size of the texture pattern',
    'ja': 'テクスチャの大きさを調整します',
  },
  'texture.kraft': {
    'zh-CN': '牛皮纸',
    'en': 'Kraft paper',
    'ja': 'クラフト紙',
  },
  'texture.xuan': {
    'zh-CN': '宣纸',
    'en': 'Xuan paper',
    'ja': '宣紙',
  },
  'texture.concrete': {
    'zh-CN': '混凝土',
    'en': 'Concrete',
    'ja': 'コンクリート',
  },
  'texture.linen': {
    'zh-CN': '亚麻',
    'en': 'Linen',
    'ja': 'リネン',
  },

  // ===== 条纹图案标签页 =====
  'lines.type': {
    'zh-CN': '线条类型',
    'en': 'Line pattern',
    'ja': '線の種類',
  },
  'lines.gap': {
    'zh-CN': '线条间距 (px)',
    'en': 'Line spacing (px)',
    'ja': '線の間隔 (px)',
  },
  'lines.thickness': {
    'zh-CN': '线条粗细 (px)',
    'en': 'Line thickness (px)',
    'ja': '線の太さ (px)',
  },
  'lines.thicknessDesc': {
    'zh-CN': '调整线条的粗细',
    'en': 'Adjusts how thick the lines are',
    'ja': '線の太さを調整します',
  },
  'lines.color': {
    'zh-CN': '线条颜色',
    'en': 'Line color',
    'ja': '線の色',
  },

  // ===== 装订线 =====
  'marginLine.heading': {
    'zh-CN': '装订线',
    'en': 'Binding line',
    'ja': '綴じ線',
  },
  'marginLine.show': {
    'zh-CN': '显示装订线',
    'en': 'Show binding line',
    'ja': '綴じ線を表示',
  },
  'marginLine.showDesc': {
    'zh-CN': '在纸张左侧绘制一条竖线，模拟装订位置（默认关闭）',
    'en': 'Draws a vertical line near the left edge to suggest a binding margin (off by default)',
    'ja': '左端近くに縦線を描き、綴じ側を表現します（既定ではオフ）',
  },
  'marginLine.position': {
    'zh-CN': '距左边缘 (px)',
    'en': 'Distance from left edge (px)',
    'ja': '左端からの距離 (px)',
  },
  'marginLine.positionDesc': {
    'zh-CN': '装订线距离纸张左边缘的位置',
    'en': 'How far from the left edge of the paper the binding line sits',
    'ja': '綴じ線の左端からの位置です',
  },
  'marginLine.width': {
    'zh-CN': '装订线粗细 (px)',
    'en': 'Binding line thickness (px)',
    'ja': '綴じ線の太さ (px)',
  },
  'marginLine.color': {
    'zh-CN': '装订线颜色',
    'en': 'Binding line color',
    'ja': '綴じ線の色',
  },

  // ===== 颜色配色标签页 =====
  'colors.paperBackground': {
    'zh-CN': '纸张背景色',
    'en': 'Paper background color',
    'ja': '用紙の背景色',
  },
  'colors.textColor': {
    'zh-CN': '文字颜色',
    'en': 'Text color',
    'ja': '文字色',
  },

  // ===== 字体排版标签页 =====
  'typography.font': {
    'zh-CN': '字体',
    'en': 'Font',
    'ja': 'フォント',
  },
  'typography.fontCustom': {
    'zh-CN': '自定义（手动输入）',
    'en': 'Custom (type it yourself)',
    'ja': 'カスタム（手動入力）',
  },
  'typography.fontCurrent': {
    'zh-CN': '{font}（当前）',
    'en': '{font} (current)',
    'ja': '{font}（現在）',
  },
  'typography.systemFonts': {
    'zh-CN': '系统字体',
    'en': 'System fonts',
    'ja': 'システムフォント',
  },
  'typography.systemFontsDesc': {
    'zh-CN': '从本机已安装的字体中挑选，支持搜索与实时预览；若本机字体接口不可用，将退回内置清单比对',
    'en': 'Pick from the fonts installed on this device, with search and live preview. If the system font API is unavailable, a built-in list is matched instead',
    'ja': 'この端末にインストールされたフォントから選びます（検索・ライブプレビュー対応）。システム API が使えない場合は内蔵リストで照合します',
  },
  'typography.browseFonts': {
    'zh-CN': '浏览字体…',
    'en': 'Browse fonts…',
    'ja': 'フォントを参照…',
  },
  'typography.browseFontsTooltip': {
    'zh-CN': '打开系统字体选择器',
    'en': 'Open the system font picker',
    'ja': 'システムフォントセレクターを開く',
  },
  'typography.customFontName': {
    'zh-CN': '自定义字体名称',
    'en': 'Custom font name',
    'ja': 'カスタムフォント名',
  },
  'typography.customFontNameDesc': {
    'zh-CN': '如果预设字体不满足需求，可在此手动输入字体名称',
    'en': 'Type a font family name by hand if none of the presets fit',
    'ja': 'プリセットで足りない場合、フォント名を直接入力できます',
  },
  'typography.fontPlaceholder': {
    'zh-CN': '输入字体名称...',
    'en': 'Enter a font name...',
    'ja': 'フォント名を入力...',
  },
  'typography.fontSize': {
    'zh-CN': '字号 (px)',
    'en': 'Font size (px)',
    'ja': '文字サイズ (px)',
  },
  'typography.letterSpacing': {
    'zh-CN': '字间距 (em)',
    'en': 'Letter spacing (em)',
    'ja': '字間 (em)',
  },
  'typography.letterSpacingDesc': {
    'zh-CN': '调整字符之间的间距',
    'en': 'Adjusts the space between characters',
    'ja': '文字の間の隙間を調整します',
  },
  'typography.lineHeight': {
    'zh-CN': '行高',
    'en': 'Line height',
    'ja': '行の高さ',
  },
  'typography.lineHeightDesc': {
    'zh-CN': '调整行与行之间的间距',
    'en': 'Adjusts the space between lines',
    'ja': '行と行の間隔を調整します',
  },
  'typography.pageMargins': {
    'zh-CN': '页面边距',
    'en': 'Page margins',
    'ja': 'ページ余白',
  },

  // ===== 页面边距 =====
  'margin.top': {
    'zh-CN': '上边距 (px)',
    'en': 'Top margin (px)',
    'ja': '上余白 (px)',
  },
  'margin.topDesc': {
    'zh-CN': '调整内容区域距纸张上边框的留白宽度',
    'en': 'Space between the content and the top edge of the paper',
    'ja': '内容と用紙上端の間隔です',
  },
  'margin.bottom': {
    'zh-CN': '下边距 (px)',
    'en': 'Bottom margin (px)',
    'ja': '下余白 (px)',
  },
  'margin.bottomDesc': {
    'zh-CN': '调整内容区域距纸张下边框的留白宽度',
    'en': 'Space between the content and the bottom edge of the paper',
    'ja': '内容と用紙下端の間隔です',
  },
  'margin.left': {
    'zh-CN': '左边距 (px)',
    'en': 'Left margin (px)',
    'ja': '左余白 (px)',
  },
  'margin.leftDesc': {
    'zh-CN': '调整内容区域距纸张左边框的留白宽度',
    'en': 'Space between the content and the left edge of the paper',
    'ja': '内容と用紙左端の間隔です',
  },
  'margin.right': {
    'zh-CN': '右边距 (px)',
    'en': 'Right margin (px)',
    'ja': '右余白 (px)',
  },
  'margin.rightDesc': {
    'zh-CN': '调整内容区域距纸张右边框的留白宽度',
    'en': 'Space between the content and the right edge of the paper',
    'ja': '内容と用紙右端の間隔です',
  },

  // ===== 系统字体选择器 =====
  'fontPicker.placeholder': {
    'zh-CN': '搜索字体名称，例如：KingHwa / 楷体 / Times',
    'en': 'Search fonts, e.g. KingHwa / SimSun / Times',
    'ja': 'フォント名で検索（例: KingHwa / 楷書 / Times）',
  },
  'fontPicker.instructionSelect': {
    'zh-CN': '选择字体',
    'en': 'Select a font',
    'ja': 'フォントを選択',
  },
  'fontPicker.instructionApply': {
    'zh-CN': '应用该字体',
    'en': 'Apply this font',
    'ja': 'このフォントを適用',
  },
  'fontPicker.useTypedName': {
    'zh-CN': '按输入的名称使用',
    'en': 'Use the name as typed',
    'ja': '入力した名前を使用',
  },
  'fontPicker.recent': {
    'zh-CN': '最近使用',
    'en': 'Recent',
    'ja': '最近使用',
  },
  'fontPicker.current': {
    'zh-CN': '当前',
    'en': 'Current',
    'ja': '現在',
  },
  'fontPicker.offList': {
    'zh-CN': '清单外名称',
    'en': 'Not in the list',
    'ja': 'リスト外の名前',
  },
  'fontPicker.notDetected': {
    'zh-CN': '未检测到',
    'en': 'Not detected',
    'ja': '未検出',
  },
  'fontPicker.scanning': {
    'zh-CN': '正在扫描本机字体…',
    'en': 'Scanning installed fonts…',
    'ja': 'インストール済みフォントをスキャン中…',
  },
  'fontPicker.noFonts': {
    'zh-CN': '未能获取到字体列表，请改用「自定义字体名称」手动输入',
    'en': 'Could not get a font list — type the name in "Custom font name" instead',
    'ja': 'フォント一覧を取得できませんでした。「カスタムフォント名」から直接入力してください',
  },
  'fontPicker.scanFailed': {
    'zh-CN': '字体扫描失败：{msg}',
    'en': 'Font scan failed: {msg}',
    'ja': 'フォントのスキャンに失敗しました: {msg}',
  },
  'fontPicker.hintFontAccess': {
    'zh-CN': '已读取本机字体库，共 {count} 个字族',
    'en': 'Read the system font library: {count} families',
    'ja': 'システムフォントを読み込みました（{count} ファミリー）',
  },
  'fontPicker.hintDetected': {
    'zh-CN': '已检测到 {found} / {total} 个候选字体（{reason}，当前为内置清单宽度比对结果，仅供参考）',
    'en': 'Detected {found} of {total} candidate fonts ({reason}; width comparison against a built-in list, for reference only)',
    'ja': '{total} 件中 {found} 件を検出（{reason}。内蔵リストとの幅比較による結果のため参考値です）',
  },
  'fontPicker.hintReasonFailed': {
    'zh-CN': '本机字体接口调用失败：{note}',
    'en': 'System font API call failed: {note}',
    'ja': 'システムフォント API の呼び出しに失敗: {note}',
  },
  'fontPicker.hintReasonUnavailable': {
    'zh-CN': '本机字体接口不可用',
    'en': 'System font API unavailable',
    'ja': 'システムフォント API が利用できません',
  },
  'fontPicker.hintTruncated': {
    'zh-CN': '共 {total} 个字体，列表最多显示前 {max} 项，可用搜索缩小范围',
    'en': '{total} fonts in total; only the first {max} are listed — use search to narrow it down',
    'ja': '全 {total} 件。先頭 {max} 件のみ表示です。検索で絞り込めます',
  },

  // ===== 内置模板名称（键名 = template.<id>，缺失时回退到模板自带名称） =====
  'template.moon-white': {
    'zh-CN': '月白',
    'en': 'Moon White',
    'ja': '月白',
  },
  'template.star-dot': {
    'zh-CN': '星点',
    'en': 'Star Dots',
    'ja': '星点',
  },
  'template.mint-shadow': {
    'zh-CN': '薄荷碎影',
    'en': 'Mint Shadows',
    'ja': '薄い影',
  },
  'template.old-book-grid': {
    'zh-CN': '旧卷星砂',
    'en': 'Old Scroll, Starlit Sand',
    'ja': '古い巻物と星砂',
  },
  'template.rose-letter': {
    'zh-CN': '落英缤纷',
    'en': 'Falling Petals',
    'ja': '舞い散る花びら',
  },
  'template.sky-blue-grid': {
    'zh-CN': '晴空碎玉',
    'en': 'Clear Sky',
    'ja': '晴れた空',
  },
  'template.bean-green': {
    'zh-CN': '莲叶田田',
    'en': 'Lotus Leaves',
    'ja': '蓮の葉',
  },
  'template.pure-white-grid': {
    'zh-CN': '素笺白露',
    'en': 'Pure White Paper',
    'ja': '白い便箋',
  },
  'template.ink-blue-lines': {
    'zh-CN': '窗外麻雀',
    'en': 'Sparrows by the Window',
    'ja': '窓辺の雀',
  },
  'template.light-purple-grid': {
    'zh-CN': '淡紫微雨',
    'en': 'Light Purple Drizzle',
    'ja': '薄紫の雨',
  },
  'template.charcoal-dots': {
    'zh-CN': '炭灰星点',
    'en': 'Charcoal Dots',
    'ja': '炭色の星',
  },
  'template.warm-yellow': {
    'zh-CN': '暖黄流光',
    'en': 'Warm Golden Glow',
    'ja': '暖かな黄金色',
  },
  'template.peach-paper': {
    'zh-CN': '桃花拾遗',
    'en': 'Peach Blossoms',
    'ja': '桃の花',
  },
  'template.green-fat-red-thin': {
    'zh-CN': '绿肥红瘦',
    'en': 'Lush Green, Fading Red',
    'ja': '緑肥えて紅瘦せる',
  },
  'template.snow-goose-tracks': {
    'zh-CN': '雪泥鸿爪',
    'en': 'Tracks in Snow',
    'ja': '雪の上の雁の跡',
  },
  'template.zen-garden': {
    'zh-CN': '禅房花木',
    'en': 'Zen Garden',
    'ja': '禅寺の庭',
  },
  'template.ancient-vertical': {
    'zh-CN': '埋首故纸',
    'en': 'Lost in Old Books',
    'ja': '古書に埋もれて',
  },
  'template.bridge-night-frost': {
    'zh-CN': '板桥夜霜',
    'en': 'Night Frost on the Bridge',
    'ja': '夜の橋に降る霜',
  },
  'template.moon-bright-stars': {
    'zh-CN': '冬夜旅人',
    'en': 'Winter Night Traveler',
    'ja': '冬の夜の旅人',
  },
  'template.mystic-gate': {
    'zh-CN': '荷塘月色',
    'en': 'Moonlight on the Lotus Pond',
    'ja': '蓮池の月夜',
  },
  'template.blue-sea-green-sky': {
    'zh-CN': '碧海青天',
    'en': 'Blue Sea, Clear Sky',
    'ja': '碧い海、青い空',
  },

  // ===== 字体预设显示名（键名 = font.<family 小写、非字母数字转连字符>） =====
  'font.simsun': {
    'zh-CN': '宋体 (SimSun)',
    'en': 'SimSun',
    'ja': '宋体 (SimSun)',
  },
  'font.stsong': {
    'zh-CN': '华文宋体 (STSong)',
    'en': 'STSong',
    'ja': '華文宋體 (STSong)',
  },
  'font.songti-sc': {
    'zh-CN': '宋体-简 (Songti SC)',
    'en': 'Songti SC',
    'ja': '宋体-简 (Songti SC)',
  },
  'font.nsimsun': {
    'zh-CN': '新宋体 (NSimSun)',
    'en': 'NSimSun',
    'ja': '新宋体 (NSimSun)',
  },
  'font.simsun-extb': {
    'zh-CN': '宋体-ExtB (SimSun-ExtB)',
    'en': 'SimSun-ExtB',
    'ja': '宋体-ExtB (SimSun-ExtB)',
  },
  'font.fzsongti-b01s': {
    'zh-CN': '方正宋体 (FZSongti)',
    'en': 'FZSongti',
    'ja': '方正宋體 (FZSongti)',
  },
  'font.source-han-serif-sc': {
    'zh-CN': '思源宋体 (Source Han Serif SC)',
    'en': 'Source Han Serif SC',
    'ja': '思源宋體 (Source Han Serif SC)',
  },
  'font.noto-serif-cjk-sc': {
    'zh-CN': '思源宋体 (Noto Serif CJK SC)',
    'en': 'Noto Serif CJK SC',
    'ja': '思源宋體 (Noto Serif CJK SC)',
  },
  'font.fangsong': {
    'zh-CN': '仿宋 (FangSong)',
    'en': 'FangSong',
    'ja': '仿宋 (FangSong)',
  },
  'font.stfangsong': {
    'zh-CN': '华文仿宋 (STFangsong)',
    'en': 'STFangsong',
    'ja': '華文仿宋 (STFangsong)',
  },
  'font.fzfangsong-z02': {
    'zh-CN': '方正仿宋 (FZFangsong)',
    'en': 'FZFangsong',
    'ja': '方正仿宋 (FZFangsong)',
  },
  'font.microsoft-yahei': {
    'zh-CN': '微软雅黑 (Microsoft YaHei)',
    'en': 'Microsoft YaHei',
    'ja': '微软雅黑 (Microsoft YaHei)',
  },
  'font.simhei': {
    'zh-CN': '黑体 (SimHei)',
    'en': 'SimHei',
    'ja': '黑体 (SimHei)',
  },
  'font.stheiti': {
    'zh-CN': '华文黑体 (STHeiti)',
    'en': 'STHeiti',
    'ja': '華文黑體 (STHeiti)',
  },
  'font.source-han-sans-sc': {
    'zh-CN': '思源黑体 (Source Han Sans SC)',
    'en': 'Source Han Sans SC',
    'ja': '思源黑體 (Source Han Sans SC)',
  },
  'font.noto-sans-cjk-sc': {
    'zh-CN': '思源黑体 (Noto Sans CJK SC)',
    'en': 'Noto Sans CJK SC',
    'ja': '思源黑體 (Noto Sans CJK SC)',
  },
  'font.pingfang-sc': {
    'zh-CN': '苹方-简 (PingFang SC)',
    'en': 'PingFang SC',
    'ja': '苹方-简 (PingFang SC)',
  },
  'font.hiragino-sans-gb': {
    'zh-CN': '冬青黑体 (Hiragino Sans GB)',
    'en': 'Hiragino Sans GB',
    'ja': '冬青黒体 (Hiragino Sans GB)',
  },
  'font.kaiti': {
    'zh-CN': '楷体 (KaiTi)',
    'en': 'KaiTi',
    'ja': '楷体 (KaiTi)',
  },
  'font.stkaiti': {
    'zh-CN': '华文楷体 (STKaiti)',
    'en': 'STKaiti',
    'ja': '華文楷體 (STKaiti)',
  },
  'font.fzkaiti-z04': {
    'zh-CN': '方正楷体 (FZKaiti)',
    'en': 'FZKaiti',
    'ja': '方正楷體 (FZKaiti)',
  },
  'font.ar-pl-ukai-cn': {
    'zh-CN': '文泉驿正黑 (AR PL UKai CN)',
    'en': 'AR PL UKai CN',
    'ja': '文泉驿正黑 (AR PL UKai CN)',
  },
  'font.stxihei': {
    'zh-CN': '华文细黑 (STXihei)',
    'en': 'STXihei',
    'ja': '華文細黑 (STXihei)',
  },
  'font.lisu': {
    'zh-CN': '隶书 (LiSu)',
    'en': 'LiSu',
    'ja': '隷書 (LiSu)',
  },
  'font.youyuan': {
    'zh-CN': '幼圆 (YouYuan)',
    'en': 'YouYuan',
    'ja': '幼圓 (YouYuan)',
  },
  'font.stxingkai': {
    'zh-CN': '华文行楷 (STXingkai)',
    'en': 'STXingkai',
    'ja': '華文行楷 (STXingkai)',
  },
  'font.stxinwei': {
    'zh-CN': '华文新魏 (STXinwei)',
    'en': 'STXinwei',
    'ja': '華文新魏 (STXinwei)',
  },
} satisfies Record<string, StringEntry>;

/** 运行期查表（允许动态键） */
const table: StringTable = strings;

export type TranslationKey = keyof typeof strings;

/**
 * 取当前语言下的文案。
 * @param vars 占位符替换：t('notice.templateSaved', { name: '草稿' })
 */
export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
  const entry = table[key];
  let text = entry?.[currentLanguage] ?? entry?.['en'] ?? String(key);

  if (vars) {
    for (const name of Object.keys(vars)) {
      text = text.split(`{${name}}`).join(String(vars[name]));
    }
  }

  return text;
}

/** 字体族 slug：'Songti SC' -> 'font.songti-sc' */
function fontKey(family: string): string {
  return 'font.' + family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * 字体的本地化显示名。
 * 词表里没有的字体（系统字体选择器里成百上千个）直接显示 font-family 原名。
 */
export function fontLabel(family: string): string {
  const entry = table[fontKey(family)];
  if (!entry) return family;
  return entry[currentLanguage] ?? entry['en'] ?? family;
}

/**
 * 模板的本地化名称。
 * 内置模板有翻译词条；用户自定义模板（键缺失）回退到模板自带名称。
 */
export function templateName(id: string, fallback: string): string {
  const entry = table[`template.${id}`];
  if (!entry) return fallback;
  return entry[currentLanguage] ?? entry['en'] ?? fallback;
}
