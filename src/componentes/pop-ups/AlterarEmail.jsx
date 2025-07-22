import { useState } from "react";
import { auth, database } from "../Firebase.jsx";
import { ref, get, set, remove } from "firebase/database";
import { pegarUsuarioAtual, loginUsuario } from "../contextos/Auth.jsx";
import { signInWithEmailAndPassword, updateEmail, sendEmailVerification } from "firebase/auth";
import { contador } from "../classes/UsuarioUtils.jsx";
import "../../estilos/PopUps.css";

export default function AlterarEmail(props) {
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const quandoEnviar = async (event) => {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    // Validações básicas
    if (!novoEmail || !senhaAtual) {
      setErro("Por favor, preencha todos os campos!");
      setCarregando(false);
      return;
    }

    if (!novoEmail.includes("@")) {
      setErro("Por favor, insira um email válido!");
      setCarregando(false);
      return;
    }

    try {
      const usuarioAtual = pegarUsuarioAtual();
      if (!usuarioAtual || !usuarioAtual.email) {
        setErro("Erro: Usuário não encontrado.");
        setCarregando(false);
        return;
      }

      // Reautentica o usuário antes de alterar o email
      await signInWithEmailAndPassword(auth, usuarioAtual.email, senhaAtual);

      // Atualiza o email no Firebase Auth
      await updateEmail(auth.currentUser, novoEmail);

      // Envia email de verificação para o novo email
      await sendEmailVerification(auth.currentUser);

      // Atualizar o email nos dados do usuário no banco de dados
      const emailAtualKey = usuarioAtual.email.replace(/[^a-zA-Z0-9]/g, '_');
      const novoEmailKey = novoEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const usuarioAtualRef = ref(database, `usuarios/${emailAtualKey}`);
      const novoEmailRef = ref(database, `usuarios/${novoEmailKey}`);
      const usuarioSnapshot = await get(usuarioAtualRef);

      if (!usuarioSnapshot.exists()) {
        setErro("Erro: Dados do usuário não encontrados.");
        setCarregando(false);
        return;
      }

      const dadosUsuario = usuarioSnapshot.val();
      const dadosAtualizados = {
        ...dadosUsuario,
        email: novoEmail,
        uniqueId: dadosUsuario.uniqueId
      };

      await set(novoEmailRef, dadosAtualizados);
      await remove(usuarioAtualRef);

      loginUsuario({
        email: novoEmail,
        nomeCompleto: dadosUsuario.nomeCompleto,
        nomeArtistico: dadosUsuario.nomeArtistico,
        miniBiografia: dadosUsuario.miniBiografia,
        countryCode: dadosUsuario.countryCode || "+55",
        whatsappNumber: dadosUsuario.whatsappNumber || "",
        instagram: dadosUsuario.instagram,
        tags: dadosUsuario.tags,
        imagemPerfil: dadosUsuario.imagemPerfil,
        uniqueId: dadosUsuario.uniqueId
      });

      alert("Email alterado com sucesso! Verifique seu novo email antes de usar o login.");
      props.fechar();
      setNovoEmail("");
      setSenhaAtual("");
    } catch (error) {
      console.error("Erro ao alterar email:", error);
      setErro("Erro ao alterar email. Verifique se o novo email é válido.");
    }

    setCarregando(false);
  };

  return (props.clicado ? (
    <div className="popup">
      <div className="popup-content">
          <h2>Alterar Email</h2>
          <form className="popup-form" onSubmit={quandoEnviar}>
            {erro && <div className="texto-vermelho">{erro}</div>}
            <input 
              type="email" 
              placeholder="Novo Email" 
              maxLength={64}
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              disabled={carregando}
            />
            <p className="texto-limite">Tamanho máximo de 64 caracteres ({contador(novoEmail, 64)} restantes)</p>
            <input 
              type="password" 
              placeholder="Senha Atual" 
              maxLength={32}
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              disabled={carregando}
            />
            <div className="botoes-popup">
              <button type="submit" disabled={carregando}>
                {carregando ? "SALVANDO..." : "SALVAR"}
              </button>
              <button className="botao-cancelar" type="button" onClick={props.fechar}>CANCELAR</button>
            </div>
          </form>
      </div>
    </div>
  ) : "Pop-Up não está ativo");
}