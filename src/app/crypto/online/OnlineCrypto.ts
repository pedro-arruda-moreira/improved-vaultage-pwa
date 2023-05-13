import { CryptoImpl, DEFAULT_SJCL_PARAMS } from '../internal/CryptoImpl';
import { Promiser } from 'src/app/util/Promiser';
import { sjcl_encrypt, sjcl_decrypt } from 'improved-vaultage-client';

type XMLHttpRequestBuilder = () => XMLHttpRequest;
type Randomizer = () => string;
type ResponseExtractor = (ajax: XMLHttpRequest) => string;
type CallbackDefiner = (ajax: XMLHttpRequest, cb: () => void) => void;
interface AjaxResult {
    status: number;
    readyState: number;
}
type ResultExtractor = (ajax: XMLHttpRequest) => AjaxResult;

export class OnlineCrypto implements CryptoImpl {

    constructor(
        private apiPath: string,
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
        },
        private resultExtractor: ResultExtractor = (ajax) => {
            return {
                readyState: ajax.readyState,
                status: ajax.status
            }
        }
    ) {};

    private doHttpRequest(verb: string, path: string, body?: string): Promise<string> {
        const xh = this.ajaxBuilder();
        const promiser = new Promiser<string>();
        xh.open(verb, path, true);
        this.callbackDefiner(xh, () => {
            const result = this.resultExtractor(xh);
            if(result.readyState == XMLHttpRequest.DONE) {
                if(result.status >= 200 && result.status <= 299) {
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
            let code = await this.doHttpRequest('POST', this.apiPath,JSON.stringify({
                pin,
                genKey
            }));
            if(code === "204") {
                return "";
            }
            return sjcl_encrypt(genKey, data, DEFAULT_SJCL_PARAMS);
        } catch(e) {
            throw e;
        }
    }
    async decrypt(data: string, pin: string): Promise<string> {
        try{
            let genKey = await this.doHttpRequest('GET', `${this.apiPath}?pin=${pin}`);
            return sjcl_decrypt(genKey, data);
        } catch(e) {
            throw e;
        }
    }

    
}