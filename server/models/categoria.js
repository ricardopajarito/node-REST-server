const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    nombre: {
        type: String,
        unique: true,
        required: [true, 'El nombre de categoria es necesario']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

//categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

//se exporta el modelo
module.exports = mongoose.model('Categoria', categoriaSchema);