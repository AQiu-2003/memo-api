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
      if (!isOwner) {
        return ctx.forbidden("You are not the owner of this space");
      }
      ctx.params.id = ctx.params.documentId;
      return await super.findOne(ctx);
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
