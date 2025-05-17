
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { 
  Book, 
  DollarSign, 
  Printer, 
  Share2, 
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { 
  getPublishingInfo, 
  updatePublishingInfo, 
  generateISBN,
  generateAnnualBook 
} from '@/lib/annualBook';
import { 
  calculatePrintingCosts,
  initiatePrintOrder 
} from '@/lib/printOnDemand';

function PublishingDashboard({ username }) {
  const [publishingInfo, setPublishingInfo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const info = getPublishingInfo(username, currentYear);
    setPublishingInfo(info);
  }, [username]);

  const handleGenerateBook = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generateAnnualBook(username, currentYear);
      const filename = `VaporTales_${username}_${currentYear}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "¡Libro generado!",
        description: "Tu libro anual ha sido creado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el libro",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishToggle = async (enabled) => {
    if (enabled && !publishingInfo.isbn) {
      const isbn = generateISBN();
      const updatedInfo = {
        ...publishingInfo,
        isPublished: true,
        isbn
      };
      updatePublishingInfo(username, currentYear, updatedInfo);
      setPublishingInfo(updatedInfo);
      
      toast({
        title: "¡Libro publicado!",
        description: `ISBN asignado: ${isbn}`,
      });
    } else {
      const updatedInfo = {
        ...publishingInfo,
        isPublished: enabled
      };
      updatePublishingInfo(username, currentYear, updatedInfo);
      setPublishingInfo(updatedInfo);
    }
  };

  const handlePrintRequest = async () => {
    setIsPrinting(true);
    try {
      const costs = await calculatePrintingCosts(100, 'softcover', 'standard');
      
      await initiatePrintOrder({
        title: `VaporTales de ${username} - ${currentYear}`,
        format: 'softcover',
        pages: 100,
        isbn: publishingInfo.isbn
      }, {
        amount: costs.total
      });
      
      toast({
        title: "Pedido iniciado",
        description: "Redirigiendo al proceso de pago...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el pedido de impresión",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Book className="h-6 w-6" />
          Panel de Publicación
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Estadísticas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10">
                <ShoppingCart className="h-5 w-5 mb-2" />
                <div className="text-2xl font-bold">{publishingInfo?.salesCount || 0}</div>
                <div className="text-sm opacity-70">Ventas</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 mb-2" />
                <div className="text-2xl font-bold">${publishingInfo?.earnings || 0}</div>
                <div className="text-sm opacity-70">Ganancias</div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Acciones</h3>
            <div className="space-y-4">
              <Button
                onClick={handleGenerateBook}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Book className="mr-2 h-4 w-4" />
                )}
                Generar Libro Anual
              </Button>

              <Button
                onClick={handlePrintRequest}
                disabled={isPrinting}
                variant="outline"
                className="w-full"
              >
                {isPrinting ? (
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                Solicitar Impresión
              </Button>
            </div>
          </div>

          {/* Publicación */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Publicación</h3>
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                <span>Publicar en plataformas</span>
              </div>
              <Switch
                checked={publishingInfo?.isPublished || false}
                onCheckedChange={handlePublishToggle}
              />
            </div>

            {publishingInfo?.isPublished && (
              <div className="p-4 rounded-lg bg-primary/10">
                <h4 className="font-semibold mb-2">Información de publicación</h4>
                <p>ISBN: {publishingInfo.isbn}</p>
                <div className="mt-4">
                  <h5 className="font-semibold mb-2">Distribución de royalties</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Usuario</div>
                      <div>60%</div>
                    </div>
                    <div>
                      <div className="font-medium">Plataforma</div>
                      <div>35%</div>
                    </div>
                    <div>
                      <div className="font-medium">IA</div>
                      <div>5%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PublishingDashboard;
