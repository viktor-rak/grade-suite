const {config}=require('dotenv');
config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://"+process.env.MONGO_DB_USERNAME+":"+process.env.MONGO_DB_PASSWORD+"@cmsc335db.hkjesih.mongodb.net/?retryWrites=true&w=majority&appName=CMSC335DB";
let db;
let collec;
const express = require('express')
const path = require('path');
const { userInfo } = require('os');

const app = express()
const PORT = 8000;
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'templates')))

app.get('/', (req, res) => {
	res.render('landingPage.ejs')
})

app.get('/login', (req, res) => {
	res.render('loginPage.ejs',{errorMessage:""})
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
app.post('/login', async (req, res) => {
	const email=req.body.email
	const pwd=req.body.pwd
	const result=await collec.find({email:email, pwd:pwd}).toArray();
	if (result.length===0){
		return res.render('loginPage.ejs',{errorMessage:"<br/><br/>Not yet registered or password is incorrect" })
	}
	else{
		res.redirect("/dashboard")
	}
})

app.post("/calculate", async (req, res) => {
	const email = req.body.email;
	if (!email) return res.status(400).json({ error: "Missing email" });

	try {
		const user = await collec.findOne({ email: email });
		const grades = user?.grade_data || [];

		const gradeMap = { A: 4, B: 3, C: 2, D: 1, F: 0 };
		let totalPoints = 0, totalCredits = 0;
		grades.forEach(g => {
			const points = gradeMap[g.grade];
			if (points !== undefined) {
				totalPoints += points * Number(g.credits);
				totalCredits += Number(g.credits);
			}
		});
		const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";
		res.json({ gpa });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.post('/dashboard', async (req, res) => {
	const email = req.body.email;
	const semester = req.body.semester;

	let grade = "";
	let class_code = "";
	let year = "";

	grade = req.body.grade;
	class_code = req.body.class_code;
	year = req.body.year;

	if(!isNaN(Number(year))){
		
	}

	table = `<div>${semester}<br>
	${year}<br>
	${class_code}<br>
	${grade}
	</div>`

	let info = {
		display : table,
	}
	res.render('dashboard.ejs',info)
})

app.get('/dashboard', async (req, res) => {
	let info = {
		display : "<div></div>",
	}
	res.render('dashboard.ejs',info)
})

app.listen(PORT, async () => {
	mongoClient = new MongoClient(uri);
	await mongoClient.connect();
    db = mongoClient.db(process.env.MONGO_DB_NAME);
    collec = db.collection(process.env.MONGO_COLLECTION);
	console.log("Server running.");
});


