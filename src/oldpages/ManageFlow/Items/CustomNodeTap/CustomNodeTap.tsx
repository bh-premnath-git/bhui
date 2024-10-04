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
                    <button className={styles.closeIcon} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className={styles.formContainer}>
                    <p>Configuration for this node is not available.</p>
                </div>
            </div>
        );
    }

    const initialValues = nodeConfig.properties.reduce((acc: any, prop: any) => {
        acc[prop.property_key] = prop.default_value || '';
        return acc;
    }, {});

    const validationSchemaFields = nodeConfig.properties.reduce((acc: any, prop: any) => {
        let validator = Yup.string();
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

        return (
            <div className={styles.formField} key={prop.property_key}>
                <label htmlFor={prop.property_key}>{prop.property_name}</label>
                <input type="text" {...commonProps} />
            </div>
        );
    };

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
                <h2>{nodeConfig.node_name}</h2>
                <button className={styles.closeIcon} onClick={onClose}>
                    <X size={24} />
                </button>
            </div>
            <div className={styles.tabContainer}>
                <button className={styles.activeTab}>Property</button>
                <button className={styles.tab}>Settings</button>
            </div>
            <form onSubmit={formik.handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                    {nodeConfig.properties.map((prop: any) => renderField(prop))}
                </div>
                <div className={styles.buttonContainer}>
                    <button type="button" className={styles.closeButton} onClick={onClose}>Close</button>
                    <button type="submit" className={styles.saveButton}>Save</button>
                </div>
            </form>
        </div>
    );
};

export default ModalContent;