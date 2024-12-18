import React from 'react';
import { X } from 'lucide-react';
import styles from '@/components/ReactFlowComps/DataPreviewModal/DataPreviewModal.module.css';

interface DataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataPreviewModal: React.FC<DataPreviewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
        <X size={24} color="black" />
        </button>
        <h2>Flow Name: Flow_type 1</h2>
        <div className={styles.tabContainer}>
          <button>Logs</button>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Order Date</th>
              <th>Order Amount</th>
              <th>Order Amount</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(7)].map((_, index) => (
              <tr key={index}>
                <td>Order_id1234</td>
                <td>10/4/2024</td>
                <td>1,000,000,000</td>
                <td>Lorem Ipsum is Simply Dummy Text Of The Printing...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPreviewModal;
