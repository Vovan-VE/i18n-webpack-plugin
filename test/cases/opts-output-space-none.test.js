import fs from 'fs';
import processFile from '../cases.setup';

describe('opts-output-space-none', () => {
  const extracted = [];
  const outputSpace = null;

  beforeAll(() => processFile('opts-output-space-none.code.js', { outputSpace })
    .then(({ files }) => {
      Object.keys(files).forEach((name) => {
        extracted.push({
          name,
          content: fs.readFileSync(files[name], 'utf8'),
        });
      });
    }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot();
  });
});
