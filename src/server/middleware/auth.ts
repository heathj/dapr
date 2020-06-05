import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { memoize } from "lodash";
import * as fs from "fs";
import { pubKey } from "../../shared/keys";
import { daprTokenName } from "../../shared/token";
import { User } from "../../shared/types";

const getPubKey = async (): Promise<Buffer | null> =>
  await new Promise(res =>
    fs.readFile(pubKey, (err: NodeJS.ErrnoException | null, data: Buffer) => {
      if (err !== null) {
        res(null);
        return;
      }
      res(data);
    })
  );
const memoGetPubKey = memoize(getPubKey);

declare module "express" {
  interface Request {
    user?: User;
  }
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*const dapr = req.get(daprTokenName);
  if (!dapr) {
    res.status(403).end();
    return;
  }

  const cert: jwt.Secret | null = await memoGetPubKey();
  if (cert === null) {
    res.status(500).end();
    return;
  }
  const user = jwt.verify(dapr, cert);
  if (!user) {
    res.status(403).end();
    return;
  }*/
  req.user = Object.assign({}, { name: "root", expired: -1 });
  next();
};
