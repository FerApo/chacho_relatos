import { getTokenBalance, updateTokenBalance, calculateTokenUsage, hasEnoughTokens } from '@/lib/tokenManager';

// Helper para llamar al backend (sin campo model)
export async function chatCompletion({ messages, temperature = 0.8, max_tokens = 512 }) {
  const base = import.meta.env.VITE_API_BASE || '';
  const url = base ? `${base}/api/chat-completion` : '/api/chat-completion';
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Se requiere un array de mensajes para la generación de historia.');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, temperature, max_tokens })
  });
  if (!res.ok) throw new Error('CHAT_COMPLETION_ERROR');
  return res.json();
}

// --- OPTIMIZACIÓN DE TOKENS: RESÚMENES ---
// Resume un texto a máximo 200 caracteres
function summarizeText(text) {
  if (!text) return '';
  if (text.length <= 200) return text;
  return text.slice(0, 200) + '...';
}

// Recupera los últimos 5 resúmenes de localStorage
function getSummaries() {
  const stored = localStorage.getItem('storySummaries');
  return stored ? JSON.parse(stored) : [];
}

// Guarda los últimos 3 resúmenes en localStorage
function saveSummaries(summaries) {
  const lastThree = summaries.slice(-3);
  localStorage.setItem('storySummaries', JSON.stringify(lastThree));
}

// Limpia los resúmenes (por ejemplo, al iniciar una historia nueva)
function clearSummaries() {
  localStorage.removeItem('storySummaries');
}

// --- FIN OPTIMIZACIÓN ---

export async function generateTitle(storyText, username) {
  const currentBalance = getTokenBalance();
  if (!hasEnoughTokens(currentBalance)) {
    throw new Error('INSUFFICIENT_TOKENS');
  }

  try {
    const messages = [
      {
        role: "system",
        content: "Eres un experto en crear títulos atractivos y memorables para historias infantiles y juveniles. Genera un título breve y cautivador basado en el contenido de la historia."
      },
      {
        role: "user",
        content: `Crea un título atractivo y breve (máximo 6 palabras) para esta historia:\n\n${storyText}`
      }
    ];
    const response = await chatCompletion({
      messages,
      temperature: 0.8,
      max_tokens: 50
    });

    const tokensUsed = calculateTokenUsage(response);
    const newBalance = currentBalance - tokensUsed;
    updateTokenBalance(newBalance);

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generando el título:', error);
    if (error.message === 'INSUFFICIENT_TOKENS') {
      throw new Error('INSUFFICIENT_TOKENS');
    }
    return `La aventura de ${username}`;
  }
}

export async function generateInitialScene(username) {
  const currentBalance = getTokenBalance();
  if (!hasEnoughTokens(currentBalance)) {
    throw new Error('INSUFFICIENT_TOKENS');
  }

  // Limpiar resúmenes al iniciar historia nueva
  clearSummaries();

  const storyType = localStorage.getItem('storyType');
  const genre = localStorage.getItem('genre');
  const customPrompt = localStorage.getItem('customPrompt');

  // Validación defensiva de campos requeridos
  if (!username || !storyType || (storyType === 'genre' && !genre) || (storyType === 'custom' && !customPrompt)) {
    throw new Error('Faltan datos requeridos para generar la historia.');
  }

  try {
    let systemPrompt, userPrompt;

    if (storyType === 'custom' && customPrompt) {
      systemPrompt = `Eres un narrador experto en crear historias interactivas para niños y jóvenes. Crea una historia inmersiva y emocionante basada en la idea proporcionada por el usuario, manteniendo un tono apropiado para todo público.\nIMPORTANTE: Siempre responde usando el formato: [Historia...] |OPCIONES| 1. ... 2. ... 3. ... Si no usas |OPCIONES|, la aplicación fallará.`;
      userPrompt = `Genera una historia interactiva basada en esta idea: "${customPrompt}". Incluye la historia inicial Y tres opciones para continuar, separadas por '|OPCIONES|'.\nPor ejemplo:\n[Historia inicial...]\n|OPCIONES|\n1. [Primera opción]\n2. [Segunda opción]\n3. [Tercera opción]`;
    } else {
      systemPrompt = storyType === 'personal'
        ? `Eres un narrador experto en crear historias interactivas para niños y jóvenes donde ${username} es el protagonista. Crea historias inmersivas y emocionantes, siempre manteniendo un tono apropiado para todo público.\nIMPORTANTE: Siempre responde usando el formato: [Historia...] |OPCIONES| 1. ... 2. ... 3. ... Si no usas |OPCIONES|, la aplicación fallará.`
        : `Eres un narrador experto en crear historias interactivas de ${genre} para niños y jóvenes. Crea historias inmersivas y emocionantes en este género, siempre manteniendo un tono apropiado para todo público.\nIMPORTANTE: Siempre responde usando el formato: [Historia...] |OPCIONES| 1. ... 2. ... 3. ... Si no usas |OPCIONES|, la aplicación fallará.`;

      userPrompt = storyType === 'personal'
        ? `Genera una historia interactiva donde ${username} es el protagonista. Incluye la historia inicial Y tres opciones para continuar, separadas por '|OPCIONES|'.\nPor ejemplo:\n[Historia inicial...]\n|OPCIONES|\n1. [Primera opción]\n2. [Segunda opción]\n3. [Tercera opción]`
        : `Genera una historia interactiva de ${genre}. Incluye la historia inicial Y tres opciones para continuar, separadas por '|OPCIONES|'.\nPor ejemplo:\n[Historia inicial...]\n|OPCIONES|\n1. [Primera opción]\n2. [Segunda opción]\n3. [Tercera opción]`;
    }

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `${userPrompt}\n\nPor ejemplo:\n[Historia inicial...]\n|OPCIONES|\n1. [Primera opción]\n2. [Segunda opción]\n3. [Tercera opción]`
      }
    ];
    const response = await chatCompletion({
      messages,
      temperature: 0.8,
      max_tokens: 800
    });

    // Validación robusta de la respuesta
    let fullResponse = '';
    if (response?.reply) {
      fullResponse = response.reply;
    } else if (typeof response === 'string') {
      fullResponse = response;
    } else {
      console.error('Respuesta inesperada del backend:', response);
      throw new Error('La respuesta del modelo no tiene el formato esperado.');
    }

    if (!fullResponse || typeof fullResponse !== 'string' || !fullResponse.includes('|OPCIONES|')) {
      throw new Error('La respuesta del modelo no tiene el formato esperado.');
    }
    const [storyText] = fullResponse.split('|OPCIONES|');
    const optionsText = fullResponse.split('|OPCIONES|')[1] || '';
    const options = optionsText
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(option => ({
        text: option.replace(/^\d+\.\s*/, '').trim(),
        nextScene: `scene_${Date.now()}_${Math.random()}`
      }));

    if (storyType === 'custom') {
      localStorage.removeItem('customPrompt');
    }

    return {
      text: storyText ? storyText.trim() : '',
      choices: options,
      isEnding: false
    };
  } catch (error) {
    console.error('Error generando la historia inicial:', error);
    if (error.message === 'INSUFFICIENT_TOKENS') {
      throw new Error('INSUFFICIENT_TOKENS');
    }
    throw new Error('No se pudo generar la historia inicial');
  }
}

export async function continueStory(currentStory, choiceMade, username, history = []) {
  const currentBalance = getTokenBalance();
  if (!hasEnoughTokens(currentBalance)) {
    throw new Error('INSUFFICIENT_TOKENS');
  }

  const storyType = localStorage.getItem('storyType');
  const genre = localStorage.getItem('genre');

  try {
    // --- OPTIMIZACIÓN: usar solo los últimos 5 resúmenes ---
    let summaries = getSummaries();
    // Resumir la última respuesta (currentStory) y añadirla
    const lastSummary = summarizeText(currentStory);
    summaries.push(lastSummary);
    saveSummaries(summaries);
    // Prepara un prompt con los últimos 3 resúmenes
    summaries = getSummaries(); // Asegura que solo haya 3
    const summaryPrompt = summaries.length > 0
      ? `[Últimos resúmenes:]\n${summaries.join('\n')}\n\n`
      : '';
    // --- FIN OPTIMIZACIÓN ---

    // Optimizar el contexto usando solo los últimos 3 fragmentos
    const recentHistory = history.slice(-3);
    const contextPrompt = recentHistory.length > 0 
      ? `[Contexto reciente:]\n${recentHistory.join('\n\n')}\n\n`
      : '';

    const systemPrompt = storyType === 'personal'
      ? `Eres un narrador experto en crear historias interactivas para niños y jóvenes donde ${username} es el protagonista. Continúa la historia de forma coherente y emocionante basándote en la elección del usuario.`
      : `Eres un narrador experto en crear historias interactivas de ${genre}. Continúa la historia de forma coherente y emocionante basándote en la elección del usuario.`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `${summaryPrompt}${contextPrompt}Historia actual: "${currentStory}"\nElección: "${choiceMade}"\n\nContinúa la historia y proporciona tres nuevas opciones, separadas por '|OPCIONES|'.\n\nPor ejemplo:\n[Continuación de la historia...]\n|OPCIONES|\n1. [Primera opción]\n2. [Segunda opción]\n3. [Tercera opción]`
      }
    ];
    const response = await chatCompletion({
      messages,
      temperature: 0.7,
      max_tokens: 800
    });

    // Guardar resumen de la nueva respuesta
    let fullResponse = '';
    if (response?.reply) {
      fullResponse = response.reply;
    } else if (typeof response === 'string') {
      fullResponse = response;
    } else {
      console.error('Respuesta inesperada del backend:', response);
      throw new Error('La respuesta del modelo no tiene el formato esperado.');
    }
    const [storyText] = fullResponse.split('|OPCIONES|');
    const newSummary = summarizeText(storyText.trim());
    let updatedSummaries = getSummaries();
    updatedSummaries.push(newSummary);
    saveSummaries(updatedSummaries);

    const tokensUsed = calculateTokenUsage(response);
    const newBalance = currentBalance - tokensUsed;
    updateTokenBalance(newBalance);

    const optionsText = fullResponse.split('|OPCIONES|')[1];
    const options = optionsText
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(option => ({
        text: option.replace(/^\d+\.\s*/, '').trim(),
        nextScene: `scene_${Date.now()}_${Math.random()}`
      }));

    return {
      text: storyText.trim(),
      choices: options,
      isEnding: false
    };
  } catch (error) {
    console.error('Error continuando la historia:', error);
    if (error.message === 'INSUFFICIENT_TOKENS') {
      throw new Error('INSUFFICIENT_TOKENS');
    }
    throw new Error('No se pudo continuar la historia');
  }
}

export async function generateEnding(currentStory, username, history = []) {
  const currentBalance = getTokenBalance();
  if (!hasEnoughTokens(currentBalance)) {
    throw new Error('INSUFFICIENT_TOKENS');
  }

  const storyType = localStorage.getItem('storyType');
  const genre = localStorage.getItem('genre');

  try {
    // --- OPTIMIZACIÓN: usar solo los últimos 5 resúmenes ---
    let summaries = getSummaries();
    const lastSummary = summarizeText(currentStory);
    summaries.push(lastSummary);
    saveSummaries(summaries);
    // Prepara un prompt con los últimos 3 resúmenes
    summaries = getSummaries();
    const summaryPrompt = summaries.length > 0
      ? `[Últimos resúmenes:]\n${summaries.join('\n')}\n\n`
      : '';
    // --- FIN OPTIMIZACIÓN ---

    // Optimizar el contexto usando solo los últimos 3 fragmentos
    const recentHistory = history.slice(-3);
    const contextPrompt = recentHistory.length > 0 
      ? `[Contexto reciente:]\n${recentHistory.join('\n\n')}\n\n`
      : '';

    const systemPrompt = storyType === 'personal'
      ? `Genera un final épico y satisfactorio para la historia de ${username}, cerrando todas las tramas pendientes de forma positiva y memorable.`
      : `Genera un final épico y satisfactorio para esta historia de ${genre}, cerrando todas las tramas pendientes de forma positiva y memorable.`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `${summaryPrompt}${contextPrompt}Historia actual: "${currentStory}"\n\nCrea un final memorable para la aventura.`
      }
    ];
    const response = await chatCompletion({
      messages,
      temperature: 0.8,
      max_tokens: 500
    });

    // Limpiar resúmenes al terminar la historia
    let fullResponse = '';
    if (response?.reply) {
      fullResponse = response.reply;
    } else if (typeof response === 'string') {
      fullResponse = response;
    } else {
      console.error('Respuesta inesperada del backend:', response);
      throw new Error('La respuesta del modelo no tiene el formato esperado.');
    }
    clearSummaries();

    const tokensUsed = calculateTokenUsage(response);
    const newBalance = currentBalance - tokensUsed;
    updateTokenBalance(newBalance);

    return {
      text: fullResponse.trim(),
      choices: [],
      isEnding: true
    };
  } catch (error) {
    console.error('Error generando el final:', error);
    if (error.message === 'INSUFFICIENT_TOKENS') {
      throw new Error('INSUFFICIENT_TOKENS');
    }
    throw new Error('No se pudo generar el final de la historia');
  }
}
