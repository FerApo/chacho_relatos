import * as dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const fakeKeyForLocal = 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Clave falsa para desarrollo local

// Asegúrate de que la clave API de Groq esté configurada en producción
if (process.env.NODE_ENV === 'production' && !GROQ_API_KEY) {
  console.error('Error: GROQ_API_KEY no está configurada en el entorno de producción.');
  // Considera lanzar un error o manejar esto de una manera que detenga la aplicación si es crítico
  // throw new Error('GROQ_API_KEY is not configured for production.');
}


async function chatCompletion(inputMessages, temperature = 0.8, max_tokens = 512) {
  const apiKey = GROQ_API_KEY || (process.env.NODE_ENV === 'development' ? fakeKeyForLocal : null);

  if (!apiKey && process.env.NODE_ENV !== 'development') {
    console.error('Error: API key for Groq is not configured.');
    throw new Error('API key for Groq is not configured.');
  }
  if (process.env.NODE_ENV === 'development' && !GROQ_API_KEY) {
    console.warn('Advertencia: GROQ_API_KEY no está configurada. Usando clave falsa para desarrollo local.');
  }
  
  // Validar que inputMessages sea un array y no esté vacío
  if (!Array.isArray(inputMessages) || inputMessages.length === 0) {
    console.error('Error: inputMessages debe ser un array y no puede estar vacío.');
    throw new Error('inputMessages must be a non-empty array.');
  }

  const payload = {
    messages: inputMessages, // Usar directamente los mensajes de entrada
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    temperature,
    max_tokens,
  };

  // Usar el endpoint correcto de Groq
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  console.log('[chatCompletion] usando URL:', url);

  try {
    const groqResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error('Groq API error: ' + errorText);
    }

    const data = await groqResponse.json();
    
    // Extraer el contenido de la respuesta con optional chaining
    const reply = data.choices?.[0]?.message?.content?.trim() || '';
    if (!reply) {
      console.warn('[chatCompletion] Respuesta vacía de Groq API:', data);
    }

    // Retornar siempre en { reply }
    return { reply };
  } catch (error) {
    console.error('Error en la comunicación con la API de Groq:', error);
    throw new Error('Error en la comunicación con la API de Groq: ' + error.message);
  }
}

export default chatCompletion;
