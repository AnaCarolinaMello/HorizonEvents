
// setTimeout(()=>{
//     let erro = document.querySelector(".erro")
//     erro.style.display = 'none'
// })

setTimeout(sumir(), 5000);

function sumir() {
    document.getElementById("erro").style.display = "none"
    console.log("funciona")
}

