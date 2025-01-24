import { Button, Stack } from '@mui/material';
import React from 'react';
import { IoAddCircle, IoCloseSharp } from 'react-icons/io5';
import { Form, Formik } from 'formik';
import CustomField from '@/common/CustomField';
import { COLORS } from '@/utils/constants';

export default function AddFilterPopUp({ openFilter, handleFilterClose }: any) {
    const conditionList = [{ id: 1, conditionName: 'Greater than equal to' }, { id: 2, conditionName: 'Less than equal to' }, { id: 3, conditionName: 'equal to' }]
    const columnList = [{ id: 1, columnName: 'Id' }, { id: 2, columnName: 'Name' }, { id: 3, columnName: 'Age' }]
    return (
        <>
            {openFilter && (<Stack className='shadow-lg' sx={{
                width: '300px',
                position: 'absolute',
                top: '16%',
                background: 'white',
                left: '8%',
                borderRadius: '8px',
                p: 2

            }}>
                <Stack direction={'row'} justifyContent={'space-between'} sx={{ my: 1 }}>
                    <Stack direction={'row'} spacing={2} fontWeight={600}>
                        Add Filter
                    </Stack>
                    <Stack><IoCloseSharp onClick={handleFilterClose} /></Stack>
                </Stack>
                <Formik
                    initialValues={{ condition: '', column: '', value: '' }}

                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {
                            setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Condition</Stack>
                            <CustomField
                                name="condition"
                                controlName="select"
                                options={conditionList}
                                valueKey={'id'} labelKey='conditionName'
                            />

                            <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Column</Stack>
                            <CustomField
                                name="column"
                                controlName="select"
                                valueKey={'id'} labelKey='columnName'
                                options={columnList}
                            />

                            <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Value</Stack>
                            <CustomField name='value' />
                            <Stack sx={{ my: 2, fontWeight: 600, fontSize: 14 }} color={COLORS.green} direction={'row'} spacing={2} alignItems={'center'}><IoAddCircle className='mx-2' size={18} /> ADD FILTTER</Stack>

                            <Stack direction={'row'} justifyContent={'space-between'}>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    className="ml-8 px-4 border text-dark fw-bold "
                                    variant="outlined" onClick={handleFilterClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    className="ml-8 px-4 bg-dark text-white fw-bold"
                                    variant="contained"
                                    type="submit" disabled={isSubmitting}
                                >
                                    Apply
                                </Button>
                            </Stack>

                        </Form>
                    )}
                </Formik>
            </Stack>)}

        </>
    );
}