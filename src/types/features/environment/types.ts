/**
 * @file types.ts
 *
 * Defines constants and TypeScript types for the Environment feature.
 */

export const environmentOptions = {
  "301": "Development",
  "302": "Staging",
  "303": "Production",
} as const;

export const locationOptions = ["us-east-1", "us-west-1", "eu-central-1"] as const;

export type LocationOption = typeof locationOptions[number];

export type Tag = {
  tagList: { key: string; value: string }[];
} | null;

export type Platform = {
  id: string;
  name: string;
  logo: string;
  cloud_provider: number;
};

export const PLATFORMS: Platform[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "/assets/environments/aws.svg?height=40&width=40",
    cloud_provider: 101,
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    logo: "/assets/environments/google.svg?height=40&width=40",
    cloud_provider: 102,
  },
];


export type EnvironmentTabState = {
  environmentName: string;
  environment: string;
  projectId: string;
  location: string;
  accessKey: string;
  secretAccessKey: string;
  airflowUrl: string;
  airflowDagBucket: string;
  awsPvtKey: string | null;
  privateKeyFile: File | null;
  verification: boolean;
  selectedMwaaEnv: string | null;
};

export const TABS = ["environment"] as const;
export type TabType = (typeof TABS)[number];

export type State = {
  activeTab: TabType;
  tags: Tag[];
  selectedPlatform: string;
  environmentTab: EnvironmentTabState;
  isLoading: boolean;
  isEditing: boolean;
};

export type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'SET_SELECTED_PLATFORM'; payload: string }
  | { type: 'SET_ENVIRONMENT_TAB'; payload: Partial<EnvironmentTabState> }
  | { type: 'SET_VERIFICATION'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_EDITING'; payload: boolean };


export const initialState: State = {
  activeTab: TABS[0],
  tags: [],
  selectedPlatform: "aws",
  environmentTab: {
    environmentName: "",
    environment: "",
    projectId: "",
    location: "",
    accessKey: "",
    secretAccessKey: "",
    airflowUrl: "",
    airflowDagBucket: "",
    selectedMwaaEnv: null,
    awsPvtKey: null,
    privateKeyFile: null,
    verification: false
  },
  isLoading: false,
  isEditing: false,
};