import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FieldArray, Formik, Form, Field } from "formik";
import CloseIcon from "@mui/icons-material/Close";
import { IoAddCircleOutline } from "react-icons/io5";
import { GoTrash } from "react-icons/go";
import CustomField from "@/common/CustomField";

export default function TransformPopUp({ isOpen, onClose }: any) {
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
                    <h6>Transform1</h6>
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
                                        <Stack className="m-auto">
                                            {values.fields.map((field, index) => (
                                                <Stack direction={"row"} spacing={2} justifyContent={'space-between'} key={index}>
                                                    <Stack className="w-72">

                                                        <CustomField name={`fields[${index}].operation`} controlName="select" options={[
                                                            { "id": 1, "name": "Add Column", "status": true },
                                                            { "id": 2, "name": "Rename Column", "status": true },
                                                            { "id": 3, "name": "Drop Column", "status": true }
                                                        ]} labelKey="name" valueKey="id" label="Operation" onChange={() => {
                                                            console.log(field)
                                                        }} />

                                                    </Stack>


                                                    <Stack className="w-72">

                                                        <CustomField name={`fields[${index}].column`} controlName="select" options={[
                                                            { "id": 1, "name": "Employee", "status": true },
                                                            { "id": 2, "name": "Age", "status": true },
                                                            { "id": 3, "name": "DOB", "status": true },
                                                            { "id": 4, "name": "Address", "status": true }
                                                        ]} labelKey="name" valueKey="id" label="Column" />

                                                    </Stack>

                                                    {field.operation != '3' && (<Stack>
                                                        <CustomField name={`fields[${index}].action`} label={field.operation == '1' ? 'Expression' : field.operation == '2' ? 'New name' : 'Action'}
                                                            placeholder={field.operation == '1' ? 'Enter expression' : field.operation == '2' ? 'Enter new column name' : ''} />

                                                    </Stack>)}

                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        sx={{ height: "100px", mt: 2 }}
                                                    >
                                                        <IconButton
                                                            onClick={() =>
                                                                arrayHelpers.push({
                                                                    operation: "",
                                                                    column: "",
                                                                    action: "",
                                                                })
                                                            }
                                                        >
                                                            <IoAddCircleOutline size={25} color="green" />
                                                        </IconButton>
                                                    </Stack>

                                                    {index > 0 && (
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            sx={{ height: "100px", mt: 2 }}
                                                        >
                                                            <IconButton
                                                                onClick={() => arrayHelpers.remove(index)}
                                                            >
                                                                🗑️
                                                            </IconButton>
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            ))}
                                        </Stack>
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
