const mysql = require('mysql');
require('dotenv').config();

var connective = mysql.createConnection({
    port:process.env.DB_PORT,
    host:process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME

});
connective.connect((err) =>{
    if(!err){
        console.log("CONNECTED");
    }
    else{
        console.log(err);
    }
});
module.exports = connective;