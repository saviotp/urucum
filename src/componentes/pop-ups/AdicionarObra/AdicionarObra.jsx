import { useState, useEffect } from "react";

/*
  Eu tava confuso do pq o ref não funcionava direito
  aí eu pedi ajuda do copilot e ele explicou que tem dois refs, o do firebase storage e o do firebase database
*/
import { ref, get, update } from "firebase/database";
import { database } from "../../Firebase";
import { pegarUsuarioAtual } from "../../contextos/Auth";
import { validarImagem, enviarImagem, mostrarPreviewImagem } from "../../classes/ImagemUtils.jsx";
import { contador } from "../../classes/UsuarioUtils.jsx";
import styles from "./AdicionarObra.module.css";
import "../../../estilos/PopUps.css";

export default function AdicionarObra(props) {
  const titulo = props.modoEdicao ? "Editar Obra" : "Adicionar Obra";
  
  // Estados para o formulário
  const [tituloObra, setTituloObra] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Preencher formulário quando estiver em modo de edição
  useEffect(() => {
    if (props.modoEdicao && props.itemParaEditar) {
      const obra = props.itemParaEditar;
      setTituloObra(obra.titulo || "");
      setDescricao(obra.descricao || "");
      setPreviewImagem(obra.imagemUrl || null);
      // Não definir imagemSelecionada pois a imagem já existe
    } else {
      // Limpar formulário quando não estiver editando
      setTituloObra("");
      setDescricao("");
      setImagemSelecionada(null);
      setPreviewImagem(null);
    }
  }, [props.modoEdicao, props.itemParaEditar, props.clicado]);

  const quandoImagemMuda = (event) => {
    mostrarPreviewImagem(event, setImagemSelecionada, setPreviewImagem, validarImagem, 10);
  };

  const quandoEnviar = async (event) => {
    event.preventDefault();

    if (!tituloObra.trim()) {
      alert("Por favor, insira um título para a obra.");
      return;
    }
    if (!props.modoEdicao && !imagemSelecionada) {
      alert("Por favor, selecione uma imagem para a obra.");
      return;
    }

    setEnviando(true);

    try {
      const usuarioAtual = pegarUsuarioAtual();
      if (!usuarioAtual) {
        alert("Usuário não encontrado. Faça login novamente.");
        return;
      }

      let urlImagem = props.modoEdicao ? props.itemParaEditar.imagemUrl : null;

      // Upload via Cloudinary
      if (imagemSelecionada) {
        urlImagem = await enviarImagem(imagemSelecionada);
      }

      // Gerar ID único para a obra
      const obraId = props.modoEdicao
        ? (props.itemParaEditar.id || props.itemParaEditar.dataCriacao)
        : `${usuarioAtual.email.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}`;

      // Salvar dados da obra no Firebase Database
      const dadosObra = {
        id: obraId,
        titulo: tituloObra.trim(),
        descricao: descricao.trim(),
        imagemUrl: urlImagem,
        dataCriacao: props.modoEdicao ? props.itemParaEditar.dataCriacao : obraId, // <--- garantir que dataCriacao = id
        artista: usuarioAtual.nomeArtistico || usuarioAtual.nomeCompleto,
        emailArtista: usuarioAtual.email,
      };

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
      
      let obrasAtualizadas = [...(dadosUsuarioAtual.obras || [])];
      
      if (props.modoEdicao) {
        // Encontrar e atualizar a obra específica
        const indiceObra = obrasAtualizadas.findIndex(obra => 
          (obra.id && obra.id === (props.itemParaEditar.id || props.itemParaEditar.dataCriacao)) ||
          (!obra.id && obra.dataCriacao === props.itemParaEditar.dataCriacao)
        );
        
        if (indiceObra !== -1) {
          obrasAtualizadas[indiceObra] = dadosObra;
        } else {
          alert("Obra não encontrada para edição.");
          return;
        }
      } else {
        // Adicionar nova obra
        obrasAtualizadas.push(dadosObra);
      }
      
      // Atualizar o usuário com as obras modificadas
      await update(usuarioRef, { obras: obrasAtualizadas });

      // Se foi uma nova obra criada e há callback para adicionar à coleção, chamar
      if (!props.modoEdicao && props.onObraCriada) {
        props.onObraCriada(dadosObra);
      }

      // Limpar formulário
      setTituloObra("");
      setDescricao("");
      setImagemSelecionada(null);
      setPreviewImagem(null);
      
      alert(props.modoEdicao ? "Obra editada com sucesso!" : "Obra adicionada com sucesso!");
      
      // Fechar o popup após sucesso
        props.fechar(true);



    } catch (error) {
      console.error(props.modoEdicao ? "Erro ao editar obra:" : "Erro ao adicionar obra:", error);
      alert(props.modoEdicao ? "Erro ao editar obra. Tente novamente." : "Erro ao adicionar obra. Tente novamente.");
      
        props.fechar(false);
    } finally {
      setEnviando(false);
    }
  };
  
  return (props.clicado ? (
    <div className="popup">
      <div className="popup-content">

        {/*
          Aqui é aquele "if" que você falou em sala de aula kk
          Mesma coisa pro de Coleção
        */}
        <h2>{titulo}</h2>
        <form className="popup-form" onSubmit={quandoEnviar}>
          <input 
            type="text" 
            placeholder="Título da Obra" 
            maxLength={32} 
            value={tituloObra}
            onChange={(event) => setTituloObra(event.target.value)}
          />
          <p className={styles.tamanho}>Tamanho máximo de 32 caracteres ({contador(tituloObra, 32)} restantes)</p>

          <textarea 
            className={styles.descricao} 
            name="descricao" 
            id="" 
            placeholder="Descrição da obra" 
            maxLength={500}
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
          ></textarea>
          <p className={styles.tamanho}>Tamanho máximo de 500 caracteres ({contador(descricao, 500)} restantes)</p>

          <div className={styles.imagem}>
            {/*
            Aqui eu precisei de uma mãozinha do Copilot porque só dá pra colocar estilo no input se usar a tag label
            não fazia ideia disso
            */}

            <label htmlFor="enviar-arquivo-obra" className="enviar-imagem">
              Escolher Arquivo
            </label>

            {/*
                Bro, pra mudar o estilo tem que ESCONDER o input padrão kk
            */}

            <input 
              id="enviar-arquivo-obra" 
              className="esconder-entrada-padrao" 
              type="file" 
              accept="image/*" 
              alt="Envie sua imagem aqui" 
              onChange={quandoImagemMuda}
            />
            <div className={styles.textoImagem}>
              <h3 className={styles.subtitulo}>Enviar imagem</h3>
              <p className={styles.tamanho}>Tamanho máximo: 10mb</p>
            </div>
          </div>

          {/* Preview da imagem */}
          {previewImagem && (
            <div className={styles.previewContainer}>
              <h3 className={styles.subtitulo}>Preview da Imagem:</h3>
              <img 
                src={previewImagem} 
                alt="Preview da obra" 
                className={styles.preview}
              />
            </div>
          )}

          <div className="botoes-popup">
            <button className="botao-cancelar" type="button" onClick={() => props.fechar(false)}>CANCELAR</button>
            <button type="submit" disabled={enviando}>
              {enviando ? "ENVIANDO..." : (props.modoEdicao ? "SALVAR" : "ADICIONAR")}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : "Pop-Up não está ativo");
}