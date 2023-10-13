import * as nano from 'nanoid'

export class ShortUrl {
    private client;
    private domain: string;
    // @ts-ignore
    constructor(client, domain: string) {
        this.client = client
        this.domain = domain;
    }

    makeShortUrl(originUrl: string) {
        try{
            const id = nano.nanoid();
            this.client.set(id, originUrl, 'EX', 86400); // 하루 TTL
            return `https://www.${this.domain}/u?id=${id}`
        } catch (e) {
            throw new Error('error')
        }
    }

    async findUrlById(id: string): Promise<string> {
        try{
            return await this.client.get(id);
        } catch (e) {
            throw new Error('error')
        }
    }
}