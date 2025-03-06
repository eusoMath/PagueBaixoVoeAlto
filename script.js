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

function loginUsuario() {
    const Email = document.getElementById("email").value;
    const Senha = document.getElementById("senha").value;
    firebase.auth().signInWithEmailAndPassword(Email, Senha)
        .then(response => {
            console.log("Sucesso", response);
            document.getElementById("mensagemDeErroLogin").style.color = "green";
            document.getElementById("mensagemDeErroLogin").textContent = "Login realizado com sucesso!";
        })
        .catch(error => {
            console.error("Erro ao fazer login:", error);
            let errorMessage = "Erro ao fazer login. Tente novamente.";
            switch (error.code) {
                case 'auth/invalid-credential':
                    document.getElementById("mensagemDeErroLogin").style.color = "red";
                    document.getElementById("mensagemDeErroLogin").textContent = "Credenciais inválidas";
                    break;
            }
        });
}
function criarUsuario(){
    const Email = document.getElementById("Email").value;
    const Senha = document.getElementById("Senha").value;
    firebase.auth().createUserWithEmailAndPassword(Email, Senha).then(response => {
        console.log("Sucesso ao criar usuário:", response);
        document.getElementById("mensagemDeErroRegistro").style.color = "green";
        document.getElementById("mensagemDeErroRegistro").textContent = "Conta criada com sucesso!";

    })
    .catch(error => {
        console.error("Erro ao criar usuário:", error);
        switch (error.code) {
            case 'auth/email-already-in-use':
                document.getElementById("mensagemDeErroRegistro").style.color = "red";
                document.getElementById("mensagemDeErroRegistro").textContent = "Este e-mail já está em uso.";
                break;
            case 'auth/invalid-email':
                document.getElementById("mensagemDeErroRegistro").style.color = "red";
                document.getElementById("mensagemDeErroRegistro").textContent = "E-mail inválido";
                break;
            case 'auth/weak-password':
                document.getElementById("mensagemDeErroRegistro").style.color = "red";
                document.getElementById("mensagemDeErroRegistro").textContent = "Senha muito fraca. Use uma senha com pelo menos 6 caracteres.";
                break;
        }
        alert(errorMessage);
    });
}

function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log("Login com Google bem-sucedido!", { user, token });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = error.credential;
            console.error("Erro no login com Google:", { errorCode, errorMessage, email, credential });
        });
}
function loginTwitter() {
    const provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const credential = result.credential;
            const token = credential.accessToken;
            const secret = credential.secret;
            const user = result.user;
            console.log("Login com Twitter bem-sucedido!", { user, token, secret });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = error.credential;
            console.error("Erro no login com Twitter:", { errorCode, errorMessage, email, credential });
        });
}