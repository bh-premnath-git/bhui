import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { TextField, Select, MenuItem, FormControl, FormHelperText, InputLabel } from '@mui/material';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
    name: string;
    label?: string;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    size?: 'small' | 'medium'; // Size can be 'small' or 'medium'
    controlName?: 'input' | 'select'; // Control type (input or select)
    options?: Array<{ [key: string]: any }>; // Options for select dropdown
    valueKey?: string; // Key to access the value in options
    labelKey?: string; // Key to access the label in options
    onChange?: (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
    required?: boolean;
    className?: any;
}

const CustomField: React.FC<FormFieldProps> = ({
    name,
    label,
    placeholder,
    size = 'small',
    type = 'text',
    disabled = false,
    controlName = 'input',
    options = [],
    valueKey = 'value',
    labelKey = 'label',
    className,
    onChange,
    required = false // Default to false if not passed
}) => {
    return (
        <FormControl fullWidth variant="outlined" margin="normal" sx={{ mt: 1 }}>
            <Field name={name} className={className}>
                {({ field, form }: { field: any; form: any }) => {
                    const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
                        form.setFieldValue(name, event.target.value); // Formik's onChange handler
                        if (onChange) onChange(event); // Custom onChange handler
                    };

                    return controlName === 'select' ? (
                        <>
                            {label && (
                                <Label className="font-normal">
                                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                                </Label>
                            )}
                            <Select labelId={"label"}
                                {...field}
                                size={size}
                                disabled={disabled}
                                onChange={handleChange}
                                inputProps={{ 'aria-label': label }}
                            >
                                {options.map((option, index) => (
                                    <MenuItem key={index} value={option[valueKey]}>
                                        {option[labelKey]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </>
                    ) : (
                        <>
                            {label && (
                                <Label className="font-normal">
                                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                                </Label>
                            )}
                            <TextField
                                {...field}
                                size={size}
                                type={type}
                                placeholder={placeholder}
                                variant="outlined"
                                fullWidth
                                disabled={disabled}
                                onChange={handleChange}
                                InputProps={{ 'aria-label': label }}
                                className="shadow-sm rounded"
                            />
                        </>
                    );
                }}
            </Field>

            <ErrorMessage name={name}>
                {(msg) => <FormHelperText error>{msg}</FormHelperText>}
            </ErrorMessage>
        </FormControl>
    );
};

export default CustomField;
