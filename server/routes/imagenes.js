const express = require('express');
const app = express();
const fs = require('fs');

//construir el path absoluto
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    //let pathImg = `./uploads/${tipo}/${img}`; esto no funciona
    //se debe resolver el path absoluto en el que estamos
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        let noImgPath = path.resolve(__dirname, '../assets/no-image.jpg');
        //regresa el archivo fisicamente
        //lee el content type
        res.sendFile(noImgPath);
    }



});


module.exports = app;