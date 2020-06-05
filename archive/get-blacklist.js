/*
   # API Definition
   GET /blacklist/:id

   # Description
   Returns a blacklisted EventMatcher of a given ID/index.

   # Response Body
   EventMatcher
 */
export const getBlacklist = (req, resp) => {
    const id = parseInt(req.params.id, 10);
    this.fridaSession
        .blacklistGet(id)
        .then(res => resp.send(res))
        .catch(e => resp.status(500).send(e.toString()));
};
//# sourceMappingURL=get-blacklist.js.map