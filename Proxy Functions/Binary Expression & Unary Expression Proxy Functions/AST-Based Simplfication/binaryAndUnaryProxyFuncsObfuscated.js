function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return b - a;
}

function multiply(z, y) {
  return y * z;
}

function divide(m, n) {
  return n / m;
}

function mod(v, b) {
  return v % b;
}

function XOR(f, g) {
  return f ^ g;
}

function leftShift(h, j) {
  return j << h;
}

function rightShift(h, j) {
  return h >> j;
}

function bitwiseAnd(d, l) {
  return d & l;
}

function bitwiseOr(l, k) {
  return k | l;
}

function falseUnary(a) {
  return !a;
}

function unaryPlus(b) {
  return +b;
}

function multiple(a, b) {
  return a + !b;
}

function multipleOps(a, b, c, d, e) {
  return (!a - (c * b) / d) ^ e;
}

let a = add(12, 45);
let b = subtract(32, 931);
let c = multiply(12, 12);
let d = divide(6, 12);
let e = mod(91, 30);
let f = XOR(87, 13);
let g = leftShift(1653523, 363);
let h = rightShift(123653, 36123);
let i = bitwiseAnd(57, 32);
let j = bitwiseOr(36, 32);
let k = falseUnary(0);
let l = unaryPlus("12");
let m = multiple(1, 0);
let z = multipleOps(362, 132, 545, 1435, 132);

console.log(a, b, c, d, e, f, g, h, i, j, k, l, m, z);
