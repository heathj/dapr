import { first, filter } from "lodash";
import { log } from "../../shared/log";
export const hook = (
  libcModule: Module,
  exportName: string,
  hookBehavior: ScriptInvocationListenerCallbacks
) => {
  const pointer = first(
    filter(libcModule.enumerateExports(), p => p.name === exportName)
  );
  log("hooking", exportName, libcModule.name, pointer);
  if (!pointer) {
    console.error(`No export named "${exportName}"`);
    return;
  }
  Interceptor.attach(pointer.address, hookBehavior);
};
