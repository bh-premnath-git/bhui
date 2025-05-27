import { useState, useCallback } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { debounce } from 'lodash';
import type { User } from '@/types/admin/user';
import { KEYCLOAK_API_REMOTE_URL } from '@/config/platformenv';

export const useUserSearch = () => {
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  // Using 'any' temporarily to handle the API response structure
  const { getAll: searchUsers } = useResource<any>(
    'users',
    KEYCLOAK_API_REMOTE_URL,
    false
  );

  const searchUser = useCallback(async (searchTerm: string) => {
    if (!searchTerm) {
      setSearchedUser(null);
      setUserNotFound(false);
      return;
    }

    setSearchLoading(true);
    setUserNotFound(false);

    try {
      const result = await searchUsers({
        url: '/users/',
        params: { search: searchTerm, pageSize: 1 }
      }).refetch();
      
      // Check if we got a valid response with users
      if (result.data && 
          typeof result.data === 'object' && 
          'users' in result.data && 
          Array.isArray(result.data.users) && 
          result.data.users.length > 0) {
        setSearchedUser(result.data.users[0]);
      } else {
        setSearchedUser(null);
        setUserNotFound(true);
      }
    } catch (error) {
      console.error('Error searching for user:', error);
      setSearchedUser(null);
      setUserNotFound(true);
    } finally {
      setSearchLoading(false);
    }
  }, [searchUsers]);

  // Debounced search function
  const debounceSearchUser = useCallback(
    debounce((term: string) => {
      searchUser(term);
    }, 500),
    [searchUser]
  );

  return {
    searchedUser,
    searchLoading,
    userNotFound,
    debounceSearchUser,
    searchUser
  };
};
