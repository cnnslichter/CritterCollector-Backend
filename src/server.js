const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// set up server
app.use(bodyParser.urlencoded({ extended: false }));

// set up routes
app.get('/api/animals', (req, res) => {
  console.log("GET made to /api/animals")
  res.send(true);
})

// start server
var server = app.listen(8080);
console.log("Started Animal Location Server!");
