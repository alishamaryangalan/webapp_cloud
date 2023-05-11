const db = require("../models")
const Product = db.products

const getProductById = (request, response) => {
    const productId = request.params.productId;
    
    Product.findByPk(productId)
        .then(result => { 
            if(result!=null) return response.status(200).json(result)
            else return response.status(400).json("Product does not exist!")
        })
        .catch(error => {
            return response.status(404).json("Invalid")
        })
    }
module.exports = getProductById
