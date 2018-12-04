import {Component, Input, OnInit} from "@angular/core";
import {ITree} from "../nsi.management.types";
import {NsiManagementService} from "../nsi.management.service";

@Component({
    selector: "tree-table",
    styleUrls: ["../nsi.management.page.css"],
    templateUrl: "tree.table.html",
})

export class TreeTable implements OnInit {

    //  public
    //  дерево
    @Input() public tree: ITree[] = [];
    //  отступы с верхнего уровня
    @Input() public topOffsetList: boolean[] = [];
    //  последняя ли нода в списке
    @Input() public isEndingNode: boolean = true;
    //  отступы для передачи
    public currentOffsetList: boolean[] = [];
    //  выбранная нода
    public selectedTree: ITree = null;

    //  private
    private nsiService: NsiManagementService;

    //  конструктор
    constructor(nsiService: NsiManagementService) {
        //  сервер НСИ
        this.nsiService = nsiService;
    }

    //  открытие пункта меню по дабл клику
    //  selectedTree - текущая нода
    public openItem(selectedTree: ITree): void {
        //  изменить открытие
        selectedTree.isOpened = !selectedTree.isOpened;
        //  сохраняем статус открытия
        this.nsiService.updateSelectedTree(selectedTree);
    }

    //  инитор
    public ngOnInit(): void {
        //  изменяем selectedTre
        this.nsiService.castSelectedTree.subscribe((selectedNode: ITree) => this.selectedTree = selectedNode);
        //  изменяем currentOffsetList для передачи вниз
        this.currentOffsetList = [...this.topOffsetList];
        //  добавляем тип текущей ноды, полученный сверху
        if (this.isEndingNode != null) {
        // if (true) {
             this.currentOffsetList.push(this.isEndingNode);
        }
        //  заглушка от глюка
        // if (this.currentOffsetList === [false]) {
        //     this.currentOffsetList = [true];
        // }
    }

    //  выбор пункта меню по клику
    //  selectedTree - текущая нода
    public selectItem(selectedTree: ITree): void {
        //  убираем случайное выделение
        document.getSelection().removeAllRanges();
        //  проверяю выделена ли нода, если да - обнуляем выделение
        if (selectedTree === this.selectedTree) {
            //  очищаем переменную
            selectedTree = null;
        }
        //  дергаем бихевиорсабж
        this.nsiService.changeSelectedTree(this.tree, selectedTree);
        //  меняем режим на чтение
        this.nsiService.changeChangeableBit(false);
    }
}
