import React, { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingState } from "@/components/shared/LoadingState"
import { Label } from "@/components/ui/label"
import { FormFieldWrapper } from "@/components/ui/formfield-wrapper"
import { useAppDispatch } from "@/hooks/useRedux" 
import { editUserDeployment } from "@/store/oldstore/UserSlice"
import { ApiService } from "@/services/api.services";
import { CATALOG_API_PORT } from "@/services/environment"
import { cn } from "@/lib/utils"
import { CommandMultiSelect } from "@/components/ui/command-multi-select"


// Simple Toggle Implementation (replacing MUI <Switch>)
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label?: string
}) {
  return (
    <div className="flex items-center space-x-2">
      {label && <Label className="mr-2">{label}</Label>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
          checked ? "bg-blue-600" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      <span className="ml-2 text-sm">{checked ? "Active" : "Inactive"}</span>
    </div>
  )
}

// -------------- Data Types --------------
interface RoleType extends SelectOption {
  dtl_code: string
  dtl_desc: string
}

interface ProjectType {
  value: string
  label: string
}

interface ProjectDetail {
  project: ProjectType[]
  projectRole: RoleType[]
}

interface UserData {
  bh_user_id?: string
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  enabled?: boolean
  user_admin_status_cd?: string
  projects?: ProjectType[]
  realm_roles?: RoleType[]
}

// -------------- Zod Schema --------------
const schema = z.object({
  bh_user_first_name: z.string().nonempty("First Name is required"),
  bh_user_middle_name: z.string().optional(),
  bh_user_last_name: z.string().nonempty("Last Name is required"),
  user_email_id: z.string().email("Invalid email address").nonempty("Email is required"),
  // In your old code, user_status_cd must be "601" or "602" => We'll handle that logic with a toggle
  user_status_cd: z.string().nonempty("Please select status"),
  user_admin_status_cd: z.string().nonempty("Please select admin status"),
  project_details: z.array(
    z.object({
      project: z
        .array(
          z.object({
            value: z.string().nonempty("Project value is required"),
            label: z.string().nonempty("Project label is required"),
          })
        )
        .min(1, "At least one project is required"),
      projectRole: z
        .array(
          z.object({
            dtl_code: z.string().nonempty("Role code is required"),
            dtl_desc: z.string().nonempty("Role description is required"),
          })
        )
        .min(1, "At least one role is required"),
    })
  ),
})

type EditUserFormValues = z.infer<typeof schema>

type SelectOption = {
  label: string
  value: string
}

export default function EditUser() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const userData: UserData = location.state?.rowData || {}

  // Local states
  const [roles, setRoles] = useState<RoleType[]>([])
  const [projects, setProjects] = useState<ProjectType[]>([])
  const [statusToggle, setStatusToggle] = useState(true) // Replaces MUI Switch

  // Hook Form + Zod
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
    setValue,
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      bh_user_first_name: "",
      bh_user_middle_name: "",
      bh_user_last_name: "",
      user_email_id: "",
      user_status_cd: "601", // active
      user_admin_status_cd: "2102",
      project_details: [
        {
          project: [],
          projectRole: [],
        },
      ],
    },
  })

  // For array fields
  const { fields: projectDetailsFields } = useFieldArray({
    control,
    name: "project_details",
  })

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, projectsRes] = await Promise.all([
          ApiService({portNumber: CATALOG_API_PORT, method: "get", url: "/codes_hdr/1"}),
          ApiService({portNumber:CATALOG_API_PORT, method: "get", url: "/bh_project/search"}),
        ])

        setRoles(rolesRes.codes_dtl || [])

        const formattedProjects = projectsRes.map((proj: any) => ({
          value: proj.bh_project_id.toString(),
          label: proj.bh_project_name,
        }))
        setProjects(formattedProjects)

        // If user data is passed in, populate the form
        if (userData) {
          const isActive = userData.enabled ?? true
          setStatusToggle(isActive)

          // Convert userData => form values
          const initialProjects = userData.projects ?? []
          const initialRoles = userData.realm_roles ?? []

          setValue("bh_user_first_name", userData.firstName || "")
          setValue("bh_user_middle_name", userData.middleName || "")
          setValue("bh_user_last_name", userData.lastName || "")
          setValue("user_email_id", userData.email || "")
          setValue("user_status_cd", isActive ? "601" : "602")
          setValue(
            "user_admin_status_cd",
            userData.user_admin_status_cd || "2102"
          )
          setValue("project_details", [
            {
              project: initialProjects,
              projectRole: initialRoles,
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error fetching data")
      }
    }

    fetchData()
  }, [userData, setValue])

  const onSubmit = async (values: EditUserFormValues) => {
    if (!userData?.bh_user_id) {
      toast.error("No user ID found.")
      return
    }

    // Convert toggle => status code
    values.user_status_cd = statusToggle ? "601" : "602"

    try {
      await dispatch(
        editUserDeployment({
          id: userData.bh_user_id,
          params: values,
        })
      )
      toast.success("User updated successfully")
      setTimeout(() => navigate("/admin-console/users"), 1000)
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Error updating user")
    }
  }

  // Render
  return (
    <div className="max-w-4xl mx-auto p-3 space-y-6 rounded border bg-white text-black shadow w-full mt-8">
      {/* Header Section */}
      <div className="border-b pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Edit User</h2>
          <p className="text-sm text-gray-700 mt-1">
            Update user details and configure their access permissions
          </p>
        </div>
        <Button
          variant="outline"
          className="text-xs font-medium px-3 py-1 border-gray-300 hover:bg-gray-100"
          onClick={() => navigate("/admin-console/users")}
        >
          View All Users
        </Button>
      </div>

      {/* Our Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Details Section */}
        <div className="p-1 rounded bg-white border space-y-2">
          <h3 className="text-base font-medium text-black border-b pb-2">User Details</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* First Name */}
            <FormFieldWrapper
              name="bh_user_first_name"
              label="First Name"
              required
              error={errors.bh_user_first_name?.message}
            >
              <Input
                placeholder="Enter first name"
                className="h-8 border-gray-300 text-sm"
                {...register("bh_user_first_name")}
              />
            </FormFieldWrapper>

            {/* Middle Name */}
            <FormFieldWrapper
              name="bh_user_middle_name"
              label="Middle Name"
              error={errors.bh_user_middle_name?.message}
            >
              <Input
                placeholder="Enter middle name"
                className="h-8 border-gray-300 text-sm"
                {...register("bh_user_middle_name")}
              />
            </FormFieldWrapper>

            {/* Last Name */}
            <FormFieldWrapper
              name="bh_user_last_name"
              label="Last Name"
              required
              error={errors.bh_user_last_name?.message}
            >
              <Input
                placeholder="Enter last name"
                className="h-8 border-gray-300 text-sm"
                {...register("bh_user_last_name")}
              />
            </FormFieldWrapper>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2">
            {/* Email */}
            <FormFieldWrapper
              name="user_email_id"
              label="Email Address"
              required
              error={errors.user_email_id?.message}
              className="col-span-1"
            >
              <Input
                placeholder="Enter email address"
                type="email"
                className="h-8 border-gray-300 text-sm w-full"
                {...register("user_email_id")}
              />
            </FormFieldWrapper>

            {/* Toggle for User Status */}
            <div className="col-span-2 flex items-center pt-4">
              <Toggle
                checked={statusToggle}
                onChange={setStatusToggle}
                label="Status"
              />
            </div>
          </div>
        </div>

        {/* Project Access Section */}
        <div className="p-3 rounded bg-white border space-y-4">
          <h3 className="text-base font-medium text-black border-b pb-2">
            Project Access
          </h3>

          {projectDetailsFields.map((detail, index) => {
            // We watch the current values to display / filter them
            // but we can also do it with setValue calls in CommandMultiSelect
            const fieldNameProject = `project_details.${index}.project` as const
            const fieldNameRole = `project_details.${index}.projectRole` as const

            return (
              <div key={detail.id} className="grid grid-cols-2 gap-4">
                {/* Projects */}
                <FormFieldWrapper
                  name={fieldNameProject}
                  label="Projects"
                  required
                  error={errors.project_details?.[index]?.project?.message}
                >
                  <CommandMultiSelect<ProjectType>
                    placeholder="Select projects"
                    options={projects} // or filter out already selected if you want
                    // Convert from form value
                    value={detail.project as ProjectType[]}
                    onChange={(newVal) => {
                      // must store them in React Hook Form
                      setValue(fieldNameProject, newVal, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                  />
                </FormFieldWrapper>

                {/* Roles */}
                <FormFieldWrapper
                  name={fieldNameRole}
                  label="Roles"
                  required
                  error={errors.project_details?.[index]?.projectRole?.message}
                >
                  <CommandMultiSelect<RoleType>
                    placeholder="Select roles"
                    options={roles.map((r) => ({
                      dtl_code: r.dtl_code,
                      dtl_desc: r.dtl_desc,
                      label: r.dtl_desc, // For display
                      value: r.dtl_code, // Unique code
                    }))}
                    // Convert from form
                    value={detail.projectRole.map((r) => ({
                      dtl_code: r.dtl_code,
                      dtl_desc: r.dtl_desc,
                      label: r.dtl_desc,
                      value: r.dtl_code
                    }))}
                    onChange={(newVal) => {
                      // Convert back to RoleType
                      const roleObjs = newVal.map((v) => ({
                        dtl_code: v.value,
                        dtl_desc: v.label,
                      }))
                      setValue(fieldNameRole, roleObjs, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                  />
                </FormFieldWrapper>
              </div>
            )
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            className="w-1/4 h-8 bg-black hover:bg-gray-800 text-white font-medium text-sm"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <LoadingState className="mr-1" />
                Updating...
              </div>
            ) : (
              "Update User"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
