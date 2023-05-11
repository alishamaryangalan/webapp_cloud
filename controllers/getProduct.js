const db = require("../models")
const Product = db.products
const {logger} = require("../config/logger.js")
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });

const getProductById = (request, response) => {
    sdc.increment("Endpoint-GET_get-product");
    const productId = request.params.productId;
    logger.info('In GetProduct API call')
    Product.findByPk(productId)
        .then(result => { 
            logger.info('Successfully found product by ID')
            if(result!=null) return response.status(200).json(result)
            else return response.status(400).json("Product does not exist!")
        })
        .catch(error => {
            logger.info('Error in finding the product')
            return response.status(404).json("Invalid")
        })
    }
module.exports = getProductById