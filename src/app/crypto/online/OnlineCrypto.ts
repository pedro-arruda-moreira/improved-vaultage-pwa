import { HttpClient } from '@angular/common/http';
import { CryptoImpl } from '../internal/CryptoImpl';
import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class OnlineCrypto implements CryptoImpl {

    private doSynchronousHttpRequest(verb: string, path: string, body?: string): string {
        const xh = new XMLHttpRequest();
        xh.open(verb, path, false);
        xh.send(body);
        return xh.responseText;
    }

    encrypt(data: string, pin: string): string {
        let genKey = "" + Math.random();
        for(let i = 0; i < 10; i++) {
            genKey += Math.random();
        }
        let code = this.doSynchronousHttpRequest('POST', './api/crypto',JSON.stringify({
            pin,
            genKey
        }));
        try{
            if(code == "204") {
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