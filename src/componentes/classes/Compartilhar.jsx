export default function Compartilhar({ obraId, titulo, artista, tipo = 'obra', customUrl = null, uniqueId = null }) {
    const compartilharObra = async () => {
        try {
            // Check if required ID is available
            if (!obraId) {
                console.error('ID não foi fornecido:', { obraId, titulo, artista, tipo });
                alert(`Erro: ID ${tipo === 'perfil' ? 'do perfil' : 'da obra'} não encontrado. Não é possível compartilhar.`);
                return;
            }

            // Generate the URL based on type
            let url;
            if (customUrl) {
                url = customUrl;
            } else if (tipo === 'perfil') {
                // Se obraId já contém uniqueId, use direto, senão monte com uniqueId se disponível
                if (uniqueId && typeof uniqueId === "string" && uniqueId !== "null" && uniqueId !== "undefined") {
                    url = `${window.location.origin}/perfil-artista/${encodeURIComponent(obraId)}-${uniqueId}`;
                } else {
                    url = `${window.location.origin}/perfil-artista/${encodeURIComponent(obraId)}`;
                }
            } else if (tipo === 'colecao') {
                url = `${window.location.origin}/colecao/${obraId}`;
            } else if (tipo === 'obra') {
                url = `${window.location.origin}/obra/${obraId}`;
            } else {
                // fallback para outros tipos
                url = `${window.location.origin}/${tipo}/${obraId}`;
            }

            // Copy to clipboard using the Clipboard API
            await navigator.clipboard.writeText(url);
            
            // Show success message
            const mensagem = tipo === 'perfil' ? 'Link do perfil copiado para a área de transferência!' : 'Link copiado para a área de transferência!';
            alert(mensagem);
        } catch (error) {
            // Fallback for older browsers or if clipboard API fails
            try {
                if (!obraId) {
                    alert(`Erro: ID ${tipo === 'perfil' ? 'do perfil' : 'da obra'} não encontrado. Não é possível compartilhar.`);
                    return;
                }
                
                let url;
                if (customUrl) {
                    url = customUrl;
                } else if (tipo === 'perfil') {
                    if (uniqueId && typeof uniqueId === "string" && uniqueId !== "null" && uniqueId !== "undefined") {
                        url = `${window.location.origin}/perfil-artista/${encodeURIComponent(obraId)}-${uniqueId}`;
                    } else {
                        url = `${window.location.origin}/perfil-artista/${encodeURIComponent(obraId)}`;
                    }
                } else if (tipo === 'colecao') {
                    url = `${window.location.origin}/colecao/${obraId}`;
                } else if (tipo === 'obra') {
                    url = `${window.location.origin}/obra/${obraId}`;
                } else {
                    url = `${window.location.origin}/${tipo}/${obraId}`;
                }

                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                const mensagem = tipo === 'perfil' ? 'Link do perfil copiado para a área de transferência!' : 'Link copiado para a área de transferência!';
                alert(mensagem);
            } catch (fallbackError) {
                console.error('Erro ao copiar para a área de transferência:', fallbackError);
                alert('Erro ao copiar o link. Tente novamente.');
            }
        }
    };

    return {
        compartilharObra
    };
}