import NavBar from "../../components/nav/navbar";
import Head from "next/head";
import SectionCards from "../../components/card/section-cards";
import { getMyListVideos } from "../../lib/videos";
import { verifyToken } from "../../lib/utils";

import styles from "../../styles/MyList.module.css";

export async function getServerSideProps(context) {
  const token = context.req ? context.req?.cookies.token : null;

  const userId = await verifyToken(token);

  const videos = await getMyListVideos(token, userId);
  return {
    props: {
      myListVideos: videos,
    },
  };
}

const MyList = ({ myListVideos }) => {
  return (
    <div>
      <Head>
        <title>My List</title>
      </Head>
      <main className={styles.main}>
        <NavBar />
        <div className={styles.sectionWrapper}>
          <SectionCards
            title="My List"
            videos={myListVideos}
            size="small"
            shouldWrap
            shouldScale={false}
          />
        </div>
      </main>
    </div>
  );
};

export default MyList;
