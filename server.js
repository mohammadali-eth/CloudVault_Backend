const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./src/app.module');
const { ValidationPipe } = require('@nestjs/common');
const express = require('express');
const { ExpressAdapter } = require('@nestjs/platform-express');

const cors = require("cors");

const server = express();

async function createServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.use(
    cors({
      origin: [
        "https://cloudy-vault.vercel.app",
        "http://localhost:3000"
      ],
      credentials: true
    })
  );
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
}

createServer()
  .then(() => console.log('Nest Readiness Complete'))
  .catch((err) => console.error('Nest Readiness Error', err));

module.exports = server;
