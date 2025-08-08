import { useAppDispatch } from "@/hooks/useRedux";
import { setLlms, setSelectedLlm } from "@/store/slices/admin/llmSlice";
import { LLM } from "@/types/admin/llm";

export interface LlmManagementService {
    setLlms(llms: LLM[]): void;
    setSelectedLlm(llm: LLM | null): void;
}

export const useLlmManagementService = (): LlmManagementService => {
    const dispatch = useAppDispatch();
    
    return {
        setLlms: (llms: LLM[]) => {
            dispatch(setLlms(llms));
        },
        setSelectedLlm: (llm: LLM | null) => {
            dispatch(setSelectedLlm(llm));
        }
    };
}