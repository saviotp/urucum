import CabecalhoPaginaInicial from "../cabecalhos/CabecalhoPaginaInicial";
import "./PaginaInicial.css";

import { useState, useEffect } from "react";

export default function PaginaInicial() {
  const [artistas, setArtistas] = useState([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {

    const procurarArtistas = async () => {

      const apiURL = `https://rickandmortyapi.com/api/character/?name=${pesquisa}`

      try {
        const resposta = await fetch(apiURL);

        if (!resposta.ok) {
          if (resposta.status === 404) {
            setArtistas([]);
          } else {
            console.error("Erro ao buscar artista:", resposta.status);
          }
        } else {
          const dados = await resposta.json();
          setArtistas(dados.results);
        }
      }
      catch (erro) {
        console.error("Erro ao buscar artistas:", erro);
      }
    };

    procurarArtistas();
  }, [pesquisa]);
  
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
            {artistas.length === 0 ? (
              <p className="nao-existe">Nenhum artista encontrado.</p>
            ) : (
              artistas.map((artista, index) => (
                <div key={index} className="cartinha-artista" onClick={() => {

                  /* 
                    Também não sabia desse window.location.href,
                    ele puxa o nome do artista e coloca na URL da página, assim cada artista vai ter uma página comn o link do seu nome
                    vou só trocar pra ID (caso não tenha sido implementado)
                  */

                  window.location.href = `/perfil-artista?name=${artista.name}`;
                }}>
                  <img src={artista.image} alt={artista.name} />
                  <div className="foto-perfil-artista">
                    <img src={artista.image} alt={artista.name} />
                  </div>
                  <p className="nome-artista">{artista.name}</p>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
