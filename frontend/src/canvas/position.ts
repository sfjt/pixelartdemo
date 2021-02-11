export class Position {
  constructor(x: number, y: number) {
    Position.validateXY(x, y);

    this.x = x;
    this.y = y;
  }

  public x: number;
  public y: number;

  public equals(target: Position): boolean {
    return (
      this.x === target.x &&
      this.y === target.y
    );
  }

  private static validateXY(x: number, y: number): void {
    const isValid = (
      Number.isInteger(x) &&
      Number.isInteger(y)
    );
    if (!isValid) {
      throw new Error('x and y must be integers.');
    }
  }

  private static validatePixelsize(size: number): void {
    const isValid = size > 0;
    if (!isValid) {
      throw new Error('pixelSize must be greater than 0.');
    }
  }

  public static coordinateToPosition(xCo: number, yCo: number, pixelSize: number): Position {
    Position.validatePixelsize(pixelSize);

    const x = Math.trunc(xCo / pixelSize);
    const y = Math.trunc(yCo / pixelSize);

    return new Position(x, y);
  }

  // Bresenham's line algorithm
  public static interpolate(start: Position, dest: Position): Position[] {
    if (start.equals(dest)) return [start];

    let x0 = start.x;
    let y0 = start.y;
    let x1 = dest.x;
    let y1 = dest.y;

    const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    if (steep) {
      const buf0 = x0;
      x0 = y0;
      y0 = buf0;
      const buf1 = x1;
      x1 = y1;
      y1 = buf1;
    }

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const xStep = x0 < x1 ? 1 : -1;
    const yStep = y0 < y1 ? 1 : -1;
    let y = y0;
    let err = dx / 2;
    const result: Position[] = [];

    for (let x = x0; ; x += xStep) {
      if (xStep === 1) {
        if (x > x1) break;
      } else {
        if (x < x1) break;
      }

      if (steep) {
        result.push(new Position(y, x));
      } else {
        result.push(new Position(x, y));
      }

      err -= dy;
      if (err < 0) {
        y += yStep;
        err += dx;
      }
    }

    return result;
  }
}
