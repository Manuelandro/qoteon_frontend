FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder

WORKDIR /app

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_QOTEON_CORE_API_URL
ARG QOTEON_CORE_API_URL

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_QOTEON_CORE_API_URL=${NEXT_PUBLIC_QOTEON_CORE_API_URL}
ENV QOTEON_CORE_API_URL=${QOTEON_CORE_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY next.config.ts ./next.config.ts
COPY eslint.config.mjs ./eslint.config.mjs
COPY postcss.config.mjs ./postcss.config.mjs
COPY tailwind.config.mjs ./tailwind.config.mjs
COPY proxy.ts ./proxy.ts
COPY tsconfig.json ./tsconfig.json
COPY app ./app
COPY public ./public
COPY utils ./utils
RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY .env.example ./

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "start"]
