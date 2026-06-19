import { XMLParser } from "fast-xml-parser";

const NAVER_BLOG_ID = "apkhst7";
const RSS_URL = `https://rss.blog.naver.com/${NAVER_BLOG_ID}.xml`;
export const revalidate = 3600;

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function getPostSlug(link = "") {
  const match = link.match(/\/(\d+)(?:\?|$)/);
  return match ? match[1] : null;
}

async function getPosts() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];
    return items.map((item) => {
      const link = item.link ?? "#";
      const slug = getPostSlug(link);
      return {
        title: typeof item.title === "string" ? item.title : item.title?.["#text"] ?? "(ì ëª© ìì)",
        link,
        slug,
        content: typeof item.description === "string" ? item.description : item.description?.["#text"] ?? "",
        pubDate: item.pubDate ?? "",
      };
    });
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}>ë¸ë¡ê·¸ í¬ì¤í¸ ëª©ë¡</h1>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post, i) => (
          <li key={i} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid #eee" }}>
            <a
              href={post.slug ? `/posts/${post.slug}` : post.link}
              {...(post.slug ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              style={{ color: "#03c75a", textDecoration: "none", fontSize: 17, fontWeight: 600 }}
            >
              {post.title}
            </a>
            {post.pubDate && (
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#999" }}>{post.pubDate}</p>
            )}
            {post.content && (
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                {stripHtml(post.content).slice(0, 120)}{stripHtml(post.content).length > 120 ? "â¦" : ""}
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
