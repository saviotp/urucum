import { BrowserRouter, Routes, Route } from "react-router-dom";

import TelaCadastro from "./paginas/TelaCadastro";
import TelaEditarPerfil from "./paginas/TelaEditarPerfil"
import TelaLogin from "./paginas/TelaLogin";
import TelaPaginaInicial from "./paginas/TelaPaginaInicial";
import TelaPerfilArtista from "./paginas/TelaPerfilArtista";
import TelaObra from "./paginas/TelaObra";
import TelaColecao from "./paginas/TelaColecao";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/cadastro" element={<TelaCadastro />} />
          <Route path="/editar-perfil/:nomeArtista" element={<TelaEditarPerfil />} />
          <Route path="/login" element={<TelaLogin />} />
          <Route path="/" element={<TelaPaginaInicial />} />
          <Route path="/perfil-artista/:nomeArtista" element={<TelaPerfilArtista />} />
          <Route path="/obra/:obraId" element={<TelaObra />} />
          <Route path="/colecao/:colecaoId" element={<TelaColecao />} />
          {/* Adicione outras rotas conforme necessário */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App