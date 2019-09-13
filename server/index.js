const bodyParser = require('body-parser');
const express = require('express');
const expressSanitizer = require('express-sanitizer');
const app = express();

app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use(expressSanitizer())

app.listen(8080, () => console.log('Listening on port 8080'));

app.use('/qa', require('./routes'));