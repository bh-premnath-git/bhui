import React, { useEffect, useState } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Stack,
  FormHelperText,
  Button
} from '@mui/material';
import { green } from '@mui/material/colors';
import {ApiService} from '@/services/apiServices';


const validationSchema = Yup.object({
  zone_cd: Yup.string().required('Please select a zone'),
});

function ConnectionDetailsStep({ handlePrivious, handleNext, publishId }) {
  console.log(publishId)
  const [zone, setZone] = useState([])
  const [publishData, setPublishData]: any = useState()
  const [initialValues, setInitialValues]: any = useState({zone_cd: ''})

  useEffect(() => {
    const getZoneData = async () => {
      var params = {};
      var result = await ApiService('8011', 'get', `codes_hdr/23`, params)
      console.log(result)
      if (result) {
        setZone(result?.codes_dtl);
      }
    };

    getZoneData();
    if (publishId) {
      getData(publishId)
    }
  }, []);

  async function getData(publishdataId) {
    var data = {};
    var result = await ApiService('8011', 'get', `/publish_data/publish_details/${publishdataId}`, data);
    if (result) {
      setPublishData(result)
      setInitialValues({zone_cd:result.zone_cd})

    }
    console.log(result)
  }
  async function update(data) {
    publishData.zone_cd=data?.zone_cd;
    var result = await ApiService('8011', 'put', `/publish_data/publish_details/${publishData?.publish_id}`, publishData);
    console.log(result)
    if (result) {
      handleNext();
    }
  }

  return (
    <div className="">
      <Box sx={{ width: '50%', m: 'auto', justifyContent: 'start' }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={(values) => {
            update(values)
          }}
        >
          {({ values, errors, touched, handleChange }:any) => (
            <Form>
              <Stack spacing={2} mt={2}>
                <Stack className='text-start fw-bold'>
                  <Typography variant='h6' className='text-secondary' sx={{fontFamily:'Inter !important'}}>
                    Please select the option below to continue
                  </Typography>
                  <br></br>
                  <br></br>
                  <Typography variant="subtitle1" fontWeight="bold"  sx={{fontFamily:'Inter !important'}} >
                    Select the zone from which data needs to be delivered
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      name="zone_cd"
                      value={values.zone_cd}
                      onChange={handleChange}
                    >
                      {zone?.map((item: any, index: any) => (
                        <FormControlLabel key={index}
                          value={item?.id}
                          control={<Radio sx={{ '&.Mui-checked': { color: green[500] } }} />}
                          label={item?.dtl_desc}
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontFamily: 'Inter !important', // Custom font for the label
                            },
                          }}
                        />
                      ))}

                    </RadioGroup>
                    {touched.zone_cd && errors.zone_cd && (
                      <FormHelperText error>{errors.zone_cd}</FormHelperText>
                    )}
                  </FormControl>
                </Stack>

              </Stack>
              {/* <button type="submit">Submit</button> */}
              <br></br>
              <Stack direction={'row'} spacing={3}>
                <Button variant="contained" className='back-btn' onClick={() => { handlePrivious(); }}   >Back
                </Button>
                <Button variant="contained" className='create-btn' type='submit'  >{publishData?.zone_cd ?"Update":"Next"}
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>
    </div>
  );
}

export default ConnectionDetailsStep;
