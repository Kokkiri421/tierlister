const http = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
  
mongoose.connect("mongodb://localhost:27017/tierlister", { useNewUrlParser: true });

require('./models/User');
require('./models/Tier');
require('./models/Tierlist');

require('./models/Element');





const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(require('./routes'));


app.listen(3000);
