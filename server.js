const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000;
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'templates'))


app.use(express.static(path.join(__dirname, 'templates')))

app.get('/', (req, res) => {
	res.render('signupPage.ejs')
})

app.listen(PORT, () => {
	console.log("Server running.")
});