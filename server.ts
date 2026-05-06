import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import cors from 'cors';

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

export default server;
