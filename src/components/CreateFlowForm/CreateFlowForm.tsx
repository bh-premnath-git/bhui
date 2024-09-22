import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateFlowForm.module.css';
import { Clock, X } from 'lucide-react';

interface CreateFlowFormProps {
  onClose?: () => void;
}

const CreateFlowForm: React.FC<CreateFlowFormProps> = ({ onClose }) => {
  const [onJobStart, setOnJobStart] = useState(true);
  const [onJobFailure, setOnJobFailure] = useState(false);
  const [onJobSuccess, setOnJobSuccess] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState('');
  const [scheduleType, setScheduleType] = useState('Minutes');
  const [scheduleValue, setScheduleValue] = useState(1);
  const navigate = useNavigate();


  const handleCreateFlow = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/Designer/FlowPlayGround');
  };

  const toggleNotes = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNotesOpen(!isNotesOpen);
  };

  const openScheduleModal = () => {
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
  };

  const saveSchedule = () => {
    setScheduleInterval(`${scheduleValue} ${scheduleType}`);
    closeScheduleModal();
  };

  return (
    <div className={styles.modal}>
      <h2 className={styles.title}>Create Flow</h2>
      <form className={styles.form} onSubmit={handleCreateFlow}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Project*</label>
            <select>
              <option>Select Project</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Branch*</label>
            <input type="text" placeholder="Enter Branch" />
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
            <div className={styles.scheduleInput} onClick={openScheduleModal}>
              <input type="text" placeholder="Schedule Interval" />
              <Clock className={styles.clockIcon} size={18} />
            </div>
          </div>
        </div>
        <div className={styles.addNotes}>
        <a
            href="#"
            onClick={toggleNotes}
            className={styles.addNotesLink}
          >
            Add Notes
            <span className={`${styles.arrowIcon} ${isNotesOpen ? styles.open : ''}`}>
              ▼
            </span>
          </a>
          <div className={`${styles.notesWrapper} ${isNotesOpen ? styles.open : ''}`}>
            <textarea
              className={styles.notesTextarea}
              placeholder="Add your notes here"
              rows={4}
            />
          </div>
        </div>
        <div className={styles.alertSettings}>
          <h3>Select Alert Settings</h3>
          <div className={styles.field}>
            <label>Recipient Email ID *</label>
            <input type="email" placeholder="Enter Recipient Email ID" />
          </div>
          <div className={styles.checkboxGroup}>
            <label className={onJobStart ? styles.checked : ''}>
              <input
                type="checkbox"
                checked={onJobStart}
                onChange={() => setOnJobStart(!onJobStart)}
              />
              On Job Start
            </label>
            <label className={onJobFailure ? styles.checked : ''}>
              <input
                type="checkbox"
                checked={onJobFailure}
                onChange={() => setOnJobFailure(!onJobFailure)}
              />
              On Job Failure
            </label>
            <label className={onJobSuccess ? styles.checked : ''}>
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
          <button type="button" className={styles.closeButton} onClick={onClose}>Close</button>
          <button type="submit" className={styles.createButton}>Create Flow</button>
        </div>
      </form>
      {isScheduleModalOpen && (
        <div className={styles.scheduleModal}>
          <div className={styles.scheduleModalContent}>
            <button className={styles.closeModalButton} onClick={closeScheduleModal}>
              <X size={18} />
            </button>
            <h3>Schedule Interval</h3>
            <div className={styles.scheduleTypes}>
              {['Minutes', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((type) => (
                <button
                  key={type}
                  className={`${styles.scheduleTypeButton} ${scheduleType === type ? styles.active : ''}`}
                  onClick={() => setScheduleType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className={styles.repeatEvery}>
              <span>Repeat Every</span>
              <input
                type="number"
                min="1"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(Number(e.target.value))}
              />
              <span>{scheduleType}</span>
            </div>
            <div className={styles.scheduleModalButtons}>
              <button onClick={closeScheduleModal}>Close</button>
              <button onClick={saveSchedule}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFlowForm;