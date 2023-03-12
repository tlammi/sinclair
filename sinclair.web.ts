
import {sinclair_coeff, sinclair_coeff_by_sex, sinclair_score, Sex} from "./sinclair";
import {el, mount} from './redom.es';



function gen_id(prefix = ""){
    return prefix + Math.random().toString(16).slice(2);
}

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

function radio(group: String, option: String){
    const id = group + "-" + option;
    const rdio = el("input", {
        name: group,
        id: id,
        type: "radio",
        value: option,
    });
    const lbl = el("label", option, {
        for: id,
    });
    return [rdio, lbl];
}

function radio_group(group: String, onclick: (number) => void, ...options){
    let members = []
    let idx=0;
    function make_cb(i: number){
        return function(){
            onclick(i);
        };
    }
    options.forEach(function(opt){
        let [rdio, lbl] = radio(group, opt);
        rdio.addEventListener("click", make_cb(idx));
        members.push(rdio, lbl);
        ++idx;
    });
    return members;
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

const sinclair_score_obj = document.getElementById("sinclair_score");
const sinclair_kg_obj = document.getElementById("sinclair_kg");
const sinclair_bw_obj = document.getElementById("sinclair_bw");

if(sinclair_score_obj){
    let btn = button("Laske");
    let ipt_res = input("");
    let ipt_bw = input("");
    let coeff = el("p");
    let out = el("p");
    let sex: Sex = Sex.Male;

    const cb = function(event){
        if(event.type == "click" || (event.type == "keypress" && event.key == "Enter")){
            let res = Number(ipt_res.value);
            let bw = Number(ipt_bw.value);
            coeff.innerHTML = sinclair_coeff_by_sex(sex, bw);
            console.log(bw);
            console.log(res);
            let scre = sinclair_score(sex)(bw, res);
            console.log(scre);
            out.innerHTML = scre;
        }
    };

    btn.addEventListener("click", cb);
    ipt_res.addEventListener("keypress", cb);
    ipt_bw.addEventListener("keypress", cb);

    let rd_grp = radio_group("formula", function(value: number){ 
        if(value == 1) sex = Sex.Female;
        else sex = Sex.Male;
        console.log(value);},
                             "mies", "nainen", "nainen miesten pisteillä");

    let lines = [
        line("Laskentakaava:", rd_grp),
        line("Tulos:", ipt_res),
        line("Paino:", ipt_bw),
        line(btn),
        line("Sinclair-kerroin:", coeff),
        line("Pisteet:", out),
    ]
    let tbl = table(...lines);
    mount(sinclair_score_obj, tbl);
} else {
    console.log("sinclair_score_obj not found");
}

if(sinclair_kg_obj){
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
    mount(sinclair_kg_obj, tbl);
} else {
    console.log("sinclair_kg_obj not found");
}

if(sinclair_bw_obj){
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
    mount(sinclair_bw_obj, tbl);
} else {
    console.log("sinclair_bw_obj not found");
}

