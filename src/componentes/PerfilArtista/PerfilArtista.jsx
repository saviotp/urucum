import CabecalhoPerfilArtista from '../cabecalhos/CabecalhoPerfilArtista';
import { CiLink } from "react-icons/ci";
import { FaWhatsapp } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaPencilAlt, FaPlus } from "react-icons/fa";

import DenunciarConta from '../pop-ups/DenunciarConta/DenunciarConta';
import DeletarObra from '../pop-ups/DeletarObra';
import AdicionarObra from '../pop-ups/AdicionarObra/AdicionarObra';
import AdicionarColecao from '../pop-ups/AdicionarColecao/AdicionarColecao';
import DeletarColecao from '../pop-ups/DeletarColecao.jsx';
import VisualizarObra from '../pop-ups/VisualizarObra/VisualizarObra.jsx';
import VisualizarColecao from '../pop-ups/VisualizarColecao/VisualizarColecao.jsx';
import Compartilhar from '../classes/Compartilhar.jsx';

import { enviarImagem } from '../classes/ImagemUtils.jsx';
import { pegarUsuarioAtual, normalizarNomeParaUrl } from '../classes/UsuarioUtils.jsx';
import { validarImagem } from '../classes/ImagemUtils.jsx';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { database } from '../Firebase.jsx';
import { ref, get, update } from "firebase/database";

import './PerfilArtista.css';

export default function PerfilArtista() {
  const navegar = useNavigate();
  const { nomeArtista } = useParams(); // Pode ser nomeArtistico-hifen ou nomeArtistico-hifen-uniqueId
  
  const [artista, setArtista] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [dono, setDono] = useState(false);

  const [popup, setPopup] = useState(null);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [imagemPrincipalSelecionada, setImagemPrincipalSelecionada] = useState(null);
  const [uploadingImagemPrincipal, setUploadingImagemPrincipal] = useState(false);

  // Verifica se é dono quando artista muda
  useEffect(() => {
    if (artista) {
      const usuarioLogado = pegarUsuarioAtual();

      // Verificar por email ou por nome artístico
      const emailDono = usuarioLogado && usuarioLogado.email === artista.email;

      if (emailDono) {
        setDono(true);
      } else {
        setDono(false);
      }
    }
  }, [artista]);

  // Carregar dados do artista
  useEffect(() => {
    const carregarDadosArtista = async () => {
      try {
        setCarregando(true);
        setErro(null);

        if (!nomeArtista) {
          setErro("Nome do artista não encontrado na URL");
          return;
        }

        const usuariosRef = ref(database, 'usuarios');
        const snapshot = await get(usuariosRef);

        if (snapshot.exists()) {
          const dadosUsuarios = snapshot.val();

          // Normaliza o nome da URL
          const nomeUrl = normalizarNomeParaUrl(nomeArtista);

          // Busca artista pelo nome normalizado
          let artistaEncontrado = null;
          for (const emailKey of Object.keys(dadosUsuarios)) {
            const usuario = dadosUsuarios[emailKey];
            const nomeBanco = normalizarNomeParaUrl(
              usuario.nomeArtistico && usuario.nomeArtistico.trim().length > 0
                ? usuario.nomeArtistico
                : usuario.nomeCompleto
            );
            if (nomeBanco === nomeUrl) {
              artistaEncontrado = usuario;
              break;
            }
          }

          if (!artistaEncontrado) {
            setErro("Artista não encontrado.");
            setCarregando(false);
            return;
          }

          setArtista({
            id: artistaEncontrado.email,
            nomeArtistico: artistaEncontrado.nomeArtistico,
            nomeCompleto: artistaEncontrado.nomeCompleto,
            imagem: artistaEncontrado.imagemPerfil || "https://placehold.co/150",
            imagemPrincipal: artistaEncontrado.imagemPrincipal || "",
            bio: artistaEncontrado.miniBiografia || "Sem biografia disponível",
            tags: artistaEncontrado.tags || [],
            email: artistaEncontrado.email,
            whatsapp: artistaEncontrado.whatsapp || "",
            instagram: artistaEncontrado.instagram ? artistaEncontrado.instagram.replace(/^@/, '') : "",
            obras: artistaEncontrado.obras || [],
            colecoes: artistaEncontrado.colecoes || []
          });
          
          // Verificar se o usuário logado é o dono do perfil
          const usuarioLogado = pegarUsuarioAtual();
          
          if (usuarioLogado && usuarioLogado.email === artistaEncontrado.email) {
            setDono(true);
          } else {
            setDono(false);
          }
        } else {
          setErro("Nenhum usuário encontrado no banco de dados");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do artista:", error);
        setErro("Erro ao carregar dados do artista");
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosArtista();
  }, [nomeArtista, navegar]);

  const quandoEditarPerfil = () => {
    // Use o id do artista (emailKey ou nome) para garantir unicidade
    navegar("/editar-perfil" + `/${artista.id}`);
  };

  // Função para abrir popup de adicionar obra
  const adicionarObra = () => {
    setModoEdicao(false);
    setItemSelecionado(null);
    setPopup("adicionar-obra");
  };

  const visualizarObra = (obra) => {
    setItemSelecionado(obra);
    setPopup("visualizar-obra");
  };

  const visualizarColecao = (colecao) => {
    setItemSelecionado(colecao);
    setPopup("visualizar-colecao");
  };

  // Função para abrir popup de editar obra
  const editarObra = (obra) => {
    setModoEdicao(true);
    setItemSelecionado(obra);
    setPopup("adicionar-obra");
  };

  const deletarObra = (obra) => {
    setItemSelecionado(obra);
    setPopup("deletar-obra");
  };

  // Função para abrir popup de adicionar coleção
  const adicionarColecao = () => {
    setModoEdicao(false);
    setItemSelecionado(null);
    setPopup("adicionar-colecao");
  };

  // Função para abrir popup de editar coleção
  const editarColecao = (colecao) => {
    setModoEdicao(true);
    setItemSelecionado(colecao);
    setPopup("adicionar-colecao");
  };

  // Função para abrir popup de deletar coleção
  const deletarColecao = (colecao) => {
    setItemSelecionado(colecao);
    setPopup("deletar-colecao");
  };

  // Função para fazer upload da imagem principal
  const quandoMudarImagemPrincipal = (event) => {
    const file = event.target.files[0];
    if (file) {
      const erroValidacao = validarImagem(file, 10);
      if (erroValidacao) {
        alert(erroValidacao);
        return;
      }
      setImagemPrincipalSelecionada(file);
      uploadImagemPrincipal(file);
    }
  };

  // Função para fazer upload da imagem principal
  const uploadImagemPrincipal = async (file) => {
    if (!file || !dono) return;
    try {
      setUploadingImagemPrincipal(true);
      const emailKey = artista.email.replace(/[^a-zA-Z0-9]/g, '_');
      // Upload para Cloudinary
      const imagemUrl = await enviarImagem(file);
      // Atualizar no banco de dados
      const userRef = ref(database, 'usuarios/' + emailKey);
      await update(userRef, {
        imagemPrincipal: imagemUrl
      });
      // Atualizar o estado local
      setArtista(prev => ({
        ...prev,
        imagemPrincipal: imagemUrl
      }));
      alert('Imagem principal atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem principal:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploadingImagemPrincipal(false);
    }
  };

  // Função para clicar na área da imagem principal
  const clicarImagemPrincipal = () => {
    if (dono) {
      document.getElementById('input-imagem-principal').click();
    }
  };

  // Função para navegar diretamente para a obra
  const navegarParaObra = (obra) => {
    navegar(`/obra/${obra.id}`);
  };

  // Função para compartilhar obra
  const compartilharObra = (obra, event) => {
    event.stopPropagation(); // Impedir que o clique abra a visualização
    const { compartilharObra: funcaoCompartilhar } = Compartilhar({
      obraId: obra.id,
      titulo: obra.titulo,
      artista: artista.nomeArtistico || artista.nomeCompleto
    });
    funcaoCompartilhar();
  };

  // Função para compartilhar perfil
  const compartilharPerfil = () => {
    const { compartilharObra: funcaoCompartilhar } = Compartilhar({
      obraId: artista.nomeArtistico || artista.nomeCompleto,
      titulo: `Perfil de ${artista.nomeArtistico || artista.nomeCompleto}`,
      artista: artista.nomeArtistico || artista.nomeCompleto,
      tipo: 'perfil'
    });
    funcaoCompartilhar();
  };

  return (
    <div>
      <CabecalhoPerfilArtista artista={artista} />
      <main>
        {carregando ? (
          <div className="carregando-container">
            <p>Carregando perfil do artista...</p>
          </div>
        ) : erro ? (
          <div className="erro-container">
            <p>Erro: {erro}</p>
            <button onClick={() => navegar("/")}>
              Voltar à Página Inicial
            </button>
          </div>
        ) : artista ? (
          <>
            <div className="perfil-container">
              <div
                /*
                  Aqui é um exemplo de css dinâmico mostrado em sala de aula
                */
                className={`imagem-principal ${dono ? 'editavel' : ''}`}
                onClick={clicarImagemPrincipal}
                style={{ 
                  backgroundImage: artista.imagemPrincipal ? `url(${artista.imagemPrincipal})` : 'none',
                }}
              >
                {uploadingImagemPrincipal && (
                  <div className="enviando-imagem">
                    Enviando imagem...
                  </div>
                )}
                {!artista.imagemPrincipal && !uploadingImagemPrincipal && (
                  <div className='sem-imagem'>
                    {dono ? 'Clique para adicionar sua obra principal' : 'Nenhuma obra principal'}
                  </div>
                )}
                {dono && (
                  <input 
                    id="input-imagem-principal"
                    type="file"
                    accept="image/*"
                    onChange={quandoMudarImagemPrincipal}
                  />
                )}
              </div>

              <div className='bloco-informacoes-basicas'>
                <div className='imagem-perfil-tags'>
                  <div className='foto-perfil'>
                    <img src={artista.imagem} alt={artista.nomeArtistico} />
                  </div>
                  <div className='tags'>
                    {artista.tags.map((tag, index) => (
                      <span key={index} className='tag'>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className='bio-editar'>
                  <div className='bio'>
                    <p>{artista.bio}</p>
                  </div>
                  {dono && (
                    <button className='botao-editar' onClick={quandoEditarPerfil}>
                      Editar Perfil
                    </button>
                  )}
                </div>
              </div>
            </div>
            {dono && (
              <p className='tamanho-imagem-principal'>
                  O tamanho em pixels da imagem principal deve ser de 1200x700px
              </p>
            )}

            <div className='galeria-header'>
              <h3>Galeria</h3>
            </div>
            <div className='galeria'>
              {artista.obras && artista.obras.length > 0 ? (
                artista.obras.map((obra, index) => (
                  <div key={obra.id || index} className='obra' onClick={() => {visualizarObra(obra)}}>
                    <img src={obra.imagemUrl} alt={obra.titulo} />
                      {dono && (
                        <div className='botoes-editar-deletar'>
                          <button className='deletar' onClick={(event) => {
                            event.stopPropagation();
                            deletarObra(obra);
                          }}>X</button>
                          <button className='editar' onClick={(event) => {
                            event.stopPropagation();
                            editarObra(obra);
                          }}><FaPencilAlt /></button>
                        </div>
                      )}
                    </div>
                ))
              ) : (
                <div className='vazio'>
                  <p>{dono ? "Adicione suas primeiras obras!" : "Este artista ainda não tem obras."}</p>
                </div>
              )}
              {dono && (
                <button className='botao-adicionar' onClick={adicionarObra}>
                  <FaPlus />
                </button>
              )}
            </div>

            <div className='colecoes-header'>
              <h3>Coleções</h3>
            </div>
            <div className='colecoes'>
              {artista.colecoes && artista.colecoes.length > 0 ? (
                artista.colecoes.map((colecao, index) => (
                  <div key={colecao.id || index} className='colecao' onClick={() => {visualizarColecao(colecao)}}>
                    <img src={colecao.imagemUrl} alt={colecao.titulo} />
                    {dono && (
                      <div className='botoes-editar-deletar'>
                        <button
                          className='deletar'
                          onClick={(event) => {
                            event.stopPropagation();
                            deletarColecao(colecao);
                          }}
                        >X</button>
                        <button
                          className='editar'
                          onClick={(event) => {
                            event.stopPropagation();
                            editarColecao(colecao);
                          }}
                        ><FaPencilAlt /></button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className='vazio'>
                  <p>{dono ? "Crie suas primeiras coleções!" : "Este artista ainda não tem coleções."}</p>
                </div>
              )}
              {dono && (
                <button className='botao-adicionar' onClick={adicionarColecao}>
                  <FaPlus />
                </button>
              )}
            </div>

            <div className='contato'>
              <div className='contato-link'>
                <h4>Compartilhar Perfil</h4>
                <CiLink className='icone' onClick={compartilharPerfil} style={{ cursor: 'pointer' }} />
              </div>

              <div className='redes-sociais'>
                <h4>Contato</h4>
                {/* WhatsApp */}
                {artista.whatsapp ? (
                  <a
                    href={`https://wa.me/${artista.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir chat no WhatsApp"
                  >
                    <FaWhatsapp className='icone' />
                  </a>
                ) : (
                  <FaWhatsapp className='icone' style={{ opacity: 0.5, cursor: 'not-allowed' }} title="WhatsApp não disponível" />
                )}
                {/* Instagram */}
                {artista.instagram && artista.instagram !== "@" ? (
                  <a
                    href={`https://instagram.com/${artista.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ir para o Instagram do artista"
                  >
                    <FaInstagram className='icone' />
                  </a>
                ) : (
                  <FaInstagram className='icone' style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Instagram não disponível" />
                )}
              </div>
            </div>

            {!dono && (
              <div className='denunciar-container'>
                <button className='botao-denunciar' onClick={() => setPopup("denunciar")}>
                  DENUNCIAR ESTA CONTA
                </button>
              </div>
            )}

            {/* Popups */}
            {popup === 'denunciar' && <DenunciarConta clicado={true} fechar={() => setPopup(null)} />}
            {popup === 'deletar-obra' && <DeletarObra 
              clicado={true} 
              fechar={(obraDeletada) => {
                setPopup(null);
                // Só recarregar se uma obra foi realmente deletada
                if (obraDeletada) {
                  window.location.reload();
                }
              }}
              itemParaDeletar={itemSelecionado}
            />}
            {popup === 'adicionar-obra' && <AdicionarObra 
              clicado={true} 
              fechar={(obraModificada) => {
                setPopup(null);
                // Recarregar dados do artista após adicionar/editar obra
                if (obraModificada) {
                  window.location.reload();
                }
              }}
              modoEdicao={modoEdicao}
              itemParaEditar={itemSelecionado}
            />}
            {popup === 'deletar-colecao' && <DeletarColecao 
              clicado={true} 
              fechar={(colecaoDeletada) => {
                setPopup(null);
                // Só recarregar se uma coleção foi realmente deletada
                if (colecaoDeletada) {
                  window.location.reload();
                }
              }}
              itemParaDeletar={itemSelecionado}
            />}
            {popup === 'adicionar-colecao' && <AdicionarColecao 
              clicado={true} 
              fechar={(colecaoModificada) => {
                setPopup(null);
                // Recarregar dados do artista após adicionar/editar coleção
                if (colecaoModificada) {
                  window.location.reload();
                }
              }}
              modoEdicao={modoEdicao}
              itemParaEditar={itemSelecionado}
            />}

            {popup === 'visualizar-obra' && <VisualizarObra 
              clicado={true} 
              fechar={() => setPopup(null)} 
              itemParaVisualizar={itemSelecionado}
            />}

            {popup === 'visualizar-colecao' && <VisualizarColecao 
              clicado={true} 
              fechar={() => setPopup(null)} 
              itemParaVisualizar={itemSelecionado}
            />}
          </>
        ) : null}
      </main>
    </div>
  )
}