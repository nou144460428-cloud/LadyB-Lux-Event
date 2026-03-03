"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrismaClient = createPrismaClient;
const client_1 = require("@prisma/client");
function resolvePrismaClientOptions() {
    const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
    if (accelerateUrl) {
        return { accelerateUrl };
    }
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('Prisma configuration error: set DATABASE_URL (for adapter mode) or PRISMA_ACCELERATE_URL.');
    }
    try {
        const { PrismaPg } = require('@prisma/adapter-pg');
        return {
            adapter: new PrismaPg({ connectionString }),
        };
    }
    catch {
        throw new Error('Prisma 7 requires a driver adapter. Install "@prisma/adapter-pg" and "pg", or set PRISMA_ACCELERATE_URL.');
    }
}
function createPrismaClient() {
    const Client = client_1.PrismaClient;
    return new Client(resolvePrismaClientOptions());
}
//# sourceMappingURL=prisma-client-options.js.map