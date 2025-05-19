const { config } = require('dotenv');
config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const path = require('path');
const { userInfo } = require('os');

const uri = "mongodb+srv://" + process.env.MONGO_DB_USERNAME + ":" + process.env.MONGO_DB_PASSWORD + "@cmsc335db.hkjesih.mongodb.net/?retryWrites=true&w=majority&appName=CMSC335DB";

let db;
let collec;
let global_email = "";

const app = express();
const PORT = 8000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'templates')));

// Routes
app.get('/', (req, res) => {
	res.render('landingPage.ejs');
});

app.get('/login', (req, res) => {
	res.render('loginPage.ejs', { errorMessage: "" });
});

app.get('/signup', (req, res) => {
	res.render('signupPage.ejs');
});

app.post('/signupResponse', async (req, res) => {
	const { lastname, firstname, email, pwd } = req.body;
	const grade_data = [];
	const gpa = 0;

	const entry = { firstname, lastname, email, pwd, gpa, grade_data };
	const result = await collec.find({ email }).toArray();

	if (result.length === 0) {
		await collec.insertOne(entry);
		res.render('signupResponsePage.ejs', { message: "Registration Completed" });
	} else {
		res.render('signupResponsePage.ejs', {
			message: "Your email is already registered in our database, please login in via your credential"
		});
	}
});

app.post('/login', async (req, res) => {
	const { email, pwd } = req.body;
	global_email = email;

	const result = await collec.find({ email, pwd }).toArray();
	if (result.length === 0) {
		return res.render('loginPage.ejs', {
			errorMessage: "<br/><br/>Not yet registered or password is incorrect"
		});
	} else {
		res.redirect("/dashboard");
	}
});

app.get('/dashboard', async (req, res) => {
	res.render('dashboard.ejs', { display: "<div></div>", words: "" });
});

app.post('/dashboard', async (req, res) => {
	const { email, semester, year, class_code, credits, grade } = req.body;

	const obj = { semester, year, class_code, credits, grade };
	const client = new MongoClient(uri);

	try {
		const result = await collec.findOne({ email });
		const curr_arr = result.grade_data || [];

		await collec.findOneAndUpdate(
			{ email },
			{ $set: { grade_data: [...curr_arr, obj] } }
		);

		res.redirect("/dashboard");
	} catch (e) {
		console.error(e);
		res.status(500).send("Internal server error");
	} finally {
		await client.close();
	}
});

app.post('/display', async (req, res) => {
	const email = global_email;
	const client = new MongoClient(uri);

	try {
		const result = await collec.findOne({ email });
		const grade_data = result.grade_data || [];

		const gradeMap = {
			A: 4.0, "A-": 3.7,
			"B+": 3.3, B: 3.0, "B-": 2.7,
			"C+": 2.3, C: 2.0, "C-": 1.7,
			"D+": 1.3, D: 1.0, "D-": 0.7,
			F: 0.0
		};

		let totalPoints = 0, totalCredits = 0;
		grade_data.forEach(g => {
			const points = gradeMap[g.grade];
			if (points !== undefined) {
				totalPoints += points * Number(g.credits);
				totalCredits += Number(g.credits);
			}
		});

		const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";

		let data_to_display = `<div>`;
		grade_data.forEach(element => {
			data_to_display += `<h3>Semester: ${element.semester} ${element.year}</h3><br>`;
			let table = "<table border=1><tr><th>Class</th><th>Credits</th><th>Grade</th></tr>";
			table += `<tr><td>${element.class_code}</td><td>${element.credits}</td><td>${element.grade}</td></tr>`;
			table += "</table>";
			data_to_display += table + `<br><br>`;
		});
		data_to_display += `</div>`;

		res.render('dashboard.ejs', {
			display: data_to_display,
			words: ""
		});

	} catch (e) {
		console.error(e);
		res.status(500).send("Internal server error");
	} finally {
		await client.close();
	}
});

app.post("/compare", async (req, res) => {
	const email = global_email;
	const client = new MongoClient(uri);

	try {
		const result = await collec.findOne({ email });
		const grade_data = result.grade_data || [];

		const courseRes = await fetch("https://planetterp.com/api/v1/course?name=CMSC335");
		const courseData = await courseRes.json();
		const avg_gpa = courseData.average_gpa;

		const gradeMap = {
			A: 4.0, "A-": 3.7,
			"B+": 3.3, B: 3.0, "B-": 2.7,
			"C+": 2.3, C: 2.0, "C-": 1.7,
			"D+": 1.3, D: 1.0, "D-": 0.7,
			F: 0.0
		};

		let totalPoints = 0, totalCredits = 0;
		grade_data.forEach(g => {
			const points = gradeMap[g.grade];
			if (points !== undefined) {
				totalPoints += points * Number(g.credits);
				totalCredits += Number(g.credits);
			}
		});

		const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";

		let offset = gpa - avg_gpa;
		let more_less = "equal";
		let words = "Good job!";
		if (offset > 0) {
			more_less = "more";
			words = "Excellent job, keep it up!";
		} else if (offset < 0) {
			more_less = "less";
			words = "Try harder!!";
		}

		let str = `Nelson's average gpa for 335 is : ${avg_gpa}. Your GPA is ${Math.abs(offset).toFixed(2)} ${more_less} than Nelson's average gpa.<br> ${words}`;

		res.render('dashboard.ejs', {
			display: `<div></div>`,
			words: str
		});

	} catch (e) {
		console.error(e);
		res.status(500).send("Internal server error");
	} finally {
		await client.close();
	}
});

app.post("/calculate", async (req, res) => {
	const email = global_email;
	if (!email) return res.status(400).json({ error: "Missing email" });

	try {
		const user = await collec.findOne({ email });
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

app.listen(PORT, async () => {
	const mongoClient = new MongoClient(uri);
	await mongoClient.connect();
	db = mongoClient.db(process.env.MONGO_DB_NAME);
	collec = db.collection(process.env.MONGO_COLLECTION);
	console.log("Server running.");
});
