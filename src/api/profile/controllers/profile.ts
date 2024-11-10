/**
 * profile controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::profile.profile",
  ({ strapi }) => ({
    async me(ctx) {
      const profile = await strapi.documents("api::profile.profile").findFirst({
        filters: {
          user: { documentId: ctx.state.user.documentId },
        },
        populate: ["avatar"],
      });
      if (!profile) {
        return ctx.notFound("Profile not found");
      }
      return { data: profile, meta: {} };
    },

    async create(ctx) {
      const profile = await strapi.documents("api::profile.profile").create({
        data: {
          user: ctx.state.user.documentId,
          ...ctx.request.body,
        },
      });
      return { data: profile, meta: {} };
    },

    async update(ctx) {
      const profile = await strapi.documents("api::profile.profile").findFirst({
        filters: {
          user: { documentId: ctx.state.user.documentId },
        },
      });
      if (!profile) {
        return ctx.notFound("Profile not found");
      }
      const updatedProfile = await strapi
        .documents("api::profile.profile")
        .update({
          documentId: profile.documentId,
          data: ctx.request.body,
        });
      return { data: updatedProfile, meta: {} };
    },
  })
);
