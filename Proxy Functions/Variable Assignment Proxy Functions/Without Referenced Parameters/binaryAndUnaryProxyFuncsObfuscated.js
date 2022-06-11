var a, b, c, d;
function assignmentProxy() {
  a = 1;
  b = 2;
  c = 3;
  d = 4;
}

function main() {
  // ... some code ... //

  // Expression assignment

  assignmentProxy();

  if (a == 1 && b == 2 && c == 3 && d == 4) return true;
}

console.log(main());
