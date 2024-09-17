import React, { useState, useEffect } from 'react';
import axios from 'axios';

import ChartComponent from './Chartdata';
import TotalBarChart from '../../charts/TotalBarChart';
import BarChart from '../../charts/BarChart';
import BumpChart from '../../charts/BumpChart';
import StackedLineChart from '../../charts/StackedLineChart';
import CostTrendChart from '../../charts/CostTrendChart';

const DataOpsHub = () => {

  useEffect(() => {

  }, []);



  return (
    // <ChartComponent />
    <div>
      <div className='row'>

        <div className="col-4 ">
          <div className='m-2 card'>
            <TotalBarChart />
          </div>
        </div>
        <div className="col-4 ">
          <div className="card m-2">
            <BarChart />
          </div>
        </div>
        <div className="col-4 ">
          <div className='m-2 card'>
            <BumpChart />
          </div>
        </div>
      </div>
      <div className='row'>

        <div className="col-4 ">
          <div className='m-2 card'>
            <StackedLineChart />
          </div>
        </div>
        <div className="col-4 ">
          <div className="card m-2">
            <CostTrendChart />
          </div>
        </div>
        <div className="col-4 ">
          <div className='m-2 card'>
            <TotalBarChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataOpsHub;
