/**
 * favourite controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::favourite.favourite", {
  async findMany(ctx) {
    const favourites = await strapi
      .documents("api::favourite.favourite")
      .findFirst({
        ...ctx.request.query,
        filters: {
          user: {
            documentId: ctx.state.user.documentId,
          },
        },
        populate: ["stories"],
      });
    if (!favourites) {
      return { data: [], meta: {} };
    }
    return { data: favourites.stories, meta: {} };
  },

  async like(ctx) {
    const storyId = ctx.params.documentId;
    const isContributor = await strapi
      .service("api::user.user")
      .validateStoryContributor(ctx.state.user, storyId);
    if (!isContributor) {
      return ctx.forbidden(
        "You are not a contributor of this story, or this story is not existing"
      );
    }

    // 查找用户的收藏列表
    let favourite = await strapi
      .documents("api::favourite.favourite")
      .findFirst({
        filters: {
          user: {
            documentId: ctx.state.user.documentId,
          },
        },
        populate: ["stories"],
      });

    // 如果用户没有收藏列表，创建一个新的
    if (!favourite) {
      favourite = await strapi.documents("api::favourite.favourite").create({
        data: {
          user: ctx.state.user.documentId,
          stories: [storyId],
        },
      });
      return { data: { liked: true }, meta: {} };
    } else {
      // 检查故事是否已经在收藏列表中
      const isAlreadyFavourite = favourite.stories.some(
        (story) => story.documentId === storyId
      );

      if (isAlreadyFavourite) {
        // 如果已经收藏，则移除
        await strapi.documents("api::favourite.favourite").update({
          documentId: favourite.documentId,
          data: {
            stories: favourite.stories.filter(
              (story) => story.documentId !== storyId
            ),
          },
        });
        return { data: { liked: false }, meta: {} };
      } else {
        // 如果未收藏，则添加
        await strapi.documents("api::favourite.favourite").update({
          documentId: favourite.documentId,
          data: {
            stories: [...favourite.stories, storyId],
          },
        });
        return { data: { liked: true }, meta: {} };
      }
    }
  },
});
