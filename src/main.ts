import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const SwaggerConfig = new DocumentBuilder()
    .setTitle('Swyft API')
    .setDescription('The Swyft banking API')
    .setVersion('1.0')
    .build();

  const SwaggerDocument = SwaggerModule.createDocument(app, SwaggerConfig);
  SwaggerModule.setup('api', app, SwaggerDocument);
  await app.listen(3000);
}
bootstrap();
