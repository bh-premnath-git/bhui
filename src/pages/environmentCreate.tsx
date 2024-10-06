import React, { useReducer } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnvironmentTab } from '@/components/EnvironmentsTabs/EnvironmentTab';
import { ConfigureLakeTab } from '@/components/EnvironmentsTabs/ConfigureLakeTab';
import { PreConfigureZonesTab } from '@/components/EnvironmentsTabs/PreConfigureZonesTab';
import { ConfigureLifecycleTab } from '@/components/EnvironmentsTabs/ConfigureLifecycleTab';

// Types
type Tag = { key: string; value: string };
type Platform = { id: string; name: string; logo: string };
type ZoneDetail = { name: string; url: string };
type LifecycleConfig = { [key: string]: string };

// Constants
const TABS = [
  "environment",
  "configure-lake",
  "preconfigure-zones",
  "configure-lifecycle",
] as const;
type TabType = (typeof TABS)[number];

const PLATFORMS: Platform[] = [
  {
    id: "google-cloud",
    name: "Google Cloud",
    logo: "/src/assets/environments/google.svg?height=40&width=40",
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "/src/assets/environments/aws.svg?height=40&width=40",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    logo: "/src/assets/environments/azure.svg?height=40&width=40",
  },
  {
    id: "bighammer",
    name: "BigHammer.ai",
    logo: "/src/assets/environments/bighammer.svg?height=40&width=40",
  },
];

const INITIAL_ZONE_DETAILS: ZoneDetail[] = [
  { name: "Bronze Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Silver Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Gold Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Log Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Quarantine Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
];

// Reducer
type State = {
  activeTab: TabType;
  tags: Tag[];
  selectedPlatform: string;
  zoneDetails: ZoneDetail[];
  businessUrl: string;
  lakeName: string;
  lakeDescription: string;
  standardZoneConfig: LifecycleConfig;
  archiveZoneConfig: LifecycleConfig;
};

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'SET_SELECTED_PLATFORM'; payload: string }
  | { type: 'SET_ZONE_DETAILS'; payload: ZoneDetail[] }
  | { type: 'SET_BUSINESS_URL'; payload: string }
  | { type: 'SET_LAKE_NAME'; payload: string }
  | { type: 'SET_LAKE_DESCRIPTION'; payload: string }
  | { type: 'SET_STANDARD_ZONE_CONFIG'; payload: LifecycleConfig }
  | { type: 'SET_ARCHIVE_ZONE_CONFIG'; payload: LifecycleConfig };

const initialState: State = {
  activeTab: TABS[0],
  tags: [
    { key: "Department", value: "Tech" },
    { key: "Region", value: "USA" },
  ],
  selectedPlatform: "google-cloud",
  zoneDetails: INITIAL_ZONE_DETAILS,
  businessUrl: "",
  lakeName: "",
  lakeDescription: "",
  standardZoneConfig: {},
  archiveZoneConfig: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_SELECTED_PLATFORM':
      return { ...state, selectedPlatform: action.payload };
    case 'SET_ZONE_DETAILS':
      return { ...state, zoneDetails: action.payload };
    case 'SET_BUSINESS_URL':
      return { ...state, businessUrl: action.payload };
    case 'SET_LAKE_NAME':
      return { ...state, lakeName: action.payload };
    case 'SET_LAKE_DESCRIPTION':
      return { ...state, lakeDescription: action.payload };
    case 'SET_STANDARD_ZONE_CONFIG':
      return { ...state, standardZoneConfig: action.payload };
    case 'SET_ARCHIVE_ZONE_CONFIG':
      return { ...state, archiveZoneConfig: action.payload };
    default:
      return state;
  }
}

export default function EnvironmentConsoleComponent(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleBack = (): void => {
    const currentIndex = TABS.indexOf(state.activeTab);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: TABS[currentIndex - 1] });
    }
  };

  const handleNext = (): void => {
    const currentIndex = TABS.indexOf(state.activeTab);
    if (currentIndex < TABS.length - 1) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: TABS[currentIndex + 1] });
    }
  };

  const handleTabChange = (value: string): void => {
    if (TABS.includes(value as TabType)) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: value as TabType });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Tabs value={state.activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex-1 flex justify-center">
            <TabsList aria-label="Environment Console Tabs" className="bg-transparent">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="px-4 py-2 rounded-md transition-colors duration-200 data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  {tab.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button variant="default" className="bg-gray-800 text-white hover:bg-gray-700">
            View All Environments
          </Button>
        </div>

        <Card className="w-full mt-4">
          <CardContent className="p-6">
            <div className="max-w-[800px] mx-auto">
              <TabsContent value="environment">
                <EnvironmentTab
                  selectedPlatform={state.selectedPlatform}
                  setSelectedPlatform={(platform) => dispatch({ type: 'SET_SELECTED_PLATFORM', payload: platform })}
                  tags={state.tags}
                  setTags={(newTags) => {
                    // Check if newTags is a function, if so, call it with the current state.tags
                    if (typeof newTags === 'function') {
                      dispatch({ type: 'SET_TAGS', payload: newTags(state.tags) });
                    } else {
                      dispatch({ type: 'SET_TAGS', payload: newTags });
                    }
                  }}
                />
              </TabsContent>
              <TabsContent value="configure-lake">
                <ConfigureLakeTab
                  businessUrl={state.businessUrl}
                  setBusinessUrl={(url) => dispatch({ type: 'SET_BUSINESS_URL', payload: url })}
                  lakeName={state.lakeName}
                  setLakeName={(name) => dispatch({ type: 'SET_LAKE_NAME', payload: name })}
                  lakeDescription={state.lakeDescription}
                  setLakeDescription={(description) => dispatch({ type: 'SET_LAKE_DESCRIPTION', payload: description })}
                />
              </TabsContent>
              <TabsContent value="preconfigure-zones">
                <PreConfigureZonesTab
                  zoneDetails={state.zoneDetails}
                  handleUrlChange={(index, newUrl) => {
                    const newZoneDetails = [...state.zoneDetails];
                    newZoneDetails[index].url = newUrl;
                    dispatch({ type: 'SET_ZONE_DETAILS', payload: newZoneDetails });
                  }}
                />
              </TabsContent>
              <TabsContent value="configure-lifecycle">
                <ConfigureLifecycleTab
                  standardZoneConfig={state.standardZoneConfig}
                  setStandardZoneConfig={(config) => {
                    // Check if config is a function, and call it with the current state.standardZoneConfig
                    if (typeof config === 'function') {
                      dispatch({ type: 'SET_STANDARD_ZONE_CONFIG', payload: config(state.standardZoneConfig) });
                    } else {
                      dispatch({ type: 'SET_STANDARD_ZONE_CONFIG', payload: config });
                    }
                  }}
                  archiveZoneConfig={state.archiveZoneConfig}
                  setArchiveZoneConfig={(config) => {
                    // Check if config is a function, and call it with the current state.archiveZoneConfig
                    if (typeof config === 'function') {
                      dispatch({ type: 'SET_ARCHIVE_ZONE_CONFIG', payload: config(state.archiveZoneConfig) });
                    } else {
                      dispatch({ type: 'SET_ARCHIVE_ZONE_CONFIG', payload: config });
                    }
                  }}

                />
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={handleBack} disabled={state.activeTab === TABS[0]}>
          Back
        </Button>
        <Button className="bg-gray-800 text-white hover:bg-gray-700" onClick={handleNext}>
          {state.activeTab === TABS[TABS.length - 1] ? "Create Environment" : "Next"}
        </Button>
      </div>
    </div>
  );
}