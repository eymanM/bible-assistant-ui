import { en } from '../../lib/locales/en';
import { pl } from '../../lib/locales/pl';

describe('Translations', () => {
  type AnyObject = { [key: string]: any };

  function compareKeys(obj1: AnyObject, obj2: AnyObject, path: string = '') {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();

    expect(keys1).toEqual(keys2);

    for (const key of keys1) {
      if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
        compareKeys(obj1[key], obj2[key], `${path}.${key}`);
      }
    }
  }

  it('should have matching keys for English and Polish translations', () => {
    compareKeys(en, pl);
  });
});
