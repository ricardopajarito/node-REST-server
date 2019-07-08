const express = require('express');
const app = express();
const Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/autenticacion');

// ================
// (GET) Obtener todos los productos
// paginado : desde limite
// populate: usuario categoria
//=================
app.get('/productos', verificaToken, (req, res) => {


    let desde = req.query.desde || 0;
    desde = Number(desde);

    //verifica que solo los que tengan el estado
    //disponible: true aparezcan
    Producto.find({ disponible: true })
        //ordena por nombre del campo de la categoria
        //.sort('nombre')
        .skip(desde)
        .limit(5)
        //populate revisa que id's  hay en la categoria solicitada
        //permite cargar informacin
        //p.e regresar la informacion del usuario
        //nombre e email son los unicos campos que quiero enviar
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            //si hay un error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            //retornar el numero de registros
            Producto.countDocuments({}, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    conteo
                });
            });
        });
});


// ================
// (GET) Obtener un producto por ID
//populate: usuario y categoria
//=================
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            //si hay un error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //se valida en caso de que no venga ninguna categoria
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            }
            if (productoDB.disponible === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no esta disponible'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });
});
// ================
// (GET) Buscar productos por terminos de busqueda
//=================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    //i significa que es sensible a mayusculas y minusculas
    let regex = new RegExp(termino, 'i');


    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            //si hay un error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});




// ================
// (POST) Crear un nuevo producto
// adjuntar el usuario que lo crea
// adjuntar la categoria
//=================
app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;
    //el orden no importa mucho al momento de grabar
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });
    //productoDB es un callback
    producto.save((err, productoDB) => {
        //error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //valida si no se creo el producto
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});


// ================
// (PUT) Actualizar un producto por id
//=================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let camposActualizar = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        categoria: body.categoria,
        disponible: body.disponible,
        descripcion: body.descripcion
    };
    Producto.findByIdAndUpdate(id, camposActualizar, { new: true, runValidators: true }, (err, productoDB) => {

        //error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //valida si no se creo el producto
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });

    //otra alternativa a actualizar
    // Producto.findById(id, (err, productoDB) => {
    //     //error de base de datos
    //     if (err) {
    //         return res.status(500).json({
    //             ok: false,
    //             err
    //         });
    //     }
    //     //valida si no se creo el producto
    //     if (!productoDB) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'El ID no existe'
    //             }
    //         });
    //     }
    //     productoDB.nombre = body.nombre;
    //     productoDB.precioUni = body.precioUni;
    //     productoDB.categoria = body.categoria;
    //     productoDB.disponible = body.disponible;
    //     productoDB.descripcion = body.descripcion;

    //     productoDB.save((err, productoGuardado) => {
    //         //error de base de datos
    //         if (err) {
    //             return res.status(500).json({
    //                 ok: false,
    //                 err
    //             });
    //         }
    //         res.json({
    //             ok: true,
    //             producto: productoGuardado
    //         });
    //     });

    // });
});


// ================
// (DELETE) Borrar un producto por id
// cambiar el status de disponible a falso
//=================

app.delete('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    //eliminacion cambiando el estado
    //otra alternativa a actualizar
    Producto.findById(id, (err, productoDB) => {
        //error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //valida si no se creo el producto
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }
        // productoDB.nombre = body.nombre;
        // productoDB.precioUni = body.precioUni;
        // productoDB.categoria = body.categoria;
        productoDB.disponible = false;
        // productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoBorrado) => {
            //error de base de datos
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });
        });

    });
});








module.exports = app;