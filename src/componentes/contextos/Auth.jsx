import { auth } from "../Firebase.jsx";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

/*
    Isso aqui foi feito com Copilot
    Tentei assistir um vídeo de como fazer auth, implementei tudo, não funcionou
    Como a gente não tem essa parte na matéria, resolvi usar a IA
    Depois que ela fez, consegui entender os conceitos
    Por isso vou deixar tudo comentado por aqui
*/

/*
    Aprendi que em um documento, só pode ter um export default
    Então, como não tem nenhum export default nesse arquivo, vou deixar o export normal
*/

export function usuarioEstaLogado() {
  // Check Firebase Auth state
  return !!auth.currentUser;
}

export function pegarUsuarioAtual() {
  // Get user from Firebase Auth
  const user = auth.currentUser;
  if (user) {
    // Optionally merge with localStorage info if needed
    const local = localStorage.getItem('usuarioLogado');
    if (local) {
      try {
        return { ...JSON.parse(local), uid: user.uid, email: user.email };
      } catch {
        return { uid: user.uid, email: user.email };
      }
    }
    return { uid: user.uid, email: user.email };
  }
  return null;
}

export function Deslogar() {
  signOut(auth);
  localStorage.removeItem('usuarioLogado');
}

export async function loginUsuario(dadosUsuario) {
  // Só faz login com email/senha se a senha existir
  if (dadosUsuario.senha) {
    await signInWithEmailAndPassword(auth, dadosUsuario.email, dadosUsuario.senha);
  }
  // Store extra info in localStorage if needed
  localStorage.setItem('usuarioLogado', JSON.stringify({
    email: dadosUsuario.email,
    nomeCompleto: dadosUsuario.nomeCompleto,
    nomeArtistico: dadosUsuario.nomeArtistico,
    miniBiografia: dadosUsuario.miniBiografia,
    numeroWhatsApp: dadosUsuario.numeroWhatsApp,
    usuarioInstagram: dadosUsuario.usuarioInstagram,
    tags: dadosUsuario.tags,
    imagemPerfil: dadosUsuario.imagemPerfil,
    logado: true
  }));
}