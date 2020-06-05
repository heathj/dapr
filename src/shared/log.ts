declare const DEV: boolean;
export const log = (s: string, ...objs: any[]) => {
  if (DEV) {
    console.log("[LOG]", s, ...objs);
  }
};
