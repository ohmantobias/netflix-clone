import Card from "./card";
import styles from "./section-cards.module.css";
import Link from "next/link";
import cls from "classnames";

const SectionCards = (props) => {
  const { title, videos = [], size, shouldWrap = false, shouldScale } = props;
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={cls(styles.cardWrapper, shouldWrap && styles.wrap)}>
        {videos.map((video, index) => {
          return (
            <Link key={index} href={`/video/${video.id}`}>
              <a>
                <Card
                  key={index}
                  id={index}
                  imgUrl={video.imgUrl}
                  size={size}
                  shouldScale={shouldScale}
                />
              </a>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SectionCards;
