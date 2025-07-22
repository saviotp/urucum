import VisualizarItem from "../../classes/VisualizarItem";
import styles from "./VisualizarObra.module.css";
import useBuscaUniversal from "../../classes/BuscaUniversal";

export default function VisualizarObra(props) {
  // Se receber o id via props, busca usando o hook universal
  const obraId = props.obraId || (props.itemParaVisualizar && props.itemParaVisualizar.id);
  const { item: obra, carregando, erro } = useBuscaUniversal("obra", obraId);

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div>{erro}</div>;
  if (!obra) return <div>Obra não encontrada</div>;

  return (
    <VisualizarItem
      item={obra}
      tipo="obra"
      clicado={props.clicado}
      fechar={props.fechar}
      denunciar={props.denunciar}
      mostrarDenunciar={true}
      estilosPersonalizados={{
        popupContent: styles.popupContent,
        popupImagem: styles.popupImagem,
        denunciarCompartilhar: styles.denunciarCompartilhar,
        botaoDenunciar: styles.botaoDenunciar,
        botaoCompartilhar: styles.botaoCompartilhar,
        botaoFechar: styles.botaoFechar
      }}
    />
  );
}