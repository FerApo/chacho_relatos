
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';

export function saveFavoriteStory(storyData, history, username) {
  const timestamp = new Date().getTime();
  const storyInfo = {
    id: `story_${timestamp}`,
    timestamp,
    username,
    title: `Aventura del ${format(new Date(), 'dd MMMM yyyy', { locale: es })}`,
    history,
    storyData: JSON.parse(JSON.stringify(storyData)),
    images: {},
  };

  // Guardar imágenes asociadas
  history.forEach(sceneId => {
    const imageUrl = localStorage.getItem(`storyImages_${sceneId}`);
    if (imageUrl) {
      storyInfo.images[sceneId] = imageUrl;
    }
  });

  const favoriteStories = JSON.parse(localStorage.getItem('favoriteStories') || '[]');
  favoriteStories.push(storyInfo);
  localStorage.setItem('favoriteStories', JSON.stringify(favoriteStories));

  return storyInfo;
}

export async function generateAnnualBook(username, year = new Date().getFullYear()) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Configuración de alta calidad
  pdf.setProperties({
    title: `VaporTales de ${username} - ${year}`,
    author: username,
    creator: 'VaporTales',
    producer: 'VaporTales Publishing',
    resolution: 300
  });

  // Portada elegante
  pdf.setFillColor(240, 240, 255);
  pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.setTextColor(50, 50, 100);
  pdf.text('VaporTales', 105, 80, { align: 'center' });
  
  pdf.setFontSize(24);
  pdf.text(`de ${username}`, 105, 100, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.text(year.toString(), 105, 120, { align: 'center' });

  // Índice
  pdf.addPage();
  pdf.setFontSize(24);
  pdf.text('Índice', 20, 30);

  const favoriteStories = JSON.parse(localStorage.getItem('favoriteStories') || '[]')
    .filter(story => new Date(story.timestamp).getFullYear() === year);

  let currentY = 50;
  favoriteStories.forEach((story, index) => {
    pdf.setFontSize(12);
    pdf.text(`${index + 1}. ${story.title}`, 20, currentY);
    currentY += 10;
  });

  // Contenido
  for (const story of favoriteStories) {
    pdf.addPage();
    
    // Título de la historia
    pdf.setFontSize(24);
    pdf.text(story.title, 105, 30, { align: 'center' });
    
    let currentY = 50;
    const margin = 20;
    const lineHeight = 7;

    // Procesar cada escena
    for (const sceneId of story.history) {
      const scene = story.storyData[sceneId];
      if (!scene) continue;

      if (currentY > pdf.internal.pageSize.height - 60) {
        pdf.addPage();
        currentY = margin;
      }

      // Texto de la escena
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(scene.text, pdf.internal.pageSize.width - 2 * margin);
      pdf.text(lines, margin, currentY);
      currentY += lines.length * lineHeight;

      // Imagen de la escena
      const imageUrl = story.images[sceneId];
      if (imageUrl) {
        try {
          const img = new Image();
          img.src = imageUrl;
          await new Promise(resolve => { img.onload = resolve; });

          const imgWidth = 170;
          const imgHeight = (img.height * imgWidth) / img.width;

          if (currentY + imgHeight > pdf.internal.pageSize.height - margin) {
            pdf.addPage();
            currentY = margin;
          }

          pdf.addImage(imageUrl, 'PNG', margin, currentY, imgWidth, imgHeight, undefined, 'FAST');
          currentY += imgHeight + lineHeight;
        } catch (error) {
          console.error('Error al procesar imagen:', error);
        }
      }

      currentY += lineHeight * 2;
    }
  }

  return pdf;
}

export function getPublishingInfo(username, year = new Date().getFullYear()) {
  const publishingInfo = JSON.parse(localStorage.getItem('publishingInfo') || '{}');
  return publishingInfo[`${username}_${year}`] || {
    isPublished: false,
    isbn: null,
    salesCount: 0,
    earnings: 0,
    royalties: {
      user: 0,
      app: 0,
      ai: 0
    }
  };
}

export function updatePublishingInfo(username, year, info) {
  const publishingInfo = JSON.parse(localStorage.getItem('publishingInfo') || '{}');
  publishingInfo[`${username}_${year}`] = {
    ...publishingInfo[`${username}_${year}`],
    ...info
  };
  localStorage.setItem('publishingInfo', JSON.stringify(publishingInfo));
}

export function generateISBN() {
  // Simulación de generación de ISBN
  const prefix = "979-8";
  const random = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  const isbn = `${prefix}-${random}`;
  return isbn;
}
