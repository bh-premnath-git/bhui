import React, { useState, useCallback } from 'react';
import { AlertCircle, Check, Copy, X } from 'lucide-react';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { CheckboxGroup } from './CheckboxGroup';
import { JsonInput } from './JsonInput';
import { MultilineInput } from './MultilineInput';
import { TextArea } from './TextArea';

interface FormData {
  name: string;
  email: string;
  message: string;
  preferences: string[];
  jsonData: string;
  multilineText: string[];
  agreement: boolean;
  category: string;
}

const FormComponent: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    preferences: [],
    jsonData: '',
    multilineText: [],
    agreement: false,
    category: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showModal, setShowModal] = useState(false);

  const categories = [
    'Development',
    'Design',
    'Marketing',
    'Sales',
    'Support',
    'Other',
  ];

  const preferenceOptions = [
    'Email notifications',
    'SMS alerts',
    'Newsletter',
    'Product updates',
  ];

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<FormData> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.message) newErrors.message = 'Message is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      setShowModal(true);
    }
  };

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-8 space-y-6 border-2 border-gray-200">
        <div className="space-y-4">
          <InputField
            label="Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
          />

          <InputField
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
          />

          <SelectField
            label="Category"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            error={errors.category}
            options={categories}
          />

          <CheckboxGroup
            label="Preferences"
            options={preferenceOptions}
            selected={formData.preferences}
            onChange={(preferences) => setFormData(prev => ({ ...prev, preferences }))}
          />

          <JsonInput
            value={formData.jsonData}
            onChange={(value) => setFormData(prev => ({ ...prev, jsonData: value }))}
          />

          <MultilineInput
            label="Multiple Text Inputs"
            values={formData.multilineText}
            onChange={(values) => setFormData(prev => ({ ...prev, multilineText: values }))}
          />

          <TextArea
            label="Message"
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            error={errors.message}
          />

          <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors">
            <input
              type="checkbox"
              id="agreement"
              name="agreement"
              checked={formData.agreement}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-2 border-gray-400 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="agreement" className="ml-2 block text-sm text-gray-900">
              I agree to the terms and conditions
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border-2 border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Submit Form
          </button>
        </div>
      </form>

      {/* Form Data Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Form Submission Data</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(formData, null, 2)}
              </pre>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormComponent;