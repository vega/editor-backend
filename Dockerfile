FROM node:12

WORKDIR /editor-backend

RUN apt-get update && apt-get -y install yarn

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3000

ENTRYPOINT ["yarn"]
CMD ["start"]
