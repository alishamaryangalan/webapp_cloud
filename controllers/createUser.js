const { passwordBCryptHash } = require("../utils/password")
const { validateEmail } = require("../utils/emailValidation")
const db = require("../models")
const User = db.users

const createUser = async (request, response) => {
    const fields = ["firstname", "lastname", "username", "password", "account_created", "account_updated"]
    //return an array of the property names of the request.body object 
    // The request.body object typically contains data that has been sent from a client-side application, 
    //such as a web browser, to a server-side application, such as a server written in Node.js. 
    //The Object.keys() method is used to extract the property names of the object and return them as an array.
    const requestKey = request.body ? Object.keys(request.body) : null;
    if (!requestKey || !requestKey.length) {
        console.log(request.body.firstname);
        return response.status(400).json("Input is not valid");
    }
    let checkValExists = true;
    requestKey.forEach(val => {
        if (fields.indexOf(val) < 0) {
            checkValExists = false;
        }
    })

    if (!checkValExists) {
        return response.status(400).json("Please enter only the firstname, lastname, username and password!");
    }

    const {
        firstname,
        lastname,
        username,
        password
    } = request.body;

    if (!firstname || !lastname || !username || !password  
        || password.length < 8 
        || !firstname.length || !lastname.length) {
        return response.status(400).json("Input data is invalid! Please check again!");
    }

    const emailValidityCheck = validateEmail(username)

    if(!emailValidityCheck) {
        return response.status(400).json("Enter a valid email ID!")
    }

    const emailExists = await User.findOne({ where: {username: request.body.username} });
    if ( emailExists ) return response.status(400).json("Email is already registered!")
    
    passwordBCryptHash(password)
        .then((hashed) => {
            const newUser = {
                firstname: request.body.firstname,
                lastname: request.body.lastname,
                password: hashed,
                username: request.body.username,
                account_created: new Date().toISOString(),
                account_updated: new Date().toISOString()
            }
            User.create(newUser)
                .then(data => {
                    console.log(data)
                    return response.status(201).json("Your new user has been added successfully!")
                })
                .catch(error => {
                    console.log(error)
                    response.status(400).json("Error occured while creating the user")
                })     
})}
module.exports = createUser
