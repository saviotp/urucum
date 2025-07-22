import { useEffect, useState } from "react";

import AdicionarObra from "../AdicionarObra/AdicionarObra";
import { pegarUsuarioAtual } from "../../contextos/Auth";
import { validarImagem, enviarImagem, mostrarPreviewImagem } from "../../classes/ImagemUtils.jsx";
import { contador } from "../../classes/UsuarioUtils.jsx";
import styles from "./AdicionarColecao.module.css";
import "../../../estilos/PopUps.css";

import { ref, get, update } from "firebase/database";
import { database } from "../../Firebase";
import { carregarObrasUsuario } from "../../classes/FirebaseUtils.jsx";

export default function AdicionarColecao(props) {
    const titulo = props.modoEdicao ? "Editar Coleção" : "Adicionar Coleção";

    const [popup, setPopup] = useState(null);
    const [imagemSelecionada, setImagemSelecionada] = useState(null);
    const [previewImagem, setPreviewImagem] = useState(null);
    const [tituloColecao, setTituloColecao] = useState("");
    const [descricaoColecao, setDescricaoColecao] = useState("");
    const [obrasAdicionadas, setObrasAdicionadas] = useState([]);
    const [obrasUsuario, setObrasUsuario] = useState([]);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (props.modoEdicao && props.itemParaEditar) {
            const colecao = props.itemParaEditar;
            setTituloColecao(colecao.titulo || "");
            setDescricaoColecao(colecao.descricao || "");
            setPreviewImagem(colecao.imagemUrl || null);
            setObrasAdicionadas(colecao.obras || []);
            // Não definir imagemSelecionada pois a imagem já existe
        } else {
            // Limpar formulário quando não estiver editando
            setTituloColecao("");
            setDescricaoColecao("");
            setImagemSelecionada(null);
            setPreviewImagem(null);
            setObrasAdicionadas([]);
        }
        
        // Carregar obras do usuário sempre que o popup abrir
        carregarObrasUsuarioWrapper();
    }, [props.modoEdicao, props.itemParaEditar, props.clicado]);

    // Função globalizada para carregar obras do usuário
    const carregarObrasUsuarioWrapper = async () => {
        try {
            const usuarioAtual = pegarUsuarioAtual();
            if (!usuarioAtual) return;
            const obras = await carregarObrasUsuario(database, usuarioAtual.email);
            setObrasUsuario(obras);
        } catch (error) {
            console.error("Erro ao carregar obras do usuário:", error);
        }
    };

    const quandoImagemMuda = (event) => {
        mostrarPreviewImagem(event, setImagemSelecionada, setPreviewImagem, validarImagem, 10);
    };

    // Função para adicionar uma nova obra à coleção
    const adicionarObraAColecao = (novaObra) => {
        setObrasAdicionadas(obras => [...obras, novaObra]);
    };

    // Função para remover uma obra da coleção
    const removerObraDaColecao = (dataCriacaoObra) => {
        setObrasAdicionadas(obras => obras.filter(obra => obra.dataCriacao !== dataCriacaoObra));
    };

    // Função para quando o popup AdicionarObra for fechado com uma obra adicionada
    const quandoObraAdicionada = async (obraFoiAdicionada) => {
        setPopup(null);
        if (obraFoiAdicionada) {
            // Recarregar obras do usuário para manter a lista sincronizada
            carregarObrasUsuarioWrapper();
        }
    };

    // Função para adicionar uma obra existente à coleção
    const adicionarObraExistente = (obra) => {
        // Verificar se a obra já não está na coleção
        const jaAdicionada = obrasAdicionadas.some(obraAdicionada => 
            obraAdicionada.dataCriacao === obra.dataCriacao
        );
        
        if (!jaAdicionada) {
            setObrasAdicionadas(obras => [...obras, obra]);
        } else {
            alert("Esta obra já foi adicionada à coleção.");
        }
    };

    // Função para submeter o formulário e salvar a coleção
    const quandoEnviar = async (event) => {
        event.preventDefault();

        if (!tituloColecao.trim()) {
            alert("Por favor, insira um título para a coleção.");
            return;
        }
        if (!props.modoEdicao && !imagemSelecionada && !previewImagem) {
            alert("Por favor, selecione uma imagem para a coleção.");
            return;
        }

        setEnviando(true);

        try {
            const usuarioAtual = pegarUsuarioAtual();
            if (!usuarioAtual) {
                alert("Usuário não encontrado. Faça login novamente.");
                return;
            }

            let urlImagem = props.modoEdicao && props.itemParaEditar ? props.itemParaEditar.imagemUrl : null;

            // Upload via Cloudinary
            if (imagemSelecionada) {
                urlImagem = await enviarImagem(imagemSelecionada);
            } else if (!props.modoEdicao && !urlImagem) {
                alert("Por favor, selecione uma imagem para a coleção.");
                return;
            }

            // Salvar dados da coleção no Firebase Database
            const colecaoId = props.modoEdicao && props.itemParaEditar
              ? (props.itemParaEditar.id || props.itemParaEditar.dataCriacao)
              : `${usuarioAtual.email.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}`;

            const dadosColecao = {
              id: colecaoId,
              titulo: tituloColecao.trim(),
              descricao: descricaoColecao.trim(),
              imagemUrl: urlImagem,
              dataCriacao: props.modoEdicao ? props.itemParaEditar.dataCriacao : colecaoId, // <--- garantir que dataCriacao = id
              obras: obrasAdicionadas
            };

            console.log("Dados da coleção a serem salvos:", dadosColecao);
            console.log("URL da imagem:", urlImagem);

            // Usar a mesma lógica do Cadastro.jsx para a chave do usuário
            const emailKey = usuarioAtual.email.replace(/[^a-zA-Z0-9]/g, '_');
            const usuarioRef = ref(database, `usuarios/${emailKey}`);
            
            // Pegar os dados atuais do usuário
            const snapshot = await get(usuarioRef);
            const dadosUsuarioAtual = snapshot.val();
            
            if (!dadosUsuarioAtual) {
                alert("Dados do usuário não encontrados. Faça login novamente.");
                return;
            }
            
            let colecoesAtualizadas = [...(dadosUsuarioAtual.colecoes || [])];
            
            if (props.modoEdicao) {
                // Encontrar e atualizar a coleção específica
                const indiceColecao = colecoesAtualizadas.findIndex(colecao => 
                    colecao.dataCriacao === props.itemParaEditar.dataCriacao
                );
                
                if (indiceColecao !== -1) {
                    colecoesAtualizadas[indiceColecao] = dadosColecao;
                } else {
                    alert("Coleção não encontrada para edição.");
                    return;
                }
            } else {
                // Adicionar nova coleção
                colecoesAtualizadas.push(dadosColecao);
            }
            
            // Atualizar o usuário com as coleções modificadas
            await update(usuarioRef, { colecoes: colecoesAtualizadas });

            // Limpar formulário
            setTituloColecao("");
            setDescricaoColecao("");
            setImagemSelecionada(null);
            setPreviewImagem(null);
            setObrasAdicionadas([]);
            
            alert(props.modoEdicao ? "Coleção editada com sucesso!" : "Coleção adicionada com sucesso!");
            
            // Fechar o popup após sucesso
            props.fechar(true);

        } catch (error) {
            console.error(props.modoEdicao ? "Erro ao editar coleção:" : "Erro ao adicionar coleção:", error);
            alert(props.modoEdicao ? "Erro ao editar coleção. Tente novamente." : "Erro ao adicionar coleção. Tente novamente.");
            
            // Fechar o popup após erro (sem recarregar)
            props.fechar(false);
        } finally {
            setEnviando(false);
        }
    };

    return (props.clicado ? (
        <div className="popup">
            <div className="popup-content">
                <h2>{titulo}</h2>
                <form className="popup-form" onSubmit={quandoEnviar}>
                    <input 
                        type="text" 
                        placeholder="Título da Coleção" 
                        maxLength={32} 
                        value={tituloColecao}
                        onChange={(e) => setTituloColecao(e.target.value)}
                    />
                    <p className={styles.tamanho}>Tamanho máximo de 32 caracteres ({contador(tituloColecao, 32)} restantes)</p>

                    <div className={styles.descricaoContainer}>
                        <textarea 
                            className={styles.descricao} 
                            name="descricao" 
                            placeholder="Descrição da coleção" 
                            maxLength={500}
                            value={descricaoColecao}
                            onChange={(e) => setDescricaoColecao(e.target.value)}
                        ></textarea>
                        <div className={styles.imagem}>
                            <label htmlFor="enviar-arquivo-colecao" className="enviar-imagem">
                                Escolher Arquivo
                            </label>
                            <input 
                                id="enviar-arquivo-colecao" 
                                className="esconder-entrada-padrao" 
                                type="file" 
                                accept="image/*" 
                                alt="Envie sua imagem aqui" 
                                onChange={quandoImagemMuda}
                            />
                            <div className={styles.textoImagem}>
                                <h3 className={styles.subtitulo}>Obra Principal</h3>
                                <p className={styles.tamanho}>Tamanho máximo: 10mb</p>
                            </div>
                        </div>
                    </div>
                    <p className={styles.tamanho}>Tamanho máximo de 500 caracteres ({contador(descricaoColecao, 500)} restantes)</p>

                    {/* Preview da imagem da coleção */}
                    {previewImagem && (
                        <div className={styles.previewContainer}>
                            <h3 className={styles.subtitulo}>Preview da Imagem:</h3>
                            <img 
                                src={previewImagem} 
                                alt="Preview da coleção" 
                                className={styles.preview}
                            />
                        </div>
                    )}

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


                    <h3 className={styles.subtitulo}>Obras Adicionadas</h3>
                    {obrasAdicionadas && obrasAdicionadas.length > 0 ? (
                        <div className={styles.obrasContainer}>
                            {obrasAdicionadas.map((obra, index) => (
                                <div key={obra.dataCriacao || index} className={styles.obraAdicionada}>
                                    <img src={obra.imagemUrl} alt={obra.titulo} className={styles.imagemObraAdicionada} />
                                    <div className={styles.infoObra}>
                                        <h4>{obra.titulo}</h4>
                                        <p>{obra.descricao}</p>
                                        <button 
                                            type="button" 
                                            onClick={() => removerObraDaColecao(obra.dataCriacao)}
                                            className={styles.botaoRemover}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.nenhumaObra}>Nenhuma obra adicionada ainda.</p>
                    )}

                    <div className="botoes-popup">
                        <button className="botao-cancelar" type="button" onClick={() => props.fechar(false)}>CANCELAR</button>
                        <button type="submit" disabled={enviando}>
                            {enviando ? "ENVIANDO..." : (props.modoEdicao ? "SALVAR" : "ADICIONAR")}
                        </button>
                    </div>
                </form>
            </div>

                {popup === 'nova-obra' && (
                    <AdicionarObra 
                        clicado={true} 
                        fechar={quandoObraAdicionada}
                        onObraCriada={adicionarObraAColecao} // Passar callback para receber a obra criada
                    />
                )}
                
                {popup === 'obra-existente' && (
                    <div className="popup">
                        <div className="popup-content">
                            <h2>Selecionar Obra Existente</h2>
                            <div className={styles.obrasExistentesContainer}>
                                {(() => {
                                    // Filtrar obras que já foram adicionadas à coleção
                                    const obrasDisponiveis = obrasUsuario.filter(obra => 
                                        !obrasAdicionadas.some(obraAdicionada => 
                                            obraAdicionada.dataCriacao === obra.dataCriacao
                                        )
                                    );

                                    return obrasDisponiveis.length > 0 ? (
                                        obrasDisponiveis.map((obra, index) => (
                                            <div key={obra.dataCriacao || index} className={styles.obraExistente}>
                                                <img src={obra.imagemUrl} alt={obra.titulo} className={styles.imagemObraExistente} />
                                                <div className={styles.infoObraExistente}>
                                                    <h4>{obra.titulo}</h4>
                                                    <p>{obra.descricao}</p>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            adicionarObraExistente(obra);
                                                            setPopup(null);
                                                        }}
                                                        className={styles.botaoAdicionar}
                                                    >
                                                        Adicionar
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles.nenhumaObra}>
                                            {obrasUsuario.length === 0 
                                                ? "Você ainda não tem obras criadas." 
                                                : "Todas as suas obras já foram adicionadas à coleção."
                                            }
                                        </p>
                                    );
                                })()}
                            </div>
                            <div className="botoes-popup">
                                <button className="botao-cancelar" type="button" onClick={() => setPopup(null)}>
                                    FECHAR
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    ) : "Pop-Up não está ativo");
}