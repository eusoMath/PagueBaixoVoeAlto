const botao = document.getElementById("mudar");
var numero = 1;

function agregar(){
    numero++;
}

function visualizar(){
    if (numero % 2 === 0){
        document.getElementById("FormLogin").style.display= "none";
        document.getElementById("FormRegister").style.display= "inline";
        document.getElementById("mudar").textContent = "Login"
        document.getElementById("mensagemRegistro").textContent = "Já possui registro?"
        document.getElementById("mensagem2Registro").textContent = "Faça login em nosso site!"
    } else {
        document.getElementById("FormLogin").style.display= "inline";
        document.getElementById("FormRegister").style.display= "none";
        document.getElementById("mudar").textContent = "Registrar"
        document.getElementById("mensagemRegistro").textContent = "Não possui registro?"
        document.getElementById("mensagem2Registro").textContent = "Registre-se no nosso site e tenha acesso aos voos mais baratos do mercado!"
    }
}