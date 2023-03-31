import { sinclair } from '../src/sinclair';

const M = sinclair.Sex.Male;
const F = sinclair.Sex.Female;

describe('sinclair coeff A', () => {
  const a = sinclair.coeff_a;
  it('is less than 1', () => {
    expect(a(M)).toBeLessThan(1);
    expect(a(F)).toBeLessThan(1);
  });
  it('is positive', () => {
    expect(a(M)).toBeGreaterThanOrEqual(0);
    expect(a(F)).toBeGreaterThanOrEqual(0);
  });
});

describe('sinclair coeff B', () => {
  const b = sinclair.coeff_b;

  it('is more than 100', () => {
    expect(b(M)).toBeGreaterThan(100);
    expect(b(F)).toBeGreaterThan(100);
  });
});

describe('extended sinclair coeff sex', () => {
  const c = sinclair.coeff_sex;
  it('is 1.0 for same sex', () => {
    expect(c(M, M)).toBe(1.0);
    expect(c(F, F)).toBe(1.0);
  });

  it('is more than 1.0 for female to male', () => {
    expect(c(F, M)).toBeGreaterThan(1.0);
  });

  it('is less than 1.0 but positive for male to female', () => {
    const res = c(M, F);
    expect(res).toBeLessThan(1.0);
    expect(res).toBeGreaterThan(0);
  });
});

describe('extended sinclair coeff age', () => {
  const c = sinclair.coeff_age;
  const first = c(0);
  it('is equal for under 30', () => {
    for (let i = 1; i < 30; ++i) {
      expect(c(i)).toBe(first);
    }
  });
  it('is 1 for 30', () => {
    expect(c(30)).toBe(1);
  });

  const last = c(90);
  it('is equal for over 90', () => {
    for (let i = 91; i < 120; ++i) {
      expect(c(i)).toBe(last);
    }
  });

  it('grows from 30 to 90', () => {
    let prev = c(30);
    for (let i = 31; i <= 90; ++i) {
      let cur = c(i);
      expect(cur).toBeGreaterThan(prev);
      prev = cur;
    }
  });
});

describe('sinclair', () => {
  // sex, body weight, lifted weight, score
  const data = [
    [M, 42.1, 222, 431.93108853077496],
    [M, 77.7, 233, 289.4147140367716],
    [M, 83.7, 140, 167.4500649360664],
    [M, 300.4, 140, 140],
    [F, 34.8, 47, 99.54501138158764],
    [F, 50.1, 98, 150.25376495046706],
    [F, 54.3, 133, 192.19587849267825],
    [F, 60.0, 140, 189.149459428629],
    [F, 75.6, 160, 189.87059266201155],
    [F, 333, 200, 200],
  ];

  it('calculates score correctly', () => {
    data.forEach(d => {
      let [sex, bw, result, expected] = d;
      const a = sinclair.coeff_a(sex);
      const b = sinclair.coeff_b(sex);
      const score = sinclair.score(a, b, bw, result);
      expect(score).toBeCloseTo(expected);
    });
  });

  it('calculates lifted weight correctly', () => {
    data.forEach(d => {
      let [sex, bw, expected, score] = d;
      const a = sinclair.coeff_a(sex);
      const b = sinclair.coeff_b(sex);
      const result = sinclair.weight(a, b, bw, score);
      expect(result).toBeCloseTo(expected);
    });
  });

  it("calculates lifter's weight correctly", () => {
    data.forEach(d => {
      let [sex, expected, result, score] = d;
      const a = sinclair.coeff_a(sex);
      const b = sinclair.coeff_b(sex);
      const bw = sinclair.body_weight(a, b, result, score);
      expected = Math.min(expected, b);
      expect(bw).toBeCloseTo(expected);
    });
  });
});
