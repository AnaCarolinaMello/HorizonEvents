const mysql = require("mysql");
const express = require('express');
const app = express()
const {engine} = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const http = require('http')
const port = 3000;
const route = require("./routes/route")
const mongoose = require('mongoose')
const handlebars = require("handlebars");
const session = require('express-session')
const flash = require('connect-flash')
const formidable = require('formidable')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const passport = require('passport')
require("./config/auth")(passport)

app.use("/",route)

app.engine('handlebars',engine());
app.set('view engine', 'handlebars');
// handlebars.registerPartial('_msg','.handlebars');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static('/public'))

//Middleware que é usado para manter o usuário logado
app.use(session({
    secret: "Algo",
    resave: true,
    saveUninitialized: true
}))

//Inicianização do passport para autentificação
app.use(passport.initialize())
//Inicianização do passport para uma sessão
app.use(passport.session())

//Inicianização do flash
app.use(flash()) 

// Criação de variáveis globais para serem usadas no flash
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_mgs")
    res.locals.error_msg = req.flash("error_mgs")
    next();
}) 

mongoose.Promise = global.Promise;
// Conexão com mongodb
mongoose.connect("mongodb://127.0.0.1:27017/horizonEvents").then(()=>{
    console.log("Conectado ao mongo")
}).catch((err)=>{
    console.log("Erro ao se conectar"+err)
})

app.listen(port, err =>{
    console.log(`http://localhost:${port}`)
});

//Requisição do arquivo com modelo da collection
require("./models/User")
//Passando para uma variável o modelo da collection
const User_Cliente = mongoose.model("Usuario_Cliente")

app.post("/userPerfil", async (req,res)=>{

    // Array para mensagens de erros
    var erros = []
    // Variável para verificação de email
    var arroba = "@"
    // Variável para verificação de email
    var com = ".com"

    //Verificação se a variável é vazia
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto:"Nome inválido"})
    }

    //Verificação se a variável é vazia
    if(!req.body.username || typeof req.body.username == undefined || req.body.username == null){
        erros.push({texto:"Nome de usuário inválido"})
    }

    //Verificação se a variável é vazia
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto:"Email inválido"})
    }

    //Verificação se a variável contém tais caracteres
    if (!req.body.email.toLowerCase().includes(arroba.toLowerCase()) || !req.body.email.toLowerCase().includes(com.toLowerCase())) {
        erros.push({texto:'Email inválido'})
    }

    //Verificação se a variável é vazia
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto:"Senha inválida"})

    //Verificação se a variável tem menos de 32 caracteres
    }else if(req.body.senha.length > 32){
        erros.push({texto:"Senha precisa conter menos de 32 caracteres"})

    //Verificação se a variável tem mais de 8 caractere
    }else if(req.body.senha.length < 8){
        erros.push({texto:"Senha precisa conter, no mínimo, 8 caracteres"})
    }

    //Verificação se a variável é vazia
    if(!req.body.confirme_senha || typeof req.body.confirme_senha == undefined || req.body.confirme_senha == null){
        erros.push({texto:"Senha de confirmação inválida"})

    //Verificação se a senha e sua confirmação batem
    }else if(req.body.senha != req.body.confirme_senha){

        erros.push({texto:"Senhas incompatíveis"})
    }

    //Verificando se existem erros
    if(erros.length == 0){
        
        let email = req.body.email
        let user_name = req.body.username
        //Verificando se já existe o email e username passados já existem no banco de dados  
        let conferirUser = User_Cliente.findOne({ "$or": [ { email: email }, { user_name: user_name} ] });
        //Código se existirem
        if(conferirUser == true){
            erros.push({texto:"Emai ou nome de usuário já existentes"})
            console.log("Emai ou nome de usuário já existentes")
            res.render("user/cadastrousuario",{
                title: "Cadastro",
                style: "cadastrousuario.css",
                erros: erros
            })
        }else{
            //Setando criação de hash(tipo criptografia que não pode ser descriptografada)
            const salt =await bcrypt.genSaltSync(10)
            const senha = await req.body.senha
            const novoUserCliente = {
                nome: req.body.nome,
                user_name: req.body.username,
                email: req.body.email,
                telefone: req.body.telefone,
                senha: bcrypt.hashSync(senha, salt)
            }
            //Criando novo usuário
            new User_Cliente(novoUserCliente).save().then(()=>{
                console.log("Novo usuário adicionado")
                req.flash("success_mgs","Usuário cadastrado com sucesso")
                res.render("user/areaDoUsuario",{
                    title: req.body.nome,
                    style: "areaDoUsuario.css",
                    email: req.body.email,
                    usuario: req.body.username
                })
            }).catch((err)=>{
                req.flash("erro_mgs","Erro ao cadastrar usuário, tente novamente mais tarde")
                console.log("Erro ao salvar usuário"+err)
                res.end()
            })
        }
    }else{
        res.render("user/cadastrousuario",{
            title: "Cadastro",
            style: "cadastrousuario.css",
            erros: erros
        })
    }
})

//Rota para se o usuário tentar entrar direto na área de usuários
app.get("/userPerfil", (req,res)=>{

    var erros = []

    erros.push({texto: "Cadastre seu usuário antes de avançar"})

    if(erros.length > 0){
        res.render("user/cadastrousuario",{
            title: "Cadastro",
            style: "cadastrousuario.css",
            erros: erros
        })
    }
})

//Tentativa de dar um upload em imagens no banco de dados
app.post("/upload", (req,res)=>{

    var form = new formidable.IncomingForm();
    form.parse(req,(err,fields, files)=>{

        let img = files.foto;
        fs.readFile(img.path , (err,data)=>{
            
            User_Cliente.create({
                foto_Perfil: data
            },
            console.log("Foto salva com sucesso"),
            (err, user)=>{
                if(err){
                    console.log("Erro ao salvar imagem "+err)
                    res.redirect("user/areaDoUsuario",{
                        style: "areaDoUsuario.css"
                    })
                }
                if(user){
                    res.redirect("user/areaDoUsuario",{
                        style: "areaDoUsuario.css",
                        fotoPerfil: data
                    })
                }
            }
            )
        })
    })
})

app.post("/userLogin", (req,res,next)=>{
    res.redirect('/userLoginPerfil')
})

//Rota de autentificação do login
app.post("/userLoginPerfil", (req,res,next)=>{
    passport.authenticate("local",{
        successRedirect: '/userPerfil',
        failureRedirect: '/userLogin',
        failureFlash: true
    })(req,res,next)
})
