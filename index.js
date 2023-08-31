const connectToMongo = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser')

connectToMongo();

const app = express();
const port = 5000;

//Use a middlewear to access the req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/notes/', require('./routes/notes.js'));

app.listen(port, ()=>{
    console.log(`The Server is running on the port: ${port}`);
});