export const schema = `
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
    username:  String!
    role:      String!
    createdAt: String!
    updatedAt: String!
  }
  
  type Query {
    _empty: String
  }

  type Mutation {
    generateAvatarUploadUrl(fileName: String!, mimeType: String!): PresignedUrlResponse!
    login(username: String!, password: String!): AuthPayload!
  }
`