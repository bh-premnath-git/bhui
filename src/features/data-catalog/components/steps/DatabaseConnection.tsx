import React from 'react';
import { useImport } from '@/context/datacatalog/ImportContext';
import { useDatabase } from '@/features/data-catalog/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function 
DatabaseConnection() {
  const { databaseConfig, setDatabaseConfig, setStep } = useImport();
  const { connectToDatabase } = useDatabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await connectToDatabase(databaseConfig);
      if (success) {
        toast.success('Successfully connected to database');
        setStep(2);
      }
    } catch (error) {
      toast.error('Failed to connect to database');
    }
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto animate-fadeIn">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Host</label>
            <Input
              type="text"
              value={databaseConfig.host}
              onChange={(e) =>
                setDatabaseConfig({ ...databaseConfig, host: e.target.value })
              }
              placeholder="localhost"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Port</label>
            <Input
              type="text"
              value={databaseConfig.port}
              onChange={(e) =>
                setDatabaseConfig({ ...databaseConfig, port: e.target.value })
              }
              placeholder="5432"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Database</label>
            <Input
              type="text"
              value={databaseConfig.database}
              onChange={(e) =>
                setDatabaseConfig({ ...databaseConfig, database: e.target.value })
              }
              placeholder="mydb"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              type="text"
              value={databaseConfig.username}
              onChange={(e) =>
                setDatabaseConfig({ ...databaseConfig, username: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={databaseConfig.password}
            onChange={(e) =>
              setDatabaseConfig({ ...databaseConfig, password: e.target.value })
            }
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Connect
        </Button>
      </form>
    </Card>
  );
}