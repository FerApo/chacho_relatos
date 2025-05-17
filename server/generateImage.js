import axios from 'axios';
import { config } from 'dotenv';
import translate from 'translate';
import fs from 'fs';

config();
translate.engine = 'google';

function limpiar(t) {
  return t
    .replace(/\*\*/g, '')      // **markdown**
    .replace(/[¿¡]/g, '')      // signos ES
    .replace(/\r?\n/g, ' ')    // saltos de línea
    .trim();
}

function soloAscii(t) {
  return /^[\x00-\x7F]*$/.test(t); // nada con acentos, ñ, etc.
}

export default async function generateImage(prompt) {
  if (!process.env.STABILITY_API_KEY) {
    throw new Error('STABILITY_API_KEY no definida en .env');
  }

  try {
    // 1. Última línea no vacía del texto
    let linea = prompt.split('\n').map(l => l.trim()).filter(Boolean).at(-1) || '';
    linea = limpiar(linea);

    // 2. Añadir estilo único
    const estiloLapiz =
      'realistic graphite pencil sketch, charcoal shading, cinematic lighting, highly detailed, no childish style, for all audiences';
    const promptFinal =
      linea.length >= 3 ? `${linea}. ${estiloLapiz}` : `Scene description. ${estiloLapiz}`;

    // 3. Traducir ES->EN de forma robusta
    const translateSafe = async text => {
      try {
        let en = await translate(text, { from: 'es', to: 'en' });
        if (!soloAscii(en)) en = await translate(en, { to: 'en' });
        return en;
      } catch {
        console.warn('[generateImage] fallo traducción, uso texto original');
        return text;
      }
    };
    const enPrompt = await translateSafe(promptFinal);

    console.log('[generateImage] prompt EN:', enPrompt);

    // 4. Llamada a Stability AI con 1 reintento para errores 5xx
    const requestImage = async (retries = 1) => {
      try {
        return await axios.post(
          'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          {
            text_prompts: [{ text: enPrompt }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
              'Content-Type': 'application/json',
              Accept: 'image/png'
            },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );
      } catch (err) {
        if (retries > 0 && (!err.response || err.response.status >= 500)) {
          console.warn('[generateImage] Reintentando petición de imagen…');
          return requestImage(retries - 1);
        }
        throw err;
      }
    };

    const response = await requestImage(1);

    // 5. Codificar a base64
    const imageBuffer = Buffer.from(response.data, 'binary');
    const base64Image = imageBuffer.toString('base64');

    // 6. (Opt) guardar en disco para depuración
    // fs.writeFileSync('imagen_generada.png', imageBuffer);

    console.log('✅ Imagen generada correctamente');
    return base64Image;
  } catch (err) {
    if (err.response?.status === 429) {
      console.error('[generateImage] 429 - Rate limit o créditos agotados');
      throw new Error(
        'Límite de peticiones a Stability AI excedido o créditos agotados. Intenta más tarde o revisa tu cuenta.'
      );
    }
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    console.error('[generateImage] axios-error:', msg);
    throw new Error(msg);
  }
}
