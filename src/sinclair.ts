// License: Any of the licenses in https://github.com/tlammi/sinclair/tree/licenses
/**
 * Extended and standard sinclair formula implementations
 *
 * Standard sinclair coefficient is calculated with formula
 * 10^(A*log10(bw/b))
 * where
 * A is a constant coefficient
 * b is the world record holder's weight in heavy weight class
 * bw is the lifter's body weight
 *
 * The extended formula uses additional coefficients to take into account the lifter's age and sex.
 *
 * Sex is adjusted with a constant. Female points can be converted to male points by
 * multiplying with a constant and otherway around. The lifter's age is taken into
 * account by using age-specific coefficients. Lifters age 30 and under have
 * a coefficient of 1.0.
 * */
export namespace sinclair {
  const min = Math.min;
  const max = Math.max;
  const log10 = Math.log10;
  const pow = Math.pow;
  const sqrt = Math.sqrt;
  // Coefficient for converting female to male Sinclair points
  const FEMALE_TO_MALE_COEFF = 1.354;

  /**
   * Age coefficients for ages 30-90
   * */
  const MELTZER_FABER = [
    1.0,
    1.016,
    1.031,
    1.046,
    1.059,
    1.072,
    1.083,
    1.096,
    1.109,
    1.122,
    1.135,
    1.149,
    1.162,
    1.176,
    1.189,
    1.203,
    1.218,
    1.233,
    1.248,
    1.263,
    1.279,
    1.297,
    1.316,
    1.338,
    1.361,
    1.385,
    1.411,
    1.437,
    1.462,
    1.488,
    1.514,
    1.541,
    1.568,
    1.598,
    1.629,
    1.663,
    1.699,
    1.738,
    1.779,
    1.823,
    1.867,
    1.91,
    1.953,
    2.004,
    2.06,
    2.117,
    2.181,
    2.255,
    2.336,
    2.419,
    2.504,
    2.597,
    2.702,
    2.831,
    2.981,
    3.153,
    3.352,
    3.58,
    3.843,
    4.145,
    4.493,
  ];

  export enum Sex {
    Male,
    Female,
  }

  // Standard "A" coefficient for sinclair coefficient
  export function coeff_a(s: Sex): number {
    switch (s) {
      case Sex.Male:
        return 0.75194503;
      case Sex.Female:
        return 0.783497476;
    }
  }

  // Standard "b" coefficient for sinclair coefficient
  export function coeff_b(s: Sex): number {
    switch (s) {
      case Sex.Male:
        return 175.508;
      case Sex.Female:
        return 153.655;
    }
  }

  // Sex projection coefficient
  export function coeff_sex(real: Sex, projected: Sex): number {
    if (real === projected) return 1.0;
    if (real === Sex.Male) return 1 / FEMALE_TO_MALE_COEFF;
    return FEMALE_TO_MALE_COEFF;
  }

  // Age coefficient
  export function coeff_age(age: number): number {
    const idx = max(0, min(age - 30, MELTZER_FABER.length - 1));
    return MELTZER_FABER[idx];
  }

  /**
   * Extended sinclair coefficient
   *
   * @param a Sinclair A
   * @param b Sinclair b
   * @param c Sex or age coefficient. Interchangeable with d
   * @param d Sex or age coefficient. interchangeable with c
   * @param bw Body weight
   * */
  export function coeff_extended(
    a: number,
    b: number,
    c: number,
    d: number,
    bw: number
  ): number {
    if (bw < b) {
      const exp = a * pow(log10(bw / b), 2);
      return c * d * pow(10, exp);
    }
    return c * d;
  }

  /**
   * Normal sinclair coefficient
   * */
  export function coeff(a: number, b: number, bw: number): number {
    return coeff_extended(a, b, 1.0, 1.0, bw);
  }

  /// Extended sinclair score
  export function score_extended(
    a: number,
    b: number,
    sex_coeff: number,
    age_coeff: number,
    bw: number,
    result: number
  ): number {
    return coeff_extended(a, b, sex_coeff, age_coeff, bw) * result;
  }

  /// Standard sinclair score
  export function score(
    a: number,
    b: number,
    bw: number,
    result: number
  ): number {
    return coeff(a, b, bw) * result;
  }

  /// Extended sinclair formula for calculating lifted weight
  export function weight_extended(
    a: number,
    b: number,
    sex_coeff: number,
    age_coeff: number,
    bw: number,
    score: number
  ): number {
    return score / coeff_extended(a, b, sex_coeff, age_coeff, bw);
  }

  /// Standard sinclair formula for calculating lifted weight
  export function weight(
    a: number,
    b: number,
    bw: number,
    score: number
  ): number {
    return score / coeff(a, b, bw);
  }

  /// Extended sinclair formula for calculating lifter weight
  export function body_weight_extended(
    a: number,
    b: number,
    sex_coeff: number,
    age_coeff: number,
    weight: number,
    score: number
  ) {
    // Cannot deduce weight in this case
    if (score <= sex_coeff * age_coeff * weight) return b;
    const exp = -sqrt(log10(score / (sex_coeff * age_coeff * weight)) / a);
    return b * pow(10, exp);
  }

  /// Standard sinclair formula for calculating lifter weight
  export function body_weight(
    a: number,
    b: number,
    weight: number,
    score: number
  ): number {
    return body_weight_extended(a, b, 1.0, 1.0, weight, score);
  }
}
