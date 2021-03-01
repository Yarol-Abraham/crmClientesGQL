require("./db/database");
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./config/schema");
const resolvers = require("./config/resolvers");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" })

//servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>{ 
        const token = req.headers['authorization']  || "";
        if(token){
            try { 
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.LLAVESECRETA);
                return {
                    usuario
                }
            } catch (error) {
                console.log("Ha ocurrido un error inesperado nuevamente");
                console.log(error);
            }
        }
    }
});

//conectar
server.listen({ port: process.env.PORT || 4000 }).then( ( { url } ) =>{
    console.log(`servidor conectado en: ${url}`);
} )