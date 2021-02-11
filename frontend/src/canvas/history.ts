type HistoryParams = {
  xPixels: number;
  yPixels: number;
  colorData: string[][][];
}

export class CanvasHistory {
  constructor(params: HistoryParams) {
    this.xPixels = params.xPixels;
    this.yPixels = params.yPixels;
    this.colorData = params.colorData.map(
      layers => layers.map(
        colors => colors.slice()
      )
    );
  }

  public xPixels: number;
  public yPixels: number;
  public colorData: string[][][];

  public equals(target: CanvasHistory): boolean {
    return (
      this.xPixels === target.xPixels &&
      this.yPixels === target.yPixels &&
      JSON.stringify(this.colorData) === JSON.stringify(target.colorData)
    );
  }
}
