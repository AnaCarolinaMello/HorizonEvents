
const express = require('express');
const app = express()
const path = require('path')

app.engine('html', require('ejs').renderFile);

exports.loginUser = (req,res)=>{
    res.render('../views/cadastroUsuario.html')
}

