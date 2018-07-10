import fs from 'fs';
import processFile from '../cases.setup';

describe('dynamic-import', () => {
  let extracted;

  beforeAll(() => processFile('dynamic-import.code.js')
      .then(({ file }) => {
        extracted = fs.readFileSync(file, 'utf8');
      }));

  it('should return extracted keys', () => {
    expect(extracted).toMatchSnapshot();
  });
});
