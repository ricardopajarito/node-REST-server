//==============================
// Entorno desarrollo o produccion
//==============================
const jwt = require('jsonwebtoken');



let verificaToken = (req, res, next) => {
    //validacion del token que se envia en los headers
    let token = req.get('token'); //o aturotizacion

    //recuperar toda la informacion directamente mediante jwt
    //decoded es el payload y se encuentra la informacion del usuario
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });

    //si pasa el token
    //console.log(token);
    // res.json({
    //     token
    // });

};

let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};


module.exports = {
    verificaToken,
    verificaAdmin_Role
}