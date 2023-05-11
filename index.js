const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { createUser } = require("./controllers")
// const { getUsers } = require("./controllers")
const { getUserById } = require("./controllers")
const { updateUser } = require("./controllers")
const { createProduct } = require("./controllers")
const { getProductById } = require("./controllers")
const { deleteProduct } = require("./controllers")
const { putProduct } = require("./controllers")
const { patchProduct } = require("./controllers")
require('dotenv').config();

const PORT = process.env.PORT

const app = express()

var corsOptions = {
    origin: process.env.ORIGIN
}

app.use(cors(corsOptions))
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true,
}));

const db = require("./models")
db.sequelize.sync(
  //  {force:true}
    )
.then(() => {
    app.listen(PORT, () =>  console.log(`App running on port ${PORT}.`))
   })

//To check if the app is working
app.get('/', (request, response) => {
    response.json("App seems to be working!")
  })

//To check the healthz endpoint
app.get('/healthz', (request, response) => {
    try{
        response.sendStatus(200)
    }
    catch(error){
        response.sendStatus(500)
    }
})

//Route used to create a new user
app.post('/v1/user', createUser)

//To get all users
// app.get('/users', getUsers )

//To get one user by ID
app.get('/v1/user/:userID', getUserById )

//To update an authenticated user
app.put('/v1/user/:userID', updateUser)

//To create a product
app.post('/v1/product', createProduct)

//To get a product
app.get('/v1/product/:productId', getProductById)

//To delete a product
app.delete('/v1/product/:productId', deleteProduct)

//To update a product using PUT
app.put('/v1/product/:productId', putProduct)

//To update a product using PATCH
app.patch('/v1/product/:productId', patchProduct)

//Page not found
app.use((request, response, next) => {
    response.status(404).send('Sorry, cannot find this page!');
  });

