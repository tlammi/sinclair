
import {sinclair_coeff, sinclair_coeff_by_sex, sinclair_bw, Sex} from "./sinclair";
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
        members.push(rdio, lbl, el("br"));
        ++idx;
    });
    members[0].checked = true;
    return members;
}

function button(label, onclick = null){
    let btn = el("button", label);
    if(onclick){
        btn.addEventListener("click", onclick);
    }
    return btn;
}

function input(initial_value){
    const ipt = el("input", {
        type: "text",
        value: initial_value,
    });
    return ipt;
}

function to_number(val: string | number): number {
    if(typeof val === 'number'){
        return val;
    }
    return Number(val.replace(",", "."))
}

/**
 * Calculate outputs.
 *
 * Returns (sinclair coefficient, output value)
 * */
type OutputFn = (sex: Sex, input1: number, input2: number) =>[number, number];

/**
 * Populate a sinclair calculator section
 *
 * @param {section_id} HTML id to populate
 * @param {input1} Name of the 1st input field
 * @param {input2} Name of the 2nd input field
 * @param {output} Name of the output field
* */
function populate_section(
    section_id: string, input1: string, input2: string, output: string,
    output_fn: OutputFn): void {
    const obj = document.getElementById(section_id);
    if(!obj){
        console.log("Could not find " + section_id);
        return;
    }
    let ipt_1 = input("");
    let ipt_2 = input("");
    let coeff = el("p");
    let out = el("p");
    let sex = Sex.Male;

    const populate_result_fields = function(){
        let val_1 = to_number(ipt_1.value);
        let val_2 = to_number(ipt_2.value);
        let [coeff_val, out_val] = output_fn(sex, val_1, val_2);
        coeff.innerHTML = coeff_val;
        out.innerHTML = out_val;
    }

    const cb = function(e){
        if(e.type == "click" || (e.type == "keypress" && e.key == "Enter")){
            populate_result_fields();
        }
    }
    let btn = button("Laske", cb);
    ipt_1.addEventListener("keypress", cb);
    ipt_2.addEventListener("keypress", cb);

    let rd_grp = radio_group(section_id + "-formula", function(value: number){ 
        if(value == 1) sex = Sex.Female;
        else sex = Sex.Male;
        console.log(value);},
        "mies", "nainen", "nainen \u2192 mies *");

    let lines = [
        line("Laskentakaava:", rd_grp),
        line(input1, ipt_1),
        line(input2, ipt_2),
        line(btn),
        line("Sinclair-kerroin: ", coeff),
        line(output, out),
    ];

    let tbl = table(...lines);
    mount(obj, tbl);
}

const out_fn_score = function(sex: Sex, kg: number, bw: number): [number, number] {
    let coeff = sinclair_coeff_by_sex(sex, bw);
    let score = coeff*kg;
    return [coeff, score];
};
populate_section("sinclair_score", "Tulos:", "Paino:", "Pisteet:", out_fn_score);


const out_fn_kg = function(sex: Sex, score: number, bw: number): [number, number] {
    let coeff = sinclair_coeff_by_sex(sex, bw);
    let kg = score/coeff;
    return [coeff, kg];
}

populate_section("sinclair_kg", "Pisteet:", "Paino:", "Tulos:", out_fn_kg);


const out_fn_bw = function(sex: Sex, score: number, kg: number): [number, number] {
    let bw = sinclair_bw(sex)(kg, score);
    let coeff = sinclair_coeff_by_sex(sex, bw);
    return [coeff, bw];
}

populate_section("sinclair_bw", "Pisteet:", "Tulos:", "Paino:", out_fn_bw);

