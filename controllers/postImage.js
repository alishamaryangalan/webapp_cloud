const { basicAuth } = require("../utils/basicAuth")
const { comparePassword } = require("../utils/password")
const db = require("../models")
const Product = db.products
const User = db.users
const Image = db.image
const fs = require('fs')
const AWS = require('aws-sdk')   
const path = require('path')
const uuid = require('uuid')
const {logger} = require("../config/logger.js")
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });

require('dotenv').config()

const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.REGION;

const s3 = new AWS.S3({
    region: REGION
  });

const postImage = async (request, response) => {
    sdc.increment("Endpoint-POST_post-image");
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

    var userData = ""

    if (!request.file) {
        logger.info('Invalid input')
        console.log(request.file)
        return response.status(400).json("No input data is provided");
    }

    const fileExtension = path.extname(request.file.originalname);
    console.log(fileExtension)
    // Validate file extension

    if (fileExtension == '.jpeg' || fileExtension == '.png' || fileExtension == '.jpg') {
        console.log("File is an image")
        logger.info('File is an image')
    }
    else return response.status(400).json('Invalid file extension. Only images are allowed.')

    await User.findOne({where: {
        username: username
    }})
    .then(userResult => {
        if(userResult){
            logger.info('Comparing the passwords')
            const hashPassword = userResult.get('password')
            comparePassword(hashPassword, password)
            .then(async compareValue => {
                if(compareValue){
                    userData = userResult.get("id")
                    await Product.findByPk(productId)
                    .then(prodResult => {
                        if(!prodResult) {
                            logger.info('Product is not available')
                            return response.status(400).json("Product is not available")
                        }
                        else if(prodResult.dataValues.owner_user_id != userResult.dataValues.id)
                        {
                            logger.info('Not authenticated')
                            return response.status(404).json("Not authenticated")
                        }
                        else
                        {
                            const file = request.file
                            console.log(file)
                            const fileStream = fs.createReadStream(file.path)
                            
                            const randomValue = uuid.v4()
                            const params = {
                                Bucket: BUCKET_NAME,
                                Key: `images/${userResult.dataValues.id}/product/${prodResult.dataValues.id}/` + file.originalname + randomValue,
                                Body: fileStream,
                            }

                        s3.upload(params, (err, data) => {
                            if (err) {
                                console.log('Error uploading image:', err);
                                logger.info('Error while creating image')
                                return response.status(400).json("Error while creating image")
                            }
                            else {
                                const newImage = {
                                    product_id : prodResult.dataValues.id,
                                    file_name : `images/${userResult.dataValues.id}/product/${prodResult.dataValues.id}/` + file.originalname + randomValue,
                                    date_created : new Date().toISOString() ,
                                    s3_bucket_path : data.Location
                                }
                                console.log('Image uploaded successfully. S3 URL:', data.Location);
                                logger.info('Image uploaded successfully. S3 URL:', data.Location)
                                Image.create(newImage)
                                .then(data => {
                                    logger.info('Image created successfully. S3 URL:', data.Location)
                                    return response.status(201).json(data)
                                })
                                .catch(error => {
                                    logger.info('Error occured while creating the image')
                                    console.log(error)
                                    return response.status(400).json("Error occured while creating the image")
                                })
                            }
                         })
                        }   
                    })
                } 
                else return response.status(401).json("Not authenticated")
            })
        } else return response.status(401).json("Not authenticated")
    })  
}; 
module.exports = postImage