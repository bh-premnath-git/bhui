import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import Home from '@/pages/Home';

export const HomeRoutes = (
  <Route path={ROUTES.HOME} element={<Home />} />
);

export default HomeRoutes;
