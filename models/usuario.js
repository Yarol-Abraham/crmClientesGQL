const mongoose = require("mongoose");

const UsuarioSchema = mongoose.Schema({

    nombre:{
        type: String,
        trim: true,
        required: true
    },

    apellido:{
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

    password: {
        type: String,
        trim: true,
        required: true
    },

    creado: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model("Usuario", UsuarioSchema);