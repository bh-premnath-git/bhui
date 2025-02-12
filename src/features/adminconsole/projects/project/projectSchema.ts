import { z } from 'zod';

export const projectFormSchema = z.object({
  bh_project_id: z.string().nullable(),
  bh_project_name: z.string().nonempty('Project Name is required'),
  bh_github_provider: z.string().nonempty('Git Provider is required'),
  bh_github_username: z.string().nonempty('Git Username is required'),
  bh_github_email: z
    .string()
    .email('Invalid email')
    .nonempty('Git Email is required'),
  bh_default_branch: z.string().optional(),
  bh_github_url: z
    .string()
    .url('Invalid URL')
    .nonempty('Git Repository URL is required'),
  bh_github_token_url: z.string().nonempty('Git Token is required'),
  tags: z
    .object({
      tagList: z.array(
        z.object({
          tagKey: z.string(),
          tagValue: z.string(),
        })
      ),
    })
    .nullable(),
  init_vector: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const projectEditFormSchema = z.object({
  bh_project_id: z.string().nullable(),
  bh_project_name: z.string().nonempty('Project Name is required'),
  bh_github_provider: z.string().nonempty('Git Provider is required'),
  bh_github_username: z.string().nonempty('Git Username is required'),
  bh_github_email: z.string().email('Invalid email').nonempty('Git Email is required'),
  bh_default_branch: z.string().optional(),
  bh_github_url: z.string().url('Invalid URL').nonempty('Git Repository URL is required'),
  bh_github_token_url: z.string().nonempty('Git Token is required'),
  tags: z.object({
    tagList: z.array(
      z.object({ tagKey: z.string(), tagValue: z.string() })
    ),
  }).nullable(),
  init_vector: z.string().optional(),
});

export type ProjectEditFormValues = z.infer<typeof projectEditFormSchema>;