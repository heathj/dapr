import { Request, Response } from "express";
import { install, getFridaSessionsByUser } from "../frida-session";
import { events } from "../store/db";
import { ScriptMessageHandler, Message, MessageType, SendMessage } from "frida";
import { sendToInterceptor } from "../store/interceptor";
import { memoResolveFileDescriptor } from "../../shared/procs";
import { getFridaSession } from "../frida-session";
import { defaultTo } from "lodash";
import { Syscall, User } from "../../shared/types";
import { log } from "../../shared/log";
/*
   # API Definition
   POST /session/attach

   # Description
   Asynchronously attaches Frida to a `target` process, which can be either a process ID or process name. On success,
   Dapr begins hooking system calls and streams events to websocket clients.

   Note: The result of this operation can be checked by polling /session/status.

   target: Integer | String      - process ID or process name
 */
export const sessionInstall = async (req: Request, res: Response) => {
  log("API session install", req.body);
  const { pid, adb, isInterceptorEnabled } = req.body;
  const { user } = req;
  if (!user) {
    res.status(403).send("No user");
    return;
  }

  const session = getFridaSession(user, pid);
  if (session) {
    res.status(302).send("Already attached to this process");
    return;
  }

  const newSession = await install(
    user,
    pid,
    adb,
    onFridaMessage(user)(pid, adb),
    onFridaAttach,
    Boolean(isInterceptorEnabled)
  );

  if (newSession === null) {
    res.status(500).end();
    return;
  }
  res.status(200).end();
};

const onFridaAttach = () => {};

const interceptorHandler = async (
  user: User,
  syscall: Syscall,
  channel: number,
  pid: number
) => {
  const install = getFridaSession(user, pid);
  if (!install) {
    return;
  }
  try {
    const syscallResponse = await sendToInterceptor(syscall);
    install.script.exports.sendResponse({ channel, syscall: syscallResponse });
  } catch (e) {
    console.error("Someone rejected the interceptor promise", e);
  }
};

const recordSyscall = (syscall: Syscall, pid: number, adb: boolean) => {
  const event = Object.assign({}, syscall, {
    pid: pid,
    driverName: defaultTo(
      memoResolveFileDescriptor(pid, syscall.fd, adb),
      `<unknown:${syscall.fd}>`
    )
  });
  events.insert(event);
};

// onFridaMessage is the default handler for logging events from
// frida script hooks. Currently, it logs them in a database.
const onFridaMessage = (user: User) => (
  pid: number,
  adb: boolean
): ScriptMessageHandler => (message: Message, data: Buffer | null): void => {
  switch (message.type) {
    case MessageType.Send:
      let syscall: Syscall = Object.assign(
        {},
        { type: message.type, ...message.payload.syscall }
      );
      if (data !== null) {
        syscall = Object.assign({}, syscall, { data: data.toJSON().data });
      } else {
        syscall = Object.assign({}, syscall, { data: [] });
      }
      const channel: number = message.payload.channel;
      // handler for interceptor code
      if (channel) {
        interceptorHandler(user, syscall, channel, pid);
      }

      // record the original syscall
      recordSyscall(syscall, pid, adb);
      break;
    case MessageType.Error:
      console.error("Error from frida script", message);
      break;
  }
};
