import React, { useState, useEffect } from 'react';

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  requirementId: string | null;
}

const CancelModal: React.FC<CancelModalProps> = ({ open, onClose, requirementId }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Cancel Requirement</h2>
        <p className="mb-2 text-sm text-gray-600">Please provide a reason for cancelling this requirement.</p>
        <textarea
          className="w-full border rounded p-2 mb-4 min-h-[80px]"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter reason..."
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            onClick={onClose}
            disabled={!reason.trim()}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal; 