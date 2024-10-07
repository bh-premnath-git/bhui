import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type LifecycleConfig = { [key: string]: string };

const ZONES = [
  "Bronze Zone",
  "Silver Zone",
  "Gold Zone",
  "Log Zone",
  "Quarantine Zone",
] as const;

const ConfigSection: React.FC<{
  title: string;
  config: LifecycleConfig;
  setConfig: React.Dispatch<React.SetStateAction<LifecycleConfig>>;
}> = ({ title, config, setConfig }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {ZONES.map((zone) => (
          <div key={zone} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor={zone.toLowerCase().replace(" ", "-")}
                className="text-sm flex items-center"
              >
                {zone}
              </Label>
            </div>
            <Input
              id={zone.toLowerCase().replace(" ", "-")}
              placeholder="Enter days"
              className="text-sm w-full"
              value={config[zone] || ""}
              onChange={(e) => setConfig({ ...config, [zone]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ConfigureLifecycleTab: React.FC<{
  standardZoneConfig: LifecycleConfig;
  setStandardZoneConfig: React.Dispatch<React.SetStateAction<LifecycleConfig>>;
  archiveZoneConfig: LifecycleConfig;
  setArchiveZoneConfig: React.Dispatch<React.SetStateAction<LifecycleConfig>>;
}> = ({
  standardZoneConfig,
  setStandardZoneConfig,
  archiveZoneConfig,
  setArchiveZoneConfig,
}) => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <p className="text-center mb-6 text-sm">
        Configure duration for which data needs to be stored. Please note life
        cycle policy is done as per the organization governance standards. To
        know more about life cycle policy{" "}
        <a href="#" className="text-blue-600 hover:underline">
          Click Here.
        </a>
      </p>
      <div className="space-y-6">
        <ConfigSection
          title="Days in Standard Zone"
          config={standardZoneConfig}
          setConfig={setStandardZoneConfig}
        />
        <ConfigSection
          title="Days in Archive Zone"
          config={archiveZoneConfig}
          setConfig={setArchiveZoneConfig}
        />
      </div>
    </div>
  );
};