import { magicAdmin } from "../../lib/magic";
import jwt from "jsonwebtoken";
import { isNewUser, createNewUser } from "../../lib/db/hasura";
import { setTokenCookie } from "../../lib/cookies";

export default async function login(req, res) {
  if (req.method === "POST") {
    try {
      const auth = req.headers.authorization;
      const DIDToken = auth ? auth.substr(7) : "";
      const metaData = await magicAdmin.users.getMetadataByToken(DIDToken);

      const token = jwt.sign(
        {
          ...metaData,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60),
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["user", "admin"],
            "x-hasura-default-role": "user",
            "x-hasura-user-id": `${metaData.issuer}`,
          },
        },
        process.env.JWT_SECRET
      );

      const isNewUserQuery = await isNewUser(token, metaData.issuer);

      if (isNewUserQuery) {
        const createNewUserMutation = await createNewUser(token, metaData);
        const cookie = setTokenCookie(token, res);
        res.send({ done: true, msg: "is a new user" });
      } else {
        const cookie = setTokenCookie(token, res);

        res.send({ done: true, msg: "not a new user" });
      }
    } catch (error) {
      res.status(500).send({ done: false });
    }
  } else {
    res.send({ done: false });
  }
}
