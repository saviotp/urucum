export function navegarParaPerfil(navegar, usuario) {
  if (usuario?.nomeArtistico) {
    navegar(`/perfil-artista/${usuario.nomeArtistico}`);
  } else if (usuario?.nomeCompleto) {
    navegar(`/perfil-artista/${usuario.nomeCompleto}`);
  }
}

export function navegarParaPaginaInicial(navegar) {
  navegar("/");
}
