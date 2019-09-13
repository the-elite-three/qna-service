const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use(expressSanitizer())

app.listen(3000, () => console.log('Listening on port 3000'));

app.use('/qa', require('./routes'));