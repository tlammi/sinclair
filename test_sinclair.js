"use strict";
exports.__esModule = true;
var sl = require("./sinclair");
// Not a good solution but I'm lazy
var TOLERANCE = 0.01;
function assert_almost_eq(left, right, what) {
    if (what === void 0) { what = ""; }
    if (Math.abs(left - right) > TOLERANCE) {
        var msg = what + ": not equal: " + left + " vs " + right;
        throw new Error(msg);
    }
}
try {
    assert_almost_eq(sl.sinclair_coefficient(1, 2, 3), 1);
    assert_almost_eq(sl.sinclair_coefficient(sl.A_MALE, sl.B_MALE, 100), 1.1088602597205108);
    assert_almost_eq(sl.sinclair_coefficient(sl.A_FEMALE, sl.B_FEMALE, 100), 1.0647936529571);
}
catch (e) {
    console.log(e);
    throw e;
}
// sex, body weight, kg, score
var TEST_SUITE = [
    [sl.Sex.Male, 70.0, 100.0, 131.7740115375109],
    [sl.Sex.Male, 80.0, 100.0, 122.33284377549734],
    [sl.Sex.Male, 90.0, 100.0, 115.68107293517174],
    [sl.Sex.Male, 100.0, 100.0, 110.88602597205109],
    [sl.Sex.Male, 300.0, 100.0, 100],
    [sl.Sex.Female, 40, 200, 370.4180088912498],
    [sl.Sex.Female, 75, 40, 47.65159086671826],
    [sl.Sex.Female, 250, 40, 40],
];
try {
    for (var _i = 0, TEST_SUITE_1 = TEST_SUITE; _i < TEST_SUITE_1.length; _i++) {
        var data = TEST_SUITE_1[_i];
        var sex = data[0], bw = data[1], result = data[2], score = data[3];
        assert_almost_eq(sl.sinclair_score(sex)(bw, result), score, "Sinclair Score");
        assert_almost_eq(sl.sinclair_to_result(sex)(bw, score), result, "Sinclair To Result");
        // TODO: Fix
        //assert_almost_eq(sl.sinclair_to_weight(sex)(result, score), bw, "Sinclair To Body Weight");
    }
}
catch (e) {
    console.log(e);
    throw e;
}
console.log("Tests passed!!");
