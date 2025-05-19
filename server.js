const {config}=require('dotenv');
config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://"+process.env.MONGO_DB_USERNAME+":"+process.env.MONGO_DB_PASSWORD+"@cmsc335db.hkjesih.mongodb.net/?retryWrites=true&w=majority&appName=CMSC335DB";
let db;
let collec;
const express = require('express')
const path = require('path');
const { userInfo } = require('os');
let global_email = "";

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
	const grade_data = new Array();
	const gpa = 0;
	const entry={
		firstname:firstname,
		lastname:lastname,
		email:email,
		pwd:pwd,
		gpa: gpa,
		grade_data: grade_data,
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
	global_email = email;
	const pwd=req.body.pwd
	const result=await collec.find({email:email, pwd:pwd}).toArray();
	if (result.length===0){
		return res.render('loginPage.ejs',{errorMessage:"<br/><br/>Not yet registered or password is incorrect" })
	}
	else{
		res.redirect("/dashboard")
	}
})

app.post('/dashboard', async (req, res) => {
	const email = req.body.email;

	const semester = req.body.semester;
	const year = req.body.year;
	const class_code = req.body.class_code;
	const credits = req.body.credits;
	const grade = req.body.grade;

	let obj = {
		semester: semester,
		year: year,
		class_code: class_code,
		credits: credits,
		grade: grade,
	}

	let client = new MongoClient(uri);

	try {

        let result = await collec.findOne({email: email});
		let curr_arr = result.grade_data;
		// console.log(result.grade_data.length);

		collec.findOneAndUpdate({email: email}, {$set: {grade_data: [...curr_arr,obj]}});  
		
     } catch (e) {
        console.error(e);
     } finally {
        await client.close();
     }

})

app.post('/display', async (req, res) => {
  const email = global_email;
  let client = new MongoClient(uri);

  try {
    const result = await collec.findOne({ email: email });
    const grade_data = result.grade_data || [];

    // const courseRes = await fetch("https://planetterp.com/api/v1/course?name=CMSC335");
    // const courseData = await courseRes.json();
    // const avg_gpa = courseData.average_gpa;

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
  let client = new MongoClient(uri);

  try {
    const result = await collec.findOne({ email: email });
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

	console.log(`Your gpa is ${gpa}, the average for 335 is: ${avg_gpa}`);
	let offset = gpa - avg_gpa;
	let more_less = "equal";
	let words = "Good job!";
	if (gpa - avg_gpa > 0){
		more_less = "more";
		words = "Excellent job, keep it up!";
	}else{
		more_less = "less";
		words = "Try harder!!"
	}

	let str =  `Nelson's average gpa for 335 is : ${avg_gpa}. Your GPA is ${offset} ${more_less} than Nelson's average gpa.<br> ${words}`;

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



app.get('/dashboard', async (req, res) => {
	let info = {
		display : "<div></div>",
		words: ""
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

app.post("/calculate", async (req, res) => {
    const email = global_email;
    if (!email) return res.status(400).json({ error: "Missing email" });

    try {
        const user = await collec.findOne({ email: email });
        const grades = user?.grade_data || [];

        const gradeMap = { A: 4, B: 3, C: 2, D: 1, F: 0 }; //quality points dict
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

