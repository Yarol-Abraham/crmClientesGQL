require("dotenv").config({ path: "variables.env" })
const Usuarios = require("../models/usuario");
const Productos = require("../models/productos");
const Clientes = require("../models/clientes");
const Pedidos = require("../models/pedidos");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const crearToken = (usuario, llaveSecreta, expiracion)=>{
    const { _id, nombre, apellido, email } = usuario;
  return  jwt.sign({  _id, nombre, apellido, email }, llaveSecreta, { expiresIn: expiracion })
}
//resolvers
const resolvers = {
    Query: {
        //USUARIOS:
        obtenerUsuarioAutenticado: async (_, {}, ctx ) => {
            return ctx.usuario;
        },
        //PRODUCTOS
        obtenerProductos: async (_, { estado }, ctx) =>{
            try {
                let productos;
                if(estado){
                    productos = await Productos.find({ vendedor: ctx.usuario._id, estado, existencias: { $gt: 1 } });
                }else{
                    productos = await Productos.find({ vendedor: ctx.usuario._id });
                }
                
                return productos;
            } catch (error) {
                console.log(error);
                throw new Error("Ha ocurrido un error"); 
            }
        },
        obtenerProducto: async (_, { _id }, ctx) =>{         
            const producto = await Productos.findById(_id);
            if(producto){
                if(producto.vendedor.toString() === ctx.usuario._id){
                    return producto;    
                }else{
                    throw new Error("No tienes autorizacion"); 
                }
            }else{
                throw new Error("No existe el producto!");               
            } 
        },
        //CLIENTES
        obtenerClientes: async () =>{
            try {
                const clientes = await Clientes.find();
                return clientes;
            } catch (error) {
                console.log(error);
                throw new Error("Ha ocurrido un error"); 
            }
        },
        obtenerClientesVendedor : async (_, {}, ctx ) =>{
            try {
                const clientes = await Clientes.find({ vendedor: ctx.usuario._id });
                return clientes;
            } catch (error) {
                console.log(error);
                throw new Error("Ha ocurrido un error"); 
            }
        },
        obtenerClienteVendedor : async (_, { _id }, ctx ) =>{
            const cliente = await Clientes.findById(_id);
            if(cliente){
                if(cliente.vendedor.toString() === ctx.usuario._id ){
                    return cliente;
                }else{
                    throw new Error("No autorizado");
                }
            }else{
                throw new Error("No existe el cliente");
            }
        },
        buscarClienteVendedor : async (_, { email }, ctx ) =>{
            const cliente = await Clientes.findOne({ email });
            if(cliente){
                if(cliente.vendedor.toString() === ctx.usuario._id ){
                    return cliente;
                }else{
                    throw new Error("No autorizado");
                }
            }else{
                throw new Error("No existe el cliente");
            }
        },
        //PEDIDOS
        obtenerPedidos: async () =>{
            try {     
                const pedidos = await Pedidos.find();
                return pedidos;
            } catch (error) {
                throw new Error("Ha ocurrido un error");
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx )=>{
           try {
                const pedidos = await Pedidos.find({ vendedor: ctx.usuario._id }).populate('cliente');
                return pedidos;
           } catch (error) {
               throw new Error("Ha ocurrido un error");
           }
        },
        obtenerPedidoVendedor: async (_, { _id }, ctx ) =>{

            const pedido = await Pedidos.findById(_id);

            if(pedido){

                if(pedido.vendedor.toString() === ctx.usuario._id ){
                    return pedido;
                }else{
                    throw new Error("No autorizado");
                }

            }else{
                throw new Error("No existe el pedido");
            }
        },
      
        //TOP CLIENTES
        mejoresClientes: async (_, {}, ctx)=>{
            const clientes = await Pedidos.aggregate([
                { 
                    $match : { 
                        estado: "ACTIVO",
                        vendedor: new mongoose.Types.ObjectId(ctx.usuario._id)
                    } 
                },
                {
                    $group : {
                        _id: "$cliente",
                        total: { $sum: "$total" }
                    }
                },
                {
                    $lookup : {
                        from: "clientes",
                        localField: "_id",
                        foreignField: "_id",
                        as: "cliente"
                    }
                },
                {
                    $limit: 5
                },
                {
                    $sort: { 
                        total: -1 
                    }
                }
            ]);
            return clientes;
        },
        
        //BUSCAR PRODUCTO 
        buscarProducto: async (_, { texto }, ctx ) =>{
            const productos = await Productos.find({ $text: { $search: texto }, vendedor: ctx.usuario._id }).limit(20);
            if(productos.length > 0){
                return productos;
            }{
                throw new Error("No se encontraron resultados");
            }
        }
    },

    Mutation: {
       //USUARIOS
        nuevoUsuario: async (_, { input } )=> {
            const { email, password } = input;
            let usuario = await Usuarios.findOne({ email });
            if(usuario){
                throw new Error("El usuario ya existe");
            }else{     
                try { 
                    usuario = new Usuarios(input);
                    usuario.password  = await bcrypt.hashSync(password, 10);
                    await usuario.save();
                    return usuario;
                } catch (error) {
                    console.log(error);
                    throw new Error("Ha ocurrido un error");
                }   
            }
        },
        
        autenticacion: async (_, { input } ) =>{
            const { email, password } = input;
            const usuario = await Usuarios.findOne({ email })
            if(usuario){
                const verifyPassword = await bcrypt.compareSync(password, usuario.password);  
                if(verifyPassword){
                    return  {
                        token: crearToken(usuario, process.env.LLAVESECRETA, "24h" )
                    }
                }else{
                    throw new Error("La contraseña es incorrecta");
                }
            }else{
                throw new Error("El usuario no existe");
            }
        },
        //PRODUCTOS 
        nuevoProducto: async (_, { input }, ctx ) => {         
            try {    
                let producto = new Productos(input);
                producto.vendedor = ctx.usuario._id;
                await producto.save();
                return producto;
            } catch (error) {
                console.log(error);
                throw new Error("No existe el producto");
            }
        },
        actualizarProducto: async (_, { input, _id }, ctx) =>{       
            let producto = await Productos.findById(_id);
            if(producto){
               if(producto.vendedor.toString() === ctx.usuario,_id ){
                producto = await Productos.findOneAndUpdate({ _id }, input, { new: true });
                return "Producto Actualizado correctamente";
               }else{
                throw new Error("No Autorizado");
               }
            }else{
                throw new Error("No existe el producto");
            }     
        },
        eliminarProducto: async (_, { _id }, ctx) =>{
            const producto = await Productos.findById(_id);
            if(producto){
                try {   
                    if(producto.vendedor.toString() === ctx.usuario._id){
                        await Productos.findByIdAndDelete({ _id: producto._id.toString() });
                        return `${producto._id.toString()}`;
                    }else{
                        throw new Error("No tienes autorizacion"); 
                    }
                   
                } catch (error) {
                   throw new Error("Ha ocurrido un error");  
                }
            }else{
                throw new Error("No existe el producto");
            }
        },
        //CLIENTES
        nuevoCliente: async (_, { input }, ctx )=>{   
            const { email } = input;
            let cliente = await Usuarios.findOne({ email });
            if(cliente){
                throw new Error("El cliente ya existe");
            }else{   
                try {     
                    cliente = new Clientes(input);
                    cliente.vendedor = ctx.usuario._id;
                    await cliente.save();
                    return cliente;
                } catch (error) {
                    console.log(error);
                    throw new Error("Ha ocurrido un error");
                } 
            }   
        },
        actualizarCLiente: async (_, { input, _id }, ctx ) =>{
            let cliente = await Clientes.findById(_id);
            if(cliente){
                if(cliente.vendedor.toString() === ctx.usuario._id){
                    cliente = await Clientes.findOneAndUpdate({ _id }, input, { new: true });
                    return "Actualizado correctamente";
                }else{
                    throw new Error("No tienes autorizacion");    
                }
            }else{
                throw new Error("No existe el cliente");
            }
        },
        eliminarCliente: async (_, { _id }, ctx ) =>{
            const cliente = await Clientes.findById(_id);
            if(cliente){
                if(cliente.vendedor.toString() === ctx.usuario._id){    
                    await Clientes.findByIdAndDelete({_id : cliente._id.toString() });    
                    return `${cliente._id.toString()}`;
                }else{
                    throw new Error("No Autorizado");
                }
            }else{
                throw new Error("No existe el cliente");
            }
        },
        //PEDIDOS
        nuevoPedido: async (_, { input }, ctx ) =>{
            console.log(input);
            const cliente = await Clientes.findById(input.cliente);
            if(cliente){           
                if(cliente.vendedor.toString() === ctx.usuario._id ){

                    //restamos de los productos
                        for await ( const articulo of input.pedido ){
                            const producto = await Productos.findOne({ _id: articulo._id, vendedor: ctx.usuario._id, estado: 'ACTIVO' });
                            if(articulo.cantidad > producto.existencias){
                                throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                            }else{
                                producto.existencias = producto.existencias - articulo.cantidad;
                                await producto.save();
                            }
                        }
                        const nuevoPedido = new Pedidos(input);
                        const PedidoFactura = await Pedidos.find().sort({$natural:-1}).limit(1)

                        if(PedidoFactura.length > 0){
                            nuevoPedido.factura = PedidoFactura[0].factura + 1;
                        }else{
                            nuevoPedido.factura = 1;
                        }
                        nuevoPedido.vendedor = ctx.usuario._id;
                        await nuevoPedido.save();
                        return "Pedido creado correctamente";
                   
                }else{
                    throw new Error("No autorizado");
                }
            }else{
                throw new Error("El cliente no existe");
            }
        },
        actualizarPedido: async(_, { input, _id }, ctx )=>{
            const { cliente } = input;
            let pedido = await Pedidos.findById(_id);
            if(pedido){
                const clienteExiste = await Clientes.findById(cliente);
                if(clienteExiste){
                    if(pedido.vendedor.toString() === ctx.usuario._id && clienteExiste.vendedor._id.toString() === ctx.usuario._id){
                        for await ( const articulo of input.pedido ){
                            const producto = await Productos.findById(articulo._id);
                            if(articulo.cantidad > producto.existencias){
                                throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                            }else{  
                                const previousProducto = pedido.pedido.filter( producto => producto._id === articulo._id );
                                const agregarNuevaCantidad = producto.existencias + previousProducto[0].cantidad - articulo.cantidad;
                                producto.existencias = agregarNuevaCantidad;
                                await producto.save();
                            }    
                        }
                        const resultado = await Pedidos.findOneAndUpdate({ _id }, input, { new: true });
                        return resultado;

                    }else{
                        throw new Error("Credenciales no válidas");
                    }
                }else{
                    throw new Error("No existe el cliente");
                }
            }else{
                throw new Error("No existe el pedido");
            }

        },
        actualizarEstadoPedido : async (_, {_id, estado}, ctx )=>{
            let pedido = await Pedidos.findById(_id);
            if(pedido){
                if(pedido.vendedor.toString() === ctx.usuario._id){
                    pedido.estado = estado;
                   const resultado = await pedido.save();
                    return resultado;
                }else{
                    throw new Error("No tienes autorizacion");    
                }
            }else{
                throw new Error("El pedido no existe");
            }
        },
        eliminarPedido: async (_, { _id }, ctx ) =>{
            const pedido = await Pedidos.findById(_id);
            if(pedido){
                if(pedido.vendedor.toString() === ctx.usuario._id){  
                    await Pedidos.findByIdAndDelete({ _id : pedido._id.toString() });
                    return `${pedido._id.toString()}`;
                }else{
                    throw new Error("No Autorizado");
                }
            }else{
                throw new Error("No existe el pedido");
            }
        }
    }
}

module.exports = resolvers;