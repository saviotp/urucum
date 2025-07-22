import logo from "../../../assets/logo-principal.png";
import styles from "./CabecalhoImagem.module.css";
import "../../../estilos/CabecalhoGeral.css";

import { useNavigate } from "react-router-dom";

export default function Cabecalho({ children, mostrarBotaoPaginaInicial = false }) {
  const navegar = useNavigate();

  const irParaPaginaInicial = () => {
    navegar("/");
  };

  return (
    <header className={`botaoPerfil ${styles.cabecalho}`}>
      <img src={logo} alt="Logo URUCUM" onClick={irParaPaginaInicial} />
      {mostrarBotaoPaginaInicial && (
        <button onClick={irParaPaginaInicial}>
          Página Inicial
        </button>
      )}
      {children}
    </header>
  );
}
