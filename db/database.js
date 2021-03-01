
const mongoose = require("mongoose");

require("dotenv").config({ path: "variables.env" })

class dataBase {

    constructor(mongoose){
        this.mongoose = mongoose;
    }

    conectarDataBase(){

        this.mongoose.Promise = global.Promise;
        
        this.mongoose.connect(process.env.DATABASE_MONGO,  { 
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        this.mongoose.connection.on("error", (error)=>{
            console.log("ha ocurrido un error: " + error);
        });

        this.mongoose.connection.once("open", function () {
            console.log("base de datos conectada");
        });

    }

}

const DB = new dataBase(mongoose);

DB.conectarDataBase();