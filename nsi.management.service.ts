import {Injectable} from "@angular/core";
import {ServerDataService} from "../../../work_with_server/server.data.service";
import {NavbarSettings} from "../../../app_index/navbar/navbar.settings";
import {NotificationModalControl} from "../../../app_index/notification_modal/notification.modal.control";
import {BehaviorSubject} from "rxjs/Rx";
import {Observable} from "rxjs/Observable";
import {ITree, ITreeCounts, ITreePackage} from "./nsi.management.types";
import {Response} from "@angular/http";
import {INotificationContent} from "../../../app_index/notification_modal/notification.modal.types";

@Injectable()
export class NsiManagementService {
    //  public
    //  каст бита изменяемости карточки
    public castIsChangeable: Observable<boolean>;
    //  каст бита режима поиска
    public castIsSearching: Observable<boolean>;
    //  каст выбранной ноды
    public castSelectedTree: Observable<ITree>;
    //  каст текста для поиска
    public castTextForSearch: Observable<string>;
    //  каст текущего tree
    public castTree: Observable<ITree[]>;
    //  каст высоты карточки с деревом
    public castTreeCardHeight: Observable<number>;
    //  каст cчетчиков
    public castTreeCounts: Observable<ITreeCounts>;
    //  каст текущих автотегов
    public castTreeSuggestions: Observable<string[]>;
    //  каст настроек
    public castSettings: Observable<number>;

    //  private
    //  bs для бита изменяемости карточки
    private isChangeable: BehaviorSubject<boolean>  = new BehaviorSubject<boolean>(null);
    //  bs для бита режима поиска
    private isSearching: BehaviorSubject<boolean>  = new BehaviorSubject<boolean>(null);
    //  bs для выбранной ноды
    private selectedTree: BehaviorSubject<ITree>  = new BehaviorSubject<ITree>(null);
    //  bs для текста для поиска
    private textForSearch: BehaviorSubject<string>  = new BehaviorSubject<string>("");
    //  bs для текущего дерева
    private tree: BehaviorSubject<ITree[]>  = new BehaviorSubject<ITree[]>(null);
    //  bs для высоты карточки с деревом
    private treeCardHeight: BehaviorSubject<number>  = new BehaviorSubject<number>(50);
    //  bs для счетчиков
    private treeCounts: BehaviorSubject<ITreeCounts>  = new BehaviorSubject<ITreeCounts>(null);
    //  bs для текущих тегов
    private treeSuggestions: BehaviorSubject<string[]>  = new BehaviorSubject<string[]>(null);
    //  bs для настроек
    private settings: BehaviorSubject<number>  = new BehaviorSubject<number>(null);
    //  сервис серверных запросов
    private dataService: ServerDataService;
    //  признак отображения листьев
    private isLeaves: boolean = false;
    //  содержание фильтра
    private filterForSearch: string = null;
    //  сервис управления модальным окном
    private notificationModal: NotificationModalControl;

    //  конструктор
    constructor(navBar: NavbarSettings, notificationModal: NotificationModalControl, dataService: ServerDataService) {
        //  подключаем окно уведомлений
        this.notificationModal = notificationModal;
        //  подключаем сервер
        this.dataService = dataService;
        //  привязываем каст и БС для бита изменяемости карточки
        this.castIsChangeable = this.isChangeable.asObservable();
        //  привязываем каст и БС для бита режима поиска
        this.castIsSearching = this.isSearching.asObservable();
        //  привязываем каст и БС для выбранной ноды
        this.castSelectedTree = this.selectedTree.asObservable();
        //  привязываем каст и БС для текста для поиска
        this.castTextForSearch = this.textForSearch.asObservable();
        //  привязываем каст и БС для дерева
        this.castTree = this.tree.asObservable();
        //  привязываем каст и БС для высоты карточки с деревом
        this.castTreeCardHeight = this.treeCardHeight.asObservable();
        //  привязываем каст и БС для счетчиков
        this.castTreeCounts = this.treeCounts.asObservable();
        //  привязываем каст и БС для автотегов
        this.castTreeSuggestions = this.treeSuggestions.asObservable();
        //  привязываем каст и БС для настроек
        this.castSettings = this.settings.asObservable();
        //  инитим пакедж
        this.getTree();
    }

    //  публикуем новую selectedTree
    //  selectedTree - выбранная нода для публикации
    public changeSelectedTree(tree: ITree[], selectedTree: ITree): void {
        //  публикуем новую версию
        this.selectedTree.next(selectedTree);
    }

    //  публикуем новый бит изменяемости карточки
    //  isChangeable - выбранная нода для публикации
    public changeChangeableBit(isChangeable: boolean): void {
        //  публикуем новую версию
        this.isChangeable.next(isChangeable);
    }

    //  публикуем новый бит режима поиска
    //  isSearching - выбранная нода для публикации
    public changeSearchingBit(isSearching: boolean): void {
        //  публикуем новую версию
        this.isSearching.next(isSearching);
    }

    //  публикуем новый текст для поиска
    //  textForSearch - текст для поиска
    public changeTextForSearch(textForSearch: string): void {
        //  публикуем новую версию
        this.textForSearch.next(textForSearch.trim());
    }

    //  свернуть все каталоги
    public compressTree(): void {
       this.dataService.nsiCompressTree()
            .subscribe((result: Response) => {
                //  возврат ошибки, если статус не ОК
                if (this.isResultError(result)) {
                    //  создаем переменную для текста ошибки
                    let textMessage: string;
                    //  проверяем резалт на пустоту
                    result && result.status ? textMessage = String(result.status) : textMessage = "";
                    //  вывод окна
                    this.showModalError("Ошибка при сворачивании дерева",
                        "При сворачивании дерева произошла ошибка сервиса " + textMessage);
                } else {
                    //     запрашиваем актуальные данные карточки
                    this.getTree();
                }
            });
    }

    //  создание новой Ноды
    //  idParentNode - родительская нода
    //  tree - локальная копия дерева
    //  возвращаем ИД новой ноды
    public createNode(idParentNode: string): void {
        this.dataService.nsiCreateNode(idParentNode)
            .subscribe((result: Response) => {
                //  создаем переменную для текста ошибки
                let textMessage: string;
                //  возврат ошибки, если статус не ОК
                if (this.isResultError(result)) {
                    //  проверяем резалт на пустоту
                    result && result.status ? textMessage = String(result.status) : textMessage = "";
                    this.showModalError("Ошибка при создании карточки",
                    "При создании произошла ошибка сервиса " + textMessage);
                }
                // создаем новую ноду
                if (result.json().id && result.json().id.length > 0) {
                    //  меняем режим на изменение
                    this.changeChangeableBit(true);
                    //  подтягиваем новое дерево
                    this.getTree();
                    //  обновляем ноду из него
                    this.getTreeNode(result.json().id);
                } else {
                    //  проверяем резалт на пустоту
                    result && result.status ? textMessage = String(result.status) : textMessage = "";
                    this.showModalError("Ошибка при удалении файла",
                    "При удалении файла произошла ошибка сервиса " + textMessage);
                }
                     });

    }

    //  удаляем файл в ноде файл в ноде
    //  nodeId - ид ноды
    public deleteAllFilesFromNode(nodeId: string): void {
        //  проверяем наличие id
        if (nodeId && nodeId.length > 0) {
            this.dataService.nsiDeleteAllFilesFromNode(nodeId)
                .subscribe((result: Response) => {
                    //  возврат ошибки, если статус не ОК
                    if (this.isResultError(result)) {
                        //  создаем переменную для текста ошибки
                        let textMessage: string;
                        //  проверяем резалт на пустоту
                        result && result.status ? textMessage = String(result.status) : textMessage = "";
                        //  вывод окна
                        this.showModalError("Ошибка при удалении всех файлов из карточки",
                    "При удалении файлов произошла ошибка сервиса " + textMessage);
                    }else {
                        //     запрашиваем актуальные данные карточки
                        this.getTreeNode(nodeId);
                    }
                });
        }
    }

    //  удаляем файл в ноде файл в ноде
    //  nodeId - ид ноды
    //  fileId - ид файла
    public deleteFileById(nodeId: string, fileId: string): void {
        //  проверяем наличие id
        if (fileId && fileId.length > 0) {
            this.dataService.nsiDeleteFileById(fileId)
                .subscribe((result: Response) => {
                    //  возврат ошибки, если статус не ОК
                    if (this.isResultError(result)) {
                        //  создаем переменную для текста ошибки
                        let textMessage: string;
                        //  проверяем резалт на пустоту
                        result && result.status ? textMessage = String(result.status) : textMessage = "";
                        //  вывод окна
                        this.showModalError("Ошибка при удалении файла",
                    "При удалении файла произошла ошибка сервиса " + textMessage);
                    }else {
                        //     запрашиваем актуальные данные карточки
                        this.getTreeNode(nodeId);
                    }
                });
        }
    }

    //  удаляем selectedTree
    //  currentSelectedId - id ноды для удаления
    public deleteSelectedTree(currentSelectedId: string, tree: ITree[]): void {
            //  проверяем наличие id
        if (currentSelectedId && currentSelectedId.length > 0) {
            this.dataService.nsiDeleteNode(currentSelectedId)
                .subscribe((result: Response) => {
                    //  возврат ошибки, если статус не ОК
                    if (this.isResultError(result)) {
                        //  создаем переменную для текста ошибки
                        let textMessage: string;
                        //  проверяем резалт на пустоту
                        result && result.status ? textMessage = String(result.status) : textMessage = "";
                        //  вывод окна
                        this.showModalError("Ошибка при удалении",
                    "При удалении карточки произошла ошибка сервиса " + textMessage);
                    }
                    //  обновляем дерево
                    this.getTree();
                });
            //  меняем выбранную ноду на пустоту
            this.changeSelectedTree(tree, null);
            //  меняем режим на чтение
            this.changeChangeableBit(false);
        }
    }

    //  скачиваем все файлы в ноде
    //  nodeId - ид ноды,
    //  nodeName - имя ноды
    public downloadAllFilesByNodeId(nodeId: string, nodeName: string): void {
        //  проверяем, что не пустая
        if (nodeId && nodeId.length > 0 && nodeName && nodeName.length > 0) {
            this.dataService.nsiDownloadAllFilesByNodeId(nodeId, nodeName)
                .subscribe((result: Response) => {
                    //  возврат ошибки, если статус не ОК
                    if (this.isResultError(result)) {
                        //  вернул ОК?
                        this.showModalError("Ошибка при скачивании файла архива",
                            "При скачивании архива " + nodeName + " произошла ошибка сервиса. ");
                    }
                });
        }
    }

    //  скачиваем файл в ноде
    //  fileId - ид файла
    public downloadFileById(fileId: string, fileName: string): void {
        //  проверяем, что не пустая
        if (fileId && fileId.length > 0 && fileName && fileName.length > 0) {
            this.dataService.nsiDownloadFileById(fileId, fileName)
                .subscribe((result: Response) => {
                    //  возврат ошибки, если статус не ОК
                    if (this.isResultError(result)) {
                        //  вернул ОК?
                        this.showModalError("Ошибка при скачивании файла",
                            "При скачивании файла " + fileName + " произошла ошибка сервиса. " +
                            "Проверьте наличие файла на сервере");
                    }
                });
        }
    }

    //  развернуть все каталоги
    public expandTree(): void {
        this.dataService.nsiExpandTree()
            .subscribe((result: Response) => {
                //  возврат ошибки, если статус не ОК
                if (this.isResultError(result)) {
                    //  создаем переменную для текста ошибки
                    let textMessage: string;
                    //  проверяем резалт на пустоту
                    result && result.status ? textMessage = String(result.status) : textMessage = "";
                    //  вернул ОК?
                    this.showModalError("Ошибка при разворачивании дерева",
                        "При разворачивании дерева произошла ошибка сервиса " + textMessage);
                } else {
                    //     запрашиваем актуальные данные карточки
                    this.getTree();
                }
            });
    }

    //  публикуем новый Tree
    public getTree(): void {
        //  дергаем сервис с фильтром
        this.dataService.nsiGetTreeNode(this.filterForSearch, this.isLeaves)
            .subscribe((packageTree: ITreePackage) => {
                //  публикуем Tree
                this.tree.next(packageTree.tree);
                //  публикуем Tree
                this.treeSuggestions.next(packageTree.suggestions);
                //  публикуем Tree
                this.treeCounts.next(packageTree.counts);
            });
    }

    //  получаем актуальную ноду и передаем ее в селект
    //  idNode - ИД искомой ноды
    public getTreeNode(idNode: string): void {
        //  дергаем сервис с фильтром
        this.dataService.nsiGetTreeNode(this.filterForSearch, this.isLeaves)
            .subscribe((packageTree: ITreePackage) => {
                //  публикуем Tree
                this.tree.next(packageTree.tree);
                //  выбираем ноду
                this.selectNodeById(packageTree.tree, idNode);
                });
    }

    //  проверяем статус ответа сервера
    //  result - ответ сервера
    //  если все хорошо возвращаем true
    public isResultError(result: Response): boolean {
        return result == null || (result.status && result.status !== 200);
    }

    //  загружаем настройки
    public loadSettings(): void {
        //  дергаем сервис
        this.dataService.nsiGetSettings()
            .subscribe((width: number) => {
                //  проверяем не вернули ли 0 - ошибка
                if (width === 0) {
                    //  ставим значение по умолчанию
                    this.settings.next(350);
                } else {
                    //  вернули не ноль
                    this.settings.next(width);
                }
            });
    }

    //  добавляем ноду в локальную копию
    //  tree - текущее дерево для манипуляций
    //  idDeleteNode - id удаляемой ноды
    public localDeleteNodeToTree(tree: ITree[], idDeleteNode: string): ITree[] {
        //  создаем новое дерево
        let newTree: ITree[] = [];
        //  если передаваемое дерево пустое - его и возвращаем
        if (tree) {
            //  перебираем
            tree.forEach((treeNode: ITree) => {
                //  ИД не совпадает
                if (treeNode.id !== idDeleteNode) {
                    //  детей нет
                    if (!treeNode.children) {
                        treeNode.children = this.localDeleteNodeToTree(treeNode.children, idDeleteNode);
                    }
                    newTree.push(treeNode);
                }
            });
        }
        return newTree;
    }

    //  удаляем файл в ноде файл в ноде
    //  fileId - ид файла
    //  fileName - название файла
    public openFileById(fileId: string, fileName: string): void {
        //  проверяем, что не пустая
        if (fileId && fileId.length > 0 && fileName && fileName.length > 0) {
            this.dataService.nsiOpenFileById(fileId, fileName)
                .subscribe((result: Response) => {
                    //  возврат ошибки, если статус не ОК
                    if (this.isResultError(result)) {
                        //  создаем переменную для текста ошибки
                        let textMessage: string;
                        //  проверяем резалт на пустоту
                        result && result.status ? textMessage = String(result.status) : textMessage = "";
                        //  вернул ОК?
                        this.showModalError("Ошибка при скачивании файла",
                    "При скачивании файла произошла ошибка сервиса " + textMessage);
                    }
                });
        }
    }

    //  для проставки бита открытия
    //  tree - текущее дерево для манипуляций
    //  nodeId - id искомой ноды
    public openFolder(tree: ITree[], nodeId: string): void {
        //  перебираем дерево
        if (tree && nodeId) {
            //  перебираем
            tree.forEach((treeNode: ITree) => {
                //  ИД не совпадает
                if (treeNode.id === nodeId) {
                    //  меняем у ноды значение открытия
                    treeNode.isOpened = true;
                    //  сохраняем результат
                    this.updateSelectedTree(treeNode);
                    //  не нашли - проходим деревья
                } else if (!treeNode.children) {
                    this.openFolder(treeNode.children, nodeId);
                }
            });
        }
    }

    //  сохраняем настройки
    //  leftFieldWidth - ширина левой колонки
    public saveSettings(leftFieldWidth: number): void {
        //  дергаем сервис
        this.dataService.nsiSaveSettings(leftFieldWidth).subscribe();
    }

    //  изменяем фильтр поиска
    //  filter - текст для поиска
    public setFilter(filter?: string): void {
        this.filterForSearch = filter ? filter : "";
    }

    //  выбор ноды из списка по ИД
    //  tree - дерево для поиска
    //  idNode - номер искомой ноды
    public selectNodeById(tree: ITree[], idNode: string): void {
    //  перебираем элементы ноды
        //  если существует
        if (tree) {
            //  перебираем
            tree.forEach((treeNode: ITree) => {
                //  ИД совпадает
                if (treeNode.id === idNode) {
                    //  совпало - возвращаем ноду
                    this.selectedTree.next(treeNode);
                    //  детей нет
                } else {
                    //  есть дети
                    if (treeNode.children) {
                        //  проверяем детей
                        this.selectNodeById(treeNode.children, idNode);
                    }
                }
            });
        }
    }

    //  изменяем бит отображения листьев поиска
    //  isLeaves - бит отображения листьев
    public setLeaves(isLeaves?: boolean): void {
        this.isLeaves = isLeaves ? isLeaves : false;
    }

    //  выводим диалог с информациоей об ошибке
    //  textOfHead - текст заголовка ошибки
    //  textOfBody - текст тела ошибки
    public showModalError(textOfHeader: string, textOfBody: string): void {
        let modalContent: INotificationContent   = {
            buttons: [
                {
                    // action: this.errorIO.bind(this),
                    class: "btn-danger",
                    name: "Закрыть",
                },
            ],
            header: textOfHeader,
            messages: [{
                bold: false,
                text: textOfBody,
            }],
        };
        //  дергаем окно
        this.notificationModal.open(modalContent);
    }

    //  изменяем selectedTree
    //  selectedTree - нода для изменения
    public updateSelectedTree(selectedTree: ITree): void {
        //  проверяем наличие ноды
        if (selectedTree) {
            //  дергаем сервис
            this.dataService.nsiUpdateTreeNode(selectedTree)
                .subscribe((result: Response) => {
                    //  возврат ошибки, если статус не ОК
                    if (this.isResultError(result)) {
                        //  создаем переменную для текста ошибки
                        let textMessage: string;
                        //  проверяем резалт на пустоту
                        result && result.status ? textMessage = String(result.status) : textMessage = "";
                        //  вернул то?
                        this.showModalError("Ошибка сохранения изменений",
                        "При сохранении изменений в карточке произошла ошибка сервиса" + textMessage);
                    }
                    //  тянем новую ноду
                    this.getTree();
                });
            //  публикуем новую ноду
            this.selectedTree.next(selectedTree);
        }
    }

    //  выводим диалог удаления ноды
    //  selectedTree - выбранная нода
    //  tree - существующее дерево
    public showModalDeleteNode(selectedTree: ITree, tree: ITree[]): void {
        let modalContent: INotificationContent;
        //  Если передали корректные данные - вернули окно на удаление, если нет - еррорку
        if (selectedTree && selectedTree.name && selectedTree.id && tree) {
            modalContent = {
                buttons: [
                    {
                        action: this.deleteSelectedTree.bind(this, selectedTree.id, tree),
                        class: "btn-danger",
                        name: "Удалить",
                    },
                    {
                        class: "btn-secondary",
                        name: "Закрыть",
                    },
                ],
                header: "Удаление узла",
                messages: [{
                    bold: false,
                    text: "Вы уверены, что хотите удалить узел \"" + selectedTree.name + "\"",
                }],
            };
            //  добавляем текст, если есть потомки
            if (selectedTree.children && selectedTree.children.length > 0) {
                modalContent.messages.push({
                    bold: false,
                    text: ", содержащий вложенные элементы",
                });
            }
            //  добавляем
            modalContent.messages.push({
                bold: false,
                text: "?",
            });
        } else {
            modalContent = {
                buttons: [
                    {
                        class: "btn-danger",
                        name: "Закрыть",
                    },
                ],
                header: "Ошибка",
                messages: [{
                    bold: false,
                    text: "Ошибка ввода данных в функцию",
                }],
            };
        }
        //  дергаем окно
        this.notificationModal.open(modalContent);
    }

    //  загружает файлы на сервер
    //  nodeId - к какой ноде прицепить файл
    //  files - файллист для прицепления
    public uploadFile(nodeId: string, files: FileList): void {
        //  проверка на пустоту
        if (nodeId && nodeId.length > 0 && files) {
            // дергаем сервис аплоада
            this.dataService.nsiUploadFile(nodeId, files)
                .subscribe((result: Response) => {
                    //  возврат ошибки, если статус не ОК
                    if (this.isResultError(result)) {
                        //  создаем переменную для текста ошибки
                        let textMessage: string;
                        //  проверяем резалт на пустоту
                        result && result.status ? textMessage = String(result.status) : textMessage = "";
                        //  вернул Ок
                        this.showModalError("Ошибка при загрузке",
                    "При загрузке файла произошла ошибка сервиса " + textMessage);
                    } else {
                    //     запрашиваем актуальные данные карточки
                        this.getTreeNode(nodeId);
                    }
                 });
        }
    }
}
