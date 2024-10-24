/**
 * space router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/spaces/:documentId",
      handler: "space.findOne",
    },
    {
      method: "GET",
      path: "/spaces",
      handler: "space.findMany",
    },
    {
      method: "POST",
      path: "/spaces",
      handler: "space.create",
    },
    {
      method: "PUT",
      path: "/spaces/:documentId",
      handler: "space.update",
    },
    {
      method: "DELETE",
      path: "/spaces/:documentId",
      handler: "space.delete",
    },
    {
      method: "DELETE",
      path: "/spaces/:documentId/members/:memberDocumentId",
      handler: "space.deleteMember",
    },
  ],
};
