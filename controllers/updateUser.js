const { basicAuth } = require("../utils/basicAuth")
const { comparePassword, passwordBCryptHash } = require("../utils/password")
const db = require("../models")
const User = db.users

const updateUser = async (request, response) => {
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
                    .then(async compareValue => {
                    if (compareValue) {
                        const requestKey = request.body ? Object.keys(request.body) : null;
                        if (!requestKey || !requestKey.length) {
                            return response.status(400).json("Input is not valid");
                        }   
                        if(requestKey.includes('account_updated') || requestKey.includes('account_created') || requestKey.includes('username')){
                            return response.status(400).json("Enter only the firstname, lastname and/or password.");
                        }
                        if(requestKey.includes('first_name') && requestKey.includes('last_name') && requestKey.includes('password')){
                            const hash = await passwordBCryptHash(request.body.password);    
                            User.update( {
                                first_name: request.body.first_name, 
                                last_name: request.body.last_name, 
                                password: hash
                            },
                            { where: { id: userID } })
                            .then(result => { return response.status(204).send("Firstname, lastname & password is updated.")})
                            .catch(err => { return response.sendStatus(400)});
                        }
                        else if(requestKey.includes('password') && requestKey.includes('last_name')){
                            const hash = await passwordBCryptHash(request.body.password);
                            console.log(hash)
                            User.update( {
                                last_name: request.body.last_name, 
                                password: hash
                            },
                            { where: { id: userID } })
                            .then(result => { return response.status(204).send("Password and lastname are successfully updated!")})
                            .catch(err => { return response.sendStatus(400)});
                        }
                        else if(requestKey.includes('password') && requestKey.includes('first_name')){
                            const hash = await passwordBCryptHash(request.body.password);
                            console.log(hash)
                            User.update( {
                                first_name: request.body.first_name, 
                                password: hash
                            },
                            { where: { id: userID } })
                            .then(result => { return response.status(204).send("Password and firstname are successfully updated!")})
                            .catch(err => { return response.sendStatus(400)});
                        }
                        else if(requestKey.includes('password')){
                                const hash = await passwordBCryptHash(request.body.password);
                                console.log(hash)
                                User.update( {
                                    password: hash
                                },
                                { where: { id: userID } })
                                .then(result => { return response.status(204).send("Password is successfully updated!")})
                                .catch(err => { return response.sendStatus(400)});
                        } 
                        else if(requestKey.includes('last_name')){
                            User.update( {
                                last_name: request.body.last_name
                            },
                            { where: { id: userID } })
                            .then(result => { return response.status(204).send("Last name is successfully updated!")})
                            .catch(err => { return response.sendStatus(400)});
                        }
                        else if(requestKey.includes('first_name')){
                            User.update( {
                                first_name: request.body.first_name
                            },
                            { where: { id: userID } })
                            .then(result => { return response.status(204).send("Firstname is successfully updated!")})
                            .catch(err => { return response.sendStatus(400)});
                        }
                        let account_updated = new Date().toISOString();
                        User.update( {
                            account_updated: account_updated
                        },
                        { where: { id: userID } })
                        .then(result => { console.log(result)})
                        .catch(err => { console.log(err) });
                    } 
                    else {
                        return response.status(401).json("Username/Password is incorrect!");
                     }
                    })
                } 
                else {
                    return response.status(403).json("Username/Password is incorrect or you are not authorized to make this change!");
                }
            })
        .catch(error => {
            return response.status(400).json(error.message)
        })
    }
module.exports = updateUser;