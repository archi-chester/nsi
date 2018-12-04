import {Component, OnDestroy, OnInit} from "@angular/core";
import {NavbarSettings} from "../../../app_index/navbar/navbar.settings";
import {ITree, ITreeCounts} from "./nsi.management.types";
import {NsiManagementService} from "./nsi.management.service";

@Component({
    styleUrls: ["./nsi.management.page.css"],
    templateUrl: "./nsi.management.page.html",
})

export class NsiManagementPage implements OnInit, OnDestroy {
//
    //  public
    // храним выбранную ноду
    public selectedTree: ITree = null;
    //  автотеги
    public suggestions: string[] = [];
    //  количество отображенных документов
    public docAmount: number = 0;
    //  количество всего документов
    public docFull: number = 0;
    //  количество найденных документов
    public docResults: number = 0;
    //  включен режим изменения ноды
    public isChangeable: boolean = false;
    //  нажат ли бордер
    public isMoving: boolean = false;
    //  включен режим фильтрации ноды
    public isSearching: boolean = false;
    //  бит отображения листьев
    public isShowedLeavesForSearch: boolean = false;
    //  ширина левого окна по умолчанию
    public leftFieldWidth: number = 25;
    //  ширина левого окна по умолчанию
    public leftFieldHeight: number = 65;
    //  ширина одного процента по умолчанию
    public onePercentWidth: number = 1;
    //  текст для поиска
    public textForSearch: string = "";
    // массив для дерева документов
    public tree: ITree[] = [];

    //  private
    //  НСИ сервер
    private nsiService: NsiManagementService;

    //  конструктор
    constructor(navBar: NavbarSettings, nsiService: NsiManagementService) {
        //  подключаем навбар
        navBar.setButtonsSettings(true, true, true, true);
        //  подключаем сервер
        this.nsiService = nsiService;
    }

    //  изменение бита движения мыши
    public cancelMoving(): void {
        //  проверяем что идет движение
        if (this.isMoving) {
            //  движение закончено
            this.isMoving = false;
            //  сохраним изменения
            this.saveSettings();
        }
    }

    //  Получаю текст для поиска
    //  textForSearch - текст из инпута для поиска
    //  isShowedLeavesForSearch - из чекера бит показателя отображения листьев
    public changeTextForSearch(textForSearch?: string, isShowedLeavesForSearch?: boolean): void {
        //  записываем значение листьев
        this.nsiService.setLeaves(isShowedLeavesForSearch);
        //  проверяем на пустоту
        if (!textForSearch || textForSearch.trim().length === 0) {
            //  фильтр пустой
            //  снимаем бит поиска
            this.isSearching = false;
            //  обнуляем текст поиска
            this.textForSearch = "";
            this.nsiService.setFilter();
            //  получаем полное дерево
            this.getTreeNode();
        } else {
            //  фильтр не пустой
            //  снимаем бит поиска
            this.isSearching = true;
            //  получаем поисковой запрос
            this.textForSearch = textForSearch;
            this.nsiService.setFilter(textForSearch);
                //  дергаем сервис
            this.getTreeNode();
        }
    }

    //  свернуть все каталоги
    public compressTree(): void {
        // дергаем сервис
        this.nsiService.compressTree();
    }

    //  создание новой ноды
    public createNode(): void {
        //  времянка для хранения ИД
        let parentNodeId: string = null;
        //  проверка существования родителя
        if (this.selectedTree && this.selectedTree.id && this.selectedTree.id.length > 0) {
            //  нода имеет значение
            parentNodeId = this.selectedTree.id;
        }
        //  открываем узел
        this.nsiService.openFolder(this.tree, parentNodeId);
        //  создаем узел в родителе
        this.nsiService.createNode(parentNodeId);

    }

    //  создаем подписки
    public createSubscriptions(): void {
        //  подписка isChangeable
        this.nsiService.castIsChangeable.subscribe((isChangeable: boolean) => this.isChangeable = isChangeable);
        //  подписка selectedTree
        this.nsiService.castSelectedTree.subscribe((selectedNode: ITree) => this.selectedTree = selectedNode);
        //  подписка на tree
        this.nsiService.castTree.subscribe((tree: ITree[]) => {
            //  проверяем наличие данных
            if (tree) {
                // текущее дерево
                this.tree = tree;
            }
        });
        //  подписка на tree
        this.nsiService.castTreeCounts.subscribe((treeCounts: ITreeCounts) => {
            //  проверяем наличие данных
            if (treeCounts) {
                //  всего узлов в документе
                this.docFull = treeCounts.full;
                //  передано узлов
                this.docAmount = treeCounts.amount;
                //  передано узлов
                this.docResults = treeCounts.results;
            }
        });
        //  подписка на автотеги
        this.nsiService.castSettings.subscribe((leftFieldWidth: number) => this.leftFieldWidth = leftFieldWidth);
        //  подписка на настройки
        this.nsiService.castTreeSuggestions.subscribe((suggestions: string[]) => this.suggestions = suggestions);
        //  подписка на текст для поиска
        this.nsiService.castTextForSearch.subscribe((textForSearch: string) => this.textForSearch = textForSearch);
        //  подписка на бит режима поиска
        this.nsiService.castIsSearching.subscribe((isSearching: boolean) => this.isSearching = isSearching);
        //  подписка на ширину ползунка
        this.nsiService.castTreeCardHeight
            .subscribe((treeCardHeight: number) => {
                this.leftFieldHeight = treeCardHeight;
            });
    }

    //  удаление существующей ноды
    public deleteNode(): void {
        //  дергаем сервис для вывода окна с подтверждением
        this.nsiService.showModalDeleteNode(this.selectedTree, this.tree);
    }

    //  развернуть все каталоги
    public expandTree(): void {
        //  дергаем сервис
        this.nsiService.expandTree();
    }

    //  подгружаем настройки
    public loadSettings(): void {
        //  дергаем сервис
        this.nsiService.loadSettings();
    }

    //  подгружаем свежую ноду
    public getTreeNode(): void {
        //  дергаем сервис с фильтром
        this.nsiService.getTree();
    }

    //  дестроер
    public ngOnDestroy(): void {
        //  сохраняем настройки перед выходом
        this.saveSettings();
        //  грохаем поиск
        //  обнуляем листья в сервисе
        this.nsiService.setLeaves(false);
        //  обнуляем текст поиска в сервисе
        this.nsiService.setFilter();
        //  грохаем селект по умолчанию
        this.nsiService.changeSelectedTree(this.tree, null);
    }

    //  первичная инциализаци
    public ngOnInit(): void {
        //  грузим настройки
        this.loadSettings();
        //  дергаем подписки
        this.createSubscriptions();
        //  дергаем сервис получения дерева первый раз
        this.nsiService.getTree();
    }

    //  отработка нажатия мыши по бордеру - переводим режим в "движение"
    public resizeOnMouseDown(): void {
        //  меняем статус на движение
        this.isMoving = true;
        //  задать 1% экрана
        this.onePercentWidth = Math.round(document.documentElement.clientWidth / 100);
    }

    //  отработка нажатия мыши
    //  pointX - координата мышки по иксу
    public resizeOnMouseMove(pointX: number): void {
        //  если активировано движение - меняем координаты
        if (this.isMoving && this.onePercentWidth !== 0) {
            //  снимаем все выделения
            window.getSelection().removeAllRanges();
            //  меняем ширину
            this.leftFieldWidth = pointX / this.onePercentWidth;
            //  минимальная ширина - 20%
            if (this.leftFieldWidth < 20) {
                this.leftFieldWidth = 20;
            }
            //  максимальная ширина - 49%
            if (this.leftFieldWidth > 49) {
                this.leftFieldWidth = 49;
            }
        }
    }

    //  сохраняем настройки
    public saveSettings(): void {
        //  дергаем сервис
        this.nsiService.saveSettings(this.leftFieldWidth);
    }

    //  снять бит изменения карточки
    public setChangeableBit(): void {
        //  дергаем сервис
        this.nsiService.changeChangeableBit(true);
    }
}
