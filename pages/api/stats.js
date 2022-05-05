import {
  findVideoIdByUser,
  updateStats,
  insertStats,
} from "../../lib/db/hasura";

import { verifyToken } from "../../lib/utils";

export default async function stats(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(403).send({});
    }

    const userId = await verifyToken(token);
    const { videoId } = req.method === "POST" ? req.body : req.query;
    if (videoId) {
      const findVideo = await findVideoIdByUser(userId, videoId, token);
      const doesStatsExist = findVideo?.length > 0;
      if (req.method === "POST") {
        const { favourited, watched = true } = req.body;
        if (doesStatsExist) {
          const response = await updateStats(token, {
            favourited,
            watched,
            userId,
            videoId,
          });
          res.send({ response });
        }
        if (!doesStatsExist) {
          const response = await insertStats(token, {
            favourited,
            watched,
            userId,
            videoId,
          });
          res.send({ response });
        }
      }
      if (req.method === "GET") {
        if (doesStatsExist) {
          res.send(findVideo);
        }
        if (!doesStatsExist) {
          res.status(404);
          res.send({ user: null, msg: "video not found" });
        }
      }
    }
  } catch (error) {
    res.status(500).send({ msg: "Something went wront", error });
  }
}
