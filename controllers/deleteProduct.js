const { basicAuth } = require("../utils/basicAuth")
const db = require("../models")
const Product = db.products
const User = db.users

const deleteProduct = async (request, response) => {
    console.log("In delete product function")
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))
    if (!username || !password) {
        return response.status(401)
        .json("Basic authorization has failed due to invalid username/password or User must select Basic Auth");
    }
    const productId = request.params.productId
    console.log(productId)
    var userData = ""
    var prodData = ""
    User.findOne({where: {
        username: username
    }})
    .then(userResult => {
        userData = userResult
        console.log("In Users table")
        console.log(userData.id)
    })
    Product.findByPk(productId)
    .then(prodResult => {
        console.log("In Product table")
        prodData = prodResult
        if(!prodData) return response.status(404).json("Product not found")

        else if(userData.id == prodData.owner_user_id) {
            Product.destroy({where: { id: productId }})
            .then(result => { return response.status(204).json("Product is deleted") })
        }
        else return response.status(403).json("Can only delete own product")
    })
}
module.exports = deleteProduct
