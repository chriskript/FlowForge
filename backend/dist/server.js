"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("./middleware/errorHandler");
const githubRoutes_1 = require("./routes/githubRoutes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/github', githubRoutes_1.githubRouter);
app.get('/health', async (_req, res) => {
    res.json({ ok: true, service: 'flowforge-backend' });
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`FlowForge backend running on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map