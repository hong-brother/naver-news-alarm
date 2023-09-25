import { Handler, Context } from "aws-lambda";
import axios from "axios";
import * as dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import * as isBetween from "dayjs/plugin/isBetween";
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
const formatString = "ddd, DD MMM YYYY HH:mm:ss Z";

export const check: Handler = async (event: any, context: Context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello lambda!",
        }),
    };
};

async function getNews(keyword: string, idx: number) {
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
            "X-Naver-Client-Id" : process.env.NAVER_NEWS_CLIENT_ID,
            "X-Naver-Client-Secret": process.env.NAVER_NEWS_SECRET_KEY
        }
    })
}

// @ts-ignore
async function shortUrl(urlString: string) : Promise<string> {
    return await axios({
        method: 'get',
        url: 'https://openapi.naver.com/v1/util/shorturl',
        params: {
          url: urlString
        },
        headers: {
            "X-Naver-Client-Id" : process.env.NAVER_URL_CLIENT_ID,
            "X-Naver-Client-Secret": process.env.NAVER_URL_SECRET_KEY
        }
    }).then(v=> {
        if (v.data.code === "200") {
            return v.data.result.url;
        } else {
            return "";
        }
    });
}


export const news: Handler = async (event: any, context: Context) => {
    console.log('call news');
    const queryStringParameters = event.queryStringParameters;
    const keyword = event.queryStringParameters['keyword'];
    const previousDate = Number(queryStringParameters['previousDate']);
    const toDate = dayjs()
    const previous = toDate.subtract(previousDate, 'day');
    // const endDate = dayjs(event.pathParameters.endDate);
    try{
        let arr = [];
        let idx = 1

        while(true) {
            let response = await getNews(keyword, idx);
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
        return template(keyword, toDate.format('YYYY-MM-DD'), arr);
    }catch (e) {
        console.log(e)
        return "server error";
    }
}

function template(keyword: string, period: string, arr: []) :String {
    let str = `※ ${period} 주요기사(인천세관 홍보계)
` + '\n' + '\n' +
        `- ${keyword} -`;
    arr.forEach(v=> {
        str += v['title'] + '\n';
        str += v['link'] + '\n';
        str +=  '\n';
    })
    return str;
}