import * as fs from "fs";
import * as frida from "frida";
import { defaultTo, pickBy } from "lodash";
import { User } from "../shared/types";

interface Installation {
  session: frida.Session;
  script: frida.Script;
}

const sessions: { [key: string]: Installation } = {};
export const getFridaSessionsByUser = (user: User): Installation[] => {
  return Object.values(
    pickBy(sessions, (_: Installation, key: string) => {
      return key.startsWith(`${user.name}:`);
    })
  );
};
export const removeActiveSession = (user: User, pid: number) => {
  delete sessions[`${user.name}:${pid}`];
};
export const getFridaSessions = (): Installation[] => Object.values(sessions);

// getFridaSession returns the frida session associated with the user and pid.
export const getFridaSession = (user: User, pid: number): Installation | null =>
  defaultTo(sessions[`${user.name}:${pid}`], null);

// getFridaScript reads the contents of the frida script
// and returns it as a string.
const getFridaScript = async (): Promise<string | null> => {
  const scriptPath = "./build/frida.bundle.js";
  return await new Promise(res =>
    fs.readFile(
      scriptPath,
      "utf8",
      (err: NodeJS.ErrnoException | null, data: string) => {
        if (err !== null) {
          res(null);
        }
        res(data);
      }
    )
  );
};

// loadScript creates the RPC script that is used to collect
// information about the process syscalls.
const loadScript = async (
  session: frida.Session,
  callback: frida.ScriptMessageHandler,
  onAttach: Function,
  isInterceptorEnabled: boolean
): Promise<frida.Script | null> => {
  let scriptContents;
  try {
    scriptContents = await getFridaScript();
    if (scriptContents === null) {
      return null;
    }
  } catch (e) {
    console.error("Error reading the frida script", e);
    return null;
  }

  let script;
  try {
    script = await session.createScript(scriptContents, {
      runtime: frida.ScriptRuntime.V8
    });
    script.message.connect(callback);
  } catch (e) {
    console.error("Error creating the frida script", e);
    return null;
  }

  try {
    await script.load();
    await script.exports.hook();

    if (isInterceptorEnabled) {
      await script.exports.setInterceptor(true);
    }
    onAttach();
    return script;
  } catch (e) {
    console.error("Error loading the frida script", e);
    return null;
  }
};

// install attaches to the ADB device or the local machine, loads
// the frida script, and returns both the session and script if
// successfull.
export const install = async (
  user: User,
  pid: number,
  adb: boolean,
  onMessage: frida.ScriptMessageHandler,
  onAttach: Function,
  isInterceptorEnabled: boolean
): Promise<Installation | null> => {
  let device: { attach(pid: number): Promise<frida.Session> } = frida;
  if (adb) {
    device = await frida.getUsbDevice({ timeout: 1000 });
  }
  const session = await attach(device, pid);
  if (session === null) {
    return null;
  }
  const script = await loadScript(
    session,
    onMessage,
    onAttach,
    isInterceptorEnabled
  );
  if (script === null) {
    return null;
  }

  const installation = { session: session, script: script };
  sessions[`${user.name}:${pid}`] = installation;
  return installation;
};

const attach = async (
  device: { attach(pid: number): Promise<frida.Session> },
  pid: number
): Promise<frida.Session | null> => {
  try {
    return await device.attach(pid);
  } catch (e) {
    console.error("Error attaching: ", e);
  }
  return null;
};

// uninstall disconnects a scripts session, unloads its
// and detaches the session.
export const uninstall = async (
  installation: Installation
): Promise<boolean> => {
  try {
    installation.script.message.disconnect(() => {});
  } catch (e) {
    console.error("Error disconnecting script", e);
    return false;
  }

  try {
    await installation.script.unload();
  } catch (e) {
    console.error("Error unloading script", e);
    return false;
  }

  try {
    await installation.session.detach();
  } catch (e) {
    console.error("Error detaching session", e);
    return false;
  }
  console.log("uninstalled!", installation);
  return true;
};
