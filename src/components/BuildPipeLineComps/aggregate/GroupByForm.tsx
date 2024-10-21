import { Field, FieldArray, Form, Formik } from "formik";
import CustomField from "@/common/CustomField";
import { Label } from "@/components/ui/label";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    aggrigate: Yup.array().of(
        Yup.object().shape({
            target_column: Yup.string().required('Column name required'),
            expression: Yup.string().required('Expression required'),
        })
    ),

});

const initialValues = {
    aggrigate: [{ expression: '', target_column: '' }],
};

export const GroupByForm = () => {
    return (
        <>
            <div className="grid grid-cols-2 gap-2" >
                <div>
                    <Label>Target column </Label>
                </div>
                <div className="w-96">
                    <Label>Expression</Label>
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
                                            <div className="grid grid-cols-2 gap-2" key={index}>

                                                <div>
                                                    <CustomField
                                                        name={`aggrigate.${index}.target_column`}
                                                        placeholder="Column name"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <CustomField
                                                        name={`aggrigate.${index}.expression`}
                                                        placeholder="Expression"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="text-red-500"
                                                        onClick={() => remove(index)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>


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
