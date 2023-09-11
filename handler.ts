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

async function getNews(keyword: string, start: number) {
    return await axios({
        method: 'get',
        url: 'https://openapi.naver.com/v1/search/news.json',
        params: {
            query: keyword,
            display: 100,
            start,
            sort: 'date'
        },
        headers: {
            "X-Naver-Client-Id" : process.env.clientId,
            "X-Naver-Client-Secret": process.env.secret
        }
    })
}


export const news: Handler = async (event: any, context: Context) => {
    console.log('call news');
    const queryStringParameters = event.queryStringParameters;
    const startDate = dayjs(queryStringParameters['startDate']);
    // const endDate = dayjs(event.pathParameters.endDate);
    try{
        let arr = [];
        let idx = 1;
        const response = await getNews('관세청', idx);
        for (let i = 0; i < response.data.items.length; i++) {
            const t = dayjs(response.data.items[i].pubDate, {format: formatString}).format('YYYY-MM-DD');
            if (dayjs(t).isBetween(startDate, startDate, null, '[]')) {
                arr.push(response.data.items[i]);
            } else {
                break;
            }
        }


        // @ts-ignore
        return template(startDate.format('YYYY-MM-DD'), arr);
    }catch (e) {
        console.log(e)
        return null;
    }
}

function template(toDate: string, arr: []) :String {
    let str = `※ ${toDate} 주요기사(인천세관 홍보계)
` + '\n' + '\n' +
        '- 관세청 및 세관 -';
    arr.forEach(v=> {
        str += v['title'] + '\n';
        str += v['link'] + '\n';
        str +=  '\n';
    })
    return str;
}