import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadElementAsJPEG = async (
  element: HTMLElement,
  fileName: string,
) => {
  const canvas = await html2canvas(element);
  const data = canvas.toDataURL('image/jpeg', 1.0);
  const link = document.createElement('a');
  link.href = data;
  link.download = fileName;
  link.click();
};

export const downloadElementAsPDF = async (
  element: HTMLElement,
  fileName: string,
) => {
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(fileName);
};