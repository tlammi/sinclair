
//import {sinclair_coeff} from "./sinclair";
import {el, mount} from './redom.es';

function line(...elems){
    let tds = [];
    elems.forEach(function(elem){
        tds.push(el("td", elem));
    });
    return el("tr", ...tds);
}

function table(...rows){
    const tbody = el("tbody", ...rows);
    return el("table", tbody);
}

function button(label){
    const btn = el("button", label);
    return btn;
}

const sinclair_score = document.getElementById("sinclair_score");
const sinclair_kg = document.getElementById("sinclair_kg");
const sinclair_bw = document.getElementById("sinclair_bw");

if(sinclair_score){
    let btn = button("Laske");
    btn.addEventListener("click", function(){console.log("clicked");});
    let lines = [
        line("Laskentakaava:", el("p", "laskentakaava tänne")),
        line("Tulos:", el("p", "tulos-kenttä")),
        line("Paino:", el("p", "paino...")),
        line(btn),
        line("Sinclair-kerroin:", el("p", "kerroin tänne")),
        line("Pisteet:", el("p", "pisteet tänne")),
    ]
    let tbl = table(...lines);
    mount(sinclair_score, tbl);
} else {
    console.log("sinclair_score not found");
}

if(sinclair_kg){
    let btn = button("Laske");
    btn.addEventListener("click", function(){console.log("click2");});
    let lines = [
        line("Laskentakaava:", el("p", "laskentakaava tänne")),
        line("Pisteet:", el("p", "piste-kenttä")),
        line("Paino:", el("p", "paino...")),
        line(btn),
        line("Sinclair-kerroin:", el("p", "kerroin tänne")),
        line("Tulos:", el("p", "tulos tänne")),
    ]
    let tbl = table(...lines);
    mount(sinclair_score, tbl);
} else {
    console.log("sinclair_kg not found");
}

if(sinclair_bw){
    let btn = button("Laske");
    btn.addEventListener("click", function(){console.log("click3");});
    let lines = [
        line("Laskentakaava:", el("p", "laskentakaava tänne")),
        line("Pisteet:", el("p", "piste-kenttä")),
        line("Tulos:", el("p", "tulos...")),
        line(btn),
        line("Sinclair-kerroin:", el("p", "kerroin tänne")),
        line("Paino:", el("p", "nostajan paino tänne")),
    ]
    let tbl = table(...lines);
    mount(sinclair_score, tbl);
} else {
    console.log("sinclair_bw not found");
}

