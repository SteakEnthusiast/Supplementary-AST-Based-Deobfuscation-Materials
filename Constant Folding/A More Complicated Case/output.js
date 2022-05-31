class Person {
  constructor(name, school, emoji) {
    this.name = name;
    this.school = school;
    this.favAnimal = emoji;
  }

  sayHello() {
    let helloStatement = "Hello, my name is " + this.name + ". I go to " + this.school + " and my favourite animal is a " + this.favAnimal;
    console.log(helloStatement);
  }

}