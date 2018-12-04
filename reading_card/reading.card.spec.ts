import {NsiManagementService} from "../nsi.management.service";
import {ReadingCard} from "./reading.card";
import {ElementRef} from "@angular/core";
import {ITree} from "../nsi.management.types";
import {Subject} from "rxjs/Subject";

describe("NSI reading.card", () => {
    //  глобальные переменные
    let nsiService: NsiManagementService;
    let rc: ReadingCard;
    let castSelectedTree: Subject<ITree>;

    //  предварительные вызовы
    beforeEach(() => {
        nsiService = jasmine.createSpyObj("NsiManagementService", ["changeTextForSearch",
            "setFilter", "changeSearchingBit", "getTree", "changeChangeableBit", "downloadAllFilesByNodeId",
            "downloadFileById", "openFileById"]);
        rc = new ReadingCard(nsiService);
        rc.pathWidth = new ElementRef(document.createElement("div"));
        castSelectedTree = new Subject();
        nsiService.castSelectedTree = castSelectedTree.asObservable();
    });

    //  сами тесты
    describe("buildCorrectedPath", () => {
        //  добавляем переменную для хранения сгенерированного пути
        let correctPath: string;

        it("сокращенный путь", () => {
            //  дергаем функцию
            correctPath = rc.buildCorrectedPath(["string1", "string2", "string3", "string4"], 20);
            //  проверки
            expect(correctPath).toBe(" \\ string1 \\ string2");
        });

        it("полный путь", () => {
            //  дергаем функцию
            correctPath = rc.buildCorrectedPath(["string1", "string2", "string3", "string4"], 40);
            //  проверки
            expect(correctPath).toBe(" \\ string1 \\ string2 \\ string3 \\ string4");
        });
    });

    it("buildSelectedPath", () => {
        //  добавляем переменную для хранения сгенерированного пути
        let selectedPath: string;
        //  дергаем функцию
        selectedPath = rc.buildSelectedPath(["string1", "string2"], "string3");
        //  проверки
        expect(selectedPath).toBe(" \\ string1 \\ string2 \\ string3");
    });

    it("changeTextForSearch", () => {
        //  дергаем функцию
        rc.changeTextForSearch("test");
        //  проверки
        expect(nsiService.changeTextForSearch).toHaveBeenCalledTimes(1);
        expect(nsiService.changeTextForSearch).toHaveBeenCalledWith("test");
        expect(nsiService.setFilter).toHaveBeenCalledTimes(1);
        expect(nsiService.setFilter).toHaveBeenCalledWith("test");
        expect(nsiService.changeSearchingBit).toHaveBeenCalledTimes(1);
        expect(nsiService.changeSearchingBit).toHaveBeenCalledWith(true);
        expect(nsiService.getTree).toHaveBeenCalledTimes(1);
    });

    it("downloadAllFilesByNodeId", () => {
        //  дергаем функцию
        rc.downloadAllFilesByNodeId("nodeId", "nodeName");
        //  проверки
        expect(nsiService.downloadAllFilesByNodeId).toHaveBeenCalledTimes(1);
        expect(nsiService.downloadAllFilesByNodeId).toHaveBeenCalledWith("nodeId", "nodeName");
    });

    it("downloadFileById", () => {
        //  дергаем функцию
        rc.downloadFileById("fileId", "fileName");
        //  проверки
        expect(nsiService.downloadFileById).toHaveBeenCalledTimes(1);
        expect(nsiService.downloadFileById).toHaveBeenCalledWith("fileId", "fileName");
    });

    describe("ngAfterContentChecked", () => {

        it("selectedTree = null", () => {
            //  передаем пустоту в дерево
            rc.selectedTree = null;
            //  дергаем функцию
            rc.ngAfterContentChecked();
            //  проверки
            expect(rc.selectedPath).toBeNull();
        });

        it("selectedTree != null buildCorrectedPath is called", () => {
            //  передаем значение в дерево
            rc.selectedTree = {
                id: "123",
                name: "testName",
                parentsNameList: ["string1", "string2", "string3"],
                parentsPath: "\\ string1 \\ string2 \\ string3",
            };
            rc.pathWidth = { nativeElement: {
                    clientHeight: 400,
                    clientWidth: 100,
                }};
            //  мокаем функцию
            spyOn(rc, "buildCorrectedPath").and.returnValue("string1");

            // //  дергаем функцию
            rc.ngAfterContentChecked();
            // //  проверки
            expect(rc.selectedPath).toEqual("string1 \\ ... \\ testName");
            expect(rc.buildCorrectedPath).toHaveBeenCalledTimes(1);
            expect(rc.buildCorrectedPath).toHaveBeenCalledWith(["string1"], -2.5);
        });

        it("selectedTree != null buildSelectedPath is called", () => {
            //  передаем значение в дерево
            rc.selectedTree = {
                id: "123",
                name: "testName",
                parentsNameList: ["string1", "string2", "string3"],
                parentsPath: "\\ string1 \\ string2 \\ string3",
            };
            rc.pathWidth = { nativeElement: {
                    clientHeight: 100,
                    clientWidth: 10000,
                }};
            //  мокаем функцию
            spyOn(rc, "buildSelectedPath").and.returnValue("string1");

            // //  дергаем функцию
            rc.ngAfterContentChecked();
            // //  проверки
            expect(rc.selectedPath).toEqual("string1");
            expect(rc.buildSelectedPath).toHaveBeenCalledWith(["string1", "string2"], "testName");
            expect(rc.buildSelectedPath).toHaveBeenCalledTimes(1);
        });
    });

    it("ngOnInit()", () => {
        //  инитим дерево
        rc.selectedTree = null;
        // //  дергаем функцию
        rc.ngOnInit();
        //  делаем асинхрон
        castSelectedTree.next({id: "123"});
        // //  проверки
        expect(rc.selectedTree).toEqual({id: "123"});
    });

    it("openFileInDefaultProgram", () => {
        //  дергаем функцию
        rc.openFileInDefaultProgram("fileId", "fileName");
        //  проверки
        expect(nsiService.openFileById).toHaveBeenCalledTimes(1);
        expect(nsiService.openFileById).toHaveBeenCalledWith("fileId", "fileName");
    });

    it("setChangeableBit", () => {
        //  дергаем функцию
        rc.setChangeableBit();
        //  проверки
        expect(nsiService.changeChangeableBit).toHaveBeenCalledTimes(1);
        expect(nsiService.changeChangeableBit).toHaveBeenCalledWith(true);
    });
});
