import {Headers, RequestOptions} from "@angular/http";

export class HttpOptions extends RequestOptions {
    constructor() {
        let header: Headers = new Headers();
        header.append("x-api-key", "123");
        super({headers: header});
    }
}
