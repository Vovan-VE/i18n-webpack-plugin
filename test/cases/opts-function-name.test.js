import fs from 'fs';
import processFile from '../cases.setup';

describe('options.functionName', () => {
  describe('the object notation', () => {
    let extracted;

    beforeAll(() => {
      const options = {
        functionName: '__',
      };

      return processFile('opts-function-name.code.js', options)
        .then(({ file }) => {
          extracted = fs.readFileSync(file, 'utf8');
        });
    });

    it('should return extracted keys', () => {
      expect(extracted).toMatchSnapshot();
    });
  });
});
