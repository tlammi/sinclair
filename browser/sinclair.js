var _a;
export var A_MALE = 0.751945030;
export var B_MALE = 175.508;
export var A_FEMALE = 0.783497476;
export var B_FEMALE = 153.655;
/**
 * Coefficient to convert female to male points
* */
export var FEMALE_TO_MALE = 1.354;
var LOG10_BASE = Math.log(10);
var log10 = function (x) {
  return Math.log(x) / LOG10_BASE;
};
var sqrt = Math.sqrt;
var pow = Math.pow;
export var Sex;
(function (Sex) {
  Sex[Sex["Male"] = 0] = "Male";
  Sex[Sex["Female"] = 1] = "Female";
})(Sex || (Sex = {}));
;
export var COEFFICIENTS_BY_SEX = (_a = {}, _a[Sex.Male] = [A_MALE, B_MALE], _a[Sex.Female] = [A_FEMALE, B_FEMALE], _a);
/**
 * 10^(a*X^2) where X is log10(body_weight/b)
* */
export function sinclair_coeff(a, b, body_weight) {
  if (body_weight > b) return 1.0;
  var exp = a * pow(log10(body_weight / b), 2);
  return pow(10, exp);
}
/**
 * (body_weight, kg) -> sinclair_score
* */
export function sinclair_score(sex) {
  return function (body_weight, kg) {
    var a = COEFFICIENTS_BY_SEX[sex][0];
    var b = COEFFICIENTS_BY_SEX[sex][1];
    return sinclair_coeff(a, b, body_weight) * kg;
  };
}
/**
 * (body_weight, sinclair_score) -> kg
* */
export function sinclair_kg(sex) {
  return function (body_weight, score) {
    var a = COEFFICIENTS_BY_SEX[sex][0];
    var b = COEFFICIENTS_BY_SEX[sex][1];
    return score / sinclair_coeff(a, b, body_weight);
  };
}
/**
 * (kg, sinclair_score) -> body_weight
* */
export function sinclair_bw(sex) {
  return function (kg, score) {
    var a = COEFFICIENTS_BY_SEX[sex][0];
    var b = COEFFICIENTS_BY_SEX[sex][1];
    var tolerance = 0.01;
    if (kg >= score - tolerance) return b;
    var exp = log10(b) - sqrt(log10(score / kg) / a);
    return pow(10, exp);
  };
}
