import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import styles from './CustomNodeTap.module.css';

interface ModalContentProps {
    nodeData: any;
    onClose?: () => void;
    connections?: any[];
}

const ModalContent: React.FC<ModalContentProps> = ({ nodeData, onClose, connections = [] }) => {
    const nodeConfig = nodeData.selectedNode;

    if (!nodeConfig || !nodeConfig.properties) {
        return (
            <div className={styles.modalContainer}>
                <div className={styles.modalHeader}>
                    <h2>No Configuration Found</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className={styles.formContainer}>
                    <p>Configuration for this node is not available.</p>
                </div>
            </div>
        );
    }

    // Generate initialValues and validationSchema dynamically
    const initialValues = nodeConfig.properties.reduce((acc: any, prop: any) => {
        acc[prop.property_key] = '';
        return acc;
    }, {});

    const validationSchemaFields = nodeConfig.properties.reduce((acc: any, prop: any) => {
        let validator;

        // Assign the correct schema based on ui_type
        if (prop.ui_type === 'text' || prop.ui_type === 'drop_down') {
            validator = Yup.string();
        } else if (prop.ui_type === 'number') {
            validator = Yup.number();
        } else if (prop.ui_type === 'json') {
            validator = Yup.string().test('is-json', 'Must be valid JSON', (value) => {
                if (!value) return true;
                try {
                    JSON.parse(value);
                    return true;
                } catch {
                    return false;
                }
            });
        } else {
            validator = Yup.mixed();
        }

        // Apply the 'required' validation if the field is mandatory
        if (prop.mandatory) {
            validator = validator.required(`${prop.property_name} is required`);
        }

        acc[prop.property_key] = validator;
        return acc;
    }, {});

    const validationSchema = Yup.object(validationSchemaFields);

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            console.log(values);
        },
    });

    const renderField = (prop: any) => {
        const commonProps = {
            id: prop.property_key,
            name: prop.property_key,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            value: formik.values[prop.property_key],
        };

        const touched = formik.touched[prop.property_key];
        const error = formik.errors[prop.property_key];

        let field;
        switch (prop.ui_type) {
            case 'text':
                field = (
                    <input
                        type="text"
                        {...commonProps}
                    />
                );
                break;
            case 'number':
                field = (
                    <input
                        type="number"
                        {...commonProps}
                    />
                );
                break;
            case 'json':
                field = (
                    <textarea
                        {...commonProps}
                    />
                );
                break;
            case 'drop_down':
                field = (
                    <select
                        {...commonProps}
                    >
                        <option value="">Select a connection</option>
                        {connections.map((conn) => (
                            <option key={conn.value} value={conn.value}>
                                {conn.label}
                            </option>
                        ))}
                    </select>
                );
                break;
            default:
                field = (
                    <input
                        type="text"
                        {...commonProps}
                    />
                );
                break;
        }

        return (
            <div className={styles.formField} key={prop.property_key}>
                <label htmlFor={prop.property_key}>{prop.property_name}</label>
                {field}
                {touched && error && typeof error === 'string' && (
                    <div className={styles.error}>{error}</div>
                )}
                <small>{prop.help_text}</small>
            </div>
        );
    };

    // Define the type of 'columns' explicitly
    const columns: JSX.Element[][] = nodeConfig.layout === '2-column' ? [[], []] : [[]];

    nodeConfig.properties.forEach((prop: any, index: number) => {
        const columnIndex = nodeConfig.layout === '2-column' ? index % 2 : 0;
        columns[columnIndex].push(renderField(prop));
    });

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
                <h2>{nodeConfig.node_name} Configuration</h2>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={24} />
                </button>
            </div>
            <form onSubmit={formik.handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                    {columns.map((columnFields, idx) => (
                        <div className={styles.formColumn} key={idx}>
                            {columnFields}
                        </div>
                    ))}
                </div>
                <button type="submit" className={styles.submitButton}>Submit</button>
            </form>
        </div>
    );
};

export default ModalContent;
