class Person {
  constructor(name, school, emoji) {
    this.name = name;
    this.school = school;
    this.favEmoji = emoji;
  }
  sayHello() {
    let helloStatement =
      "Hello, my name is " +
      this.name +
      ". I go to " +
      this.school +
      " and my favourite emoji is " +
      this.favEmoji;
    console.log(helloStatement);
  }
}

const examplePerson = new Person("David", "University of Obfuscation", "🤪");

examplePerson.sayHello();
