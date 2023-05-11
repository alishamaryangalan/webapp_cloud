const createUser = require("./createUser");
const getUsers = require("./getUsers");
const getUserById = require("./getUser")
const updateUser = require("./updateUser")
const createProduct = require("./createProduct")
const getProductById = require("./getProduct")
const deleteProduct = require("./deleteProduct")
const putProduct = require("./putProduct")
const patchProduct = require("./patchProduct")
const postImage = require("./postImage")
const getImage = require("./getImage")
const getAllImages = require("./getAllImages")
const deleteImage = require("./deleteImage")

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    createProduct,
    getProductById,
    deleteProduct,
    putProduct,
    patchProduct,
    postImage,
    getImage,
    getAllImages,
    deleteImage
}