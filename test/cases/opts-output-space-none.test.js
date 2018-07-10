import fs from 'fs';
import processFile from '../cases.setup';

describe('opts-output-space-none', () => {
  let extracted;
  const outputSpace = null;

  beforeAll(() => processFile('simple.code.js', { outputSpace })
    .then(({ file }) => {
      extracted = fs.readFileSync(file, 'utf8');
    }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot('opts-output-space-none.test.js');
  });
});
