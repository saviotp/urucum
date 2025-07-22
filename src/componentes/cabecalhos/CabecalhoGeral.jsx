import CabecalhoImagem from "./CabecalhoImagem/CabecalhoImagem";
import { useNavigate } from "react-router-dom";
import { Deslogar, pegarUsuarioAtual, gerarLinkPerfilUsuario } from "../classes/UsuarioUtils.jsx";
import { database } from "../Firebase.jsx";
import { ref, get } from "firebase/database";
import "../../estilos/CabecalhoGeral.css";

export default function CabecalhoGeral({
  titulo,
  mostrarBotaoPaginaInicial = false,
  mostrarBotaoSair = false,
  mostrarBotaoCriarPerfil = false, 
  imagemPerfil,
}) {
  const navegar = useNavigate();

  const irParaPaginaInicial = () => {
    navegar("/");
  };

  const sairConta = () => {
    Deslogar();
    navegar("/login");
  };

  const irParaPerfil = async () => {
    const usuarioAtual = pegarUsuarioAtual();
    if (!usuarioAtual || !usuarioAtual.email) return;

    const usuariosRef = ref(database, 'usuarios');
    const snapshot = await get(usuariosRef);
    if (!snapshot.exists()) return;

    const dadosUsuarios = snapshot.val();
    // Encontrar o usuário logado pelo email
    const usuarioLogado = Object.values(dadosUsuarios).find(
      (u) => u.email === usuarioAtual.email
    );
    if (!usuarioLogado) return;

    // Verifica se há mais de um usuário com o mesmo nomeArtistico
    const nomeArtistico = usuarioLogado.nomeArtistico;
    const repetidos = Object.values(dadosUsuarios).filter(
      (u) => u.nomeArtistico === nomeArtistico
    );

    let url;
    if (repetidos.length > 1) {
      // Se houver repetidos, usa nomeArtistico + uniqueId
      url = gerarLinkPerfilUsuario(nomeArtistico, usuarioLogado.uniqueId);
    } else {
      // Se for único, usa só nomeArtistico
      url = gerarLinkPerfilUsuario(nomeArtistico);
    }
    if (url) {
      navegar(url);
    }
  };

  const irParaCadastro = () => navegar("/cadastro");

  return (
    <CabecalhoImagem>
      <h1>{titulo}</h1>
      <div className="botaoPerfil">
        {mostrarBotaoPaginaInicial && (
          <button onClick={irParaPaginaInicial}>Página Inicial</button>
        )}
        {mostrarBotaoCriarPerfil && (
          <button onClick={irParaCadastro}>Criar Perfil</button>
        )}
        {mostrarBotaoSair && (
          <button className="deslogar" onClick={sairConta}>Sair da Conta</button>
        )}
        {imagemPerfil && (
          <div className="fotoPerfil" onClick={irParaPerfil}>
            <img src={imagemPerfil} alt="Foto de perfil" />
          </div>
        )}
      </div>
    </CabecalhoImagem>
  );
}