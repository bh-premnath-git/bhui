import React from 'react';
import styles from './SettingsModal.module.css';
interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    return (
        <div className={styles.modalContent}>
            <h2 className={styles.title}>Settings</h2>
            <form>
                <div className={styles.formContainer}>
                    <div className={styles.column}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Project</label>
                            <select className={styles.select}>
                                <option>Select Project</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Branch</label>
                            <input type="text" placeholder="Enter Branch" className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Environment</label>
                            <select className={styles.select}>
                                <option>Select Environment</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Class</label>
                            <select className={styles.select}>
                                <option>Select Class</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.column}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>No. Of Retries</label>
                            <input type="number" placeholder="Enter No. Of Retries" className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Default Cluster</label>
                            <select className={styles.select}>
                                <option>Select Cluster</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Schedule</label>
                            <input type="text" placeholder="Schedule Interval" className={`${styles.input} ${styles.scheduleInput}`} />
                        </div>
                        <div className={styles.formGroup}>
                            <button type="button" className={styles.addNotesButton}>Add Notes ▼</button>
                        </div>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Add Tags</label>
                    <p className={styles.helperText}>Add one or more tags to easily identify compute instances created by bighammer.ai in your AWS account (Eg : Key : Product, Value : Bighammer.ai)</p>
                </div>
                <div className={styles.buttonGroup}>
                    <button type="button" onClick={onClose} className={styles.closeButton}>
                        Close
                    </button>
                    <button type="submit" className={styles.saveButton}>
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};


export default SettingsModal;