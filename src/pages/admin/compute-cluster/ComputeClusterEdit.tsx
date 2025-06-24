import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'react-router-dom';

export default function ComputeClusterEditPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Compute Cluster</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Compute cluster edit form for cluster ID: {id} will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}