import { Request, Response } from "express";
import { nextInterceptionGenerator } from "../store/interceptor";
const genNextInterception = nextInterceptionGenerator();
export const getNextInterception = (req: Request, resp: Response) => {
  // should do something with auth here
  const interception = genNextInterception.next().value;
  if (!interception) {
    resp.send({});
  } else {
    resp.send(interception.syscall);
  }
};
