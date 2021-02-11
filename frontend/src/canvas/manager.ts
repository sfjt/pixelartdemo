import { config, zIndexes } from '../config';
import { Canvas } from './canvas';
import { CanvasState, CanvasStateParams } from './state';
import { CanvasHistory } from './history';
import { Position } from './position';
import * as _d from '../utils/dom';

type CanvasGroup = {
  container: HTMLDivElement;
  layers: Canvas[];
};

export enum EditMode {
  paint,
  clear,
  fill,
  pick
}
export class CanvasManager {
  constructor() {
    this.state = new CanvasState();
    this.history = {
      prev: [],
      forward: []
    };
    this.editMode = EditMode.paint;
    this.paintColor = '#000000';
    this.bgColors = {
      primary: config.DEFAULT_BG_COLOR_PRIMARY,
      secondary: config.DEFAULT_BG_COLOR_SECONDARY
    };

    this.root = _d.create('div', {
      id: 'px-editor-canvas-root'
    });
    _d.setStyles(this.root, {
      position: 'relative',
    });

    this.background = this.createBackground();
    this.canvasGroups = [];

    this.hud = this.createCanvas(zIndexes.HUD);
    this.root.appendChild(this.hud.element);

    this.eventHolder = _d.create('div', {
      id: 'px-editor-event-holder'
    });
    _d.setStyles(this.eventHolder, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      zIndex: zIndexes.EVENT_HOLDER
    });
    this.root.appendChild(this.eventHolder);

    this.eventPositions = {
      current: null,
      prev: null
    };


  }

  private state: CanvasState;
  private history: {
    prev: CanvasHistory[];
    forward: CanvasHistory[];
  };
  public root: HTMLElement;
  private background: Canvas;
  private canvasGroups: CanvasGroup[];
  private hud: Canvas;
  public eventHolder: HTMLDivElement;
  private eventPositions: {
    current: Position | null;
    prev: Position | null;
  }
  public editMode: EditMode;
  public paintColor: string;
  private bgColors: {
    primary: string;
    secondary: string;
  };

  private updateCanvas(): void {
    const { xPixels, yPixels, pixelSize } = this.state;
    const colors = this.state.getSelectedDataRef();
    const { gid, lid } = this.state.getSelectedIds();
    const zIndex = lid + 1;

    const c = new Canvas({
      xPixels,
      yPixels,
      pixelSize,
      zIndex,
      colors
    });

    this.canvasGroups[gid].layers[lid].remove();
    this.root.appendChild(c.element);
    this.canvasGroups[gid].layers[lid] = c;
  }

  private updateEventPositions(xCo: number, yCo: number): boolean {
    const newPosition = Position.coordinateToPosition(xCo, yCo, this.state.pixelSize);
    const { current } = this.eventPositions;
    if (current) {
      if (current.equals(newPosition)) return false;

      this.eventPositions.prev = current;
    }
    this.eventPositions.current = newPosition;

    return true;
  }

  public clearEventPositions(): void {
    this.eventPositions.current = null;
    this.eventPositions.prev = null;
  }

  private createBackground(): Canvas {
    const bg = Canvas.createBackground({
      xPixels: this.state.xPixels,
      yPixels: this.state.yPixels,
      pixelSize: this.state.pixelSize,
      bgColors: this.bgColors
    });

    return bg;
  }

  private createCanvasGroup(newCanvas = true): CanvasGroup {
    const container = _d.create('div', {});
    _d.setStyles(container, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: `${this.width()}px`,
      height: `${this.height()}px`
    });

    const layers: Canvas[] = [];
    if (newCanvas) layers.push(this.createCanvas(1));

    const group = {
      container,
      layers
    };

    return group;
  }

  private createCanvas(zIndex: number): Canvas {
    const { xPixels, yPixels, pixelSize } = this.state;
    const colors = new Array(xPixels * yPixels).fill('');
    const c = new Canvas({
      xPixels,
      yPixels,
      pixelSize,
      zIndex,
      colors
    });

    return c;
  }

  private width(): number {
    return this.state.xPixels * this.state.pixelSize;
  }

  private height(): number {
    return this.state.yPixels * this.state.pixelSize;
  }

  public renderAll(): void {
    const wh = {
      width: `${this.width()}px`,
      height: `${this.height()}px`
    };
    _d.setStyles(this.root, wh);
    _d.setStyles(this.eventHolder, wh);
    _d.setStyles(this.hud.element, wh);

    const bg = this.createBackground();
    this.background.remove();
    this.root.appendChild(bg.element);
    this.background = bg;

    const { xPixels, yPixels, pixelSize, colorData } = this.state;
    this.canvasGroups.forEach(group => {
      group.container.remove();
      group.layers.forEach(canvas => canvas.remove());
    });
    this.canvasGroups = [];
    for (let gid = 0; gid < colorData.length; gid++) {
      const group = this.createCanvasGroup(false);
      for (let lid = 0; lid < colorData[gid].length; lid++) {
        const zIndex = lid + 1;
        const colors = colorData[gid][lid];
        const c = new Canvas({
          xPixels,
          yPixels,
          pixelSize,
          zIndex,
          colors
        });

        this.root.appendChild(group.container);
        group.container.appendChild(c.element);
        group.layers.push(c);
        this.canvasGroups.push(group);
      }
    }
  }

  public paint(xCo: number, yCo: number): void {
    if (!this.updateEventPositions(xCo, yCo)) return;

    const { current, prev } = this.eventPositions;
    if (!current) return;

    let targets: Position[] = [];
    if (!prev) {
      targets = [current];
    } else if (current.equals(prev)) {
      targets = [current];
    } else {
      targets = Position.interpolate(prev, current);
    }

    const color = this.editMode === EditMode.clear ? '' : this.paintColor;
    this.state.setColor(targets, color);

    this.updateCanvas();
  }

  public fill(xCo: number, yCo: number): void {
    this.updateEventPositions(xCo, yCo);

    const { current } = this.eventPositions;
    if (!current) return;

    const targets = this.state.findColorArea(current);
    this.state.setColor(targets, this.paintColor);

    this.updateCanvas();
  }

  public getXYPixels(): { xPixels: number, yPixels: number } {
    return ({
      xPixels: this.state.xPixels,
      yPixels: this.state.yPixels
    });
  }

  public resize(x: number, y: number): void {
    this.state = this.state.resizeColorData(x, y);
  }

  public createHistory(): void {
    const h = this.state.createHistory();
    if (this.history.prev[0] && this.history.prev[0].equals(h)) return;

    this.history.forward = [];
    this.history.prev.unshift(h);
  }

  public undoCanvas(): void {
    const nowHistory = this.state.createHistory();
    if (!this.history.forward[0] || !this.history.forward[0].equals(nowHistory)) {
      this.history.forward.unshift(nowHistory);
    }

    while (this.state.hasSameContent(this.history.prev[0])) {
      this.history.prev.shift();
    }
    const prevHistory = this.history.prev.shift();
    if (prevHistory) {
      const newState = new CanvasState({
        xPixels: prevHistory.xPixels,
        yPixels: prevHistory.yPixels,
        pixelSize: this.state.pixelSize,
        colorData: prevHistory.colorData,
        selected: this.state.selected
      });

      this.state = newState;
      this.renderAll();
    }
  }

  public redoCanvas(): void {
    const nowHistory = this.state.createHistory();
    if (!this.history.prev[0] || !this.history.prev[0].equals(nowHistory)) {
      this.history.prev.unshift(nowHistory);
    }

    while (this.state.hasSameContent(this.history.forward[0])) {
      this.history.forward.shift();
    }
    const forwardHistory = this.history.forward.shift();
    if (forwardHistory) {
      const newState = new CanvasState({
        xPixels: forwardHistory.xPixels,
        yPixels: forwardHistory.yPixels,
        pixelSize: this.state.pixelSize,
        colorData: forwardHistory.colorData,
        selected: this.state.selected
      });

      this.state = newState;
      this.renderAll();
    }
  }

  public dump(): string {
    return this.state.dump();
  }

  public load(params: CanvasStateParams): void {
    this.state = new CanvasState(params);
  }

  public createDownloadImageURL(pixelSize: number): string {
    const { xPixels, yPixels, colorData } = this.state;
    const colors = colorData[0][0];
    const dummyCanvas = new Canvas({
      xPixels,
      yPixels,
      pixelSize,
      colors,
      zIndex: 0
    });
    return dummyCanvas.element.toDataURL('image/png');
  }
}
