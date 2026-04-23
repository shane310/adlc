"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _config = require("@nestjs/config");
const _vitest = require("vitest");
const _prismamodule = require("./prisma.module");
const _prismaservice = require("./prisma.service");
const shouldRun = Boolean(process.env.DATABASE_URL);
_vitest.describe.skipIf(!shouldRun)('PrismaService integration', ()=>{
    let moduleRef;
    let prisma;
    (0, _vitest.beforeAll)(async ()=>{
        moduleRef = await _testing.Test.createTestingModule({
            imports: [
                _config.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: [
                        '.env.local',
                        '.env'
                    ]
                }),
                _prismamodule.PrismaModule
            ]
        }).compile();
        prisma = moduleRef.get(_prismaservice.PrismaService);
    });
    (0, _vitest.afterAll)(async ()=>{
        await moduleRef.close();
    });
    (0, _vitest.it)('connects to the database', async ()=>{
        await (0, _vitest.expect)(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
    });
});

//# sourceMappingURL=prisma.service.integration.spec.js.map