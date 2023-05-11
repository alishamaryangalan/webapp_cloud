const { basicAuth } = require("../utils/basicAuth")
const { comparePassword } = require("../utils/password")
const db = require("../models")
const Product = db.products
const User = db.users
const {logger} = require("../config/logger.js")
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });

const putProduct = async(request, response) => {
    sdc.increment("Endpoint-PUT_put-product");
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))

    if (!username || !password) {
        logger.info('Basic authorization has failed')
        return response.status(401)
        .json("Basic authorization has failed due to invalid username/password or User must select Basic Auth");
    }
    const productId = request.params.productId
    if(isNaN(productId)) return response.status(400).json("Enter a valid product id") 

    var userData = ""
    var prodData = ""
    var prodInfo = ""

    const requestKey = request.body ? Object.keys(request.body) : null;
        if (!requestKey || !requestKey.length) {
            logger.info('Invalid input')
            return response.status(400).json("Input is not valid");
    }

    if(requestKey.includes('date_added') || requestKey.includes('date_last_updated') || requestKey.includes('owner_user_id')){
        logger.info('Invalid input')
        return response.status(400).json("Enter only the required details.");
    }

    await User.findOne({where: {
        username: username
    }})
    .then(userResult => {
        if(userResult){
            const hashPassword = userResult.get('password')
            logger.info('Comparing password')
            comparePassword(hashPassword, password)
            .then(async compareValue => {
                if(compareValue){
                    userData = userResult.get("id")
                    await Product.findByPk(productId)
            .then(prodResult => {
                logger.info('In product table')
                console.log("In Product table")
                prodData = prodResult
                prodInfo = prodResult

                if(prodInfo == undefined || prodInfo == null) {
                    logger.info('Product does not exist')
                    return response.status(404).json("Product does not exist!")}
                else if(userData != prodInfo.owner_user_id) {
                    logger.info('User is not authorized to access this product')
                    return response.status(403).json("User is not authorized to access this product")}
                else if( prodResult && ((request.body.name==undefined || request.body.name==null) || 
                (request.body.manufacturer==undefined || request.body.manufacturer===null) || 
                (request.body.quantity==undefined || request.body.quantity===null) 
                || (request.body.sku==undefined || request.body.sku===null)
                    ||(request.body.description==undefined || request.body.description===null))){
                        logger.info('Invalid data')
                        return response.status(400).json("Invalid data")
                }
                else if (requestKey.includes('quantity') && (typeof request.body.quantity != 'number' 
                || request.body.quantity<0 || request.body.quantity>100 || request.body.quantity===null)){
                    logger.info('Valid quantity for the product')
                    return response.status(400).json("Enter valid quantity for the product");
                }
                else if(requestKey.includes('sku')){
                    Product.findOne({ where: {sku: request.body.sku} })
                    .then(skuExists => {
                        logger.info('Checking to see if sku is present')
                        console.log(request.body.sku)
                        console.log(skuExists)
                        if ( skuExists ) return response.status(400).json("Sku already exists. Update a new sku for the product!")
                        else{
                                Product.update({
                                    ...request.body,
                                    date_last_updated: new Date().toISOString()
                                },
                                { where: { id: productId } })
                                .then(result => { 
                                    logger.info('Data is updated')
                                    return response.status(204).send("Data is updated.")})
                                .catch(err => { 
                                    logger.info('Error in updating')
                                    return response.sendStatus(400)})
                            }
                }) ;
            }
            else{
                console.log("Else: UPDATE Product not found")
                    Product.update({
                        ...request.body,
                        date_last_updated: new Date().toISOString()
                    },
                    { where: { id: productId } })
                    .then(result => { 
                        logger.info('Data is updated')
                        return response.status(204).send("Data is updated.")})
                    .catch(err => { 
                        logger.info('Error in updating')
                        return response.sendStatus(400)})
        }})
        } else return response.status(401).json("Not authenticated")
    })
} else return response.status(401).json("Not authenticated")
})
}
module.exports = putProduct