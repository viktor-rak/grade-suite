const {config}=require('dotenv');
config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://"+process.env.MONGO_DB_USERNAME+":"+process.env.MONGO_DB_PASSWORD+"@cmsc335db.hkjesih.mongodb.net/?retryWrites=true&w=majority&appName=CMSC335DB";
let db;
let collec;
const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000;
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))


app.use(express.static(path.join(__dirname, 'templates')))

app.get('/', (req, res) => {
	res.render('landingPage')
})

app.get('/login', (req, res) => {
	res.render('loginPage.ejs')
})

app.get('/signup', (req, res) => {
	res.render('signupPage.ejs')
})

app.listen(PORT, async () => {
	mongoClient = new MongoClient(uri);
	await mongoClient.connect();
    db = mongoClient.db(process.env.MONGO_DB_NAME);
    collec = db.collection(process.env.MONGO_COLLECTION);
	console.log("Server running.");
});

app.listen(PORT, () => {
	console.log("Server running.")
});

