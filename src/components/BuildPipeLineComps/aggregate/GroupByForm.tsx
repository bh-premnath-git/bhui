import { Field, FieldArray, Form, Formik } from "formik";
import CustomField from "@/common/CustomField";
import { Label } from "@/components/ui/label";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    aggrigate: Yup.array().of(
        Yup.object().shape({
            target_column: Yup.string().required('Required'),
            expression: Yup.string().required('Required'),
        })
    ),

});

const initialValues = {
    aggrigate: [{ expression: '', target_column: '' }],
};

export const GroupByForm = () => {
    return (
        <>
            <div className="flex space-between">
                <div className="w-96">
                    <Label>Expression</Label>
                </div>
                <div className="w-96">
                    <Label>Target column</Label>
                </div>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    console.log(values);
                }}
            >

                {({ values, setFieldValue }) => (
                    <Form className="space-y-2 bg-white rounded-lg">

                        <div>
                            <FieldArray name="aggrigate">
                                {({ remove, push }) => (
                                    <>
                                        {values.aggrigate.map((_, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <CustomField
                                                    name={`aggrigate.${index}.target_column`}
                                                    placeholder="target column"
                                                />
                                                <CustomField
                                                    name={`aggrigate.${index}.expression`}
                                                    placeholder="expression"
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
                                            onClick={() => push({ expression: '', target_column: '' })}
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
        </>
    );
};
