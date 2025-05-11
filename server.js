const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://finalProject335:finalProject@cmsc335db.hkjesih.mongodb.net/?retryWrites=true&w=majority&appName=CMSC335DB";
let db;
let collec;
const dbName= "CMSC335DB";
const collectionName="finalProjectDB";
const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000;
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))


app.use(express.static(path.join(__dirname, 'templates')))

app.get('/', (req, res) => {
	res.render('loginPage')
})

app.listen(PORT, async () => {
	mongoClient = new MongoClient(uri);
	await mongoClient.connect();
    db = mongoClient.db(dbName);
    collec = db.collection(collectionName);
	console.log("Server running.");
});
