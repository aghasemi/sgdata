var express = require('express');
var app = express();
var port = process.env.PORT || 8484;
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(port, function () {
  console.log('Example app listening on port!');
  console.log('Hi! '+port)
});