
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Business = new Schema({
    cnpj:{
        type: String,
        required: true
    },
    razao_social:{
        type: String,
        required: true
    },
    nome_fantasia:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    telefone:{
        type: String,
        required: false
    },
    descricao:{
        type: String,
        required: false
    },
    website:{
        type: String,
        required: false
    },
    foto_Perfil:{
        type: Buffer,
        required: false
    },
    imagem1:{
        type: Buffer,
        required: false
    },
    imagem2:{
        type: Buffer,
        required: false
    },
    imagem3:{
        type: Buffer,
        required: false
    },
    endereco:{
        rua:{
            type: String,
            required: false
        },
        bairro:{
            type: String,
            required: false
        },
        cidade:{
            type: String,
            required: false
        },
        uf:{
            type: String,
            required: false
        },
        cep:{
            type: String,
            required: true
        }
    },
    senha:{
        type: String,
        required: true
    }
})

mongoose.model("Usuario_Empresa", Business)