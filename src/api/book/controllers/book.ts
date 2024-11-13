/**
 * book controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::book.book",
  ({ strapi }) => ({
    async findOne(ctx) {
      const isContributor = await strapi
        .service("api::user.user")
        .validateBookContributor(ctx.state.user, ctx.params.documentId);
      if (!isContributor) {
        return ctx.forbidden(
          "You are not a contributor of this book, or this book is not existing"
        );
      }
      const book = await strapi.documents("api::book.book").findOne({
        documentId: ctx.params.documentId,
        ...ctx.request.query,
      });
      return { data: book, meta: {} };
    },

    async findMany(ctx) {
      console.log(ctx.request.query.filters);

      const spaceFilter = ctx.request.query.space
        ? {
            documentId: ctx.request.query.space,
            members: {
              documentId: ctx.state.user.documentId,
            },
          }
        : {
            members: {
              documentId: ctx.state.user.documentId,
            },
          };

      const books = await strapi.documents("api::book.book").findMany({
        ...ctx.request.query,
        filters: {
          ...((ctx.request.query.filters as Record<string, unknown>) || {}),
          space: spaceFilter,
        },
      });
      return { data: books, meta: {} };
    },

    async create(ctx) {
      const isContributor = await strapi
        .service("api::user.user")
        .validateSpaceMember(ctx.state.user, ctx.request.body.space);
      if (!isContributor) {
        return ctx.forbidden(
          "You are not a contributor of this space, or this space is not existing"
        );
      }
      const book = await strapi.documents("api::book.book").create({
        data: {
          ...ctx.request.body,
        },
      });
      return { data: book, meta: {} };
    },

    async update(ctx) {
      const isContributor = await strapi
        .service("api::user.user")
        .validateBookContributor(ctx.state.user, ctx.params.documentId);
      if (!isContributor) {
        return ctx.forbidden(
          "You are not a contributor of this book, or this book is not existing"
        );
      }
      const book = await strapi.documents("api::book.book").update({
        documentId: ctx.params.documentId,
        data: ctx.request.body,
      });
      return { data: book, meta: {} };
    },

    async delete(ctx) {
      const isContributor = await strapi
        .service("api::user.user")
        .validateBookContributor(ctx.state.user, ctx.params.documentId);
      if (!isContributor) {
        return ctx.forbidden(
          "You are not a contributor of this book, or this book is not existing"
        );
      }

      // 查找该book下的所有stories
      const stories = await strapi.documents("api::story.story").findMany({
        filters: {
          book: {
            documentId: ctx.params.documentId,
          },
        },
      });

      // 逐个删除stories
      for (const story of stories) {
        await strapi.documents("api::story.story").delete({
          documentId: story.documentId,
        });
      }

      // 删除book本身
      ctx.params.id = ctx.params.documentId;
      return await super.delete(ctx);
    },
  })
);
