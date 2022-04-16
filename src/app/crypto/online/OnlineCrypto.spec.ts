import { anyString, Mock, when, same, mock, instance } from 'omnimock';
import { OnlineCrypto } from './OnlineCrypto';

const theKey = "mykey1234";
const thePin = "1234";
const crypto =`{"iv":"63fznGsDKRJplIj3Y82geg==",
"v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm",
"adata":"","cipher":"aes","salt":"Al7lyhdSOT0=",
"ct":"DXPhskQGZTvBO8XSyq6I"}` ;

let theAjaxReturn = "";
const cryptoPath = './my-custom-crypto-path';

describe('OnlineCryptoTest', () => {
    let ajaxMock: Mock<XMLHttpRequest>;
    let service: OnlineCrypto;
    let createdCallback: () => void;
    let status = 0;
    let readyState = 0;
    (window as any).sjcl = require('./../../../assets/js/sjcl.js');

    beforeEach(() => {
        status = 0;
        readyState = 0;
        ajaxMock = mock(XMLHttpRequest);
        service = new OnlineCrypto(
            cryptoPath,
            () => instance(ajaxMock),
            () => theKey,
            () => theAjaxReturn,
            (ajax, cb) => {
                expect(ajax).toEqual(instance(ajaxMock));
                createdCallback = cb;
            },
            (ajax) => {
                expect(ajax).toEqual(instance(ajaxMock));
                return {status, readyState}
            }
        )
    });
    it('performs online cryptography', async () => {
        when(ajaxMock.send(anyString())).call((json) => {
            const obj = JSON.parse(json as string);
            expect(obj.pin).toEqual(thePin);
            expect(obj.genKey).toEqual(theKey);
        }).once();
        when(ajaxMock.open(same('POST'), same(cryptoPath), same(true))).call((ign1, ign2, ign3) => {
            return;
        }).once();
        theAjaxReturn = theKey;
        const resultPromise = service.encrypt('my data', thePin);
        readyState = XMLHttpRequest.DONE;
        status = 200;
        createdCallback();
        const result = await resultPromise;
        let obj = JSON.parse(result);
        expect(obj.iter).toEqual(10000);
        expect(obj.mode).toEqual('ccm');
    });
    it('performs online cryptography - return 204', async () => {
        when(ajaxMock.send(anyString())).call((json) => {
            const obj = JSON.parse(json as string);
            expect(obj.pin).toEqual(thePin);
            expect(obj.genKey).toEqual(theKey);
        }).once();
        theAjaxReturn = '204';
        when(ajaxMock.open(same('POST'), same(cryptoPath), same(true))).call((ign1, ign2, ign3) => {
            return;
        }).once();
        const resultPromise = service.encrypt('my data', thePin);
        readyState = XMLHttpRequest.DONE;
        status = 204;
        createdCallback();
        const result = await resultPromise;
        expect(result).toEqual('');
    });
    it('performs online decryptography', async () => {
        when(ajaxMock.send(same(undefined))).call((json) => {
            expect(json).toEqual(undefined);
        }).once();
        theAjaxReturn = theKey;
        when(ajaxMock.open(same('GET'), same(`${cryptoPath}?pin=${thePin}`), same(true))).call((ign1, ign2, ign3) => {
            return;
        }).once();
        const resultPromise = service.decrypt(crypto, thePin);
        readyState = XMLHttpRequest.DONE;
        status = 200;
        createdCallback();
        const result = await resultPromise;
        expect(result).toEqual('my data');
    });
    it('reject on errors', async () => {
        when(ajaxMock.send(same(undefined))).call((json) => {
            expect(json).toEqual(undefined);
        }).once();
        theAjaxReturn = 'boo ya';
        when(ajaxMock.open(same('GET'), same(`${cryptoPath}?pin=${thePin}`), same(true))).call((ign1, ign2, ign3) => {
            return;
        }).once();
        const resultPromise = service.decrypt(crypto, thePin);
        readyState = XMLHttpRequest.DONE;
        status = 500;
        createdCallback();
        try {
            const result = await resultPromise;
            fail('expected exception');
        } catch(e) {
            expect((e as Error).message).toEqual('boo ya');
        }
    });
});