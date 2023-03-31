// License: Any of the licenses in https://github.com/tlammi/sinclair/tree/licenses
/**
 * Implementations which read and write HTML elements
 * */
import { sinclair } from './sinclair';

export namespace app {

  // Decimal separator
  enum DecSep{
      None,
      Comma,
      Dot,
  };
  /**
   * Decide, based on multiple values, if the output should use comma or dot
   */
  function use_comma(... seps: DecSep[]): boolean {
      for(let sep of seps){
        if(sep === DecSep.Comma) return true;
        else if(sep === DecSep.Dot) return false;
      }
      return false;
  }
  /// Output precision
  const DECIMAL_DIGITS = 3;

  export interface Valued {
    value: string;
  }

  /// Valued type used for testing or for discarding values
  export class Null {
    value: string = '';
  }

  /**
   * Arguments passed to the application
   *
   * These act as both inputs and outputs for the
   * application depending on the performed calculation
   */
  export class Args {
    // Lifted weight in kg
    lifted_weight: Valued = new Null();
    // Lifter's body weight in kg
    body_weight: Valued = new Null();
    // Acts as an output where the calculated Sinclair coefficient is placed in
    coeff: Valued = new Null();
    // Sinclair score
    score: Valued = new Null();
    // Sex of the lifter
    sex = sinclair.Sex.Male;
    // "projected sex" for the lifter. This can be used to convert
    // male points to female points or other way around
    sex_projected = sinclair.Sex.Male;
    // Lifter age in years. Used for age coefficients.
    // This has effect only after 30.
    age: number = 0;
  }

  class ParsedArgs {
    a = 0;
    b = 0;
    coeff_sex = 0;
    coeff_age = 0;
  }

  function parse_args(args: Args) {
    let out = new ParsedArgs();
    out.a = sinclair.coeff_a(args.sex);
    out.b = sinclair.coeff_b(args.sex);
    out.coeff_sex = sinclair.coeff_sex(args.sex, args.sex_projected);
    out.coeff_age = sinclair.coeff_age(args.age);
    return out;
  }

  /**
   * convert string to (number, separator)
   *
   * "1.0" -> (1.0, false)
   * "10,2" -> (10.2, true)
   */
  function to_number(input: Valued): [number, DecSep] {
    let has_comma = input.value.indexOf(',') !== -1;
    let has_dot = input.value.indexOf('.') !== -1;
    let val = input.value.replace(',', '.');
    let sep = DecSep.None;
    if(has_comma) sep = DecSep.Comma;
    else if(has_dot) sep = DecSep.Dot;
    return [Number(val), sep];
  }

  function to_string(input: number, comma: boolean): string {
    let str = input.toFixed(DECIMAL_DIGITS);
    if (comma) {
      return str.replace('.', ',');
    }
    return str;
  }

  export function extended_sinclair_score(args: Args): void {
    let [lw, sep_lw] = to_number(args.lifted_weight);
    let [bw, sep_bw] = to_number(args.body_weight);
    let comma = use_comma(sep_lw, sep_bw);

    const parsed = parse_args(args);
    let score = sinclair.score_extended(
      parsed.a,
      parsed.b,
      parsed.coeff_sex,
      parsed.coeff_age,
      bw,
      lw
    );

    const coeff = sinclair.coeff_extended(
      parsed.a,
      parsed.b,
      parsed.coeff_sex,
      parsed.coeff_age,
      bw
    );
    args.coeff.value = to_string(coeff, comma);
    args.score.value = to_string(score, comma);
  }

  export function extended_sinclair_lifted_weight(args: Args): void {
    let [score, sep_sc] = to_number(args.score);
    let [bw, sep_bw] = to_number(args.body_weight);
    let comma = use_comma(sep_sc, sep_bw);
    const parsed = parse_args(args);
    let weight = sinclair.weight_extended(
      parsed.a,
      parsed.b,
      parsed.coeff_sex,
      parsed.coeff_age,
      bw,
      score
    );
    const coeff = sinclair.coeff_extended(
      parsed.a,
      parsed.b,
      parsed.coeff_sex,
      parsed.coeff_age,
      bw
    );
    args.coeff.value = to_string(coeff, comma);
    args.lifted_weight.value = to_string(weight, comma);
  }

  export function extended_sinclair_body_weight(args: Args): void {
    const [lw, sep_lw] = to_number(args.lifted_weight);
    const [sc, sep_sc] = to_number(args.score);
    const comma = use_comma(sep_lw, sep_sc);

    const parsed = parse_args(args);
    const bw = sinclair.body_weight_extended(
      parsed.a,
      parsed.b,
      parsed.coeff_sex,
      parsed.coeff_age,
      lw,
      sc
    );

    const coeff = sinclair.coeff_extended(
      parsed.a,
      parsed.b,
      parsed.coeff_sex,
      parsed.coeff_age,
      bw
    );
    args.coeff.value = to_string(coeff, comma);
    args.body_weight.value = to_string(bw, comma);
  }

  export type App = (args: Args) => void;
}
