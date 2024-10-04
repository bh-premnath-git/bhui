import React from 'react';
import { TextField } from '@mui/material';
import { FieldProps } from 'formik';

interface CustomTextFieldProps extends FieldProps {
  sx?: React.CSSProperties;
  placeholder: string;
  variant: 'outlined' | 'filled' | 'standard';
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  sx,
  placeholder,
  variant,
  ...props
}) => {
  const errorText = touched[field.name] && errors[field.name];
  
  return (
    <TextField
      {...field}
      {...props}
      sx={{
        my: 1,
        width: '50ch',
        borderRadius: '16px',
        '& fieldset': {
          borderColor: '#f2f3f5', // Change border color to light grey
        },
        '&:hover fieldset': {
          borderColor: '#f2f3f5', // Add hover effect
        },
        '&.Mui-focused fieldset': {
          borderColor: '#f2f3f5', // Add focus effect
        },
        ...sx, // Add any additional styles passed as props
      }}
      placeholder={placeholder}
      variant={variant}
      error={Boolean(errorText)}
    />
  );
};

export default CustomTextField;
