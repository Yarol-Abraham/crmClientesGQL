const mongoose = require("mongoose");

const PedidosSchema = mongoose.Schema({

    pedido: {
        type: Array,
        required: true
    },

    total: {
        type: Number,
        required: true
    },

    iva: {
        type: Number,
        default: 0
    },

    totalNeto: {
        type: Number,
        required: true
    },

    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cliente",
        required: true
    },

    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
    },

    estado: {
        type: String,
        default: "PENDIENTE"
    },

    creado: {
        type: Date,
        default: Date.now()
    },

    factura: Number
})


module.exports = mongoose.model("Pedido", PedidosSchema);