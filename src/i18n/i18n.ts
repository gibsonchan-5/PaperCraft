/**
 * 稿纸工坊 - i18n 国际化
 * PaperCraft - Internationalization
 */

import type { Language } from '../data/PaperData';

type TranslationKey = 
  | 'sidebar.title'
  | 'sidebar.builtin'
  | 'sidebar.custom'
  | 'sidebar.noCustom'
  | 'sidebar.clearFormat'
  | 'sidebar.openSettings'
  | 'settings.title'
  | 'settings.texture'
  | 'settings.lines'
  | 'settings.colors'
  | 'settings.typography'
  | 'settings.drawing'
  | 'settings.template'
  | 'settings.language'
  | 'settings.version';

const translations: Record<Language, Record<TranslationKey, string>> = {
  'zh-CN': {
    'sidebar.title': 'PaperCraft',
    'sidebar.builtin': '内置模板',
    'sidebar.custom': '自定义模板',
    'sidebar.noCustom': '暂无自定义模板',
    'sidebar.clearFormat': '清除格式',
    'sidebar.openSettings': '打开设置',
    'settings.title': 'PaperCraft 设置',
    'settings.texture': '纸张质感',
    'settings.lines': '条纹图案',
    'settings.colors': '颜色配色',
    'settings.typography': '字体排版',
    'settings.drawing': '手绘图层',
    'settings.template': '模板管理',
    'settings.language': '语言',
    'settings.version': '版本',
  },
  'en': {
    'sidebar.title': 'PaperCraft',
    'sidebar.builtin': 'Built-in Templates',
    'sidebar.custom': 'Custom Templates',
    'sidebar.noCustom': 'No custom templates yet',
    'sidebar.clearFormat': 'Clear Format',
    'sidebar.openSettings': 'Open Settings',
    'settings.title': 'PaperCraft Settings',
    'settings.texture': 'Paper Texture',
    'settings.lines': 'Line Pattern',
    'settings.colors': 'Color Scheme',
    'settings.typography': 'Typography',
    'settings.drawing': 'Drawing Layer',
    'settings.template': 'Template Management',
    'settings.language': 'Language',
    'settings.version': 'Version',
  },
  'ja': {
    'sidebar.title': '稿紙工房',
    'sidebar.builtin': '組み込みテンプレート',
    'sidebar.custom': 'カスタムテンプレート',
    'sidebar.noCustom': 'カスタムテンプレートがありません',
    'sidebar.clearFormat': 'フォーマットをクリア',
    'sidebar.openSettings': '設定を開く',
    'settings.title': '稿紙工房の設定',
    'settings.texture': '用紙テクスチャ',
    'settings.lines': '線パターン',
    'settings.colors': '配色',
    'settings.typography': 'タイポグラフィ',
    'settings.drawing': '手描きレイヤー',
    'settings.template': 'テンプレート管理',
    'settings.language': '言語',
    'settings.version': 'バージョン',
  },
};

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang]?.[key] || translations['zh-CN'][key] || key;
}

export function getAvailableLanguages(): Language[] {
  return ['zh-CN', 'en', 'ja'];
}
