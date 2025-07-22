import "../../estilos/PopUps.css";
import { useState } from "react";
import { contador } from "../classes/UsuarioUtils.jsx";

export default function AdicionarTag(props) {
  const [novaTag, setNovaTag] = useState("");
  return (props.clicado ? (
    <div className="popup">
      <div className="popup-content">
        <h2>Adicionar Tag</h2>
        <form className="popup-form">
          <input type="text" placeholder="Nova Tag" maxLength={32} value={novaTag} onChange={e => setNovaTag(e.target.value)} />
          <p className="texto-limite">Tamanho máximo de 32 caracteres ({contador(novaTag, 32)} restantes)</p>
          <button type="submit">SALVAR</button>
          <button className="botao-cancelar" type="button" onClick={props.fechar}>CANCELAR</button>
        </form>
      </div>
    </div>
  ) : "Pop-Up não está ativo");
}