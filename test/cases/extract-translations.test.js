import fs from 'fs';
import processFile from '../cases.setup';

describe('extract-translations', () => {
  let extracted;

  beforeAll(() => processFile('extract-translations.code.js')
      .then(({ file }) => {
        extracted = fs.readFileSync(file, 'utf8');
      }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot();
  });
});
