import React, { useEffect, useState } from 'react';
import { Button, Box, CircularProgress, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { listEnvironments, Environment } from '../../../redux/EnvironmentSlice';
import ApiService from '../../../Services/ApiServices';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

import ProTableData from '../../GithubProject/ProTableData';
import EnvironmentHeader from './EnvironmentHeader';
import { searchProject } from '../../../redux/ProjectSlice';

const NoEnvironmentsComponent = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
    <img src="/assets/userlanding/Layer34.svg" alt="No environments" style={{ width: '5%' }} />
    <Typography variant="h6" sx={{ mt: 2 }}>No Environments Available</Typography>
    <Button
      sx={{
        mt: 2,
        px: 3,
        py: 1,
        backgroundColor: 'black',
        color: 'white',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid black',
        },
      }}
      component={Link}
      to="/Admin-Console/Environment/New"
      variant="contained"
      size="small"
    >
      Create New Environment
    </Button>
  </Box>
);

function Environments() {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch();
  const { environmentList, loading, error } = useSelector((state: RootState) => state.environmentApi);


  useEffect(() => {
    dispatch(listEnvironments());
  }, [dispatch]);


  const handleEdit = (index: number) => {
    // Implement edit functionality for environments
  };

  const handleStatusChange = (index: number) => {
    // Implement status change functionality for environments
  };

  return (
    <Box sx={{ mt: 8, px: 2 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Error: {error}</Typography>
      ) : environmentList.length > 0 ? (
        <>
          <EnvironmentHeader search={searchProject} />
          <ProTableData
            data={environmentList}
            excludeKeys={[
              'created_at', 'updated_at', 'created_by', 'updated_by', 'bh_env_id', 'bh_env_name',
              'bh_env_provider', 'cloud_provider_cd', 'pvt_key', 'tags', 'access_key', 'status_cd',
              'airflow_bucket_name', 'project_id', 'bh_env_provider_name', 'cloud_provider_name', 'cloud_region_cd', 'location', 'airflow_env_name',
              'airflow_url', 'secret_access_key'
            ]}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
          />
        </>
      ) : (
        <NoEnvironmentsComponent />
      )}
    </Box>
  );
}

export default Environments;
