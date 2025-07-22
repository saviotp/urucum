import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { database, auth } from "./Firebase";
import { ref, get, set } from "firebase/database";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { loginUsuario } from "./contextos/Auth.jsx";
import { usuarioEstaLogado } from "./classes/UsuarioUtils.jsx";
import { criarOuGarantirUniqueId } from "./classes/UsuarioUtils.jsx";

import Cabecalho from "./cabecalhos/CabecalhoImagem/CabecalhoImagem.jsx";
import "../estilos/Formulario.css";

export default function Login() {
  const navegar = useNavigate();
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  /*
    Aqui, a gente checa se o usuário está logado
  */
  useEffect(() => {
    if (usuarioEstaLogado()) {
      navegar("/");
    }
  }, [navegar]);

  const quandoEnviar = async (event) => {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos!");
      setCarregando(false);
      return;
    }

    try {
      // Autentica o usuário com Firebase Auth
      await signInWithEmailAndPassword(auth, email, senha);

      /*
        Aqui a gente converte o email praquele formato lá que eu falei em um código anterior
        Mas repetindo, basicamente esse .replace muda os caracteres do email que são especiais para underline
      */
      const emailKey = email.replace(/[^a-zA-Z0-9]/g, '_');

      /*
        A referencia do usuario no firebase (seu id) vai ser seu email
      */
      const usuariosRef = ref(database, `usuarios/${emailKey}`);
      
      // Get user data from Firebase
      const snapshot = await get(usuariosRef);

      /*
        Como explicado no slide, o snapshot é um "print" do banco de dados antes de qualquer alteração
        Se o usuário existir, snapshot.exists() será true e podemos acessar os dados do usuário
      */
      if (snapshot.exists()) {
        const dadosUsuario = snapshot.val();

        // Garante que o usuário tenha uniqueId
        let uniqueId = dadosUsuario.uniqueId;
        if (!uniqueId) {
          uniqueId = await criarOuGarantirUniqueId(emailKey);
          await set(usuariosRef, { ...dadosUsuario, uniqueId });
        }

        loginUsuario({
          email: dadosUsuario.email,
          nomeCompleto: dadosUsuario.nomeCompleto,
          nomeArtistico: dadosUsuario.nomeArtistico,
          miniBiografia: dadosUsuario.miniBiografia,
          countryCode: dadosUsuario.countryCode || "+55",
          whatsappNumber: dadosUsuario.whatsappNumber || "",
          instagram: dadosUsuario.instagram,
          tags: dadosUsuario.tags,
          imagemPerfil: dadosUsuario.imagemPerfil,
          uniqueId // adiciona uniqueId ao objeto logado
        });

        /*
          E depois vai pra home
        */
        navegar("/");
      } else {
        setErro("Email ou senha incorretos!");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErro("Email ou senha incorretos!");
    }
    
    setCarregando(false);
  };

  const quandoCadastro = (event) => {
    event.preventDefault();
    navegar("/cadastro");
  };

  // Handler para login com Google
  const quandoGoogle = async (event) => {
    event.preventDefault();
    setCarregando(true);
    setErro("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Converte email para chave
      const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_');
      const usuariosRef = ref(database, `usuarios/${emailKey}`);
      const snapshot = await get(usuariosRef);

      let dadosUsuario;
      if (snapshot.exists()) {
        dadosUsuario = snapshot.val();
        // Garante que tem uniqueId
        if (!dadosUsuario.uniqueId) {
          dadosUsuario.uniqueId = await criarOuGarantirUniqueId(emailKey);
        }
      } else {
        // Se não existe, cria um novo usuário básico
        const uniqueId = await criarOuGarantirUniqueId(emailKey);
        dadosUsuario = {
          email: user.email,
          nomeCompleto: user.displayName || "",
          nomeArtistico: "",
          miniBiografia: "",
          whatsapp: "", // corrigido
          instagram: "", // corrigido
          tags: [],
          imagemPerfil: user.photoURL || "",
          uniqueId
          // senha não é usada para Google
        };
        await set(usuariosRef, dadosUsuario);
      }

      loginUsuario({
        email: dadosUsuario.email,
        nomeCompleto: dadosUsuario.nomeCompleto,
        nomeArtistico: dadosUsuario.nomeArtistico,
        miniBiografia: dadosUsuario.miniBiografia,
        countryCode: dadosUsuario.countryCode || "+55",
        whatsappNumber: dadosUsuario.whatsappNumber || "",
        instagram: dadosUsuario.instagram,
        tags: dadosUsuario.tags,
        imagemPerfil: dadosUsuario.imagemPerfil
      });

      navegar("/");
    } catch (error) {
      setErro("Erro ao fazer login com Google.");
      console.error(error);
    }
    setCarregando(false);
  };

  return (
    <>
      <Cabecalho mostrarBotaoPaginaInicial={true} />
      <main className="container">
        <form className="form-container" onSubmit={quandoEnviar}>
          <h2>LOGIN</h2>
          {erro && <div className="texto-vermelho">{erro}</div>}
          <div className="form-inputs">
            <input 
              type="email" 
              placeholder="Email" 
              maxLength={32}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // O disabled aqui serve para desabilitar o input enquanto a requisição está sendo feita
              // Isso é útil para evitar que o usuário envie o formulário várias vezes enquanto aguarda a resposta
              // Tive que usar barrinhas porque o código reclamou das minhas chaves (??)
              disabled={carregando}
            />
            <input 
              type="password" 
              placeholder="Senha" 
              maxLength={32}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
            />
          </div>
          <button type="submit" disabled={carregando}>
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>
          <button type="button" className="google-login" onClick={quandoGoogle} disabled={carregando}>
            Entrar com Google
          </button>
          <p>Não possui um login? <a href="/cadastro" onClick={quandoCadastro}>Cadastre-se</a></p>
        </form>
      </main>
    </>
  );
}