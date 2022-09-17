
const mysql = require("mysql");

var config = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "HorizonEvents"
})

exports.cadastroUser = async(req,res)=>{
    let name = document.querySelector("#nome")
    let username = document.querySelector("#username")
    let email = document.querySelector("#email")
    let telefone = document.querySelector("#telefone")
    let senha = document.querySelector("#senha")
    let confirme_senha = document.querySelector("#confirme_senha")

    if(senha == confirme_senha){
        config.connect(function (err) {
            if (err) throw err;
            console.log("foi");
            let emailConfirmar = `SELECT* FROM Usuario_Cliente WHERE Email=${email}`
            let userConfirmar = `SELECT* FROM Usuario_Cliente WHERE User_Name=${username}`
            if(emailConfirmar == null){
                if(userConfirmar == null){
                    var sql = `INSERT INTO Usuario_Cliente(Nome,User_Name,Email,Telefone,Senha) VALUES ?`;
                    values = [
                        [`${name}`, `${username}`, `${email}`, `${telefone}`, `${senha}`]
                    ]
                    config.query(sql, [values], function (err, result) {
                        if (err) throw err;
                        console.log("cadastrado");
                    })
                    res.render("areaDoUsuario",{value: value})
                }else{
                    res.send(alert("Nome de usuário já cadastrado"))
                }
            }else{
                res.send(alert("Email já cadastrado"))
            }
        });
    }
    else{
        res.send(alert("Senhas inconpatíveis"))
    }
}