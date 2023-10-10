import * as nano from 'nanoid'

export class ShortUrl {
    private client;
    private domain: string;
    // @ts-ignore
    constructor(client, domain: string) {
        this.client = client
        debugger;
        this.domain = domain;
    }

    makeShortUrl(originUrl: string) {
        try{
            const id = nano.nanoid();
            this.client.set(id, originUrl, 'EX', 86400);
            return `https://${this.domain}/${id}`
        }catch (e) {
            return new Error('ERROR');
        }
    }
}