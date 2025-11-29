import crypto from "crypto";

export const genRandomPassword = (len = 12) => {
  return crypto.randomBytes(Math.ceil(len/2)).toString("hex").slice(0, len);
}

export const echoJson = (obj) => {
  console.log(JSON.stringify(obj, null, 2));
}

export const echoDate = (dateString) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export const returnError = (params) => {
  const { message, TypeCode, statusCode } = params
  const error = new Error(message);
  error.extensions = { code: TypeCode, http: { status: statusCode } };
  throw error;
}