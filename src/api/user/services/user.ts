/**
 * user service
 */
import type { Core } from "@strapi/types";

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async validateSpaceOwner(user: any, spaceDocumentId: string) {
    const userInfo: User = user;
    console.log("Now login user:", userInfo);
    console.log("Space document id:", spaceDocumentId);

    if (!userInfo?.id) {
      console.log("User not found");
      return false;
    }
    const space = await strapi.documents("api::space.space").count({
      filters: {
        documentId: {
          $eq: spaceDocumentId,
        },
        owner: {
          documentId: {
            $eq: userInfo.documentId,
          },
        },
      },
      populate: ["owner"],
    });

    // console.log("Found space", space);
    return space === 1;
  },
  async validateSpaceMember(user: any, spaceDocumentId: string) {
    const userInfo: User = user;
    const space = await strapi.documents("api::space.space").findOne({
      documentId: spaceDocumentId,
      populate: ["members"],
    });
    // console.log("Check space", space);
    return space?.members?.some(
      (member) => member.documentId === userInfo.documentId
    );
  },

  async validateBookContributor(user: any, bookDocumentId: string) {
    const userInfo: User = user;
    const space = await strapi.documents("api::space.space").findFirst({
      filters: {
        books: {
          documentId: bookDocumentId,
        },
      },
      fields: [],
    });
    // console.log("Found space", space);
    return this.validateSpaceMember(userInfo, space?.documentId);
  },

  async validateStoryContributor(user: any, storyDocumentId: string) {
    const userInfo: User = user;
    const book = await strapi.documents("api::book.book").findFirst({
      filters: {
        stories: {
          documentId: storyDocumentId,
        },
      },
      fields: [],
    });
    // console.log("Found book", book);
    
    return this.validateBookContributor(userInfo, book?.documentId);
  },
});
