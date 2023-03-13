import * as sl from './sinclair'


// Not a good solution but I'm lazy
const TOLERANCE = 0.01;

function assert_almost_eq(left, right, what="") {
    if(isNaN(left) || isNaN(right)){
        let msg = "got NaN: " + left + ", " + right;
        throw new Error(msg);
    }
    if(Math.abs(left - right) > TOLERANCE){
        let msg = what + ": not equal: " + left + " vs " + right;
        throw new Error(msg);
    }
}

function assert_ge(left, right, what=""){
    if(left < right){
        let msg = what + " left was smaller than right: " + left + " vs " + right;
        throw new Error(msg);
    }
}

try{
    assert_almost_eq(sl.sinclair_coeff(1,2,3),1);
    assert_almost_eq(
        sl.sinclair_coeff(
            sl.A_MALE, sl.B_MALE, 100), 1.1088602597205108);
    assert_almost_eq(
        sl.sinclair_coeff(
            sl.A_FEMALE, sl.B_FEMALE, 100), 1.0647936529571);
} catch(e){
    console.log(e);
    throw e;
}


// sex, body weight, kg, score
const TEST_SUITE = [
    [sl.Sex.Male, 70.0, 100.0, 131.7740115375109],
    [sl.Sex.Male, 80.0, 100.0, 122.33284377549734],
    [sl.Sex.Male, 90.0, 100.0, 115.68107293517174],
    [sl.Sex.Male, 100.0, 100.0, 110.88602597205109],
    [sl.Sex.Male, 300.0, 100.0, 100],
    [sl.Sex.Female, 40, 200, 370.4180088912498],
    [sl.Sex.Female, 75, 40, 47.65159086671826],
    [sl.Sex.Female, 250, 40, 40],
];

try{
    for(var data of TEST_SUITE){
        let [sex, bw, result, score] = data;
        let [_, b] = sl.sinclair_coeff_a_and_b(sex);
        assert_almost_eq(sl.sinclair_score(sex)(bw, result), score, "Sinclair Score");
        assert_almost_eq(sl.sinclair_kg(sex)(bw, score), result, "Sinclair To Result");

        // extended funcs
        assert_almost_eq(
            sl.sinclair_score(sex)(bw, result),
            sl.sinclair_score_extended(sex, sex, 0)(bw, result),
            "Extended sinclair score");
        assert_almost_eq(
            sl.sinclair_kg(sex)(bw, score),
            sl.sinclair_kg_extended(sex, sex, 0)(bw, score),
            "Extended sinclair to result");

        assert_almost_eq(
            sl.sinclair_bw(sex)(result, score),
            sl.sinclair_bw_extended(sex, sex, 0)(result, score),
            "Extended sinclair to bodyweight");
        // If bw is higher than WR holder the bw is set to that.
        bw = Math.min(bw, b);
        assert_almost_eq(sl.sinclair_bw(sex)(result, score), bw, "Sinclair To Body Weight");



    }
} catch(e){
    console.log(e);
    throw e;
}

assert_almost_eq(1, sl.sinclair_coeff_age(1));
assert_almost_eq(1, sl.sinclair_coeff_age(20));
assert_almost_eq(sl.sinclair_coeff_age(1), sl.sinclair_coeff_age(2));
assert_almost_eq(sl.sinclair_coeff_age(101), sl.sinclair_coeff_age(102));

let prev = 0;
for(let i = 25; i < 120; ++i){
    let cur = sl.sinclair_coeff_age(i);
    assert_ge(cur, prev);
    prev = cur;
}


console.log("Tests passed!!");

