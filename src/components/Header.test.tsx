import { render } from '@testing-library/react';
import { renderingHeadContent } from './Header';
import { describe, it, expect, vi } from 'vitest';

// Mock the CustomToolbarComponent
vi.mock('./CustomToolbar', () => ({
  CustomToolbarComponent: () => <div>Custom Toolbar</div>
}));

// Mock store state
const mockState = {
  catalogApi: {
    layoutList: [{ data_src_lyt_name: 'TestLayout' }]
  },
  projectApi: {
    editProjectData: { bh_project_name: 'TestProject' }
  },
  environmentApi: {
    editEnvironmentData: { bh_env_name: 'TestEnv' }
  },
  flowApi: {
    selectedFlowFromList: {}
  }
};

describe('renderingHeadContent', () => {
  // Mock useSelector
  vi.mock('react-redux', () => ({
    useSelector: (selector: any) => selector(mockState)
  }));

  const testCases = [
    {
      path: '/dashboard',
      expected: 'DataOPS > Dashboard'
    },
    {
      path: '/admin-console',
      expected: 'Admin Console'
    },
    {
      path: '/all-projects',
      expected: 'Admin Console > Projects'
    },
    {
      path: '/all-projects/new',
      expected: 'Admin Console > Projects > New'
    },
    {
      path: '/projects/123',
      expected: 'Admin Console > Projects > TestProject'
    },
    {
      path: '/all-environment',
      expected: 'Admin Console > Environments'
    },
    {
      path: '/all-environment/new',
      expected: 'Admin Console > Environments > New'
    },
    {
      path: '/environments/123',
      expected: 'Admin Console > Environment > TestEnv'
    },
    {
      path: '/designer/manage-flow',
      expected: 'Designer > Manage Flow'
    },
    {
      path: '/DataCatalog',
      expected: 'Data Catalog'
    },
    {
      path: '/DataCatalog/schema',
      expected: 'Catalog > TestLayout > Schema'
    },
    {
      path: '/AllUsers',
      expected: 'Admin Console > Manage Data Platform User'
    },
    {
      path: '/AddUser',
      expected: 'Admin Console > Manage Data Platform User > Add User'
    },
    {
      path: '/AllCustomers',
      expected: 'Admin Console > Manage Customer'
    },
    {
      path: '/AddCustomers',
      expected: 'Admin Console > Manage Customer > Add Customer'
    },
    {
      path: '/AllBuildDataPipeLine',
      expected: 'Designer > Build Data Pipeline'
    },
    {
      path: '/dataops-hub/ops-hub',
      expected: 'Dataops Hub > Ops Hub'
    },
    {
      path: '/alerts',
      expected: 'Dataops Hub > Alert Hub'
    },
    {
      path: '/bundle',
      expected: 'Manage Releases'
    },
    {
      path: '/CreateBundle',
      expected: 'Manage Releases > Create Bundle'
    },
    {
      path: '/ReleaseBundle',
      expected: 'Manage Releases > Release Bundle'
    },
    {
      path: '/unknown-path',
      expected: ''
    }
  ];

  testCases.forEach(({ path, expected }) => {
    it(`renders "${path}" correctly`, () => {
      const element = render(<>{renderingHeadContent(path)}</>);
      
      if (expected === '') {
        expect(element.container.textContent).toBe('');
      } else {
        // Normalize spaces and trim to handle potential whitespace differences
        expect(element.container.textContent?.replace(/\s+/g, ' ').trim()).toBe(expected);
      }
    });
  });

  // Special cases for components
  it('renders flow playground with CustomToolbarComponent', () => {
    const element = render(<>{renderingHeadContent('/designer/flow-playground')}</>);
    expect(element.container.textContent).toBe('Custom Toolbar');
  });

  it('renders build playground with CustomToolbarComponent', () => {
    const element = render(<>{renderingHeadContent('/BuildPlayGround')}</>);
    expect(element.container.textContent).toBe('Custom Toolbar');
  });
});
