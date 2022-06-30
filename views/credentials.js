const bcrypt = require("bcrypt");

class Credentials {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    // this.password = this.hashPassword(password);
  }
  // }

  //
  async hashPassword() {
    // this.password = await bcrypt.hash(password, 10);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(this.password);
    return;
  }

  comparePassword = (password) => {
    let isValidPassword = bcrypt.compare(password, this.password);
    return isValidPassword;
  };
}

module.exports = Credentials;
