export const schema = `
 scalar DateTime

  enum UserRole {
    ADMIN
    DOCTOR
    PATIENT
  }

  enum AppointmentStatus {
    PENDING
    CONFIRMED
    CANCELLED
  }

  type PresignedUrlResponse {
    uploadUrl: String!
    key: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    email: String!
    role: UserRole!
    doctor: Doctor
    createdAt: String!
    updatedAt: String!
  }

  type Doctor {
    id: ID!
    name: String!
    specialty: String!
    bio: String
    phone: String
    userId: ID!
    user: User!
    appointments: [Appointment!]!
    createdAt: String!
    updatedAt: String!
  }

  type Patient {
    id: ID!
    name: String!
    email: String
    phone: String
    appointments: [Appointment!]!
    createdAt: String!
    updatedAt: String!
  }

  type Appointment {
    id: ID!
    doctor: Doctor!
    patient: Patient!
    dateTime: DateTime!
    status: AppointmentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  input CreateDoctorInput {
    email: String!
    password: String!
    name: String!
    specialty: String!
    phone: String
    bio: String
  }

  input CreatePatientInput {
    name: String!
    email: String
    phone: String
  }

  input CreateAppointmentInput {
    doctorId: ID!
    patientId: ID!
    dateTime: DateTime!
  }

  type Query {
    me: User
    doctors: [Doctor!]!
    doctor(id: ID): Doctor
    patients: [Patient!]!
    appointments: [Appointment!]!
  }

  type Mutation {
    registerDoctor(data: CreateDoctorInput): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createPatient(data: CreatePatientInput): Patient!
    createAppointment(data: CreateAppointmentInput): Appointment!
    generateAvatarUploadUrl(fileName: String!, mimeType: String!): PresignedUrlResponse!
  }
`