import { anyString, Mock, when, same } from 'omnimock';
import { getMock } from 'ng-vacuum';
import { OnlineCrypto } from './OnlineCrypto';

const theKey = "mykey1234";
const thePin = "1234";
const crypto =`{"iv":"63fznGsDKRJplIj3Y82geg==",
"v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm",
"adata":"","cipher":"aes","salt":"Al7lyhdSOT0=",
"ct":"DXPhskQGZTvBO8XSyq6I"}` ;

let theAjaxReturn = "";

describe('OnlineCryptoTest', () => {
    let ajaxMock: Mock<XMLHttpRequest>;
    let service: OnlineCrypto;
    let createdCallback: () => void;
    (window as any).sjcl = require('./../../../assets/js/sjcl.js');

    beforeEach(() => {
        ajaxMock = getMock(XMLHttpRequest);
        service = new OnlineCrypto(
            () => (ajaxMock as unknown) as XMLHttpRequest,
            () => theKey,
            () => theAjaxReturn,
            (ajax, cb) => {
                expect(ajax).toEqual((ajaxMock as unknown) as XMLHttpRequest);
                createdCallback = cb;
            }
        )
    });
    it('performs online cryptography', async () => {
        when(ajaxMock.send(anyString())).call((json) => {
            const obj = JSON.parse(json as string);
            expect(obj.pin).toEqual(thePin);
            expect(obj.genKey).toEqual(theKey);
        });
        when(ajaxMock.open(same('POST'), same('./api/crypto'), same(true))).call((ign1, ign2, ign3) => {
            return;
        });
        theAjaxReturn = theKey;
        const result = await service.encrypt('my data', thePin);
        let obj = JSON.parse(result);
        expect(obj.iter).toEqual(10000);
        expect(obj.mode).toEqual('ccm');
    });
    it('performs online cryptography - return 204', async () => {
        when(ajaxMock.send(anyString())).call((json) => {
            const obj = JSON.parse(json as string);
            expect(obj.pin).toEqual(thePin);
            expect(obj.genKey).toEqual(theKey);
        });
        theAjaxReturn = '204';
        when(ajaxMock.open(same('POST'), same('./api/crypto'), same(true))).call((ign1, ign2, ign3) => {
            return;
        });
        const result = await service.encrypt('my data', thePin);
        expect(result).toEqual('');
    });
    it('performs online decryptography', async () => {
        when(ajaxMock.send(anyString())).call((json) => {
            expect(json).toEqual(undefined);
        });
        theAjaxReturn = theKey;
        when(ajaxMock.open(same('GET'), same(`./api/crypto?pin=${thePin}`), same(true))).call((ign1, ign2, ign3) => {
            return;
        });
        const result = await service.decrypt(crypto, thePin);
        expect(result).toEqual('my data');
    });
});