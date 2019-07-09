const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

//para grabar en las bases de datos necesitamos las
//Schemas de Usuario y Productos
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
//para usar el file system y manejarlo para
//validar una ruta
//esto ya es propio de node
const fs = require('fs');
const path = require('path');

//middleware, todos los archivos que se carguen
//caen dentro de req.files
//lo transforma en un objeto
// default options
app.use(fileUpload());

//para actualizar ciertos datos
app.put('/upload/:tipo/:id', function(req, res) {
    //tipo nos sirve para diferencia la carpeta en la
    //que se guardara la imagen
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (Object.keys(req.files).length == 0) {
        return res.status(400)
            .json({
                ok: false,
                message: 'No se ha seleccionado ningun archivo'
            });
    }
    //Validar tipo para unicamente imagenes de productos y usuarios
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos ' + tiposValidos.join(', ')
            }
        });
    }

    //si viene un archivo cae dentro
    //de req.files.archivo
    let archivo = req.files.archivo;

    //obtener extension
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    //console.log(extension);
    //extensiones permtidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ')
            }
        });
    }

    //Cambiar el nombre al archivo
    //se construira con el ID ya que el id es unica
    //es conveniente agregarle algo para prevenir el cache
    //
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        //aqui la imagen ya se cargo
        //se valida si el usuario existe
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

        // res.json({
        //     ok: true,
        //     message: 'El archivo se subio correctamente'
        // });
    });
});

///res lo manda como referencia para poder mandar la solicitud
function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            //se tiene que borrar la imagen ya que si se subió
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }
        //tenemos que verificar que la ruta en donde se guarda
        //la imagen exista y si existe borrarla para la nueva img
        borraArchivo(usuarioDB.img, 'usuarios');
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            //se tiene que borrar la imagen ya que si se subió
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }
        //tenemos que verificar que la ruta en donde se guarda
        //la imagen exista y si existe borrarla para la nueva img
        borraArchivo(productoDB.img, 'productos');
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

function borraArchivo(nombreImagen, tipo) {

    //path.resolve(); se necesita crear un path en especifico
    //para eso suponemos la ruta en la que puede estar la imagen
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    //es sincrona fs.existsSync()
    //exist con callbacks
    //fs.existsSync(pathImagen) regresa true o false
    if (fs.existsSync(pathImagen)) {
        //se borra el path y archivos de filesystem
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;