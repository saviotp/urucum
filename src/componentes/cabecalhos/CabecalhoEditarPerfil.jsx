import CabecalhoGeral from "./CabecalhoGeral";
import { pegarUsuarioAtual } from "../contextos/Auth.jsx";

export default function CabecalhoEditarPerfil() {
  const usuarioAtual = pegarUsuarioAtual();

  return (
    <CabecalhoGeral
      titulo="Editar perfil"
      mostrarBotaoPaginaInicial={true}
      mostrarBotaoSair={true}
      imagemPerfil={usuarioAtual?.imagemPerfil || "https://placehold.co/150"}
    />
  );
}