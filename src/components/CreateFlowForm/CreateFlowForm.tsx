import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateFlowForm.module.css';

interface CreateFlowFormProps {
  onClose?: () => void;
}

const CreateFlowForm: React.FC<CreateFlowFormProps> = ({ onClose }) => {
  const [onJobStart, setOnJobStart] = useState(true);
  const [onJobFailure, setOnJobFailure] = useState(false);
  const [onJobSuccess, setOnJobSuccess] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  const handleCreateFlow = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
    navigate('/Designer/FlowPlayGround');
  };

  return (
    <div className={styles.modal}>
      <h2 className={styles.title}>Please fill in the details below to add a new flow</h2>
      <form className={styles.form}  onSubmit={handleCreateFlow}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Project*</label>
            <select>
              <option>Select Project</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Branch*</label>
            <select>
              <option>Select Branch</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Name*</label>
            <input type="text" placeholder="Enter Name" />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Environment Name*</label>
            <select>
              <option>Select Environment</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Class*</label>
            <select>
              <option>Select Class</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Schedule</label>
            <div className={styles.scheduleInput}>
              <input type="text" placeholder="Schedule Interval" />
              <span className={styles.clockIcon}>🕒</span>
            </div>
          </div>
        </div>
        <div className={styles.addNotes}>
          <a href="#">Add Notes ▼</a>
        </div>
        <div className={styles.alertSettings}>
          <h3>Select Alert Settings</h3>
          <div className={styles.field}>
            <label>Recipient Email ID *</label>
            <input type="email" placeholder="Enter Recipient Email ID" />
          </div>
          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={onJobStart}
                onChange={() => setOnJobStart(!onJobStart)}
              />
              On Job Start
            </label>
            <label>
              <input
                type="checkbox"
                checked={onJobFailure}
                onChange={() => setOnJobFailure(!onJobFailure)}
              />
              On Job Failure
            </label>
            <label>
              <input
                type="checkbox"
                checked={onJobSuccess}
                onChange={() => setOnJobSuccess(!onJobSuccess)}
              />
              On Job Success
            </label>
          </div>
        </div>
        <div className={styles.buttons}>
          <button className={styles.closeButton}>Close</button>
          <button className={styles.createButton}>Create Flow</button>
        </div>
      </form>
    </div>
  );
};

export default CreateFlowForm;