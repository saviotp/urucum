import { useState } from "react";

import style from "./ObrasExistentes.module.css";
import "../../../estilos/PopUps.css";

export default function ObrasExistentes(props) {

    const [pesquisa, setPesquisa] = useState("");
    const [obrasSelecionadas, setObrasSelecionadas] = useState([]);

    const obrasPeixão = [
        { id: 1, nome: "Obra 1", descricao: "Descrição da obra 1" },
        { id: 2, nome: "Obra 2", descricao: "Descrição da obra 2" },
        { id: 3, nome: "Obra 3", descricao: "Descrição da obra 3" },
        { id: 4, nome: "Obra Jaoroeks", descricao: "Descrição da obra 4" },
    ];

    const selecionarObra = (obra) => {
        setObrasSelecionadas(obrasPeixão.filter(obra => obra.nome.toLowerCase().includes(pesquisa.toLowerCase())));
    }

    return (
        <>
            <div className="popup">
                <div className="popup-content">
                    <h2>Adicionar Obra Existente</h2>
                    <input type="text" placeholder="Pesquise as suas obras aqui" onChange={e => setPesquisa(e.target.value)} />
                    <div className="obras-pesquisadas">
                        {obrasSelecionadas.map(obra => (
                            <p className={style.obra} key={obra.id} onClick={() => selecionarObra(obra)}>{obra.nome}</p>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}