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
const multer = require('multer');
require('dotenv/config');
const localStorage = require('localStorage')

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

var storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,path.join(__dirname, '/public/img/'))
    },
    filename: (req,file,cd)=>{
        cd(null,file.originalname)
    }
})
var upload = multer({storage: storage})

app.listen(port, err =>{
    console.log(`http://localhost:${port}`)
});

//Requisição do arquivo com modelo da collection
require("./models/User")
//Passando para uma variável o modelo da collection
const User_Cliente = mongoose.model("Usuario_Cliente")

var nomeExibir
var idExibir
var emailExbir
var user_nameExibir
var imagemExibir
var telefoneExibir

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
        let conferirUser = await User_Cliente.find({ "$or": [ { email: email }, { user_name: user_name} ] });
        //Código se existirem
        if(!conferirUser == []){
            erros.push({texto:"Email ou nome de usuário já existentes"})
            console.log("Emai ou nome de usuário já existentes")
            res.render("user/cadastroUsuario",{
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
            new User_Cliente(novoUserCliente).save().then((user)=>{
                console.log("Novo usuário adicionado")
                req.flash("success_mgs","Usuário cadastrado com sucesso")
                nomeExibir = user.nome
                idExibir = user._id
                emailExbir = user.email
                user_nameExibir = user.user_name
                telefoneExibir = user.telefone
                res.render("user/areaDoUsuario",{
                    title: req.body.username,
                    style: "areaDoUsuario.css",
                    email: req.body.email,
                    usuario: req.body.username,
                    _id: user._id 
                })
            }).catch((err)=>{
                req.flash("erro_mgs","Erro ao cadastrar usuário, tente novamente mais tarde")
                console.log("Erro ao salvar usuário"+err)
                res.end()
            })
        }
    }else{
        res.render("user/cadastroUsuario",{
            title: "Cadastro",
            style: "cadastrousuario.css",
            erros: erros
        })
    }
})

//Tentativa de dar um upload em imagens no banco de dados
app.post("/upload/:id", upload.single('foto'), async(req,res,result)=>{
    var id = req.params.id
    idExibir = req.params.id
    await User_Cliente.findById({_id:id}).then((user)=>{
        if(user == []){
            console.log("Erro ao salvar imagem")
            res.redirect("/userPerfilImagem")
        }else{
            // var img = fs.readFileSync(req.file.path);
            var encode_img = req.file.filename.toString('base64');
            user.foto_Perfil.name = encode_img
            user.foto_Perfil.contentType = req.file.mimetype
            user.foto_Perfil.data = fs.readFileSync(path.join(__dirname + '/public/img/' + encode_img))
            user.foto_Perfil.url = `/img/${req.file.originalname}`
            imagemExibir = `/img/${req.file.originalname}`
            nomeExibir = user.nome
            idExibir = user._id
            emailExbir = user.email
            user_nameExibir = user.user_name
            user.save().then(()=>{
                console.log("Imagem salva com sucesso")
                res.redirect("/userPerfilImagem")
            }).catch((err)=>{
                console.log("Erro ao salvar imagem "+err)
                res.redirect("/userPerfilImagem")
            })
        }
    }).catch((err)=>{
        console.log("Erro ao salvar imagem "+err)
        res.redirect("/userPerfilImagem")
    })
})

app.get("/userPerfilImagem", async (req,res)=>{
    res.render("user/areaDoUsuario",{
        title: user_nameExibir,
        style: "areaDoUsuario.css",
        email: emailExbir,
        usuario: user_nameExibir,
        _id: idExibir,
        fotoPerfil: imagemExibir
    })
})

//Rota de autentificação do login
app.post("/userLoginPerfil", async(req,res,next)=>{
    var erros = []
    var email = req.body.email
    let usuario = await User_Cliente.find({email:email})
    
    if(usuario == []){
        erros.push({texto:"Essa conta não existe"})
        res.redirect("/userLogin")
    }else{
        bcrypt.compare(req.body.senha, usuario[0].senha, (erro, batem)=>{
            if(batem){
                nomeExibir = usuario[0].nome
                idExibir = usuario[0]._id
                emailExbir = usuario[0].email
                user_nameExibir = usuario[0].user_name
                telefoneExibir = usuario[0].telefone
                imagemExibir = usuario[0].foto_Perfil.url
                res.render("user/areaDoUsuario",{
                    title: usuario[0].user_name,
                    style: "areaDoUsuario.css",
                    email: req.body.email,
                    usuario: usuario[0].user_name,
                    _id: usuario[0]._id,
                    fotoPerfil: usuario[0].foto_Perfil.url
                })
            }else{
                erros.push({texto:"Senha incorreta"})
                res.render("user/loginUsuario",{
                    title: "Entrar",
                    style: "loginUsuario.css",
                    erros: erros
                })
            }
        })
    }

})

app.get("/userEdited", async(req,res)=>{

    await User_Cliente.findById({_id:idExibir}).then((user=>{
        res.render("user/editarUsuario",{
            title: "Editar Perfil",
            style: "editarUsuario.css",
            email: user.email,
            telefone: user.telefone,
            user_name: user.user_name,
            nome: user.nome,
            _id: user._id,
            script: "cadastroUsuario.js"
        })
    }))
})

app.post("/userEdited", async(req,res)=>{

    // Array para mensagens de erros
    var erros = []
    // Variável para verificação de email
    var arroba = "@"
    // Variável para verificação de email
    var com = ".com"

    let usuario = await User_Cliente.findById({_id: idExibir})

    //Verificação se a senha e sua confirmação batem
    if(req.body.senha != req.body.confirme_senha){

        erros.push({texto:"Senhas incompatíveis"})
    }
    console.log("teste")
    if(erros.length == 0){
        let email = req.body.email
        let user_name = req.body.username
        //Verificando se já existe o email e username passados já existem no banco de dados  
        let conferirEmail = await User_Cliente.findOne({ email: email });
        let conferirUserName = await User_Cliente.findOne({ user_name: user_name });
        //Código se existirem
        if(conferirEmail[0].email = req.body.email || conferirUserName[0] == req.body.username){
                if(req.body.senha || req.body.confirme_senha){
                    if(req.body.senha.length > 32){
                        erros.push({texto:"Senha precisa conter menos de 32 caracteres"})
                        res.render("user/editarUsuario",{
                            title: "Editar Perfil",
                            style: "editarUsuario.css",
                            erros: erros,
                            _id: usuario[0]._id,
                            nome: usuario[0].nome,
                            user_name: usuario[0].user_name,
                            email: usuario[0].email,
                            telefone: usuario[0].telefone,
                            script: "cadastroUsuario.js"
                        })
                
                    //Verificação se a variável tem mais de 8 caractere
                    }else if(req.body.senha.length < 8){
                        erros.push({texto:"Senha precisa conter, no mínimo, 8 caracteres"})
                        res.render("user/editarUsuario",{
                            title: "Editar Perfil",
                            style: "editarUsuario.css",
                            erros: erros,
                            _id: usuario[0]._id,
                            nome: usuario[0].nome,
                            user_name: usuario[0].user_name,
                            email: usuario[0].email,
                            telefone: usuario[0].telefone,
                            script: "cadastroUsuario.js"
                        })
                    }else if(req.body.senha == req.body.confirme_senha){
                        if(!req.body.senha_ant){
                            await User_Cliente.findById({_id: idExibir}).then(async(user)=>{
                                const salt =await bcrypt.genSaltSync(10)
                                const senha = await req.body.senha
                                user.senha = bcrypt.hashSync(senha, salt)
                                if(req.body.nome){
                                    user.nome = req.body.nome
                                    nomeExibir = req.body.nome
                                }
                                if(req.body.user_name){
                                    user.user_name = req.body.user_name
                                    user_nameExibir = req.body.user_name
                                }
                                if(req.body.email){
                                    if (!req.body.email.toLowerCase().includes(arroba.toLowerCase()) || !req.body.email.toLowerCase().includes(com.toLowerCase())) {
                                        erros.push({texto:'Email inválido'})
                                    }else{
                                        user.email = req.body.email
                                        emailExbir = req.body.email
                                    }
                                }
                                if(req.body.telefone){
                                    user.telefone = req.body.telefone
                                    telefoneExibir = req.body.telefone
                                }
                                user.save().then(()=>{
                                    console.log("Usuário atualizado com sucesso")
                                    res.redirect("/userPerfilImagem")
                                }).catch((err)=>{
                                    console.log("Erro ao atualizar user "+err)
                                    res.redirect("/userPerfilImagem")
                                })
                            }).catch((err)=>{
                                console.log("Erro ao atualizar usuário "+err)
                                erros.push({texto:"Erro ao atualizar usuário"})
                                res.render("user/editarUsuario",{
                                    title: "Editar Perfil",
                                    style: "editarUsuario.css",
                                    erros: erros,
                                    _id: usuario[0]._id,
                                    nome: usuario[0].nome,
                                    user_name: usuario[0].user_name,
                                    email: usuario[0].email,
                                    telefone: usuario[0].telefone,
                                    script: "cadastroUsuario.js"
                                })
                            })
                        }else{
                            erros.push({texto:"Digite sua senha antiga para atualizá-la"})
                            res.render("user/editarUsuario",{
                                title: "Editar Perfil",
                                style: "editarUsuario.css",
                                erros: erros,
                                _id: usuario[0]._id,
                                nome: usuario[0].nome,
                                user_name: usuario[0].user_name,
                                email: usuario[0].email,
                                telefone: usuario[0].telefone,
                                script: "cadastroUsuario.js"
                            })
                        }
                    }else{
                        erros.push({texto:"Senhas incompatíveis"})
                        res.render("user/editarUsuario",{
                            title: "Editar Perfil",
                            style: "editarUsuario.css",
                            erros: erros,
                            _id: usuario[0]._id,
                            nome: usuario[0].nome,
                            user_name: usuario[0].user_name,
                            email: usuario[0].email,
                            telefone: usuario[0].telefone,
                            script: "cadastroUsuario.js"
                        })
                    }
                }else{
                   await User_Cliente.findById({_id: idExibir}).then((user)=>{
                        if(req.body.nome){
                            user.nome = req.body.nome
                            nomeExibir = req.body.nome
                        }
                        if(req.body.user_name){
                            user.user_name = req.body.user_name
                            user_nameExibir = req.body.user_name
                        }
                        if(req.body.email){
                            user.email = req.body.email
                            emailExbir = req.body.email
                        }
                        if(req.body.telefone){
                            user.telefone = req.body.telefone
                            telefoneExibir = req.body.telefone
                        }
                        user.save().then(()=>{
                            console.log("Usuário atualizado com sucesso")
                            res.redirect("/userPerfilImagem")
                        }).catch((err)=>{
                            console.log("Erro ao atualizar user "+err)
                            res.redirect("/userPerfilImagem")
                        })
                   }).catch((err)=>{
                        console.log("Erro ao atualizar usuário "+err)
                        erros.push({texto:"Erro ao atualizar usuário"})
                        res.render("user/editarUsuario",{
                            title: "Editar Perfil",
                            style: "editarUsuario.css",
                            erros: erros,
                            _id: usuario[0]._id,
                            nome: usuario[0].nome,
                            user_name: usuario[0].user_name,
                            email: usuario[0].email,
                            telefone: usuario[0].telefone,
                            script: "cadastroUsuario.js"
                        })
                }) 
                }
        }else{
            if(!conferirEmail == [] && conferirUserName == []){
                erros.push({texto:"Email e nome de usuário já existentes"})
                console.log("Email e nome de usuário já existentes")
                res.render("user/editarUsuario",{
                    title: "Editar Perfil",
                    style: "editarUsuario.css",
                    erros: erros,
                    _id: usuario[0]._id,
                    nome: usuario[0].nome,
                    user_name: usuario[0].user_name,
                    email: usuario[0].email,
                    telefone: usuario[0].telefone,
                    script: "cadastroUsuario.js"
                })
            }else if(!conferirEmail == []){
                erros.push({texto:"Email já cadastrado"})
                console.log("Email já cadastrado")
                res.render("user/editarUsuario",{
                    title: "Editar Perfil",
                    style: "editarUsuario.css",
                    erros: erros,
                    _id: usuario[0]._id,
                    nome: usuario[0].nome,
                    user_name: usuario[0].user_name,
                    email: usuario[0].email,
                    telefone: usuario[0].telefone,
                    script: "cadastroUsuario.js"
                })
            }else if(!conferirUserName == []){
                erros.push({texto:"Nome de usuário já cadastrado"})
                console.log("Nome de usuário já cadastrado")
                res.render("user/editarUsuario",{
                    title: "Editar Perfil",
                    style: "editarUsuario.css",
                    erros: erros,
                    _id: usuario[0]._id,
                    nome: usuario[0].nome,
                    user_name: usuario[0].user_name,
                    email: usuario[0].email,
                    telefone: usuario[0].telefone,
                    script: "cadastroUsuario.js"
                })
            }else{
                if(req.body.senha || req.body.confirme_senha){
                    if(req.body.senha.length > 32){
                        erros.push({texto:"Senha precisa conter menos de 32 caracteres"})
                        res.render("user/editarUsuario",{
                            title: "Editar Perfil",
                            style: "editarUsuario.css",
                            erros: erros,
                            _id: usuario[0]._id,
                            nome: usuario[0].nome,
                            user_name: usuario[0].user_name,
                            email: usuario[0].email,
                            telefone: usuario[0].telefone,
                            script: "cadastroUsuario.js"
                        })
                
                    //Verificação se a variável tem mais de 8 caractere
                    }else if(req.body.senha.length < 8){
                        erros.push({texto:"Senha precisa conter, no mínimo, 8 caracteres"})
                        res.render("user/editarUsuario",{
                            title: "Editar Perfil",
                            style: "editarUsuario.css",
                            erros: erros,
                            _id: usuario[0]._id,
                            nome: usuario[0].nome,
                            user_name: usuario[0].user_name,
                            email: usuario[0].email,
                            telefone: usuario[0].telefone
                        })
                    }else if(req.body.senha == req.body.confirme_senha){
                        if(!req.body.senha_ant){
                            await User_Cliente.findById({_id: idExibir}).then(async(user)=>{
                                const salt =await bcrypt.genSaltSync(10)
                                const senha = await req.body.senha
                                user.senha = bcrypt.hashSync(senha, salt)
                                if(req.body.nome){
                                    user.nome = req.body.nome
                                    nomeExibir = req.body.nome
                                }
                                if(req.body.user_name){
                                    user.user_name = req.body.user_name
                                    user_nameExibir = req.body.user_name
                                }
                                if(req.body.email){
                                    user.email = req.body.email
                                    emailExbir = req.body.email
                                }
                                if(req.body.telefone){
                                    user.telefone = req.body.telefone
                                    telefoneExibir = req.body.telefone
                                }
                                user.save().then(()=>{
                                    console.log("Usuário atualizado com sucesso")
                                    res.redirect("/userPerfilImagem")
                                }).catch((err)=>{
                                    console.log("Erro ao atualizar user "+err)
                                    res.redirect("/userPerfilImagem")
                                })
                            }).catch((err)=>{
                                console.log("Erro ao atualizar usuário "+err)
                                erros.push({texto:"Erro ao atualizar usuário"})
                                res.render("user/editarUsuario",{
                                    title: "Editar Perfil",
                                    style: "editarUsuario.css",
                                    erros: erros,
                                    _id: usuario[0]._id,
                                    nome: usuario[0].nome,
                                    user_name: usuario[0].user_name,
                                    email: usuario[0].email,
                                    telefone: usuario[0].telefone,
                                    script: "cadastroUsuario.js"
                                })
                            })
                        }else{
                            erros.push({texto:"Digite sua senha antiga para atualizá-la"})
                            res.render("user/editarUsuario",{
                                title: "Editar Perfil",
                                style: "editarUsuario.css",
                                erros: erros,
                                _id: usuario[0]._id,
                                nome: usuario[0].nome,
                                user_name: usuario[0].user_name,
                                email: usuario[0].email,
                                telefone: usuario[0].telefone,
                                script: "cadastroUsuario.js"
                            })
                        }
                    }else{
                        erros.push({texto:"Senhas incompatíveis"})
                        res.render("user/editarUsuario",{
                            title: "Editar Perfil",
                            style: "editarUsuario.css",
                            erros: erros,
                            _id: usuario[0]._id,
                            nome: usuario[0].nome,
                            user_name: usuario[0].user_name,
                            email: usuario[0].email,
                            telefone: usuario[0].telefone,
                            script: "cadastroUsuario.js"
                        })
                    }
                }else{
                   await User_Cliente.findById({_id: idExibir}).then((user)=>{
                        if(req.body.nome){
                            user.nome = req.body.nome
                            nomeExibir = req.body.nome
                        }
                        if(req.body.user_name){
                            user.user_name = req.body.user_name
                            user_nameExibir = req.body.user_name
                        }
                        if(req.body.email){
                            user.email = req.body.email
                            emailExbir = req.body.email
                        }
                        if(req.body.telefone){
                            user.telefone = req.body.telefone
                            telefoneExibir = req.body.telefone
                        }
                        user.save().then(()=>{
                            console.log("Usuário atualizado com sucesso")
                            res.redirect("/userPerfilImagem")
                        }).catch((err)=>{
                            console.log("Erro ao atualizar user "+err)
                            res.redirect("/userPerfilImagem")
                        })
                   }).catch((err)=>{
                        console.log("Erro ao atualizar usuário "+err)
                        erros.push({texto:"Erro ao atualizar usuário"})
                        res.render("user/editarUsuario",{
                            title: "Editar Perfil",
                            style: "editarUsuario.css",
                            erros: erros,
                            _id: usuario[0]._id,
                            nome: usuario[0].nome,
                            user_name: usuario[0].user_name,
                            email: usuario[0].email,
                            telefone: usuario[0].telefone,
                            script: "cadastroUsuario.js"
                        })
                }) 
                }
                
            }
        }
    }else{
        res.render("user/editarUsuario",{
            title: "Editar Perfil",
            style: "editarUsuario.css",
            erros: erros,
            _id: usuario[0]._id,    
            nome: usuario[0].nome,
            user_name: usuario[0].user_name,
            email: usuario[0].email,
            telefone: usuario[0].telefone,
            script: "cadastroUsuario.js"
        })
    }
})
