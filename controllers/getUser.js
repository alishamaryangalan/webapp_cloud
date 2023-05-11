const { comparePassword } = require("../utils/password")
const { basicAuth } = require("../utils/basicAuth")
const db = require("../models")
const User = db.users

const getUserById = (request, response) => {
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))
    if (!username || !password) {
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
                        const data = result;
                        delete data.dataValues.password
                        return response.status(200).json(data);
                    } 
                    else {
                        console.log("Something's wrong!")
                        return response.status(401).json("Password is invalid");
                        }
                    })
                } 
                else {
                    return response.status(403).json("Unauthorized to access this operation");
                }
            })
        .catch(error => {
            return response.status(401).json("User does not exist")
        })
    }
module.exports = getUserById;