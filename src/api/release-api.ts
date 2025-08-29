import { Release } from "@/types/dataops/realease";

export const fetchData = async (): Promise<Release[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return [
    {
      id: 1,
      name: "Release 2024. 15",
      environment: "development",
      status: "deployed",
      created_by: "John Doe",
      last_updated: "Jan 16",
      deployed_on: "Jan 25",
    },
    {
      id: 2,
      name: "Release 2024. 16",
      environment: "development",
      status: "deployed",
      created_by: "Martin Smith",
      last_updated: "Jan 16",
      deployed_on: "Jan 25",
    },
    {
      id: 3,
      name: "Release 2024. 17",
      environment: "development",
      status: "failed",
      created_by: "John Doe",
      last_updated: "Jan 16",
      deployed_on: "Jan 25",
    },
  ];
};
