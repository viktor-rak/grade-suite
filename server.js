const {config}=require('dotenv');
config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://" + process.env.MONGO_DB_USERNAME + ":" + process.env.MONGO_DB_PASSWORD + "@335finalproj.x7haomj.mongodb.net/?retryWrites=true&w=majority&appName=335FinalProj";

let db;
let collec;
const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
	res.render('signupPage');
  });
  
  app.post('/signup', async (req, res) => {
	const { firstName, lastName, email, password } = req.body;
  
	if (!firstName || !lastName || !email || !password) {
	  return res.status(400).send('All fields are required.');
	}
  
	try {
	  await collec.insertOne({
		firstName,
		lastName,
		email,
		password, 
		createdAt: new Date()
	  });
	  res.send('Account created successfully!');
	} catch (err) {
	  console.error('Signup error:', err);
	  res.status(500).send('Could not create account.');
	}
  });
  

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

