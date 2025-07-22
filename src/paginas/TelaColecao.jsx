import { useParams, useNavigate } from "react-router-dom";
import VisualizarColecao from "../componentes/pop-ups/VisualizarColecao/VisualizarColecao";
import CabecalhoGeral from "../componentes/cabecalhos/CabecalhoImagem/CabecalhoImagem";
import useBuscaUniversal from "../componentes/classes/BuscaUniversal";

export default function TelaColecao() {
  const { colecaoId } = useParams();
  const navegar = useNavigate();

  const { item: colecao, artista, carregando, erro } = useBuscaUniversal("colecao", colecaoId);

  const voltarParaPerfilArtista = () => {
    if (artista) {
      navegar(`/perfil-artista/${artista.nomeArtistico || artista.nomeCompleto}`);
    } else {
      navegar("/");
    }
  };

  if (carregando) {
    return (
      <div>
        <CabecalhoGeral titulo="Carregando coleção..." />
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <p>Carregando coleção...</p>
        </main>
      </div>
    );
  }

  if (erro) {
    return (
      <div>
        <CabecalhoGeral titulo="Erro" />
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <p>Erro: {erro}</p>
          <button onClick={() => navegar("/")} style={{ marginTop: "1rem" }}>
            Voltar à Página Inicial
          </button>
        </main>
      </div>
    );
  }

  if (!colecao) {
    return (
      <div>
        <CabecalhoGeral titulo="Coleção não encontrada" />
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <p>Coleção não encontrada</p>
          <button onClick={() => navegar("/")} style={{ marginTop: "1rem" }}>
            Voltar à Página Inicial
          </button>
        </main>
      </div>
    );
  }

  return (
    <div>
      <CabecalhoGeral titulo={colecao.titulo} />
      <main>
        <VisualizarColecao
          clicado={true}
          itemParaVisualizar={colecao}
          fechar={voltarParaPerfilArtista}
        />
      </main>
    </div>
  );
}
