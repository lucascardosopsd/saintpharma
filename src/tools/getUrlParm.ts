export const getUrlParam = (url: string, param: string): string | null => {
  const urlObj = new URL(url);

  const value = urlObj.searchParams.get(param);

  return value;
};
