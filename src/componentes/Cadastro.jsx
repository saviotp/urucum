import Cabecalho from "./cabecalhos/CabecalhoImagem/CabecalhoImagem.jsx";
import "../estilos/Formulario.css";

import { database, auth } from './Firebase';
import { ref, set, get } from 'firebase/database';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';

import { useNavigate } from "react-router-dom";
import { loginUsuario } from './contextos/Auth.jsx';
import { emailToKey, verificarEmailExistente } from './classes/FirebaseUtils.jsx';
import { criarOuGarantirUniqueId } from './classes/UsuarioUtils.jsx';
import { loginComGoogle } from './classes/FirebaseUtils.jsx';
import { contador } from './classes/UsuarioUtils.jsx';

export default function Cadastro() {
  const navegar = useNavigate();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeArtistico, setNomeArtistico] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  /*
    Essa parte aqui também fiz com a ajuda do Copilot
    Pra checar o email, tenho que importar os métodos do Firebase ali em cima
    aí uso eles pra pegar a referência com o query, organizo por email e comparo o email digitado pelo usuario
    se for igual, ele dá erro e não envia
  */

  async function cadastrarUsuario(event) {
    event.preventDefault();
    
    if (nomeCompleto.length < 5) {
      alert("Nome completo deve ter pelo menos 5 caracteres!");
      return;
    }
    
    /*
      Deve estar sentindo falta do nome atístico aqui ne
      mas o cara pode simplesmente não ter mesmo, aí lá em baixo eu coloco pra ele substituir pelo nome completo
    */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor, insira um email válido!");
      return;
    }

    // Check if email already exists
    const emailJaExiste = await verificarEmailExistente(database, email);
    if (emailJaExiste) {
      alert("Este email já está cadastrado! Por favor, use outro email ou faça login.");
      return;
    }
    
    
    if (senha !== confirmacaoSenha) {
      alert("As senhas não coincidem!");
      return;
    }
    
    if (senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }
    
    try {
      // Register user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

      // Envia email de verificação
      await sendEmailVerification(userCredential.user);

      // Sempre gera uniqueId usando função utilitária
      const emailKey = emailToKey(email);
      const uniqueId = await criarOuGarantirUniqueId(emailKey);

      const novoUsuario = {
        nomeCompleto: nomeCompleto,
        nomeArtistico: nomeArtistico,
        email: email,
        miniBiografia: "",
        countryCode: "+55",
        whatsappNumber: "",
        instagram: "",
        tags: [],
        imagemPerfil: "",
        timestamp: new Date().toISOString(),
        uniqueId
      };

      const usuarioRef = ref(database, 'usuarios/' + emailKey);

      await set(usuarioRef, novoUsuario);

      // Salva no localStorage/contexto com uniqueId
      loginUsuario({
        email: email,
        nomeCompleto: nomeCompleto,
        nomeArtistico: nomeArtistico,
        miniBiografia: "",
        countryCode: "+55",
        whatsappNumber: "",
        instagram: "",
        tags: [],
        imagemPerfil: "",
        uniqueId
      });

      // Redireciona para edição de perfil com nomeArtistico-uniqueId
      const nomeArtistaURL = (nomeArtistico && nomeArtistico.trim().length > 0 ? nomeArtistico : nomeCompleto).replace(/\s+/g, '-');
      navegar(`/editar-perfil/${nomeArtistaURL}-${uniqueId}`);

      alert("Cadastro realizado! Verifique seu email para ativar sua conta.");
      console.log("Usuário cadastrado com sucesso!");
      console.log("Dados do usuário:", novoUsuario, uniqueId);
      setNomeCompleto("");
      setNomeArtistico("");
      setEmail("");
      setSenha("");
      setConfirmacaoSenha("");
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      alert("Erro ao cadastrar usuário. Tente novamente.");
    }
  }

  // Função para login/cadastro com Google
  async function quandoGoogle(event) {
    event.preventDefault();
    await loginComGoogle({
      database,
      auth,
      navegar,
      criarOuGarantirUniqueId,
      loginUsuario
    });
  }

  const quandoLogin = (event) => {
    event.preventDefault();
    navegar("/login");
  };

  return (
    <>
      <Cabecalho mostrarBotaoPaginaInicial={true} />
      <main className="container">
        <form className="form-container" onSubmit={cadastrarUsuario}>
          <h2>CADASTRO</h2>
          <div className="form-inputs">
            <input type="text" placeholder="Nome Completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} maxLength={64} />
            {
              nomeCompleto.length > 0 && nomeCompleto.length < 5 && (
                <span className="error">Nome completo deve ter pelo menos 5 caracteres.</span>
              )
            }

            <input type="text" placeholder="Nome Artístico" value={nomeArtistico} onChange={(e) => setNomeArtistico(e.target.value)} maxLength={64} />

            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={32} />
            {
              email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <span className="error">Por favor, insira um email válido.</span>
              )
            }

            <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} maxLength={32} />
            {
              senha.length > 0 && senha.length < 6 && (
                <span className="error">A senha deve ter pelo menos 6 caracteres.</span>
              )
            }
            
            <input type="password" placeholder="Confirme sua senha" value={confirmacaoSenha} onChange={(e) => setConfirmacaoSenha(e.target.value)} maxLength={32} />
            {
              confirmacaoSenha.length > 0 && senha !== confirmacaoSenha && (
                <span className="error">As senhas não coincidem.</span>
              )
            }

          </div>
          <button type="submit" className="botao-cadastrar">CADASTRAR</button>
          <button type="button" className="google-login" onClick={quandoGoogle}>
            Cadastrar/Entrar com Google
          </button>
          <p>Já possui um login? <a href="/login" onClick={quandoLogin}>Faça login</a></p>
        </form>
      </main>
    </>
  );
}