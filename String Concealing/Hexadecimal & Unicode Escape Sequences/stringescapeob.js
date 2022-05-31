class Person {
  constructor(name, school, emoji) {
    this.name = name;
    this.school = school;
    this.favEmoji = emoji;
  }
  sayHello() {
    let helloStatement =
      "\x48\x65\x6c\x6c\x6f\x2c\x20\x6d\x79\x20\x6e\x61\x6d\x65\x20\x69\x73\x20" + // Hexadecimal Encoding
      this["\x6e\x61\x6d\x65"] + // Hexadecimal Encoding of Property
      "\u002e\u0020\u0049\u0020\u0067\u006f\u0020\u0074\u006f\u0020" + // Unicode Encoding
      this["\u0073\u0063\u0068\u006f\u006f\u006c"] + // Unicode Encoding of Property
      "\x20\x61\x6e\x64\x20\x6d\x79\x20\x66\x61\x76\x6f\x75\x72\x69\x74\x65\u0020\u0065\u006d\u006f\u006a\u0069\u0020\u0069\u0073\u0020" + // Hexadecimal and Unicode Encoding
      this["\x66\x61\x76\u0045\u006d\u006f\u006a\u0069"]; // Hexadecimal and Unicode Encoding of property
    console.log(helloStatement);
  }
}

const examplePerson = new Person(
  "\u0044\u0061\u0076\u0069\u0064", // Unicode Escape Sequence */
  "\x55\x6e\x69\x76\x65\x72\x73\x69\x74\x79\x20\x6f\x66\x20\x4f\x62\x66\x75\x73\x63\x61\x74\x69\x6f\x6e", // Hexadecimal Escape Sequence
  "\uD83E\uDD2A" // Curly Bracket Unicode Escape Sequence
);

examplePerson.sayHello();
