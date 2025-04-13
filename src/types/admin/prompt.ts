export interface Prompt{
    id: number | undefined;
    prompt_name: string;
    module_id: number;
    module_name: string;
    prompt: string;
}

export interface PromptModule{
    id: number;
    module_name: string;
    module_display_name: string;
    module_desc: string;
}