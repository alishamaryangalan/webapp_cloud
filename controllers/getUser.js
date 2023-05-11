const { comparePassword } = require("../utils/password")
const { basicAuth } = require("../utils/basicAuth")
const db = require("../models")
const User = db.users
const {logger} = require("../config/logger.js")
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });

const getUserById = (request, response) => {
    sdc.increment("Endpoint-GET_get-user");
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))
    if (!username || !password) {
        logger.info('Basic authorization has failed')
        return response.status(401)
        .json("Basic authorization has failed due to invalid username/password or User must select Basic Auth");
    }
    const userID = request.params.userID;

    User.findByPk(userID) 
        .then(result => {  
            if (userID==result.get("id") && result.get("username")==username) {
                const hashPassword = result.get('password');
                comparePassword(hashPassword, password)
                    .then(compareValue => {
                    if (compareValue) {
                        logger.info('Get user by ID')
                        const data = result;
                        delete data.dataValues.password
                        return response.status(200).json(data);
                    } 
                    else {
                        logger.info('Invalid password')
                        console.log("Something's wrong!")
                        return response.status(401).json("Password is invalid");
                        }
                    })
                } 
                else {
                    logger.info('Unauthorized to access this operation')
                    return response.status(403).json("Unauthorized to access this operation");
                }
            })
        .catch(error => {
            logger.info('User does not exist')
            return response.status(401).json("User does not exist")
        })
    }
module.exports = getUserById;