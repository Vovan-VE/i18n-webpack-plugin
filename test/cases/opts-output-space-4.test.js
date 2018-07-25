import fs from 'fs';
import processFile from '../cases.setup';

describe('opts-output-space-4', () => {
  const extracted = [];
  const outputSpace = 4;

  beforeAll(() => processFile('opts-output-space-4.code.js', { outputSpace })
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
