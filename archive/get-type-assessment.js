/*
   # API Definition
   GET /typesAssignments/:id

   # Description
   Get a type assignments for a given id/index.

   # Path Parameters
   id: Integer

   # Response Body
   TypeAssignment
 */
export const getTypeAssessment = (req, resp) => {
    const id = parseInt(req.params.id, 10);
    this.fridaSession
        .typeAssignGet(id)
        .then(res => resp.send(res))
        .catch(e => resp.status(500).send(e.toString()));
};
//# sourceMappingURL=get-type-assessment.js.map