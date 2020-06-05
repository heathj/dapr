import { Syscall } from "../../shared/types";
interface InterceptorAsyncCallback {
  syscall: Syscall;
  res: (value?: any) => void;
  rej: (value?: any) => void;
}
const interceptions: InterceptorAsyncCallback[] = [];

export function* nextInterceptionGenerator() {
  for (;;) {
    if (interceptions.length === 0) {
      yield null;
      continue;
    }
    // This is a FIFO queue, so always process the first interception
    // in this generator. When we forward this interception, the
    // element will be removed and we'll process the next one.
    yield interceptions[0];
  }
}

// just remove the first element
export const deleteNextInterception = () => interceptions.splice(0, 1);

export const sendToInterceptor = (syscall: Syscall): Promise<Syscall> => {
  return new Promise((res, rej) => {
    interceptions.push({ syscall, res, rej });
  });
};
