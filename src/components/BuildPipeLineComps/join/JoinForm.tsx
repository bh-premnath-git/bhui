import React, { useEffect } from "react";
import { Formik, FieldArray, Form, Field } from "formik";
import { IoCloseSharp } from "react-icons/io5";
import { Stack } from "@mui/material";
import CustomField from "@/common/CustomField";
import * as Yup from "yup";

// Create dynamic validation schema based on fields
const createValidationSchema = (fields: any) => {
    const validationFields = fields.reduce((acc: any, field: any) => {
        acc[field.name] = Yup.string().required(`${field.label} is required`);
        return acc;
    }, {});
    return Yup.object().shape({
        conditions: Yup.array().of(Yup.object().shape(validationFields)),
    });
};

const JoinForm = ({ form, formData, setFormData, joinList }: any) => {
    const validationSchema = createValidationSchema(form.fields);

    useEffect(() => {
        // alert(JSON.stringify(joinList))
        console.log(formData.conditions);
    }, [formData]);

    return (
        <Formik
            initialValues={{
                conditions: formData.conditions?.length > 0
                    ? formData.conditions.map((condition: any) => ({ ...condition }))
                    : form.fields.map((field: any) => ({ [field.name]: "" })),
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                console.log(`${form.name} values:`, values);
                setFormData(values); // Update form data when the form is submitted
            }}
            enableReinitialize
        >
            {({ values }) => (
                <Form>
                    <FieldArray name="conditions">
                        {({ remove, push }) => (
                            <div>
                                {values.conditions.length > 0 &&
                                    values.conditions.map((condition: any, index: any) => (
                                        <div key={index} className="flex items-center mb-4">
                                            {form.fields.map((field: any, idx: any) => (
                                                <div key={idx} className="flex-grow ml-4">
                                                    {field.type === "select" ? (
                                                        <div className="w-full">
                                                            <CustomField options={joinList} name={`conditions.${index}.${field.name}`} controlName="select" label={field.label} labelKey="dtl_desc" valueKey="codes_hdr_id" />

                                                        </div>
                                                    ) : (
                                                        <div className="w-full">

                                                            <CustomField
                                                                name={`conditions.${index}.${field.name}`}
                                                                placeholder={field.placeholder}
                                                                label={field.label}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="ml-4 flex items-center">
                                                <button
                                                    type="button"
                                                    className="mt-3 text-red-600 hover:text-red-800"
                                                    onClick={() => remove(index)}
                                                >
                                                    <IoCloseSharp />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                <button
                                    type="button"
                                    className="flex items-center text-green-600 hover:text-green-800"
                                    onClick={() => {
                                        // Push a new empty condition into the form array
                                        push(
                                            form.fields.reduce(
                                                (acc: any, field: any) => ({
                                                    ...acc,
                                                    [field.name]: "",
                                                }),
                                                {}
                                            )
                                        );
                                    }}
                                >
                                    <img
                                        src="/assets/plus-circle.svg"
                                        className="mr-2"
                                        alt="plus"
                                    />
                                    Add {form.name}
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
                        <button
                            type="button"
                            className="mt-12 w-24 bg-white text-black border p-1 rounded-md"
                            onClick={() => setFormData(values)} // Handle cancel if needed
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
    );
};

export default JoinForm;
