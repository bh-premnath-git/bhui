import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from 'lucide-react';

const InputFieldWithIcon: React.FC<{
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, id, placeholder, value, onChange }) => (
  <div className="flex-1 space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        className="w-full pr-10"
        value={value}
        onChange={onChange}
      />
      <HelpCircle className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
    </div>
  </div>
);

export const ConfigureLakeTab: React.FC<{
  businessUrl: string;
  setBusinessUrl: (url: string) => void;
  lakeName: string;
  setLakeName: (name: string) => void;
  lakeDescription: string;
  setLakeDescription: (description: string) => void;
}> = ({
  businessUrl,
  setBusinessUrl,
  lakeName,
  setLakeName,
  lakeDescription,
  setLakeDescription,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <InputFieldWithIcon
          label="Business URL"
          id="business-url"
          placeholder="Enter Business URL"
          value={businessUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBusinessUrl(e.target.value)
          }
        />
        <InputFieldWithIcon
          label="Lake Name"
          id="lake-name"
          placeholder="Enter Lake Name"
          value={lakeName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLakeName(e.target.value)
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lake-description">Lake Description</Label>
        <Textarea
          id="lake-description"
          placeholder="Type Your Description Here"
          className="w-full h-32"
          value={lakeDescription}
          onChange={(e) => setLakeDescription(e.target.value)}
        />
      </div>
    </div>
  );
};