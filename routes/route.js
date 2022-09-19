
const express = require('express');
const route = express.Router()
const { cadastroUser } = require("../controller/cadastroUserController");
const main = require("../controller/main")
const mongoose = require("mongoose")
require("../models/User")
const User_Cliente = mongoose.model("Usuario_Cliente")

route.get("/",  (req, res) => {
    res.render("home/index")
})

route.get("/userSignup", (req,res)=>{
    res.render("user/cadastroUsuario",{
        title: "Cadastro",
        style: "cadastroUsuario.css",
        script: "cadastroUsuario.js"
    })
})

route.get("/userLogin", (req,res)=>{
    res.render("user/loginUsuario",{
        title: "Entrar",
        style: "loginUsuario.css"
    })
})

route.post("/userLogin", (req,res)=>{
    res.render("user/loginUsuario",{
        title: "Entrar",
        style: "loginUsuario.css"
    })
})

route.get("/user/cadastroUsuario", (req,res)=>{
    res.redirect("/userLogin")
})

route.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/userSignup")
})

//Rota para se o usuário tentar entrar direto na área de usuários
route.get("/userPerfil", (req,res)=>{

    res.redirect("/userSignup")
})

route.get("/userLoginPerfil", (req,res)=>{

    res.redirect("/userLogin")
})

route.get("/userEdit/:id", (req,res)=>{

    res.render("user/editarUsuario",{
        title: "Editar usuário",
        style: "editarUsuario.css"
    })
})

module.exports = route
