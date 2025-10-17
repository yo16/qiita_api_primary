import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const token = process.env.QIITA_TOKEN;
const PER_PAGE = 100;


// ほしい情報の型定義
interface QiitaItem {
  title: string;
  url: string;
  page_views_count: number;
  likes_count: number;
  stocks_count: number;
  comments_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}


// 記事を取得する関数
async function fetchQiitaItems(): Promise<QiitaItem[]> {
  const allItems: QiitaItem[] = [];
  let page = 1;

  try {
    // 無限ループで記事を取得
    while (true) {
      // APIを呼び出して、Qiitaの最新記事を取得
      const response = await axios.get("https://qiita.com/api/v2/authenticated_user/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          per_page: PER_PAGE,
          page: page,
        },
      });

      const currentItems = response.data.map((item:any) => ({
        title: item.title,
        url: item.url,
        page_views_count: item.page_views_count,
        likes_count: item.likes_count,
        comments_count: item.comments_count,
        stocks_count: item.stocks_count,
        tags: item.tags.map((tag: any) => tag.name),
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      allItems.push(...currentItems);

      if (response.data.length < PER_PAGE) {
        break;
      }
      page++;
    }
  } catch (error) {
    console.error("API呼び出しエラー:", error);
  }

  console.log(`✅ 合計 ${allItems.length} 件取得完了`);
  return allItems;
}


// CSVファイルに保存する関数
function saveToCSV(items: QiitaItem[]): void {
  // ,でjoinして、それを\nでjoin
  const csv = items.map((item) => (
    [
      item.title,
      item.url,
      item.page_views_count,
      item.likes_count,
      item.comments_count,
      item.stocks_count,
      item.tags.join(","),
      item.created_at,
      item.updated_at,
    ].join(",")
  )).join("\n");

  // ファイルに保存
  fs.writeFileSync("qiita_items.csv", csv);
}


function sortByPageViewsCount(items: QiitaItem[]): QiitaItem[] {
  return items.sort((a, b) => b.page_views_count - a.page_views_count);
}


async function main() {
  const items = await fetchQiitaItems();
  const sortedItems = sortByPageViewsCount(items);
  if (sortedItems) {
    saveToCSV(sortedItems);
    console.log("✅ CSVファイルに保存完了");
  } else {
    console.error("❌ 記事の取得に失敗しました");
  }
}

main();
