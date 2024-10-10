import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Stack,
  Autocomplete,
  TextField,
  Button,
} from '@mui/material';
import { green } from '@mui/material/colors';
import {ApiService} from '@/services/apiServices';
import { useNavigate } from 'react-router-dom';

const DeliveryOptionsStep = ({ handlePrivious, handleNext, publishId }) => {
  const navigate = useNavigate();
  const [deleviryOption, setDeleviryOption] = useState([]);
  const [initialValues, setInitialValues] = useState({
    delivery_option_cd: '',
    file_format_cd: '',
    delimiter_cd: '',
    compression: '',
  });
  const [files, setFields] = useState([]);
  const [delimiters, setDelimiters] = useState([]);
  const [compressions, setCompressions] = useState([]);
  const [publishData, setPublishData]: any = useState()

  console.log(publishId)
  useEffect(() => {
    const getDeleveryOption = async () => {
      var params = {};
      var result = await ApiService('8011', 'get', `codes_hdr/24`, params)
      console.log(result)
      if (result) {
        setDeleviryOption(result?.codes_dtl);
      }
      getFile();
      getDelimiters();
      getCompressions()
    };
    const getFile = async () => {
      var params = {};
      var result = await ApiService('8011', 'get', `codes_hdr/25`, params)
      console.log(result)
      const files = result?.codes_dtl?.map((fil: any) => ({
        label: fil?.dtl_desc,
        value: fil?.id
      }));
      if (result) {
        setFields(files);
      }
    };

    const getDelimiters = async () => {
      var params = {};
      var result = await ApiService('8011', 'get', `codes_hdr/26`, params)
      console.log(result)
      const delimiter = result?.codes_dtl?.map((delim: any) => ({
        label: delim?.dtl_desc, // Display relation_ship_owner as label
        value: delim?.id          // Use customer_id as the value
      }));
      if (result) {
        setDelimiters(delimiter);
      }
    };

    const getCompressions = async () => {
      var params = {};
      var result = await ApiService('8011', 'get', `codes_hdr/27`, params)
      console.log(result)
      const compressions = result?.codes_dtl?.map((com: any) => ({
        label: com?.dtl_desc, // Display relation_ship_owner as label
        value: com?.id          // Use customer_id as the value
      }));
      if (result) {
        setCompressions(compressions);
      }
      if (publishId) {
        getData(publishId)
      }
    };

    getDeleveryOption();

  }, [])
  async function getData(publishdataId) {
    var data = {};
    var result = await ApiService('8011', 'get', `/publish_data/publish_details/${publishdataId}`, data);
    if (result) {
      setPublishData(result)
      setInitialValues({
        delivery_option_cd: result.delivery_option_cd,
        file_format_cd: result.file_format_cd,
        delimiter_cd: result.delimiter_cd,
        compression: result.compression,
      })

    }
    console.log(result)
  }
  async function update(data) {
    var result = await ApiService('8011', 'put', `/publish_data/publish_details/${publishId}`, data);
    console.log(result)
    if (result) {
      handleNext(result)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={(values) => {
        update(values)
      }}
    >
      {({ values, setFieldValue }: any) => (
        <Form className="pt-10 text-left">
          <Stack sx={{ mt: 3 }} alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold" sx={{fontFamily:'Inter !important'}}>
              Select delivery option
            </Typography>
            <FormControl component="fieldset" className="formControl" sx={{ mt: 1 }}>
              <RadioGroup
                aria-label="Layout Direction"
                row
                value={values.delivery_option_cd}
                onChange={(e) => setFieldValue('delivery_option_cd', e.target.value)}
              >
                {deleviryOption?.map((item: any, index) => (
                  <Box sx={{ mx: 2 }} border={1} key={index} borderColor="lightgray" borderRadius={2} px={1} width={200}>
                    <FormControlLabel
                      value={item?.id}
                      control={
                        <Radio
                          sx={{
                            '&.Mui-checked': { color: green[500] },
                            '&:not(.Mui-checked)': { color: 'black' },
                          }}
                        />
                      }
                      label={item?.dtl_desc}
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontFamily: 'Inter !important', // Custom font for the label
                        },
                      }}

                    />
                  </Box>))}

              </RadioGroup>
            </FormControl>

            <Stack sx={{ mt: 5 }}>
              <Typography textAlign="center" variant="subtitle1" fontWeight="bold" sx={{fontFamily:'Inter !important'}}>
                Select Delivery Format
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Stack>
                  <Typography className='text-start myHeadFont'>File Format</Typography>
                  <Autocomplete
                    disablePortal
                    id="file-format"
                    options={files}
                    value={files.find((option: any) => option.value === values.file_format_cd) || null}
                    getOptionLabel={(option: any) => option?.label}
                    onChange={(event, newValue) => setFieldValue('file_format_cd', newValue?.value)}
                    sx={{ width: 300, mt: 2 }}
                    renderInput={(params) => <TextField {...params} placeholder="Choose File Format"
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        fontFamily: 'Inter !important', // Custom font for placeholder
                      },
                    }} />}
                  />
                </Stack>
                <Stack>
                  <Typography className='text-start myHeadFont'>Delimiter</Typography>
                  <Autocomplete
                    disabled={values.file_format_cd !== 2108}
                    id="delimiter_cd"
                    options={delimiters}
                    getOptionLabel={(option: any) => option?.label}
                    onChange={(event, newValue) => setFieldValue('delimiter_cd', newValue?.value)}
                    sx={{ width: 300, mt: 2 }}
                    renderInput={(params) => <TextField {...params} placeholder="Choose Delimiter" 
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        fontFamily: 'Inter !important', // Custom font for placeholder
                      },
                    }}/>}
                  />
                </Stack>
                <Stack>
                  <Typography className='text-start myHeadFont'>Compression</Typography>
                  <Autocomplete disabled={values.file_format_cd !== 2108 && values.file_format_cd !== 2110}
                    id="compression"
                    options={compressions}
                    getOptionLabel={(option: any) => option?.label}
                    onChange={(event, newValue) => setFieldValue('compression', newValue?.value)}
                    sx={{ width: 300, mt: 2 }}
                    renderInput={(params) => <TextField {...params} placeholder="Choose Compression"
                    sx={{
                      '& .MuiInputBase-input::placeholder': {
                        fontFamily: 'Inter !important', // Custom font for placeholder
                      },
                    }} />}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <br></br>
          <br></br>
          <Stack direction={'row'} spacing={3} justifyContent={'center'}>
            <Button variant="contained" className='back-btn myHeadFont' onClick={() => { navigate('/publisher/runquarydetails', { state: publishId }); }}   >Back
            </Button>
            <Button variant="contained" className='create-btn myHeadFont' type='submit'  >{publishData?.file_format_cd ? "Update" : "Next"}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

export default DeliveryOptionsStep;
