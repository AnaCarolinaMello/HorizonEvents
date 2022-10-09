let chk = document.querySelector("#showPassword")
chk.addEventListener('change', changeVisibilitySenha)

function changeVisibilitySenha() {
    let passwordField = document.getElementById("senha")
    let senha2 = document.getElementById('senha2')
    let confirmPasswordField = document.getElementById('confirme_senha')
    if(passwordField.type === "password" || confirmPasswordField.type === "password" || senha2.type == "password"){
        passwordField.type = "text"
        senha2.type = "text"
        confirmPasswordField.type = "text"
    }else{
        passwordField.type = "password"
        senha2.type = "password"
        confirmPasswordField.type = "password"
    }
}
let cadastrado = document.querySelector("#confirm")
cadastrado.addEventListener('click',timer)

function timer(){
    setTimeout(()=>{
        document.getElementById("erro").style.display = "none"
        console.log("funciona")
    },5000)
}

var telefone = document.getElementById("telefone")
telefone.addEventListener('keyup',maskTelefone)
function maskTelefone() {
    if(event.keyCode != 8){
        if(telefone.value.length == 1 && telefone.value == "("){
            telefone.value = ""
        }else if(telefone.value.length == 1){
            telefone.value = "("+telefone.value
        }else if(telefone.value.length == 3){ 
            telefone.value = telefone.value.substr(0,3)+")"
        }else if(telefone.value.length == 9){
            telefone.value+= "-"
        }
        
    }else{
        if(telefone.value.length == 2){
            telefone.value.length = telefone.value.lenght -3
        }else if(telefone.value.length == 4){ 
            telefone.value.length = telefone.value.lenght -3
        }else if(telefone.value.length == 10){
            telefone.value.length = telefone.value.lenght -3
        }
    }
}