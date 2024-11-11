/**
 * invitation router
 */


export default {
  routes: [
    {
      method: "GET",
      path: "/invitations/inviter",
      handler: "invitation.findManyAsInviter",
    },
    {
      method: "GET",
      path: "/invitations/invitee",
      handler: "invitation.findManyAsInvitee",
    },
    {
      method: "POST",
      path: "/invitations",
      handler: "invitation.create",
    },
    {
      method: "POST",
      path: "/invitations/:documentId",
      handler: "invitation.respond",
    },
    {
      method: "GET",
      path: "/invitations/profile/:email",
      handler: "invitation.getProfileFromEmail",
    },
  ],
};
