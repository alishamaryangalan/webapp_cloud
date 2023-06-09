const { passwordBCryptHash } = require("../utils/password")
const { validateEmail } = require("../utils/emailValidation")
const db = require("../models")
const User = db.users
const {logger} = require("../config/logger.js")
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });

const createUser = async (request, response) => {
    const fields = ["first_name", "last_name", "username", "password", "account_created", "account_updated"]
    sdc.increment('Endpoint-POST_create-User');
    //return an array of the property names of the request.body object 
    // The request.body object typically contains data that has been sent from a client-side application, 
    //such as a web browser, to a server-side application, such as a server written in Node.js. 
    //The Object.keys() method is used to extract the property names of the object and return them as an array.
    const requestKey = request.body ? Object.keys(request.body) : null;
    if (!requestKey || !requestKey.length) {
        logger.info('Input is not valid')
        console.log(request.body.first_name);
        return response.status(400).json("Input is not valid");
    }
    let checkValExists = true;
    requestKey.forEach(val => {
        if (fields.indexOf(val) < 0) {
            checkValExists = false;
        }
    })

    if (!checkValExists) {
        logger.info('Firstname, lastname, username, password is not valid')
        return response.status(400).json("Please enter only the firstname, lastname, username and password!");
    }

    const {
        first_name,
        last_name,
        username,
        password
    } = request.body;

    if (!first_name || !last_name || !username || !password  
        || password.length < 8 
        || !first_name.length || !last_name.length) {
        logger.info('Input data is invalid!')
        return response.status(400).json("Input data is invalid! Please check again!");
    }

    const emailValidityCheck = validateEmail(username)

    if(!emailValidityCheck) {
        logger.info('Input data - email is invalid!')
        return response.status(400).json("Enter a valid email ID!")
    }

    const emailExists = await User.findOne({ where: {username: request.body.username} });
    if ( emailExists ) return response.status(400).json("Email is already registered!")
    
    passwordBCryptHash(password)
        .then((hashed) => {
            const newUser = {
                first_name: request.body.first_name,
                last_name: request.body.last_name,
                password: hashed,
                username: request.body.username,
                account_created: new Date().toISOString(),
                account_updated: new Date().toISOString()
            }
            User.create(newUser)
                .then(data => {
                    console.log(data)
                    delete data.dataValues.password
                    logger.info('Data has been deleted successfully')
                    return response.status(201).json(data)
                })
                .catch(error => {
                    console.log(error)
                    logger.info('Error occured while creating the user')
                    response.status(400).json("Error occured while creating the user")
                })     
})}
module.exports = createUser