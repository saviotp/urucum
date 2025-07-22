import { ref, get, set } from 'firebase/database';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { normalizarNomeParaUrl } from './UsuarioUtils.jsx';

export function emailToKey(email) {
  return email.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function verificarEmailExistente(database, email) {
  const emailKey = emailToKey(email);
  const usuarioRef = ref(database, 'usuarios/' + emailKey);
  const snapshot = await get(usuarioRef);
  return snapshot.exists();
}

export function nomeParaUrl(nome) {
  return typeof nome === 'string' ? nome.trim().replace(/\s+/g, '-') : '';
}

// Função para login/cadastro com Google
export async function loginComGoogle({ database, auth, navegar, criarOuGarantirUniqueId, loginUsuario }) {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const emailKey = emailToKey(user.email);
    const usuarioRef = ref(database, 'usuarios/' + emailKey);
    const snapshot = await get(usuarioRef);

    let uniqueId;
    let dadosUsuario;
    if (snapshot.exists()) {
      dadosUsuario = snapshot.val();
      uniqueId = dadosUsuario.uniqueId;
      if (!uniqueId) {
        uniqueId = await criarOuGarantirUniqueId(emailKey);
        await set(usuarioRef, { ...dadosUsuario, uniqueId });
      }
    } else {
      uniqueId = await criarOuGarantirUniqueId(emailKey);
      dadosUsuario = {
        nomeCompleto: user.displayName || "",
        nomeArtistico: "",
        email: user.email,
        miniBiografia: "",
        whatsapp: "",
        instagram: "",
        tags: [],
        imagemPerfil: user.photoURL || "",
        uniqueId
      };
      // Garante que o usuário é salvo no banco mesmo sem editar perfil
      await set(usuarioRef, dadosUsuario);
    }

    loginUsuario({
      email: dadosUsuario.email,
      nomeCompleto: dadosUsuario.nomeCompleto,
      nomeArtistico: dadosUsuario.nomeArtistico,
      miniBiografia: dadosUsuario.miniBiografia,
      whatsapp: dadosUsuario.whatsapp,
      instagram: dadosUsuario.instagram,
      tags: dadosUsuario.tags,
      imagemPerfil: dadosUsuario.imagemPerfil,
      uniqueId
    });

    const nomeArtistaURL = (dadosUsuario.nomeArtistico && dadosUsuario.nomeArtistico.trim().length > 0 ? dadosUsuario.nomeArtistico : dadosUsuario.nomeCompleto).replace(/\s+/g, '-');
    navegar(`/editar-perfil/${nomeArtistaURL}-${uniqueId}`);
  } catch (error) {
    alert("Erro ao fazer login com Google. Tente novamente.");
    console.error(error);
  }
}

/**
 * Busca e retorna os dados do artista pelo nome na URL.
 * @param {object} database - Instância do banco de dados Firebase.
 * @param {string} nomeArtistaUrl - Nome do artista vindo da URL.
 * @returns {object|null} Dados do artista ou null se não encontrado.
 */
export async function carregarDadosArtista(database, nomeArtistaUrl) {
  if (!nomeArtistaUrl) return null;
  const usuariosRef = ref(database, 'usuarios');
  const snapshot = await get(usuariosRef);

  if (!snapshot.exists()) return null;

  const dadosUsuarios = snapshot.val();
  const nomeUrl = normalizarNomeParaUrl(nomeArtistaUrl);

  for (const emailKey of Object.keys(dadosUsuarios)) {
    const usuario = dadosUsuarios[emailKey];
    const nomeBanco = normalizarNomeParaUrl(
      usuario.nomeArtistico && usuario.nomeArtistico.trim().length > 0
        ? usuario.nomeArtistico
        : usuario.nomeCompleto
    );
    if (nomeBanco === nomeUrl) {
      return usuario;
    }
  }
  return null;
}

/**
 * Verifica se o usuário logado é dono do perfil do artista.
 * @param {object} artista - Objeto do artista (deve ter .email).
 * @returns {boolean}
 */
export function usuarioDonoDoPerfil(artista) {
  if (!artista || !artista.email) return false;
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
  return usuarioLogado && usuarioLogado.email === artista.email;
}

/**
 * Carrega as obras do usuário autenticado.
 * @param {object} database - Instância do banco de dados Firebase.
 * @param {string} email - Email do usuário.
 * @returns {Promise<Array>} Array de obras do usuário ou [].
 */
export async function carregarObrasUsuario(database, email) {
  if (!email) return [];
  const emailKey = email.replace(/[^a-zA-Z0-9]/g, '_');
  const usuarioRef = ref(database, `usuarios/${emailKey}`);
  const snapshot = await get(usuarioRef);
  if (snapshot.exists()) {
    const dadosUsuario = snapshot.val();
    return dadosUsuario.obras || [];
  }
  return [];
}