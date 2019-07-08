const express = require('express');
const app = express();
//const _ = require('underscore');
const Categoria = require('../models/categoria');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');


// ================
// Mostrar todas las categorias (READ)
//=================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find()
        //ordena por nombre del campo de la categoria
        .sort('nombre')
        //.skip(desde)
        //.limit(limite)
        //populate revisa que id's  hay en la categoria solicitada
        //permite cargar informacin
        //p.e regresar la informacion del usuario
        //nombre e email son los unicos campos que quiero enviar
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            //si hay un error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            //retornar el numero de registros
            Categoria.countDocuments({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    conteo
                });
            });
        });
    // return res.json({
    //     mensaje: 'Holaaaa'
    // });
});




// ================
// Mostrar una categoria por id (READ)
//=================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    //let body = req.body;
    //asi tambien funciona
    //Categoria.findById(id, body, (err, categoriaDB) => {

    Categoria.findById(id, (err, categoriaDB) => {

        //si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //se valida en caso de que no venga ninguna categoria
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ================
// crear una nueva categoria (CREATE)
//=================
app.post('/categoria', verificaToken, (req, res) => {
    //regresa la nueva categoria
    //req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    //usuarioDB es un callback
    categoria.save((err, categoriaDB) => {
        //eror de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //valida si no se creo la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ================
// Actualizar una categorias (UPDATE)
//=================
app.put('/categoria/:id', verificaToken, (req, res) => {
    //actualizar el nombre de la categoria
    let id = req.params.id;
    let body = req.body;

    //se crea un objeto con los campos que se van a actualizar
    let nombreCategoria = {
        nombre: body.nombre
    };
    //funcion de underscore para hacer validaciones multiples
    //let body = _.pick(req.body, ['nombre']);

    //{ new: true, runValidators: true } no choquen las validaciones
    Categoria.findByIdAndUpdate(id, nombreCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        //error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //valida si no se creo la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });


});

// ================
// Borra una categoria por su id (DELETE)
//=================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //solo un administrador puede borrar las categorias
    //pedir token, fisicamente la va a eliminar
    //categoria.findByIdAndRemove
    let id = req.params.id;
    //eliminacion fisica
    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {


        //error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //valida si no se creo la categoria
        if (!categoriaBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrado
        });

    });
});





module.exports = app;