const { basicAuth } = require("../utils/basicAuth")
const { comparePassword } = require("../utils/password")
const db = require("../models")
const Product = db.products
const User = db.users
const Image = db.image
const AWS = require('aws-sdk') 
const {logger} = require("../config/logger.js")
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });

require('dotenv').config()

const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.REGION;

const s3 = new AWS.S3({
    region: REGION
  });

const deleteProduct = async (request, response) => {
    sdc.increment("Endpoint-DELETE_delete-product");
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))
    if (!username || !password) {
        logger.info('Basic authorization has failed')
        return response.status(401)
        .json("Basic authorization has failed due to invalid username/password or User must select Basic Auth");
    }
    const productId = request.params.productId
    logger.info('Checking if the productId is valid')
    if(isNaN(productId)) return response.status(400).json("Enter a valid product id") 

    var userData = ""
    var prodData = ""

    await User.findOne({where: {
        username: username
    }})
    .then(userResult => {
        if(userResult){
            const hashPassword = userResult.get('password')
            comparePassword(hashPassword, password)
                .then(async compareValue => {
                    if(compareValue){
                        userData = userResult
                        Product.findByPk(productId)
                            .then(prodResult => {
                                prodData = prodResult
                                logger.info('Checking if the product is available')
                                if(!prodData) return response.status(404).json("Product not found")
                                else if(userData.id == prodData.owner_user_id) {
                                    Product.destroy({where: { id: productId }})
                                    .then(result => { 
                                        Image.findAll({where: { product_id: productId}})
                                        .then(images => {
                                            images.forEach(
                                                  image => { 
                                                        const params = {
                                                            Bucket: BUCKET_NAME,
                                                            Key: image.dataValues.file_name
                                                        };                                   
                                                        console.log(image.dataValues.s3_bucket_path)
                                                        logger.info('Before deleting the object')
                                                        s3.deleteObject(params, (err, data) => {
                                                        if (err) {
                                                            logger.info('Error in deleting the product')
                                                            return response.status(404)
                                                        } 
                                                        else {
                                                            image.destroy()             
                                                            logger.info('Successfully deleted the product')                               
                                                            return response.status(204).send();
                                                        }
                                                      });
                                                    })
                                          })
                                          .catch(err => {
                                              console.log(err)
                                              logger.info('Error in deleting the product')
                                              return response.status(403).send()
                                            });
                                        logger.info('Product is deleted')
                                        return response.status(204).json("Product is deleted") 
                                    })
                                }
                                else return response.status(403).json("Can only delete own product")
                            })
                    } else response.status(401).json("Not authenticated")
                })
        } else return response.status(401).json("Not authenticated")
    })
}
module.exports = deleteProduct