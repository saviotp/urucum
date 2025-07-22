import { useParams, useNavigate } from "react-router-dom";
import VisualizarObra from "../componentes/pop-ups/VisualizarObra/VisualizarObra";
import CabecalhoGeral from "../componentes/cabecalhos/CabecalhoImagem/CabecalhoImagem";
import useBuscaUniversal from "../componentes/classes/BuscaUniversal";

export default function TelaObra() {
  const { obraId } = useParams();
  const navegar = useNavigate();

  const { item: obra, artista, carregando, erro } = useBuscaUniversal("obra", obraId);

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
        <CabecalhoGeral titulo="Carregando obra..." />
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <p>Carregando obra...</p>
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

  if (!obra) {
    return (
      <div>
        <CabecalhoGeral titulo="Obra não encontrada" />
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <p>Obra não encontrada</p>
          <button onClick={() => navegar("/")} style={{ marginTop: "1rem" }}>
            Voltar à Página Inicial
          </button>
        </main>
      </div>
    );
  }

  return (
    <div>
      <CabecalhoGeral titulo={obra.nome} />
      <main>
        <VisualizarObra 
          clicado={true}
          itemParaVisualizar={obra}
          fechar={voltarParaPerfilArtista}
          denunciar={(obraId) => {
            // Implementar denúncia se necessário
            console.log("Denunciar obra:", obraId);
            alert("Funcionalidade de denúncia será implementada.");
          }}
        />
      </main>
    </div>
  );
}
