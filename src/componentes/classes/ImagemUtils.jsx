export function validarImagem(file, maxMB = 20) {
  if (!file.type.startsWith('image/')) {
    return 'Por favor, selecione apenas arquivos de imagem.';
  }
  if (file.size > maxMB * 1024 * 1024) {
    return `A imagem deve ter no máximo ${maxMB}MB.`;
  }
  return null;
}

export async function enviarImagem(file) {
  const url = 'https://api.cloudinary.com/v1_1/djacjrphb/image/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'urucum_preset');

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let errorMsg = 'Erro ao fazer upload para Cloudinary';
    try {
      const errorData = await response.json();
      if (errorData && errorData.error && errorData.error.message) {
        errorMsg += ': ' + errorData.error.message;
        if (errorData.error.message.includes('unsigned')) {
          errorMsg += ' (Vá ao painel do Cloudinary, edite o upload preset e marque como "unsigned")';
        }
      }
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.secure_url;
}

export function mostrarPreviewImagem(event, setImagemSelecionada, setPreviewImagem, validarImagem, maxMB = 10) {
  const file = event.target.files[0];
  if (file) {
    const erroValidacao = validarImagem(file, maxMB);
    if (erroValidacao) {
      alert(erroValidacao);
      return;
    }
    setImagemSelecionada(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImagem(event.target.result);
    };
    reader.readAsDataURL(file);
  }
}