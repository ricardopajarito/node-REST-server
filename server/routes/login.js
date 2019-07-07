const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

app.post('/login', (req, res) => {
    let body = req.body;

    //email: body.email  la validacion del email
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            //error del servidor
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }
        //process.env.CADUCIDAD_TOKEN viene de config.js
        //usuaruoDB contiene todos los datos excepto el password
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });

    // res.json({
    //     ok: true
    // });
});








module.exports = app;