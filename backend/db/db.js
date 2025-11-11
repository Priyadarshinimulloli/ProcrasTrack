const mysql = require('mysql2');
const dotenv = require('dotenv')

dotenv.config({silent:true});

const db=mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});

db.connect((err)=>{
    if(err){
        console.log("Database connection failed:", err);
    } else {
        console.log("MYSQL connected.....");
    }
});

module.exports = db;