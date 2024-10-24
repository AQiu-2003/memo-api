/**
 * story router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/stories",
      handler: "story.findMany",
    },
    {
      method: "GET",
      path: "/stories/:documentId",
      handler: "story.findOne",
    },
    {
      method: "POST",
      path: "/stories",
      handler: "story.create",
    },
    {
      method: "PUT",
      path: "/stories/:documentId",
      handler: "story.update",
    },
    {
      method: "DELETE",
      path: "/stories/:documentId",
      handler: "story.delete",
    },
  ],
};
