FROM node:alpine

WORKDIR /app

VOLUME ["/app"]

EXPOSE 5000

CMD [ "npm", "run", "dev", "--", "--scope", "@bitstreamy/webapp" ]