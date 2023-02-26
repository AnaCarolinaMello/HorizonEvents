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
=======
const mysql = require("mysql");
const express = require('express');
const app = express()
const {engine} = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require('path')
const port = 8080;
const route = require("./routes/route") 
const session = require('express-session')
const flash = require('connect-flash')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const passport = require('passport')
require("./config/auth")(passport)
const multer = require('multer');
require('dotenv/config');
const localStorage = require('localStorage');
const cookieParser = require("cookie-parser");
const oneDay = 1000 * 60 * 60 * 24
const sessionStorage = require('sessionstorage-for-nodejs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const cors = require('cors');
const { search } = require("./routes/route");

app.use("/",route)

app.engine('handlebars',engine());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static('/public'))

//Middleware que é usado para manter o usuário logado
if(!session.user){
    app.use(session({
        secret: "Algo",
        saveUninitialized:true,
        cookie: { maxAge: oneDay },
        resave: true,
        rolling: true
    }))
    
}
app.use(cookieParser());

app.use(cors())

// //Inicianização do passport para autentificação
// app.use(passport.initialize())
// //Inicianização do passport para uma sessão
// app.use(passport.session())

//Inicianização do flash
app.use(flash()) 

// Criação de variáveis globais para serem usadas no flash
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_mgs")
    res.locals.error_msg = req.flash("error_mgs")
    res.locals.warning_msg = req.flash("warning_mgs")
    next();
}) 

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "HorizonEvents"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Conectado");
  });


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

// //Requisição do arquivo com modelo da collection
// require("./models/User")
// //Passando para uma variável o modelo da collection
// const User_Cliente = mongoose.model("Usuario_Cliente")

app.post("/user/Signup", async (req,res)=>{

    // Array para mensagens de erros
    var erros = []
    // Variável para verificação de email
    var arroba = "@"
    // Variável para verificação de email
    var com = ".com"

    let format = /[a-zA-Z]/

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
        erros.push({texto:"Senha precisa conter 8 caracteres no mínimo"})
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
        var email = `SELECT* FROM Usuario_Cliente WHERE Email='${req.body.email}'`
        var username = `SELECT* FROM Usuario_Cliente WHERE User_Name='${req.body.username}'`
        con.query(email, async function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            if(result.length > 0){
                
                erros.push({texto:"Email já cadastrado"})
                con.query(username, async function (err, resultado, fields) {
                    if(resultado.length > 0){
                        erros.push({texto:"Nome de usuário já cadastrado"})
                        res.render("user/cadastroUsuario",{
                            title: "Cadastro",
                            style: "cadastrousuario.css",
                            erros: erros,
                            nome_erro: req.body.nome,
                            telefone_erro: req.body.telefone,
                            script: "userSignup.js"
                        })
                    }else{
                        res.render("user/cadastroUsuario",{
                            title: "Cadastro",
                            style: "cadastrousuario.css",
                            erros: erros,
                            nome_erro: req.body.nome,
                            telefone_erro: req.body.telefone,
                            username_erro: req.body.username,
                            script: "userSignup.js"
                        })
                    }
                })      
            }else{
                con.query(username, async function (err, resultado, fields) {
                    if(resultado.length > 0){
                        erros.push({texto:"Nome de usuário já cadastrado"})
                        res.render("user/cadastroUsuario",{
                            title: "Cadastro",
                            style: "cadastrousuario.css",
                            erros: erros,
                            nome_erro: req.body.nome,
                            telefone_erro: req.body.telefone,
                            email_erro: req.body.email,
                            script: "userSignup.js"
                        })
                    }else{
                        if(req.body.telefone){
                            if(format.test(req.body.telefone)){
                                erros.push({texto:"Telefone inválido"})
                                res.render("user/cadastroUsuario",{
                                    title: "Cadastro",
                                    style: "cadastrousuario.css",
                                    erros: erros,
                                    nome_erro: req.body.nome,
                                    username_erro: req.body.username,
                                    email_erro: req.body.email,
                                    script: "userSignup.js"
                                })
                            }else if(req.body.telefone<14){
                                erros.push({texto:"Telefone inválido"})
                                res.render("user/cadastroUsuario",{
                                    title: "Cadastro",
                                    style: "cadastrousuario.css",
                                    erros: erros,
                                    nome_erro: req.body.nome,
                                    username_erro: req.body.username,
                                    email_erro: req.body.email,
                                    script: "userSignup.js"
                                })
                            }
                        }else{
                            const salt =await bcrypt.genSaltSync(10)
                            const senha = await req.body.senha
                            let senhaFinal = bcrypt.hashSync(senha, salt)
                            var sql = `INSERT INTO Usuario_Cliente (Nome, User_Name,Email,Telefone,Foto_Perfil,Senha) VALUES ('${req.body.nome}','${req.body.username}','${req.body.email}','${req.body.telefone}','/imgNative/profile.jpg','${senhaFinal}')`;
                            const sessao=req.session;
                            sessao.user = req.body.email
                            con.query(sql, function (err, result) {
                                if (err) throw err;
                                console.log("Usuário adicionado com sucesso");
                            });
                            req.flash("success_mgs","Usuário Cadastrado com sucesso, recarrege a página para esta mensagem desparecer")
                            res.redirect("/user/Perfil")
                        }
                    }
                })
            }
        });    
    }else{
        res.render("user/cadastroUsuario",{
            title: "Cadastro",
            style: "cadastrousuario.css",
            erros: erros,
            script: "userSignup.js",
            nome_erro: req.body.nome,
            telefone_erro: req.body.telefone,
            username_erro: req.body.username,
            email_erro: req.body.email
        })
    }
})

// //Tentativa de dar um upload em imagens no banco de dados
app.post("/user/upload/:id", upload.single('foto'), async(req,res,result)=>{
    var id = req.params.id
    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]+/;

    if(format.test(req.file.originalname)){

        await unlinkAsync(`public/img/${req.file.originalname}`)
        req.flash("error_mgs","Imagem fora do padrão permitido, ela não deve conter caracteres especiais e espaços, recarrege a página para esta mensagem desparecer")
        console.log("Imagem fora do padrão permitido")
        res.redirect("/user/Perfil")
  
    } else {
        var user = `UPDATE Usuario_Cliente SET Foto_Perfil= '/img/${req.file.originalname}' WHERE Id='${id}'`
        con.query(user, function (err, result) {
            if (err) throw err;
            if(result.length = 0){
            req.flash("error_mgs","Erro ao atualizar foto de perfil, recarrege a página para esta mensagem desparecer")
            console.log("Erro ao salvar imagem")
            res.redirect("/user/Perfil")
            }else{
                req.flash("success_mgs","Foto de perfil atualizada, recarrege a página para esta mensagem desparecer")
                console.log("Imagem salva com sucesso")
                res.redirect("/user/Perfil")
            }
      });
        
    }
})

app.get("/user/Perfil", async (req,res)=>{
    localStorage.removeItem("search")
    let erros = []
    let dados = []
    let email = req.session.user
    if(email != null){
    let user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    con.query(user, function (err, result) {
        let fav = `SELECT* FROM Favoritos WHERE Usuario_Id =${result[0].Id}`
        con.query(fav, async (err,favorito)=>{
            if(favorito.length == 0){
                res.render("user/areaDoUsuario",{
                    title: result[0].User_Name,
                    style: "areaDoUsuario.css",
                    email: email,
                    usuario: result[0].User_Name,
                    _id: result[0].Id,
                    fotoPerfil:  result[0].Foto_Perfil,
                    script: 'userPerfil.js',
                    dados: dados
                })
            }else{
                favorito.forEach((value)=>{
                    let business = `SELECT Id,Foto_Perfil,Nome_Fantasia,Rua,Numero FROM Empresa WHERE Id = ${value.Empresa_Id}`
                    con.query(business, (err,getEmpresa)=>{
                        getEmpresa.forEach((element)=>{
                            dados.push({foto: element.Foto_Perfil, nome: element.Nome_Fantasia, rua: element.Rua, numero: element.Numero, id: element.Id})
                        })
                    })
                })
                await res.render("user/areaDoUsuario",{
                    title: result[0].User_Name,
                    style: "areaDoUsuario.css",
                    email: email,
                    usuario: result[0].User_Name,
                    _id: result[0].Id,
                    fotoPerfil:  result[0].Foto_Perfil,
                    script: 'userPerfil.js',
                    dados: dados
                })
            }
        })
    })
    }else{
        erros.push({texto:"Erro insperado, entre novamente mais tarde"})
        res.render("user/loginUsuario",{
            title: "Entrar",
            style: "loginUsuario.css",
            erros: erros,
            script: 'userLogin.js'
        })
    }
})

// //Rota de autentificação do login
app.post("/user/Login", async(req,res,next)=>{
    var erros = []
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${req.body.email}'`
    con.query(user, async function (err, result, fields) {
        if(result.length > 0){
            const sessao=req.session;
            sessao.user = req.body.email
            let senha = await bcrypt.compare(req.body.senha, result[0].Senha)
            if(senha){
                res.redirect('/user/Perfil')
            }else{
                erros.push({texto:"Senha incorreta"})
                res.render("user/loginUsuario",{
                    title: "Entrar",
                    style: "loginUsuario.css",
                    erros: erros,
                    emailErro: result[0].Email,
                    script: 'userLogin.js'
                })
            }
        }else{
            erros.push({texto:"Essa conta não existe"})
            res.render("user/loginUsuario",{
                title: "Entrar",
                style: "loginUsuario.css",
                erros: erros,
                script: 'userLogin.js'
        })
    }
});
})
    

app.get("/user/Edit", async(req,res)=>{

    let email = req.session.user
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    if(email){
        con.query(user, function (err, result) {
            if (err) throw err;
            let telefone
            if(result[0].Telefone == undefined){
                telefone = ""
            }else{
                telefone = result[0].Telefone
            }
            res.render("user/editarUsuario",{
                title: "Editar Perfil",
                style: "editarUsuario.css",
                telefone: telefone,
                user_name: result[0].User_Name,
                nome: result[0].Nome,
                _id: result[0].Id,
                script: "userEdit.js"
            })
          });
    }else{
        res.redirect('/user/Signup')//Mudar para index depois
    }
})
app.post("/user/Edit", async(req,res)=>{

    // Array para mensagens de erros
    var erros = []
    let nome
    let username
    let telefone
    let senha
    let userTester = []
    let teste = 0
    let format = /[a-zA-Z]/

    if(req.body.senha != req.body.confirme_senha){

        erros.push({texto:"Senhas incompatíveis"})
    }

    let email = req.session.user
    var user = `SELECT* FROM Usuario_Cliente WHERE Email='${email}'`
    let testeUser = `SELECT* FROM Usuario_Cliente`
            con.query(testeUser, function (err, result) {
                if (err) throw err;
                console.log('teste')
                result.forEach(value => {
                 userTester.push(value.User_Name)

            });
            con.query(user, async function (err, result) {
                if (err) throw err;
                if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
                    nome = undefined
                }else{
                    if(result[0].Nome == req.body.nome){
                        nome = undefined
                    }else{
                        nome = req.body.nome
                    }
                }
                if(!req.body.username || typeof req.body.username == undefined || req.body.username == null){
                    username = undefined
                }else{
                    console.log(userTester)
                    userTester.forEach((value)=>{
                        //console.log("entrou foreach")
                        console.log(value)
                        if(value == req.body.username){
                            if(result[0].User_Name == req.body.username){
                                username = undefined
                            }else{
                                erros.push({texto:"Usuário já existente"})
                                console.log("erro")
                            }
                        }else{
                            if(result[0].User_Name == req.body.username){
                                username = undefined
                            }else{
                                username = req.body.username
                            }
                        }
                    })
                }
                if(!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null){
                    if(result[0].Telefone == undefined){
                        telefone = undefined
                    }else{
                        telefone = undefined
                    }
                }else{
                    if(result[0].Telefone == req.body.telefone){
                        telefone = undefined
                        teste = 1

                    }if(format.test(req.body.telefone)){

                        erros.push({texto:"Telefone inválido"})

                    }else if(req.body.telefone<14){

                        erros.push({texto:"Telefone inválido"})

                    }else{
                        telefone = req.body.telefone
                    }
                }
                if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null || !req.body.confirme_senha || typeof req.body.confirme_senha == undefined || req.body.confirme_senha == null){
                    if(result[0].Senha == undefined){
                        erros.push({texto:"Erro ao atualizar dados, tente novamente mais tarde"})
                    }else{
                        senha = undefined
                    }
                }else{
                    let senhaConferir = await bcrypt.compare(req.body.senha_ant, result[0].Senha)
                    if(senhaConferir){
                        if(req.body.senha.length > 32){
                            erros.push({texto:"Senha precisa conter menos de 32 caracteres"})
                    
                        //Verificação se a variável tem mais de 8 caractere
                        }else if(req.body.senha.length < 8){
                            erros.push({texto:"Senha precisa conter 8 caracteres no mínimo"})
                        }else{
                            const salt =await bcrypt.genSaltSync(10)
                            const senhaHash = await req.body.senha
                            senha = bcrypt.hashSync(senhaHash, salt)
                        }
                    }else{
                        erros.push({texto:"Senha antiga incorreta"})
                    }
                }
                if(erros.length == 0){
                    if(nome !== undefined){
                        let nomeUpdate = `UPDATE Usuario_Cliente SET Nome = '${nome}' WHERE Email='${email}'`
                        con.query(nomeUpdate, function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " Nome updated ");
                        });
                    }
                    if(telefone != undefined){
                        let telefoneUpdate = `UPDATE Usuario_Cliente SET Telefone = '${telefone}' WHERE Email='${email}'`
                        con.query(telefoneUpdate, function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " Telefone updated");
                        });
                    }
                    if(senha != undefined){
                        let senhaUpdate = `UPDATE Usuario_Cliente SET Senha = '${senha}' WHERE Email='${email}'`
                        con.query(senhaUpdate, function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " Senha updated");
                        });
                    }
                    if(username !== undefined){
                        let userNameUpdate = `UPDATE Usuario_Cliente SET User_Name = '${username}' WHERE Email='${email}'`
                        con.query(userNameUpdate, function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " User_Name updated");
                        });
                    }
                    if(senha == undefined && telefone == undefined && nome == undefined && username == undefined){
                        console.log("Nenhum dado alterado")
                        req.flash("warning_mgs","Nenhum dado alterado, recarrege essa página para essa mensagem despararecer")
                    }
                
                    if(senha != undefined || telefone != undefined || nome != undefined || username != undefined){
                        console.log("Dados alterados")
                        if(teste == 1){
                            req.flash("warning_mgs","Nenhum dado alterado, recarrege essa página para essa mensagem despararecer")
                        }else{
                            req.flash("success_mgs","Dados alterados com sucesso, recarrege essa página para essa mensagem despararecer")
                        }
                    }
                    
                    res.redirect('/user/Perfil')
                }else{
                    res.render("user/editarUsuario",{
                        title: "Editar Perfil",
                        style: "editarUsuario.css",
                        erros: erros,
                        nome: req.body.nome,
                        user_name: req.body.username,
                        telefone: req.body.telefone,
                        script: "userEdit.js"
                    })
                }
        
            });
        })
    
})

app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/user/Login")//Mudar para index depois
})

app.get('/search', async (req, res)=> {
    let erros = []
        if(req.query.search){
            let search = `SELECT Id,Foto_Perfil,Nome_Fantasia,Rua,Numero FROM Empresa WHERE Nome_Fantasia LIKE "%${req.query.search}%"`
            con.query(search,(err,result)=>{
                if(result.length > 0){
                    localStorage.setItem("search",req.query.search)
                    let enviar = []
                    let email = req.session.user
                    if(!email){
                        localStorage.removeItem("search")
                        req.flash("error_mgs","Erro insperado, entre novamente mais tarde, recarrege a página para esta mensagem desparecer")
                        res.redirect('/user/login')
                    }else{
                        let user = `SELECT Id from Usuario_Cliente WHERE Email = '${email}'`
                        con.query(user,async (err,resultado)=>{
                            if(resultado.length > 0){
                                result.forEach((value)=>{
                                    let fav = `SELECT* FROM Favoritos WHERE Usuario_Id =${resultado[0].Id} AND Empresa_Id = ${value.Id}`
                                    con.query(fav,(err,favorito)=>{
                                        if(favorito.length > 0){
                                            enviar.push({foto: value.Foto_Perfil, nome: value.Nome_Fantasia, rua: value.Rua, numero: value.Numero, salvo: "Salvo", id: value.Id})
                                        }else{
                                            enviar.push({foto: value.Foto_Perfil, nome: value.Nome_Fantasia, rua: value.Rua, numero: value.Numero, salvar: "Salvar", id: value.Id})
                                        }
                                    })
                                })
                                await res.render("search/search",{
                                    style: "search.css",
                                    title: "Pesquisar",
                                    script: 'search.js',
                                    enviar: enviar
                                })
                            }else{
                                localStorage.removeItem("search")
                                erros.push({texto:"Erro insperado, entre novamente mais tarde"})
                                req.flash("error_mgs","Erro insperado, entre novamente mais tarde, recarrege a página para esta mensagem desparecer")
                                res.redirect('/user/login')
                            }
                        })
                    }
                
                }else{
                    res.render("search/search",{
                        style: "search.css",
                        title: "Pesquisar",
                        script: 'search.js',
                        nofound: "Nehuma empresa encontrada"
                    })
                }
            })
        }else{
            res.render("search/search",{
                style: "search.css",
                title: "Pesquisar",
                script: 'search.js'
            })
        }
    
    // con.query('SELECT User_name FROM Usuario_Cliente WHERE User_Name LIKE "%' + req.body.nome + '%"',
    // function(err, rows, fields) {
    // if (err) throw err;
    // var data = [];
    // for (i = 0; i < rows.length; i++) {
    // data.push({username: rows.User_Name});
    // }
    //         console.log(data)
    //         res.render("search/search",{
    //             data: data
    //         })
    //     });
    });

app.post('/search', (req,res)=>{
    let erros = []
    let email = req.session.user
    let searchTest = localStorage.getItem("search")
    let search = `SELECT Id,Foto_Perfil,Nome_Fantasia,Rua,Numero FROM Empresa WHERE Nome_Fantasia LIKE "%${searchTest}%"`
    con.query(search,(err,result)=>{
        let user = `SELECT Id from Usuario_Cliente WHERE Email = '${email}'`
        con.query(user,(err,resultado)=>{
            if(resultado.length > 0){
                result.forEach((value)=>{
                    let fav = `SELECT* FROM Favoritos WHERE Usuario_Id =${resultado[0].Id} AND Empresa_Id = ${value.Id}`
                    con.query(fav,(err,favorito)=>{
                        if(favorito.length > 0){
                            if(req.body.hasOwnProperty(value.Id)){
                                let del = `DELETE FROM Favoritos WHERE Usuario_Id =${resultado[0].Id} AND Empresa_Id = ${value.Id}`
                                con.query(del, (err, deletado)=>{
                                    if(deletado.length == 0){
                                        req.flash("error_mgs","Erro ao remover item dos favoritos, recarrege essa página para essa mensagem despararecer")
                                        res.redirect("/search?search="+searchTest)
                                    }else{
                                        req.flash("success_mgs","Item removido dos favoritos, recarrege essa página para essa mensagem despararecer")
                                        res.redirect("/search?search="+searchTest)
                                    }
                                })
                            }
                        }else{
                            if(req.body.hasOwnProperty(value.Id)){
                                let salve = `INSERT INTO Favoritos(Usuario_Id,Empresa_Id) VALUES (${resultado[0].Id},${value.Id})`
                                con.query(salve, (err,salvo)=>{
                                    console.log(salvo.affectedRow)
                                    if(salvo.length == 0){
                                        req.flash("error_mgs","Erro ao salvar aos favoritos, recarrege a página para esta mensagem desparecer")
                                        res.redirect("/search?search="+searchTest)
                                    }else{
                                        req.flash("success_mgs","Salvo com sucesso, recarrege a página para esta mensagem desparecer")
                                        res.redirect("/search?search="+searchTest)
                                    }
                                })
                            }
                        }
                    })
                })
            }else{
                localStorage.removeItem("search")
                req.flash("error_mgs","Erro insperado, entre novamente mais tarde, recarrege a página para esta mensagem desparecer")
                res.redirect('/user/login')
            }
        })
    })
})

app.get('/business/viewBusiness', (req,res)=>{

    let getPerfil = `SELECT* FROM Empresa WHERE Id = ${req.query.business}`
    let searchTest = localStorage.getItem("search")
    let email = req.session.user
    if(req.query.business){
        con.query(getPerfil,(err,result)=>{
            if(result.length > 0){
                let user = `SELECT Id from Usuario_Cliente WHERE Email = '${email}'`
                con.query(user,async (err,resultado)=>{
                    if(resultado.length > 0){
                        result.forEach((value)=>{
                            let fav = `SELECT* FROM Favoritos WHERE Usuario_Id =${resultado[0].Id} AND Empresa_Id = ${value.Id}`
                            con.query(fav,(err,favorito)=>{
                                if(favorito.length > 0){
                                    res.render("business/viewBusiness",{
                                        title: result[0].Nome_Fantasia,
                                        style: "viewBusiness.css",
                                        script: "businessUser.js",
                                        foto_perfil: result[0].Foto_Perfil,
                                        rua: result[0].Rua,
                                        numero: result[0].Numero,
                                        id: result[0].Id,
                                        email: result[0].Email,
                                        telefone: result[0].Telefone,
                                        salvo: "salvo"
                                    })
                                }else{
                                    res.render("business/viewBusiness",{
                                        title: result[0].Nome_Fantasia,
                                        style: "viewBusiness.css",
                                        script: "businessUser.js",
                                        foto_perfil: result[0].Foto_Perfil,
                                        rua: result[0].Rua,
                                        numero: result[0].Numero,
                                        id: result[0].Id,
                                        email: result[0].Email,
                                        telefone: result[0].Telefone,
                                        salvar: "salvar"
                                    })                                
                                }
                            })
                        })
                    }else{
                        localStorage.removeItem("search")
                        req.flash("error_mgs","Erro insperado, entre novamente mais tarde, recarrege a página para esta mensagem desparecer")
                        res.redirect('/user/login')
                    }
                })
            }else{
                req.flash("error_mgs","Erro insperado, entre novamente mais tarde, recarrege a página para esta mensagem desparecer")
                res.redirect("/search?search="+searchTest)
            }
        })
    }else{
        req.flash("error_mgs","Erro insperado, entre novamente mais tarde, recarrege a página para esta mensagem desparecer")
        res.redirect("/search?search="+searchTest)
     }
})

app.post('/business/viewBusiness', (req,res)=>{
    let salve = `SELECT Id FROM Empresa  WHERE Id = ${req.query.business}`
    let email = req.session.user
    con.query(salve,(err,result)=>{
        let user = `SELECT Id from Usuario_Cliente WHERE Email = '${email}'`
        con.query(user,(err,resultado)=>{
            if(resultado.length > 0){
                result.forEach((value)=>{
                    let fav = `SELECT* FROM Favoritos WHERE Usuario_Id =${resultado[0].Id} AND Empresa_Id = ${value.Id}`
                    con.query(fav,(err,favorito)=>{
                        if(favorito.length > 0){
                            if(req.body.hasOwnProperty(value.Id)){
                                let del = `DELETE FROM Favoritos WHERE Usuario_Id =${resultado[0].Id} AND Empresa_Id = ${value.Id}`
                                con.query(del, (err, deletado)=>{
                                    if(deletado.length == 0){
                                        req.flash("error_mgs","Erro ao remover item dos favoritos, recarrege essa página para essa mensagem despararecer")
                                        res.redirect("/business/viewBusiness?business="+value.Id)
                                    }else{
                                        req.flash("success_mgs","Item removido dos favoritos, recarrege essa página para essa mensagem despararecer")
                                        res.redirect("/business/viewBusiness?business="+value.Id)
                                    }
                                })
                            }
                        }else{
                            if(req.body.hasOwnProperty(value.Id)){
                                let salve = `INSERT INTO Favoritos(Usuario_Id,Empresa_Id) VALUES (${resultado[0].Id},${value.Id})`
                                con.query(salve, (err,salvo)=>{
                                    console.log(salvo.affectedRow)
                                    if(salvo.length == 0){
                                        req.flash("error_mgs","Erro ao salvar aos favoritos, recarrege a página para esta mensagem desparecer")
                                        res.redirect("/business/viewBusiness?business="+value.Id)
                                    }else{
                                        req.flash("success_mgs","Salvo com sucesso, recarrege a página para esta mensagem desparecer")
                                        res.redirect("/business/viewBusiness?business="+value.Id)
                                    }
                                })
                            }
                        }
                    })
                })
            }else{
                localStorage.removeItem("search")
                req.flash("error_mgs","Erro insperado, entre novamente mais tarde, recarrege a página para esta mensagem desparecer")
                res.redirect('/user/login')
            }
        })
    })
})

app.post('/business/Signup', async(req,res)=>{

    var erros =[];
    let format = /[a-zA-Z]/
    if(!req.body.nomeFantasia || typeof req.body.nomeFantasia == undefined || req.body.nomeFantasia == null){
        erros.push({texto:"Nome fantasia inválido"})
    }

    if(!req.body.razaoComercial || typeof req.body.razaoComercial == undefined || req.body.razaoComercial == null){
        erros.push({texto:"Razão comercial inválida"})
    }

    if(!req.body.cnpj || typeof req.body.cnpj == undefined || req.body.cnpj == null || req.body.cnpj.length > 18|| req.body.cnpj.length < 18 || format.test(req.body.cnpj)){
        erros.push({texto:"CNPJ inválido"})
    }

    if(!req.body.representante || typeof req.body.representante == undefined || req.body.representante == null){
        erros.push({texto:"Representante inválido"})
    }

    if(!req.body.numero || typeof req.body.numero == undefined || req.body.numero == null){
        erros.push({texto:"Número inválido"})
    }

    if(!req.body.rua || typeof req.body.rua == undefined || req.body.rua == null){
        erros.push({texto:"Rua inválida"})
    }

    if(!req.body.cep || typeof req.body.cep == undefined || req.body.cep == null || req.body.cep.length > 9 || req.body.cep.length < 9 ||  format.test(req.body.cep)){
        erros.push({texto:"CEP inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto:"Senha inválida"})

    //Verificação se a variável tem menos de 32 caracteres
    }else if(req.body.senha.length > 32){
        erros.push({texto:"Senha precisa conter menos de 32 caracteres"})

    //Verificação se a variável tem mais de 8 caractere 
    }else if(req.body.senha.length < 8){
        erros.push({texto:"Senha precisa conter 8 caracteres no mínimo"})
    }

    //Verificação se a variável é vazia
    if(!req.body.confirme_senha || typeof req.body.confirme_senha == undefined || req.body.confirme_senha == null){
        erros.push({texto:"Senha de confirmação inválida"})

    //Verificação se a senha e sua confirmação batem
    }else if(req.body.senha != req.body.confirme_senha){

        erros.push({texto:"Senhas incompatíveis"})
    }
    if(erros.length == 0){
        var cnpj = `SELECT* FROM Usuario_Cliente WHERE Email='${req.body.cnpj}'`
        var razao = `SELECT* FROM Usuario_Cliente WHERE Email='${req.body.razaoComercial}'`
        con.query(cnpj, (err, result)=>{
            if(result.length > 0){
                erros.push({texto: 'CNPJ já cadastrado'})
                con.query(razao, (err, resultado)=>{
                    if(resultado.length > 0){
                        erros.push({texto: 'Razão comercial já cadastrada'})
                        res.render("business/businessSignup",{
                            title: "Entrar",
                            style: "cadastroEmpresa.css",
                            script: "businessSignup.js",
                            erros: erros,
                            nome_erro: req.body.nomeFantasia,
                            representante_erro: req.body.representante,
                            rua_erro: req.body.rua,
                            numero_erro: req.body.numero,
                            cep_erro: req.body.cep
                        })
                    }else{
                        res.render("business/businessSignup",{
                            title: "Entrar",
                            style: "cadastroEmpresa.css",
                            script: "businessSignup.js",
                            erros: erros,
                            nome_erro: req.body.nomeFantasia,
                            representante_erro: req.body.representante,
                            rua_erro: req.body.rua,
                            numero_erro: req.body.numero,
                            cep_erro: req.body.cep,
                            razao_erro: req.body.razaoComercial
                        })
                    }
                })
            }else{
                con.query(razao, async(err, resultado)=>{
                    if(resultado.length > 0){
                        erros.push({texto: 'Razão comercial já cadastrada'})
                        res.render("business/businessSignup",{
                            title: "Entrar",
                            style: "cadastroEmpresa.css",
                            script: "businessSignup.js",
                            erros: erros,
                            nome_erro: req.body.nomeFantasia,
                            representante_erro: req.body.representante,
                            rua_erro: req.body.rua,
                            numero_erro: req.body.numero,
                            cep_erro: req.body.cep,
                            cnpj_erro: req.body.cnpj
                        })
                    }else{
                        const salt =await bcrypt.genSaltSync(10)
                        const senha = await req.body.senha
                        let senhaFinal = bcrypt.hashSync(senha, salt)
                        var insertEmpresa = `INSERT INTO Empresa (CNPJ, Razao_Comercial, Nome_Fantasia, Representante, Numero, Rua, CEP, Foto_Perfil,Senha) VALUES ('${req.body.cnpj}','${req.body.razaoComercial}','${req.body.nomeFantasia}','${req.body.representante}','${req.body.numero}','${req.body.rua}','${req.body.cep}','/imgNative/profile.jpg','${senhaFinal}')`;
                        const sessao=req.session;
                        sessao.user = req.body.cnpj;
                        con.query(insertEmpresa, function (err, result) {
                            console.log("Empresa cadastrada")
                        });
                        req.flash("success_mgs","Usuário Cadastrado com sucesso, recarrege a página para esta mensagem desparecer")
                        res.redirect('/business/Perfil')
                    }
                })
            }
        })
        
    }else{
        res.render("business/businessSignup",{
            title: "Entrar",
            style: "cadastroEmpresa.css",
            script: "businessSignup.js",
            erros: erros,
            nome_erro: req.body.nomeFantasia,
            representante_erro: req.body.representante,
            rua_erro: req.body.rua,
            numero_erro: req.body.numero,
            cep_erro: req.body.cep,
            cnpj_erro: req.body.cnpj,
            razao_erro: req.body.razaoComercial
        })
    }
    
})

app.get('/business/Perfil',(req,res)=>{
    let erros = []
    let cnpj = req.session.user
    if(cnpj != null){
    let user = `SELECT* FROM Empresa WHERE CNPJ='${cnpj}'`
    con.query(user, function (err, result) {
        if (err) throw err;
        res.render("business/businessPerfil",{
            title: "Perfil",
            style: "perfilBusiness.css",
            foto_perfil: result[0].Foto_Perfil,
            nome: result[0].Nome_Fantasia,
            razao: result[0].Razao_Comercial,
            representante: result[0].Representante,
            rua: result[0].Rua,
            title: result[0].Nome_Fantasia,
            script: "businessPerfil.js"
        })
    })
    }else{
        erros.push({texto:"Erro insperado, entre novamente mais tarde"})
        res.render("business/businessSignup",{
            title: "Entrar",
            style: "cadastroEmpresa.css",
            script: "businessSignup.js",
            erros: erros
        })
    }
})
<<<<<<< HEAD
>>>>>>> 4e72a74 (Ana)
=======


app.post("/business/Login", async(req,res,next)=>{
    var erros = []
    var user = `SELECT* FROM Empresa WHERE CNPJ='${req.body.CNPJ}'`
    con.query(user, async function (err, result, fields) {
        if(result.length > 0){
            const sessao=req.session;
            sessao.user = req.body.CNPJ
            let senha = await bcrypt.compare(req.body.senha, result[0].Senha)
            if(senha){
                res.redirect('/business/Perfil')
            }else{
                erros.push({texto:"Senha incorreta"})
                res.render("business/businessLogin",{
                    title: "Entrar",
                    style: "businessLogin.css",
                    erros: erros,
                    cnpj_erro: result[0].CNPJ,
                    script: 'businessLogin.js'
                })
            }
        }else{
            erros.push({texto:"Essa conta não existe"})
            res.render("business/businessLogin",{
                title: "Entrar",
                style: "businessLogin.css",
                erros: erros,
                script: 'businessLogin.js'
        })
    }
});
})
