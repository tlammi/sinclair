
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

const sinclair_score = document.getElementById("sinclair_score");
const sinclair_kg = document.getElementById("sinclair_kg");
const sinclair_bw = document.getElementById("sinclair_bw");

if(sinclair_score){
    let lines = [
        line("Laskentakaava:", el("p", "laskentakaava tänne")),
        line("Tulos:", el("p", "tulos-kenttä")),
        line("Paino:", el("p", "paino...")),
        line(el("button", "Laske")),
        line("Sinclair-kerroin:", el("p", "kerroin tänne")),
        line("Pisteet:", el("p", "pisteet tänne")),
    ]
    let tbl = table(...lines);
    mount(sinclair_score, tbl);
} else {
    console.log("sinclair_score not found");
}

if(sinclair_kg){
    let lines = [
        line("Laskentakaava:", el("p", "laskentakaava tänne")),
        line("Pisteet:", el("p", "piste-kenttä")),
        line("Paino:", el("p", "paino...")),
        line(el("button", "Laske")),
        line("Sinclair-kerroin:", el("p", "kerroin tänne")),
        line("Tulos:", el("p", "tulos tänne")),
    ]
    let tbl = table(...lines);
    mount(sinclair_score, tbl);
} else {
    console.log("sinclair_kg not found");
}

if(sinclair_bw){
    let lines = [
        line("Laskentakaava:", el("p", "laskentakaava tänne")),
        line("Pisteet:", el("p", "piste-kenttä")),
        line("Tulos:", el("p", "tulos...")),
        line(el("button", "Laske")),
        line("Sinclair-kerroin:", el("p", "kerroin tänne")),
        line("Paino:", el("p", "nostajan paino tänne")),
    ]
    let tbl = table(...lines);
    mount(sinclair_score, tbl);
} else {
    console.log("sinclair_bw not found");
}

