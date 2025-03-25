import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Star, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  creator: string;
  created: string;
  updated: string;
  data?: any;
}

// Mock data service - would be replaced with actual API calls
const getReportByPath = (path: string): Report | undefined => {
  // This would be an API call in a real application
  if (path === 'sales-report') {
    return {
      id: 'sales-report',
      title: 'Sales Report',
      description: 'Comprehensive analysis of sales data across all regions and product categories',
      type: 'bar',
      creator: 'Alex Johnson',
      created: '2025-02-10T09:30:00',
      updated: '2025-03-15T14:22:00',
      data: {
        // This would contain actual report data in a real application
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [1200, 1900, 1500, 2200, 1800, 2400],
      }
    };
  } else if (path === 'orders-report') {
    return {
      id: 'orders-report',
      title: 'Orders Report',
      description: 'Detailed breakdown of order volume, status, and fulfillment metrics',
      type: 'line',
      creator: 'Maya Patel',
      created: '2025-02-15T11:45:00',
      updated: '2025-03-18T09:15:00',
      data: {
        // This would contain actual report data in a real application
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [450, 520, 480, 600, 580, 710],
      }
    };
  } else if (path === 'inventory-report') {
    return {
      id: 'inventory-report',
      title: 'Inventory Report',
      description: 'Current inventory levels, restocking needs, and product turnover analysis',
      type: 'pie',
      creator: 'Carlos Rodriguez',
      created: '2025-02-20T13:20:00',
      updated: '2025-03-20T16:30:00',
      data: {
        // This would contain actual report data in a real application
        labels: ['In Stock', 'Low Stock', 'Out of Stock', 'On Order'],
        values: [65, 20, 5, 10],
      }
    };
  }

  return undefined;
};

const ReportDetails: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch report data
    if (reportId) {
      setLoading(true);
      const fetchedReport = getReportByPath(reportId);

      if (fetchedReport) {
        setReport(fetchedReport);
      } else {
        // Handle case where report is not found
        console.error(`Report with ID ${reportId} not found`);
      }

      setLoading(false);
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The report you're looking for doesn't exist or may have been deleted.
          </p>
          <Button onClick={() => navigate('/data-catalog/xplorer')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Data Explorer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/data-catalog/xplorer')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-2xl font-bold">{report.title}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Visualization Card */}
      <Card>
        <CardHeader>
          <CardTitle>Report Visualization</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Visualization for {report.title} would appear here</p>
            <p className="text-sm">This is a placeholder - in a real application, this would display the actual visualization</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDetails;