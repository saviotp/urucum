import CabecalhoGeral from "./CabecalhoGeral";
import { pegarUsuarioAtual, usuarioEstaLogado } from "../classes/UsuarioUtils.jsx";

export default function CabecalhoPerfilArtista(props) {
  const usuarioAtual = pegarUsuarioAtual();
  const estaLogado = usuarioEstaLogado();

  return (
    <CabecalhoGeral
      titulo={props.artista?.nomeArtistico || props.artista?.nomeCompleto}
      mostrarBotaoPaginaInicial={true}
      mostrarBotaoSair={estaLogado}
      imagemPerfil={estaLogado ? (usuarioAtual?.imagemPerfil || "https://placehold.co/150") : null}
    />
  );
}