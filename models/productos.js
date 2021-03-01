const mongoose = require("mongoose");

const ProductosSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true
    },
    existencias: {
        type: Number,
        trim: true,
        required: true
    },
    costo: {
        type: Number,
        trim:true,
        required: true
    },
    precio: {
        type: Number,
        trim: true,
        required: true
    },
    creado: {
        type: Date,
        default: Date.now()
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuarios'
    },
    estado: {
        type: String,
        required: true
    }
});


ProductosSchema.index({ nombre: "text" });

module.exports = mongoose.model("Producto", ProductosSchema);