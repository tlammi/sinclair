import { app } from '../src/app';

describe('sinclair score', () => {
  it('calculates male points', () => {
    let args = new app.Args();
    args.lifted_weight.value = '230.7';
    args.body_weight.value = '77.6';
    app.extended_sinclair_score(args);
    expect(Number(args.score.value)).toBe(286.754);
    expect(Number(args.coeff.value)).toBe(1.243);
  });
  it('calculates with commas', () => {
    let args = new app.Args();
    args.lifted_weight.value = '68,2';
    args.body_weight.value = '187,4';
    app.extended_sinclair_score(args);
    expect(args.score.value).toMatch(new RegExp('[0-9]+,[0-9]+'));
    expect(args.coeff.value).toMatch(new RegExp('[0-9]+,[0-9]+'));
  });
});

describe('sinclair lifted weight', () => {
  it('calculates male weight', () => {
    let args = new app.Args();
    args.score.value = '300';
    args.body_weight.value = '80.1';
    app.extended_sinclair_lifted_weight(args);
    expect(args.lifted_weight.value).toMatch('245.390');
    expect(args.coeff.value).toMatch('1.223');
  });
});

describe('sinclair body weight', () => {
  it('calculates male body weight', () => {
    let args = new app.Args();
    args.score.value = '300,5';
    args.lifted_weight.value = '270,3';
    app.extended_sinclair_body_weight(args);
    expect(args.body_weight.value).toBe('99,304');
    expect(args.coeff.value).toBe('1,112');
  });
});
