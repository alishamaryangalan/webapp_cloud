const { basicAuth } = require("../utils/basicAuth")
const { comparePassword } = require("../utils/password")
const db = require("../models")
const Product = db.products
const User = db.users
const Image = db.image
const AWS = require('aws-sdk')   

require('dotenv').config()

const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.REGION;

const s3 = new AWS.S3({
    region: REGION
});

const deleteImage = async(request, response) => {

const [username, password] = basicAuth(request);
console.log(basicAuth(request))

    if (!username || !password) {
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
                            return response.status(400).json("Product is not available")
                        }
                        else if(prodResult.dataValues.owner_user_id != userResult.dataValues.id)
                        {
                            return response.status(404).json("Not authenticated")
                        }
                        else
                        {
                            Image.findByPk(imageId)
                            .then(imageResult => {
                                if(!imageResult){
                                    return response.status(400).json("Image is not available")
                                }
                                else if(imageResult.dataValues.product_id != prodResult.dataValues.id)
                                {
                                    return response.status(404).json("Not authenticated")
                                }
                                else{
                                    const params = {
                                        Bucket: BUCKET_NAME,
                                        Key: imageResult.dataValues.file_name
                                      };                                   
                                    console.log(imageResult.dataValues.s3_bucket_path)
                                    s3.deleteObject(params, (err, data) => {
                                        if (err) {
                                          return response.status(400).send()
                                        } 
                                        else {
                                            console.log('Object deleted successfully');
                                            Image.destroy({where: { id: imageId }})                                            
                                            return response.status(204).send()
                                        }
                                      });
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
  module.exports = deleteImage