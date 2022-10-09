
var cep = document.getElementById("cep")
cep.addEventListener('keyup',maskCEP)
function maskCEP() {
    if(event.keyCode != 8){
        if(cep.value.length == 5){
            cep.value+= "-"
        }
    }
    

}

var cnpj = document.getElementById("cnpj")
cnpj.addEventListener('keyup',maskCNPJ)
function maskCNPJ() {
    if(event.keyCode != 8){
        if(cnpj.value.length == 2){
            cnpj.value+= "."
    
        }else if(cnpj.value.length == 6){
            cnpj.value+= "."
    
        }else if(cnpj.value.length == 10){
            cnpj.value+= "/"
    
        }else if(cnpj.value.length == 15){
            cnpj.value+= "-"
            
        }
        
    }
}

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