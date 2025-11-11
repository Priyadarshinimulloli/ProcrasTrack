const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db/db.js');

dotenv.config({silent:true});
const app = express();
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Backend is running....")
})
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    console.log(results);
    res.json(results);
  });
});

app.post('/signup',(req,res)=>{
  const {username,email,password,occupation}=req.body;
  const sql="INSERT INTO users(user_name, user_email, user_password, occupation) VALUES(?,?,?,?)";
  db.query(sql,[username,email,password,occupation],(err,result)=>{
    if(err){
      console.log(err);
      return res.status(500).json({error:err});
    }
    res.status(201).json({message:"User created successfully"});
  });
});

app.post('/login',(req,res)=>{
  const {email,password}=req.body;
  const sql="SELECT * FROM users WHERE user_email=? and user_password=?";
  db.query(sql,[email,password],(err,result)=>{
    if(err){
      console.log(err);
      return res.status(500).json({error:err});
    }
    if(result.length==0){
      return  res.status(401).json({message:"Invalid credentials"});
    }
    res.json({message:"Login successful"});
  });

});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})