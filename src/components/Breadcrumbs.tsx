import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/breadcrums.css';
import { FaChevronRight } from "react-icons/fa";

const Crumbs: React.FC<{ currentStep?: number }> = ({ currentStep }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Define steps for the "Publish Data" process
  const publishDataSteps = [
    'Target Customer',
    'Source Details',
    'Delivery Options',
    'Tagging',
    'Schedule',
    'Alert Profile'
  ];

  const projectSteps = [
    'Project Details',
    'Access Details',
    'Configure Lake',
    'Preconfigured Zones',
    'Lifecycle Policy'
  ];

  const onboardSteps = [
    'Onboard Data',
    'Configuration',
    'Tagging',
    'Schedule',
    'Alert Profile'
  ];

  const customerSteps = [
    'Add Customers',
    'Connection Details',
    'Alert Profile',
    'Client setup',
  ];

  return (
    <nav aria-label="crumb" className='px-2 pt-2'>
      <ol className="crumb">
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const decodedName = decodeURIComponent(name);
          const isPublishData = routeTo.startsWith('/Designer/targetsteps');
          const isProjectData = routeTo.startsWith('/Admin-Console/Environment/New');
          const isOnboardData = routeTo.startsWith('/Designer/Onboard-Data');
          const isCustomerData = routeTo.startsWith('/Admin%20Console/Manage%20Customer/Add%20Customer');
          const stepName = isPublishData && currentStep !== undefined ? `Publish Data > ${publishDataSteps[currentStep]}` : decodedName;
          const proName = isProjectData && currentStep !== undefined ? ` ${projectSteps[currentStep]}` : decodedName;
          const onboardName = isOnboardData && currentStep !== undefined ? ` ${onboardSteps[currentStep]}` : decodedName;
          const customerName = isCustomerData && currentStep !== undefined ? ` ${customerSteps[currentStep]}` : decodedName;
          console.log(routeTo)
          return (
            <li key={name} className={`crumb-item ${isLast ? 'active' : ''} h6 mt-1`}>
              {isPublishData ? (
                stepName
              ) : isProjectData ? (
                proName
              ) : isOnboardData ? (
                onboardName
              ) : isCustomerData ? (
                customerName
              ) : (
                <>
                  <Link to={routeTo}>
                    {decodedName}
                  </Link>
                  {!isLast && <FaChevronRight color="black" fontSize={10} />}
                </>
              )}
            </li>

          );
        })}
      </ol>
    </nav>
  );
};

export default Crumbs;

