import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import styles from './CreateFlowForm.module.css';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createFlow, setSelectedFlowFromList } from '../../redux/FlowSlice';
import { IntervalModalComponent, IntervalModalRef } from "@/components/IntervalModal";

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

interface CreateFlowPayload {
  flow_name: string;
  git_branch: string;
  bh_project_id: number;
  metadata_flow: string;
  bh_env_provider: number;
  flow_class: number;
  job: string;
  schedule_interval: {
    schedule_type: string;
    time: Record<string, any>;
  };
}

// Subcomponents
const SelectField: React.FC<{
  name: string;
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
  name: string;
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

// Main component
const CreateFlowForm: React.FC<CreateFlowFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    selectedProject: '',
    selectedBranch: '',
    selectedEnvironment: '',
    selectedClass: '',
    name: '',
    notes: '',
    scheduleInterval: '',
    recipientEmail: '',
  });
  const [branches, setBranches] = useState<string[]>([]);
  const [alerts, setAlerts] = useState({
    onJobStart: true,
    onJobFailure: false,
    onJobSuccess: false,
  });
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('');

  const intervalModalRef = useRef<IntervalModalRef>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { flowProjectList: data, environments: envData } = useAppSelector((state) => state.flowApi);

  const updateBranches = useCallback(() => {
    if (formData.selectedProject) {
      const project = data.find((p: Project) => p.ProjectId === formData.selectedProject);
      setBranches(project?.BranchNames || []);
      setFormData(prev => ({ ...prev, selectedBranch: '' }));
    } else {
      setBranches([]);
    }
  }, [formData.selectedProject, data]);

  useEffect(() => {
    updateBranches();
  }, [updateBranches]);

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAlertChange = (name: string, value: boolean) => {
    setAlerts(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateFlow = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: CreateFlowPayload = {
      flow_name: formData.name,
      git_branch: formData.selectedBranch || 'Main',
      bh_project_id: Number(formData.selectedProject),
      metadata_flow: '',
      bh_env_provider: Number(formData.selectedEnvironment),
      flow_class: Number(formData.selectedClass),
      job: 'on_job_start',
      schedule_interval: {
        schedule_type: 'minutes',
        time: {},
      },
    };

    try {
      setIsModalOpen(true);
      setModalStatus('loading');

      const result = await dispatch(createFlow(payload));

      if (createFlow.fulfilled.match(result)) {
        dispatch(setSelectedFlowFromList(result.payload));
        setModalStatus('success');
        setTimeout(() => {
          navigate('/designer/flow-playground');
          setIsModalOpen(false);
        }, 4000);
      } else {
        setModalStatus('error');
        setTimeout(() => {
          navigate('/designer/manage-flow');
          setIsModalOpen(false);
        }, 3000);
      }
    } catch (err) {
      setModalStatus('error');
      setTimeout(() => {
        navigate('/designer/manage-flow');
        setIsModalOpen(false);
      }, 3000);
    }
  };

  const openIntervalModal = () => {
    if (intervalModalRef.current) {
      intervalModalRef.current.open();
    }
  };

  return (
    <div className={styles.modal}>
      <h2 className={styles.title}>Create Flow</h2>
      <form className={styles.form} onSubmit={handleCreateFlow}>
        <div className={styles.row}>
          <SelectField
            name="selectedProject"
            label="Project*"
            value={formData.selectedProject}
            onChange={(value) => handleInputChange('selectedProject', value)}
            options={data.map((p: Project) => ({ value: p.ProjectId, label: p.Name }))}
          />
          <SelectField
            name="selectedBranch"
            label="Branch*"
            value={formData.selectedBranch}
            onChange={(value) => handleInputChange('selectedBranch', value)}
            options={branches.map(b => ({ value: b, label: b }))}
            disabled={!formData.selectedProject}
          />
          <InputField
            name="name"
            label="Name*"
            type="text"
            placeholder="Enter Name"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
          />
        </div>
        <div className={styles.row}>
          <SelectField
            name="selectedEnvironment"
            label="Environment Name*"
            style={{ width: '40px' }}
            value={formData.selectedEnvironment}
            onChange={(value) => handleInputChange('selectedEnvironment', value)}
            options={envData.map((e: Environment) => ({ value: e.id, label: e.envName }))}
          />
          <SelectField
            name="selectedClass"
            label="Class*"
            value={formData.selectedClass}
            onChange={(value) => handleInputChange('selectedClass', value)}
            options={[
              { value: '1', label: 'Small' },
              { value: '2', label: 'Medium' },
              { value: '3', label: 'Large' },
            ]}
          />
          <div className={styles.field}>
            <label>Schedule</label>
            <div className={styles.scheduleInput} onClick={openIntervalModal}>
              <input
                name="scheduleInterval"
                type="text"
                placeholder="Schedule Interval"
                value={formData.scheduleInterval}
                readOnly
              />
              <Clock className={styles.clockIcon} size={18} />
            </div>
          </div>
        </div>
        <div className={styles.addNotes}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsNotesOpen(!isNotesOpen);
            }}
            className={styles.addNotesLink}
          >
            Add Notes
            <span className={`${styles.arrowIcon} ${isNotesOpen ? styles.open : ''}`}>▼</span>
          </a>
          <div className={`${styles.notesWrapper} ${isNotesOpen ? styles.open : ''}`}>
            <textarea
              name="notes"
              className={styles.notesTextarea}
              placeholder="Add your notes here"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>
        </div>
        <div className={styles.alertSettings}>
          <h3>Select Alert Settings</h3>
          <InputField
            name="recipientEmail"
            label="Recipient Email ID *"
            type="email"
            placeholder="Enter Recipient Email ID"
            value={formData.recipientEmail}
            onChange={(value) => handleInputChange('recipientEmail', value)}
          />
          <div className={styles.checkboxGroup}>
            <CheckboxField 
              label="On Job Start" 
              checked={alerts.onJobStart} 
              onChange={(value) => handleAlertChange('onJobStart', value)} 
            />
            <CheckboxField 
              label="On Job Failure" 
              checked={alerts.onJobFailure} 
              onChange={(value) => handleAlertChange('onJobFailure', value)} 
            />
            <CheckboxField 
              label="On Job Success" 
              checked={alerts.onJobSuccess} 
              onChange={(value) => handleAlertChange('onJobSuccess', value)} 
            />
          </div>
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            Close
          </button>
          <button type="submit" className={styles.createButton}>
            Create Flow
          </button>
        </div>
      </form>
      <IntervalModalComponent 
        ref={intervalModalRef}
        onSave={(interval) => handleInputChange('scheduleInterval', interval)}
      />
    </div>
  );
};

export default CreateFlowForm;