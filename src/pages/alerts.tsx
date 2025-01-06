import React, { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { ApiService } from '@/services/apiServices';
import AlertHeader from '@/components/Alert/AlertHeader';
import AlertTableHead from '@/components/Alert/AlertTableHead';
import AlertTableDtl from '@/components/Alert/AlertTableBody';

function Alerts() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobDetailList, setJobDetailList] = useState([]);
  const [filterOption, setFilterOption] = useState({});
  const [statusList, setStatusList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails({});
    fetchData();
  }, []);

  const fetchJobDetails = async (params = {}) => {
    try {
      setIsLoading(true);
      const result = await ApiService('8004', 'get', '/alert/search/alerts', null, params);
      setJobDetailList(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const result = await ApiService('8011', 'get', '/codes_hdr/29');
      setStatusList(result.codes_dtl);
      setFilterOption(prevState => ({ ...prevState, statusList: result.codes_dtl }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <Stack>
      <Stack className='container'>
        {/* <AlertHeader />
        <AlertTableHead 
          filterOption={filterOption} 
          status={statusList} 
          fetchJobDetails={fetchJobDetails}
        /> */}
        <AlertTableDtl 
          jobDetailList={jobDetailList} 
          loading={isLoading}
          error={error}
        />
      </Stack>
    </Stack>
  );
}

export default Alerts;

