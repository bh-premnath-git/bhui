import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { LoadingFallback } from './LoadingFallback';

const ChatHistory = lazy(() => import('@/pages/chat/ChatHistory'));
const AllChats = lazy(() => import('@/pages/chat/AllChats'));
const ChatCategoryPage = lazy(() => import('@/pages/chat/ChatCategoryPage'));

export const ChatRoutes = (
  <>
    <Route 
      path={ROUTES.CHAT.HISTORY}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <ChatHistory />
        </Suspense>
      }
    />
    <Route 
      path={ROUTES.CHAT.ALL}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <AllChats />
        </Suspense>
      }
    />
    <Route 
      path={ROUTES.CHAT.MY_PIPELINE}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <ChatCategoryPage />
        </Suspense>
      }
    />
    <Route 
      path={ROUTES.CHAT.DATA_ONBOARD}
      element={
        <Suspense fallback={<LoadingFallback />}>
          <ChatCategoryPage />
        </Suspense>
      }
    />
  </>
);

export default ChatRoutes;