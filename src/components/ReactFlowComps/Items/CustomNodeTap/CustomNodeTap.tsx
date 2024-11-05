import React, { useEffect, useState } from 'react';
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import styles from '@/components/ReactFlowComps/Items/CustomNodeTap/CustomNodeTap.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { LocalStorageService } from '@/services/localStorageServices';
import { NodeTransformer } from '@/pages/manageFlow/flowTransformer';
import { databaseSyncService } from '@/services/databaseSync';
import { ApiService } from '@/services/apiServices';

interface ModalContentProps {
    nodeData: any;
    onClose?: () => void;
    connections?: any[];
}

const getErrorMessage = (fieldName: string, errors: FormikErrors<any>): string => {
    const error = errors[fieldName];
    return typeof error === 'string' ? error : '';
};

const ModalContent: React.FC<ModalContentProps> = ({ nodeData, onClose, connections = [] }) => {
    const nodeConfig = nodeData.selectedNode;
    const [dropDownOptions, setDropDownOptions] = useState<{ [key: string]: string[] }>({});


    const { selectedFlowFromList } = useSelector(
        (state: RootState) => state.flowApi
    );

    useEffect(() => {
        const fetchConnections = async () => {
            const dropdownProps = nodeConfig.properties.filter(
                (prop: any) => prop.ui_type === 'drop_down' && prop.dependency && prop.dependencycont
            );
            const options: { [key: string]: string[] } = {};
            for (const prop of dropdownProps) {
                const result = await ApiService(
                    '8011',
                    'get',
                    `${prop.dependency}${selectedFlowFromList.flow_deployment[0].bh_env_id}${prop.dependencycont}`,
                    null
                );
                options[prop.property_key] = result;
            }
            setDropDownOptions(options);
        };
        fetchConnections();
    }, [nodeConfig, selectedFlowFromList]);

    const initialValues = nodeConfig.properties.reduce((acc: any, prop: any) => {
        acc[prop.property_key] = prop.default_value || '';
        return acc;
    }, {});

    const validationSchemaFields = nodeConfig.properties.reduce((acc: any, prop: any) => {
        let validator;
        switch (prop.ui_type) {
            case 'number':
                validator = Yup.number().typeError('Must be a number');
                break;
            case 'json':
                validator = Yup.string().test('is-json', 'Invalid JSON', (value) => {
                    if (!value) return true;
                    try {
                        JSON.parse(value);
                        return true;
                    } catch {
                        return false;
                    }
                });
                break;
            default:
                validator = Yup.string();
        }

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
        onSubmit: async (values) => {
            const transformedData = NodeTransformer.transform(nodeConfig, values);
            LocalStorageService.setItem(`form-${selectedFlowFromList.flow_id}`, values);
            databaseSyncService.queueForSync(selectedFlowFromList.flow_deployment[0].flow_deployment_id, { flow_wip_json: JSON.stringify(transformedData) });
            if (onClose)
                onClose();
        },
    });

    useEffect(() => {
        // Load saved values from localStorage
        const savedValues = LocalStorageService.getItem(`form-${selectedFlowFromList.flow_id}`);
        if (savedValues) {
            // Update formik values with saved values
            Object.keys(savedValues).forEach(key => {
                formik.setFieldValue(key, savedValues[key]);
            });

        }
    }, [selectedFlowFromList.flow_id]);

    const renderField = (prop: any) => {
        const commonProps = {
            id: prop.property_key,
            name: prop.property_key,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            value: formik.values[prop.property_key],
        };

        let field;
        switch (prop.ui_type) {
            case 'text':
                field = <input type="text" {...commonProps} />;
                break;
            case 'drop_down':
                 field = (
                    <select {...commonProps}>
                        <option value="">Select an option</option>
                        {dropDownOptions[prop.property_key]?.map((option: any) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
                break;
            case 'json':
                field = <input {...commonProps} type="text" />;
                break;
            case 'number':
                field = <input type="number" {...commonProps} />;
                break;
            case 'checkbox':
                field = (
                    <input
                        type="checkbox"
                        {...commonProps}
                        checked={formik.values[prop.property_key]}
                        onChange={(e) => formik.setFieldValue(prop.property_key, e.target.checked)}
                    />
                );
                break;
                case 'radio':
            field = (
                <div>
                    {Object.keys(prop)
                        .filter((key) => key.startsWith('option'))
                        .map((optionKey) => (
                            <label key={optionKey}>
                                <input
                                    type="radio"
                                    name={prop.property_key}
                                    value={prop[optionKey]}
                                    checked={formik.values[prop.property_key] === prop[optionKey]}
                                    onChange={formik.handleChange}
                                />
                                {prop[optionKey]}
                            </label>
                        ))}
                </div>
            );
            break;
            default:
                field = <input type="text" {...commonProps} />;
        }

        return (
            <div className={styles.formField} key={prop.property_key}>
                <label htmlFor={prop.property_key}>{prop.property_name}</label>
                {field}
                {formik.touched[prop.property_key] && formik.errors[prop.property_key] && (
                    <div className={styles.errorMessage}>
                        {getErrorMessage(prop.property_key, formik.errors)}
                    </div>
                )}
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