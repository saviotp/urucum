import { useState } from "react";
import { auth } from "../Firebase.jsx";
import { pegarUsuarioAtual } from "../contextos/Auth.jsx";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { contador } from "../classes/UsuarioUtils.jsx";
import "../../estilos/PopUps.css";

export default function AlterarSenha(props) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const quandoEnviar = async (event) => {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    // Validações básicas
    if (!senhaAtual || !novaSenha) {
      setErro("Por favor, preencha todos os campos!");
      setCarregando(false);
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres!");
      setCarregando(false);
      return;
    }

    if (senhaAtual === novaSenha) {
      setErro("A nova senha deve ser diferente da atual!");
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

      // Reautentica o usuário
      const userCredential = await signInWithEmailAndPassword(auth, usuarioAtual.email, senhaAtual);

      // Atualiza a senha no Firebase Auth
      await updatePassword(userCredential.user, novaSenha);

      alert("Senha alterada com sucesso!");
      props.fechar();
      setSenhaAtual("");
      setNovaSenha("");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setErro("Senha atual incorreta ou sessão expirada. Faça login novamente.");
    }

    setCarregando(false);
  };

  return (props.clicado ? (
    <div className="popup">
      <div className="popup-content">
        <h2>Alterar Senha</h2>
        <form className="popup-form" onSubmit={quandoEnviar}>
          {erro && <div className="texto-vermelho">{erro}</div>}
          <input 
            type="password" 
            placeholder="Senha Atual" 
            maxLength={32}
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            disabled={carregando}
          />
          <p className="texto-limite">Tamanho máximo de 32 caracteres ({contador(senhaAtual, 32)} restantes)</p>
          <input 
            type="password" 
            placeholder="Nova Senha" 
            maxLength={32}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            disabled={carregando}
          />
          <p className="texto-limite">Tamanho máximo de 32 caracteres ({contador(novaSenha, 32)} restantes)</p>
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