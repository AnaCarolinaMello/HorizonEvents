
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
        style: "cadastroUsuario.css"
    })
})

route.get("/userLogin", (req,res)=>{
    res.render("user/loginUsuario",{
        title: "Entrar",
        style: "loginUsuario.css"
    })
})

route.get("/user/cadastroUsuario", (req,res)=>{
    res.redirect("/userLogin")
})

route.get("/user/cadastroUsuario", (req,res)=>{
    res.redirect("/userLogin")
})

route.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/userSignup")
})

module.exports = route