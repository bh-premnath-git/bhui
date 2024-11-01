import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
} from "@mui/material";
import { FieldArray, Formik, Form } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import CustomField from "@/common/CustomField";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function TransformPopUp({ isOpen, onClose }: any) {
    const { selectedOption }: any = useSelector((state: RootState) => state.buildPipeLineApi);

    return (
        <div>
            <Dialog
                open={isOpen}
                onClose={onClose}
                sx={{
                    "& .MuiDialog-paper": {
                        minWidth: "60%",
                    },
                }}
            >
                <DialogTitle>
                    <h5>{selectedOption?.display ?? selectedOption?.label}</h5>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: "black",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Formik
                    initialValues={{
                        fields: [{ operation: "", column: "", action: "" }],
                    }}
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                >
                    {({ values, handleChange, setFieldValue }) => (
                        <Form>
                            <DialogContent>
                                <FieldArray
                                    name="fields"
                                    render={(arrayHelpers) => (
                                        <>
                                            <Stack className="m-auto">
                                                {values.fields.map((field, index) => (
                                                    <div className="grid grid-cols-3 gap-3" key={index}>
                                                        <div>
                                                            <CustomField name={`fields[${index}].operation`} controlName="select" options={[
                                                                { "id": 1, "name": "Add Column", "status": true },
                                                                { "id": 2, "name": "Rename Column", "status": true },
                                                                { "id": 3, "name": "Drop Column", "status": true }
                                                            ]} labelKey="name" valueKey="id" label="Operation" onChange={() => {
                                                                console.log(field)
                                                            }} />
                                                        </div>
                                                        <div>
                                                            <CustomField name={`fields[${index}].column`} controlName="select" options={[
                                                                { "id": 1, "name": "Employee", "status": true },
                                                                { "id": 2, "name": "Age", "status": true },
                                                                { "id": 3, "name": "DOB", "status": true },
                                                                { "id": 4, "name": "Address", "status": true }
                                                            ]} labelKey="name" valueKey="id" label="Column" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {field.operation != '3' && (<Stack>
                                                                <CustomField name={`fields[${index}].action`} label={field.operation == '1' ? 'Expression' : field.operation == '2' ? 'New name' : 'Action'}
                                                                    placeholder={field.operation == '1' ? 'Enter expression' : field.operation == '2' ? 'Enter new column name' : ''} />

                                                            </Stack>)}
                                                            {/* {index > 0 && ( */}
                                                                <IconButton className="mt-3" onClick={() => arrayHelpers.remove(index)}>
                                                                    🗑️
                                                                </IconButton>
                                                        </div>
                                                    </div>

                                                ))}
                                            </Stack>

                                            <button
                                                type="button"
                                                className="mt-2   text-green-600 flex rounded"
                                                onClick={() => arrayHelpers.push({ operation: "", column: "", action: "" })}                                        >
                                                <img
                                                    src="/assets/plus-circle.svg"
                                                    className="mr-2"
                                                    alt="plus"
                                                />
                                                Add Column
                                            </button>
                                        </>
                                    )}
                                />
                            </DialogContent>

                            <Stack
                                direction="row"
                                spacing={2}
                                justifyContent="center"
                                alignItems="self-end"
                                className="mb-6"
                            >
                                <button
                                    type="button"
                                    className="mt-12 w-24 bg-white text-black border p-1 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="mt-12 w-24 bg-gray-800 text-white p-1 rounded-md hover:bg-gray-900"
                                >
                                    Save
                                </button>
                            </Stack>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
}
