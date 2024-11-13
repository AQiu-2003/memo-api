/**
 * space controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::space.space",
  ({ strapi }) => ({
    async findOne(ctx) {
      const isOwner = await strapi
        .service("api::user.user")
        .validateSpaceOwner(ctx.state.user, ctx.params.documentId);
      const isMember = await strapi
        .service("api::user.user")
        .validateSpaceMember(ctx.state.user, ctx.params.documentId);
      if (!isOwner && !isMember) {
        return ctx.forbidden("You are not the owner or member of this space");
      }
      const space = await strapi.documents("api::space.space").findOne({
        documentId: ctx.params.documentId,
        ...ctx.request.query,
      });
      return { data: space, meta: {} };
    },

    async findMany(ctx) {
      const spaces = await strapi.documents("api::space.space").findMany({
        filters: {
          ...((ctx.request.query.filters as Record<string, unknown>) || {}),
          $or: [
            {
              owner: {
                documentId: ctx.state.user.documentId,
              },
            },
            {
              members: {
                documentId: ctx.state.user.documentId,
              },
            },
          ],
        },
        ...ctx.request.query,
      });
      return { data: spaces, meta: {} };
    },

    async create(ctx) {
      const space = await strapi.documents("api::space.space").create({
        data: {
          ...ctx.request.body,
          owner: ctx.state.user.documentId,
          members: [ctx.state.user.documentId],
        },
      });
      return { data: space, meta: {} };
    },

    async update(ctx) {
      const { documentId } = ctx.params;
      const isOwner = await strapi
        .service("api::user.user")
        .validateSpaceOwner(ctx.state.user, documentId);
      if (!isOwner) {
        return ctx.forbidden(
          "You are not the owner of this space, or this space is not existing"
        );
      }
      const space = await strapi.documents("api::space.space").update({
        documentId,
        data: ctx.request.body,
      });
      return { data: space, meta: {} };
    },

    async delete(ctx) {
      const { documentId } = ctx.params;
      const isOwner = await strapi
        .service("api::user.user")
        .validateSpaceOwner(ctx.state.user, documentId);
      if (!isOwner) {
        return ctx.forbidden(
          "You are not the owner of this space, or this space is not existing"
        );
      }

      // 获取space及其关联的books
      const space = await strapi.documents("api::space.space").findOne({
        documentId,
        populate: ["books"],
      });

      // 获取所有关联的stories并删除
      const books = space.books || [];
      for (const book of books) {
        // 查找该book下的所有stories
        const stories = await strapi.documents("api::story.story").findMany({
          filters: {
            book: {
              documentId: book.documentId,
            },
          },
        });

        // 逐个删除stories
        for (const story of stories) {
          await strapi.documents("api::story.story").delete({
            documentId: story.documentId,
          });
        }

        // 删除book
        await strapi.documents("api::book.book").delete({
          documentId: book.documentId,
        });
      }

      // 最后删除space
      await strapi.documents("api::space.space").delete({
        documentId,
      });

      return { data: null, meta: {} };
    },

    async deleteMember(ctx) {
      const { documentId, memberDocumentId } = ctx.params;
      const isOwner = await strapi
        .service("api::user.user")
        .validateSpaceOwner(ctx.state.user, documentId);
      if (!isOwner) {
        return ctx.forbidden("You are not the owner of this space");
      }
      const space = await strapi.documents("api::space.space").findOne({
        documentId,
        populate: ["members"],
      });
      const updatedSpace = await strapi.documents("api::space.space").update({
        documentId,
        data: {
          members: space.members.filter(
            (member) => member.documentId !== memberDocumentId
          ),
        },
      });
      return { data: updatedSpace, meta: {} };
    },
  })
);
