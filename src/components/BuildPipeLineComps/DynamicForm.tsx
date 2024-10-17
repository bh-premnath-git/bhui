import React, { useEffect, useState } from "react";
import { TextField, Button, Typography, Grid, FormControlLabel, Radio } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { setNestedField } from "../../redux/BuildPipeLineSlice";
import { RootState } from "@/store/store";
import CustomField from "@/common/CustomField";
import { Label } from "@/components/ui/label";


const DynamicForm = () => {

    // const [authData, setAuthData] = useState<any>(null);
    const { dynamicConData, nestedFields }:any = useSelector((state: RootState) => state.buildPipeLineApi);
    const apiResponse = dynamicConData;
    const dispatch = useDispatch();
    useEffect(() => {

    }, [dynamicConData])
    // Prepare validation schema based on required fields
    const validationSchema = Yup.object().shape(
        apiResponse?.connectionSpecification?.required.reduce((acc: any, field: any) => {
            acc[field] = Yup.string().required(`${field} is required`);
            return acc;
        }, {})
    );

    // Initialize formik
    const formik = useFormik({
        initialValues: Object.keys(apiResponse?.connectionSpecification?.properties).reduce((acc: any, field) => {
            acc[field] = ""; // Set initial value to an empty string
            return acc;
        }, {}),
        validationSchema,
        onSubmit: (values) => {
            // console.log("Form Data Submitted: ", values);
        },
    });

    // Function to render standard fields
    const renderField = (fieldKey: string, field: any, layout:any) => {
        return (
            <Grid item xs={layout} key={field.title}>
                <Label className="text-black">{field.title}</Label>
                <TextField className="shadow-sm rounded"
                    fullWidth
                    id={field.title}
                    name={fieldKey}
                    // label={field.title}
                    placeholder={field.title}
                    size="small"
                    type={field.bh_secret ? 'password' : 'text'}
                    value={formik.values[fieldKey]}
                    onChange={formik.handleChange}
                    error={formik.touched[fieldKey] && Boolean(formik.errors[fieldKey])}
                    // helperText={formik.touched[fieldKey] && formik.errors[fieldKey]}
                />
            </Grid>
        );
    };

    const handleRadioChange = (fieldKey: string, value: string, nestedField: any) => {
        formik.setFieldValue(fieldKey, value);
        dispatch(setNestedField(nestedField));
        // setAuthData(nestedField); // Set the auth data for dynamic rendering
    };

    const renderObject = (fieldKey: string, field: any) => {
        return (
            <Grid item xs={12} key={field.title}>
                <Typography variant="body1">{field.title}</Typography>
                <Grid container spacing={2}>
                    {field.oneOf?.map((nestedField: any, index: number) => (
                        <Grid item xs={4} key={index}>
                            <FormControlLabel
                                control={
                                    <Radio
                                        size="small"
                                        id={`${fieldKey}-${index}`}
                                        name={fieldKey}
                                        value={nestedField.title}
                                        checked={formik.values[fieldKey] === nestedField.title}
                                        onChange={() => handleRadioChange(fieldKey, nestedField.title, nestedField)}
                                    />
                                }
                                label={nestedField.title}
                            />
                        </Grid>

                    ))}
                </Grid>
                {nestedFields && (
                    <>
                        <Typography variant="body1">{nestedFields?.title}</Typography>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={2}>
                                {renderFields(nestedFields.properties, 4)}
                            </Grid>
                            {/* <Button color="primary" variant="contained" type="submit">
                                            Submit
                                        </Button> */}
                        </form>
                    </>
                )}
            </Grid>
        );
    };

    // Recursive function to render all fields dynamically
    const renderFields = (fields: any, layout:any) => {
        return Object.keys(fields).map((fieldKey) => {
            const field = fields[fieldKey];
            if (field.type !== "object") {
                return renderField(fieldKey, field, layout); // Render standard field
            } else if (field.oneOf) {
                return renderObject(fieldKey, field); // Render "oneOf" object field
            }
            return null;
        });
    };

    return (
        <>
            {dynamicConData && (<form onSubmit={formik.handleSubmit}>
                <Typography variant="body1">{apiResponse.connectionSpecification.title}</Typography>
                <Grid container spacing={2}>
                    {renderFields(apiResponse.connectionSpecification.properties, 6)}
                </Grid>
                {/* <Button className="my-2" color="primary" variant="contained" type="submit">
                    Submit
                </Button> */}
            </form>)}
        </>
    );
};

export default DynamicForm;
