
import {sinclair_coeff} from "./sinclair";
import {el, mount} from './redom.es';

console.log(String(sinclair_coeff(1,2,100)));

const hello = el("h1", "hello, world");
mount(document.body, hello);
