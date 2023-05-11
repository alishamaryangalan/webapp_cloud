const { basicAuth } = require("../utils/basicAuth")
const { comparePassword } = require("../utils/password")
const db = require("../models")
const Product = db.products
const User = db.users

const patchProduct = async(request, response) => {
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))

    if (!username || !password) {
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
            return response.status(400).json("Input is not valid");
    }

    if(requestKey.includes('date_added') || requestKey.includes('date_last_updated') || requestKey.includes('owner_user_id')){
        return response.status(400).json("Enter only the required details.");
    }

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

                console.log("In Product table")
                prodData = prodResult
                prodInfo = prodResult

                if(prodInfo == undefined || prodInfo == null) {
                    return response.status(404).json("Product does not exist!")}
                else if(userData != prodInfo.owner_user_id) {
                    return response.status(403).json("User is not authorized to access this product")}
                else if( prodResult && ((request.body.name==undefined || request.body.name==null) || 
                (request.body.manufacturer===null) || (request.body.quantity===null) 
                || (request.body.sku===null) ||(request.body.description===null))){
                        return response.status(400).json("Invalid data")
                }
                else if (requestKey.includes('quantity') && (typeof request.body.quantity != 'number' 
                || request.body.quantity<0 || request.body.quantity>100 || request.body.quantity===null)){
                    return response.status(400).json("Enter valid quantity for the product");
                }
                else if(requestKey.includes('sku')){
                    Product.findOne({ where: {sku: request.body.sku} })
                    .then(skuExists => {
                        console.log(request.body.sku)
                        console.log(skuExists)
                        if ( skuExists ) return response.status(400).json("Sku already exists. Update a new sku for the product!")
                        else{
                                Product.update({
                                    ...request.body,
                                    date_last_updated: new Date().toISOString()
                                },
                                { where: { id: productId } })
                                .then(result => { return response.status(204).send("Data is updated.")})
                                .catch(err => { return response.sendStatus(403)})
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
                    .then(result => { return response.status(204).send("Data is updated.")})
                    .catch(err => { return response.sendStatus(400)})
        }})
        } else return response.status(401).json("Not authenticated")
    })
} else return response.status(401).json("Not authenticated")
})
}
module.exports = patchProduct