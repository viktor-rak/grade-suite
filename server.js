const {config}=require('dotenv');
config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://"+process.env.MONGO_DB_USERNAME+":"+process.env.MONGO_DB_PASSWORD+"@cmsc335db.hkjesih.mongodb.net/?retryWrites=true&w=majority&appName=CMSC335DB";
let db;
let collec;
const express = require('express')
const path = require('path')

const app = express()
const PORT = 8000;
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'templates')))

app.get('/', (req, res) => {
	res.render('landingPage.ejs')
})

app.get('/login', (req, res) => {
	res.render('loginPage.ejs')
})

app.get('/signup', (req, res) => {
	res.render('signupPage.ejs')
})
app.post('/signupResponse', async (req, res) => {
	const lastname=req.body.lastname
	const firstname=req.body.firstname
	const email=req.body.email
	const pwd=req.body.pwd
	const entry={
		firstname:firstname,
		lastname:lastname,
		email:email,
		pwd:pwd
	}
	const result=await collec.find({email:email}).toArray();
	if (result.length===0){
		await collec.insertOne(entry)
		res.render('signupResponsePage.ejs',{message:"Registration Completed" })
	}
	else{
		res.render('signupResponsePage.ejs',{message:" Your email is already registered in our database, please login in via your credential"})
	}
})
app.listen(PORT, async () => {
	mongoClient = new MongoClient(uri);
	await mongoClient.connect();
    db = mongoClient.db(process.env.MONGO_DB_NAME);
    collec = db.collection(process.env.MONGO_COLLECTION);
	console.log("Server running.");
});


