import { EnvironmentTabState } from "@/types/features/environment/types";

export function areAllRequiredFieldsFilled(
    envTab: EnvironmentTabState,
    selectedPlatform: string
): boolean {
    // Shared fields
    if (!envTab.environmentName.trim()) return false;
    if (!envTab.environment.trim()) return false;
    if (!envTab.projectId.trim()) return false;
    if (!envTab.location.trim()) return false;

    // AWS fields
    if (selectedPlatform === "aws") {
        if (!envTab.accessKey.trim()) return false;
        if (!envTab.secretAccessKey.trim()) return false;
    }

    // GCP fields
    if (selectedPlatform === "google-cloud") {
        if (!envTab.privateKeyFile) return false;
    }

    // If all checks pass, return true
    return true;
}
