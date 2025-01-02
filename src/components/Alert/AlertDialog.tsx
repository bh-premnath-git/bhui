import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ApiService } from '@/services/apiServices';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  username: string;
  realm_roles: string[];
}

interface AssignUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (username: string) => void;
  alertId: string;
  currentAssignee?: string;
}

const AssignUserDialog: React.FC<AssignUserDialogProps> = ({ 
  open, 
  onClose, 
  onAssign, 
  alertId,
  currentAssignee 
}) => {
  const [selectedUsername, setSelectedUsername] = useState(currentAssignee || '');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchUserList();
    }
  }, [open]);

  useEffect(() => {
    if (currentAssignee) {
      setSelectedUsername(currentAssignee);
    }
  }, [currentAssignee]);

  const fetchUserList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiService('8005', 'get', '/users', null, null, null, false);
      const filteredUsers = response.users.filter((user: User) => 
        user.realm_roles.includes('ops-user')
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const assignUserToAlert = async (username: string) => {
    if (!alertId) {
      throw new Error("Alert ID is required");
    }

    try {
      await ApiService(
        '8004',
        'patch',
        `/api/v1/alert/${alertId}`,
        { assigned_to: username },
        null,
        null,
        false
      );
    } catch (error) {
      console.error("Error assigning user to alert:", error);
      if ((error as any)?.response?.status === 422) {
        throw new Error("Invalid alert ID or assignment data");
      }
      if ((error as any)?.response?.status === 404) {
        throw new Error("Alert not found");
      }
      throw new Error("Failed to assign user to alert. Please try again.");
    }
  };

  const handleAssign = async () => {
    if (!alertId) {
      setError("Alert ID is missing. Cannot proceed with assignment.");
      return;
    }

    if (!selectedUsername) {
      setError("Please select a user to assign.");
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      await assignUserToAlert(selectedUsername);
      onAssign(selectedUsername);
      onClose();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSelectedUsername(currentAssignee || '');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Assign User</DialogTitle>
          <DialogDescription>
            Select a user to assign to this alert.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500">No users with ops-user role found.</p>
          ) : (
            <Select
              value={selectedUsername}
              onValueChange={setSelectedUsername}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.username}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUsername || isLoading || isAssigning}
            className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserDialog;