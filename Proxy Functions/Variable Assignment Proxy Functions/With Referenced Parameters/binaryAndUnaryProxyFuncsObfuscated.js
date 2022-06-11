var a, b, c, d;
function assignmentProxyWithParam(z) {
  a = 14 + z;
  b = 2 * z;
  c = 33 - z;
  d = 421 / z;
}

function assignmentProxyNoParam() {
  a = 1;
  b = 2;
  c = 3;
  d = 4;
}

function main() {
  // ... some code ... //

  // Expression assignment

  assignmentProxyNoParam(2);
  console.log(a, b, c, d);
  /// ... some code ... //

  assignmentProxyWithParam(3);
  console.log(a, b, c, d);
}

console.log(main());
