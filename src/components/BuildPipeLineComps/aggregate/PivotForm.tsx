import { Field, FieldArray, Form, Formik } from "formik";
import CustomField from "@/common/CustomField";
import { Label } from "@/components/ui/label";
import * as Yup from "yup";
import Textarea from "@/common/TextArea";

const validationSchema = Yup.object().shape({
    pivot_column: Yup.string().required('Required'),
    pivot: Yup.array().of(
        Yup.object().shape({
            unique_values: Yup.string().required('Required'),
        })
    ),

});

const initialValues = {
    pivot_column: '',
    pivot: [{ unique_values: '' }],
    isPivot: false,
};

export const PivotForm = () => {
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
                    <div className="flex items-center">
                        <label className="text-gray-700">
                            <Field
                                type="checkbox"
                                name="isPivot"
                                className="mr-2"
                                onChange={(e: any) => {
                                    // Use setFieldValue to update the value of useCustomOrderBy
                                    setFieldValue("isPivot", e.target.checked);
                                }}
                                checked={values.isPivot}
                            />
                            Do Pivot</label>
                    </div>
                    {values.isPivot && (<div>
                        <Field
                            name="pivot_column" // The field name must match the formik initial values
                            placeholder="Enter your condition here"
                            component={Textarea} // Use your custom Textarea component
                        />
                       
                        <FieldArray name="pivot">
                            {({ remove, push }) => (
                                <>
                                    {values.pivot.map((_, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <CustomField
                                                name={`pivot.${index}.unique_values`}
                                                placeholder="Unique values"
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
                                        onClick={() => push({ unique_values: '' })}
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
                    </div>)}
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
