export type Tag = {
    tagList: { key: string; value: string }[];
  };
  
  export type SettingsModalProps = {
    isOpen: boolean;
    selectedData?: any;
    onClose: () => void;
  };
  
  export type TagInputProps = {
    tags: Tag;
    setTags: React.Dispatch<React.SetStateAction<Tag>>;
  };
  
  export type SettingsSectionProps = {
    title: string;
    children: React.ReactNode;
  };
  
  export type CustomToolbarProps = {
    selectedData?: any;
  };
  