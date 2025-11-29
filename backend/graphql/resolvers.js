import bcrypt from "bcryptjs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { echoJson, echoDate } from "../helpers/index.js";
import { requireAdmin, requireLogin } from "../helpers/auth.js";

export const resolvers = {
	Query: {
		me: async (_, __, { user, prisma }) => {
			if (!user) return null;
			return prisma.user.findUnique({
				where: { id: user.id },
				include: { doctor: true },
			});
		},

		doctors: async (_, __, { prisma }) => {
			return prisma.doctor.findMany({ include: { user: true } })
		},

		doctor: async (_, { id }, { prisma }) => {
      console.log(id)
			return prisma.doctor.findUnique({
				where: { id },
				include: { user: true },
			});
		},

		patients: async (_, __, { prisma }) => {
			return prisma.patient.findMany()
		},

		appointments: async (_, __, { prisma }) => {
			return prisma.appointment.findMany({
				include: { doctor: true, patient: true },
			})
		}
	},
	Mutation: {
		registerDoctor: async ( _, { data }, { prisma, fastify }) => {
			const { email, password, name, specialty, phone, bio  } = data;
      const hashed = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          role: "DOCTOR",
          doctor: {
            create: {
              name,
              specialty,
              phone,
              bio,
            },
          },
        },
        include: { doctor: true },
      });

			const token = fastify.jwt.sign({
				id: user.id, role: user.role
			});

      return { token, user };
    },

    login: async (_, { email, password }, {prisma, fastify}) => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { doctor: true },
      });

      if (!user) throw new Error("Credenciales inválidas");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Credenciales inválidas");

			const token = fastify.jwt.sign({
				id: user.id, role: user.role
			});

      return { token, user };
    },

    createPatient: (_, { data }, { prisma }) => {
			const { name, email, phone } = data;
      return prisma.patient.create({
        data: { name, email, phone },
      });
    },

    createAppointment: async (_, { data }, { prisma }) => {
			const { doctorId, patientId, dateTime } = data;
      const existing = await prisma.appointment.findFirst({
        where: {
          doctorId,
          dateTime: new Date(dateTime),
        },
      });

      if (existing) {
        throw new Error("El doctor ya tiene una cita en ese horario.");
      }

      return prisma.appointment.create({
        data: {
          doctorId,
          patientId,
          dateTime: new Date(dateTime),
        },
        include: { doctor: true, patient: true },
      });
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
