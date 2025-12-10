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
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module"); // deve estar em backend/api/src/app.module.ts
const users_service_1 = require("./users/users.service"); // relativo à pasta src, se estiver em src/users
const bcrypt = __importStar(require("bcryptjs"));
async function bootstrap() {
    // Cria um contexto de aplicação NestJS (sem iniciar servidor HTTP)
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    // Obtém a instância do UsersService
    const usersService = app.get(users_service_1.UsersService);
    const email = 'admin@admin.com';
    // Verifica se o admin já existe
    const existing = await usersService.findByEmail(email);
    if (!existing) {
        const hashed = await bcrypt.hash('admin123', 10); // hash da senha
        const admin = await usersService.create({
            name: 'Admin',
            email,
            password: hashed,
            roles: ['admin'], // roles deve estar definido no seu schema
        });
        console.log('Admin criado:', admin);
    }
    else {
        console.log('Admin já existe:', existing);
    }
    // Fecha o contexto do NestJS
    await app.close();
}
// Executa o script
bootstrap().catch(err => {
    console.error('Erro ao criar admin:', err);
});
