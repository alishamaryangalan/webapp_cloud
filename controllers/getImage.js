const { basicAuth } = require("../utils/basicAuth")
const { comparePassword } = require("../utils/password")
const db = require("../models")
const Product = db.products
const User = db.users
const Image = db.image
const {logger} = require("../config/logger.js")
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });

require('dotenv').config()

const getImage = async (request, response) => {
    sdc.increment("Endpoint-GET_get-image");
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))

    if (!username || !password) {
        logger.info('Basic authorization has failed')
        return response.status(401)
        .json("Basic authorization has failed due to invalid username/password or User must select Basic Auth");
    }

    const productId = request.params.productId
    console.log(productId)
    if(productId % 1 === 0) console.log("whole number")
    else return response.status(400).json("Enter a valid product id") 

    const imageId = request.params.imageId
    console.log(imageId)
    if(imageId % 1 === 0) console.log("whole number")
    else return response.status(400).json("Enter a valid product id") 

    await User.findOne({where: {
        username: username
    }})
    .then(userResult => {
        if(userResult){
            const hashPassword = userResult.get('password')
            comparePassword(hashPassword, password)
            .then(async compareValue => {
                if(compareValue){
                    userData = userResult.get("id")
                    await Product.findByPk(productId)
                    .then(prodResult => {
                        if(!prodResult) {
                            logger.info('Product is not available')
                            return response.status(404).json("Product is not available")
                        }
                        else if(prodResult.dataValues.owner_user_id != userResult.dataValues.id)
                        {
                            logger.info('Not authenticated')
                            return response.status(401).json("Not authenticated")
                        }
                        else
                        {
                            Image.findByPk(imageId)
                            .then(imageResult => {
                                if(!imageResult){
                                    logger.info('Image is not available')
                                    return response.status(404).json("Image is not available")
                                }
                                else if(imageResult.dataValues.product_id != prodResult.dataValues.id)
                                {
                                    logger.info('Not authenticated')
                                    return response.status(401).json("Not authenticated")
                                }
                                else{
                                    logger.info('Successfully found the image')
                                    return response.status(200).json(imageResult)
                                }
                            })
                        }
                    })
                } 
                else return response.status(401).json("Not authenticated")
            })
        } else return response.status(401).json("Not authenticated")
    })  
}
module.exports = getImage