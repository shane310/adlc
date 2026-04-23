"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _vitest = require("vitest");
const _appcontroller = require("./app.controller");
const _appservice = require("./app.service");
(0, _vitest.describe)('AppController', ()=>{
    let appController;
    (0, _vitest.beforeEach)(async ()=>{
        const app = await _testing.Test.createTestingModule({
            controllers: [
                _appcontroller.AppController
            ],
            providers: [
                _appservice.AppService
            ]
        }).compile();
        appController = app.get(_appcontroller.AppController);
    });
    (0, _vitest.describe)('getHealth', ()=>{
        (0, _vitest.it)('returns response envelope with ok status', ()=>{
            const result = appController.getHealth();
            (0, _vitest.expect)(result.success).toBe(true);
            (0, _vitest.expect)(result.data.status).toBe('ok');
            (0, _vitest.expect)(result.data).toHaveProperty('timestamp');
            (0, _vitest.expect)(typeof result.data.timestamp).toBe('string');
        });
    });
});

//# sourceMappingURL=app.controller.spec.js.map