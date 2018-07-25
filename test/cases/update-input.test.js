import fs from 'fs';
import processFile from '../cases.setup';

describe('update-input', () => {
  const extracted = [];
  const inputFileName = 'input.[language].src.json';
  const languages = ['en-US', 'ru-RU'];

  beforeAll(() => processFile('update-input.code.js', { inputFileName, languages })
    .then(({ files }) => {
      Object.keys(files).forEach((name) => {
        extracted.push({
          name,
          content: fs.readFileSync(files[name], 'utf8'),
        });
      });
    }));

  it('should return merged with translations', () => {
    expect(extracted).toMatchSnapshot();
  });
});
