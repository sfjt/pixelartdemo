import { config } from '../config';
import { CanvasHistory } from './history';
import { Position } from './position';

export type CanvasStateParams = {
  xPixels: number;
  yPixels: number;
  pixelSize: number;
  colorData: string[][][];
  selected: {
    groupId: number;
    layerIds: number[];
  };
}

export class CanvasState {
  constructor(params?: CanvasStateParams) {
    if (params) {
      this.xPixels = params.xPixels;
      this.yPixels = params.yPixels;
      this.pixelSize = params.pixelSize;
      this.colorData = params.colorData.map(
        layers => layers.map(
          colors => colors.slice()
        )
      );
      this.selected = {
        groupId: params.selected.groupId,
        layerIds: params.selected.layerIds.slice()
      };
    } else {
      this.xPixels = config.DEFAULT_X_PIXELS;
      this.yPixels = config.DEFAULT_Y_PIXELS;
      this.pixelSize = config.DEFAULT_PIXEL_SIZE;
      this.colorData = [[
        new Array(config.DEFAULT_X_PIXELS * config.DEFAULT_Y_PIXELS).fill('')
      ]];
      this.selected = {
        groupId: 0,
        layerIds: [0]
      };
    }
  }

  public xPixels: number;
  public yPixels: number;
  public pixelSize: number;
  public selected: {
    groupId: number;
    layerIds: number[];
  }
  public colorData: string[][][];

  public getSelectedDataRef(): string[] {
    const { groupId, layerIds } = this.selected;
    const layerId = layerIds[this.selected.groupId];
    return this.colorData[groupId][layerId];
  }

  public getSelectedIds(): { gid: number; lid: number } {
    const { groupId, layerIds } = this.selected;
    return ({
      gid: groupId,
      lid: layerIds[groupId]
    });
  }

  public setColor(targets: Position[], color: string): void {
    const target = this.getSelectedDataRef();
    targets.forEach(t => {
      target[t.y * this.xPixels + t.x] = color;
    });
  }

  public getColor(target: Position): string {
    const data = this.getSelectedDataRef();
    return data[target.y * this.xPixels + target.x];
  }

  // Flood fill
  public findColorArea(start: Position): Position[] {
    const targetColor = this.getColor(start);
    if (targetColor === null) return [];

    const visited: string[] = [];
    const result: Position[] = [];

    const search4Way = (p: Position): void => {
      const { x, y } = p;
      const key = `${x}-${y}`;

      if (x < 0 || y < 0) return;
      if (x >= this.xPixels || y >= this.yPixels) return;
      if (visited.includes(key)) return;

      visited.push(key);

      const color = this.getColor(p);
      if (color === targetColor) {
        result.push(p);
      } else {
        return;
      }

      // South -> North -> East -> West
      search4Way(new Position(x, y + 1));
      search4Way(new Position(x, y - 1));
      search4Way(new Position(x + 1, y));
      search4Way(new Position(x - 1, y));
      return;
    };

    search4Way(start);
    return result;
  }

  public resizeColorData(destXPixels: number, destYPixels: number): CanvasState {
    const originXPixels = this.xPixels;
    const originYPixels = this.yPixels;
    const xd = destXPixels - originXPixels;
    const yd = destYPixels - originYPixels;

    const resized = this.colorData.map(
      layers => layers.map(
        colors => {
          const copy = colors.slice();
          if (yd > 0) {
            const addCount = originXPixels * yd;
            copy.splice(colors.length, 0, ...new Array(addCount).fill(''));
          } else if (yd < 0) {
            const dropCount = Math.abs(originXPixels * yd);
            copy.splice((originXPixels * originYPixels) - dropCount, dropCount);
          }

          if (xd > 0) {
            for (let i = destYPixels; i > 0; i--) {
              const insertStart = originXPixels * i;
              copy.splice(insertStart, 0, ...new Array(xd).fill(''));
            }
          } else if (xd < 0) {
            for (let i = destYPixels; i > 0; i--) {
              const dropStart = originXPixels * i - Math.abs(xd);
              copy.splice(dropStart, Math.abs(xd));
            }
          }
          return copy;
        }
      )
    );

    return (new CanvasState({
      xPixels: destXPixels,
      yPixels: destYPixels,
      pixelSize: this.pixelSize,
      colorData: resized,
      selected: this.selected
    }));
  }

  public createHistory(): CanvasHistory {
    return (new CanvasHistory({
      xPixels: this.xPixels,
      yPixels: this.yPixels,
      colorData: this.colorData
    }));
  }

  public hasSameContent(history: CanvasHistory | undefined): boolean {
    if (!history) {
      return false;
    }
    return (
      this.xPixels === history.xPixels &&
      this.yPixels === history.yPixels &&
      JSON.stringify(this.colorData) === JSON.stringify(history.colorData)
    );
  }

  public dump(): string {
    return (JSON.stringify({
      xPixels: this.xPixels,
      yPixels: this.yPixels,
      pixelSize: this.pixelSize,
      colorData: this.colorData,
      selected: this.selected
    }));
  }
}
