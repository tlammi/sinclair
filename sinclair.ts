
export const A_MALE = 0.751945030;
export const B_MALE = 175.508;

export const A_FEMALE = 0.783497476;
export const B_FEMALE = 153.655;


/**
 * Coefficient to convert female to male points
* */
export const FEMALE_TO_MALE = 1.354;


const LOG10_BASE = Math.log(10);
const log10 = function(x){
    return Math.log(x) / LOG10_BASE;
}
const sqrt = Math.sqrt;
const pow = Math.pow;

export enum Sex{
    Male,
    Female
};

const COEFFICIENTS_BY_SEX = {
    [Sex.Male]: [A_MALE, B_MALE],
    [Sex.Female]: [A_FEMALE, B_FEMALE]
};


/**
 * 10^(a*X^2) where X is log10(body_weight/b)
* */
export function sinclair_coefficient(a, b, body_weight){
    if(body_weight > b) return 1.0;
    const exp = a*pow(log10(body_weight/b),2);
    return pow(10, exp);
}

/**
 * (body_weight, kg) -> sinclair_score
* */
export function sinclair_score(sex: Sex){
    return function(body_weight, kg){
        let a = COEFFICIENTS_BY_SEX[sex][0];
        let b = COEFFICIENTS_BY_SEX[sex][1];
        return sinclair_coefficient(a, b, body_weight)*kg;
    }
}

/**
 * (body_weight, sinclair_score) -> kg
* */
export function sinclair_to_result(sex: Sex){
    return function(body_weight, score){
        let a = COEFFICIENTS_BY_SEX[sex][0];
        let b = COEFFICIENTS_BY_SEX[sex][1];
        return score / sinclair_coefficient(a, b, body_weight);
    }
}

/**
 * (kg, sinclair_score) -> body_weight
* */
export function sinclair_to_weight(sex: Sex){
    return function(kg, score){
        let a = COEFFICIENTS_BY_SEX[sex][0];
        let b = COEFFICIENTS_BY_SEX[sex][1];
        let exp = sqrt(score/(a*kg));
        return b*pow(10, exp);
    }
}

