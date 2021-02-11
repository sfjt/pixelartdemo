import path from 'path';
import fs from 'fs';

import { CanvasState } from '../canvas/state';

describe('resize', () => {
  test.each([
    'case.1.json',
    'case.2.json',
    'case.3.json',
    'case.4.json'
  ])('test with data table: %s', async (fileName: string) => {
    const p = path.resolve(__dirname, 'data', 'resize', fileName);
    const s = await fs.promises.readFile(p, 'utf-8');
    const data = JSON.parse(s);
    const state = new CanvasState(data.state);

    const resized = state.resizeColorData(data.dest[0], data.dest[1]);

    expect(resized.colorData).toEqual(data.expected);
  });
});
