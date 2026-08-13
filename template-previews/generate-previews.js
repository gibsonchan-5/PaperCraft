/**
 * 生成模板预览图（小红书配图）
 * 每个模板生成一张独立的 HTML 文件，用户可直接截图
 */

const templates = [
  { id: 'moon-white', name: '月白', bg: '#F0F3F8', pattern: 'horizontal', lineColor: 'rgba(180, 195, 220, 0.30)', gap: 38, thickness: 0.5 },
  { id: 'star-dot', name: '星点', bg: '#F7F5F0', pattern: 'dot', lineColor: 'rgba(155, 150, 140, 0.45)', gap: 28, thickness: 1.5 },
  { id: 'mint-shadow', name: '薄荷碎影', bg: '#E8F5E9', pattern: 'horizontal', lineColor: 'rgba(100, 180, 140, 0.28)', gap: 36, thickness: 0.6 },
  { id: 'old-book-grid', name: '旧卷星砂', bg: '#F5ECD6', pattern: 'dot', lineColor: 'rgba(139, 90, 43, 0.35)', gap: 32, thickness: 1.0 },
  { id: 'rose-letter', name: '玫瑰落英', bg: '#FFF8F2', pattern: 'dot', lineColor: 'rgba(200, 120, 140, 0.40)', gap: 38, thickness: 1.2 },
  { id: 'sky-blue-grid', name: '晴空碎玉', bg: '#E3F2FD', pattern: 'dot', lineColor: 'rgba(86, 170, 225, 0.40)', gap: 30, thickness: 1.2 },
  { id: 'bean-green', name: '豆沙清梦', bg: '#CCE8CF', pattern: 'horizontal', lineColor: 'rgba(100, 140, 110, 0.30)', gap: 40, thickness: 0.5 },
  { id: 'pure-white-grid', name: '素笺白露', bg: '#FFFFFF', pattern: 'dot', lineColor: 'rgba(180, 180, 180, 0.30)', gap: 28, thickness: 1.0 },
  { id: 'ink-blue-lines', name: '墨蓝横线', bg: '#F5F9FC', pattern: 'horizontal', lineColor: 'rgba(40, 80, 120, 0.35)', gap: 36, thickness: 0.7 },
  { id: 'light-purple-grid', name: '淡紫微雨', bg: '#F3E5F5', pattern: 'dot', lineColor: 'rgba(150, 120, 180, 0.35)', gap: 32, thickness: 1.2 },
  { id: 'mint-lines', name: '薄荷横线', bg: '#E8F5E9', pattern: 'horizontal', lineColor: 'rgba(80, 160, 120, 0.30)', gap: 38, thickness: 0.5 },
  { id: 'charcoal-dots', name: '炭灰星点', bg: '#F5F5F5', pattern: 'dot', lineColor: 'rgba(100, 100, 100, 0.40)', gap: 30, thickness: 1.0 },
  { id: 'warm-yellow', name: '暖黄流光', bg: '#FFF8E1', pattern: 'dot', lineColor: 'rgba(180, 140, 80, 0.40)', gap: 34, thickness: 1.2 },
  { id: 'peach-paper', name: '桃花拾遗', bg: '#FCE4EC', pattern: 'dot', lineColor: 'rgba(220, 120, 140, 0.35)', gap: 40, thickness: 1.2 },
  { id: 'ancient-vertical', name: '古风遗韵', bg: '#F5ECD6', pattern: 'vertical', lineColor: 'rgba(120, 100, 80, 0.30)', gap: 36, thickness: 0.4 },
  { id: 'modern-minimal', name: '现代极简', bg: '#FAFAFA', pattern: 'none', lineColor: 'transparent', gap: 38, thickness: 0.5 },
];

function generateLinesSVG(pattern, lineColor, gap, thickness, width, height) {
  let lines = '';
  
  if (pattern === 'horizontal') {
    for (let y = gap; y < height; y += gap) {
      lines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${lineColor}" stroke-width="${thickness}"/>`;
    }
  } else if (pattern === 'vertical') {
    for (let x = gap; x < width; x += gap) {
      lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${lineColor}" stroke-width="${thickness}"/>`;
    }
  } else if (pattern === 'dot') {
    const dotRadius = thickness * 0.8;
    for (let y = gap; y < height; y += gap) {
      for (let x = gap; x < width; x += gap) {
        lines += `<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="${lineColor}"/>`;
      }
    }
  }
  
  return lines;
}

function generateHTML(template) {
  const width = 1080;
  const height = 1080;
  const lines = generateLinesSVG(template.pattern, template.lineColor, template.gap, template.thickness, width, height);
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name} - 稿纸工坊</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    }
    .container {
      width: 100%;
      height: 100%;
      position: relative;
      background-color: ${template.bg};
    }
    .lines-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .title-overlay {
      position: absolute;
      bottom: 80px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 72px;
      font-weight: 300;
      letter-spacing: 0.15em;
      color: rgba(0, 0, 0, 0.6);
      font-family: 'STKaiti', 'KaiTi', serif;
    }
    .brand {
      position: absolute;
      top: 40px;
      right: 60px;
      font-size: 28px;
      color: rgba(0, 0, 0, 0.2);
      letter-spacing: 0.1em;
    }
  </style>
</head>
<body>
  <div class="container">
    <svg class="lines-layer" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${lines}
    </svg>
    <div class="brand">稿纸工坊</div>
    <div class="title-overlay">${template.name}</div>
  </div>
</body>
</html>`;
}

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname);

templates.forEach(template => {
  const html = generateHTML(template);
  const filename = `${template.id}.html`;
  fs.writeFileSync(path.join(outputDir, filename), html, 'utf-8');
  console.log(`Generated: ${filename}`);
});

console.log(`\nAll ${templates.length} preview files generated.`);
