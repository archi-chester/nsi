import { Injectable } from "@angular/core";
import { XHRBackend, RequestOptions, Response, Http, RequestOptionsArgs } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";
import {Router} from "@angular/router";
import {Paths} from "../paths/app.paths";
import {NotificationModalControl} from "../app_index/notification_modal/notification.modal.control";
import {INotificationContent} from "../app_index/notification_modal/notification.modal.types";
import {Location} from "@angular/common";
import {SpinnerControl} from "../app_index/spinner/spinner.control";
import {isNullOrUndefined} from "util";
import {TrbdAuthModalControl} from "../pages/lists_pages/list_change_log/trbd_auth_modal/trbd.auth.modal.control";

// глобальный таймаут
export const GLOBAL_TIMEOUT: number = 45000;

@Injectable()
export class HttpInterceptor extends Http {

    private router: Router;
    private modalControl: NotificationModalControl;
    private location: Location;
    private spinner: SpinnerControl;
    private trbdAuthModalControl: TrbdAuthModalControl;
    constructor(backend: XHRBackend, defaultOptions: RequestOptions, router: Router,
                modalControl: NotificationModalControl, location: Location, spinner: SpinnerControl,
                trbdAuthModalControl: TrbdAuthModalControl) {
        super(backend, defaultOptions);
        this.router = router;
        this.modalControl = modalControl;
        this.location = location;
        this.spinner = spinner;
        this.trbdAuthModalControl = trbdAuthModalControl;
    }

    public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        this.spinner.showSpinner();
        return super.get(url, options)
            .timeout(GLOBAL_TIMEOUT)
            .map((res: Response) => {
                this.spinner.hideSpinner();
                return res;
            })
            .catch((error: Response) => {
                this.spinner.hideSpinner();
                this.errorHandling(error, undefined, options);
                return Observable.throw(error);
            });
    }

    public post(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.post(url, options)
            .timeout(GLOBAL_TIMEOUT)
            .catch((error: Response) => {
                this.errorHandling(error, super.post(url, options), options);
                return Observable.throw(error);
            });
    }

    public put(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.put(url, options)
            .timeout(GLOBAL_TIMEOUT)
            .catch((error: Response) => {
                this.errorHandling(error);
                return Observable.throw(error);
            });
    }

    public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.delete(url, options)
            .timeout(GLOBAL_TIMEOUT)
            .catch((error: Response) => {
                this.errorHandling(error);
                return Observable.throw(error);
            });
    }

    // переход к странице логина
    private goToLoginPage(): void {
        // получаем путь, который пытались открыть
        let nextPath: string = this.location.path();
        // проверка, что путь, по которому производится переход не содержит в себе ссылки на логин с параметром next
        //   нужно в случаях, когда было отправлено несколько запросов, при возвращении от первого ошибки с кодом 401
        //   производится переход на login?next=*адрес*, при этом приходит 401 в ответ на следующий запрос и будет
        //   мог быть произведен переход на login?next=login?next=*адрес*, что не является верным
        if (nextPath.indexOf("/" + new Paths().loginPage.path + "?" + new Paths().loginPage.params.next) === -1) {
            // если он начинается со /
            if (nextPath.indexOf("/") === 0) {
                // стираем /
                nextPath = nextPath.slice(1);
            }

            // если путь непустой и это не страница логина
            if (nextPath !== "" && nextPath !== "login") {
                // переходим на страницу логина с параметром next
                this.router.navigate(["/" + new Paths().loginPage.path], { queryParams: {next: nextPath} });
            } else {
                // в других случаях - переходим на страницу логина
                this.router.navigate(["/" + new Paths().loginPage.path]);
            }
        }
    }

    // действие при ошибке
    // errorStatus: number - код ошибки
    // failedRequest?: Observable<Response> - запрос, который упал с ошибкой
    private errorHandling(error: Response, failedRequest?: Observable<Response>, options?: RequestOptionsArgs): void {
        if (error["name" as string] === "TimeoutError") {
            this.showErrorMessageModal("Ошибка соединения с сервером");
        } else {
            switch (error.status) {
                case 401:
                    // если в строке статуса ошибки содержится trbd_auth_error
                    if (error.json().error.indexOf("trbd_auth_error") !== -1) {
                        // вызов обработки 401 в ТРБД
                        this.applyInTrbdErrorHandle(failedRequest, options);
                    } else if (error.json().status === "error") { // если в статусе ошибки написано, что это error
                        // открываем страницу логина в Ласковость
                        this.goToLoginPage();
                    }
                    break;
                case 403:
                    // совершаем переход назад
                    this.location.back();
                    this.showErrorMessageModal("Недостаточно прав для совершения операции!");
                    break;
                case 500:
                    // если пришел блоб
                    if (options && options.responseType === 3) {
                        // выводим модальное окно с ошибкой
                        this.showErrorMessageModal("Произошла ошибка при работе с файлом");
                    } else {
                        // совершаем переход на стартовую страницу
                        this.router.navigate(["/" + new Paths().startPage.path]);
                        // получаем сведения о причине ошибки
                        let errorText: string =
                            (!isNullOrUndefined(error.json()) && !isNullOrUndefined(error.json().reason)) ?
                                error.json().reason : "";
                        // выводим модальное окно с причиной ошибки
                        this.showErrorMessageModal(errorText);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // открытие модального окна с сообщением об ошибке
    // errorText: string - текст сообщения об ошибке
    private showErrorMessageModal(errorText: string): void {
        let modalContent: INotificationContent = {
            buttons: [{
                name: "Закрыть",
            }],
            header: "Ошибка",
            messages: [{
                bold: true,
                text: errorText,
            }],
        };
        this.modalControl.open(modalContent);
    }
}
