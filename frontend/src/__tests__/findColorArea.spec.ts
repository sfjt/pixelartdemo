import path from 'path';
import fs from 'fs';

import { CanvasState } from '../canvas/state';
import { Position } from '../canvas/position';

describe('findColorArea', () => {
  test.each([
    'case.1.json',
    'case.2.json',
    'case.3.json',
    'case.4.json',
  ])('test with data table: %s', async (fileName: string) => {
    const p = path.resolve(__dirname, 'data', 'findColorArea', fileName);
    const s = await fs.promises.readFile(p, 'utf-8');
    const data = JSON.parse(s);
    const state = new CanvasState(data.state);
    const start = new Position(data.start[0], data.start[1]);

    const area = state.findColorArea(start);
    const result = area.map(p => [p.x, p.y]);

    expect(result.length).toEqual(data.expected.length);
    expect(result).toEqual(
      expect.arrayContaining(data.expected)
    );
  });
});
