import { getFridaSessions, uninstall } from "./frida-session";
import * as express from "express";
import { Server as WSServer } from "ws";
import * as bodyParser from "body-parser";
import { map } from "lodash";
import { Server as HTTPServer, createServer } from "http";
import { corsSettings } from "./middleware/cors";
import { dnsRebinding } from "./middleware/dns-rebinding";
//import { isStatusPending } from "./middleware/status-pending";
//import { isStatusAttached } from "./middleware/status-attached";
import { isAuthenticated } from "./middleware/auth";
import { getProcs } from "./api/get-procs";
//import { sessionStatus } from "./api/session-status";
import { sessionInstall } from "./api/session-install";
import { sessionUninstall } from "./api/session-uninstall";

import { getEvents } from "./api/get-events";
import { getEvent } from "./api/get-event";
import { addEvent } from "./api/add-event";
import { getEventsRangeStart } from "./api/get-events-range-start";
import { getEventsRangeStartEnd } from "./api/get-events-range-start-end";
import { getTypes } from "./api/get-types";
import { getType } from "./api/get-type";
import { addType } from "./api/add-type";
import { updateType } from "./api/update-type";
import { deleteType } from "./api/delete-type";
import { authenticate } from "./api/auth";
import { setInterceptor } from "./api/toggle-interceptor";
import { getNextInterception } from "./api/get-next-interception";
import { forwardInterception } from "./api/forward-interception";

export const start = (port: number): HTTPServer => {
  const app = express();
  app.set("etag", false);
  app.use(bodyParser.json());
  //app.use(corsSettings);
  //app.use(dnsRebinding);
  //app.post("/auth", authenticate);
  app.use(isAuthenticated);
  app.get("/procs", getProcs);
  //app.get("/session/status", sessionStatus);
  //app.use("/*", isStatusPending);
  app.post("/session/install", sessionInstall);
  //app.use("/*", isStatusAttached);
  app.post("/session/uninstall", sessionUninstall);
  //import { lastEvent } from "./api/last-event";
  //app.get("/last-event", lastEvent);
  //  .ws("/event-stream", wsHandler);
  app.get("/events", getEvents);
  app.get("/events/:index", getEvent);
  app.get("/events/range/:begin", getEventsRangeStart);
  app.get("/events/range/:begin/:end", getEventsRangeStartEnd);
  app.post("/events", addEvent);
  // store all events, filter in the UI
  //import { getBlacklists } from "./api/get-blacklists";
  //import { getBlacklist } from "./api/get-blacklist";
  //import { deleteEventMatcherFromBlacklist } from "./api/delete-eventmatcher-from-blacklist";
  //import { modifyEventMatcherToBlacklist } from "./api/modify-eventmatcher-on-blacklist";
  //import { addEventMatcherToBlacklist } from "./api/add-eventmatcher-to-blacklist";
  //app.get("/blacklist", getBlacklists);
  //app.get("/blacklist/:id", getBlacklist);
  //app.post("/blacklist", addEventMatcherToBlacklist);
  //app.post("/blacklist/:id", modifyEventMatcherToBlacklist);
  //app.post("/blacklist/:id/delete", deleteEventMatcherFromBlacklist);
  app.get("/types", getTypes);
  app.get("/types/:id", getType);
  app.post("/types", addType);
  app.put("/types/:id", updateType);
  app.delete("/types/:id/delete", deleteType);

  app.put("/interceptor/set", setInterceptor);
  app.put("/interceptor/forward", forwardInterception);
  app.get("/interceptor/next", getNextInterception);
  // not really sure what these are used for
  //import { getTypeAssessments } from "./api/get-type-assessments";
  //import { getTypeAssessment } from "./api/get-type-assessment";
  //import { addTypedefToTypeAssignment } from "./api/add-typedef-to-type-assignment";
  //import { updateTypeAssignment } from "./api/update-type-assignment";
  //import { deleteTypeAssignment } from "./api/delete-type-assignment";
  //app.get("/typeAssignments", getTypeAssessments);
  //app.get("/typeAssignments/:id", getTypeAssessment);
  //app.post("/typeAssignments", addTypedefToTypeAssignment);
  //app.put("/typeAssignments/:id", updateTypeAssignment);
  //app.post("/typeAssignments/:id/delete", deleteTypeAssignment);

  const httpServer = createServer();

  httpServer.on("request", app);

  return httpServer.listen(port, () => console.log("started!!"));
};

export const quit = async (server: HTTPServer): Promise<void> => {
  console.log("shutting down open sessions");
  try {
    await Promise.all(map(getFridaSessions(), uninstall));
  } catch (e) {
    console.error(e);
  }
  console.log("all frida sessions uninstalled");
  server.close();
  console.log("server closed");
  process.exit(0);
};
