import { zIndexes } from '../config';
import * as _d from '../utils/dom';

type CanvasParams = {
  xPixels: number;
  yPixels: number;
  pixelSize: number;
  colors: string[];
  zIndex: number;
}

type BgParams = {
  xPixels: number;
  yPixels: number;
  pixelSize: number;
  bgColors: {
    primary: string;
    secondary: string;
  }
};
export class Canvas {
  constructor(params: CanvasParams) {

    const width = params.xPixels * params.pixelSize;
    const height = params.yPixels * params.pixelSize;

    this.element = _d.create(
      'canvas',
      {
        width,
        height
      }
    );
    _d.setStyles(this.element, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      zIndex: params.zIndex
    });
    this.context = this.getContext();
    this.render(params.xPixels, params.pixelSize, params.colors);
  }

  public element: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private render(xPixels: number, pixelSize: number, colors: string[]): void {
    for (let i = 0; i < colors.length; i++) {
      const xIndex = (i % xPixels);
      const yIndex = Math.floor(i / xPixels);
      const c = colors[i];
      if (c) this.paintPixel(xIndex, yIndex, pixelSize, colors[i]);
    }
  }

  private getContext(): CanvasRenderingContext2D {
    const ctx = this.element.getContext('2d');
    if (ctx === null) {
      throw new Error('Failed to get canvas context.');
    }
    return ctx;
  }

  private paintPixel(xIndex: number, yIndex: number, pixelSize: number, color: string): void {
    const xStartCo = xIndex * pixelSize;
    const yStartCo = yIndex * pixelSize;
    this.context.fillStyle = color;
    this.context.fillRect(xStartCo, yStartCo, pixelSize, pixelSize);
  }

  public remove(): void {
    this.element.remove();
  }

  public static createBackground(params: BgParams): Canvas {
    const numPixels = params.xPixels * params.yPixels;
    const colors = new Array(numPixels).fill(params.bgColors.primary);
    for (let y = 0; y < params.yPixels; y++) {
      for (let x = 0; x < params.xPixels; x++) {
        if ((x + y) % 2 === 1) {
          colors[params.xPixels * y + x] = params.bgColors.secondary;
        }
      }
    }

    const bg = new Canvas({
      xPixels: params.xPixels,
      yPixels: params.yPixels,
      pixelSize: params.pixelSize,
      zIndex: zIndexes.BG,
      colors
    });

    return bg;
  }
}

