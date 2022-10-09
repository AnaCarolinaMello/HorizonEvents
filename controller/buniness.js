const express = require('express');
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

cadastro = async(req,res)=>{
    console.log(req.body)
    res.send(req.body)
}

module.exports = cadastro