import {AfterContentChecked, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from "@angular/core";
import {ITree} from "../nsi.management.types";
import {NsiManagementService} from "../nsi.management.service";
import {NotificationModalControl} from "../../../../app_index/notification_modal/notification.modal.control";
import {INotificationContent} from "../../../../app_index/notification_modal/notification.modal.types";

@Component({
    selector: "writing-card",
    styleUrls: ["./../nsi.management.page.css"],
    templateUrl: "writing.card.html",
})

export class WritingCard implements OnInit, AfterContentChecked {
    //  public
    //  выбранная нода
    public selectedTree: ITree = null;
    //  путь к документу в шапке
    public selectedPath: string = null;
    // массив для дерева документов
    public tree: ITree[] = [];
    // ивент для переданного для поиска тега
    @Output() public searchTextByTagEvent: EventEmitter<string> = new EventEmitter();
    //  ViewChild
    //  ширина шапки карточки
    @ViewChild("pathWidth") public pathWidth: ElementRef;

    //  private
    //  окно уведомлений
    private notificationModal: NotificationModalControl;
    //  сервер  НСИ
    private nsiService: NsiManagementService;

    //  конструктор
    constructor(nsiService: NsiManagementService, notificationModal: NotificationModalControl) {
        //  подключаем сервис НСИ
        this.nsiService = nsiService;
        //  подключаем окно уведомлений
        this.notificationModal = notificationModal;
    }

    //  урезаем путь к узлу до заданного количества символов...
    //  pathNameList - исходная строка для урезки
    //  numSymbols - количество символов для урезания.
    //  возвращаем строку
    public buildCorrectedPath(pathNameList: string[],  numSymbols: number): string {
        //  переменные
        let newPath: string = "";
        let nodeNameList: string[] = [...pathNameList];
        //  формируем строку из массива
        nodeNameList.forEach((pathName: string) => {
            newPath += " \\ " + pathName;
        });
        //  проверяем сколько символов в строке. хватает ретурн, нет, режем массив и дергаем функцию занова
        if (newPath.length > numSymbols) {
            //  не хватило
            //  отшибаем одного родителя
            nodeNameList.splice(-1);
            //  дергаем функцию еще раз, передавая минус один элемент массива
            return newPath = this.buildCorrectedPath(nodeNameList, numSymbols);
        } else {
            //  хватило
            //  возвращаем полученный путь с добавкой имени
            return newPath;
        }
    }

    //  урезаем путь к узлу до заданного количества символов...
    //  pathNameList - исходная строка для урезки
    //  nodeName - имя ноды
    //  возвращаем строку
    public buildSelectedPath(pathNameList: string[], nodeName: string): string {
        //  задаем начальное значение переменной
        let newPath: string = "";
        //  формируем строку из массива
        pathNameList.forEach((pathName: string) => {
            newPath += " \\ " + pathName;
        });
        //  возвращаем путь с именем ноды
        return newPath + " \\ " + nodeName;
    }

    //  обертка под вызов сервиса - удалит все файлы из текущей ноды
    //  nodeId - ИД ноды для удаления файлов
    public callDeleteAllFilesFromNodeService(nodeId: string): void {
        //  проверяем на пустоту
        if (nodeId) {
            //  дергаем дергаем сервис удаления ноды
            this.nsiService.deleteAllFilesFromNode(nodeId);
        }
    }

    //  обертка под вызов сервиса - удалит текущую ноду
    //  fileId - ИД файда для удаления
    public callDeleteFileByIdService(fileId: string): void {
        //  проверяем на пустоту
        if (fileId && this.selectedTree && this.selectedTree.id) {
            //  дергаем дергаем сервис удаления ноды
            this.nsiService.deleteFileById(this.selectedTree.id, fileId);
        }
    }

    //  обертка под вызов сервиса - удалит текущую ноду
    public callUpdateNodeService(): void {
        //  проверяем на пустоту
        if (this.selectedTree) {
            //  дергаем дергаем сервис изменения ноды
            this.nsiService.updateSelectedTree(this.selectedTree);
            //  сбрасываем флаг изменения карточки
            this.selectedTree.changed = undefined;
        }
    }

    //  Получаю текст для имени новой ноды
    //  target -  указанного инпута
    public  changeTextForName(target: HTMLInputElement): void {
        // присваиваю текст внутренней переменной (проверяем, что значение не пустое и его нет в массиве)
        if (target && target.value.trim().length > 0) {
            this.selectedTree.name = target.value.trim();
            //  меняем бит изменения карточки
            this.selectedTree.changed = true;
        }
    }

    //  изменить теги
    //  target -  указанного инпута
    public  changeTextForTags(target: HTMLInputElement): void {
        // присваиваю текст внутренней переменной (проверяем, что значение не пустое и его нет в массиве)
        if (target && this.selectedTree.tags.indexOf(target.value) === -1
            && target.value.trim().length !== 0) {
                this.selectedTree.tags.push(target.value.trim());
                //  сортируем
                this.selectedTree.tags.sort();
                //  обнуляем поле
                target.value = "";
                //  меняем бит изменения карточки
                this.selectedTree.changed = true;
        }
    }

    //  скачиваем все файлы в ноде
    //  nodeId - ид ноды,
    //  nodeName - имя ноды
    public downloadAllFilesByNodeId(nodeId: string, nodeName: string): void {
        //  передаем управление сервису
        this.nsiService.downloadAllFilesByNodeId(nodeId, nodeName);

    }

    //  скачиваем файл в ноде
    //  fileId - ид файла,
    //  fileName - имя файла
    public downloadFileById(fileId: string, fileName: string): void {
        //  передаем управление сервису
        this.nsiService.downloadFileById(fileId, fileName);

    }

    //  удаляем все файлы в ноде
    //  nodeId - ид ноды
    //  nodeName - имя ноды
    public deleteAllFilesFromNode(nodeId: string, nodeName: string): void {
        //  сохраняем карточку перед изменениями
        this.updateNode();
        //  выводим окно с подтверждением
        this.showModalDeleteAllFilesFromNode(nodeId, nodeName);
    }

    //  удаляем файл в ноде файл в ноде
    //  fileId - ид файла
    //  fileName - имя файла
    public deleteFileById(fileId: string, fileName: string): void {
        //  сохраняем карточку перед изменениями
        this.updateNode();
        //  выводим окно с подтверждением
        this.showModalDeleteFileById(fileId, fileName);
    }

    //  удаление существующей ноды
    public deleteNode(): void {
        //  дергаем сервис для вывода окна с подтверждением
        this.nsiService.showModalDeleteNode(this.selectedTree, this.tree);
    }

    //  изменение тэга для поиска
    //  textForSearch - текст тэга для поиска
    public changeTextForSearch(textForSearch: string): void {
        //  меняем текст для поиска
        this.nsiService.changeTextForSearch(textForSearch);
        //  меняем фильтр для поиска
        this.nsiService.setFilter(textForSearch);
        //  меняем бит режима поиска
        this.nsiService.changeSearchingBit(true);
        //  обновляем карточку
        this.nsiService.getTree();
    }

    //  после отрисовки компонентов
    public ngAfterContentChecked(): void {
        //  проверяем есть ли выбор
        if (this.selectedTree) {
            //  задаем начальные значения
            //  количество символов в строке (из расчета половина высоты строки - буква)
            let maxSymbols: number;
            maxSymbols = this.pathWidth.nativeElement.clientWidth * 2 / this.pathWidth.nativeElement.clientHeight;
            //  оставлена для отладки
            //  количество символов в ноде
            // let numNodeNameSymbols: number = this.selectedTree.name.length;
            //  делаем копию массива
            let pathList: string[] = [...this.selectedTree.parentsNameList];
            //  убираем из списка саму ноду
            pathList.splice(-1);
            //  оставлена на случай отладки
            // if (this.selectedTree.parentsPath.length < maxSymbols - numNodeNameSymbols) {
            //  проверяем хватает ли длины, да - возвращаем текст, нет - режем
            if (this.selectedTree.parentsPath.length < maxSymbols - 3) {
                this.selectedPath = this.buildSelectedPath(pathList, this.selectedTree.name);
            } else {
                //  убираем из массива один элемент
                pathList.splice(-1);
                //  передаем список без последнего элемента
                this.selectedPath = this.buildCorrectedPath(pathList, maxSymbols - 3) +
                    " \\ ... \\ " + this.selectedTree.name;
            }
        } else {
            //    селекта нет
            this.selectedPath = null;
        }
    }

    //  инитор
    public ngOnInit(): void {
        //  изменяем selectedTree
        this.nsiService.castSelectedTree.subscribe((selectedNode: ITree) => this.selectedTree = selectedNode);
        //  организуем подписку на tree
        this.nsiService.castTree.subscribe((tree: ITree[]) => {
            //  проверяем наличие данных
            if (tree) {
                // текущее дерево
                this.tree = tree;
            }
        });
    }

    //  браузер подгрузил файл
    //  target -  указанного инпута
    public onFilePreloaded(target: HTMLInputElement): void {
        //  проверяем не передали ли пустой файл (при отмене после диалогового окна)
        if (target && target.files && target.files.length > 0) {
            //  помечаем файл в запись
            this.selectedTree.isLoadingFile = true;
            //  сохраняем карточку перед изменениями
            this.updateNode();
            //  дергаем сервис аплоада
            this.nsiService.uploadFile(this.selectedTree.id, target.files);
        }
        //  изменяем таргет (чтобы отрабатывал повторный выбор файла)
        target.value  = "";
    }

    //  открываем файл в программе по умолчанию
    //  fileId - ид файла,
    //  fileName - имя файла
    public openFileInDefaultProgram(fileId: string, fileName: string): void {
        //  передаем управление сервису
        this.nsiService.openFileById(fileId, fileName);
    }

    //  удаляем тэг из списка
    //  tag - текст тега
    public removeTagFromTaglist(tag: string): void {
        //  проверяем наличие
        if (this.selectedTree && this.selectedTree.tags) {
            //  создаем новый массив без элемента
            this.selectedTree.tags  = this.selectedTree.tags
                .filter((singleTag: string) => {
                    return (singleTag !== tag);
                });
            //  меняем бит изменения карточки
            this.selectedTree.changed = true;
        }
    }

    //  откат выбранной ноды
    //  target -  указанного инпута
    public rollbackNode(target: HTMLInputElement): void {
        //  выбранная нода
        this.nsiService.getTreeNode(this.selectedTree.id);
        //  очищаем строку с тегом
        target.value = "";
    }

    //  помечаем карточку, как измененную
    //  isChanged - бит изменения
    public setChangedBit(isChanged: boolean): void {
        //  меняем бит
        this.selectedTree.changed = isChanged;
        //  отправляем карточку в публикацию
        this.nsiService.changeSelectedTree(this.tree, this.selectedTree);
    }

    //  модальные окна
    //  выводим диалог удаления всех файлов ноды
    //  nodeId - ИД файла для удаления
    //  nodeName - название файла для удаления
    public showModalDeleteAllFilesFromNode(nodeId: string, nodeName: string): void {
        let modalContent: INotificationContent   = {
            buttons: [
                {
                    action: this.callDeleteAllFilesFromNodeService.bind(this, nodeId),
                    class: "btn-danger",
                    name: "Удалить",
                },
                {
                    class: "btn-secondary",
                    name: "Закрыть",
                },
            ],
            header: "Удаление файла",
            messages: [{
                bold: false,
                text: "Вы уверены, что хотите удалить все файлы из карточки '" + nodeName + "'?",
            }],
        };
        //  дергаем окно
        this.notificationModal.open(modalContent);
    }

    //  выводим диалог удаления файла
    //  fileId - ИД файла для удаления
    //  fileName - название файла для удаления
    public showModalDeleteFileById(fileId: string, fileName: string): void {
        let modalContent: INotificationContent   = {
            buttons: [
                {
                    action: this.callDeleteFileByIdService.bind(this, fileId),
                    class: "btn-danger",
                    name: "Удалить",
                },
                {
                    class: "btn-secondary",
                    name: "Закрыть",
                },
            ],
            header: "Удаление файла",
            messages: [{
                bold: false,
                text: "Вы уверены, что хотите удалить файл " + fileName + "?",
            }],
        };
        //  дергаем окно
        this.notificationModal.open(modalContent);
    }

    //  снять бит изменения карточки
    public unsetChangeableBit(): void {
        //  дергаем сервис
        this.nsiService.changeChangeableBit(false);
    }

    //  обновление трея с сервера
    public updateNode(): void {
        //  выводим окно с подтверждением изменения
        this.callUpdateNodeService();
    }
}
