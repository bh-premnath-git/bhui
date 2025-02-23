export const mockApiCall = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
};
