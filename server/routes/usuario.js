const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
//se necesita el modelo para grabar en la db
const Usuario = require('../models/usuario');
//mandamos a llamar a verificaToken
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, function(req, res) {

    //este es el ejemplo del middleware al validar el token
    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    //res.json('getUsuario LOCAL');
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    //metodo de mongoose
    //se puede poner condiciones en ({}, 'nombre email role estado google img')
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            //si hay un error
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //retornar el numero de registros
            Usuario.countDocuments({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    conteo
                });
            });
        });
});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //usuarioDB es un callback
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //usuarioDB.password=null; ver el metodo de usuario model



        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    //res.json('post Usuario');
    // if (body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     })
    // } else {
    //     res.json({
    //         persona: body
    //     });
    // }

});


//put como actualizacion del registro
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id;
    //let body = req.body;

    //funcion de underscore para hacer validaciones multiples
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    //este es un metodo de moongose
    //usuarioDB.save si es con Usuario.findById
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        //si hay un error
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            usuario: usuarioDB
        });


    });

    //res.json('put Usuario');

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    //res.json('delete Usuario');
    let id = req.params.id;
    //eliminacion fisica
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //     //si hay un error
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }
    //     if (usuarioBorrado === null) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     });

    // });

    //eliminacion cambiando el estado
    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        //si hay un error
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (usuarioBorrado === null) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });


    });


});

module.exports = app;