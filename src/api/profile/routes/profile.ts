/**
 * profile router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/profiles/me",
      handler: "profile.me",
    },
    {
      method: "POST",
      path: "/profiles",
      handler: "profile.create",
    },
    {
      method: "PUT",
      path: "/profiles",
      handler: "profile.update",
    },
  ],
};
