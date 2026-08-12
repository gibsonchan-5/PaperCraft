import { MarkdownView } from 'obsidian';
import type PaperCraftPlugin from '../../main';
import type { DrawingElement } from '../data/PaperData';

/**
 * 绘图工具类型
 */
export type ToolType = 'select' | 'line' | 'curve' | 'rect' | 'circle' | 'freehand' | 'eraser';

/**
 * 绘图工具配置
 */
export interface ToolConfig {
  type: ToolType;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * 绘图模块 - 在稿纸上提供 SVG 绘图能力
 */
export class DrawingCanvas {
  private plugin: PaperCraftPlugin;
  private svgEl: SVGSVGElement | null = null;
  private activeTool: ToolType = 'select';
  private toolConfig: ToolConfig = {
    type: 'select',
    strokeColor: '#E24B4A',
    strokeWidth: 1.5,
    opacity: 0.7,
  };
  private isDrawing = false;
  private startPoint: [number, number] = [0, 0];
  private currentPath: number[][] = [];
  private currentElement: SVGElement | null = null;

  constructor(plugin: PaperCraftPlugin) {
    this.plugin = plugin;
  }

  /**
   * 启用绘图功能
   */
  enable() {
    const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
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
  attachToView(view: MarkdownView) {
    if (!this.plugin.settings.drawing.enabled) return;

    this.detach();

    const container = view.containerEl;
    const editorEl = container.querySelector('.markdown-source-view .cm-content') ||
                     container.querySelector('.markdown-preview-view');
    if (!editorEl) return;

    // 创建 SVG 覆盖层
    this.svgEl = document.createElementNS(SVG_NS, 'svg');
    this.svgEl.classList.add('papercraft-drawing-layer');
    this.svgEl.setAttribute('width', '100%');
    this.svgEl.setAttribute('height', '100%');

    // 通过 CSS class 控制样式，不直接设置 style
    if (this.activeTool === 'select') {
      this.svgEl.classList.add('papercraft-drawing-inactive');
    } else {
      this.svgEl.classList.remove('papercraft-drawing-inactive');
    }

    editorEl.addClass('papercraft-drawing-container');
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
  setTool(tool: ToolType, config?: Partial<ToolConfig>) {
    this.activeTool = tool;
    if (config) {
      Object.assign(this.toolConfig, config);
    }
    this.toolConfig.type = tool;

    if (this.svgEl) {
      if (tool === 'select') {
        this.svgEl.classList.add('papercraft-drawing-inactive');
      } else {
        this.svgEl.classList.remove('papercraft-drawing-inactive');
      }
      // cursor 通过 CSS class 控制
      this.svgEl.dataset.tool = tool;
    }
  }

  /**
   * 绑定鼠标事件
   */
  private bindEvents(editorEl: Element) {
    if (!this.svgEl) return;

    editorEl.addEventListener('mousedown', this.handleMouseDown.bind(this));
    editorEl.addEventListener('mousemove', this.handleMouseMove.bind(this));
    editorEl.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  /**
   * 鼠标按下
   */
  private handleMouseDown(e: MouseEvent) {
    if (this.activeTool === 'select') return;

    this.isDrawing = true;
    const rect = this.svgEl!.getBoundingClientRect();
    this.startPoint = [e.clientX - rect.left, e.clientY - rect.top];
    this.currentPath = [this.startPoint];

    const tempEl = this.createTempElement();
    if (tempEl) {
      this.currentElement = tempEl;
      this.svgEl!.appendChild(tempEl);
    }
  }

  /**
   * 鼠标移动
   */
  private handleMouseMove(e: MouseEvent) {
    if (!this.isDrawing || !this.svgEl || !this.currentElement) return;

    const rect = this.svgEl.getBoundingClientRect();
    const currentPoint: [number, number] = [e.clientX - rect.left, e.clientY - rect.top];

    if (this.activeTool === 'freehand') {
      this.currentPath.push(currentPoint);
      this.updateFreehandPath();
    } else {
      this.updateShapeElement(currentPoint);
    }
  }

  /**
   * 鼠标释放
   */
  private handleMouseUp(e: MouseEvent) {
    if (!this.isDrawing || !this.svgEl) return;

    this.isDrawing = false;
    const rect = this.svgEl.getBoundingClientRect();
    const endPoint: [number, number] = [e.clientX - rect.left, e.clientY - rect.top];

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
  private createTempElement(): SVGElement | null {
    const { strokeColor, strokeWidth, opacity } = this.toolConfig;

    switch (this.activeTool) {
      case 'line': {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', String(strokeWidth));
        line.setAttribute('opacity', String(opacity));
        line.setAttribute('x1', String(this.startPoint[0]));
        line.setAttribute('y1', String(this.startPoint[1]));
        line.setAttribute('x2', String(this.startPoint[0]));
        line.setAttribute('y2', String(this.startPoint[1]));
        return line;
      }
      case 'rect': {
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', String(strokeWidth));
        rect.setAttribute('fill', 'none');
        rect.setAttribute('opacity', String(opacity));
        return rect;
      }
      case 'circle': {
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', String(strokeWidth));
        circle.setAttribute('fill', 'none');
        circle.setAttribute('opacity', String(opacity));
        return circle;
      }
      case 'freehand': {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', String(strokeWidth));
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', String(opacity));
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        return path;
      }
      default:
        return null;
    }
  }

  /**
   * 更新形状元素
   */
  private updateShapeElement(currentPoint: [number, number]) {
    if (!this.currentElement) return;

    switch (this.activeTool) {
      case 'line': {
        const line = this.currentElement as SVGLineElement;
        line.setAttribute('x2', String(currentPoint[0]));
        line.setAttribute('y2', String(currentPoint[1]));
        break;
      }
      case 'rect': {
        const rect = this.currentElement as SVGRectElement;
        const x = Math.min(this.startPoint[0], currentPoint[0]);
        const y = Math.min(this.startPoint[1], currentPoint[1]);
        const w = Math.abs(currentPoint[0] - this.startPoint[0]);
        const h = Math.abs(currentPoint[1] - this.startPoint[1]);
        rect.setAttribute('x', String(x));
        rect.setAttribute('y', String(y));
        rect.setAttribute('width', String(w));
        rect.setAttribute('height', String(h));
        break;
      }
      case 'circle': {
        const circle = this.currentElement as SVGCircleElement;
        const dx = currentPoint[0] - this.startPoint[0];
        const dy = currentPoint[1] - this.startPoint[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        circle.setAttribute('cx', String(this.startPoint[0]));
        circle.setAttribute('cy', String(this.startPoint[1]));
        circle.setAttribute('r', String(radius));
        break;
      }
    }
  }

  /**
   * 更新自由绘制的路径
   */
  private updateFreehandPath() {
    if (!this.currentElement || this.currentPath.length < 2) return;

    const path = this.currentElement as SVGPathElement;
    let d = `M ${this.currentPath[0][0]} ${this.currentPath[0][1]}`;
    for (let i = 1; i < this.currentPath.length; i++) {
      d += ` L ${this.currentPath[i][0]} ${this.currentPath[i][1]}`;
    }
    path.setAttribute('d', d);
  }

  /**
   * 创建元素数据
   */
  private createElementData(endPoint: [number, number]): DrawingElement | null {
    const toPoints = (pts: Array<[number, number]>): Array<{ x: number; y: number }> =>
      pts.map(([x, y]) => ({ x, y }));

    switch (this.activeTool) {
      case 'line':
        return {
          id: '',
          type: 'line',
          points: toPoints([this.startPoint, endPoint]),
          color: this.toolConfig.strokeColor,
          lineWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity,
        };
      case 'rect': {
        const x = Math.min(this.startPoint[0], endPoint[0]);
        const y = Math.min(this.startPoint[1], endPoint[1]);
        const w = Math.abs(endPoint[0] - this.startPoint[0]);
        const h = Math.abs(endPoint[1] - this.startPoint[1]);
        return {
          id: '',
          type: 'rect',
          points: toPoints([[x, y], [x + w, y + h]]),
          color: this.toolConfig.strokeColor,
          lineWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity,
        };
      }
      case 'circle': {
        const dx = endPoint[0] - this.startPoint[0];
        const dy = endPoint[1] - this.startPoint[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        return {
          id: '',
          type: 'circle',
          points: toPoints([this.startPoint, [radius, 0]]),
          color: this.toolConfig.strokeColor,
          lineWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity,
        };
      }
      case 'freehand':
        return {
          id: '',
          type: 'freehand',
          points: toPoints(this.currentPath as Array<[number, number]>),
          color: this.toolConfig.strokeColor,
          lineWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity,
        };
      default:
        return null;
    }
  }

  /**
   * 保存元素
   */
  private saveElement(element: DrawingElement) {
    if (!element.type) return;
    const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    element.id = id;
    this.plugin.settings.drawing.drawings.push(element);
    void this.plugin.saveSettings();
  }

  /**
   * 加载绘图数据并渲染
   */
  private loadDrawingData() {
    if (!this.svgEl) return;

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
  private renderElement(element: DrawingElement) {
    if (!this.svgEl) return;

    let svgElement: SVGElement | null = null;

    const getX = (p: { x: number; y: number }): number => p.x;
    const getY = (p: { x: number; y: number }): number => p.y;

    switch (element.type) {
      case 'line': {
        svgElement = document.createElementNS(SVG_NS, 'line');
        svgElement.setAttribute('x1', String(getX(element.points[0])));
        svgElement.setAttribute('y1', String(getY(element.points[0])));
        svgElement.setAttribute('x2', String(getX(element.points[1])));
        svgElement.setAttribute('y2', String(getY(element.points[1])));
        break;
      }
      case 'rect': {
        svgElement = document.createElementNS(SVG_NS, 'rect');
        const rx = getX(element.points[0]);
        const ry = getY(element.points[0]);
        const rw = getX(element.points[1]) - rx;
        const rh = getY(element.points[1]) - ry;
        svgElement.setAttribute('x', String(rx));
        svgElement.setAttribute('y', String(ry));
        svgElement.setAttribute('width', String(rw));
        svgElement.setAttribute('height', String(rh));
        break;
      }
      case 'circle': {
        svgElement = document.createElementNS(SVG_NS, 'circle');
        svgElement.setAttribute('cx', String(getX(element.points[0])));
        svgElement.setAttribute('cy', String(getY(element.points[0])));
        svgElement.setAttribute('r', String(getX(element.points[1])));
        break;
      }
      case 'freehand': {
        svgElement = document.createElementNS(SVG_NS, 'path');
        if (element.points.length < 2) break;
        let d = `M ${getX(element.points[0])} ${getY(element.points[0])}`;
        for (let i = 1; i < element.points.length; i++) {
          d += ` L ${getX(element.points[i])} ${getY(element.points[i])}`;
        }
        svgElement.setAttribute('d', d);
        break;
      }
    }

    if (svgElement) {
      svgElement.setAttribute('stroke', element.color);
      svgElement.setAttribute('stroke-width', String(element.lineWidth));
      svgElement.setAttribute('opacity', String(element.opacity));
      svgElement.setAttribute('fill', 'none');
      svgElement.setAttribute('stroke-linecap', 'round');
      svgElement.setAttribute('stroke-linejoin', 'round');
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
}
