import { returnError } from "./index.js";

export function requireAdmin(user) {
  if (user.role !== "admin") {
    returnError({
      message: "Acceso denegado, se requiere rol admin",
      TypeCode: "FORBIDDEN",
      statusCode: 403
    } )
  }
}

export function requireLogin(user) {
  if (!user) {
    returnError({
      message: "No autenticado",
      TypeCode: "UNAUTHENTICATED",
      statusCode: 401
    } )
  }
}