import styles from "./AdicionarObra.module.css";
import "../../../estilos/PopUps.css";

export default function AdicionarObra(props) {
  return (props.clicado ? (
    <div className="popup">
      <div className="popup-content">
        <h2>Adicionar Obra</h2>
        <form className="popup-form">
          <input type="text" placeholder="Título da Obra" maxLength={32} />
          <p className={styles.tamanho}>Tamanho máximo de 32 caracteres</p>

          <textarea className={styles.descricao} name="descricao" id="" placeholder="Descrição da obra" maxLength={500}></textarea>
          <p className={styles.tamanho}>Tamanho máximo de 500 caracteres</p>

          <div className={styles.imagem}>
            {/*
            Aqui eu precisei de uma mãozinha do Copilot porque só dá pra colocar estilo no input se usar a tag label
            não fazia ideia disso
            */}

            <label htmlFor="enviar-arquivo" className="enviar-imagem">
              Escolher Arquivo
            </label>

            {/*
                Bro, pra mudar o estilo tem que ESCONDER o input padrão kk
            */}

            <input id="enviar-arquivo" className="esconder-entrada-padrao" type="file" accept="image/*" alt="Envie sua imagem aqui" />
            <div className={styles.textoImagem}>
              <h3 className={styles.subtitulo}>Enviar imagem</h3>
              <p className={styles.tamanho}>Tamanho máximo: 20mb</p>
            </div>
          </div>

          <div className="botoes-popup">
            <button className="botao-cancelar" type="button" onClick={props.fechar}>CANCELAR</button>
            <button type="submit">ADICIONAR</button>
          </div>
        </form>
      </div>
    </div>
  ) : "Pop-Up não está ativo");
}