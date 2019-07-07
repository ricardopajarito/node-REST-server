const express = require('express');
const app = express();


//toma las funciones de usuario que tiene get put post
app.use(require('./usuario'));
app.use(require('./login'));




module.exports = app;