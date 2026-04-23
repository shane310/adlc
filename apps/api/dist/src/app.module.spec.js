"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _vitest = require("vitest");
const _appmodule = require("./app.module");
const _prismaservice = require("./prisma/prisma.service");
(0, _vitest.describe)('AppModule', ()=>{
    (0, _vitest.it)('compiles', async ()=>{
        const moduleRef = await _testing.Test.createTestingModule({
            imports: [
                _appmodule.AppModule
            ]
        }).overrideProvider(_prismaservice.PrismaService).useValue({
            onModuleInit: async ()=>{},
            onModuleDestroy: async ()=>{}
        }).compile();
        (0, _vitest.expect)(moduleRef).toBeDefined();
        await moduleRef.close();
    });
});

//# sourceMappingURL=app.module.spec.js.map