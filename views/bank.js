const { v4 } = require("uuid");

class Bank {
  constructor(fullName, abbreviation) {
    this.id = v4();
    this.fullName = fullName;
    this.abbreviation = abbreviation;
  }
}

module.exports = Bank;
