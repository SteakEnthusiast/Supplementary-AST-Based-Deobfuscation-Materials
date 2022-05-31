class Person {
  constructor(name, school, animal) {
    this["name"] = name;
    this["school"] = school;
    this["favAnimal"] = animal;
  }

  sayHello() {
    let helloStatement = "Hello, my name is " + this["name"] + ". I go to " + this["school"] + " and my favourite animal is a " + this["favAnimal"];
    console["log"](helloStatement);
  }

}

const examplePerson = new Person("David", "University of Obfuscation", "Penguin");
examplePerson["sayHello"]();