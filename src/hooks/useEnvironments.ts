import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getEnvironmentList } from '@/redux/FlowSlice';

export const useEnvironments = () => {
  const dispatch = useAppDispatch();
  const { environments: data } = useAppSelector((state) => state.flowApi);

  const environmentOptions = [
    { value: "select", label: "Select Environment" },
    ...data.map(env => ({
      value: env.id.toString(),
      label: env.envName
    }))
  ];

  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        await dispatch(getEnvironmentList());
      } catch (error) {
        console.error('Error fetching environments:', error);
      }
    };
    fetchEnvironments();
  }, [dispatch]);

  return { environmentOptions };
};