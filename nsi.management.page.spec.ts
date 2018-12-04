import {NsiManagementService} from "./nsi.management.service";
import {NsiManagementPage} from "./nsi.management.page";
import {NavbarSettings} from "../../../app_index/navbar/navbar.settings";
import {ITree, ITreeCounts} from "./nsi.management.types";
import {Subject} from "rxjs/Subject";

describe("NSI management.page", () => {
    //  глобальные переменные
    let nsiService: NsiManagementService;
    let nm: NsiManagementPage;
    let navBar: NavbarSettings;
    //  subject
    let castIsChangeable: Subject<boolean>;
    let castSelectedTree: Subject<ITree>;
    let castTree: Subject<ITree[]>;
    let castTreeCounts: Subject<ITreeCounts>;
    let castSettings: Subject<number>;
    let castTreeSuggestions: Subject<string[]>;
    let castTextForSearch: Subject<string>;
    let castIsSearching: Subject<boolean>;
    let castTreeCardHeight: Subject<number>;

    //  предварительные вызовы
    beforeEach(() => {
        nsiService = jasmine.createSpyObj("NsiManagementService", ["changeChangeableBit",
            "saveSettings", "expandTree", "compressTree", "loadSettings", "getTree",  "getTreeNode",
            "showModalDeleteNode", "setLeaves", "setFilter", "changeSelectedTree", "openFolder", "createNode"]);
        navBar = new NavbarSettings();
        nm = new NsiManagementPage(navBar, nsiService);
        castIsChangeable = new Subject();
        castSelectedTree = new Subject();
        castTree = new Subject();
        castTreeCounts = new Subject();
        castSettings = new Subject();
        castTreeSuggestions = new Subject();
        castTextForSearch = new Subject();
        castIsSearching = new Subject();
        castTreeCardHeight = new Subject();
        nsiService.castTree = castTree.asObservable();
        nsiService.castTreeCounts = castTreeCounts.asObservable();
        nsiService.castSettings = castSettings.asObservable();
        nsiService.castTreeSuggestions = castTreeSuggestions.asObservable();
        nsiService.castTextForSearch = castTextForSearch.asObservable();
        nsiService.castIsSearching = castIsSearching.asObservable();
        nsiService.castTreeCardHeight = castTreeCardHeight.asObservable();
        nsiService.castIsChangeable = castIsChangeable.asObservable();
        nsiService.castSelectedTree = castSelectedTree.asObservable();
    });

    //  сами тесты
    it("cancelMoving() isMoving = true", () => {
        //  моки
        spyOn(nm, "saveSettings");
        //  переменные
        nm.isMoving = true;
        //  дергаем функцию
        nm.cancelMoving();
        //  проверки
        expect(nm.saveSettings).toHaveBeenCalledTimes(1);
        expect(nm.isMoving).toBe(false);
    });

    it("cancelMoving() isMoving = false", () => {
        //  моки
        spyOn(nm, "saveSettings");
        //  переменные
        nm.isMoving = false;
        //  дергаем функцию
        nm.cancelMoving();
        //  проверки
        expect(nm.saveSettings).toHaveBeenCalledTimes(0);
    });

    it("changeTextForSearch текст не пустой", () => {
        //  моки
        spyOn(nm, "getTreeNode");
        //  дергаем функцию
        nm.changeTextForSearch("test", true);
        //  проверки
        expect(nsiService.setLeaves).toHaveBeenCalledTimes(1);
        expect(nsiService.setLeaves).toHaveBeenCalledWith(true);
        expect(nm.getTreeNode).toHaveBeenCalledTimes(1);

        expect(nsiService.setFilter).toHaveBeenCalledTimes(1);
        expect(nsiService.setFilter).toHaveBeenCalledWith("test");
        expect(nm.textForSearch).toBe("test");
        expect(nm.isSearching).toBe(true);
    });

    it("changeTextForSearch текст пустой", () => {
        //  моки
        spyOn(nm, "getTreeNode");
        //  дергаем функцию
        nm.changeTextForSearch("", true);
        //  проверки
        expect(nsiService.setLeaves).toHaveBeenCalledTimes(1);
        expect(nsiService.setLeaves).toHaveBeenCalledWith(true);
        expect(nm.getTreeNode).toHaveBeenCalledTimes(1);

        expect(nsiService.setFilter).toHaveBeenCalledTimes(1);
        expect(nsiService.setFilter).toHaveBeenCalledWith();
        expect(nm.textForSearch.length).toBe(0);
        expect(nm.isSearching).toBe(false);
    });

    it("changeTextForSearch без параметров", () => {
        //  моки
        spyOn(nm, "getTreeNode");
        //  дергаем функцию
        nm.changeTextForSearch();
        //  проверки
        expect(nsiService.setLeaves).toHaveBeenCalledTimes(1);
        expect(nsiService.setLeaves).toHaveBeenCalledWith(undefined);
        expect(nm.getTreeNode).toHaveBeenCalledTimes(1);

        expect(nsiService.setFilter).toHaveBeenCalledTimes(1);
        expect(nsiService.setFilter).toHaveBeenCalledWith();
        expect(nm.textForSearch.length).toBe(0);
        expect(nm.isSearching).toBe(false);
    });

    it("compressTree", () => {
        //  дергаем функцию
        nm.compressTree();
        //  проверки
        expect(nsiService.compressTree).toHaveBeenCalledTimes(1);
    });

    it("createNode parentNodeId = null", () => {
        //  создаем переменные
        nm.selectedTree = null;
        nm.tree = [{id: "123"}];
        //  дергаем функцию
        nm.createNode();
        //  проверки
        expect(nsiService.openFolder).toHaveBeenCalledTimes(1);
        expect(nsiService.openFolder).toHaveBeenCalledWith(nm.tree, null);
        expect(nsiService.createNode).toHaveBeenCalledTimes(1);
        expect(nsiService.createNode).toHaveBeenCalledWith(null);
    });

    it("createNode parentNodeId != null", () => {
        //  создаем переменные
        nm.selectedTree = {id: "123"};
        nm.tree = [{id: "123"}];
        //  дергаем функцию
        nm.createNode();
        //  проверки
        expect(nsiService.openFolder).toHaveBeenCalledTimes(1);
        expect(nsiService.openFolder).toHaveBeenCalledWith(nm.tree, "123");
        expect(nsiService.createNode).toHaveBeenCalledTimes(1);
        expect(nsiService.createNode).toHaveBeenCalledWith("123");
    });

    describe("createSubscriptions()", () => {
        beforeEach(() => {
            //  инитим
            nm.isChangeable = null;
            nm.selectedTree = null;
            nm.tree = [];
            nm.docFull = null;
            nm.docAmount = null;
            nm.docResults = null;
            nm.leftFieldWidth = null;
            nm.leftFieldHeight = null;
            nm.isSearching = null;
            nm.textForSearch = null;
            nm.suggestions = null;
            //  дергаем функцию
            nm.createSubscriptions();
        });

        it("tree != null and treeCount != null", () => {
            //  дергаем функцию
            nm.createSubscriptions();
            //  делаем асинхрон
            castIsChangeable.next(true);
            castSelectedTree.next({id: "123"});
            castTree.next([{id: "123"}]);
            castTreeCounts.next({amount: 2, full: 1, results: 3});
            castTreeCounts.next({amount: 2, full: 1, results: 3});
            castSettings.next(10);
            castTreeCardHeight.next(11);
            castIsSearching.next(true);
            castTextForSearch.next("text");
            castTreeSuggestions.next(["text1"]);
            //  проверки
            expect(nm.isChangeable).toBe(true);
            expect(nm.selectedTree).toEqual({id: "123"});
            expect(nm.tree).toEqual([{id: "123"}]);
            expect(nm.docFull).toBe(1);
            expect(nm.docAmount).toBe(2);
            expect(nm.docResults).toBe(3);
            expect(nm.leftFieldWidth).toBe(10);
            expect(nm.textForSearch).toBe("text");
            expect(nm.suggestions).toEqual(["text1"]);
            expect(nm.isSearching).toBe(true);
            expect(nm.leftFieldHeight).toBe(11);
        });

        it("tree = null and treeCount = null", () => {
            //  делаем асинхрон
            castIsChangeable.next(true);
            castSelectedTree.next({id: "123"});
            castTree.next(null);
            castTreeCounts.next(null);
            castSettings.next(10);
            castTreeCardHeight.next(11);
            castIsSearching.next(true);
            castTextForSearch.next("text");
            castTreeSuggestions.next(["text1"]);
            //  проверки
            expect(nm.isChangeable).toBe(true);
            expect(nm.selectedTree).toEqual({id: "123"});
            expect(nm.tree.length).toBe(0);
            expect(nm.docFull).toBe(null);
            expect(nm.docAmount).toBe(null);
            expect(nm.docResults).toBe(null);
            expect(nm.leftFieldWidth).toBe(10);
            expect(nm.textForSearch).toBe("text");
            expect(nm.suggestions).toEqual(["text1"]);
            expect(nm.isSearching).toBe(true);
            expect(nm.leftFieldHeight).toBe(11);
        });
    });

    it("deleteNode", () => {
        //  создаем переменные
        nm.selectedTree = {id: "123"};
        nm.tree = [{id: "123"}];
        //  дергаем функцию
        nm.deleteNode();
        //  проверки
        expect(nsiService.showModalDeleteNode).toHaveBeenCalledTimes(1);
        expect(nsiService.showModalDeleteNode).toHaveBeenCalledWith(nm.selectedTree, nm.tree);
    });

    it("expandTree", () => {
        //  дергаем функцию
        nm.expandTree();
        //  проверки
        expect(nsiService.expandTree).toHaveBeenCalledTimes(1);
    });

    it("loadSettings", () => {
        //  дергаем функцию
        nm.loadSettings();
        //  проверки
        expect(nsiService.loadSettings).toHaveBeenCalledTimes(1);
    });

    it("getTreeNode", () => {
        //  дергаем функцию
        nm.getTreeNode();
        //  проверки
        expect(nsiService.getTree).toHaveBeenCalledTimes(1);
    });

    it("ngOnDestroy", () => {
        //  моки
        spyOn(nm, "saveSettings");
        //  переменные
        nm.tree = [{id: "123"}];
        //  дергаем функцию
        nm.ngOnDestroy();
        //  проверки
        expect(nm.saveSettings).toHaveBeenCalledTimes(1);
        expect(nsiService.setLeaves).toHaveBeenCalledTimes(1);
        expect(nsiService.setLeaves).toHaveBeenCalledWith(false);
        expect(nsiService.setFilter).toHaveBeenCalledTimes(1);
        expect(nsiService.changeSelectedTree).toHaveBeenCalledWith(nm.tree, null);
        expect(nsiService.changeSelectedTree).toHaveBeenCalledTimes(1);
    });

    it("ngOnInit", () => {
        //  моки
        spyOn(nm, "loadSettings");
        spyOn(nm, "createSubscriptions");
        //  дергаем функцию
        nm.ngOnInit();
        //  проверки
        expect(nm.loadSettings).toHaveBeenCalledTimes(1);
        expect(nm.createSubscriptions).toHaveBeenCalledTimes(1);
        expect(nsiService.getTree).toHaveBeenCalledTimes(1);
    });

    it("resizeOnMouseDown", () => {
        //  переменная
        nm.isMoving  = false;
        //  дергаем функцию
        nm.resizeOnMouseDown();
        //  проверки
        expect(nm.isMoving).toBe(true);
        expect(nm.onePercentWidth).toBe(Math.round(document.documentElement.clientWidth / 100));
    });

    it("resizeOnMouseMove isMoving  = false", () => {
        //  переменная
        nm.isMoving  = false;
        nm.onePercentWidth = 10;
        nm.leftFieldWidth = 100;
        //  дергаем функцию
        nm.resizeOnMouseMove(100);
        //  проверки
        expect(nm.leftFieldWidth).toBe(100);
    });

    it("resizeOnMouseMove isMoving  = true this.onePercentWidth = 0", () => {
        //  переменная
        nm.isMoving  = true;
        nm.onePercentWidth = 0;
        nm.leftFieldWidth = 100;
        //  дергаем функцию
        nm.resizeOnMouseMove(100);
        //  проверки
        expect(nm.leftFieldWidth).toBe(100);
    });

    it("resizeOnMouseMove isMoving  = true leftFieldWidth < 20", () => {
        //  переменная
        nm.isMoving  = true;
        nm.onePercentWidth = 10;
        nm.leftFieldWidth = 100;
        //  дергаем функцию
        nm.resizeOnMouseMove(100);
        //  проверки
        expect(nm.leftFieldWidth).toBe(20);
    });

    it("resizeOnMouseMove isMoving  = true leftFieldWidth > 49", () => {
        //  переменная
        nm.isMoving  = true;
        nm.onePercentWidth = 10;
        nm.leftFieldWidth = 100;
        //  дергаем функцию
        nm.resizeOnMouseMove(500);
        //  проверки
        expect(nm.leftFieldWidth).toBe(49);
    });

    it("resizeOnMouseMove isMoving  = true leftFieldWidth between 20 49", () => {
        //  переменная
        nm.isMoving  = true;
        nm.onePercentWidth = 10;
        nm.leftFieldWidth = 100;
        //  дергаем функцию
        nm.resizeOnMouseMove(350);
        //  проверки
        expect(nm.leftFieldWidth).toBe(35);
    });

    it("saveSettings", () => {
        //  переменные
        nm.leftFieldWidth = 10;
        //  дергаем функцию
        nm.saveSettings();
        //  проверки
        expect(nsiService.saveSettings).toHaveBeenCalledTimes(1);
        expect(nsiService.saveSettings).toHaveBeenCalledWith(nm.leftFieldWidth);
    });

    it("setChangeableBit", () => {
        //  дергаем функцию
        nm.setChangeableBit();
        //  проверки
        expect(nsiService.changeChangeableBit).toHaveBeenCalledTimes(1);
        expect(nsiService.changeChangeableBit).toHaveBeenCalledWith(true);
    });
});
