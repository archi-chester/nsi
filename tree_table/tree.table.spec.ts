import {NsiManagementService} from "../nsi.management.service";
import {TreeTable} from "./tree.table";
import {ITree} from "../nsi.management.types";
import {Subject} from "rxjs/Subject";

describe("NSI tree.table", () => {
    //  глобальные переменные
    let nsiService: NsiManagementService;
    let tt: TreeTable;
    let castSelectedTree: Subject<ITree>;

    //  предварительные вызовы
    beforeEach(() => {
        nsiService = jasmine.createSpyObj("NsiManagementService", ["changeSelectedTree",
        "changeChangeableBit", "updateSelectedTree"]);
        tt = new TreeTable(nsiService);
        castSelectedTree = new Subject();
        nsiService.castSelectedTree = castSelectedTree.asObservable();
    });

    //  сами тесты
    it("openItem()", () => {
        //  создаем переменную дерева
        tt.selectedTree = {
            id: "123",
            isOpened: true,
        };
        //  дергаем функцию
        tt.openItem(tt.selectedTree);
        //  проверяем
        expect(tt.selectedTree.isOpened).toBe(false);
        expect(nsiService.updateSelectedTree).toHaveBeenCalledWith(tt.selectedTree);
        expect(nsiService.updateSelectedTree).toHaveBeenCalledTimes(1);
    });

    describe("", () => {
        it("ngOnInit() this.isEndingNode = true", () => {
            //  инитим дерево
            tt.selectedTree = null;
            tt.topOffsetList = [true, true];
            tt.isEndingNode = true;
            //  дергаем функцию
            tt.ngOnInit();
            //  делаем асинхрон
            castSelectedTree.next({id: "123"});
            // //  проверки
            expect(tt.selectedTree).toEqual({id: "123"});
            expect(tt.currentOffsetList).toEqual([true, true, true]);
        });

        it("ngOnInit() this.isEndingNode = false", () => {
            //  инитим дерево
            tt.selectedTree = null;
            tt.topOffsetList = [];
            tt.isEndingNode = false;
            // //  дергаем функцию
            tt.ngOnInit();
            //  делаем асинхрон
            castSelectedTree.next({id: "123"});
            // //  проверки
            expect(tt.selectedTree).toEqual({id: "123"});
            expect(tt.currentOffsetList).toEqual([false]);
        });

        it("ngOnInit() this.isEndingNode = null", () => {
            //  инитим дерево
            tt.selectedTree = null;
            tt.topOffsetList = [false];
            tt.isEndingNode = null;
            // //  дергаем функцию
            tt.ngOnInit();
            //  делаем асинхрон
            castSelectedTree.next({id: "123"});
            // //  проверки
            expect(tt.selectedTree).toEqual({id: "123"});
            expect(tt.currentOffsetList).toEqual([false]);
        });
    });

    it("selectItem() selectedTree === current.selectedTree", () => {
        //  создаем переменную дерева
        tt.selectedTree = {
            id: "123",
        };
        let selectedTree: ITree = tt.selectedTree;
        tt.tree = [{id: "123"}];
        //  дергаем функцию
        tt.selectItem(selectedTree);
        //  проверяем
        expect(nsiService.changeSelectedTree).toHaveBeenCalledWith(tt.tree, null);
        expect(nsiService.changeSelectedTree).toHaveBeenCalledTimes(1);
        expect(nsiService.changeChangeableBit).toHaveBeenCalledWith(false);
        expect(nsiService.changeChangeableBit).toHaveBeenCalledTimes(1);
    });

    it("selectItem() selectedTree !== current.selectedTree", () => {
        //  создаем переменную дерева
        tt.selectedTree = {
            id: "123",
        };
        let selectedTree: ITree = {
            id: "124",
        };
        tt.tree = [{id: "123"}];
        //  дергаем функцию
        tt.selectItem(selectedTree);
        //  проверяем
        expect(nsiService.changeSelectedTree).toHaveBeenCalledWith(tt.tree, selectedTree);
        expect(nsiService.changeSelectedTree).toHaveBeenCalledTimes(1);
        expect(nsiService.changeChangeableBit).toHaveBeenCalledWith(false);
        expect(nsiService.changeChangeableBit).toHaveBeenCalledTimes(1);
    });
});
