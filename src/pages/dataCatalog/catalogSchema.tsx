import * as React from 'react';
import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { debounce } from 'lodash';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CatalogsBody from '@/pages/dataCatalog/catalogsBody';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function CatalogSchema({ selectedSource }) {
  const [value, setValue] = React.useState(0);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchLayout = debounce((val: string) => {
    // e.g., props.fetchDatasourceRegion(val);
  }, 1000);

  const searchDataSource = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchValue(value);
    debouncedSearchLayout(value);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Tabs Header */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={{ px: 2, py: 1 }}
      >
        <Stack>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            centered
            TabIndicatorProps={{
              style: {
                backgroundColor: '#000',
                height: 5,
                width: '30px',
                marginLeft: 'calc((100% / 1.5) / 2)',
                borderRadius: '10px 10px 0px 0px',
              },
            }}
            TabScrollButtonProps={{
              style: {
                display: 'none',
              },
            }}
            sx={{
              '& .MuiTabs-flexContainer': {
                justifyContent: 'center',
              },
              '& .MuiTab-root': {
                display: 'flex',
                justifyContent: 'center',
              },
            }}
          >
            <Tab
              sx={{
                // Place textTransform here, since it applies to the tab label
                textTransform: 'none',
                color: 'black',
                '&.Mui-selected': {
                  color: 'black',
                  fontWeight: 'bold',
                },
              }}
              label="Schema"
              {...a11yProps(0)}
            />
          </Tabs>
        </Stack>
      </Stack>

      {/* Tab Content */}
      <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
        <CustomTabPanel value={value} index={0}>
          <CatalogsBody selectedSource={selectedSource} />
        </CustomTabPanel>
      </Box>
    </Box>
  );
}

export default CatalogSchema;
