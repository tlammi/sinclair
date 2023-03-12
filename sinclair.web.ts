
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

function input(initial_value){
    const ipt = el("input", {
        type: "text",
        value: initial_value,
    });
    return ipt;
}

const sinclair_score = document.getElementById("sinclair_score");
const sinclair_kg = document.getElementById("sinclair_kg");
const sinclair_bw = document.getElementById("sinclair_bw");

if(sinclair_score){
    let btn = button("Laske");
    let ipt_res = input("");
    let ipt_bw = input("");
    let coeff = el("p");
    let out = el("p");

    const cb = function(event){
        if(event.type == "click" || (event.type == "keypress" && event.key == "Enter")){
            let res = Number(ipt_res.value);
            let bw = Number(ipt_bw.value);
            console.log("res: " + String(res*bw));
            coeff.innerHTML = "TBA";
            out.innerHTML = "res: " + String(res*bw);
        }
    };

    btn.addEventListener("click", cb);
    ipt_res.addEventListener("keypress", cb);
    ipt_bw.addEventListener("keypress", cb);

    let lines = [
        line("Laskentakaava:", el("p", "laskentakaava tänne")),
        line("Tulos:", ipt_res),
        line("Paino:", ipt_bw),
        line(btn),
        line("Sinclair-kerroin:", coeff),
        line("Pisteet:", out),
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

