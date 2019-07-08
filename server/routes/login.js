const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


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

//configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    //console.log(payload.name);
    //console.log(payload.email);
    //console.log(payload.picture);
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    //esta promesa regresa todo un objeto de google
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}



app.post('/google', async(req, res) => {
    //recibe del frontend
    let token = req.body.idtoken;

    //si todo esta bien sigue y podemos usar esta variable
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                e
            });
        });

    //busca en el esquema se veritica el si ya existe un usuario
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            //error del servidor
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //si existe el usuario
        if (usuarioDB) {
            //usuario registrado normalmente y existe en la bd
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Se debe de autenticar con su correo '
                    }
                });

            } else {
                //usuario autenticado por google anteriormente
                //se le crea un nuevo token para que siga en la sesion
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //si el usuario no existe en la base de datos
            // se crea un nuevo objeto del esquema Usuario
            let usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)'
            });
            // usuario.nombre = googleUser.nombre;
            // usuario.email = googleUser.email;
            // usuario.img = googleUser.img;
            // usuario.google = true;
            // usuario.password = ':)';

            //se graba en la base de datos
            usuario.save((err, usuarioDB) => {
                if (err) {
                    //error del servidor
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });

    // res.json({
    //     usuario: googleUser
    // });

    // res.json({
    //     token
    // });
    // res.json({
    //     body: req.body
    // });

});






module.exports = app;