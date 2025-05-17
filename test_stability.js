require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function generarImagen(prompt) {
  const apiKey = process.env.STABILITY_API_KEY;
  const url = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

  const payload = {
    text_prompts: [{ text: prompt }],
    cfg_scale: 7,
    clip_guidance_preset: 'FAST_BLUE',
    height: 1024,
    width: 1024,
    samples: 1,
    steps: 30
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'image/png'
      },
      responseType: 'arraybuffer'
    });

    const imageBuffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync('imagen_generada.png', imageBuffer);
    console.log('✅ Imagen generada y guardada como imagen_generada.png');
  } catch (error) {
    console.error('❌ Error al generar la imagen:', error.response?.data || error.message);
  }
}

generarImagen('Un paisaje surrealista con montañas flotantes al atardecer');
