import { mockApiCall, saveDescription } from './apiService';

export const saveDescriptionServ = async (id: number, description: string) => {
  return saveDescription(id, description);
};

export const addLink = async (link: { url: string; title: string }) => {
  return mockApiCall({ link });
};

export const addOwner = async (owner: { name: string; role: string; email: string }) => {
  return mockApiCall({ owner });
};

export const addTag = async (tag: string) => {
  return mockApiCall({ tag });
};
