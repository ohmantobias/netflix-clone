import videoTestData from "../data/videos.json";
import { getWatchedVideos, myListVideos } from "./db/hasura";

const fetchVideos = async (url) => {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const BASE_URL = "youtube.googleapis.com/youtube/v3";

  const response = await fetch(
    `https://${BASE_URL}/${url}&key=${YOUTUBE_API_KEY}`
  );

  return await response.json();
};

export const getCommonVideos = async (url) => {
  try {
    const isDev = process.env.DEVELOPMENT;
    const data = isDev ? videoTestData : await fetchVideos(url);

    if (data?.error) {
      console.log("youtube API error", data.error);
      return [];
    }

    return data.items.map((item) => {
      const id = item.id?.videoId || item.id;
      return {
        title: item.snippet.title,
        imgUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        id,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        statistics: item.statistics ? item.statistics : { viewCount: 0 },
      };
    });
  } catch (error) {
    console.log("something went wrong with video library", error);
    return [];
  }
};

export const getVideos = (searchQuery) => {
  const URL = `search?part=snippet&maxResults=25&q=${searchQuery}`;
  return getCommonVideos(URL);
};

export const getPopularVideos = () => {
  const URL =
    "videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=25&regionCode=US";

  return getCommonVideos(URL);
};

export const getYoutubeVideoById = (videoId) => {
  const URL = `videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}`;

  return getCommonVideos(URL);
};

export const getWatchItAgainVideos = async (token, userId) => {
  const videos = await getWatchedVideos(token, userId);

  return videos?.map((video) => {
    return {
      id: video.videoId,
      imgUrl: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
    };
  });
};

export const getMyListVideos = async (token, userId) => {
  const videos = await myListVideos(token, userId);

  return videos?.map((video) => {
    return {
      id: video.videoId,
      imgUrl: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
    };
  });
};
