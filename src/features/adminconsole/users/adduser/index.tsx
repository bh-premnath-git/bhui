import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from "use-debounce"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormFieldWrapper } from "@/components/ui/formfield-wrapper"
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux"
import { createUserDeployment } from "@/store/oldstore/UserSlice"
import { LoadingState } from "@/components/shared/LoadingState"
import { ApiService } from "@/services/api.services";
import { CATALOG_API_PORT } from "@/services/environment"
import { CommandMultiSelect } from "@/components/ui/command-multi-select"

type SelectOption = {
    label: string;
    value: string;
}

// ------------------- Zod Schema -------------------
const userSchema = z.object({
    bh_user_first_name: z.string().min(1, "First Name is required"),
    bh_user_middle_name: z.string().optional(),
    bh_user_last_name: z.string().min(1, "Last Name is required"),
    user_email_id: z.string().email("Invalid email address").min(1, "Email is required"),
    user_status_cd: z.string().min(1, "Please select status"),
    user_admin_status_cd: z.string().min(1, "Please select admin status"),
    project_details: z.array(
        z.object({
            project: z
                .array(
                    z.object({
                        label: z.string().min(1, "Project label is required"),
                        value: z.string().min(1, "Project value is required"),
                    })
                )
                .min(1, "At least one project is required"),
            projectRole: z
                .array(z.string().min(1, "Role is required"))
                .min(1, "At least one role is required"),
        })
    ),
})

type UserFormData = z.infer<typeof userSchema>

const AddUser = () => {
    // ------------------- Hooks & Redux -------------------
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    // The user’s data from location.state, if any
    const userData = location.state?.rowData

    // userDataList is presumably a thunk or action to search for users
    const { userDataList } = useAppSelector((state) => state.userApi)

    // ------------------- Local States -------------------
    const [projects, setProjects] = useState<SelectOption[]>([])
    const [userExistModelOpen, setUserExistModelOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Roles as simple strings
    const roles = ["admin-user", "ops-user", "designer-user"]

    // ------------------- React Hook Form Setup -------------------
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        getValues,
        formState: { errors, isSubmitting, isValid },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        mode: "onChange",
        defaultValues: {
            bh_user_first_name: "",
            bh_user_middle_name: "",
            bh_user_last_name: "",
            user_email_id: "",
            user_status_cd: "701",
            user_admin_status_cd: "2102",
            project_details: [
                {
                    project: [],
                    projectRole: [],
                },
            ],
        },
    })

    // For array fields (like project_details)
    const { fields: projectDetailFields } = useFieldArray({
        control,
        name: "project_details",
    })

    // Debounce first name for searching
    const watchFirstName = watch("bh_user_first_name")
    const [debouncedFirstName] = useDebounce(watchFirstName, 500)

    // ------------------- Searching for existing users -------------------
    useEffect(() => {
        if (debouncedFirstName && debouncedFirstName.length >= 3) {
            setUserExistModelOpen(false)
            dispatch(userDataList(debouncedFirstName))
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

    // ------------------- Fetch Projects -------------------
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectsRes = await ApiService({ portNumber: CATALOG_API_PORT, method: "get", url: "/bh_project/search" })
                const formattedProjects = projectsRes.map((proj: any) => ({
                    label: proj.bh_project_name,
                    value: proj.bh_project_id.toString(),
                }));
                setProjects(formattedProjects.filter((p): p is SelectOption => p.label !== undefined && p.value !== undefined));
            } catch (error) {
                console.error("Error fetching projects:", error)
                toast.error("Error fetching projects")
            }
        }
        fetchProjects()
    }, [])

    // ------------------- Submit Handler -------------------
    const onSubmit = async (formData: UserFormData) => {
        try {
            setIsLoading(true)

            // Flatten roles & project name for keycloak user creation
            const selectedRoles = formData.project_details.flatMap((detail) => detail.projectRole)
            const selectedProjects = formData.project_details.flatMap((detail) =>
                detail.project.map((proj) => proj.label)
            )

            const userObj = {
                email: formData.user_email_id,
                email_verified: true,
                enabled: true,
                first_name: formData.bh_user_first_name,
                last_name: formData.bh_user_last_name,
                realm_roles: selectedRoles,
                projects: selectedProjects,
                username: `${formData.bh_user_first_name}_${formData.bh_user_last_name}`,
            }

            await dispatch(createUserDeployment(userObj))
            toast.success("User created successfully")

            // redirect after success
            setTimeout(() => {
                navigate("/admin-console/users")
            }, 1000)
        } catch (error: any) {
            console.error("Error creating user:", error)
            toast.error("Error creating user")
        } finally {
            setIsLoading(false)
        }
    }

    // ------------------- JSX Markup -------------------
    return (
        <div className="max-w-4xl mx-auto p-3 space-y-6 rounded border bg-white text-black shadow w-full mt-8">
            {/* Header Section */}
            <div className="border-b pb-2 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Create New User</h2>
                    <p className="text-sm text-gray-700 mt-1">
                        Add a new user and configure their access permissions
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
                                className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
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
                                className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
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
                                className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                                {...register("bh_user_last_name")}
                            />
                        </FormFieldWrapper>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-2">
                        {/* Email Address */}
                        <FormFieldWrapper
                            name="user_email_id"
                            label="Email Address"
                            required
                            className="col-span-1"
                            error={errors.user_email_id?.message}
                        >
                            <Input
                                placeholder="Enter email address"
                                type="email"
                                className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400 w-full"
                                {...register("user_email_id")}
                            />
                        </FormFieldWrapper>
                    </div>
                </div>

                {/* Project Access Section */}
                <div className="p-3 rounded bg-white border space-y-4">
                    <h3 className="text-base font-medium text-black border-b pb-2">Project Access</h3>

                    {projectDetailFields.map((detail, index) => {
                        // For each project_details item in the array:
                        const currentProjectValue = watch(`project_details.${index}.project`)
                        const currentRoleValue = watch(`project_details.${index}.projectRole`)

                        return (
                            <div key={detail.id} className="grid grid-cols-2 gap-4">
                                {/* Projects */}
                                <FormFieldWrapper
                                    name={`project_details.${index}.project`}
                                    label="Projects"
                                    required
                                    error={errors.project_details?.[index]?.project?.message as string}
                                >
                                    <CommandMultiSelect
                                        placeholder="Select projects"
                                        options={
                                            projects.filter(
                                                (p) => !currentProjectValue.some((sel) => sel.value === p.value)
                                            )
                                        }
                                        value={currentProjectValue as SelectOption[]}
                                        onChange={(newValue) => {
                                            setValue(`project_details.${index}.project`, newValue, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                        }}
                                    />
                                </FormFieldWrapper>

                                {/* Roles */}
                                <FormFieldWrapper
                                    name={`project_details.${index}.projectRole`}
                                    label="Roles"
                                    required
                                    error={errors.project_details?.[index]?.projectRole?.message as string}
                                >
                                    <CommandMultiSelect
                                        placeholder="Select roles"
                                        options={roles.map((r) => ({ label: r, value: r })) as SelectOption[]}
                                        value={currentRoleValue.map((r) => ({ label: r, value: r }))}
                                        onChange={(newValue) => {
                                            const roleStrings = newValue.map((nv) => nv.value)
                                            setValue(`project_details.${index}.projectRole`, roleStrings, {
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
                        className="w-1/4 h-8 bg-black hover:bg-gray-800 text-white font-medium text-sm focus:ring focus:ring-blue-200"
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

            {/* User Exists Dialog */}
            {userExistModelOpen && (
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
                                className="bg-black text-white hover:bg-gray-800 mt-2 h-8 text-sm"
                            >
                                OK
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default AddUser
