import { LayoutField } from "@/types/data-catalog/dataCatalog";
import { useAppDispatch } from "@/hooks/useRedux";
import { setLayoutFields, setSelectedLayoutField } from "@/store/slices/dataCatalog/layoutFieldSlice";

export interface LayoutFieldManagementService {
    getLayoutFields(): Promise<LayoutField[]>;
    selectLayoutField(layoutField: LayoutField | null): Promise<LayoutField | null>;
}

export const useLayoutFieldManagementService = () => {
    const dispatch = useAppDispatch();
    return ({
        setLayoutFields: (layoutFields: LayoutField[]) => {
            dispatch(setLayoutFields(layoutFields));
        },
        selectLayoutField: (layoutField: LayoutField | null) => {
            dispatch(setSelectedLayoutField(layoutField));
        }
    })
}