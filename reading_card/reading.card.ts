import {
    AfterContentChecked,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import {ITree} from "../nsi.management.types";
import {NsiManagementService} from "../nsi.management.service";

@Component({
    selector: "reading-card",
    styleUrls: ["./../nsi.management.page.css"],
    templateUrl: "reading.card.html",
})

export class ReadingCard implements OnInit, AfterContentChecked {
    //  public
    //  выбранная нода
    public selectedTree: ITree = null;
    //  путь к документу в шапке
    public selectedPath: string = null;
    // ивент для переданного для поиска тега
    @Output() public searchTextByTagEvent: EventEmitter<string> = new EventEmitter();
    //  ViewChild
    //  ширина шапки карточки
    @ViewChild("pathWidth") public pathWidth: ElementRef;

    //  private
    //  сервер НСИ
    private nsiService: NsiManagementService;

    //  конструктор
    constructor(nsiService: NsiManagementService) {
        //      подключаем сервисы
        this.nsiService = nsiService;
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

    //  изменение тэга для поиска
    //  textForSearch - текст тэга для поиска
    public changeTextForSearch(textForSearch: string): void {
        //  меняем текст для поиска в строке
        this.nsiService.changeTextForSearch(textForSearch);
        //  меняем фильтр для поиска
        this.nsiService.setFilter(textForSearch);
        //  меняем бит режима поиска
        this.nsiService.changeSearchingBit(true);
        //  обновляем карточку
        this.nsiService.getTree();
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

    //  инициализация
    public ngOnInit(): void {
        //  изменяем selectedTree
        this.nsiService.castSelectedTree.subscribe((selectedNode: ITree) => this.selectedTree = selectedNode);
    }

    //  открываем файл в программе по умолчанию
    //  fileId - ид файла,
    //  fileName - имя файла
    public openFileInDefaultProgram(fileId: string, fileName: string): void {
        //  передаем управление сервису
        this.nsiService.openFileById(fileId, fileName);
    }

    //  поставить бит изменения карточки
    public setChangeableBit(): void {
        //  дергаем сервис
        this.nsiService.changeChangeableBit(true);
    }
}
