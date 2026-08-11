import { MarkdownView } from 'obsidian';
import type PaperCraftPlugin from '../../main';
import { DrawingElement, DrawingLayer } from '../data/PaperData';

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

/**
 * 绘图模块 - 在稿纸上提供 SVG 绘图能力
 */
export class DrawingCanvas {
  private plugin: PaperCraftPlugin;
  private svgEl: SVGSVGElement | null = null;
  private currentLayer: string = 'layer-1';
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

    // 移除已有的画布
    this.detach();

    const container = view.containerEl;
    const editorEl = container.querySelector('.markdown-source-view .cm-content') ||
                     container.querySelector('.markdown-preview-view');
    if (!editorEl) return;

    // 创建 SVG 覆盖层
    this.svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgEl.classList.add('papercraft-drawing-layer');
    this.svgEl.setAttribute('width', '100%');
    this.svgEl.setAttribute('height', '100%');
    this.svgEl.style.position = 'absolute';
    this.svgEl.style.top = '0';
    this.svgEl.style.left = '0';
    this.svgEl.style.pointerEvents = 'none';
    this.svgEl.style.zIndex = '10';

    // 设置容器为相对定位
    if (editorEl instanceof HTMLElement) {
      editorEl.style.position = 'relative';
      editorEl.appendChild(this.svgEl);
    }

    // 加载已保存的绘图数据
    this.loadDrawingData();

    // 绑定事件
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

    // 更新 SVG 的交互状态
    if (this.svgEl) {
      this.svgEl.style.pointerEvents = tool === 'select' ? 'none' : 'auto';
      this.svgEl.style.cursor = this.getCursorForTool(tool);
    }
  }

  /**
   * 获取工具对应的鼠标样式
   */
  private getCursorForTool(tool: ToolType): string {
    switch (tool) {
      case 'select': return 'default';
      case 'eraser': return 'not-allowed';
      default: return 'crosshair';
    }
  }

  /**
   * 绑定鼠标事件
   */
  private bindEvents(editorEl: Element | null) {
    if (!editorEl || !this.svgEl) return;

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

    // 创建临时元素
    this.currentElement = this.createTempElement();
    if (this.currentElement) {
      this.svgEl!.appendChild(this.currentElement);
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

    // 保存绘制的元素
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
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
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
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', String(strokeWidth));
        rect.setAttribute('fill', 'none');
        rect.setAttribute('opacity', String(opacity));
        return rect;
      }
      case 'circle': {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', String(strokeWidth));
        circle.setAttribute('fill', 'none');
        circle.setAttribute('opacity', String(opacity));
        return circle;
      }
      case 'freehand': {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
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
   * 更新形状元素（线、矩形、圆形）
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
        const width = Math.abs(currentPoint[0] - this.startPoint[0]);
        const height = Math.abs(currentPoint[1] - this.startPoint[1]);
        rect.setAttribute('x', String(x));
        rect.setAttribute('y', String(y));
        rect.setAttribute('width', String(width));
        rect.setAttribute('height', String(height));
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
    switch (this.activeTool) {
      case 'line':
        return {
          type: 'line',
          points: [this.startPoint, endPoint],
          strokeColor: this.toolConfig.strokeColor,
          strokeWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity,
        };
      case 'rect': {
        const x = Math.min(this.startPoint[0], endPoint[0]);
        const y = Math.min(this.startPoint[1], endPoint[1]);
        const width = Math.abs(endPoint[0] - this.startPoint[0]);
        const height = Math.abs(endPoint[1] - this.startPoint[1]);
        return {
          type: 'rect',
          points: [[x, y], [x + width, y + height]],
          strokeColor: this.toolConfig.strokeColor,
          strokeWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity,
        };
      }
      case 'circle': {
        const dx = endPoint[0] - this.startPoint[0];
        const dy = endPoint[1] - this.startPoint[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        return {
          type: 'circle',
          points: [this.startPoint, [radius, 0]],
          strokeColor: this.toolConfig.strokeColor,
          strokeWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity,
        };
      }
      case 'freehand':
        return {
          type: 'freehand',
          points: this.currentPath as [number, number][],
          strokeColor: this.toolConfig.strokeColor,
          strokeWidth: this.toolConfig.strokeWidth,
          opacity: this.toolConfig.opacity,
        };
      default:
        return null;
    }
  }

  /**
   * 保存元素到当前图层
   */
  private saveElement(element: DrawingElement) {
    const layer = this.plugin.settings.drawing.layers.find(l => l.id === this.currentLayer);
    if (layer) {
      layer.elements.push(element);
      this.plugin.saveSettings();
    }
  }

  /**
   * 加载绘图数据并渲染
   */
  private loadDrawingData() {
    if (!this.svgEl) return;

    // 清空现有元素
    while (this.svgEl.firstChild) {
      this.svgEl.removeChild(this.svgEl.firstChild);
    }

    // 渲染所有可见图层的元素
    for (const layer of this.plugin.settings.drawing.layers) {
      if (!layer.visible) continue;
      for (const element of layer.elements) {
        this.renderElement(element);
      }
    }
  }

  /**
   * 渲染单个元素到 SVG
   */
  private renderElement(element: DrawingElement) {
    if (!this.svgEl) return;

    let svgElement: SVGElement | null = null;

    switch (element.type) {
      case 'line': {
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        svgElement.setAttribute('x1', String(element.points[0][0]));
        svgElement.setAttribute('y1', String(element.points[0][1]));
        svgElement.setAttribute('x2', String(element.points[1][0]));
        svgElement.setAttribute('y2', String(element.points[1][1]));
        break;
      }
      case 'rect': {
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const x = element.points[0][0];
        const y = element.points[0][1];
        const width = element.points[1][0] - x;
        const height = element.points[1][1] - y;
        svgElement.setAttribute('x', String(x));
        svgElement.setAttribute('y', String(y));
        svgElement.setAttribute('width', String(width));
        svgElement.setAttribute('height', String(height));
        break;
      }
      case 'circle': {
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        svgElement.setAttribute('cx', String(element.points[0][0]));
        svgElement.setAttribute('cy', String(element.points[0][1]));
        svgElement.setAttribute('r', String(element.points[1][0]));
        break;
      }
      case 'freehand': {
        svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (element.points.length < 2) break;
        let d = `M ${element.points[0][0]} ${element.points[0][1]}`;
        for (let i = 1; i < element.points.length; i++) {
          d += ` L ${element.points[i][0]} ${element.points[i][1]}`;
        }
        svgElement.setAttribute('d', d);
        break;
      }
    }

    if (svgElement) {
      svgElement.setAttribute('stroke', element.strokeColor);
      svgElement.setAttribute('stroke-width', String(element.strokeWidth));
      svgElement.setAttribute('opacity', String(element.opacity));
      svgElement.setAttribute('fill', 'none');
      svgElement.setAttribute('stroke-linecap', 'round');
      svgElement.setAttribute('stroke-linejoin', 'round');
      this.svgEl.appendChild(svgElement);
    }
  }

  /**
   * 添加红栏快捷功能
   */
  addRedBar(position: 'left' | 'right' = 'right', width: number = 100) {
    const element: DrawingElement = {
      type: 'line',
      points: position === 'right'
        ? [[-width, 0], [-width, 9999]]
        : [[width, 0], [width, 9999]],
      strokeColor: '#E24B4A',
      strokeWidth: 1.5,
      opacity: 0.7,
    };

    const layer = this.plugin.settings.drawing.layers.find(l => l.id === 'redbar');
    if (layer) {
      layer.elements = [element];
    } else {
      this.plugin.settings.drawing.layers.push({
        id: 'redbar',
        name: '红栏',
        visible: true,
        elements: [element],
      });
    }

    this.plugin.saveSettings();
    this.loadDrawingData();
  }

  /**
   * 清除当前图层
   */
  clearLayer() {
    const layer = this.plugin.settings.drawing.layers.find(l => l.id === this.currentLayer);
    if (layer) {
      layer.elements = [];
      this.plugin.saveSettings();
      this.loadDrawingData();
    }
  }

  /**
   * 撤销最后一个元素
   */
  undo() {
    const layer = this.plugin.settings.drawing.layers.find(l => l.id === this.currentLayer);
    if (layer && layer.elements.length > 0) {
      layer.elements.pop();
      this.plugin.saveSettings();
      this.loadDrawingData();
    }
  }
}
