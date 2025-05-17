const STYLE_PREFIX =
  'simple black and white line art, clean pencil sketch, no shading, no background, coloring book style, only outlines, no fill, no shadows, minimal detail, just contours';

/**
 * Devuelve los primeros n caracteres del texto, cortando en la última palabra.
 */
function getPromptFragment(text, n = 200) {
  if (!text) return '';
  if (text.length <= n) return text;
  const truncated = text.slice(0, n);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.slice(0, lastSpace > n/2 ? lastSpace : n).trim();
}

export async function generateIllustration(prompt) {
  try {
    // Tomar fragmento breve del prompt original
    const fragment = getPromptFragment(prompt, 200);
    const styledPrompt = `${STYLE_PREFIX}. ${fragment}`;
    const resp = await fetch('http://localhost:4000/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: styledPrompt }),
    });
    if (!resp.ok) throw new Error('Backend error');
    const data = await resp.json();
    // Log para depuración
    console.log('Respuesta imagen:', data);
    // url es base64, devolver como data URL
    if (data.url && typeof data.url === 'string') {
      return { url: `data:image/png;base64,${data.url}`, error: false };
    } else if (data.base64 && typeof data.base64 === 'string') {
      // fallback por si el backend devuelve base64
      return { url: `data:image/png;base64,${data.base64}`, error: false };
    } else {
      throw new Error('Respuesta de imagen inválida');
    }
  } catch (err) {
    console.error('Error ilustración:', err);
    return { url: null, error: true };
  }
}

export function getStoredImage(sceneId) {
  try {
    const images = JSON.parse(localStorage.getItem('storyImages') || '{}');
    return images[sceneId];
  } catch (error) {
    console.error('Error recuperando imagen:', error);
    return null;
  }
}

export function storeImage(sceneId, imageUrl) {
  try {
    const images = JSON.parse(localStorage.getItem('storyImages') || '{}');
    images[sceneId] = imageUrl;
    localStorage.setItem('storyImages', JSON.stringify(images));
    localStorage.setItem(`storyImages_${sceneId}`, imageUrl);
  } catch (error) {
    console.error('Error guardando imagen:', error);
  }
}
