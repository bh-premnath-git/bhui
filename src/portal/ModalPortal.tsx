import React, { useEffect, useState, ReactElement } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactElement<{ onClose?: () => void }>;
  parentWidth?: string | number;
  contentWidth?: string | number;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, parentWidth, contentWidth }) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.getElementById('portal-root');
    if (element) {
      setPortalElement(element);
    }
  }, []);

  if (!isOpen || !portalElement) return null;

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
  };

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 50,
    width: `${parentWidth ?? '100%'}`,
    height: '100%',
    overflow: 'hidden',
    outline: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const dialogStyle: React.CSSProperties = {
    position: 'relative',
    width: 'auto',
    margin: '0.5rem',
    pointerEvents: 'none',
    maxWidth: '500px',
  };
  
  const contentStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: `${contentWidth ?? '120%'}`,
    pointerEvents: 'auto',
    backgroundColor: '#fff',
    backgroundClip: 'padding-box',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '0.3rem',
    outline: 0,
  };

  return ReactDOM.createPortal(
    <>
      <div style={backdropStyle} onClick={onClose}></div>
      <div style={modalStyle} tabIndex={-1} role="dialog">
        <div style={dialogStyle} role="document">
          <div style={contentStyle}>
            {React.cloneElement(children, { onClose })}
          </div>
        </div>
      </div>
    </>,
    portalElement
  );
};

export default Modal;