# 使用官方的Node.js镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# install the dependencies before build this project

# # 复制package.json和yarn.lock
# COPY package.json yarn.lock ./

# # 安装依赖
# RUN yarn config set registry 'https://registry.npm.taobao.org'
# RUN yarn install

# # 复制整个项目
COPY . .

# 构建Strapi项目
RUN yarn build

# 暴露Strapi默认端口
EXPOSE 1337

# 启动Strapi应用
CMD ["yarn", "start"]