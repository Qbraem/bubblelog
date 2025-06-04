import { generateAdvice } from '../generateAdvice.js';

describe('generateAdvice', () => {
  test('returns good message for normal parameters', () => {
    const result = generateAdvice(7, 5, 5, 0, 0, 10, 20);
    expect(result.severity).toBe(0);
    expect(result.text).toContain('Water quality looks good');
  });

  test('warns when GH is low', () => {
    const result = generateAdvice(7, 2, 5, 0, 0, 10, 20);
    expect(result.severity).toBe(1);
    expect(result.text).toContain('GH is low');
  });

  test('critical when chlorine detected', () => {
    const result = generateAdvice(7, 5, 5, 1, 0, 10, 20);
    expect(result.severity).toBe(2);
    expect(result.text).toContain('Chlorine detected');
  });
});
