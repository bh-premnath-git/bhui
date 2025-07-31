import { Environment, EnvironmentWithAirflow, AirflowInstance } from "@/types/admin/environment"
import { Project } from "@/types/admin/project"
import * as z from "zod"

export const basicInformationSchema = z.object({
  project: z.string().min(1, "Project is required"),
  environment: z.string().min(1, "Environment is required"),
  flowName: z.string().min(1, "Flow name is required"),
  airflowInstance: z.string().optional(),
})

export const additionalDetailsSchema = z.object({
  tags: z.array(z.string()),
})

export const monitorSettingsSchema = z.object({
  recipientEmails: z.object({
    emails: z.array(z.string().email("Please enter a valid email address"))
  }),
  alertSettings: z.object({
    onJobStart: z.boolean().default(false),
    onJobFailure: z.boolean().default(true),
    onJobSuccess: z.boolean().default(false),
    delayed: z.boolean().default(false),
  }),
})

export const flowFormSchema = z.object({
  basicInformation: basicInformationSchema,
  additionalDetails: additionalDetailsSchema,
  monitorSettings: monitorSettingsSchema,
})

export const getProjectOptions = (projects: Project[]) => {
  return projects.map(project => ({
    label: project.bh_project_name,
    value: project.bh_project_id.toString()
  }));
};

export const getEnvironmentOptions = (environments: Environment[]) => {
  return environments.map(environment => ({
    label: environment.bh_env_name,
    value: environment.bh_env_id.toString()
  }));
};

export const getAirflowOptions = (airflowInstances: AirflowInstance[]) => {
  return airflowInstances.map(instance => ({
    label: instance.airflow_env_name,
    value: instance.id.toString()
  }));
};



export type FlowFormValues = z.infer<typeof flowFormSchema>

