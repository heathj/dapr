let interceptorEnabled = false;
export const isInterceptorEnabled = (): boolean => {
  return interceptorEnabled;
};
export const setInterceptor = (s: boolean) => {
  interceptorEnabled = s;
};
