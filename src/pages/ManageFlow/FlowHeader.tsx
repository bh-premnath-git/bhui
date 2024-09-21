import React from 'react';
import { IoMdSettings } from "react-icons/io";
import { BsFillPencilFill } from 'react-icons/bs';
import { GoDotFill } from "react-icons/go";
import { FiCornerDownLeft } from 'react-icons/fi';
import styles from './FlowHeader.module.css';

const FlowHeader: React.FC = () => {
  return (
    <div className={`${styles.header} d-flex justify-content-between`}>
      <div className="d-flex p-2">
        <img src="/assets/logo/logo.png" alt="Logo" width={50} />
        <h6 className={styles.title}>Flow-Type 1</h6>
      </div>
      <div className={styles.iconGroup}>
        <button className={styles.iconButton}>
          <FiCornerDownLeft />
        </button>
        <button className={styles.iconButton}>
          <BsFillPencilFill />
        </button>
        <button className={styles.iconButton}>
          <IoMdSettings />
        </button>
        <div className={styles.statusIndicator}>
          <GoDotFill className={styles.statusDot} />
          <span className={styles.statusText}>Visual</span>
        </div>
      </div>
    </div>
  );
};

export default FlowHeader;
