import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { echoJson, echoDate } from "../helpers/index.js";
import { requireAdmin, requireLogin } from "../helpers/auth.js";

export const resolvers = {
	Query: {},
	Mutation: {
		login: async (_root, { username, password }, { prisma }) => {
      const user = await prisma.user.findFirst({
        where: {
          username,
        }
      });

      if (!user) {
				returnError({
					message: "Usuario inválido",
					TypeCode: "FORBIDDEN",
					statusCode: 403
				})
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
				returnError({
					message: "Contraseña incorrecta",
					TypeCode: "FORBIDDEN",
					statusCode: 403
				})
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        fastify.jwtSecret,
        { expiresIn: "2h" }
      );

      return {
        token,
        user
      };
    },
		generateAvatarUploadUrl: async (_, { fileName, mimeType }, { fastify, user }) => {
			requireAdmin(user);
			if (!fastify?.s3) throw new Error("S3 no configurado");
			const key = `logos/${crypto.randomUUID()}-${fileName.replace(/\s+/g, "-")}`;
			const { s3 } = fastify;

			const command = new PutObjectCommand({
				Bucket: s3.S3_BUCKET,
				Key: key,
				ContentType: mimeType,
			});

			const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

			return { uploadUrl, key };
		}
	}
}
