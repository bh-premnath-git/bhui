import React from 'react';
import { InfoIcon } from 'lucide-react';
import ApiService from '@/Services/ApiServices';

type ZoneDetail = { name: string; url: string };

const ZoneDetailItem: React.FC<{
  zone: ZoneDetail;
  index: number;
  handleUrlChange: (index: number, newUrl: string) => void;
}> = ({ zone, index, handleUrlChange }) => (
  <div className="flex items-center space-x-4 bg-gray-100 p-2 rounded">
    <div className="w-48 flex items-center justify-end">
      <span className="font-medium">{zone.name}</span>
      <InfoIcon className="w-4 h-4 ml-1 text-gray-400" />
    </div>
    <div
      className="w-64 p-2 rounded text-sm overflow-hidden"
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => handleUrlChange(index, e.currentTarget.textContent || "")}
    >
      {zone.url}
    </div>
  </div>
);

export const PreConfigureZonesTab: React.FC<{
  zoneDetails: ZoneDetail[];
  handleUrlChange: (index: number, newUrl: string) => void;
}> = ({ zoneDetails, handleUrlChange }) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <p className="text-sm text-gray-600 mb-4">
        Based on the business URL and lake name, all zones are preconfigured.
        Please find the zone details below. To know more about data zone{" "}
        <a href="/data-zone-info" className="text-blue-500 hover:underline">
          Click Here
        </a>
        .
      </p>
      <div className="space-y-2">
        {zoneDetails.map((zone: ZoneDetail, index: number) => (
          <ZoneDetailItem
            key={index}
            zone={zone}
            index={index}
            handleUrlChange={handleUrlChange}
          />
        ))}
      </div>
    </div>
  );
};