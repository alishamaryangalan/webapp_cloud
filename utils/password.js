const bcrypt = require('bcrypt');

const passwordBCryptHash = async (password) => {
  try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
  } 
  catch (error) {
      console.log(error)
  }
}
const comparePassword = async (hashed, password) => {
  return await bcrypt.compare(password, hashed);
}

module.exports = {
  passwordBCryptHash,
  comparePassword
}
