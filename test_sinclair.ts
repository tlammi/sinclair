import * as sinclair from './sinclair'


// Not a good solution but I'm lazy
const TOLERANCE = 0.01;

function assert_almost_eq(left, right, what="") {
    if(Math.abs(left - right) > TOLERANCE){
        let msg = what + ": not equal: " + left + " vs " + right;
        throw new Error(msg);
    }
}

try{
    assert_almost_eq(sinclair.sinclair_coefficient(1,2,3),1);
    assert_almost_eq(
        sinclair.sinclair_coefficient(sinclair.A_MEN, sinclair.B_MEN, 100), 1.1088602597205108);
    assert_almost_eq(
        sinclair.sinclair_coefficient(sinclair.A_WOMEN, sinclair.B_WOMEN, 100), 1.0647936529571);
} catch(e){
    console.log(e);
    throw e;
}

console.log("Tests passed!!");

