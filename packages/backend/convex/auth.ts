// packages/backend/convex/auth.ts
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { expo } from "@better-auth/expo";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import { v } from "convex/values";

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(
    ctx: GenericCtx<DataModel>,
    { optionsOnly }: { optionsOnly?: boolean } = { optionsOnly: false },
) {
    return betterAuth({
        logger: {
            disabled: optionsOnly,
        },
        baseURL: process.env.siteUrl,
        trustedOrigins: [process.env.siteUrl!, process.env.NATIVE_APP_URL!, process.env.EXPO_URL!, process.env.CORS_ORIGIN!],
        database: authComponent.adapter(ctx),
        secret: process.env.BETTER_AUTH_SECRET!,
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },
        plugins: [expo(), convex()],
    });
}

export { createAuth };

export const getCurrentUser = query({
    args: {},
    returns: v.any(),
    handler: async function (ctx, args) {
        return authComponent.getAuthUser(ctx);
    },
});