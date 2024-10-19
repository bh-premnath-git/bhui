import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Stack,
    Tab,
    Tabs
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { CustomTabPanel } from "@/pages/dataCatalog/catalogSchema";
import form_data from "@/pages/buildPipeLine/join_form_data.json";
import { useDispatch, useSelector } from "react-redux";
import { getJoinType } from "@/redux/BuildPipeLineSlice";
import { RootState } from "@/store/store";
import { Formik, FieldArray, Form, Field } from "formik";
import * as Yup from "yup";
import { IoCloseSharp } from "react-icons/io5";
import CustomField from "@/common/CustomField";
import { Label } from "../ui/label";
const validationSchema = Yup.object().shape({
    columns: Yup.array().of(
        Yup.object().shape({
            order_columns: Yup.string().required("Order column is required"),
            sort: Yup.string().required("Sort is required")
        })
    )
});

const OrderSortForm = ({ options }: any) => {
    return (
        <>
            <div className="flex items-center">
                <div className="flex-grow w-1/2">
                    <Label>Order Columns</Label>
                </div>
                <div className="flex-grow w-1/2">
                    <Label>Sort</Label>
                </div>
            </div>
            <Formik
                initialValues={{
                    columns: [
                        {
                            order_columns: "",
                            sort: ""
                        }
                    ]
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    console.log("Form values:", values);
                }}
            >
                {({ values, errors, touched }) => (
                    <Form>
                        <FieldArray name="columns">
                            {({ remove, push }) => (
                                <div>
                                    {values.columns.map((column, index) => (
                                        <div key={index} className="flex items-center mb-2">
                                            <div className="flex-grow w-96">
                                                <CustomField placeholder="Enter order column" name={`columns.${index}.order_columns`} />
                                            </div>

                                            <div className="flex-grow ml-4 w-96">
                                                <CustomField name={`columns.${index}.sort`} controlName="select" options={options} labelKey="dtl_desc" valueKey="id" />
                                            </div>

                                            <div className="ml-4">
                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={() => remove(index)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Button */}
                                    <button
                                        type="button"
                                        className="mt-4 flex text-green-600 hover:text-green-800"
                                        onClick={() => push({ order_columns: "", sort: "" })}
                                    >
                                        <img
                                            src="/assets/plus-circle.svg"
                                            className="mr-2"
                                            alt="plus"
                                        /> Add Column
                                    </button>
                                </div>
                            )}
                        </FieldArray>

                        <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="center"
                            alignItems="self-end"
                            className="mt-6"
                        >
                            <button type="submit" className="w-24 bg-gray-800 text-white p-1 rounded-md hover:bg-gray-900">
                                Save
                            </button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </>
    );
};

export default function SortForm({ isOpen, onClose, handleDelete }: any) {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);
    const { joinList, selectedOption }: any = useSelector((state: RootState) => state.buildPipeLineApi);
    console.log(selectedOption)
    // State to store form data for each tab
    const [formStates, setFormStates] = useState(
        form_data.module.map((data) => ({
            conditions: [{ [data.fields[0].name]: '', [data.fields[1].name]: '' }]
        })) // Initialize form states with empty values
    );



    useEffect(() => {
        dispatch(getJoinType({ value: 31 }));
    }, [dispatch]);

    useEffect(() => {
        console.log(joinList);
        console.log(formStates);
    }, [joinList, selectedOption]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth={'lg'}        >
            <DialogTitle>
                <h5>{selectedOption?.display}</h5>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: "absolute", right: 8, top: 8, color: "black" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <OrderSortForm options={joinList.codes_dtl} />
            </DialogContent>
        </Dialog>
    );
}


