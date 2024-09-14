import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useField, useFormikContext } from 'formik';

interface CustomAutoCompleteProps<T> {
    name: string;
    options: T[];
    placeholder: string;
    width?: number;
    size?: 'small' | 'medium';
    getOptionLabel: (option: T) => string;
    label?: string;
}

const CustomAutoComplete = <T extends unknown>({
    name,
    options,
    placeholder,
    width = 200,
    size = 'small',
    getOptionLabel,
    label,
}: CustomAutoCompleteProps<T>) => {
    const { setFieldValue } = useFormikContext();
    const [field, meta] = useField(name);

    const errorText = meta.touched && meta.error ? meta.error : '';

    return (
        <Autocomplete 
            disablePortal
            options={options}
            sx={{ width }}
            size={size}
            getOptionLabel={getOptionLabel}
            onChange={(_, newValue) => setFieldValue(name, newValue ? getOptionLabel(newValue) : '')}
            renderInput={(params) => (
                <TextField 
                    {...params}
                    {...field}
                    label={label}
                    placeholder={placeholder}
                    error={Boolean(errorText)}
                    helperText={errorText}
                    InputProps={{
                        ...params.InputProps,
                        sx: {
                            '& input::placeholder': {
                                fontFamily: 'Inter',
                            },
                        },
                    }}
                />
            )}
        />
    );
};

export default CustomAutoComplete;
