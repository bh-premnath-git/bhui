import React from 'react';
import {
  Modal,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field } from 'formik';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Textarea from '@/common/TextArea'; // Ensure this is your Formik-compatible TextArea component

interface FilterPopUpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterPopUp({ isOpen, onClose }: FilterPopUpProps) {
  const { selectedOption }: any = useSelector((state: RootState) => state.buildPipeLineApi);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box component="h5">{selectedOption?.display??selectedOption?.label}</Box>
          <Box display="flex" alignItems="center">
            <IconButton onClick={onClose} sx={{ ml: 2 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Formik Integration */}
        <Formik
          initialValues={{ condition: '' }} // Define initial values for the form
          onSubmit={(values, actions) => {
            console.log('Form submitted with values:', values);
            // Add any form submission logic here
            onClose(); // Close the modal after submission
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Textarea for entering the condition */}
              <Field name="condition" placeholder="Enter your condition here" component={Textarea} />

              <div className="text-center mt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  sx={{ textTransform: 'none' }}
                  className="ml-8 px-4 bg-dark text-white myFont"
                  variant="contained"
                >
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
}
