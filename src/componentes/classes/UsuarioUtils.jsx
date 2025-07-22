import { database } from "../Firebase.jsx";
import { ref, get, update, remove } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';

export function pegarUsuarioAtual() {
  const usuario = localStorage.getItem('usuarioLogado');
  if (!usuario) return null;
  const obj = JSON.parse(usuario);
  if (!obj.email) return null;
  return obj;
}

export function usuarioEstaLogado() {
  return !!localStorage.getItem('usuarioLogado');
}

export function Deslogar() {
  localStorage.removeItem("usuarioLogado");
  // ...outras ações de logout...
}

export function validarContatoUsuario({ whatsapp, instagram }) {
  // Número: pelo menos 9 dígitos, só números
  const numeroValido = typeof whatsapp === 'string' && whatsapp.replace(/\D/g, '').length >= 9;

  // Instagram: não vazio, não só '@', sem espaços, sem caracteres especiais além de ponto e underline
  const insta = typeof instagram === 'string' ? instagram.replace(/^@/, '') : '';
  const instagramValido =
    insta.length > 0 &&
    insta !== '@' &&
    /^[a-zA-Z0-9._]+$/.test(insta);

  return {
    numeroValido,
    instagramValido
  };
}

export function normalizarWhatsapp(whatsapp) {
  // Remove tudo que não é número
  return typeof whatsapp === 'string' ? whatsapp.replace(/\D/g, '') : '';
}

export function normalizarInstagram(instagram) {
  // Remove '@' do início e espaços
  return typeof instagram === 'string' ? instagram.replace(/^@/, '').replace(/\s+/g, '') : '';
}

// Gera o link correto do perfil do usuário (considerando duplicidade)
export function gerarLinkPerfilUsuario(nomeArtistico, uniqueId) {
  if (!nomeArtistico) return null;
  // Se tem uniqueId, monta com ele, senão só nome
  if (uniqueId && typeof uniqueId === "string" && uniqueId !== "null" && uniqueId !== "undefined") {
    return `/perfil-artista/${encodeURIComponent(nomeArtistico.replace(/\s+/g, '-'))}-${uniqueId}`;
  }
  return `/perfil-artista/${encodeURIComponent(nomeArtistico.replace(/\s+/g, '-'))}`;
}

// Retorna o link correto do perfil do usuário logado (considerando duplicidade)
export async function pegarLinkPerfilUsuarioLogado() {
  const usuario = pegarUsuarioAtual();
  if (!usuario || !usuario.nomeArtistico) return null;

  const usuariosRef = ref(database, 'usuarios');
  const snapshot = await get(usuariosRef);
  if (!snapshot.exists()) return null;

  const dadosUsuarios = snapshot.val();
  return gerarLinkPerfilUsuario(usuario, dadosUsuarios);
}

export async function criarOuGarantirUniqueId(emailKey) {
  const usuarioRef = ref(database, 'usuarios/' + emailKey);
  const snapshot = await get(usuarioRef);
  if (!snapshot.exists()) {
    // Se não existe usuário, retorna novo uuid
    return uuidv4();
  }
  const dados = snapshot.val();
  if (dados.uniqueId && typeof dados.uniqueId === "string" && dados.uniqueId !== "null" && dados.uniqueId !== "undefined") {
    return dados.uniqueId;
  }
  const uniqueId = uuidv4();
  await update(usuarioRef, { uniqueId });
  return uniqueId;
}

export async function pegarUniqueIdUsuario(emailKey) {
  const usuarioRef = ref(database, 'usuarios/' + emailKey);
  const snapshot = await get(usuarioRef);
  if (!snapshot.exists()) return null;
  const dados = snapshot.val();
  return dados.uniqueId || null;
}

// Garante que o usuário logado localmente tem uniqueId (sincroniza com banco)
export async function garantirUniqueIdUsuarioLocal() {
  const usuario = pegarUsuarioAtual();
  if (!usuario || !usuario.email) return null;
  const emailKey = usuario.email.replace(/[^a-zA-Z0-9]/g, '_');
  let uniqueId = usuario.uniqueId;
  if (!uniqueId) {
    uniqueId = await criarOuGarantirUniqueId(emailKey);
    const usuarioAtualizado = { ...usuario, uniqueId };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
  }
  return uniqueId;
}

export function normalizarNomeParaUrl(nome) {
  if (!nome || typeof nome !== "string") return "";
  return nome
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9\s-]/g, "") // remove caracteres especiais
    .trim().replace(/\s+/g, '-').toLowerCase();
}

export async function nomeDuplicadoNoBanco(nome) {
  if (!nome) return false;
  const usuariosRef = ref(database, 'usuarios');
  const snapshot = await get(usuariosRef);
  if (!snapshot.exists()) return false;
  const usuariosData = snapshot.val();
  const nomeNormalizado = nome.trim().toLowerCase();
  let count = 0;
  Object.values(usuariosData).forEach(u => {
    const nomeBase = (u.nomeArtistico && u.nomeArtistico.trim().length > 0
      ? u.nomeArtistico.trim().toLowerCase()
      : (u.nomeCompleto || "").trim().toLowerCase());
    if (nomeBase === nomeNormalizado) count++;
  });
  return count > 1;
}

export function removerDDIDoNumero(numero, countryCode) {
  // Ex: countryCode = "+55", numero = "55..." => remove o "55"
  const ddi = countryCode.replace("+", "");
  if (numero.startsWith(ddi)) {
    return numero.slice(ddi.length);
  }
  return numero;
}

/**
 * Função utilitária para fechar dropdowns ao clicar fora.
 * Exemplo de uso:
 *   document.addEventListener("mousedown", (e) => quandoClicarFora(e, ref, () => setShowDropdown(false)));
 */
export const quandoClicarFora = (event, ref, fecharCallback) => {
  if (ref.current && !ref.current.contains(event.target)) fecharCallback();
};

export async function deletarConta(database, navegar, alertFn = alert) {
  const usuarioAtual = pegarUsuarioAtual();
  if (!usuarioAtual || !usuarioAtual.email) {
    alertFn("Erro: Usuário não encontrado.");
    return;
  }
  const emailKey = usuarioAtual.email.replace(/[^a-zA-Z0-9]/g, '_');
  const usuarioRef = ref(database, 'usuarios/' + emailKey);

  await remove(usuarioRef);

  Deslogar();

  alertFn("Conta deletada com sucesso!");

  if (typeof navegar === "function") {
    navegar("/login");
  }
}

// Função para formatar número de telefone
export function formatarNumero(numero, countryCode) {
  let n = numero.replace(/\D/g, "");
  if (countryCode === "+55") {
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0,2)}) ${n.slice(2)}`;
    if (n.length <= 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7,11)}`;
    return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7,11)}` + n.slice(11);
  }
  return n.replace(/(\d{3,4})(?=\d)/g, "$1 ");
}

// Função auxiliar para obter o código ISO do país a partir do código internacional
export function getCountryIsoFromCode(code, COUNTRY_CODES) {
  const country = COUNTRY_CODES.find(c => c.code === code);
  return country && country.flag ? country.flag.toUpperCase() : undefined;
}

// Função para tratar mudança no campo WhatsApp
export function mudancaWhatsapp(event, setWhatsappNumber, setWhatsappValido, countryCode, removerDDIDoNumero, isValidPhoneNumber, getCountryIsoFromCode, COUNTRY_CODES) {
  let valor = event.target.value.replace(/\D/g, "");
  valor = removerDDIDoNumero(valor, countryCode);
  setWhatsappNumber(valor);

  let numeroCompleto = countryCode + valor;
  let valido = false;
  try {
    valido = isValidPhoneNumber(numeroCompleto, getCountryIsoFromCode(countryCode, COUNTRY_CODES));
  } catch {
    valido = false;
  }
  // Para o Brasil, exige exatamente 11 dígitos (2 DDD + 9 número)
  if (countryCode === "+55") {
    valido = valor.length === 11;
  }
  setWhatsappValido(valido);
}

// Função para salvar tags
export function salvarTags(tagsAdicionadas, setTagsUsuario) {
  setTagsUsuario(tagsAdicionadas);
}

// Função utilitária para mascarar número brasileiro
export function mascararNumeroBrasileiro(valor) {
  let v = valor.replace(/\D/g, '');
  v = v.slice(0, 11);
  if (v.length > 6) {
    return v.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '$1 $2-$3').trim();
  } else if (v.length > 2) {
    return v.replace(/^(\d{2})(\d{0,5})$/, '$1 $2').trim();
  }
  return v;
}

// Função utilitária para validar WhatsApp e Instagram
export function validarContatos(numeroCompleto, countryCode, COUNTRY_CODES, isValidPhoneNumber, numeroSemDDI, usuarioInstagram, normalizarInstagram) {
  let numeroValido = false;
  try {
    numeroValido = isValidPhoneNumber(
      numeroCompleto,
      getCountryIsoFromCode(countryCode, COUNTRY_CODES)
    );
  } catch {
    numeroValido = false;
  }
  const { instagramValido } = validarContatoUsuario({
    whatsapp: numeroSemDDI,
    instagram: normalizarInstagram(usuarioInstagram)
  });
  return { numeroValido, instagramValido };
}

export function contador(valor, limite = 500) {
  // Retorna quantos caracteres faltam até o limite (padrão 500)
  return limite - (valor ? valor.length : 0);
}

import { useEffect, useState } from "react";

/**
 * Hook utilitário para debounce de um valor.
 * Exemplo de uso:
 *   const valorDebounced = useDebounce(valor, 300);
 */
export function useDebounce(valor, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(valor);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(valor);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [valor, delay]);

  return debouncedValue;
}