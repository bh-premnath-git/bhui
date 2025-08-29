// Type declarations for route modules
declare module './LoadingFallback' {
  const LoadingFallback: React.FC;
  export default LoadingFallback;
  export { LoadingFallback };
}

declare module './homeRoutes' {
  import { ReactElement } from 'react';
  const HomeRoutes: ReactElement;
  export default HomeRoutes;
  export { HomeRoutes };
}

declare module './dataCatalogRoutes' {
  import { ReactElement } from 'react';
  const DataCatalogRoutes: ReactElement;
  export default DataCatalogRoutes;
  export { DataCatalogRoutes };
}

declare module './designerRoutes' {
  import { ReactElement } from 'react';
  const DesignerRoutes: ReactElement;
  export default DesignerRoutes;
  export { DesignerRoutes };
}

declare module './dataOpsRoutes' {
  import { ReactElement } from 'react';
  const DataOpsRoutes: ReactElement;
  export default DataOpsRoutes;
  export { DataOpsRoutes };
}

declare module './adminRoutes' {
  import { ReactElement } from 'react';
  const AdminRoutes: ReactElement;
  export default AdminRoutes;
  export { AdminRoutes };
}
