import Link from "next/link";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function memoryPage({ memory }) {
  return (
    <div className={styles.main}>
      <Head>
        <title>{memory.title}</title>
        <meta name="description" content={memory.description}></meta>
      </Head>
      <h1>{memory.title}</h1>
      <iframe
        width="560"
        height="315"
        src={memory.youTubeEmbedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <p>{memory.description}</p>

      <Link href="/">
        <a>&larr; back to all videos</a>
      </Link>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { memory } = params;

  const result = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetMemory($slug: String!) {
            memoryCollection(where: {
                slug: $slug
            }, limit: 1) {
                items {
                    title
                    slug
                    youTubeEmbedUrl
                    description
                }
            }
        }
        `,
        variables: {
          slug: memory,
        },
      }),
    }
  );

  if (!result.ok) {
    console.error(result);
    return {};
  }

  const { data } = await result.json();

  const [memoryData] = data.memoryCollection.items;

  return {
    props: {
      memory: memoryData,
    },
  };
}

export async function getStaticPaths() {
  const result = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            memoryCollection {
              items {
                slug
              }
            }
          }
        `,
      }),
    }
  );

  if (!result.ok) {
    console.error(result);
    return {};
  }

  const { data } = await result.json();
  const memorySlugs = data.memoryCollection.items;
  const paths = memorySlugs.map(({ slug }) => {
    return {
      params: { memory: slug }, // because we called the file 'memory' we have to call the params 'memory'
    };
  });
  return {
    paths,
    fallback: false,
  };
}
