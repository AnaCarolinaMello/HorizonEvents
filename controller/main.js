<<<<<<< HEAD

const express = require('express');
const app = express()
const path = require('path')

app.engine('html', require('ejs').renderFile);

exports.loginUser = (req,res)=>{
    res.render('../views/cadastroUsuario.html')
}

=======

const express = require('express');
const app = express()
const path = require('path')

app.engine('html', require('ejs').renderFile);

exports.loginUser = (req,res)=>{
    res.render('../views/cadastroUsuario.html')
}

>>>>>>> 4e72a74 (Ana)
