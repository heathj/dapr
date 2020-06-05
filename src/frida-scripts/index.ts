import { first, map } from "lodash";
import { getLibcModules, installHooks } from "./init-libc";
import { sendIoctl, IoctlResponse } from "./send-ioctl";
import { Syscall, SyscallType } from "../shared/types";
import { setChannel, SyscallChannel } from "./helpers/channel";
import { setInterceptor, isInterceptorEnabled } from "./helpers/interceptor";
import { log } from "../shared/log";
rpc.exports = {
  hook: (): void => {
    const libcModules = getLibcModules();
    if (libcModules.length === 0) {
      log("No libc in this module");
      return;
    }

    const module = first(libcModules);
    if (!module) {
      log("No libc in this module");
      return;
    }

    installHooks(module);
  },
  setInterceptor: (s: boolean) => {
    setInterceptor(s);
  },
  sendResponse: (chanResp: SyscallChannel): void => {
    setChannel(chanResp.channel, chanResp.syscall);
  },
  send: (syscalls: Syscall[]): (IoctlResponse | null)[] =>
    map(syscalls, (syscall): IoctlResponse | null => {
      if (syscall.syscall !== SyscallType.IOCTL) {
        console.debug("Must be of type syscall.IOCTL");
        return null;
      }

      const libcModuleNames = getLibcModules();
      if (libcModuleNames.length === 0) {
        console.debug("No libc in this module");
        return null;
      }

      const module = first(libcModuleNames);
      if (!module) {
        console.log("No libc in this module");
        return null;
      }
      return sendIoctl(module.name, syscall.fd, syscall.request, syscall.data);
    })
};
