require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

// parse application/x-www-form-urlencoded
//es un middleware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
//es un middleware
app.use(bodyParser.json());

//toma las funciones de usuario que tiene get put post
//es un middleware
app.use(require('./routes/index'));



mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true },
    (err, res) => {
        if (err) throw err;
        console.log('Base de datos online');
    });


app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});