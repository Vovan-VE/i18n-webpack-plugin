import fs from 'fs';
import processFile from '../cases.setup';

describe('options.functionName', () => {
  describe('the object notation', () => {
    const extracted = [];

    beforeAll(() => {
      const options = {
        functionName: '__',
      };

      return processFile('opts-function-name.code.js', options)
        .then(({ files }) => {
          Object.keys(files).forEach((name) => {
            extracted.push({
              name,
              content: fs.readFileSync(files[name], 'utf8'),
            });
          });
        });
    });

    it('should return extracted keys', () => {
      expect(extracted).toMatchSnapshot();
    });
  });
});
