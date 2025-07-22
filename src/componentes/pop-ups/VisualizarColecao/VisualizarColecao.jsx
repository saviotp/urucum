import VisualizarItem from "../../classes/VisualizarItem";
import stylesColecao from "./VisualizarColecao.module.css";
import stylesObra from "../VisualizarObra/VisualizarObra.module.css";
import useBuscaUniversal from "../../classes/BuscaUniversal";

export default function VisualizarColecao(props) {
  // Se receber o id da coleção via props, busque usando o hook
  const colecaoId = props.colecaoId || (props.itemParaVisualizar && props.itemParaVisualizar.id);
  const { item: colecao, carregando, erro } = useBuscaUniversal("colecao", colecaoId);

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div>{erro}</div>;
  if (!colecao) return <div>Coleção não encontrada</div>;

  return (
    <VisualizarItem
      item={colecao}
      tipo="colecao"
      clicado={props.clicado}
      fechar={props.fechar}
      estilosPersonalizados={{
        popupContent: stylesObra.popupContent,
        popupImagem: stylesObra.popupImagem,
        descricaoColecao: stylesColecao.descricaoColecao,
        navegacaoObras: stylesColecao.navegacaoObras,
        botaoSeta: stylesColecao.botaoSeta,
        contadorObras: stylesColecao.contadorObras,
        botoesObra: stylesColecao.botoesObra,
        colecaoVazia: stylesColecao.colecaoVazia,
        denunciarCompartilhar: stylesObra.denunciarCompartilhar,
        botaoCompartilhar: stylesObra.botaoCompartilhar,
        botaoFechar: stylesObra.botaoFechar
      }}
    />
  );
}
