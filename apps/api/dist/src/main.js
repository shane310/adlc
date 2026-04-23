"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("reflect-metadata");
const _core = require("@nestjs/core");
const _swagger = require("@nestjs/swagger");
const _config = require("@nestjs/config");
const _appmodule = require("./app.module");
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    const config = app.get(_config.ConfigService);
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: config.get('FRONTEND_URL', 'http://localhost:5173')
    });
    const swaggerConfig = new _swagger.DocumentBuilder().setTitle('ZhiMao API').setDescription('智贸 AI 外贸工作台 API').setVersion('1.0').build();
    const document = _swagger.SwaggerModule.createDocument(app, swaggerConfig);
    _swagger.SwaggerModule.setup('api/docs', app, document);
    const portRaw = config.get('PORT', 3000);
    const port = typeof portRaw === 'number' ? portRaw : Number(portRaw) || 3000;
    await app.listen(port);
}
void bootstrap();

//# sourceMappingURL=main.js.map