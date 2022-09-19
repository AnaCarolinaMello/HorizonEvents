const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
    nome:{
        type: String,
        required: true
    },
    user_name:{
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
    foto_Perfil:{
        name: String,
        data: Buffer,
        contentType: String,
        url: String,
        required: false
    },
    senha:{
        type: String,
        required: false
    }
})

mongoose.model("Usuario_Cliente", User)
