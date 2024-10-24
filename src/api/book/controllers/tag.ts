/**
 * A set of functions called "actions" for `tag`
 */

import { factories } from "@strapi/strapi";

type Tag = {
  label: string;
  confidence: number;
};

export default factories.createCoreController(
  "api::book.book",
  ({ strapi }) => ({
    async findBook(ctx) {
      const { tags, limit } = ctx.request.body as {
        tags: Tag[];
        limit: number;
      };

      // 优化1: 预先创建标签集合和置信度映射
      const tagSet = new Set(tags.map((tag) => tag.label));
      const tagConfidenceMap = new Map(
        tags.map((tag) => [tag.label, tag.confidence])
      );

      // 获取所有书籍
      const books = await strapi.documents("api::book.book").findMany({
        filters: {
          space: {
            members: {
              documentId: ctx.state.user.documentId,
            },
          },
        },
      });

      // 优化2: 在内存中过滤和排序书籍
      const filteredAndSortedBooks = books
        .filter((book) => {
          const bookTags = book.tags as Tag[];
          return bookTags.some((tag) => tagSet.has(tag.label));
        })
        .sort((a, b) => {
          const aTags = a.tags as Tag[];
          const bTags = b.tags as Tag[];

          // 优化3: 结合请求和数据库的置信度计算总分
          const aScore = aTags.reduce((acc, tag) => {
            if (tagSet.has(tag.label)) {
              const requestConfidence = tagConfidenceMap.get(tag.label) || 0;
              return acc + requestConfidence * tag.confidence;
            }
            return acc;
          }, 0);

          const bScore = bTags.reduce((acc, tag) => {
            if (tagSet.has(tag.label)) {
              const requestConfidence = tagConfidenceMap.get(tag.label) || 0;
              return acc + requestConfidence * tag.confidence;
            }
            return acc;
          }, 0);

          return bScore - aScore;
        })
        .map((book) => ({
          id: book.id,
          documentId: book.documentId,
          name: book.name,
        }));

      return { data: filteredAndSortedBooks.slice(0, limit), meta: {} };
    },
  })
);
