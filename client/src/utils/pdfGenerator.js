import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

export const generateGardenPDF = async (elementId,  onLoadingChange ) => {
  const loadingToast = toast.loading("Generating your high-quality PDF...");
  
  // Set the loading state to true via callback
  if (typeof onLoadingChange === 'function') {
    onLoadingChange(true);
  }

  const element = document.getElementById(elementId);
  const pdfHeader = document.getElementById('pdf-header');
  const floatingBar = document.querySelector('.floating-bar-class');

  if (!element) {
    onLoadingChange(false);
    toast.dismiss(loadingToast);
    return;
  }

  // 1. CAPTURE MODE
  if (pdfHeader) pdfHeader.style.setProperty('display', 'block', 'important');
  if (floatingBar) floatingBar.style.setProperty('display', 'none', 'important');
  
  const originalStyles = {
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    position: element.style.position,
    overflow: element.style.overflow
  };
  
  element.style.overflow = 'visible';
  
  if (window.innerWidth < 900) {
    element.style.width = '1200px'; 
    element.style.maxWidth = '1200px';
    element.style.marginLeft = 'auto';
    element.style.marginRight = 'auto';
  }

  window.scrollTo(0, 0);
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    
    pdf.addImage(imgData, 'JPEG', (pdfWidth - width) / 2, (pdfHeight - height) / 2, width, height);
    pdf.save('My_Garden_Plan.pdf');
    toast.success("Report Ready!", { id: loadingToast });
    
  } catch (error) {
    console.error("PDF Error:", error);
    toast.error("Error generating PDF.", { id: loadingToast });
  } finally {
    // 2. RESTORE UI
    if (pdfHeader) pdfHeader.style.display = 'none';
    if (floatingBar) floatingBar.style.display = 'flex';
    
    element.style.width = originalStyles.width;
    element.style.maxWidth = originalStyles.maxWidth;
    element.style.position = originalStyles.position;
    element.style.overflow = originalStyles.overflow;
    
    if (window.innerWidth < 900) {
      element.style.marginLeft = '';
      element.style.marginRight = '';
    }
    
    // Set loading state back to false via callback
    onLoadingChange(false);
  }
};