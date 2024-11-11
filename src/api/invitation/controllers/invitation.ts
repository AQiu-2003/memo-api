/**
 * invitation controller
 */

import { factories } from "@strapi/strapi";

enum Condition {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export default factories.createCoreController(
  "api::invitation.invitation",
  ({ strapi }) => ({
    async findManyAsInviter(ctx) {
      const invitations = await strapi
        .documents("api::invitation.invitation")
        .findMany({
          ...ctx.request.query,
          filters: {
            ...((ctx.request.query.filters as Record<string, unknown>) || {}),
            inviter: {
              documentId: ctx.state.user.documentId,
            },
          },
          populate: ["invitee"],
        });
      return { data: invitations, meta: {} };
    },

    async findManyAsInvitee(ctx) {
      const invitations = await strapi
        .documents("api::invitation.invitation")
        .findMany({
          ...ctx.request.query,
          filters: {
            ...((ctx.request.query.filters as Record<string, unknown>) || {}),
            invitee: {
              documentId: ctx.state.user.documentId,
            },
          },
          populate: ["inviter"],
        });
      return { data: invitations, meta: {} };
    },

    async getProfileFromEmail(ctx) {
      const profile = await strapi.documents("api::profile.profile").findFirst({
        filters: { user: { email: ctx.params.email } },
        populate: ["user"],
      });
      return { data: profile, meta: {} };
    },

    async create(ctx) {
      const { space, invitee } = ctx.request.body;
      if (!space || !invitee) {
        return ctx.badRequest("Space and invitee are required");
      }
      const isSpaceOwner = await strapi
        .service("api::user.user")
        .validateSpaceOwner(ctx.state.user, space);
      if (!isSpaceOwner) {
        return ctx.badRequest("You are not the owner of this space");
      }
      const hasInvited = await strapi
        .documents("api::invitation.invitation")
        .count({
          filters: {
            space: { documentId: space },
            inviter: { documentId: ctx.state.user.documentId },
            invitee: { documentId: invitee },
            condition: {
              $in: [Condition.PENDING, Condition.ACCEPTED],
            },
          },
        });
      if (hasInvited) {
        return ctx.badRequest("You have already invited this user");
      }
      const invitation = await strapi
        .documents("api::invitation.invitation")
        .create({
          data: {
            ...ctx.request.body,
            condition: Condition.PENDING,
            inviter: ctx.state.user.documentId,
          },
        });
      return { data: invitation, meta: {} };
    },

    async respond(ctx) {
      const { response } = ctx.request.body;
      const condition = [Condition.ACCEPTED, Condition.REJECTED];
      if (!condition.includes(response as Condition)) {
        return ctx.badRequest("Invalid condition");
      }
      const invitation = await strapi
        .documents("api::invitation.invitation")
        .findOne({
          documentId: ctx.params.documentId,
          fields: ["condition"],
        });
      if (condition.includes(invitation.condition as Condition)) {
        return ctx.badRequest("You have already responded to this invitation");
      }
      const updatedInvitation = await strapi
        .documents("api::invitation.invitation")
        .update({
          documentId: ctx.params.documentId,
          data: {
            condition: response,
          },
        });
      return { data: updatedInvitation, meta: {} };
    },
  })
);
