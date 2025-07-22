import React, { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { enviarImagem } from './classes/ImagemUtils.jsx';

const CloudinaryUploadAndDisplay = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setImageUrl('');
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo primeiro.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = await enviarImagem(selectedFile);
      setImageUrl(url);
    } catch (err) {
      setError('Erro ao fazer upload: ' + err.message);
    }
    setLoading(false);
  };

  // Exemplo de uso do Cloudinary SDK para transformar a imagem
  let transformedImg = null;
  if (imageUrl) {
    const cld = new Cloudinary({ cloud: { cloudName: 'djacjrphb' } });
    // Pega o publicId da URL
    const publicId = imageUrl.split('/').pop().split('.')[0];
    transformedImg = cld
      .image(publicId)
      .format('auto')
      .quality('auto')
      .resize(auto().gravity(autoGravity()).width(500).height(500));
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload e Visualização de Imagem Cloudinary</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: 10 }}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <div>URL da imagem:</div>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">{imageUrl}</a>
          <div style={{ marginTop: 10 }}>
            <img src={imageUrl} alt="Preview" style={{ maxWidth: 300 }} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div>Transformação via Cloudinary SDK:</div>
            {transformedImg && <AdvancedImage cldImg={transformedImg} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploadAndDisplay;