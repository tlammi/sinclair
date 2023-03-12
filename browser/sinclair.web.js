import { sinclair_coeff } from "./sinclair";
import { el, mount } from './redom.es';
console.log(String(sinclair_coeff(1, 2, 100)));
var hello = el("h1", "hello, world");
mount(document.body, hello);
