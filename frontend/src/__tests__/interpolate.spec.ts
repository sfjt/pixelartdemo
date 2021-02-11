import path from 'path';
import fs from 'fs';

import { Position } from '../canvas/position';

describe('interpolate', () => {
  test.each([
    'case.1.json',
    'case.2.json',
    'case.3.json',
    'case.4.json',
    'case.5.json',
    'case.6.json',
    'case.7.json',
    'case.8.json',
    'case.9.json',
    'case.10.json'
  ])('test with data table: %s', async (fileName: string) => {
    const p = path.resolve(__dirname, 'data', 'interpolate', fileName);
    const s = await fs.promises.readFile(p, 'utf-8');
    const data = JSON.parse(s);
    const input = data.input;
    const start = new Position(input[0][0], input[0][1]);
    const dest = new Position(input[1][0], input[1][1]);

    const positions = Position.interpolate(start, dest);
    const result = [];
    for (let i = 0; i < positions.length; i++) {
      result.push([positions[i].x, positions[i].y]);
    }

    expect(result).toEqual(data.expected);
  });
});
