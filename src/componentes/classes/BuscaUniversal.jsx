import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "../Firebase";
import { useParams } from "react-router-dom";
import VisualizarItem from "../classes/VisualizarItem";
import VisualizarObra from "../pop-ups/VisualizarObra/VisualizarObra";

// Hook universal para buscar obra ou coleção pelo id
function useBuscaUniversal(tipo, id) {
  const [item, setItem] = useState(null);
  const [artista, setArtista] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscar = async () => {
      try {
        setCarregando(true);
        setErro(null);

        if (!id) {
          setErro("ID não encontrado na URL");
          setCarregando(false);
          return;
        }

        const usuariosRef = ref(database, 'usuarios');
        const snapshot = await get(usuariosRef);

        if (snapshot.exists()) {
          const dadosUsuarios = snapshot.val();
          let encontrado = null;
          let artistaEncontrado = null;

          Object.values(dadosUsuarios).forEach(usuario => {
            if (tipo === "obra" && usuario.obras && Array.isArray(usuario.obras)) {
              const obraUsuario = usuario.obras.find(obra => String(obra.id).trim() === String(id).trim());
              if (obraUsuario) {
                encontrado = obraUsuario;
                artistaEncontrado = usuario;
              }
            }
            if (tipo === "colecao" && usuario.colecoes && Array.isArray(usuario.colecoes)) {
              const colecaoUsuario = usuario.colecoes.find(colecao => String(colecao.id).trim() === String(id).trim());
              if (colecaoUsuario) {
                encontrado = colecaoUsuario;
                artistaEncontrado = usuario;
              }
            }
          });

          if (encontrado && artistaEncontrado) {
            setItem(encontrado);
            setArtista(artistaEncontrado);
          } else {
            setErro(tipo === "obra" ? "Obra não encontrada" : "Coleção não encontrada");
          }
        } else {
          setErro("Nenhum usuário encontrado no banco de dados");
        }
      } catch (error) {
        setErro("Erro ao buscar " + tipo);
      } finally {
        setCarregando(false);
      }
    };
    buscar();
  }, [tipo, id]);

  return { item, artista, carregando, erro };
}

export default useBuscaUniversal;

export function BuscarColecaoPorId() {
  const { id } = useParams();
  const [colecao, setColecao] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarColecao() {
      const usuariosRef = ref(database, 'usuarios');
      const snapshot = await get(usuariosRef);
      if (snapshot.exists()) {
        const usuarios = snapshot.val();
        let encontrada = null;
        Object.values(usuarios).forEach(usuario => {
          usuario.colecoes?.forEach(c => {
          });
          const achada = usuario.colecoes?.find(c => String(c.id).trim() === String(id).trim());
          if (achada) encontrada = achada;
        });
        setColecao(encontrada);
      }
      setLoading(false);
    }
    buscarColecao();
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (!colecao) return <div>Coleção não encontrada</div>;

  return (
    <VisualizarItem
      item={colecao}
      tipo="colecao"
      clicado={true}
      fechar={() => {}}
    />
  );
}

// Componente para rota /obra/:id
export function VisualizarObraPorId() {
  const { id } = useParams();
  return (
    <VisualizarObra obraId={id} clicado={true} fechar={() => {}} />
  );
}

