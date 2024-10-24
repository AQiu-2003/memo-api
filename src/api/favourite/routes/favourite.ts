/**
 * favourite router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/favourites",
      handler: "favourite.findMany",
    },
    {
      method: "POST",
      path: "/favourites/:documentId",
      handler: "favourite.like",
    },
  ],
};
