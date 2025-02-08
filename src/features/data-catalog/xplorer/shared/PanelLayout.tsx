import { PANEL_HEIGHT, PANEL_CLASS } from '@/constants/layout';

interface PanelLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PanelLayout = ({ children, className = '' }: PanelLayoutProps) => {
  return (
    <div className={`${PANEL_HEIGHT} ${PANEL_CLASS} ${className}`}>
      {children}
    </div>
  );
};