function z(f, g) {
  return f + g + 5;
}

function y(a, b, d, e) {
  return z(a, e);
}

var x = function (a, c, d, e) {
  return y(d - 1, !a, c, e + 3);
};

function w(b, c, d, e) {
  return x(b + 2, c + 7, d - 20, e);
}

const proxyResult = w(1, 4, 3, 2); // -8
