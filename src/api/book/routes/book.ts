/**
 * book router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/books/:documentId",
      handler: "book.findOne",
    },
    {
      method: "GET",
      path: "/books",
      handler: "book.findMany",
    },
    {
      method: "POST",
      path: "/books",
      handler: "book.create",
    },
    {
      method: "PUT",
      path: "/books/:documentId",
      handler: "book.update",
    },
    {
      method: "DELETE",
      path: "/books/:documentId",
      handler: "book.delete",
    },
    {
      method: "POST",
      path: "/books/tags",
      handler: "tag.findBook",
    },
  ],
};
