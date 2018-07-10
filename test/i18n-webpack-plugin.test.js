import { name as PROJECT_NAME } from '../package.json';
import I18nYii2ExtractPlugin from '../src';

describe(PROJECT_NAME, () => {
  test('should export the loader', (done) => {
    expect(I18nYii2ExtractPlugin).toBeInstanceOf(Function);
    done();
  });
});
