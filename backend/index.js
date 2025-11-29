import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import mercurius from "mercurius";
import { PrismaClient } from "@prisma/client";
import { resolvers } from "./graphql/resolvers.js";
import { s3 } from "./plugins/s3.js";
import { schema } from "./graphql/schema.js";

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });
const jwtSecret = process.env.JWT_SECRET || "12345678";

fastify.decorate("jwtSecret", jwtSecret);
fastify.decorate("s3", s3);
fastify.decorate("prisma", prisma);

fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    if (!origin || origin === "null") {
      return cb(null, true);
    }

    const isLocalhost = origin === "http://localhost:3000";
    const isExtension = origin.startsWith("chrome-extension://");

    if (isLocalhost || isExtension) {
      cb(null, true);
    } else {
      cb(new Error("Dominio no permitido"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["ETag"]
});

fastify.register(fastifyJwt, {
  secret: fastify.jwtSecret,
  sign: { expiresIn: "2h" }
});

fastify.register(mercurius, {
  schema,
  resolvers,
  graphiql: false,
  context: async (req, reply) => {
    const authHeader = req.headers.authorization;

    let user = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = await fastify.jwt.verify(token);
        user = decoded;
      } catch (err) {
        console.log("Token inválido o expirado:", err.message);
        reply.code(401);
        throw new Error("Token inválido o expirado");
      }
    }

    return {
      fastify,
      prisma,
      req,
      reply,
      user,
    };
  },
  path: "/apiquery"
});

fastify.addHook("onSend", async (req, reply, payload) => {
  try {
    const res = JSON.parse(payload);
    if (res?.errors?.length) {
      const status = res.errors[0]?.extensions?.http?.status;
      if (status) reply.status(status);
    }
  } catch {

  }
  return payload;
});

try {
  await fastify.listen({ port: process.env.BACKEND_PORT || 3001, host: "0.0.0.0" });
  fastify.log.info("Server listening");
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
