import { useState } from "react";
import { ref, get, update } from "firebase/database";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { database, storage } from "../Firebase";
import { pegarUsuarioAtual } from "../contextos/Auth.jsx";
import "../../estilos/PopUps.css";

export default function DeletarObra(props) {
  const [deletando, setDeletando] = useState(false);

  const confirmarDelecao = async (event) => {
    event.preventDefault();
    
    if (!props.itemParaDeletar) {
      alert("Obra não encontrada para deletar.");
      return;
    }
    
    setDeletando(true);
    
    try {
      const usuarioAtual = pegarUsuarioAtual();
      if (!usuarioAtual) {
        alert("Usuário não encontrado. Faça login novamente.");
        return;
      }

      const emailKey = usuarioAtual.email.replace(/[^a-zA-Z0-9]/g, '_');
      const usuarioRef = ref(database, `usuarios/${emailKey}`);
      
      // Pegar os dados atuais do usuário
      const snapshot = await get(usuarioRef);
      const dadosUsuarioAtual = snapshot.val();
      
      if (!dadosUsuarioAtual) {
        alert("Dados do usuário não encontrados. Faça login novamente.");
        return;
      }
      
      const obrasExistentes = dadosUsuarioAtual.obras || [];
      
      /*
        Essa parte aqui foi muito mais complexa do que achei que seria pqp
        Tirar a imagem do storage é um saco
        Fizemos com Copilot 
      */

      // Encontrar a obra que será deletada para pegar a URL da imagem
      const obraParaDeletar = obrasExistentes.find(obra => 
        obra.dataCriacao === props.itemParaDeletar.dataCriacao
      );
      
      // Filtrar a obra que deve ser deletada (remove ela do array)
      const obrasAtualizadas = obrasExistentes.filter(obra => 
        obra.dataCriacao !== props.itemParaDeletar.dataCriacao
      );
      
      // Deletar a imagem do Firebase Storage se existir
      if (obraParaDeletar && obraParaDeletar.imagemUrl) {
        try {
          // Extrair o caminho da imagem da URL do Firebase Storage
          const imageUrl = obraParaDeletar.imagemUrl;
          
          // O padrão da URL do Firebase Storage é: 
          // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?{params}
          // Precisamos extrair o path da imagem
          if (imageUrl.includes('firebasestorage.googleapis.com')) {
            const urlParts = imageUrl.split('/o/')[1];
            if (urlParts) {
              const imagePath = decodeURIComponent(urlParts.split('?')[0]);
              const imageRef = storageRef(storage, imagePath);
              await deleteObject(imageRef);
              console.log("Imagem deletada do storage:", imagePath);
            }
          }
        } catch (storageError) {
          console.error("Erro ao deletar imagem do storage:", storageError);
          // Não interromper o processo se falhar ao deletar a imagem
        }
      }
      
      // Atualizar o usuário com as obras sem a que foi deletada
      await update(usuarioRef, { obras: obrasAtualizadas });
      
      alert("Obra deletada com sucesso!");
      props.fechar(true);
      
    } catch (error) {
      console.error("Erro ao deletar obra:", error);
      alert("Erro ao deletar obra. Tente novamente.");
    } finally {
      setDeletando(false);
    }
  };

  return (props.clicado ? (
    <div className="popup">
      <div className="popup-content">
        <h2>Deletar Obra</h2>
        <form className="popup-form" onSubmit={confirmarDelecao}>
          <p>Tem CERTEZA que deseja DELETAR PERMANENTEMENTE esta obra?</p>
          <p className="texto-vermelho">Essa ação não pode ser desfeita.</p>
          <button 
            className="botao-cancelar" 
            type="submit" 
            disabled={deletando}
          >
            {deletando ? "Deletando..." : "Sim, quero deletar essa obra"}
          </button>
          <button type="button" onClick={() => props.fechar(false)} disabled={deletando}>
            Não, quero manter essa obra
          </button>
        </form>
      </div>
    </div>
  ) : "Pop-Up não está ativo");
}