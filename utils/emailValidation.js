const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateEmail  =(email) => {
  return re.test(email);
}

console.log(validateEmail("example@email.com"));  // true
console.log(validateEmail("invalid.email"));  // false

module.exports = { validateEmail }
