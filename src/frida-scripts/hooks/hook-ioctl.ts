import { hook } from "./hook";
import { Mode, SyscallType, Syscall } from "../../shared/types";
import { getSyscallByChannel, createChannel } from "../helpers/channel";
import { isInterceptorEnabled } from "../helpers/interceptor";
import { first, filter } from "lodash";

const myIoctl = (oldIoctl: NativeFunction) => {
  return (
    fd: number,
    request: number,
    data: NativePointer
  ): NativeReturnValue => {
    const size = (request >> 16) & ((1 << 0xe) - 1);
    let dataCopy = new ArrayBuffer(0);
    if (size > 0) {
      const dataBuffer = data.readByteArray(size);
      if (!dataBuffer) {
        console.error("Error reading byte array");
      } else {
        dataCopy = dataBuffer;
        console.log("data before", Array.from(new Uint8Array(dataCopy)));
      }
    }

    let intercepted: Syscall | null = null;
    if (isInterceptorEnabled()) {
      const chan = createChannel();
      send(
        {
          channel: chan,
          syscall: {
            syscall: SyscallType.IOCTL,
            fd,
            request
          }
        },
        dataCopy
      );

      while (true) {
        Thread.sleep(0.25);
        intercepted = getSyscallByChannel(chan);
        if (intercepted) {
          break;
        }
      }
      data.writeByteArray(intercepted.data);
      const newBuff = data.readByteArray(size);
      if (newBuff) {
        console.log("data after", Array.from(new Uint8Array(newBuff)));
      }
    }

    const resp = oldIoctl(fd, request, data);
    return resp;
  };
};

export const hookIoctl = (libcModule: Module) => {
  const ioctlPtr = first(
    filter(libcModule.enumerateExports(), p => p.name === "ioctl")
  );
  if (!ioctlPtr) {
    console.error("Couldn't find ioctl");
    return;
  }

  const oldIoctl = new NativeFunction(ioctlPtr.address, "int", [
    "int",
    "ulong",
    "pointer"
  ]);
  Interceptor.replace(
    ioctlPtr.address,
    new NativeCallback(myIoctl(oldIoctl), "int", ["int", "ulong", "pointer"])
  );
};
