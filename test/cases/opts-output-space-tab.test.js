import fs from 'fs';
import processFile from '../cases.setup';

describe('opts-output-space-tab', () => {
  let extracted;
  const outputSpace = '\t';

  beforeAll(() => processFile('simple.code.js', { outputSpace })
    .then(({ file }) => {
      extracted = fs.readFileSync(file, 'utf8');
    }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot('opts-output-space-tab.test.js');
  });
});
