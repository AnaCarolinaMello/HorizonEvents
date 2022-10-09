
let chk = document.querySelector("#showPassword")
chk.addEventListener('change', changeVisibilitySenha)

function changeVisibilitySenha() {
    let password = document.querySelector("#senha")
    let password2 = document.querySelector("#confirme_senha")
    if(password.type === "password" || password2.type === "password"){
        password.type = "text"
        password2.type = "text"
    }else{
        password.type = "password"
        password2.type = "password"
    }
}
var telefone = document.getElementById("telefone")
telefone.addEventListener('keyup',maskTelefone)
function maskTelefone() {
    let tel = telefone.value
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