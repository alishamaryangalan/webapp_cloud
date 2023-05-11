const { basicAuth } = require("../utils/basicAuth")
const { comparePassword } = require("../utils/password")
const db = require("../models")
const Product = db.products
const User = db.users

const createProduct = async (request, response) => {
    const [username, password] = basicAuth(request);
    console.log(basicAuth(request))
    if (!username || !password) {
        return response.status(401)
        .json("Basic authorization has failed due to invalid username/password or User must select Basic Auth");
    }

    const fields = ["name", "description", "sku", "manufacturer", "quantity"]
    const requestKey = request.body ? Object.keys(request.body) : null;
    if (!requestKey || !requestKey.length) {
        return response.status(400).json("Input is not valid");
    }
    let checkValExists = true;
    requestKey.forEach(val => {
        if (fields.indexOf(val) < 0) {
            checkValExists = false;
        }
    })
    if (!checkValExists) {
        return response.status(400).json("Please enter only the name, description, sku, manufacturer and quantity!");
    }
    const {
        name,
        description,
        sku,
        manufacturer,
        quantity
    } = request.body;

    if (!name || !description || !sku || !manufacturer || name==null || description==null || manufacturer==null 
        || sku==null) {
        return response.status(400).json("Input data is invalid! Please check again!");
    }
    else if (typeof quantity != 'number'  || quantity>100 || quantity<0 || quantity==null){
        return response.status(400).json("Enter valid quantity for the product");
    }
    const skuExists = await Product.findOne({ where: {sku: request.body.sku} });
    if ( skuExists ) return response.status(400).json("Sku already exists. Create a new sku for the product!")

    await User.findOne({where: {
        username: username
    }})
        .then(result => {
            if(result){
                const hashPassword = result.get('password')
                comparePassword(hashPassword, password)
                    .then(async compareValue => {
                        if(compareValue){
                            const newProduct = {
                                name: request.body.name,
                                description: request.body.description,
                                sku: request.body.sku,
                                manufacturer: request.body.manufacturer,
                                quantity: request.body.quantity,
                                date_added: new Date().toISOString(),
                                date_last_updated: new Date().toISOString(),
                                owner_user_id: result.dataValues.id
                            }
                            Product.create(newProduct)
                            .then(data => {
                                return response.status(201).json(data)
                            })
                            .catch(error => {
                                console.log(error)
                                response.status(400).json("Error occured while creating the product")
                            }) 
                        }
                        else response.status(401).json("Not authenticated")
                    })
            } else return response.status(401).json("Not authenticated")
    })
}
module.exports = createProduct