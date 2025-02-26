import { Project } from "@/types/admin/project";
import { useAppDispatch } from "@/hooks/useRedux";
import { setProjects, setSelectedProject } from "@/store/slices/admin/projectsSlice";

export interface ProjectManagementService {
    setProjects(projects: Project[]): void;
    selectatedProject(project: Project | null): void;
}

export const useProjectManagementServive = (): ProjectManagementService => {
    const dispatch = useAppDispatch();
    
    return {
        setProjects: (projects: Project[]) => {
            dispatch(setProjects(projects));
        },
        selectatedProject: (project: Project | null) => {
            dispatch(setSelectedProject(project));
        }
    };
}