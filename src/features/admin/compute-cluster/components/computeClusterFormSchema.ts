import * as z from 'zod';

// EMR Configuration Schema
const emrConfigSchema = z.object({
  emr_version: z.string().min(1, "EMR version is required"),
  custom_image_uri: z.string().nullable().optional(),
  instance_type: z.string().min(1, "Instance type is required"),
  worker_count: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        throw new Error("Worker count must be a valid number");
      }
      return parsed;
    }
    return val;
  }).refine((val) => val >= 1, "Worker count must be at least 1"),
  idle_timeout_seconds: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        throw new Error("Idle timeout must be a valid number");
      }
      return parsed;
    }
    return val;
  }).refine((val) => val >= 0, "Idle timeout must be non-negative"),
  aws_logs_uri: z.string().trim().min(1, "AWS logs URI is required"),
  ec2_subnet_id: z.string().trim().min(1, "EC2 subnet ID is required"),
  emr_master_security_group: z.string().trim().min(1, "EMR master security group is required"),
  emr_slave_security_group: z.string().trim().min(1, "EMR slave security group is required"),
  service_access_security_group: z.string().trim().min(1, "Service access security group is required"),
  job_flow_role: z.string().trim().min(1, "Job flow role is required"),
  service_role: z.string().trim().min(1, "Service role is required"),
  ec2_key_name: z.string().nullable().optional(),
  applications: z.array(z.string()).min(1, "At least one application is required"),
  aws_cloud_connection: z.string().nullable().optional(),
  region: z.string().min(1, "Region is required"),
  bh_tags: z.array(z.string()).optional().default([]),
});

// Main Compute Cluster Schema
export const computeClusterFormSchema = z.object({
  compute_config_name: z.string().trim().min(1, "Compute config name is required"),
  compute_type: z.string().min(1, "Compute type is required"),
  bh_env_id: z.string().min(1, "Environment is required").transform((val) => parseInt(val, 10)),
  tenant_key: z.string().optional(),
  compute_config: emrConfigSchema,
});

export type ComputeClusterFormValues = z.infer<typeof computeClusterFormSchema>;

// Schema definition for dynamic form generation
export const computeClusterSchema = {
  properties: {
    compute_config_name: {
      type: "string",
      title: "Compute Config Name",
      description: "A unique name for this compute cluster configuration",
      minLength: 1
    },
    compute_type: {
      type: "string",
      title: "Compute Type",
      description: "The type of compute cluster",
      default: "EMR"
    },
    bh_env_id: {
      type: "string",
      title: "Environment",
      description: "Select the BigHammer environment",
      enum: [],
      enumNames: []
    },
    tenant_key: {
      type: "string",
      title: "Tenant Key",
      description: "The tenant identifier",
      minLength: 1,
      default: "test"
    },
    compute_config: {
      type: "object",
      title: "Compute Configuration",
      description: "Configuration specific to the compute type",
      properties: {
        emr_version: {
          type: "string",
          title: "EMR Version",
          description: "The Amazon EMR release version",
          default: "emr-7.6.0",
          enum: ["emr-7.6.0", "emr-7.5.0", "emr-7.4.0", "emr-6.15.0"]
        },
        custom_image_uri: {
          type: "string",
          title: "Custom Image URI",
          description: "Optional custom AMI URI for EMR cluster",
          default: "string"
        },
        instance_type: {
          type: "string",
          title: "Instance Type",
          description: "EC2 instance type for cluster nodes",
          enum: ["m5.xlarge", "m5.2xlarge", "m5.4xlarge", "m5.8xlarge", "m5.12xlarge", "m5.16xlarge", "m5.24xlarge"],
          default: "m5.xlarge"
        },
        worker_count: {
          type: "number",
          title: "Worker Count",
          description: "Number of worker nodes in the cluster",
          default: 1,
          minimum: 1
        },
        idle_timeout_seconds: {
          type: "number",
          title: "Idle Timeout (seconds)",
          description: "Time in seconds before idle cluster is terminated",
          default: 300,
          minimum: 0
        },
        aws_logs_uri: {
          type: "string",
          title: "AWS Logs URI",
          description: "S3 URI for storing EMR logs",
          default: "s3://default-logs-emr/"
        },
        ec2_subnet_id: {
          type: "string",
          title: "EC2 Subnet ID",
          description: "The subnet ID where EMR cluster will be launched",
          default: "subnet-09dd221f1b7a3dafe"
        },
        emr_master_security_group: {
          type: "string",
          title: "EMR Master Security Group",
          description: "Security group for EMR master node",
          default: "sg-052149f1ee34ff1cd"
        },
        emr_slave_security_group: {
          type: "string",
          title: "EMR Slave Security Group",
          description: "Security group for EMR worker nodes",
          default: "sg-035d8021138605cf8"
        },
        service_access_security_group: {
          type: "string",
          title: "Service Access Security Group",
          description: "Security group for EMR service access",
          default: "sg-00f0c3f957ae19ed0"
        },
        job_flow_role: {
          type: "string",
          title: "Job Flow Role",
          description: "IAM role for EMR job flow",
          default: "EMR_EC2_DefaultRole"
        },
        service_role: {
          type: "string",
          title: "Service Role",
          description: "IAM service role for EMR",
          default: "EMR_DefaultRole"
        },
        ec2_key_name: {
          type: "string",
          title: "EC2 Key Name",
          description: "EC2 key pair name for SSH access",
          default: "bh-client-keypair"
        },
        applications: {
          type: "array",
          title: "Applications",
          description: "EMR applications to install",
          items: {
            type: "string",
            enum: ["Spark", "Hadoop", "Hive", "Presto", "Zeppelin", "JupyterHub", "Livy"]
          },
          default: ["Spark"],
          minItems: 1
        },
        aws_cloud_connection: {
          type: "string",
          title: "AWS Cloud Connection",
          description: "Reference to AWS connection configuration",
          default: "aws_connection_1"
        },
        region: {
          type: "string",
          title: "AWS Region",
          description: "AWS region for the EMR cluster",
          enum: ["us-east-1", "us-east-2", "us-west-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-1", "ap-northeast-1"],
          default: "us-east-1"
        },
        bh_tags: {
          type: "array",
          title: "BH Tags",
          description: "Additional tags for the compute cluster",
          items: {
            type: "string"
          },
          default: []
        }
      },
      required: [
        "emr_version", "instance_type", "worker_count", "idle_timeout_seconds",
        "aws_logs_uri", "ec2_subnet_id", "emr_master_security_group",
        "emr_slave_security_group", "service_access_security_group",
        "job_flow_role", "service_role", "ec2_key_name", "applications",
        "region"
      ]
    }
  },
  required: ["compute_config_name", "compute_type", "bh_env_id", "compute_config"]
};