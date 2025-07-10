import "../../../estilos/PopUps.css";
import styles from "./DenunciarConta.module.css";
import { useState } from "react";

export default function DenunciarConta(props) {

    /*
        Usei o useState aqui pra poder colocar um input atrelado a opção Outros
        o select não deixa colocar um input dentro dele

        Criei um CSS modular tbm, mas diferentemente do outro caso, usei ele pra elementos que NÃO ESTAVAM no outro arquivo CSS
    */
  const [motivoSelecionado, setMotivoSelecionado] = useState("");
  const [outroMotivo, setOutroMotivo] = useState("");

  return (props.clicado ? (
    <div className="popup">
      <div className="popup-content">
        <h2>Porque você deseja denunciar esta conta?</h2>
        <form className="popup-form">
          <select className={styles.selecionarMotivo} name="motivo" value={motivoSelecionado} onChange={(event) => setMotivoSelecionado(event.target.value)}>
            <option value="">Selecione um motivo</option>
            <option value="plagio">Plágio</option>
            <option value="pornografia">Pornografia</option>
            <option value="spam">Spam</option>
            <option value="outro">Outro</option>
          </select>
          
          {motivoSelecionado === "outro" && (
            <input type="text" placeholder="Descreva o motivo da denúncia" value={outroMotivo} onChange={(e) => setOutroMotivo(e.target.value)} maxLength={32}/>
          )}

          <textarea className={styles.detalheDenuncia} name="detalhe" id="" placeholder="Detalhe a sua denúncia" maxLength={500}></textarea>
          <p>Tamanho máximo de 500 caracteres</p>
          
          <div className="botoes-popup">
            <button className="botao-cancelar" type="button" onClick={props.fechar}>CANCELAR</button>
            <button type="submit">DENUNCIAR</button>
          </div>
        </form>
      </div>
    </div>
  ) : "Pop-Up não está ativo");
}
