import "../../estilos/PopUps.css";

export default function DeletarObra(props) {
  return (props.clicado ? (
    <div className="popup">
      <div className="popup-content">
        <h2>Deletar Obra</h2>
        <form className="popup-form">
          <p>Tem CERTEZA que deseja DELETAR PERMANENTEMENTE esta obra?</p>
          <p className="texto-vermelho">Essa ação não pode ser desfeita.</p>
          <button className="botao-cancelar" type="submit">Sim, quero deletar essa obra</button>
          <button type="button" onClick={props.fechar}>Não, quero manter essa obra</button>
        </form>
      </div>
    </div>
  ) : "Pop-Up não está ativo");
}