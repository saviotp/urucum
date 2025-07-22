import CabecalhoPaginaInicial from "../cabecalhos/CabecalhoPaginaInicial";
import "./PaginaInicial.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../Firebase.jsx";
import { ref, get, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { criarOuGarantirUniqueId, normalizarNomeParaUrl } from "../classes/UsuarioUtils.jsx";

export default function PaginaInicial() {
  const [artistas, setArtistas] = useState([]);
  const [todosArtistas, setTodosArtistas] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [pesquisaDebounced, setPesquisaDebounced] = useState("");
  const [carregando, setCarregando] = useState(true);
  const navegar = useNavigate();

  /*
    Essa parte fizemos com Copilot
    Pelo que pesquisei, o debounce é pra tela não atualizar a cada letra que o usuário coloca
    e sim esperar um tempo (300ms) após o usuário parar de digitar para atualizar a lista de artistas
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPesquisaDebounced(pesquisa);
    }, 300);

    return () => clearTimeout(timer);
  }, [pesquisa]);

  /*
    Carrega todo mundo
  */
  useEffect(() => {
    const carregarTodosArtistas = async () => {
      try {
        setCarregando(true);
        const usuariosRef = ref(database, 'usuarios');
        const snapshot = await get(usuariosRef);

        if (snapshot.exists()) {
          const usuariosData = snapshot.val();
          let artistasEncontrados = [];

          // Conta quantos artistas tem cada nome artístico ou nome completo (se não houver nome artístico)
          const nomeCount = {};
          Object.keys(usuariosData).forEach(emailKey => {
            const usuario = usuariosData[emailKey];
            const nomeBase = usuario.nomeArtistico && usuario.nomeArtistico.trim().length > 0
              ? usuario.nomeArtistico.trim().toLowerCase()
              : (usuario.nomeCompleto || "").trim().toLowerCase();
            if (nomeBase) {
              nomeCount[nomeBase] = (nomeCount[nomeBase] || 0) + 1;
            }
          });

          for (const emailKey of Object.keys(usuariosData)) {
            const usuario = usuariosData[emailKey];
            if (usuario.nomeArtistico || usuario.nomeCompleto) {
              if (!usuario.uniqueId) {
                usuario.uniqueId = await criarOuGarantirUniqueId(emailKey);
              }
              const nomeBase = usuario.nomeArtistico && usuario.nomeArtistico.trim().length > 0
                ? usuario.nomeArtistico.trim().toLowerCase()
                : (usuario.nomeCompleto || "").trim().toLowerCase();
              artistasEncontrados.push({
                id: emailKey,
                nomeArtistico: usuario.nomeArtistico || "",
                nomeCompleto: usuario.nomeCompleto || "",
                imagemPerfil: usuario.imagemPerfil || "https://placehold.co/150",
                imagemPrincipal: usuario.imagemPrincipal || "https://placehold.co/1200x700",
                miniBiografia: usuario.miniBiografia || "",
                tags: usuario.tags || [],
                email: usuario.email,
                uniqueId: usuario.uniqueId,
                nomeDuplicado: nomeCount[nomeBase] > 1,
                nomeBase
              });
            }
          }

          // Ordena alfabeticamente pelo nomeBase
          artistasEncontrados.sort((a, b) =>
            a.nomeBase.localeCompare(b.nomeBase, 'pt-BR', { sensitivity: 'base' })
          );

          setTodosArtistas(artistasEncontrados);
          setArtistas(artistasEncontrados);
        } else {
          setTodosArtistas([]);
          setArtistas([]);
        }
      } catch (error) {
        console.error("Erro ao buscar artistas:", error);
        setTodosArtistas([]);
        setArtistas([]);
      } finally {
        setCarregando(false);
      }
    };

    carregarTodosArtistas();
  }, []);

  /*
    Filtra com base na pesquisa
  */
  useEffect(() => {
    // Descobri que o trim tira espaços da frente e do final da string
    if (pesquisaDebounced.trim() === "") {
      setArtistas(todosArtistas);
    } else {
      const artistasFiltrados = todosArtistas.filter(artista => {
        const pesquisaLower = pesquisaDebounced.toLowerCase().trim();
        
        // Dividir a pesquisa em palavras individuais
        const palavrasPesquisa = pesquisaLower.split(/\s+/).filter(palavra => palavra.length > 0);
        
        // Busca por nome artístico
        const nomeMatch = palavrasPesquisa.every(palavra => 
          artista.nomeArtistico.toLowerCase().includes(palavra)
        );

        // Busca por nome completo
        const nomeCompletoMatch = artista.nomeCompleto && palavrasPesquisa.every(palavra => 
          artista.nomeCompleto.toLowerCase().includes(palavra)
        );
        
        // Busca por tags - apenas correspondência exata
        const tagMatch = palavrasPesquisa.some(palavra => 
          artista.tags.some(tag => tag.toLowerCase() === palavra)
        );

        return nomeMatch || nomeCompletoMatch || tagMatch;
      });
      
      setArtistas(artistasFiltrados);
    }
  }, [pesquisaDebounced, todosArtistas]);
  
  return (
    <>
      <CabecalhoPaginaInicial />
      <div className="container">
        <main className="main">
          <div className="menu">
            <h2>Conecte-se com artistas e suas histórias</h2>
            <input
              className="barra-de-pesquisa"
              type="text"
              placeholder="Pesquisar por nome ou tag"
              value={pesquisa}
              onChange={evento => setPesquisa(evento.target.value)}
              maxLength={64}
            />
          </div>

          <div className="galeria-artistas">
            {carregando ? (
              <p className="carregando">Carregando artistas...</p>
            ) : artistas.length === 0 ? (
              <p className="nao-existe">
                {pesquisaDebounced.trim() !== "" ? `Nenhum artista encontrado para "${pesquisaDebounced}".` : "Nenhum artista encontrado."}
              </p>
            ) : (
              artistas.map((artista, index) => {
                // Nome para exibir e para URL
                const nomeParaExibir = artista.nomeArtistico && artista.nomeArtistico.trim().length > 0
                  ? artista.nomeArtistico
                  : artista.nomeCompleto;
                // Use encodeURIComponent para suportar alfabetos não latinos
                const nomeParaURL = encodeURIComponent(
                  artista.nomeArtistico && artista.nomeArtistico.trim().length > 0
                    ? artista.nomeArtistico
                    : artista.nomeCompleto
                );
                const usarUniqueId = !artista.nomeArtistico && artista.nomeDuplicado;

                return (
                  <div key={index} className="cartinha-artista" onClick={() => {
                    if (usarUniqueId && artista.uniqueId) {
                      navegar(`/perfil-artista/${nomeParaURL}-${artista.uniqueId}`);
                    } else {
                      navegar(`/perfil-artista/${nomeParaURL}`);
                    }
                  }}>
                    <img src={artista.imagemPrincipal} alt={`Obra principal de ${nomeParaExibir}`} />
                    <div className="foto-perfil-artista">
                      <img src={artista.imagemPerfil} alt={nomeParaExibir} />
                    </div>
                    <p className="nome-artista">{nomeParaExibir}</p>
                    {artista.tags && artista.tags.length > 0 && (
                      <div className="tags-artista">
                        {artista.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="tag-item">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </>
  );
}