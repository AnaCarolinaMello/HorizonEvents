<<<<<<< HEAD
<<<<<<< HEAD

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


// route.get("/userPerfilImagem/:id", async (req,res)=>{
//     var id = req.params.id
//     await User_Cliente.findById({_id:id}).then((user)=>{
//         res.render("user/areaDoUsuario",{
//             title: user.nome,
//             style: "teste.css",
//             email: user.email,
//             usuario: user.user_name,
//             _id: user._id
//         })
//     })
// })


module.exports = route
=======

=======
>>>>>>> ab5f889 (New commit)
const express = require('express');
const route = express.Router()

route.get("/",  (req, res) => {
    res.render("home/index")
})


route.get("/user/Signup", (req,res)=>{
    res.render("user/cadastroUsuario",{
        title: "Cadastro",
        style: "cadastroUsuario.css",
        script: "userSignup.js"
    })
})

route.get("/user/Login", (req,res)=>{
    res.render("user/loginUsuario",{
        title: "Entrar",
        style: "loginUsuario.css",
        script: "userLogin.js"
    })
})

route.get("/user/cadastroUsuario", (req,res)=>{
    res.redirect("/user/Login")
})


route.get("/business/Signup", (req,res)=>{
    res.render("business/businessSignup",{
        title: "Entrar",
        style: "cadastroEmpresa.css",
        script: "businessSignup.js"
    })
})

<<<<<<< HEAD
module.exports = route
>>>>>>> 4e72a74 (Ana)
=======
route.get('/business/Login',(req,res)=>{
    res.render("business/businessLogin",{
        title: "Login",
        style: "businessLogin.css",
        script: "businessLogin.js"
    })
})

module.exports = route
>>>>>>> ab5f889 (New commit)
