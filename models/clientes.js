const mongoose = require("mongoose");

const ClienteSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true
    },

    apellido: {
        type: String,
        trim: true,
        required: true
    },

    empresa: {
        type: String,
        trim: true,
        required: true
    },

    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },

    telefono: {
        type: String,
        trim: true
    },

    creado: {
        type: Date,
        default: Date.now()
    },

    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Usuario"
    }

});

module.exports = mongoose.model("Cliente", ClienteSchema);