import {ITree} from "../nsi.management.types";
import {ElementRef} from "@angular/core";
import {NsiManagementService} from "../nsi.management.service";
import {WritingCard} from "./writing.card";
import {NotificationModalControl} from "../../../../app_index/notification_modal/notification.modal.control";
import {Subject} from "rxjs/Subject";

describe("NSI writing.card", () => {
    //  глобальные переменные
    let nsiService: NsiManagementService;
    let notificationModal: NotificationModalControl;
    let wc: WritingCard;
    let castSelectedTree: Subject<ITree>;
    let castTree: Subject<ITree[]>;

    //  предварительные вызовы
    beforeEach(() => {
        nsiService = jasmine.createSpyObj("NsiManagementService", ["changeTextForSearch",
            "changeSearchingBit", "changeChangeableBit", "changeChangeableBit", "changeSelectedTree",
            "deleteAllFilesFromNode", "deleteFileById", "downloadAllFilesByNodeId", "downloadFileById", "getTree",
            "getTreeNode", "openFileById", "showModalDeleteNode", "setFilter", "updateSelectedTree"]);
        notificationModal = jasmine.createSpyObj("NotificationModalControl", ["open"]);
        wc = new WritingCard(nsiService, notificationModal);
        wc.pathWidth = new ElementRef(document.createElement("div"));
        castSelectedTree = new Subject();
        nsiService.castSelectedTree = castSelectedTree.asObservable();
        castTree = new Subject();
        nsiService.castTree = castTree.asObservable();
    });

    //  сами тесты
    it("buildCorrectedPath сокращенный путь", () => {
        //  добавляем переменную для хранения сгенерированного пути
        let correctPath: string;
        //  дергаем функцию
        correctPath = wc.buildCorrectedPath(["string1", "string2", "string3", "string4"], 20);
        //  проверки
        expect(correctPath).toBe(" \\ string1 \\ string2");
    });

    it("buildCorrectedPath полный путь", () => {
        //  добавляем переменную для хранения сгенерированного пути
        let correctPath: string;
        //  дергаем функцию
        correctPath = wc.buildCorrectedPath(["string1", "string2", "string3", "string4"], 40);
        //  проверки
        expect(correctPath).toBe(" \\ string1 \\ string2 \\ string3 \\ string4");
    });

    it("buildSelectedPath", () => {
        //  добавляем переменную для хранения сгенерированного пути
        let selectedPath: string;
        //  дергаем функцию
        selectedPath = wc.buildSelectedPath(["string1", "string2"], "string3");
        //  проверки
        expect(selectedPath).toBe(" \\ string1 \\ string2 \\ string3");
    });

    it("callDeleteAllFilesFromNodeService nodeId = null", () => {
        //  дергаем функцию
        wc.callDeleteAllFilesFromNodeService(null);
        //  проверки
        expect(nsiService.deleteAllFilesFromNode).toHaveBeenCalledTimes(0);
    });

    it("callDeleteAllFilesFromNodeService nodeId != null", () => {
        //  дергаем функцию
        wc.callDeleteAllFilesFromNodeService("123");
        //  проверки
        expect(nsiService.deleteAllFilesFromNode).toHaveBeenCalledTimes(1);
        expect(nsiService.deleteAllFilesFromNode).toHaveBeenCalledWith("123");
    });

    it("callDeleteFileByIdService fileId = null", () => {
        wc.selectedTree = {
            id: "123",
        };
        //  дергаем функцию
        wc.callDeleteFileByIdService(null);
        //  проверки
        expect(nsiService.deleteFileById).toHaveBeenCalledTimes(0);
    });

    it("callDeleteFileByIdService selectedTree.id = null", () => {
        wc.selectedTree = {
            id: null,
        };
        //  дергаем функцию
        wc.callDeleteFileByIdService("123");
        //  проверки
        expect(nsiService.deleteFileById).toHaveBeenCalledTimes(0);
    });

    it("callDeleteFileByIdService selectedTree = null", () => {
        wc.selectedTree = null;
        //  дергаем функцию
        wc.callDeleteFileByIdService("123");
        //  проверки
        expect(nsiService.deleteFileById).toHaveBeenCalledTimes(0);
    });

    it("callDeleteFileByIdService fileId = null", () => {
        wc.selectedTree = {
            id: "123",
        };
        //  дергаем функцию
        wc.callDeleteFileByIdService(null);
        //  проверки
        expect(nsiService.deleteFileById).toHaveBeenCalledTimes(0);
    });

    it("callDeleteFileByIdService fileId != null selectedTree != null", () => {
        wc.selectedTree = {
            id: "123",
        };
        //  дергаем функцию
        wc.callDeleteFileByIdService("fileId");
        //  проверки
        expect(nsiService.deleteFileById).toHaveBeenCalledTimes(1);
        expect(nsiService.deleteFileById).toHaveBeenCalledWith("123", "fileId");
    });

    it("callUpdateNodeService selectedTree = null", () => {
        wc.selectedTree = null;
        //  дергаем функцию
        wc.callUpdateNodeService();
        //  проверки
        expect(nsiService.updateSelectedTree).toHaveBeenCalledTimes(0);
    });

    it("callUpdateNodeService selectedTree != null", () => {
        wc.selectedTree = {
            changed: true,
            id: "123",
        };
        //  дергаем функцию
        wc.callUpdateNodeService();
        //  проверки
        expect(nsiService.updateSelectedTree).toHaveBeenCalledTimes(1);
        expect(nsiService.updateSelectedTree).toHaveBeenCalledWith(wc.selectedTree);
        expect(wc.selectedTree.changed).toBeUndefined();
    });

    it("changeTextForName target = null", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
        };
        //  дергаем функцию
        wc.changeTextForName(null);
        //  проверки
        expect(wc.selectedTree.name.length).toBe(0);
        expect(wc.selectedTree.changed).toBeUndefined();
    });

    it("changeTextForName target != null && target.value.trim() = 0", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
        };
        let target: HTMLInputElement = document.createElement("input");
        target.value = "";
        //  дергаем функцию
        wc.changeTextForName(target);
        //  проверки
        expect(wc.selectedTree.name.length).toBe(0);
        expect(wc.selectedTree.changed).toBeUndefined();
    });

    it("changeTextForName target != null && target.value.trim() != 0", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
        };
        let target: HTMLInputElement = document.createElement("input");
        target.value = "name";
        //  дергаем функцию
        wc.changeTextForName(target);
        //  проверки
        expect(wc.selectedTree.name).toBe("name");
        expect(wc.selectedTree.changed).toBe(true);
    });

    it("changeTextForTags target = null", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
        };
        //  дергаем функцию
        wc.changeTextForTags(null);
        //  проверки
        expect(wc.selectedTree.changed).toBeUndefined();
    });

    it("changeTextForTags target != null добавляем присутствующий в списке тэг", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
            tags: ["tags"],
        };
        let target: HTMLInputElement = document.createElement("input");
        target.value = "tags";
        //  дергаем функцию
        wc.changeTextForTags(target);
        //  проверки
        expect(wc.selectedTree.changed).toBeUndefined();
    });

    it("changeTextForTags target != null добавляем пустоту", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
            tags: ["tags"],
        };
        let target: HTMLInputElement = document.createElement("input");
        target.value = "";
        //  дергаем функцию
        wc.changeTextForTags(target);
        //  проверки
        expect(wc.selectedTree.changed).toBeUndefined();
    });

    it("changeTextForTags target != null добавляем новый тэг", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
            tags: ["233"],
        };
        let target: HTMLInputElement = document.createElement("input");
        target.value = "232";
        //  дергаем функцию
        wc.changeTextForTags(target);
        //  проверки
        expect(target.value.length).toBe(0);
        expect(wc.selectedTree.tags).toEqual(["232", "233"]);
        expect(wc.selectedTree.changed).toBe(true);
    });

    it("deleteAllFilesFromNode", () => {
        spyOn(wc, "updateNode");
        spyOn(wc, "showModalDeleteAllFilesFromNode");
        //  дергаем функцию
        wc.deleteAllFilesFromNode("nodeId", "nodeName");
        //  проверки
        expect(wc.updateNode).toHaveBeenCalledTimes(1);
        expect(wc.showModalDeleteAllFilesFromNode).toHaveBeenCalledTimes(1);
        expect(wc.showModalDeleteAllFilesFromNode).toHaveBeenCalledWith("nodeId", "nodeName");
    });

    it("deleteFileById", () => {
        spyOn(wc, "updateNode");
        spyOn(wc, "showModalDeleteFileById");
        //  дергаем функцию
        wc.deleteFileById("fileId", "fileName");
        //  проверки
        expect(wc.updateNode).toHaveBeenCalledTimes(1);
        expect(wc.showModalDeleteFileById).toHaveBeenCalledTimes(1);
        expect(wc.showModalDeleteFileById).toHaveBeenCalledWith("fileId", "fileName");
    });

    it("deleteNode", () => {
        wc.selectedTree = {id: "123"};
        wc.tree = [{id: "123"}];
        //  дергаем функцию
        wc.deleteNode();
        //  проверки
        expect(nsiService.showModalDeleteNode).toHaveBeenCalledTimes(1);
        expect(nsiService.showModalDeleteNode).toHaveBeenCalledWith(wc.selectedTree, wc.tree);
    });

    it("downloadAllFilesByNodeId", () => {
        //  дергаем функцию
        wc.downloadAllFilesByNodeId("nodeId", "nodeName");
        //  проверки
        expect(nsiService.downloadAllFilesByNodeId).toHaveBeenCalledTimes(1);
        expect(nsiService.downloadAllFilesByNodeId).toHaveBeenCalledWith("nodeId", "nodeName");
    });

    it("downloadFileById", () => {
        //  дергаем функцию
        wc.downloadFileById("fileId", "fileName");
        //  проверки
        expect(nsiService.downloadFileById).toHaveBeenCalledTimes(1);
        expect(nsiService.downloadFileById).toHaveBeenCalledWith("fileId", "fileName");
    });

    it("changeTextForSearch", () => {
        //  дергаем функцию
        wc.changeTextForSearch("test");
        //  проверки
        expect(nsiService.changeTextForSearch).toHaveBeenCalledTimes(1);
        expect(nsiService.changeTextForSearch).toHaveBeenCalledWith("test");
        expect(nsiService.setFilter).toHaveBeenCalledTimes(1);
        expect(nsiService.setFilter).toHaveBeenCalledWith("test");
        expect(nsiService.changeSearchingBit).toHaveBeenCalledTimes(1);
        expect(nsiService.changeSearchingBit).toHaveBeenCalledWith(true);
        expect(nsiService.getTree).toHaveBeenCalledTimes(1);
    });

    it("ngAfterContentChecked selectedTree = null", () => {
        //  передаем пустоту в дерево
        wc.selectedTree = null;
        //  дергаем функцию
        wc.ngAfterContentChecked();
        //  проверки
        expect(wc.selectedPath).toBeNull();
    });

    it("ngAfterContentChecked selectedTree != null buildCorrectedPath is called", () => {
        //  передаем значение в дерево
        wc.selectedTree = {
            id: "123",
            name: "testName",
            parentsNameList: ["string1", "string2", "string3"],
            parentsPath: "\\ string1 \\ string2 \\ string3",
        };
        wc.pathWidth = { nativeElement: {
                clientHeight: 400,
                clientWidth: 100,
            }};
        //  мокаем функцию
        spyOn(wc, "buildCorrectedPath").and.returnValue("string1");

        // //  дергаем функцию
        wc.ngAfterContentChecked();
        // //  проверки
        expect(wc.selectedPath).toEqual("string1 \\ ... \\ testName");
        expect(wc.buildCorrectedPath).toHaveBeenCalledTimes(1);
        expect(wc.buildCorrectedPath).toHaveBeenCalledWith(["string1"], -2.5);
    });

    it("ngAfterContentChecked selectedTree != null buildSelectedPath is called", () => {
        //  передаем значение в дерево
        wc.selectedTree = {
            id: "123",
            name: "testName",
            parentsNameList: ["string1", "string2", "string3"],
            parentsPath: "\\ string1 \\ string2 \\ string3",
        };
        wc.pathWidth = { nativeElement: {
                clientHeight: 100,
                clientWidth: 10000,
            }};
        //  мокаем функцию
        spyOn(wc, "buildSelectedPath").and.returnValue("string1");

        // //  дергаем функцию
        wc.ngAfterContentChecked();
        // //  проверки
        expect(wc.selectedPath).toEqual("string1");
        expect(wc.buildSelectedPath).toHaveBeenCalledWith(["string1", "string2"], "testName");
        expect(wc.buildSelectedPath).toHaveBeenCalledTimes(1);
    });

    it("ngOnInit() tree != 0", () => {
        //  инитим дерево
        wc.selectedTree = null;
        wc.tree = [];
        //  дергаем функцию
        wc.ngOnInit();
        //  делаем асинхрон
        castSelectedTree.next({id: "123"});
        castTree.next([{id: "123"}]);
        //  проверки
        expect(wc.selectedTree).toEqual({id: "123"});
        expect(wc.tree).toEqual([{id: "123"}]);
    });

    it("ngOnInit() tree = 0", () => {
        //  инитим дерево
        wc.selectedTree = null;
        wc.tree = [];
        //  дергаем функцию
        wc.ngOnInit();
        //  делаем асинхрон
        castSelectedTree.next({id: "123"});
        castTree.next(null);
        //  проверки
        expect(wc.selectedTree).toEqual({id: "123"});
        expect(wc.tree.length).toBe(0);
    });

    it("openFileInDefaultProgram()", () => {
        //  дергаем функцию
        wc.openFileInDefaultProgram("fileId", "fileName");
        //  проверки
        expect(nsiService.openFileById).toHaveBeenCalledTimes(1);
        expect(nsiService.openFileById).toHaveBeenCalledWith("fileId", "fileName");
    });

    it("onFilePreloaded() target != null, target.files.length = 0", () => {
        //  создаем переменные
        wc.selectedTree = {id: "123"};
        let target: HTMLInputElement = document.createElement("input");
        //  дергаем функцию
        wc.onFilePreloaded(target);
        //  проверки
        expect(target.value.length).toBe(0);
    });

    it("removeTagFromTaglist text != null и его нет в списке ничего не делаем", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
            tags: ["233"],
        };
        //  дергаем функцию
        wc.removeTagFromTaglist("232");
        //  проверки
        expect(wc.selectedTree.tags).toEqual(["233"]);
    });

    it("removeTagFromTaglist text != null и есть в списке - удаляем тэг", () => {
        wc.selectedTree = {
            id: "123",
            name: "",
            tags: ["233"],
        };
        //  дергаем функцию
        wc.removeTagFromTaglist("233");
        //  проверки
        expect(wc.selectedTree.tags.length).toBe(0);
        expect(wc.selectedTree.changed).toBe(true);
    });

    it("removeTagFromTaglist selectedTree.tags = undefined", () => {
        wc.selectedTree = {
            id: "123",
        };
        //  дергаем функцию
        wc.removeTagFromTaglist("233");
        //  проверки
        expect(wc.selectedTree.changed).toBeUndefined();
    });

    it("rollbackNode()", () => {
        //  создаем переменные
        wc.selectedTree = {id: "123"};
        let target: HTMLInputElement = document.createElement("input");
        target.value = "tags";
        //  дергаем функцию
        wc.rollbackNode(target);
        //  проверки
        expect(target.value.length).toBe(0);
        expect(nsiService.getTreeNode).toHaveBeenCalledTimes(1);
        expect(nsiService.getTreeNode).toHaveBeenCalledWith(wc.selectedTree.id);
    });

    it("setChangedBit()", () => {
        wc.selectedTree = {id: "123"};
        wc.tree = [{id: "123"}];
        //  дергаем функцию
        wc.setChangedBit(true);
        //  проверки
        expect(wc.selectedTree.changed).toBe(true);
        expect(nsiService.changeSelectedTree).toHaveBeenCalledTimes(1);
        expect(nsiService.changeSelectedTree).toHaveBeenCalledWith(wc.tree, wc.selectedTree);
    });

    it("showModalDeleteAllFilesFromNode", () => {
        // spyOn(wc["notificationModal" as string], "open");
        //  объявляем переменную
        // let modalContent: INotificationContent = {
        // buttons: [
        //     {
        //         action: this.callDeleteAllFilesFromNodeService.bind(this, "nodeId"),
        //         class: "btn-danger",
        //         name: "Удалить",
        //     },
        //     {
        //         class: "btn-secondary",
        //         name: "Закрыть",
        //     },
        // ],
        //     header: "Удаление файла",
        //     messages: [{
        //     bold: false,
        //     text: "Вы уверены, что хотите удалить все файлы из карточки '" + "nodeName" + "'?",
        // }],
        // };
        //  дергаем функцию
        wc.showModalDeleteAllFilesFromNode("nodeId", "nodeName");
        //  проверки
        expect(wc["notificationModal" as string].open).toHaveBeenCalledTimes(1);
        // expect(wc["notificationModal" as string].open).toHaveBeenCalledWith(modalContent);
    });

    it("showModalDeleteFileById", () => {
        // spyOn(wc["notificationModal" as string], "open");
        //  объявляем переменную
        // let modalContent: INotificationContent = {
        //     buttons: [
        //         {
        //             action: wc.callDeleteFileByIdService.bind(wc, "fileId"),
        //             class: "btn-danger",
        //             name: "Удалить",
        //         },
        //         {
        //             class: "btn-secondary",
        //             name: "Закрыть",
        //         },
        //     ],
        //     header: "Удаление файла",
        //     messages: [{
        //         bold: false,
        //         text: "Вы уверены, что хотите удалить файл " + "fileName" + "?",
        //     }],
        // };
        //  дергаем функцию
        wc.showModalDeleteFileById("fileId", "fileName");
        //  проверки
        expect(wc["notificationModal" as string].open).toHaveBeenCalledTimes(1);
        // expect(wc["notificationModal" as string].open).toHaveBeenCalledWith(modalContent);
    });

    it("unsetChangeableBit", () => {
        //  дергаем функцию
        wc.unsetChangeableBit();
        //  проверки
        expect(nsiService.changeChangeableBit).toHaveBeenCalledTimes(1);
        expect(nsiService.changeChangeableBit).toHaveBeenCalledWith(false);
    });

    it("updateNode", () => {
        spyOn(wc, "callUpdateNodeService");
        //  дергаем функцию
        wc.updateNode();
        //  проверки
        expect(wc.callUpdateNodeService).toHaveBeenCalledTimes(1);
    });
});
