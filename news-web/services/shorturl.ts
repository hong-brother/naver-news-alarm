import { createClient } from 'redis';
import * as nanoid from 'nanoid'
export class Shorturl {
    private client;
    private domain: string;
    constructor(url: string, domain: string) {
        this.client = createClient({
            url
        });
        this.domain = domain;
    }

    makeShortUrl(originUrl: string) {
        try{
            // const id = nanoid.nanoid();
            return `https://${this.domain}/12`
        }catch (e) {
            return new Error('ERROR');
        }
    }
}