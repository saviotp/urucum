import CabecalhoGeral from "./CabecalhoGeral";
import { pegarUsuarioAtual, usuarioEstaLogado } from "../contextos/Auth.jsx";

export default function CabecalhoPaginaInicial() {
  const estaLogado = usuarioEstaLogado();
  const usuarioAtual = estaLogado ? pegarUsuarioAtual() : null;
  const temImagemPerfil = usuarioAtual && usuarioAtual.imagemPerfil;

  return (
    <CabecalhoGeral
      titulo="Página Inicial"
      mostrarBotaoSair={!!temImagemPerfil}
      mostrarBotaoCriarPerfil={!temImagemPerfil}
      imagemPerfil={temImagemPerfil ? usuarioAtual.imagemPerfil : null}
    />
  );
}