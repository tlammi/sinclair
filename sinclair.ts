
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

export function sinclair_coeff_by_sex(sex: Sex, body_weight: number){
    const [a, b] = sinclair_coeff_a_and_b(sex);
    return sinclair_coeff(a, b, body_weight);
}

/**
 * (body_weight, kg) -> sinclair_score
* */
export function sinclair_score(sex: Sex){
    return function(body_weight, kg){
        return sinclair_coeff_by_sex(sex, body_weight)*kg;
    }
}

/**
 * (body_weight, sinclair_score) -> kg
* */
export function sinclair_kg(sex: Sex){
    return function(body_weight, score){
        let a, b = sinclair_coeff_a_and_b(sex);
        return score / sinclair_coeff(a, b, body_weight);
    }
}

/**
 * (kg, sinclair_score) -> body_weight
* */
export function sinclair_bw(sex: Sex){
    return function(kg, score){
        let a, b = sinclair_coeff_a_and_b(sex);
        const tolerance = 0.01;
        if(kg >= score-tolerance) return b;

        let exp = log10(b) - sqrt(log10(score/kg)/a);
        return pow(10,exp);
    }
}

