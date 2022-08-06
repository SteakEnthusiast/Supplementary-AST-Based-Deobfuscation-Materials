function CantBeRemoved(a, b) {
  return a + b + 20;
}

let a = 12 + 45;
let b = 931 - 32;
let c = 12 * 12;
let d = 12 / 6;
let e = 91 % 30;
let f = 87 ^ 13;
let g = 363 << 1653523;
let h = 123653 >> 36123;
let i = 57 & 32;
let j = 32 | 36;
let k = !0;
let l = +"12";
let m = 1 + !0;
let z = !362 - 545 * 132 / 1435 ^ 132;

if (CantBeRemoved) {
  CantBeRemoved.toString();
  1 + 3 + 20;
}

console.log(a, b, c, d, e, f, g, h, i, j, k, l, m, z);