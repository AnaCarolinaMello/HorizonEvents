let chk = document.querySelector("#showPassword")
chk.addEventListener('change', changeVisibilitySenha)

function changeVisibilitySenha() {
    let password = document.querySelector("#senha")
    if(password.type === "password"){
        password.type = "text"
    }else{
        password.type = "password"
    }
}