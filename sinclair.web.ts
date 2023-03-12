
import {sinclair_coeff} from "./sinclair";
import {el, mount} from './redom.es';

console.log(String(sinclair_coeff(1,2,100)));


const sinclair_score = document.getElementById("sinclair_score");
const sinclair_kg = document.getElementById("sinclair_kg");
const sinclair_bw = document.getElementById("sinclair_bw");

if(sinclair_score){
    let hello = el("h1", "Sinclair Score here");
    mount(sinclair_score, hello);
} else {
    console.log("sinclair_score not found");
}

if(sinclair_kg){
    let hello = el("h1", "Sinclair kg here");
    mount(sinclair_kg, hello);
} else {
    console.log("sinclair_kg not found");
}

if(sinclair_bw){
    let hello = el("h1", "Sinclair bw here");
    mount(sinclair_bw, hello);
} else {
    console.log("sinclair_bw not found");
}

