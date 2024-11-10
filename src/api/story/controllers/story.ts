/**
 * story controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::story.story",
  ({ strapi }) => ({
    async findOne(ctx) {
      const isContributor = await strapi
        .service("api::user.user")
        .validateStoryContributor(ctx.state.user, ctx.params.documentId);
      if (!isContributor) {
        return ctx.forbidden(
          "You are not a contributor of this story, or this story is not existing"
        );
      }
      const story = await strapi.documents("api::story.story").findOne({
        documentId: ctx.params.documentId,
        ...ctx.request.query,
      });
      return { data: story, meta: {} };
    },

    async findMany(ctx) {
      const bookFilter = ctx.request.query.book
        ? {
            documentId: ctx.request.query.book,
            space: {
              members: {
                documentId: ctx.state.user.documentId,
              },
            },
          }
        : {
            space: {
              members: {
                documentId: ctx.state.user.documentId,
              },
            },
          };

      const stories = await strapi.documents("api::story.story").findMany({
        ...ctx.request.query,
        filters: {
          ...((ctx.request.query.filters as Record<string, unknown>) || {}),
          book: bookFilter,
        },
      });
      return { data: stories, meta: {} };
    },

    async create(ctx) {
      const isContributor = await strapi
        .service("api::user.user")
        .validateBookContributor(ctx.state.user, ctx.request.body.book);
      if (!isContributor) {
        return ctx.forbidden(
          "You are not a contributor of this book, or this book is not existing"
        );
      }
      const story = await strapi.documents("api::story.story").create({
        data: {
          ...ctx.request.body,
          creator: ctx.state.user.documentId,
        },
      });
      return { data: story, meta: {} };
    },

    async update(ctx) {
      const isContributor = await strapi
        .service("api::user.user")
        .validateStoryContributor(ctx.state.user, ctx.params.documentId);
      if (!isContributor) {
        return ctx.forbidden(
          "You are not a contributor of this story, or this story is not existing"
        );
      }
      const story = await strapi.documents("api::story.story").update({
        documentId: ctx.params.documentId,
        data: ctx.request.body,
      });
      return { data: story, meta: {} };
    },

    async delete(ctx) {
      const isContributor = await strapi
        .service("api::user.user")
        .validateStoryContributor(ctx.state.user, ctx.params.documentId);
      if (!isContributor) {
        return ctx.forbidden(
          "You are not a contributor of this story, or this story is not existing"
        );
      }
      ctx.params.id = ctx.params.documentId;
      return await super.delete(ctx);
    },
  })
);
