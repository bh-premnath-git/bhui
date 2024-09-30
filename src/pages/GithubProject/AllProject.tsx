import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageProjectHeader from './ManageProjectHeader';
import ProTableData from './ProTableData';
import { getGitProject, setEditProjectData, updateProject } from '../../Redux/ProjectSlice';
import { RootState } from '../../Redux/store';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

// NoProjectsComponent is defined within the same file
const NoProjectsComponent = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    sx={{ mt: 4 }}
  >
    <img
      src="/assets/userlanding/Layer34.svg"
      alt="No projects"
      style={{ width: '5%' }}
    />
    <Typography variant="h6" sx={{ mt: 2 }}>
      No Projects Available
    </Typography>
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
      to="/All Projects/New"
      variant="contained"
      size="small"
    >
      Create New Project
    </Button>
  </Box>
);

export default function AllProject() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { param, gitProjectList, loading, error } = useAppSelector(
    (state: RootState) => state.projectApi
  );

  useEffect(() => {
    dispatch(getGitProject(param));
  }, [dispatch, param]);

  const handleEdit = async (index: number) => {
    await dispatch(setEditProjectData(gitProjectList[index]));
    navigate('/All Projects/New');
  };

  const handleStatusChange = (index: number) => {
    const project = gitProjectList[index];
    const newStatus = project.status === 'active' ? 'inactive' : 'active';
    const updatedProject = {
      ...project,
      status: newStatus,
    };
    dispatch(updateProject(updatedProject));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
        Error: {error}
      </Typography>
    );
  }

  return (
    <div className="m-auto px-4">
      {gitProjectList.length > 0 ? (
        <>
          <ManageProjectHeader />
          <br />
          <ProTableData
            data={gitProjectList}
            excludeKeys={[
              'tags',
              'created_by',
              'updated_by',
              'created_at',
              'updated_at',
              'bh_project_id',
              'bh_github_url',
              'bh_project_name',
              'bh_github_provider',
              'bh_github_username',
              'bh_github_token_url',
              'bh_github_email',
              'bh_default_branch',
              'ytd_cost',
              'current_month_cost',
              'total_storage',
            ]}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
          />
        </>
      ) : (
        <NoProjectsComponent />
      )}
    </div>
  );
}
