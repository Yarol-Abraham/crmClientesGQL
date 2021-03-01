const { gql } = require("apollo-server");

//Schema
const typeDefs = gql`

    # Usuario
    type usuario {
        _id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }   

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    type token {
        token: String
    }

    input AutenticacionInput {
        email: String!
        password: String!
    }

    type TopVendedores {
        total: Float
        vendedor: [usuario]
    }

    # Productos
    type producto {
        _id: ID
        nombre: String
        existencias: Int
        costo: Float
        precio: Float
        creado: String
        vendedor: ID
        estado: estadoProducto
    }

    input ProductoInput {
        nombre: String!
        existencias: Int!
        costo: Float!
        precio: Float!
        estado: estadoProducto
    }
    enum estadoProducto {
        ACTIVO
        INACTIVO
    }

    # Clientes
    type cliente {
        _id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        creado: String
        vendedor: ID
    }
    
    type Topclientes {
        total: Float,
        cliente: [cliente]
    }

    input ClienteInput {
        nombre: String!
        apellido: String!
        empresa: String!
        email: String!
        telefono: String!
    }

    # Pedidos
    type pedido {
        _id : ID
        pedido: [PedidoGrupo]
        total: Float
        iva: Int
        totalNeto: Float
        factura: Int
        cliente: cliente
        vendedor: ID
        estado: estadoPedido
        creado: String
    }

    type PedidoGrupo {
        _id: ID
        cantidad: Int
        nombre: String
    }

    input PedidoProductoInput{
        _id: ID
        cantidad: Int
        nombre: String
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float
        iva: Int
        totalNeto: Float
        cliente: ID
        estado: estadoPedido
    } 

    enum estadoPedido {
        PENDIENTE
        ACTIVO
        CANCELADO
    }

    type Query {
        # USUARIOS
        obtenerUsuarioAutenticado: usuario

        # PRODUCTOS
        obtenerProductos(estado: String) : [producto]
        obtenerProducto(_id: ID!) : producto
    
        # CLIENTES
        obtenerClientes : [cliente]
        obtenerClientesVendedor : [cliente]
        obtenerClienteVendedor(_id: ID!) : cliente

        # PEDIDOS
        obtenerPedidos : [pedido]
        obtenerPedidosVendedor : [pedido]
        obtenerPedidoVendedor(_id: ID!) : pedido

        # GRAFICAS
        mejoresClientes: [Topclientes]

        #BUSQUEDAS
        buscarProducto(texto: String!) : [producto]
        buscarClienteVendedor(email: String!) : cliente
    }

    type Mutation {
        # USUARIOS
        nuevoUsuario(input: UsuarioInput) : usuario
        autenticacion(input: AutenticacionInput): token
        
        # PRODUCTOS
        nuevoProducto(input: ProductoInput) : producto
        actualizarProducto(input: ProductoInput, _id: ID!) : String
        eliminarProducto(_id: ID!) : String 
    
        # CLIENTES
        nuevoCliente(input: ClienteInput) : cliente
        actualizarCLiente(input: ClienteInput, _id: ID! ) : String
        eliminarCliente(_id: ID!) : String

        # PEDIDOS
        nuevoPedido(input: PedidoInput) : String
        actualizarPedido(input: PedidoInput, _id: ID! ) : pedido
        actualizarEstadoPedido(_id: ID!, estado: String!) : pedido 
        eliminarPedido(_id: ID!) : String
    }

`;

module.exports = typeDefs;