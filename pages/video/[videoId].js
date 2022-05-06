import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import { getYoutubeVideoById } from "../../lib/videos";
import NavBar from "../../components/nav/navbar";
import Like from "../../components/icons/like-icon";
import DisLike from "../../components/icons/dislike-icon";

import cls from "classnames";

import styles from "../../styles/Video.module.css";

Modal.setAppElement("#__next");

export async function getStaticProps(context) {
  const { videoId } = context.params;
  const videoArray = await getYoutubeVideoById(videoId);

  return {
    props: {
      video: videoArray.length > 0 ? videoArray[0] : {},
    },

    revalidate: 10,
  };
}

export async function getStaticPaths() {
  const listOfVideos = ["mYfJxlgR2jw", "4zH5iYM4wJo", "KCPEHsAViiQ"];

  const paths = listOfVideos.map((videoId) => ({
    params: { videoId },
  }));

  return { paths, fallback: "blocking" };
}

const Video = ({ video }) => {
  const router = useRouter();
  const videoId = router.query.videoId;

  const [toggleLike, setToggleLike] = useState(false);
  const [toggleDislike, setToggleDislike] = useState(false);

  const {
    title,
    publishTime,
    description,
    channelTitle,
    statistics: { viewCount },
  } = video;

  useEffect(() => {
    const getRatings = async () => {
      const response = await fetch(`/api/stats?videoId=${videoId}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        const favourited = data[0].favourited;
        if (favourited === 1) {
          setToggleLike(true);
        }
        if (favourited === 0) {
          setToggleDislike(true);
        }
      } else {
        return "";
      }
    };
    getRatings();
  }, []);

  const runRatingService = async (favourited) => {
    return await fetch("/api/stats", {
      method: "POST",
      body: JSON.stringify({
        videoId,
        favourited,
      }),
      headers: {
        "content-type": "application/json",
      },
    });
  };

  const handleToggleLike = async () => {
    const val = !toggleLike;
    setToggleLike(val);
    setToggleDislike(false);

    const favourited = val ? 1 : 0;

    const response = await runRatingService(favourited);
  };

  const handleToggleDislike = async () => {
    const val = !toggleDislike;
    setToggleDislike(val);
    setToggleLike(false);

    const favourited = val ? 0 : 1;

    const response = await runRatingService(favourited);
  };
  return (
    <div className={styles.container}>
      <NavBar />
      <Modal
        isOpen={true}
        onRequestClose={() => router.back()}
        overlayClassName={styles.overlay}
        contentLabel="Watch the video"
        className={styles.modal}
      >
        <iframe
          className={styles.videoPlayer}
          id="ytplayer"
          type="text/html"
          width="100%"
          height="360"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&origin=http://example.com`}
          frameBorder="0"
        ></iframe>
        <div className={styles.likeDislikeBtnWrapper}>
          <div className={styles.likeBtnWrapper}>
            <button onClick={handleToggleLike}>
              <div className={styles.btnWrapper}>
                <Like selected={toggleLike} />
              </div>
            </button>
          </div>
          <button onClick={handleToggleDislike}>
            <div className={styles.btnWrapper}>
              <DisLike selected={toggleDislike} />
            </div>
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalBodyContent}>
            <div className={styles.col1}>
              <p className={styles.publishTime}>{publishTime}</p>
              <p className={styles.title}>{title}</p>
              <p className={styles.description}>{description}</p>
            </div>
            <div className={styles.col2}>
              <p className={cls(styles.subTextWrapper, styles.subText)}>
                <span className={styles.textColor}>Cast: </span>
                <span className={styles.channelTitle}>{channelTitle}</span>
              </p>
              <p className={cls(styles.subTextWrapper, styles.subText)}>
                <span className={styles.textColor}>View Count : </span>
                <span className={styles.channelTitle}>{viewCount}</span>
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Video;
