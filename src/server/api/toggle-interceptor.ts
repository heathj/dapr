import { Request, Response } from "express";
import { log } from "../../shared/log";
import { getFridaSessionsByUser } from "../frida-session";
export const setInterceptor = async (req: Request, res: Response) => {
  log("API Toggling interceptor");
  const { user } = req;
  if (!user) {
    res.status(403).send("No user");
    return;
  }
  const enabled: boolean = req.body.enabled;
  const sessions = getFridaSessionsByUser(user);
  sessions.map(s => {
    try {
      s.script.exports.setInterceptor(enabled);
    } catch (e) {
      console.error(e);
    }
  });
  res.status(200).end();
};
