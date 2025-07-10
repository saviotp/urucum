import { useState } from "react";

import AdicionarObra from "../AdicionarObra/AdicionarObra";
import ObrasExistentes from "../ObrasExistentes/ObrasExistentes";
import styles from "./AdicionarColecao.module.css";
import "../../../estilos/PopUps.css";

export default function AdicionarColecao(props) {

    const [popup, setPopup] = useState(null);

    return (props.clicado ? (
        <div className="popup">
            <div className="popup-content">
                <h2>Adicionar Coleção</h2>
                <form className="popup-form">
                    <input type="text" placeholder="Título da Coleção" maxLength={32} />
                    <p className={styles.tamanho}>Tamanho máximo de 32 caracteres</p>

                    <div className={styles.descricaoContainer}>
                        <textarea className={styles.descricao} name="descricao" id="" placeholder="Descrição da coleção" maxLength={500}></textarea>
                        <div className={styles.imagem}>
                            <label htmlFor="enviar-arquivo" className="enviar-imagem">
                                Escolher Arquivo
                            </label>
                            <input id="enviar-arquivo" className="esconder-entrada-padrao" type="file" accept="image/*" alt="Envie sua imagem aqui" />
                            <div className={styles.textoImagem}>
                                <h3 className={styles.subtitulo}>Obra Principal</h3>
                                <p className={styles.tamanho}>Tamanho máximo: 20mb</p>
                            </div>
                        </div>
                    </div>
                        <p className={styles.tamanho}>Tamanho máximo de 500 caracteres</p>

                    <h3 className={styles.subtitulo}>Adicionar Obra</h3>
                    <div className={styles.botoesAdicionarColecao}>

                        {
                            /*
                                Outra coisa aí q eu não sabia, o tipo padrão é submit, então tem que declarar que não é
                            */
                        }
                        <button type="button" onClick={() => setPopup("obra-existente")}>Obra Existente</button>
                        <button type="button" onClick={() => setPopup("nova-obra")}>Nova Obra</button>
                    </div>

                    <div className="botoes-popup">
                        <button className="botao-cancelar" type="button" onClick={props.fechar}>CANCELAR</button>
                        <button type="submit">ADICIONAR</button>
                    </div>
                </form>
            </div>

                {popup === 'nova-obra' && <AdicionarObra clicado={true} fechar={() => setPopup(null)} />}
                {popup === 'obra-existente' && <ObrasExistentes clicado={true} fechar={() => setPopup(null)} />}
        </div>
    ) : "Pop-Up não está ativo");
}