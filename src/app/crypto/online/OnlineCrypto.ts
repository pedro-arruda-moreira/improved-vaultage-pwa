import { CryptoImpl } from '../internal/CryptoImpl';

type XMLHttpRequestBuilder = () => XMLHttpRequest;
type Randomizer = () => string;
type ResponseExtractor = (ajax: XMLHttpRequest) => string;

export class OnlineCrypto implements CryptoImpl {

    constructor(
        private ajaxBuilder: XMLHttpRequestBuilder = () => new XMLHttpRequest(),
        private randomizer: Randomizer = () => {
            let genKey = "" + Math.random();
            for(let i = 0; i < 10; i++) {
                genKey += Math.random();
            }
            return genKey;
        },
        private responseExtractor: ResponseExtractor = (ajax) => {
            return ajax.responseText;
        }
    ) {};

    private doSynchronousHttpRequest(verb: string, path: string, body?: string): string {
        const xh = this.ajaxBuilder();
        xh.open(verb, path, false);
        xh.send(body);
        return this.responseExtractor(xh);
    }

    encrypt(data: string, pin: string): string {
        const genKey = this.randomizer();
        let code = this.doSynchronousHttpRequest('POST', './api/crypto',JSON.stringify({
            pin,
            genKey
        }));
        try{
            if(code === "204") {
                return "";
            }
            return (window as any).sjcl.encrypt(genKey, data);
        } catch(e) {
            throw e;
        }
    }
    decrypt(data: string, pin: string): string {
        let genKey = this.doSynchronousHttpRequest('GET', `./api/crypto?pin=${pin}`);
        try{
            return (window as any).sjcl.decrypt(genKey, data);
        } catch(e) {
            throw e;
        }
    }

    
}