"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventMediaService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path = __importStar(require("path"));
let EventMediaService = class EventMediaService {
    dataDir = path.join(process.cwd(), 'data');
    dataFile = path.join(this.dataDir, 'event-media.json');
    async list(type) {
        const media = await this.readAll();
        const filtered = type ? media.filter((item) => item.type === type) : media;
        return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    async create(input) {
        const media = await this.readAll();
        const now = new Date().toISOString();
        const item = {
            id: `media_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
            ...input,
            createdAt: now,
            updatedAt: now,
        };
        media.push(item);
        await this.writeAll(media);
        return item;
    }
    async update(id, patch) {
        const media = await this.readAll();
        const index = media.findIndex((item) => item.id === id);
        if (index < 0) {
            return null;
        }
        media[index] = {
            ...media[index],
            ...patch,
            id: media[index].id,
            updatedAt: new Date().toISOString(),
        };
        await this.writeAll(media);
        return media[index];
    }
    async remove(id) {
        const media = await this.readAll();
        const filtered = media.filter((item) => item.id !== id);
        const changed = filtered.length !== media.length;
        if (changed) {
            await this.writeAll(filtered);
        }
        return { deleted: changed };
    }
    async readAll() {
        await fs_1.promises.mkdir(this.dataDir, { recursive: true });
        try {
            const content = await fs_1.promises.readFile(this.dataFile, 'utf8');
            return JSON.parse(content);
        }
        catch {
            const seed = [];
            await this.writeAll(seed);
            return seed;
        }
    }
    async writeAll(items) {
        await fs_1.promises.mkdir(this.dataDir, { recursive: true });
        await fs_1.promises.writeFile(this.dataFile, JSON.stringify(items, null, 2), 'utf8');
    }
};
exports.EventMediaService = EventMediaService;
exports.EventMediaService = EventMediaService = __decorate([
    (0, common_1.Injectable)()
], EventMediaService);
//# sourceMappingURL=event-media.service.js.map