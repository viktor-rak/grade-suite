const express = require('express');
const router = express.Router();

router.get('/signup', (req, res) => {
  res.render('signupPage.ejs');
});

module.exports = router;