import { CryptoImpl } from '../internal/CryptoImpl';
import { Promiser } from 'src/app/util/Promiser';

type XMLHttpRequestBuilder = () => XMLHttpRequest;
type Randomizer = () => string;
type ResponseExtractor = (ajax: XMLHttpRequest) => string;
type CallbackDefiner = (ajax: XMLHttpRequest, cb: () => void) => void;

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
        },
        private callbackDefiner: CallbackDefiner = (ajax, cb) => {
            ajax.onreadystatechange = cb;
        }
    ) {};

    private doHttpRequest(verb: string, path: string, body?: string): Promise<string> {
        const xh = this.ajaxBuilder();
        const promiser = new Promiser<string>();
        xh.open(verb, path, true);
        this.callbackDefiner(xh, () => {
            if(xh.readyState == XMLHttpRequest.DONE) {
                if(xh.status >= 200 && xh.status <= 299) {
                    promiser.resolve(this.responseExtractor(xh));
                } else {
                    promiser.reject(new Error(this.responseExtractor(xh)));
                }
            }
        });
        xh.send(body);
        return promiser.promise;
    }

    async encrypt(data: string, pin: string): Promise<string> {
        const genKey = this.randomizer();
        try{
            let code = await this.doHttpRequest('POST', './api/crypto',JSON.stringify({
                pin,
                genKey
            }));
            if(code === "204") {
                return "";
            }
            return (window as any).sjcl.encrypt(genKey, data);
        } catch(e) {
            throw e;
        }
    }
    async decrypt(data: string, pin: string): Promise<string> {
        try{
            let genKey = await this.doHttpRequest('GET', `./api/crypto?pin=${pin}`);
            return (window as any).sjcl.decrypt(genKey, data);
        } catch(e) {
            throw e;
        }
    }

    
}