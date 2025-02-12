import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from "use-debounce"
import { toast } from "sonner"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { createUserDeployment } from "@/store/oldstore/UserSlice"
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux"
import { LoadingState } from "@/components/shared/LoadingState"
import { ApiService } from "@/services/api.services"
import { CATALOG_API_PORT } from "@/services/environment"

const userSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  projects: z.array(z.string()).min(1, "At least one project is required"),
  roles: z.array(z.string()).min(1, "At least one role is required"),
})

type CreateUserFormData = z.infer<typeof userSchema>

type SelectOption = {
  label: string
  value: string
}

export default function CreateUserForm() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const { userDataList } = useAppSelector((state) => state.userApi)

  const [userExistModelOpen, setUserExistModelOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [availableProjects, setAvailableProjects] = useState<SelectOption[]>([])

  const availableRoles = ["admin-user", "ops-user", "designer-user"]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      projects: [],
      roles: [],
    },
  })

  const watchFirstName = watch("firstName")
  const [debouncedFirstName] = useDebounce(watchFirstName, 500)

  // ----------------------------------
  // Checking if User Already Exists
  // ----------------------------------
  useEffect(() => {
    // If firstName is typed & >=3 chars, do a user search
    if (debouncedFirstName && debouncedFirstName.length >= 3) {
      setUserExistModelOpen(false)
      dispatch(
        // userDataList might be a thunk that fetches & stores user data in Redux
        userDataList(debouncedFirstName)
      )
    } else {
      setUserExistModelOpen(false)
    }
  }, [debouncedFirstName, dispatch, userDataList])

  useEffect(() => {
    if (debouncedFirstName && userDataList?.length > 0) {
      const userExists = userDataList.some(
        (user: any) =>
          user.bh_user_first_name?.toLowerCase() === debouncedFirstName.toLowerCase()
      )
      if (userExists) {
        setUserExistModelOpen(true)
      }
    }
  }, [userDataList, debouncedFirstName])

  // ----------------------------------
  // Fetching Projects from API
  // ----------------------------------
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRes = await ApiService({
          portNumber: CATALOG_API_PORT,
          method: "get",
          url: "/bh_project/search",
        })

        const formatted = projectsRes.map((proj: any) => ({
          label: proj.bh_project_name,
          value: proj.bh_project_id.toString(),
        })) as SelectOption[]

        // Filter out any incomplete data
        setAvailableProjects(
          formatted.filter((p) => p.label && p.value)
        )
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast.error("Error fetching projects")
      }
    }
    fetchProjects()
  }, [])

  // ----------------------------------
  // Utility: Add/Remove Projects
  // ----------------------------------
  function addProject(value: string) {
    const currentProjects = getValues("projects")
    // avoid duplicates
    if (!currentProjects.includes(value)) {
      setValue("projects", [...currentProjects, value], {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  function removeProject(value: string) {
    const currentProjects = getValues("projects")
    setValue(
      "projects",
      currentProjects.filter((proj) => proj !== value),
      { shouldValidate: true, shouldDirty: true }
    )
  }

  // ----------------------------------
  // Utility: Add/Remove Roles
  // ----------------------------------
  function addRole(value: string) {
    const currentRoles = getValues("roles")
    if (!currentRoles.includes(value)) {
      setValue("roles", [...currentRoles, value], {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  function removeRole(value: string) {
    const currentRoles = getValues("roles")
    setValue(
      "roles",
      currentRoles.filter((role) => role !== value),
      { shouldValidate: true, shouldDirty: true }
    )
  }

  // ----------------------------------
  // Submit Handler
  // ----------------------------------
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setIsLoading(true)

      // We build the user object similarly to your old code
      const userObj = {
        email: data.email,
        email_verified: true,
        enabled: true,
        first_name: data.firstName,
        last_name: data.lastName,
        realm_roles: data.roles,
        projects: data.projects,
        username: `${data.firstName}_${data.lastName}`,
      }

      await dispatch(createUserDeployment(userObj))
      toast.success("User created successfully")

      // Optional redirect
      setTimeout(() => {
        navigate("/admin-console/users")
      }, 1000)
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Error creating user")
    } finally {
      setIsLoading(false)
    }
  }

  // ----------------------------------
  // Render
  // ----------------------------------
  const projectsValue = watch("projects")
  const rolesValue = watch("roles")

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-md">Create New User</CardTitle>
        <Button variant="outline" onClick={() => navigate("/admin-console/users")}>
          View All Users
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  First Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter first name"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>

              {/* Middle Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Middle Name</label>
                <Input
                  placeholder="Enter middle name"
                  {...register("middleName")}
                />
                {errors.middleName && (
                  <p className="text-red-500 text-sm">{errors.middleName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter last name"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                className="w-1/2"
                placeholder="Enter email address"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* ---------------- Project Access ---------------- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projects */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Projects <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  {/* Current Project Badges */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {projectsValue.map((project) => (
                      <Badge
                        key={project}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {project}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeProject(project)}
                        />
                      </Badge>
                    ))}
                  </div>

                  {/* Project Picker (Single-Select) */}
                  <Select
                    onValueChange={(selected) => {
                      // Add the newly selected project to the array
                      addProject(selected)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Dynamically loaded from the API */}
                      {availableProjects.map((p) => (
                        <SelectItem key={p.value} value={p.label}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.projects && (
                  <p className="text-red-500 text-sm">{errors.projects.message}</p>
                )}
              </div>

              {/* Roles */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Roles <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  {/* Current Role Badges */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {rolesValue.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {role}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeRole(role)}
                        />
                      </Badge>
                    ))}
                  </div>

                  {/* Role Picker (Single-Select) */}
                  <Select
                    onValueChange={(selected) => {
                      addRole(selected)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.roles && (
                  <p className="text-red-500 text-sm">{errors.roles.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ---------------- Submit Button ---------------- */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="w-full max-w-xs"
              disabled={isLoading || isSubmitting || !isValid}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingState />
                  Creating...
                </div>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* ---------------- User Already Exists Dialog ---------------- */}
      <Dialog open={userExistModelOpen} onOpenChange={setUserExistModelOpen}>
        <DialogContent className="sm:max-w-[300px] rounded-md bg-white text-black border border-gray-300 p-3">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-red-600">
              User Already Exists
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-1 py-2 text-center">
            <p className="text-sm text-gray-700">
              A user with this first name already exists. Please choose a different name.
            </p>
            <Button
              onClick={() => setUserExistModelOpen(false)}
              className="mt-2 h-8 text-sm bg-black text-white hover:bg-gray-800"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
