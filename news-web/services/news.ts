import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
const formatString = "ddd, DD MMM YYYY HH:mm:ss Z";

export class News {
    private async getNews(keyword: string, idx: number) {
        return await axios({
            method: 'get',
            url: 'https://openapi.naver.com/v1/search/news.json',
            params: {
                query: keyword,
                display: 100,
                start: idx,
                sort: 'date'
            },
            headers: {
                "X-Naver-Client-Id": process.env.NAVER_NEWS_CLIENT_ID,
                "X-Naver-Client-Secret": process.env.NAVER_NEWS_SECRET_KEY
            }
        })
    }

    async news(keyword: string, previousDate: number) {
        console.log('call news');
        const toDate = dayjs()
        const previous = toDate.subtract(Number(previousDate), 'day');
        // const endDate = dayjs(event.pathParameters.endDate);
        try {
            let arr = [];
            let idx = 1

            while (true) {
                let response = await this.getNews(keyword, idx);
                for (let i = 0; i < response.data.items.length; i++) {
                    const t = dayjs(response.data.items[i].pubDate, {format: formatString}).format('YYYY-MM-DD');
                    if (dayjs(t).isBetween(toDate, previous, null, '[]')) {
                        // response.data.items[i]['link'] = await shortUrl(response.data.items[i]['originallink']);
                        arr.push(response.data.items[i]);
                    } else {
                        idx = -1;
                        break;
                    }
                }
                if (idx === -1) break;
                idx += 100;
            }

            // @ts-ignore
            return arr;
        } catch (e) {
            console.log(e)
            return "server error";
        }
    }
}

