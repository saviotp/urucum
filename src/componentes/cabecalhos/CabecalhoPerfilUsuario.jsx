import CabecalhoGeral from "./CabecalhoGeral";
import { useLocation } from "react-router-dom";

export default function CabecalhoPerfilUsuario(props) {
  const localizacao = useLocation();
  const estaNaPaginaInicial = localizacao.pathname === '/';

  const titulo = estaNaPaginaInicial
    ? "Página Inicial"
    : (props.artista?.nomeArtistico || props.artista?.nomeCompleto);

  return (
    <CabecalhoGeral
      titulo={titulo}
      mostrarBotaoPaginaInicial={!estaNaPaginaInicial}
      mostrarBotaoCriarPerfil={true}
    />
  );
}