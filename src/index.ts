// License: Any of the licenses in https://github.com/tlammi/sinclair/tree/licenses
/**
 * Entrypoint and all HTML stuff
 */

import { app } from './app';
import { sinclair } from './sinclair';

import { el, mount } from 'redom';

/**
 * Generate an array row
 * */
function row(...elems: any) {
  let tds: any[] = [];
  elems.forEach(function(elem: any) {
    tds.push(el('td', elem));
  });
  return el('tr', ...tds);
}

/**
 * Generate a table
 * */
function table(...rows: any) {
  const tbody = el('tbody', ...rows);
  return el('table', tbody);
}

/**
 * Create a radio button
 * */
function radio(group: String, option: String) {
  const id = group + '-' + option;
  const rdio = el('input', {
    name: group,
    id: id,
    type: 'radio',
    value: option,
  });
  const lbl = el('label', option, {
    for: id,
  });
  return [rdio, lbl];
}

/**
 * Create a group of radio buttons for controlling a single state
 * */
function radio_group(
  group: String,
  onclick: (no: number) => void,
  ...options: any
) {
  let members: any = [];
  let idx = 0;
  function make_cb(i: number) {
    return function() {
      onclick(i);
    };
  }
  options.forEach(function(opt: any) {
    let [rdio, lbl] = radio(group, opt);
    rdio.addEventListener('click', make_cb(idx));
    members.push(rdio, lbl, el('br'));
    ++idx;
  });
  members[0].checked = true;
  return members;
}

type OnClick = (e: MouseEvent) => void;

/**
 * HTML button
 * */
function button(label: string, onclick: OnClick | null = null) {
  let btn = el('button', label);
  if (onclick) {
    btn.addEventListener('click', onclick);
  }
  return btn;
}

/**
 * HTML input field
 * */
function input(initial_value: string, readonly: boolean | null = null) {
  const ipt = el('input', {
    type: 'text',
    value: initial_value,
    readonly: readonly,
  });
  return ipt;
}

/**
 * Customization for a calculator HTML element
 *
 * The calculators have small differences, such as in wich order the elements
 * are listed and which fields act as inputs or ouputs.
 *
 * @param args: Arguments passed to calculator
 * @param calculator: Calculator function performing the calculation.
 *                    Can be passed e.g. to callbacks.
 * @return List of rows to insert to table: [input_row1, input_row2, output_row]
 * */
type Populator = (args: app.Args, calculator: app.App) => [any, any, any];

/**
 * Generic calculator element population
 * */
function populate_calculator(
  id: string,
  calculator: app.App,
  populator: Populator
): void {
  let root = document.getElementById(id);
  if (!root) {
    console.log(`Could not find element with id "${id}"`);
    return;
  }

  let args = new app.Args();
  let formula_line = row(
    'Laskentakaava:',
    radio_group(
      id + '-formula',
      function(value: number) {
        switch (value) {
          case 0:
            args.sex = sinclair.Sex.Male;
            args.sex_projected = sinclair.Sex.Male;
            break;
          case 1:
            args.sex = sinclair.Sex.Female;
            args.sex_projected = sinclair.Sex.Female;
            break;
          case 2:
            args.sex = sinclair.Sex.Female;
            args.sex_projected = sinclair.Sex.Male;
            break;
          default:
            console.warn('Unknown setting in formula radio: ' + value);
        }
        console.log('radio: ' + value);
      },
      'mies',
      'nainen',
      'nainen \u2192 mies *'
    )
  );

  let [in1, in2, out] = populator(args, calculator);

  let btn_line = row(
    button('Laske', () => {
      calculator(args);
    })
  );

  let coeff_o = input('', true);
  args.coeff = coeff_o;
  let coeff_line = row('Sinclair-kerroin:', coeff_o);
  let tbl = table(formula_line, in1, in2, btn_line, coeff_line, out);
  mount(root, tbl);
}

function populate_info(id: string) {
  let root = document.getElementById(id);
  if (!root) {
    console.log(`Could not find element with id "${id}"`);
    return;
  }
  let p = el('p', '* Muunnos naisten pisteistä miesten pisteiksi');
  mount(root, p);
}

function handle_keypress(args: app.Args, calculator: app.App) {
  return (e: any) => {
    if (e.key === 'Enter') calculator(args);
  };
}

function score_populator(args: app.Args, calculator: app.App): [any, any, any] {
  let w_i = input('');
  let bw_i = input('');
  let score_o = input('', true);
  w_i.addEventListener('keypress', handle_keypress(args, calculator));
  bw_i.addEventListener('keypress', handle_keypress(args, calculator));
  args.lifted_weight = w_i;
  args.body_weight = bw_i;
  args.score = score_o;
  return [row('Tulos:', w_i), row('Paino:', bw_i), row('Pisteet:', score_o)];
}

populate_calculator(
  'sinclair_score',
  app.extended_sinclair_score,
  score_populator
);

function populate_lw(args: app.Args, calculator: app.App): [any, any, any] {
  let s_i = input('');
  let bw_i = input('');
  let w_o = input('', true);
  s_i.addEventListener('keypress', handle_keypress(args, calculator));
  bw_i.addEventListener('keypress', handle_keypress(args, calculator));
  args.score = s_i;
  args.body_weight = bw_i;
  args.lifted_weight = w_o;
  return [row('Pisteet:', s_i), row('Paino:', bw_i), row('Tulos:', w_o)];
}

populate_calculator(
  'sinclair_weight',
  app.extended_sinclair_lifted_weight,
  populate_lw
);

function populate_bw(args: app.Args, calculator: app.App): [any, any, any] {
  let s_i = input('');
  let w_i = input('');
  let bw_o = input('', true);
  s_i.addEventListener('keypress', handle_keypress(args, calculator));
  w_i.addEventListener('keypress', handle_keypress(args, calculator));
  args.score = s_i;
  args.lifted_weight = w_i;
  args.body_weight = bw_o;
  return [row('Pisteet:', s_i), row('Tulos', w_i), row('Paino:', bw_o)];
}

populate_calculator(
  'sinclair_bw',
  app.extended_sinclair_body_weight,
  populate_bw
);

populate_info('sinclair_info');
