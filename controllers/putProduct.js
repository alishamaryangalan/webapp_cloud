const { basicAuth } = require("../utils/basicAuth")
const db = require("../models")
const Product = db.products
const User = db.users

const putProduct = async(request, response) => {
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))

    if (!username || !password) {
        return response.status(401)
        .json("Basic authorization has failed due to invalid username/password or User must select Basic Auth");
    }
    const productId = request.params.productId


    var userData = ""
    var prodData = ""
    var prodInfo = ""

    await User.findOne({where: {
        username: username
    }})
    .then(userResult => {
        if(userResult==null || userResult==undefined) return response.sendStatus(400)
        userData = userResult.get("id")
        console.log("In Users table")
    })
    
    console.log("Outside FindByPK")

    const requestKey = request.body ? Object.keys(request.body) : null;
        if (!requestKey || !requestKey.length) {
            return response.status(400).json("Input is not valid");
    }

    if(!request.body.name || !request.body.description || !request.body.sku || !request.body.manufacturer || !request.body.quantity
        || !request.body.name.length || !request.body.description.length || !request.body.sku.length || !request.body.manufacturer.length
        ) return response.status(400).json("Name, desc, manufacturer, quantity and sku are mandatory!")

    if(requestKey.includes('date_added') || requestKey.includes('date_last_updated') || requestKey.includes('owner_user_id')){
        return response.status(400).json("Enter only the required details.");
    }

    await Product.findByPk(productId)
    .then(prodResult => {
        console.log("In Product table")
        prodData = prodResult
        prodInfo = prodResult

        if(prodInfo == undefined || prodInfo == null) {
            console.log("Product not found")
            return response.status(404).json("Product does not exist!")}
        else if(userData != prodInfo.owner_user_id) {
            console.log("Else If1: Product not found")
            return response.status(403).json("User is not authorized to access this product")}
        else if( prodResult && ((request.body.name!=undefined && prodResult.dataValues.name == request.body.name) || 
        (request.body.manufacturer!=undefined && prodResult.dataValues.manufacturer==request.body.manufacturer) || 
        (request.body.quantity!=undefined && prodResult.dataValues.quantity==request.body.quantity) 
        || (request.body.sku!=undefined && prodResult.dataValues.sku==request.body.sku)
            ||(request.body.description!=undefined && prodResult.dataValues.description == request.body.description))){
                console.log("Inside the if condition - similar data")
                return response.status(400).json("Similar data! Change the fields")
        }
        else if (requestKey.includes('quantity') && (typeof request.body.quantity != 'number' 
        || request.body.quantity<0 || request.body.quantity==0 || request.body.quantity>=100)){
            return response.status(400).json("Enter valid quantity for the product");
        }
        else if(requestKey.includes('sku')){
            Product.findOne({ where: {sku: request.body.sku} })
            .then(skuExists => {
                console.log(request.body.sku)
                console.log(skuExists)
                if ( skuExists ) return response.status(400).json("Sku already exists. Update a new sku for the product!")
                else{
                    //request["date_last_updated"] = new Date().toISOString() 
                    console.log("Else: UPDATE Product not found")
                        Product.update({
                            ...request.body,
                            date_last_updated: new Date().toISOString()
                        },
                        { where: { id: productId } })
                        .then(result => { return response.status(204).send("Data is updated.")})
                        .catch(err => { return response.sendStatus(400)})
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
}
module.exports = putProduct
