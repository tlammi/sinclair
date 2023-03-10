"use strict";
var _a;
exports.__esModule = true;
exports.sinclair_to_weight = exports.sinclair_to_result = exports.sinclair_score = exports.sinclair_coefficient = exports.COEFFICIENTS_BY_SEX = exports.Sex = exports.FEMALE_TO_MALE = exports.B_FEMALE = exports.A_FEMALE = exports.B_MALE = exports.A_MALE = void 0;
exports.A_MALE = 0.751945030;
exports.B_MALE = 175.508;
exports.A_FEMALE = 0.783497476;
exports.B_FEMALE = 153.655;
/**
 * Coefficient to convert female to male points
* */
exports.FEMALE_TO_MALE = 1.354;
var LOG10_BASE = Math.log(10);
var log10 = function (x) {
    return Math.log(x) / LOG10_BASE;
};
var sqrt = Math.sqrt;
var pow = Math.pow;
var Sex;
(function (Sex) {
    Sex[Sex["Male"] = 0] = "Male";
    Sex[Sex["Female"] = 1] = "Female";
})(Sex = exports.Sex || (exports.Sex = {}));
;
exports.COEFFICIENTS_BY_SEX = (_a = {},
    _a[Sex.Male] = [exports.A_MALE, exports.B_MALE],
    _a[Sex.Female] = [exports.A_FEMALE, exports.B_FEMALE],
    _a);
/**
 * 10^(a*X^2) where X is log10(body_weight/b)
* */
function sinclair_coefficient(a, b, body_weight) {
    if (body_weight > b)
        return 1.0;
    var exp = a * pow(log10(body_weight / b), 2);
    return pow(10, exp);
}
exports.sinclair_coefficient = sinclair_coefficient;
/**
 * (body_weight, kg) -> sinclair_score
* */
function sinclair_score(sex) {
    return function (body_weight, kg) {
        var a = exports.COEFFICIENTS_BY_SEX[sex][0];
        var b = exports.COEFFICIENTS_BY_SEX[sex][1];
        return sinclair_coefficient(a, b, body_weight) * kg;
    };
}
exports.sinclair_score = sinclair_score;
/**
 * (body_weight, sinclair_score) -> kg
* */
function sinclair_to_result(sex) {
    return function (body_weight, score) {
        var a = exports.COEFFICIENTS_BY_SEX[sex][0];
        var b = exports.COEFFICIENTS_BY_SEX[sex][1];
        return score / sinclair_coefficient(a, b, body_weight);
    };
}
exports.sinclair_to_result = sinclair_to_result;
/**
 * (kg, sinclair_score) -> body_weight
* */
function sinclair_to_weight(sex) {
    return function (kg, score) {
        var a = exports.COEFFICIENTS_BY_SEX[sex][0];
        var b = exports.COEFFICIENTS_BY_SEX[sex][1];
        var tolerance = 0.01;
        if (kg >= score - tolerance)
            return b;
        var exp = log10(b) - sqrt(log10(score / kg) / a);
        return pow(10, exp);
    };
}
exports.sinclair_to_weight = sinclair_to_weight;
