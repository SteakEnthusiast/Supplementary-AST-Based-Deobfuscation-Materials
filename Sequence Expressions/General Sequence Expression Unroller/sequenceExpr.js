function sequenceTest(a, b, c, d, z) {
  // assignment expressions
  (a = 1), (b = 2), (c = 3), (d = 4);

  // Variable decs

  var x = (console.log("hi"), (z = 13), 69);

  // Assignment expressions:
  // Can execute functions and assign other variables before assignment
  z = (executeAFunction(), (x = 13), d);

  // General stuff
  var e, f;
  (e = 5), c ? (f = 12) : (f = 13), f && console.log("world");

  // Return statements

  return (x = 1), (a = 5), x + a;
}
