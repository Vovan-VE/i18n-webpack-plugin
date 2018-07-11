import fs from 'fs';
import processFile from '../cases.setup';

describe('update-input', () => {
  let extracted;
  const inputFileName = 'input.src.json';

  beforeAll(() => processFile('simple.code.js', { inputFileName })
    .then(({ file }) => {
      extracted = fs.readFileSync(file, 'utf8');
    }));

  it('should return merged with translations', () => {
    expect(extracted).toMatchSnapshot();
  });
});
