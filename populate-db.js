// Script para popular o banco de dados Firebase (ESM)

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

// Inicialize o Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://urucum-react-project-v2-default-rtdb.firebaseio.com"
});

const db = getDatabase();

// Imagens públicas do GitHub (exemplo)
const perfilImgs = [
  "https://avatars.githubusercontent.com/u/1?v=4",
  "https://avatars.githubusercontent.com/u/2?v=4",
  "https://avatars.githubusercontent.com/u/3?v=4",
  "https://avatars.githubusercontent.com/u/4?v=4",
  "https://avatars.githubusercontent.com/u/5?v=4"
];
const capaImgs = [
  "https://placehold.co/1200x700?text=Capa+1",
  "https://placehold.co/1200x700?text=Capa+2",
  "https://placehold.co/1200x700?text=Capa+3",
  "https://placehold.co/1200x700?text=Capa+4",
  "https://placehold.co/1200x700?text=Capa+5"
];
const obraImgs = [
  "https://placehold.co/400x400?text=Obra+1",
  "https://placehold.co/400x400?text=Obra+2",
  "https://placehold.co/400x400?text=Obra+3",
  "https://placehold.co/400x400?text=Obra+4",
  "https://placehold.co/400x400?text=Obra+5"
];
const colecaoImgs = [
  "https://placehold.co/300x300?text=Colecao+1",
  "https://placehold.co/300x300?text=Colecao+2",
  "https://placehold.co/300x300?text=Colecao+3",
  "https://placehold.co/300x300?text=Colecao+4",
  "https://placehold.co/300x300?text=Colecao+5"
];

function emailToKey(email) {
  return email.replace(/[@.]/g, "_");
}

function randomDate() {
  // Retorna uma data ISO aleatória entre 2023 e 2025
  const start = new Date(2023, 0, 1).getTime();
  const end = new Date(2025, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toISOString();
}

const usuarios = {};
for (let i = 1; i <= 30; i++) {
  const email = `artista${i}@email.com`;
  const emailKey = emailToKey(email);

  // 10 obras
  const obras = [];
  for (let j = 1; j <= 10; j++) {
    obras.push({
      id: `${emailKey}_obra_${j}`, // <-- Corrija aqui, remova Date.now()
      titulo: `Obra ${i}-${j}`,
      descricao: `Descrição da obra ${i}-${j}.`,
      artista: `Artista ${i} da Silva`,
      emailArtista: email,
      dataCriacao: randomDate(),
      imagemUrl: obraImgs[(j - 1) % obraImgs.length] // garante imagem para cada obra
    });
  }

  // 10 coleções, cada uma com pelo menos 5 obras
  const colecoes = [];
  for (let k = 1; k <= 10; k++) {
    // Seleciona 5 obras diferentes para cada coleção
    const obrasColecao = [];
    for (let o = 0; o < 5; o++) {
      const obraRef = obras[(k + o) % obras.length];
      obrasColecao.push({
        id: obraRef.id,
        titulo: obraRef.titulo,
        artista: obraRef.artista,
        imagemUrl: obraRef.imagemUrl
      });
    }
    colecoes.push({
      id: `${emailKey}_colecao_${k}`, // <-- Removido o Date.now()
      titulo: `Coleção ${i}-${k}`,
      descricao: `Coleção especial ${i}-${k}.`,
      dataCriacao: randomDate(),
      imagemUrl: colecaoImgs[(i + k) % colecaoImgs.length],
      obras: obrasColecao
    });
  }

  // 5 tags
  const tagsList = [
    "pintura", "escultura", "ilustração", "digital", "fotografia",
    "cerâmica", "gravura", "arte urbana", "instalação", "performance"
  ];
  const tags = [];
  for (let t = 0; t < 5; t++) {
    tags.push(tagsList[(i + t) % tagsList.length]);
  }

  usuarios[emailKey] = {
    nomeCompleto: `Artista ${i} da Silva`,
    nomeArtistico: `Art${i}`,
    email: email,
    miniBiografia: `Breve biografia do artista ${i}.`,
    whatsapp: `85999${10000 + i}`,
    instagram: `artista${i}`,
    tags: tags,
    imagemPerfil: perfilImgs[i % perfilImgs.length],
    imagemPrincipal: capaImgs[i % capaImgs.length],
    uniqueId: `uuid-${i}`,
    obras: obras,
    colecoes: colecoes
  };
}

async function popular() {
  await db.ref('usuarios').set(usuarios);
  console.log('Banco de dados populado!');

  // Checagem dos dados: listar IDs de obras e coleções
  Object.entries(usuarios).forEach(([emailKey, usuario]) => {
    console.log(`Usuário: ${emailKey}`);
    console.log('Obras IDs:');
    usuario.obras.forEach(obra => {
      console.log('  ', obra.id);
    });
    console.log('Coleções IDs:');
    usuario.colecoes.forEach(colecao => {
      console.log('  ', colecao.id);
    });
  });
}

popular();
