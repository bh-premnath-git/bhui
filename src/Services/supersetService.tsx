// // import axios from 'axios';

// // const SUPPERSET_URL ='http://localhost:8088';

// // export const getCsrfToken = async () => {
// //   try {
// //     const response = await axios.get(`${SUPPERSET_URL}/api/v1/security/csrf_token/`);
// //     return response.data.result;
// //   } catch (error) {
// //     console.error('Error fetching CSRF token:', error);
// //     throw error;
// //   }
// // };

// // export const getAccessToken = async (username, password) => {
// //   // const csrfToken = await getCsrfToken();
// //   try {
// //     const response = await axios.post(
// //       `${SUPPERSET_URL}/api/v1/security/login`,
// //       {
// //         username,
// //         password,
// //         provider: 'db'
// //       },
// //       {
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'X-CSRFToken': 'csrfToken'
// //         }
// //       }
// //     );
// //     return response.data.access_token;
// //   } catch (error) {
// //     console.error('Error fetching access token:', error);
// //     throw error;
// //   }
// // };

// // export const fetchDataFromSuperset = async (accessToken, chartId) => {
// //   try {
// //     const response = await axios.get(`${SUPPERSET_URL}/api/v1/chart/${chartId}/data`, {
// //       headers: {
// //         Authorization: `Bearer ${accessToken}`,
// //       },
// //     });
// //     return response.data;
// //   } catch (error) {
// //     console.error('Error fetching data from Superset:', error);
// //     throw error;
// //   }
// // };



// import axios from 'axios';

// const API_URL = 'http://localhost:8000';

// export const login = async (username, password) => {
//   try {
//     const response = await axios.post(`${API_URL}/login`, {
//       username,
//       password,
//     });
//     return response.data.access_token;
//   } catch (error) {
//     console.error('Error logging in:', error);
//     throw error;
//   }
// };

// export const fetchChartData = async (accessToken, chartId,category='',startDate='',endDate='') => {
//   try {
//     const response = await axios.post(
//       `${API_URL}/fetch_chart_data`,
//       { chart_id: chartId,access_token:accessToken,
//         category:category,
//         start_date:startDate,
//         end_date:endDate
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching data from Superset:', error);
//     throw error;
//   }
// };


// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000';  // FastAPI base URL

// export const getAccessToken = async () => {
//   const response = await axios.post(`${API_BASE_URL}/get_access_token`, {
//     username: 'admin',
//     password: 'admin'
//   });
//   return response.data.access_token;
// };

// export const getDashboard = async (dashboardId) => {
//   const accessToken = await getAccessToken();
//   const response = await axios.post(
//     `${API_BASE_URL}/get_dashboard`,
//     { dashboard_id: dashboardId },
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`
//       }
//     }
//   );
//   return response.data;
// };



// export const getChart = async (chartId) => {
//   const accessToken = await getAccessToken();
//   const response = await axios.post(
//     `${API_BASE_URL}/get_chart`,
//     { chart_id: chartId },
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`
//       }
//     }
//   );
//   return response.data;
// };


import axios from 'axios';

const login = async () => {
  const response = await axios.post('http://localhost:8088/api/v1/security/login', {
    username: 'admin',
    password: 'admin',
    provider: 'db',
    refresh: true
  });
  return response.data.access_token;
};

const fetchChartData = async (chartId, token) => {
  const response = await axios.get(`http://localhost:8088/api/v1/chart/${chartId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data.result;
};
