import { v4 as uuidv4 } from "uuid";
import { AnonUsage } from "../model/anonymous.js";

const DEFAULT_LIMIT = Number(process.env.ANON_DAILY_LIMIT || 4);

export async function enforceAnonLimit(req, res, next) {
    try {
        console.log("[anonLimit] incoming:", { path: req.path, method: req.method, hasUser: !!req.user });
        console.log(req.user)
        if (req.user && req.user.sub) return next();
        let filesCount = 0;
        if (Array.isArray(req.files) && req.files.length) filesCount = req.files.length;
        else if (req.file) filesCount = 1;
        else {
            return next();
        }
        const cookieName = process.env.ANON_COOKIE_NAME || "anonId";
        const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1";
        let anonId = req.cookies?.[cookieName];
        if (!anonId) {
            anonId = uuidv4();
            res.cookie(cookieName, anonId, {
                httpOnly: true,
                secure: !isLocal,  
                sameSite: isLocal ? "Lax" : "None",
                maxAge: 1000 * 60 * 60 * 24 * 30,
            });
        }

        const utcNow = new Date();
        const dateStr = utcNow.toISOString().slice(0, 10);

        const upsert = await AnonUsage.findOneAndUpdate(
            { anonId, dateStr },
            { $inc: { count: filesCount }, $set: { lastSeen: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (upsert.count > DEFAULT_LIMIT) {

            await AnonUsage.findOneAndUpdate({ anonId, dateStr }, { $inc: { count: -filesCount } });
            return res.status(403).json({
                ok: false,
                code: "ANON_LIMIT_EXCEEDED",
                message: `Anonymous daily limit reached (${DEFAULT_LIMIT}). Please sign up to continue.`,
                limit: DEFAULT_LIMIT,
            });
        }
        req.anonUsage = { anonId, dateStr, count: upsert.count, limit: DEFAULT_LIMIT };
        return next();
    } catch (err) {
        console.error("enforceAnonLimit error:", err);
        return next();
    }
}