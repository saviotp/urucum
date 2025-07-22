import CabecalhoGeral from "./CabecalhoGeral";
import "../../estilos/cabecalhos/CabecalhoGeral.css";

export default function CabecalhoAdicionarColecao() {
  return (
    <CabecalhoGeral
      titulo="Adicionar Coleção"
      mostrarBotaoPaginaInicial={true}
    />
  );
}