
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


export function sinclair_coeff_a_and_b(sex: Sex){
    if(sex == Sex.Male)
        return [A_MALE, B_MALE];
    return [A_FEMALE, B_FEMALE];
}


/**
 * 10^(a*X^2) where X is log10(body_weight/b)
* */
export function sinclair_coeff(a, b, body_weight){
    if(body_weight > b) return 1.0;
    const exp = a*pow(log10(body_weight/b),2);
    return pow(10, exp);
}

export function sinclair_coeff_sex(real: Sex, projected: Sex): number{
    if(real === Sex.Female && projected === Sex.Male)
        return FEMALE_TO_MALE;
    if(real === Sex.Male && projected === Sex.Female)
        return 1/FEMALE_TO_MALE;
    return 1;
}

export function sinclair_coeff_age(age: number): number{
    if(age < 30) age = 30;
    if(age > 90) age = 90;
    age -= 30;

    const table = [
        1.000, 1.016, 1.031, 1.046, 1.059, 1.072, 1.083,
        1.096, 1.109, 1.122, 1.135, 1.149, 1.162, 1.176,
        1.189, 1.203, 1.218, 1.233, 1.248, 1.263, 1.279,
        1.297, 1.316, 1.338, 1.361, 1.385, 1.411, 1.437,
        1.462, 1.488, 1.514, 1.541, 1.568, 1.598, 1.629,
        1.663, 1.699, 1.738, 1.779, 1.823, 1.867, 1.910,
        1.953, 2.004, 2.060, 2.117, 2.181, 2.255, 2.336,
        2.419, 2.504, 2.597, 2.702, 2.831, 2.981, 3.153,
        3.352, 3.58, 3.843, 4.145, 4.493];
    return table[age];
}

export function sinclair_coeff_by_sex(sex: Sex, body_weight: number){
    const [a, b] = sinclair_coeff_a_and_b(sex);
    return sinclair_coeff(a, b, body_weight);
}

export function sinclair_coeff_extended(
    real_sex: Sex, projected_sex: Sex, bw: number, age: number = 0): number{
        const coeff_sex = sinclair_coeff_sex(real_sex, projected_sex);
        const coeff_age = sinclair_coeff_age(age);
        const coeff_strd = sinclair_coeff_by_sex(real_sex, bw);
        return coeff_sex*coeff_age*coeff_strd;
}

/**
 * (body_weight, kg) -> sinclair_score
* */
export function sinclair_score(sex: Sex){
    return function(body_weight, kg){
        return sinclair_coeff_by_sex(sex, body_weight)*kg;
    }
}

export function sinclair_score_extended(real_sex: Sex, projected_sex: Sex, age: number = 0){
    return function(bw, kg){
        return sinclair_coeff_extended(real_sex, projected_sex, bw, age)*kg;
    }
}

/**
 * (body_weight, sinclair_score) -> kg
* */
export function sinclair_kg(sex: Sex){
    return function(body_weight, score){
        let [a, b] = sinclair_coeff_a_and_b(sex);
        return score / sinclair_coeff(a, b, body_weight);
    }
}

export function sinclair_kg_extended(real_sex: Sex, projected_sex: Sex, age: number = 0){
    return function(bw, score){
        return score / sinclair_coeff_extended(real_sex, projected_sex, bw, age);
    }
}

/**
 * (kg, sinclair_score) -> body_weight
* */
export function sinclair_bw(sex: Sex){
    return function(kg, score){
        let [a, b] = sinclair_coeff_a_and_b(sex);
        const tolerance = 0.01;
        if(kg >= score-tolerance) return b;

        let exp = log10(b) - sqrt(log10(score/kg)/a);
        return pow(10,exp);
    }
}

export function sinclair_bw_extended(real_sex: Sex, projected_sex: Sex, age: number = 0){
    return function(kg, score){
        let [a, b] = sinclair_coeff_a_and_b(real_sex);
        const tolerance = 0.01;
        if(kg >= score-tolerance) return b;
        const coeff_sex = sinclair_coeff_sex(real_sex, projected_sex);
        const coeff_age = sinclair_coeff_age(age);
        let exp = log10(b) - sqrt(log10(score/(kg*coeff_sex*coeff_age))/a);
    }
}

