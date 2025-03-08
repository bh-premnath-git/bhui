import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Download, Save, Image } from "lucide-react";
import { QueryResult } from "@/types/data-catalog/xplore/type";
import { toast } from "sonner";
import { useDashboard } from "@/context/DashboardContext";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

interface DataActionMenuProps {
  result: QueryResult;
}

export function DataActionMenu({ result }: DataActionMenuProps) {
  const { saveToDashboard } = useDashboard();

  const convertChartToImage = async () => {
    const chartElement = document.querySelector('.recharts-wrapper svg');
    if (!chartElement) {
      throw new Error('Chart element not found');
    }

    // Convert SVG to canvas
    const svgData = new XMLSerializer().serializeToString(chartElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create canvas with 2x scale for better quality
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Create temporary image and load it
    const img = document.createElement('img');
    img.src = svgUrl;
    
    await new Promise((resolve, reject) => {
      const onLoad = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        resolve(true);
      };
      const onError = () => reject(new Error('Failed to load image'));
      
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    });

    // Cleanup
    URL.revokeObjectURL(svgUrl);
    
    return canvas;
  };

  const handleDownloadImage = async () => {
    try {
      const canvas = await convertChartToImage();
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${result.title?.toLowerCase().replace(/\s+/g, '_') || 'chart'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Error downloading image');
    }
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    
    // Add title
    const title = result.title || (result.type === 'table' ? 'Table Results' : 'Chart Results');
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(12);

    // Add timestamp
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated on: ${timestamp}`, 14, 30);

    let finalY = 40;

    if (result.type === 'table' && result.columns && result.data) {
      // Convert data to format expected by autoTable
      const tableData = Array.isArray(result.data) ? result.data.map(row => 
        result.columns!.map(col => row[col])
      ) : [];

      autoTable(doc, {
        head: [result.columns],
        body: tableData,
        startY: 40,
        margin: { top: 40 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [136, 132, 216] },
        didDrawPage: (data) => {
          if (data.cursor) {
            finalY = data.cursor.y;
          }
        }
      });
    } else if (result.type === 'chart') {
      try {
        const canvas = await convertChartToImage();
        
        // Add chart image to PDF
        const chartWidth = 180;
        const chartHeight = (canvas.height/2 * chartWidth) / (canvas.width/2);
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', 14, 40, chartWidth, chartHeight);
        finalY = 40 + chartHeight + 20;

        // Add data table below the chart
        const chartData = Array.isArray(result.data) ? result.data.map(item => [
          item.name,
          item.value.toString()
        ]) : [];

        autoTable(doc, {
          head: [[result.xAxis || 'Name', result.yAxis || 'Value']],
          body: chartData,
          startY: finalY,
          margin: { top: 40 },
          styles: { fontSize: 10 },
          headStyles: { fillColor: [136, 132, 216] },
          didDrawPage: (data) => {
            if (data.cursor) {
              finalY = data.cursor.y;
            }
          }
        });

        // Add note about chart visualization
        const note = "Note: This PDF includes both the chart visualization and the underlying data.";
        const splitNote = doc.splitTextToSize(note, 180);
        doc.text(splitNote, 14, finalY + 20);
      } catch (error) {
        console.error('Error generating chart PDF:', error);
        toast.error('Error generating chart PDF. Falling back to data-only view.');
        
        // Fallback to data-only view
        const chartData = Array.isArray(result.data) ? result.data.map(item => [
          item.name,
          item.value.toString()
        ]) : [];

        autoTable(doc, {
          head: [[result.xAxis || 'Name', result.yAxis || 'Value']],
          body: chartData,
          startY: 40,
          margin: { top: 40 },
          styles: { fontSize: 10 },
          headStyles: { fillColor: [136, 132, 216] },
          didDrawPage: (data) => {
            if (data.cursor) {
              finalY = data.cursor.y;
            }
          }
        });
      }
    }

    // Save the PDF
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    doc.save(filename);
    toast.success("PDF downloaded successfully!");
  };

  const handleSaveToDashboard = () => {
    if (result.type === 'chart') {
      saveToDashboard(result);
      toast.success("Chart saved to dashboard");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download as PDF
        </DropdownMenuItem>
        {result.type === 'chart' && (
          <>
            <DropdownMenuItem onClick={handleDownloadImage}>
              <Image className="mr-2 h-4 w-4" />
              Download as Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveToDashboard}>
              <Save className="mr-2 h-4 w-4" />
              Save to Dashboard
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
