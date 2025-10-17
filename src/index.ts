import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.QIITA_TOKEN;

async function getQiitaItems() {
  try {
    const response = await axios.get("https://qiita.com/api/v2/items", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        per_page: 5, // 取得件数
      },
    });

    console.log("Qiita最新記事:");
    response.data.forEach((item: any) => {
      console.log(`- ${item.title} (${item.url})`);
    });
  } catch (error) {
    console.error("API呼び出しエラー:", error);
  }
}

getQiitaItems();
