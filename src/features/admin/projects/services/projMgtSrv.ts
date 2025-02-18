import { Project } from "@/types/admin/project";
import { useAppDispatch } from "@/hooks/uaeRedux";
import { setProjects, setSelectedProject } from "@/store/slices/admin/projectsSlice";

export interface ProjectManagementService {
    setProjects(): Promise<Project[]>;
    selectatedProject(project: Project  | null): Promise<Project | null>;
}

export const useProjectManagementServive = () => {
    const dispatch = useAppDispatch();
    return ({
        setProjects: (projects: Project[]) => {
            dispatch(setProjects(projects));
        },
        selectatedProject: (project: Project | null) => {
            dispatch(setSelectedProject(project));
        }
    })
}