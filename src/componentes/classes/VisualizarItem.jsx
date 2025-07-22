import "../../estilos/PopUps.css";
import { CiLink } from "react-icons/ci";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState } from "react";
import Compartilhar from "./Compartilhar";

export default function VisualizarItem({ 
  item, 
  tipo, // 'obra' ou 'colecao'
  clicado, 
  fechar, 
  estilosPersonalizados = {} 
}) {
  const [obraAtualIndex, setObraAtualIndex] = useState(0);
  
  // Para coleções: navegar entre obras
  const isColecao = tipo === 'colecao';
  const obras = isColecao ? (item.obras || []) : [];
  const itemAtual = isColecao && obras.length > 0 ? obras[obraAtualIndex] : item;
  
  // Compartilhar item principal (obra ou coleção)
  const { compartilharObra: compartilharItemPrincipal } = Compartilhar({
    obraId: item.id ? item.id : null,
    titulo: item.titulo,
    artista: item.artista,
    tipo: tipo
  });

  // Compartilhar obra individual (só para coleções)
  const { compartilharObra: compartilharObraIndividual } = Compartilhar({
    obraId: itemAtual?.id ? itemAtual.id : null,
    titulo: itemAtual?.titulo,
    artista: itemAtual?.artista,
    tipo: 'obra'
  });

  const proximaObra = () => {
    if (obraAtualIndex < obras.length - 1) {
      setObraAtualIndex(obraAtualIndex + 1);
    }
  };

  const obraAnterior = () => {
    if (obraAtualIndex > 0) {
      setObraAtualIndex(obraAtualIndex - 1);
    }
  };

  if (!clicado) {
    return "Pop-Up não está ativo";
  }

  // Adiciona verificação para id ausente
  if (!item.id) {
    return (
      <div className="popup">
        <div className={`popup-content ${estilosPersonalizados.popupContent || ''}`}>
          <h2>Erro ao visualizar</h2>
          <p>ID do item não encontrado. Verifique se o banco foi populado corretamente.<br/>ID recebido: <b>{item.id ? item.id : "undefined"}</b></p>
          <button 
            className={estilosPersonalizados.botaoFechar || 'botao-fechar'} 
            onClick={() => fechar(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup">
      <div className={`popup-content ${estilosPersonalizados.popupContent || ''}`}>
        <h2>{item.titulo}</h2>
        
        {/* Descricao da colecao */}
        {isColecao && <p className={estilosPersonalizados.descricaoColecao || ''}>{item.descricao}</p>}
        
        {/* Conteúdo principal */}
        {isColecao && obras.length > 0 ? (
          <>
            {/* Navegação entre obras da coleção */}
            <div className={estilosPersonalizados.navegacaoObras || 'navegacao-obras'}>
              <button 
                className={estilosPersonalizados.botaoSeta || 'botao-seta'} 
                onClick={obraAnterior}
                disabled={obraAtualIndex === 0}
              >
                <FaChevronLeft />
              </button>
              
              <div className={`popup-imagem ${estilosPersonalizados.popupImagem || ''}`}>
                <h3>{itemAtual.titulo}</h3>
                <img src={itemAtual.imagemUrl} alt={itemAtual.titulo} />
                <p>{itemAtual.descricao}</p>
                <p className={estilosPersonalizados.contadorObras || 'contador-obras'}>
                  {obraAtualIndex + 1} de {obras.length}
                </p>
              </div>
              
              <button 
                className={estilosPersonalizados.botaoSeta || 'botao-seta'} 
                onClick={proximaObra}
                disabled={obraAtualIndex === obras.length - 1}
              >
                <FaChevronRight />
              </button>
            </div>
          </>
        ) : isColecao && obras.length === 0 ? (
          <div className={estilosPersonalizados.colecaoVazia || 'colecao-vazia'}>
            <p>Esta coleção não possui obras.</p>
          </div>
        ) : (
          /* Layout para obra simples */
          <div className={`popup-imagem ${estilosPersonalizados.popupImagem || ''}`}>
            <img src={itemAtual.imagemUrl} alt={itemAtual.titulo} />
            <p>{itemAtual.descricao}</p>
          </div>
        )}

        {/* Botões principais - todos na mesma linha */}
        <div className={estilosPersonalizados.denunciarCompartilhar || estilosPersonalizados.botoesColecao || 'botoes-container'}>
          {/* Compartilhar obra individual (só para coleções) */}
          {isColecao && obras.length > 0 && (
            <button 
              className={estilosPersonalizados.botaoCompartilhar || 'botao-compartilhar'} 
              onClick={compartilharObraIndividual}
            >
              <CiLink /> Compartilhar Obra
            </button>
          )}
          
          {/* Compartilhar item principal */}
          <button 
            className={estilosPersonalizados.botaoCompartilhar || 'botao-compartilhar'} 
            onClick={compartilharItemPrincipal}
          >
            <CiLink /> {isColecao ? 'Compartilhar Coleção' : 'Compartilhar'}
          </button>
          
          <button 
            className={estilosPersonalizados.botaoFechar || 'botao-fechar'} 
            onClick={() => fechar(false)}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
