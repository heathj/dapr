import { Request, Response } from "express";
import {
  nextInterceptionGenerator,
  deleteNextInterception
} from "../store/interceptor";
import { Syscall } from "../../shared/types";
import { log } from "../../shared/log";
const genNextInterception = nextInterceptionGenerator();
export const forwardInterception = (req: Request, resp: Response) => {
  log("API forwarding interception");
  const syscall: Syscall = req.body.syscall;
  const interception = genNextInterception.next().value;
  if (!interception) {
    resp.status(500).end();
    return;
  }

  deleteNextInterception();
  interception.res(syscall);
  resp.status(200).end();
};
