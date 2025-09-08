import { useAppSelector } from '@/hooks/useRedux';

export const WelcomeGreeting = () => {
  const { displayName, greeting } = useAppSelector(state => state.user);
  const firstName = displayName.split(' ')[0] || displayName;

  return (
    <div className="flex flex-col items-center justify-center px-2 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-xl font-medium mb-4">
          {greeting}, {firstName}
        </h1>
      </div>
    </div>
  );
};