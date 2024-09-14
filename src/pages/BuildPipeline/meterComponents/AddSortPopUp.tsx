import { Button, Stack, Switch } from '@mui/material';
import React from 'react';
import { IoAddCircle, IoCloseSharp } from 'react-icons/io5';
import { Form, Formik } from 'formik';
import CustomField from '../../../common/CustomField';
import { COLORS } from '../../../utils/constants';

export default function AddSortPopUp({ openSort, handleSortClose }) {
    const [checked, setChecked] = React.useState(true);
    const handleChange = (event) => {
        setChecked(event.target.checked);
    };
    const columnList = [{ id: 1, columnName: 'Id' }, { id: 2, columnName: 'Name' }, { id: 3, columnName: 'Age' }]
    return (
        <>
            {openSort && (<Stack className='shadow-lg' sx={{
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
                        Add Sort
                    </Stack>
                    <Stack><IoCloseSharp onClick={handleSortClose} /></Stack>
                </Stack>
                <Formik
                    initialValues={{ column: '' }}
                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {
                            alert(JSON.stringify(values, null, 2));
                            setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Stack direction={'row'} spacing={1} alignContent={'center'} alignItems={'center'}>
                                <Stack fontWeight={checked ? 600 : 500}>Ascending</Stack>
                                <Switch color='success'
                                    checked={checked}
                                    onChange={handleChange}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                                <Stack fontWeight={!checked ? 600 : 500}>Descending</Stack>

                            </Stack>
                            <Stack sx={{ fontWeight: 500, fontSize: 14, mt: 1 }}>Column</Stack>
                            <CustomField
                                name="column"
                                controlName="select"
                                valueKey={'id'} labelKey='columnName'
                                options={columnList}
                            />

                            <Stack sx={{ my: 2, fontWeight: 600, fontSize: 14 }} color={COLORS.green}
                                direction={'row'} spacing={2} alignItems={'center'}>
                                <IoAddCircle className='mx-2' size={18} />
                                ADD SORT
                            </Stack>

                            <Stack direction={'row'} justifyContent={'space-between'}>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    className="ml-8 px-4 border text-dark fw-bold "
                                    variant="outlined" onClick={handleSortClose}
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