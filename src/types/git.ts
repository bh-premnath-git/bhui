export type Commit = {
    user: string;
    message: string;
    time: string;
};

export type ChangedEntity = {
    name: string;
    type: "Pipeline" | "Report" | "File" | string;
    status: "New" | "Modified" | "Unmodified";
    hasWarning?: boolean;
};

export type GitStatus = {
    branch: string;
    uncommittedFiles: number;
};

export type GitContextValue = {
    enabled: boolean;
    setEnabled: (v: boolean) => void;

    status?: GitStatus;
    statusLoading: boolean;

    commitHistory?: Commit[];
    commitHistoryLoading: boolean;

    changedEntities?: ChangedEntity[];
    changedEntitiesLoading: boolean;

    isCommitModalOpen: boolean;
    openCommitModal: () => void;
    closeCommitModal: () => void;

    commitMessage: string;
    setCommitMessage: (v: string) => void;

    commit: (msg?: string) => Promise<void>;
    pull: () => Promise<void>;
    checkout: (branch: string) => Promise<void>;

    refetchAll: () => void;
};

export interface IGitService {
    getStatus(): Promise<GitStatus>;
    getCommitHistory(): Promise<Commit[]>;
    getChangedEntities(): Promise<ChangedEntity[]>;
    commit(message: string): Promise<void>;
    pull(): Promise<void>;
    checkout(branch: string): Promise<void>;
}