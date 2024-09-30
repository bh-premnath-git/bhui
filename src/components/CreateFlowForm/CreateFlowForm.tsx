import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, X } from 'lucide-react';
import styles from './CreateFlowForm.module.css';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { createFlow, setSelectedFlowFromList } from '../../Redux/FlowSlice';
import { Modal, CircularProgress, Typography, Box } from '@mui/material';

// Types
interface Project {
  ProjectId: string;
  Name: string;
  BranchNames: string[];
}

interface Environment {
  id: string;
  envName: string;
}

interface CreateFlowFormProps {
  onClose?: () => void;
}


const ModalContent = ({ status }) => {
  switch (status) {
    case 'loading':
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Creating Flow...</Typography>
        </Box>
      );
    case 'success':
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" color="success.main">Flow Created Successfully!</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>Redirecting to Flow Playground...</Typography>
        </Box>
      );
    case 'error':
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" color="error.main">Error Creating Flow</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>Redirecting to Manage Flow...</Typography>
        </Box>
      );
    default:
      return null;
  }
};

// Subcomponents
const SelectField: React.FC<{
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  style?: React.CSSProperties;
}> = ({ name, label, value, onChange, options, disabled, style }) => (
  <div style={style} className={styles.field}>
    <label>{label}</label>
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const InputField: React.FC<{
  name?: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ name, label, type, placeholder, value, onChange }) => (
  <div className={styles.field}>
    <label>{label}</label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const CheckboxField: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className={checked ? styles.checked : ''}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    {label}
  </label>
);

const ScheduleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (interval: string, type: string, value: number) => void;
  initialType: string;
  initialValue: number;
}> = ({ isOpen, onClose, onSave, initialType, initialValue }) => {
  const [scheduleType, setScheduleType] = useState(initialType);
  const [scheduleValue, setScheduleValue] = useState(initialValue);

  useEffect(() => {
    setScheduleType(initialType);
    setScheduleValue(initialValue);
  }, [initialType, initialValue]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(`${scheduleValue} ${scheduleType}`, scheduleType, scheduleValue);
    onClose();
  };

  return (
    <div className={styles.scheduleModal}>
      <div className={styles.scheduleModalContent}>
        <button className={styles.closeModalButton} onClick={onClose}>
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
        {scheduleType === 'Minutes' && (
          <div className={styles.repeatSchedule}>
            <div className={styles.repeatEvery}>
              <span>Repeat Every</span>
            </div>
            <div className={styles.inputRow}>
              <input
                type="number"
                min="1"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(Number(e.target.value))}
              />
              <span>{scheduleType}</span>
            </div>
          </div>
        )}
        {scheduleType === 'Hourly' && (
          <div className={styles.repeatSchedule}>
            <div className={styles.repeatEvery}>
              <span>Repeat Every</span> <span className={styles.hour}>Time(UTC)</span>
            </div>
            <div className={styles.inputRow}>
              <input
                type="number"
                min="1"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(Number(e.target.value))}
              />
              <span>Hours</span>
              <span>From</span>
              <input
                type="number"
                min="0"
                max="23"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(Number(e.target.value))}
              />
            </div>
          </div>
        )}
        {scheduleType === 'Daily' && (
          <div className={styles.repeatSchedule}>
            <div className={styles.repeatEvery}>
              <span>Repeat At</span>
            </div>
            <div className={styles.inputRow}>
              <input
                type="number"
                min="0"
                max="23"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(Number(e.target.value))}
              />
              <span>Hours (UTC)</span>
            </div>
          </div>
        )}
        {scheduleType === 'Weekly' && (
          <div className={styles.repeatSchedule}>
            <div className={styles.repeatEvery}>
              <span>Repeat On</span>
            </div>
            <div className={styles.inputRow}>
              <select
                value={scheduleValue}
                onChange={(e) => setScheduleValue(Number(e.target.value))}
              >
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
            </div>
            <div className={styles.repeatEvery}>
              <span>Repeat At</span>
            </div>
            <div className={styles.inputRow}>
              <input
                type="number"
                min="0"
                max="23"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(Number(e.target.value))}
              />
              <span>Hours (UTC)</span>
            </div>
          </div>
        )}
        {/* Add similar blocks for Monthly and Yearly if needed */}
        <div className={styles.scheduleModalButtons}>
          <button onClick={onClose}>Close</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

// Main component
const CreateFlowForm: React.FC<CreateFlowFormProps> = ({  onClose }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [name, setName] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [onJobStart, setOnJobStart] = useState(true);
  const [onJobFailure, setOnJobFailure] = useState(false);
  const [onJobSuccess, setOnJobSuccess] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState('');
  const [scheduleType, setScheduleType] = useState('Minutes');
  const [scheduleValue, setScheduleValue] = useState(1);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { flowProjectList:data, environments: envData } = useAppSelector((state) => state.flowApi);

  const updateBranches = useCallback(() => {
    if (selectedProject) {
      const project = data.find(p => p.ProjectId === Number(selectedProject));
      setBranches(project?.BranchNames || []);
      setSelectedBranch('');
    } else {
      setBranches([]);
    }
  }, [selectedProject, data]);

  useEffect(() => {
    updateBranches();
  }, [updateBranches]);



  const handleCreateFlow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData: { [key: string]: any } = {};
    form.querySelectorAll('input, select, textarea').forEach((element) => {
      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox') {
          formData[element.name] = element.checked;
        } else {
          formData[element.name] = element.value;
        }
      } else if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
        formData[element.name] = element.value;
      }
    });

    const payload = {
      flow_name: formData.flow_name,
      git_branch: "Main",
      bh_project_id: Number(formData.bh_project_id),
      metadata_flow: "",
      bh_env_provider: Number(formData.bh_env_provider),
      flow_class: Number(formData.flow_class),
      job: "on_job_start",
      schedule_interval: {
        schedule_type: "minutes",
        time: {}
      }
    }

    try {
      const result = await dispatch(createFlow(payload));
      setIsModalOpen(true);
      setModalStatus('loading');
      
      if (result.payload) {
         dispatch(setSelectedFlowFromList(result.payload));
        setModalStatus('success');
        setTimeout(() => {
          navigate('/Designer/FlowPlayGround')
          setIsModalOpen(false);
        }, 4000);
      }
    } catch (err) {
      setModalStatus('error');
      setTimeout(() => {
        navigate('/Designer/Manage Flow');
        setIsModalOpen(false);
      }, 3000);

    }

  };

  const handleScheduleSave = (interval: string, type: string, value: number) => {
    setScheduleInterval(interval);
    setScheduleType(type);
    setScheduleValue(value);
  };

  return (
    <div className={styles.modal}>
      <h2 className={styles.title}>Create Flow</h2>
      <form className={styles.form} onSubmit={handleCreateFlow}>
        <div className={styles.row}>
          <SelectField
            name="bh_project_id"
            label="Project*"
            value={selectedProject}
            onChange={setSelectedProject}
            options={data.map(p => ({ value: p.ProjectId, label: p.Name }))}
          />
          <SelectField
            name="git_branch"
            label="Branch*"
            value={selectedBranch}
            onChange={setSelectedBranch}
            options={branches.map(b => ({ value: b, label: b }))}
            disabled={!selectedProject}
          />
          <InputField
            name="flow_name"
            label="Name*"
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={setName}
          />
        </div>
        <div className={styles.row}>
          <SelectField
            name="bh_env_provider"
            label="Environment Name*"
            style={{ width: '40px' }}
            value={selectedEnvironment}
            onChange={setSelectedEnvironment}
            options={envData.map(e => ({ value: e.id, label: e.envName }))}
          />
          <SelectField
            name="flow_class"
            label="Class*"
            value={selectedClass}
            onChange={setSelectedClass}
            options={[
              { value: '1', label: 'Small' },
              { value: '2', label: 'Medium' },
              { value: '3', label: 'Large' },
            ]}
          />
          <div className={styles.field}>
            <label>Schedule</label>
            <div className={styles.scheduleInput} onClick={() => setIsScheduleModalOpen(true)}>
              <input name='schedule_interval' type="text" placeholder="Schedule Interval" value={scheduleInterval} readOnly />
              <Clock className={styles.clockIcon} size={18} />
            </div>
          </div>
        </div>
        <div className={styles.addNotes}>
          <a href="#" onClick={(e) => { e.preventDefault(); setIsNotesOpen(!isNotesOpen); }} className={styles.addNotesLink}>
            Add Notes
            <span className={`${styles.arrowIcon} ${isNotesOpen ? styles.open : ''}`}>
              ▼
            </span>
          </a>
          <div className={`${styles.notesWrapper} ${isNotesOpen ? styles.open : ''}`}>
            <textarea
              name="notes"
              className={styles.notesTextarea}
              placeholder="Add your notes here"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.alertSettings}>
          <h3>Select Alert Settings</h3>
          <InputField
            name="recipent_emails"
            label="Recipient Email ID *"
            type="email"
            placeholder="Enter Recipient Email ID"
            value={recipientEmail}
            onChange={setRecipientEmail}
          />
          <div className={styles.checkboxGroup}>
            <CheckboxField label="On Job Start" checked={onJobStart} onChange={setOnJobStart} />
            <CheckboxField label="On Job Failure" checked={onJobFailure} onChange={setOnJobFailure} />
            <CheckboxField label="On Job Success" checked={onJobSuccess} onChange={setOnJobSuccess} />
          </div>
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.closeButton} onClick={onClose}>Close</button>
          <button type="submit" className={styles.createButton}>Create Flow</button>
        </div>
      </form>
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleScheduleSave}
        initialType={scheduleType}
        initialValue={scheduleValue}
      />
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <ModalContent status={modalStatus} />
        </Box>
      </Modal>
    </div>
  );
};

export default CreateFlowForm;