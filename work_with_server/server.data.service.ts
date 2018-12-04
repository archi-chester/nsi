
@Injectable()

// экспорт компонента запросов
export class ServerDataService {
    public http: Http;
    public convGetdataComp: ConvertGetdataComponent = new ConvertGetdataComponent();
    public convPostdataComp: ConvertPostdataComponent = new ConvertPostdataComponent();

    constructor(http: Http) {
        this.http = http;
    }

    //  НСИ
    //  свернуть все папки в ноде
    //  возвращаем респонс в виде статуса
    public nsiCompressTree(): Observable<Response> {
        //   отправляем запрос
        return this.http.put(baseURL + proxyUrl + nsiUrl + nsiCompressTreeUrl, null)
            .map((res: Response) => {
                return res;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    //  добавление нового узла
    //  nodeId - id родителя строкой
    //  возвращает id созданной ноды строкой
    public nsiCreateNode(nodeId?: string): Observable<Response> {
        //  проверяем пустой ид или нет
        if (isNullOrUndefined(nodeId)) {
            nodeId = "";
        }
        return this.http.post(baseURL + proxyUrl + nsiUrl + nsiAddNodeInTreeUrl + nodeId, "")
            .map((res: Response) => {
                return res;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    //  удаление узла
    //  nodeId - ид ноды для удаления
    //  возвращаем код ответа с сервера
    public nsiDeleteNode(nodeId: string): Observable<Response> {
        //  если родительская нода не задана - передаем пустую
        return this.http.delete(baseURL + proxyUrl + nsiUrl + nsiDeleteNodeInTreeUrl + nodeId, "")
            .map((res: Response) => {
                return res;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    //  развернуть все папки в ноде
    //  возвращаем респонс в виде статуса
    public nsiExpandTree(): Observable<Response> {
        //  отправляем запрос
        return this.http.put(baseURL + proxyUrl + nsiUrl + nsiExpandTreeUrl, null)
            .map((res: Response) => {
                return res;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    //  загрузка настроек пользователя
    //  возвращаем ширину первого столбца
    public nsiGetSettings(): Observable<number> {
        return this.http.get(baseURL + userSettingsUrl + "?type=nsi_settings")
            .map((res: Response) => {
                //  получаем настройки
                let settings: {
                    settings: {
                        proportion: number},
                    type: string,
                    user: string} = res.json();
                // console.log("Sub:" + String(settings.settings.proportion));
                return settings.settings.proportion;
            })
            //  если не удалось возвращаем 0
            .catch(() => Observable.of(0));
    }

    //  удаление файла
    //  fileId - ид файла для удаления
    //  возвращаем код ответа с сервера
    public nsiDeleteFileById(fileId: string): Observable<Response> {
        //  если родительская нода не задана - передаем пустую
        return this.http.delete(baseURL + proxyUrl + nsiUrl + nsiDeleteFileInTreeUrl + fileId, "")
            .map((res: Response) => {
                return res;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    //  удаление всех файлов из ноды
    //  nodeId - ид ноды для удаления фалов
    //  возвращаем код ответа с сервера
    public nsiDeleteAllFilesFromNode(nodeId: string): Observable<Response> {
        //  если родительская нода не задана - передаем пустую
        return this.http.delete(baseURL + proxyUrl + nsiUrl + nsiDeleteAllFilesFromNodeUrl + nodeId, "")
            .map((res: Response) => {
                return res;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    //  скачиваем все файлы в ноде
    //  nodeId - ид ноды,
    //  nodeName - имя ноды
    public nsiDownloadAllFilesByNodeId(nodeId: string, nodeName: string): Observable<Response> {
        //  если родительская нода не задана - передаем пустую
        return this.http.get(baseURL + proxyUrl + nsiUrl + nsiDownloadAllFilesByNodeIdUrl + nodeId, {responseType: 3})
            .map((res: Response) => {
                //  сохранение файла
                if (res) {
                    this.saveFile(res, nodeName);
                }
                //  возвращаем респонс
                return res;
            })
            //  ошибка
            .catch((res: Response) => Observable.of(res));
    }

    //  получение файла
    //  fileId - ид файла для загрузки
    //  fileName - название файла
    //  возвращаем код ответа с сервера
    public nsiDownloadFileById(fileId: string, fileName: string): Observable<Response> {
        //  если родительская нода не задана - передаем пустую
        return this.http.get(baseURL + proxyUrl + nsiUrl + nsiDownloadFileByIdUrl + fileId, {responseType: 3})
            .map((res: Response) => {
                //  сохранение файла
                if (res) {
                    this.saveFile(res, fileName);
                }
                //  возвращаем респонс
                return res;
            })
            //  ошибка
            .catch((res: Response) => Observable.of(res));
    }

    //  вызываем eval для сохранения и последующего открытия файла
    //  res - ответ от сервера
    //  fileName - переданное локально имя файла
    //  возвращаем тру или нулл
    public nsiOpenLoadedFile(res: Response, fileName: string): boolean {
        //  проверяем, передали ли имя файла
        if (isNullOrUndefined(fileName) || fileName === "") {
            //  получаем имя из контент-диспозишн
            fileName = res.headers.get("Content-Disposition").slice(res.headers.get("Content-Disposition")
                .indexOf("=") + 1);
        }
        //  создаем экземпляр ридера
        let reader: FileReader = new FileReader();
        //  создаем пустая ошибка
        let isSuccess: boolean = true;
        //  прописываем действия при завершении загрузки
        reader.onloadend = function readFile(): void {
            //  перегоняем блоб в base64
            const buf: string = btoa(reader.result);
            //  формируем строку для eval - дергаем две функции - локальное сохранение в /tmp
            //  и последующее открытие
            let evalParams: string = "var fs = require('fs'); " + "fs.writeFile('/tmp/" + fileName + "', '" +
                buf + "', 'base64', function(err) { if(err) { alert('error: ' + err);    }    }); " +
                "require('nw.gui').Shell.openItem('/tmp/" + fileName + "')";
            //  дергаем eval c сохранением файла и последующим открытием
            try {
                //  tslint:disable-next-line
                eval(evalParams);
                //  перехват ошибки
            } catch (e) {
                isSuccess = false;
            }
        };
        //  получаем бинарную строку из файла
        reader.readAsBinaryString(res.blob());
        //  возвращаем истину
        return isSuccess;
    }

    //  загрузка дерева документов
    //  filter - строка поиска
    //  isLeaves - бит для отображения листьев
    //  возвращаем пакедж с деревом и счетчиками
    public nsiGetTreeNode(filter: string, isLeaves: boolean): Observable<ITreePackage> {
        //  переменная для хранения фильтра
        let filterString: string = "";
        //  проверяем, передали ли фильтр
        if (filter !== "" && !isNullOrUndefined(filter)) {
            filterString += "?q=" + filter;
            //    проверяем наличие листьев
            if (isLeaves) {
                filterString += "&full=1";
            }
        }
        return this.http.get(baseURL + proxyUrl + nsiUrl + nsiGetFilteredTreeNodeUrl + filterString)
            .map((res: Response) => {
                return this.convGetdataComp.nsiConvertPackageTreeStoL(res.json());
            });
    }

    //  получение файла
    //  fileId - ид файла для загрузки
    //  fileName - название файла
    //  возвращаем строку с файлом
    public nsiOpenFileById(fileId: string, fileName?: string): Observable<Response> {
        //  если родительская нода не задана - передаем пустую
        return this.http.get(baseURL + proxyUrl + nsiUrl + nsiDownloadFileByIdUrl + fileId, {responseType: 3})
            .map((res: Response) => {
                //  дергаем функцию для эвала
                return this.nsiOpenLoadedFile(res, fileName) ? res : null;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    //  сохранение настроек пользователя
    //  width - ширина первой колонки
    //  возвращаем код ответа !!!! ПЕРЕДЕЛАТЬ НА КОД СЕРВЕРА
    public nsiSaveSettings(width: number): Observable<number> {
        //  формируем структуру настроек
        let settings: IServerNSISettings = {
            settings: {proportion: String(width)},
            type: "nsi_settings",
        };
        //  пока с тем, что хранить не определились - кидаю структуру напрямую
        return this.http.post(baseURL + userSettingsUrl, settings)
            .map(() => {
                return 1; //    возвращаем 1 если все ок
            })
            //  если не удалось возвращаем 0
            .catch(() => Observable.of(0));
    }

    //  аплоад файл
    //  nodeId - идентификатор ноды, куда загружаем файл
    //  files - список файлов для загрузки
    //  возвращаем код ответа с сервера
    public nsiUploadFile(nodeId: string, files: FileList): Observable<Response>  {
        // urlForUpload + selectedTree.id
        // console.log(files);        //  проверяем пустой ид или нет
        if (isNullOrUndefined(nodeId)) {
            nodeId = "";
        }
        //  экземпляр переменной formData
        let formData: FormData = new FormData();
        //  перебираем, идентификатор формы - uploadfile
        Array.from(files).forEach((file: File) => {
            formData.append("uploadfile", file, file.name);
        });
        //  дергаем рекувест
        return this.http.post(baseURL + proxyUrl + nsiUrl + nsiUploadFileInNodeUrl + nodeId, formData)
            .map((res: Response) => {
                return res;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    //  изменение узла
    //  node - нода, которую изменили
    //  возвращаем код ответа с сервера
    public nsiUpdateTreeNode(node: ITree): Observable<Response> {
        let treeNode: IServerTree = this.convPostdataComp.nsiConvertTreeLtoS(node);
        //  если в ноде есть идентификатор
        return this.http.put(baseURL + proxyUrl + nsiUrl + nsiUpdateNodeInTreeUrl + treeNode.id, treeNode)
            .map((res: Response) => {
                return res;
            })
            //  ошибка
            .catch(() => Observable.of(null));
    }

    // открытие диалога сохранения файла с названием
    // res: Response - результат запроса
    // inputName?: string - имя файла, которое пользователь задаёт для сохранения
    private saveFile(res: Response, inputName?: string): boolean {
        // имя из заголовка
        let headerName: string = res.headers.get("Content-Disposition");
        // имя файла для сохранения, если подано принудительное имя - то оно, иначе из заголовка
        let filename: string = !isUndefined(inputName) ? inputName : headerName.slice(headerName.indexOf("=") + 1);
        // вызов сохранения, с передачей будущего файла и его имени
        saveAs(res.blob(), filename);
        return true;
    }
}
