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
import { getCodesValue, getOrderBy } from "@/redux/BuildPipeLineSlice";
import { RootState } from "@/store/store";
import { Formik, FieldArray, Form, Field } from "formik";
import * as Yup from "yup";
import { IoCloseSharp } from "react-icons/io5";
import CustomField from "@/common/CustomField";
import { Label } from "../ui/label";

// Validation Schema
const validationSchema = Yup.object().shape({
    rowToKeep: Yup.string().required('Required'),
    deduplicateColumns: Yup.array().of(
        Yup.object().shape({
            customer_id: Yup.string().required('Required'),
            target_column: Yup.string().required('Required'),
        })
    ),
    orderColumns: Yup.array().of(
        Yup.object().shape({
            column: Yup.string().required('Required'),
            sort: Yup.string().required('Required'),
        })
    ),
});

const initialValues = {
    rowToKeep: 'First',
    deduplicateColumns: [{ customer_id: '', target_column: '' }],
    useCustomOrderBy: false,
    orderColumns: [{ column: '', sort: 'Ascending' }],
};

const DeDupeFormDtl = ({ options, orderOptions }: any) => {
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                console.log(values);
            }}
        >
            {({ values, setFieldValue }) => (
                <Form className="space-y-2 bg-white rounded-lg">
                    {/* Row to keep */}
                    <CustomField
                        name="rowToKeep"
                        controlName="select"
                        options={options}
                        label="Row to keep"
                        labelKey="dtl_desc"
                        valueKey="id"
                    />

                    {/* Deduplicate Columns */}
                    <div>
                        <h3 className="text-gray-700">Deduplicate Columns</h3>
                        <FieldArray name="deduplicateColumns">
                            {({ remove, push }) => (
                                <>
                                    {values.deduplicateColumns.map((_, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <CustomField
                                                name={`deduplicateColumns.${index}.customer_id`}
                                                placeholder="customer_id"
                                            />
                                            <CustomField
                                                name={`deduplicateColumns.${index}.target_column`}
                                                placeholder="target_column"
                                            />
                                            <button
                                                type="button"
                                                className="text-red-500"
                                                onClick={() => remove(index)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="mt-2   text-green-600 flex rounded"
                                        onClick={() => push({ customer_id: '', target_column: '' })}
                                    >
                                        <img
                                            src="/assets/plus-circle.svg"
                                            className="mr-2"
                                            alt="plus"
                                        />
                                        Add Column
                                    </button>
                                </>
                            )}
                        </FieldArray>
                    </div>

                    {/* Use Custom Order By */}
                    <div className="flex items-center">
                        <label className="text-gray-700">
                            <Field
                                type="checkbox"
                                name="useCustomOrderBy"
                                className="mr-2"
                                onChange={(e: any) => {
                                    // Use setFieldValue to update the value of useCustomOrderBy
                                    setFieldValue("useCustomOrderBy", e.target.checked);
                                }}
                                checked={values.useCustomOrderBy}
                            />
                            Use Custom Order By</label>
                    </div>

                    {/* Order Columns */}
                    {values.useCustomOrderBy && (
                        <div>
                            {/* <h3 className="text-gray-700">Order Columns</h3> */}
                            <div className="flex items-center">
                                <div className="flex-grow w-1/2">
                                    <Label>Order Columns</Label>
                                </div>
                                <div className="flex-grow w-1/2">
                                    <Label>Sort</Label>
                                </div>
                            </div>
                            <FieldArray name="orderColumns">
                                {({ remove, push }) => (
                                    <>
                                        {values.orderColumns.map((_, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <CustomField
                                                    name={`orderColumns.${index}.column`}
                                                    placeholder="Column Name"
                                                />
                                                <CustomField
                                                    name={`orderColumns.${index}.sort`}
                                                    controlName="select"
                                                    options={orderOptions}
                                                    labelKey="dtl_desc"
                                                    valueKey="id"
                                                />
                                                <button
                                                    type="button"
                                                    className="text-red-500"
                                                    onClick={() => remove(index)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="mt-2 p-2 flex text-green-600 rounded"
                                            onClick={() => push({ column: '', sort: 'Ascending' })}
                                        >
                                            <img
                                                src="/assets/plus-circle.svg"
                                                className="mr-2"
                                                alt="plus"
                                            />
                                            Add Order Column
                                        </button>
                                    </>
                                )}
                            </FieldArray>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="px-5 py-2 bg-gray-800 text-white rounded-md"
                        >
                            Save
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default function DeDupeForm({ isOpen, onClose, handleDelete }: any) {
    const dispatch = useDispatch();
    const { joinList, selectedOption, orderByList }: any = useSelector((state: RootState) => state.buildPipeLineApi);

    useEffect(() => {
        dispatch(getCodesValue({ value: 32 }));
        dispatch(getOrderBy({ value: 31 }));
    }, [dispatch]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth={'lg'}
        >
            <DialogTitle>
            <h5>{selectedOption?.display ?? selectedOption?.label}</h5>
            <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: "absolute", right: 8, top: 8, color: "black" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DeDupeFormDtl options={joinList.codes_dtl} orderOptions={orderByList.codes_dtl} />
            </DialogContent>
        </Dialog>
    );
}
