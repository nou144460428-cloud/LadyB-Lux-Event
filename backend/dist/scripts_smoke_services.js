"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const auth_service_1 = require("./src/auth/auth.service");
const admin_service_1 = require("./src/admin/admin.service");
const whatsapp_service_1 = require("./src/whatsapp/whatsapp.service");
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
async function run() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: false });
    const authService = app.get(auth_service_1.AuthService);
    const adminService = app.get(admin_service_1.AdminService);
    const whatsappService = app.get(whatsapp_service_1.WhatsappService);
    const suffix = Date.now();
    let decoratorValidationBlocked = false;
    try {
        await authService.register({
            name: 'Bad Decorator',
            email: `bad-deco-${suffix}@example.com`,
            password: 'Password123!',
            role: 'VENDOR',
            accountType: 'DECORATOR',
        });
    }
    catch {
        decoratorValidationBlocked = true;
    }
    assert(decoratorValidationBlocked, 'Decorator missing contacts should be blocked');
    const goodDecorator = await authService.register({
        name: 'Good Decorator',
        email: `good-deco-${suffix}@example.com`,
        password: 'Password123!',
        role: 'VENDOR',
        accountType: 'DECORATOR',
        phone: '+2348011111111',
        nextOfKinName: 'Kin Name',
        nextOfKinPhone: '+2348022222222',
        nextOfKinRelationship: 'Sibling',
    });
    assert(Boolean(goodDecorator?.access_token), 'Decorator registration should return token');
    const staff = await adminService.createStaffAccount({
        name: 'Ops Staff',
        email: `staff-${suffix}@example.com`,
        password: 'Password123!',
        accountType: 'STAFF',
    });
    assert(staff.role === 'STAFF', `Expected STAFF role, got ${staff.role}`);
    const channels = whatsappService.listChannels();
    assert(Array.isArray(channels) && channels.length > 0, 'WhatsApp channels should be available');
    console.log('SERVICE_SMOKE_OK');
    console.log(JSON.stringify({
        decoratorValidationBlocked,
        decoratorRegistered: goodDecorator.user?.email,
        staffCreatedRole: staff.role,
        whatsappChannels: channels,
    }, null, 2));
    await app.close();
}
run().catch((err) => {
    console.error('SERVICE_SMOKE_FAILED');
    console.error(err?.stack || err);
    process.exit(1);
});
//# sourceMappingURL=scripts_smoke_services.js.map