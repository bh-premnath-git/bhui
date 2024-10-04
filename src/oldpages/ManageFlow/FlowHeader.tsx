import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdSettings } from "react-icons/io";
import { BsFillPencilFill } from 'react-icons/bs';
import { FiLink } from 'react-icons/fi';
import { AiOutlineCloudSync } from 'react-icons/ai';
import { RiArrowLeftSLine } from "react-icons/ri";
import styles from './FlowHeader.module.css';
import SettingsModal from './SettingsModal/SettingsModal';
import Modal from '../../oldcomponents/ModalWithPortal';
import { useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';


const FlowHeader: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const navigate = useNavigate();
  const { selectedFlowFromList } = useAppSelector((state: RootState) => state.flowApi);

  return (
    <div className={styles.header}>
      <div className={styles.logoSection}>
        <img src="/assets/logo/fixLogo.svg" alt="Logo" className={styles.logo} />
      </div>
      <div className={styles.middleSection}>
        <button className={styles.iconButton} onClick={() => navigate("/Designer/Manage Flow")}>
          <RiArrowLeftSLine size={32} />
        </button>
        <div className={styles.autoSave}>
          <AiOutlineCloudSync className={styles.cloudIcon} />
        </div>
        <div className={styles.flowTypeInput}>
          <input type="text" defaultValue={selectedFlowFromList?.Name ?? "Flow 1"} />
          <BsFillPencilFill className={styles.editIcon} />
        </div>
        <button className={styles.detachButton}>
          Detach Cluster
          <FiLink className={styles.linkIcon} />
        </button>
        <button className={styles.icon2Button} onClick={openSettings}>
          <IoMdSettings />
        </button>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.toggleContainer}>
          <span className={styles.toggleLabel}>Visual</span>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Code</span>
        </div>
      </div>
      <Modal isOpen={isSettingsOpen} onClose={closeSettings}>
        <SettingsModal onClose={closeSettings} />
      </Modal>
    </div>
  );
};

export default FlowHeader;