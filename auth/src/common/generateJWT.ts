import jwt from "jsonwebtoken";

const generateUserToken = (userId: string) => {
  return jwt.sign({ id: userId }, "jwt-secret", {
    expiresIn: "7d",
  });
};

export { generateUserToken };
