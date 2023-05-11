const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const { 
    createUser, 
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
} = require("./controllers")
const {logger} = require("./config/logger.js")
const SDC = require("statsd-client");
const sdc = new SDC({ host: "localhost", port: 8125 });

require('dotenv').config()

const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '/uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const PORT = process.env.PORT

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true,
}));

const db = require("./models")
db.sequelize.sync(
//    {force:true}
    )
.then(() => {
    app.listen(PORT, () =>  console.log(`App running on port ${PORT}.`))
    logger.info('Checking to see if the app is properly running on the port')
   })

//To check if the app is working
app.get('/', (request, response) => {
    response.json("App seems to be working!")
    logger.info('App seems to be working!')
    // sdc.increment("Endpoint-health") 
})

//To check the healthz endpoint
app.get('/healthz', (request, response) => {
    try{
        response.sendStatus(200)
        logger.info('Healthz seems to be working fine!')
        sdc.increment("Endpoint-health") 
    }
    catch(error){
        response.sendStatus(500)
    }
})

//Route used to create a new user
app.post('/v1/user', createUser)

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

//To upload an image
app.post('/v1/product/:productId/image', upload.single(process.env.filename), postImage)

//To get Image Details
app.get('/v1/product/:productId/image/:imageId', getImage)

//To get List of All Images Uploaded
app.get('/v1/product/:productId/image', getAllImages)

//To delete the image

//Page not found
app.use((request, response, next) => {app.delete('/v1/product/:productId/image/:imageId', deleteImage)
    return response.status(404).send('Sorry, cannot find this page!');
  });

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json("Add 'file' in Key");
      }
      return res.status(400).json(err.message);
    } 
    else if (err) {
      return res.status(500).json(err.message);
    } 
    next();
  })