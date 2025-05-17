import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateStoryPDF(scenesMap, historyOrder, username) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Configuración de fuentes y estilos
  pdf.setFont('helvetica', 'normal');
  
  // Portada
  pdf.setFontSize(24);
  pdf.text('Barco de Vapor', 105, 30, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text(`Una aventura de ${username}`, 105, 45, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text(new Date().toLocaleDateString(), 105, 55, { align: 'center' });

  let currentY = 80;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;

  // Función para añadir nueva página
  const addNewPage = () => {
    pdf.addPage();
    currentY = margin;
    return currentY;
  };

  // Procesar cada escena de la historia
  for (let i = 0; i < historyOrder.length; i++) {
    const sceneId = historyOrder[i];
    const scene = scenesMap[sceneId];
    
    if (!scene) continue;

    // Verificar si hay espacio suficiente para la siguiente escena
    if (currentY > pageHeight - 60) {
      currentY = addNewPage();
    }

    // Título de la escena
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Escena ${i + 1}`, margin, currentY);
    currentY += lineHeight;

    // Texto de la escena
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(scene.text, pdf.internal.pageSize.width - 2 * margin);
    pdf.text(lines, margin, currentY);
    currentY += lines.length * lineHeight;

    // Incluir imagen si está disponible en la escena
    const imageUrl = scene.imageUrl;
    if (imageUrl) {
      try {
        const img = new Image();
        img.src = imageUrl;
        await new Promise(resolve => { img.onload = resolve; });

        // Ajustar dimensiones conservando proporción
        const imgWidth = 170;
        const imgHeight = (img.height * imgWidth) / img.width;

        if (currentY + imgHeight > pageHeight - margin) {
          currentY = addNewPage();
        }

        pdf.addImage(imageUrl, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + lineHeight;
      } catch (e) {
        console.error('Error al procesar imagen:', e);
      }
    }

    currentY += lineHeight * 2;
  }

  return pdf;
}

export function saveStoryPDF(username) {
  const timestamp = new Date().getTime();
  const filename = `barco-de-vapor_${username}_${timestamp}.pdf`;
  
  // Guardar referencia del PDF para 24h
  const pdfInfo = {
    filename,
    timestamp,
    username,
    expiresAt: timestamp + (24 * 60 * 60 * 1000) // 24 horas
  };
  
  const savedPDFs = JSON.parse(localStorage.getItem('savedPDFs') || '[]');
  savedPDFs.push(pdfInfo);
  localStorage.setItem('savedPDFs', JSON.stringify(savedPDFs));
  
  return filename;
}

export function cleanExpiredPDFs() {
  const now = new Date().getTime();
  const savedPDFs = JSON.parse(localStorage.getItem('savedPDFs') || '[]');
  const validPDFs = savedPDFs.filter(pdf => pdf.expiresAt > now);
  localStorage.setItem('savedPDFs', JSON.stringify(validPDFs));
}
