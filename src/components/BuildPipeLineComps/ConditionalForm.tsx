import React from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';

interface FormProps {
  schema: any;
  initialValues: any;
  onSubmit: (values: any) => void;
  uiType?: 'normal' | 'tab-container' | 'array-container';
}

const ConditionalForm: React.FC<FormProps> = ({ schema, initialValues, onSubmit, uiType = 'normal' }) => {
  // Build validation schema dynamically from JSON schema
  const buildValidationSchema = (schema: any) => {
    const validationSchema: any = {};
    
    // Handle basic properties
    Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
      let fieldSchema: any = Yup.string();
      
      if (value.type === 'number') {
        fieldSchema = Yup.number();
      } else if (value.type === 'array') {
        fieldSchema = Yup.array().of(
          Yup.object().shape({
            expression: Yup.string().required('Required'),
            sort_order: Yup.string().required('Required'),
            order: Yup.number().required('Required')
          })
        );
      }

      if (value.minLength) {
        fieldSchema = fieldSchema.min(value.minLength);
      }
      
      if (value.enum) {
        fieldSchema = fieldSchema.oneOf(value.enum);
      }
      
      if (schema.required?.includes(key)) {
        fieldSchema = fieldSchema.required('Required');
      }

      validationSchema[key] = fieldSchema;
    });

    return Yup.object().shape(validationSchema);
  };

  const renderArrayField = (fieldName: string, fieldSchema: any, values: any) => (
    <div className="array-field-container">
      <FieldArray
        name={fieldName}
        render={arrayHelpers => (
          <div>
            {values[fieldName]?.map((item: any, index: number) => (
              <div key={index} className="array-item">
                {Object.entries(fieldSchema.items).map(([itemKey, itemSchema]: [string, any]) => (
                  renderField(`${fieldName}.${index}.${itemKey}`, itemSchema, values)
                ))}
                <button type="button" onClick={() => arrayHelpers.remove(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => arrayHelpers.push({})}
            >
              Add Item
            </button>
          </div>
        )}
      />
    </div>
  );

  const renderTabContainer = (fields: [string, any][], values: any) => (
    <div className="tab-container">
      {fields.map(([fieldName, fieldSchema]) => (
        <div key={fieldName} className="tab-section">
          <h3>{fieldName.replace(/_/g, ' ').toUpperCase()}</h3>
          {renderField(fieldName, fieldSchema, values)}
        </div>
      ))}
    </div>
  );

  const renderField = (fieldName: string, fieldSchema: any, values: any) => {
    // Handle array fields
    if (fieldSchema.type === 'array') {
      return renderArrayField(fieldName, fieldSchema, values);
    }

    // Handle enum fields
    if (fieldSchema.enum) {
      return (
        <div key={fieldName} className="field-container">
          <label htmlFor={fieldName}>{fieldName.replace(/_/g, ' ').toUpperCase()}</label>
          <Field as="select" name={fieldName}>
            <option value="">Select</option>
            {fieldSchema.enum.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Field>
          <ErrorMessage name={fieldName} component="div" className="error" />
        </div>
      );
    }

    // Handle number fields
    if (fieldSchema.type === 'number') {
      return (
        <div key={fieldName} className="field-container">
          <label htmlFor={fieldName}>{fieldName.replace(/_/g, ' ').toUpperCase()}</label>
          <Field type="number" name={fieldName} />
          <ErrorMessage name={fieldName} component="div" className="error" />
        </div>
      );
    }

    // Default text field
    return (
      <div key={fieldName} className="field-container">
        <label htmlFor={fieldName}>{fieldName.replace(/_/g, ' ').toUpperCase()}</label>
        <Field type="text" name={fieldName} />
        <ErrorMessage name={fieldName} component="div" className="error" />
      </div>
    );
  };

  const renderFormContent = (values: any) => {
    const fields = Object.entries(schema.properties);

    switch (uiType) {
      case 'tab-container':
        return renderTabContainer(fields, values);
      case 'array-container':
        return fields.map(([fieldName, fieldSchema]) => 
          renderArrayField(fieldName, fieldSchema, values)
        );
      default:
        return fields.map(([fieldName, fieldSchema]) => 
          renderField(fieldName, fieldSchema, values)
        );
    }
  };

  const validationSchema = buildValidationSchema(schema);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values }) => (
        <Form>
          {renderFormContent(values)}
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
};

export default ConditionalForm;
