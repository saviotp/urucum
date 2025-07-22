import CabecalhoEditarPerfil from '../cabecalhos/CabecalhoEditarPerfil';
import { FaWhatsapp } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";

import AlterarEmail from '../pop-ups/AlterarEmail';
import AlterarSenha from '../pop-ups/AlterarSenha';
import AdicionarTag from '../pop-ups/AdicionarTag/AdicionarTag';
import DeletarConta from '../pop-ups/DeletarConta';

import {
  pegarUsuarioAtual,
  Deslogar,
  usuarioEstaLogado,
  validarContatoUsuario,
  normalizarWhatsapp,
  normalizarInstagram,
  criarOuGarantirUniqueId,
  nomeDuplicadoNoBanco,
  removerDDIDoNumero,
  quandoClicarFora,
  deletarConta,
  formatarNumero,
  getCountryIsoFromCode,
  mudancaWhatsapp,
  salvarTags,
  validarContatos
} from '../classes/UsuarioUtils.jsx';
import { validarImagem, mostrarPreviewImagem } from '../classes/ImagemUtils.jsx';
import { contador } from '../classes/UsuarioUtils.jsx';
import { database } from '../Firebase.jsx';
import { ref, update } from 'firebase/database';
import { enviarImagem } from '../classes/ImagemUtils.jsx';

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';

/*
  Aqui, aprendi por fora como usar o css modular, que foi visto um pouquinho em sala
  mas não lembrava muito bem como aplicar

  Eu queria parte dos dois CSSs funcionando e sem afetar as outras páginas. Aí descobri
  que se usa assim, com um styles e o outro normal mesmo.
*/
import styles from './EditarPerfil.module.css';
import '../../estilos/Formulario.css';

// Lista simplificada de países/códigos (adicione mais conforme necessário)
const COUNTRY_CODES = [
  { code: "+55", name: "Brasil", flag: "br" },
  { code: "+1", name: "Estados Unidos", flag: "us" },
  { code: "+351", name: "Portugal", flag: "pt" },
  { code: "+34", name: "Espanha", flag: "es" },
  { code: "+44", name: "Reino Unido", flag: "gb" },
  { code: "+81", name: "Japão", flag: "jp" },
  { code: "+86", name: "China", flag: "cn" },
  { code: "+49", name: "Alemanha", flag: "de" },
  { code: "+33", name: "França", flag: "fr" },
  { code: "+7", name: "Rússia", flag: "ru" },
];

export default function EditarPerfil() {
  const navegar = useNavigate();
  const { nomeArtista } = useParams();

  const [popup, setPopup] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeArtistico, setNomeArtistico] = useState('');
  const [miniBiografia, setMiniBiografia] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappValido, setWhatsappValido] = useState(true);
  const [usuarioInstagram, setUsuarioInstagram] = useState('');
  const [tagsUsuario, setTagsUsuario] = useState([]);
  const [imagemPerfil, setImagemPerfil] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewImagem, setPreviewImagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [usuarioTemSenha, setUsuarioTemSenha] = useState(true);
  const [usuarioGoogle, setUsuarioGoogle] = useState(false);
  const [countryCode, setCountryCode] = useState("+55");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef(null);

  // Verificar se o usuário pode editar este perfil
  useEffect(() => {
    // Verifica login ANTES de qualquer coisa
    if (!usuarioEstaLogado()) {
      navegar("/login");
      return;
    }
    const usuarioLogado = pegarUsuarioAtual();
    if (!usuarioLogado || !usuarioLogado.email) {
      // Se não tem dados válidos, força logout e redireciona
      Deslogar();
      navegar("/login");
      return;
    }

  }, [nomeArtista, navegar]);

  useEffect(() => {
    if (!usuarioEstaLogado()) return;
    const usuarioAtual = pegarUsuarioAtual();
    if (usuarioAtual) {
      setNomeCompleto(usuarioAtual.nomeCompleto || '');
      setNomeArtistico(usuarioAtual.nomeArtistico || '');
      setMiniBiografia(usuarioAtual.miniBiografia || '');
      setCountryCode(usuarioAtual.countryCode || "+55");
      setWhatsappNumber(usuarioAtual.whatsappNumber || "");
      setUsuarioInstagram(normalizarInstagram(usuarioAtual.instagram || ''));
      setTagsUsuario(usuarioAtual.tags || []);
      setImagemPerfil(usuarioAtual.imagemPerfil || '');
      setUsuarioTemSenha(!!usuarioAtual.senha);
      setUsuarioGoogle(!usuarioAtual.senha);
    }
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handle(event) {
      quandoClicarFora(event, countryDropdownRef, () => setShowCountryDropdown(false));
    }
    if (showCountryDropdown) {
      document.addEventListener("mousedown", handle);
    }
    return () => document.removeEventListener("mousedown", handle);
  }, [showCountryDropdown]);

  /*
    Essa parte eu fiz com o Copilot
    Basicamente, pra permitir APENAS números no campo de WhatsApp, preciso fazer um checagem ANTES
    pois, aparentemente, o problema é quando o setNumeroWhatsApp é chamado com um valor que contém caracteres não numéricos, porque ele simplesmente DEIXA
  */
  /*
    A parte de imagem foi feita com o Copilot, já que não temos esse conteúdo em sala
    Fui comentando o que fui entendendo
  */
  const quandoMudarImagem = (event) => {
    mostrarPreviewImagem(event, setImagemSelecionada, setPreviewImagem, validarImagem, 10);
  };

  /*
    Quando o usuario clicar na area da imagem, vai chamar o input de arquivo
  */
  const enviarArquivo = () => {
    document.getElementById('enviar-arquivo').click();
  };

  /*
    Assim que envia o forms
  */
  const quandoEnviar = async (event) => {
    event.preventDefault();
    setEnviando(true);

    // Remover DDI duplicado do número antes de validar e salvar
    const numeroSemDDI = removerDDIDoNumero(normalizarWhatsapp(whatsappNumber), countryCode);
    const numeroCompleto = countryCode + numeroSemDDI;

    // Checagem extra para Brasil: exige exatamente 11 dígitos (2 DDD + 9 número)
    if (countryCode === "+55" && numeroSemDDI.length !== 11) {
      alert('Insira um número de WhatsApp válido para o Brasil (2 DDD + 9 dígitos).');
      setEnviando(false);
      return;
    }

    // Validação dos contatos usando função globalizada
    const { numeroValido, instagramValido } = validarContatos(
      numeroCompleto,
      countryCode,
      COUNTRY_CODES,
      isValidPhoneNumber,
      numeroSemDDI,
      usuarioInstagram,
      normalizarInstagram
    );

    if (!numeroValido) {
      alert('Insira um número de WhatsApp válido para o país selecionado.');
      setEnviando(false);
      return;
    }
    if (!instagramValido) {
      alert('Insira um usuário de Instagram válido (apenas letras, números, ponto ou underline, sem espaços).');
      setEnviando(false);
      return;
    }

    try {
      const usuarioAtual = pegarUsuarioAtual();
      if (!usuarioAtual || !usuarioAtual.email) {
        alert('Erro: Usuário não encontrado.');
        return;
      }

      const emailKey = usuarioAtual.email.replace(/[^a-zA-Z0-9]/g, '_');
      const refUsuario = ref(database, 'usuarios/' + emailKey);

      // Salve countryCode e whatsappNumber SEPARADOS
      const dadosUsuario = {
        nomeCompleto,
        nomeArtistico,
        miniBiografia,
        countryCode,
        whatsappNumber: numeroSemDDI,
        instagram: normalizarInstagram(usuarioInstagram),
        tags: tagsUsuario
      };

      /*
        Upa a imagem
      */
      if (imagemSelecionada) {
        const imagemUrl = await enviarImagem(imagemSelecionada); // usa o import
        dadosUsuario.imagemPerfil = imagemUrl;
        setImagemPerfil(imagemUrl);
        setImagemSelecionada(null);
        setPreviewImagem('');
      }

      /*
        Atualiza os dados do usuário no banco de dados
      */
      await update(refUsuario, dadosUsuario);

      // Atualizar localStorage com os novos dados
      let usuarioLogadoAtual = pegarUsuarioAtual();
      let uniqueId = usuarioLogadoAtual.uniqueId;
      if (!uniqueId) {
        const emailKey = usuarioLogadoAtual.email.replace(/[^a-zA-Z0-9]/g, '_');
        uniqueId = await criarOuGarantirUniqueId(emailKey);
        await update(refUsuario, { uniqueId });
        usuarioLogadoAtual = { ...usuarioLogadoAtual, uniqueId };
      }
      // Atualiza localStorage com countryCode e whatsappNumber, removendo whatsapp antigo
      const usuarioAtualizado = {
        ...usuarioLogadoAtual,
        ...dadosUsuario,
        uniqueId
      };
      
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));

      alert('Perfil atualizado com sucesso!');
      
      // Redirecionar para o perfil do usuário após salvar
      const nomeParaNavegacao = dadosUsuario.nomeArtistico || dadosUsuario.nomeCompleto;
      if (nomeParaNavegacao) {
        const nomeParaURL = nomeParaNavegacao.replace(/\s+/g, '-');
        const duplicado = await nomeDuplicadoNoBanco(nomeParaNavegacao);
        if (duplicado && uniqueId) {
          navegar(`/perfil-artista/${nomeParaURL}-${uniqueId}`);
        } else {
          navegar(`/perfil-artista/${nomeParaURL}`);
        }
      } else {
        navegar("/");
      }
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const countryDropdownClasses = `${styles.countryDropdown} ${showCountryDropdown ? styles.show : ''}`;

  return (
    <>
      <CabecalhoEditarPerfil />
      <main className={`container ${styles.container}`}>
        <form className={`form-container ${styles.formContainer}`} onSubmit={quandoEnviar}>
          <h2 className={styles.titulo}>Informações de Perfil</h2>

          <div className={styles.imagemContainer}>
            <div className={styles.enviarFotoPerfil} onClick={enviarArquivo} style={{ cursor: 'pointer' }}>
              <div className={styles.imagemPreviewContainer}>
                {previewImagem ? (
                  <img 
                    src={previewImagem} 
                    alt="Preview da imagem selecionada" 
                    className={styles.imagemPreview}
                  />
                ) : imagemPerfil ? (
                  <img 
                    src={imagemPerfil} 
                    alt="Foto de perfil atual" 
                    className={styles.imagemPreview}
                  />
                ) : (
                  <div className={styles.imagemVazio}>
                    <div className={styles.imagemPlaceholder}>
                      <img src="https://placehold.co/150" alt="Placeholder de perfil" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.imageControls}>
                <input 
                  id="enviar-arquivo" 
                  className="esconder-entrada-padrao" 
                  type="file" 
                  accept="image/*" 
                  onChange={quandoMudarImagem}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div className={styles.botoesAlterar}>
              {/* Só mostra se não for Google */}
              {!usuarioGoogle && (
                <button type="button" onClick={() => setPopup("email")}>ALTERAR EMAIL</button>
              )}
              {/* Só mostra se tem senha */}
              {usuarioTemSenha && (
                <button
                  type="button"
                  onClick={() => setPopup("senha")}
                >
                  ALTERAR SENHA
                </button>
              )}
            </div>
          </div>

          <div className={`form-inputs ${styles.formInputs}`}>
            <input className={styles.input} type="text" placeholder="Nome Completo" maxLength={64} value={nomeCompleto} onChange={(event) => setNomeCompleto(event.target.value)} />
            <input className={styles.input} type="text" placeholder="Nome Artístico" maxLength={64} value={nomeArtistico} onChange={(event) => setNomeArtistico(event.target.value)} />
          </div>


          <textarea className={styles.biografia} placeholder="Mini Biografia" maxLength="500" value={miniBiografia} onChange={(event) => setMiniBiografia(event.target.value)}></textarea>
          <p className={styles.textoLimite}>Tamanho máximo de 500 caracteres ({contador(miniBiografia, 500)} restantes)</p>

          <h3 className={styles.subtitulo}>Tags:</h3>
          <div className={styles.tagsContainer}>
            {tagsUsuario.length > 0 ? (
              tagsUsuario.map((tag, i) => (
                <span key={i} className={styles.tags}>{tag}</span>
              ))
            ) : (
              <p className={styles.textoSemTags}>Nenhuma tag adicionada.</p>
            )}
          </div>
          <button id={styles.adicionarTag} type="button" onClick={() => setPopup("tags")}>+</button>

          <h3 className={styles.subtitulo}>Contato:</h3>
          <div className={styles.iconesContato}>
            <FaWhatsapp />
            <div className={styles.countryDropdownButtonWrapper}>
              <button
                type="button"
                className={styles.countryDropdownButton}
                onClick={() => setShowCountryDropdown((v) => !v)}
                tabIndex={0}
              >
                {/* Bandeira do país selecionado */}
                <img
                  src={`https://flagcdn.com/24x18/${(COUNTRY_CODES.find(c => c.code === countryCode)?.flag || "br")}.png`}
                  alt=""
                  className={styles.countryDropdownButtonImg}
                />
                {countryCode}
              </button>
              {showCountryDropdown && (
                <div
                  ref={countryDropdownRef}
                  className={countryDropdownClasses}
                >
                  <div className={styles.countryDropdownSearchRow}>
                    <span style={{ marginRight: 4, color: "#888" }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Buscar país"
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      className={styles.countryDropdownSearchInput}
                    />
                  </div>
                  <ul className={styles.countryDropdownList}>
                    {COUNTRY_CODES.filter(c =>
                      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                      c.code.includes(countrySearch)
                    ).map(c => (
                      <li
                        key={c.code}
                        className={
                          c.code === countryCode
                            ? `${styles.countryDropdownListItem} ${styles.countryDropdownListItemSelected}`
                            : styles.countryDropdownListItem
                        }
                        onClick={() => {
                          setCountryCode(c.code);
                          setShowCountryDropdown(false);
                          setCountrySearch("");
                        }}
                      >
                        <img
                          src={`https://flagcdn.com/24x18/${c.flag}.png`}
                          alt={c.name}
                        />
                        <span>
                          {c.name} ({c.code})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <input
                className={`${styles.input} ${styles.whatsappInput}`}
                type="tel"
                placeholder="Número do WhatsApp"
                value={formatarNumero(whatsappNumber, countryCode)}
                onChange={e => mudancaWhatsapp(
                  e,
                  setWhatsappNumber,
                  setWhatsappValido,
                  countryCode,
                  removerDDIDoNumero,
                  isValidPhoneNumber,
                  getCountryIsoFromCode,
                  COUNTRY_CODES
                )}
                maxLength={15}
              />
            </div>
            <FaInstagram />
            <input className={styles.input} type="text" placeholder="Usuário do Instagram" value={usuarioInstagram} onChange={(event) => setUsuarioInstagram(event.target.value)} />
          </div>
          {!whatsappValido && (
            <p className={styles.whatsappAviso}>
              Insira um número de WhatsApp válido (mínimo 9 dígitos).
            </p>
          )}

          <div className={styles.deletarSalvar}>
            <button id={styles.deletarConta} type="button" onClick={() => setPopup("deletar")}>DELETAR CONTA</button>
            <button type="submit" disabled={enviando}>
              {enviando ? 'SALVANDO...' : 'SALVAR'}
            </button>
          </div>
        </form>

        {/* Essa parte de pop-up eu tive que pesquisar por fora e fiz junto com o Copilot */}
        {popup === 'email' && <AlterarEmail clicado={true} fechar={() => setPopup(null)} />}
        {popup === 'senha' && <AlterarSenha clicado={true} fechar={() => setPopup(null)} />}
        {popup === 'tags' && <AdicionarTag clicado={true} fechar={() => setPopup(null)} salvar={tags => salvarTags(tags, setTagsUsuario)} tagsExistentes={tagsUsuario} />}
        {popup === 'deletar' && <DeletarConta clicado={true} fechar={() => setPopup(null)} deletar={() => deletarConta(database, navegar)} />}
      </main>
    </>
  );
}