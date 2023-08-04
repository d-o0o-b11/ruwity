
# Dpendencies 설치 환경 (deps)
FROM node:18.12.1-alpine AS deps

WORKDIR /usr/src/r_u_wity_back/app

COPY ./package*.json yarn.lock nest-cli.json tsconfig.json ./
# COPY src/envs/production.env /app/envs/production.env


COPY . .

RUN npm install -g @nestjs/cli
RUN yarn 
RUN yarn build

# COPY . .



# 서버 실행 (runner) - node_modules, dist 파일만 복사 >> 빌드 과정 후 필요한 파일만 복사하여 컨테이너 실행
FROM node:18.12.1-alpine AS runner


WORKDIR /usr/src/r_u_wity_back/app

COPY --from=deps /usr/src/r_u_wity_back/app/dist ./dist
COPY --from=deps /usr/src/r_u_wity_back/app/src/envs ./src/envs
COPY --from=deps /usr/src/r_u_wity_back/app/node_modules ./node_modules
# COPY src/envs/production.env ./src/envs/production.env

CMD ["node", "dist/main"]


