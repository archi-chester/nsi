    // конвертация дерева
    // serverTreePackage: IServerTreePackage - серверный тип дерева + переменные с количеством узлов для НСИ
    public nsiConvertPackageTreeStoL(serverTreePackage: IServerTreePackage): ITreePackage {
        //  проверяем, что передали не нуль
        if (isNullOrUndefined(serverTreePackage)) {
            return null;
        } else {
            //  создаем пакедж
            let packageTree: ITreePackage = {
                //  счетчики
                counts: {
                    amount: !isNullOrUndefined(serverTreePackage.selected) ? serverTreePackage.selected : null,
                    full: !isNullOrUndefined(serverTreePackage.full) ? serverTreePackage.full : null,
                    results: !isNullOrUndefined(serverTreePackage.results) ? serverTreePackage.results : null,
                },
                //  автотеги
                //  tslint:disable-next-line
                suggestions: !isNullOrUndefined(serverTreePackage.suggestions) ? serverTreePackage.suggestions.sort() : null,
                //  дерево
                tree: this.checkArray(serverTreePackage.tree).map((treeNode: IServerTree) => {
                    return this.nsiConvertTreeStoL(treeNode, [treeNode.id], undefined,
                        "", undefined);
                }),
            };
            //  вернули результат
            return packageTree;
        }
    }

    //  конвертация файлов в дереве
    //  serverTreeFiles: массив файлов
    public nsiConvertTreeFilesStoL(serverTreeFiles: IServerTreeFile[]): ITreeFile[] {
        //  создаем переменные
        //  конвертим основное тело
        if (isNullOrUndefined(serverTreeFiles)) {
            //  возвращаем ничего
            return null;
        } else {
            let treeFile: ITreeFile[] = this.checkArray(serverTreeFiles).map((file: IServerTreeFile) => {
                //  формируем каждый файл
                return {
                    //  имя файла
                    date: isNullOrUndefined(file.upload_date) || file.upload_date === "" ? null : file.upload_date,
                    header: isNullOrUndefined(file.header) || file.header === "" ? null : file.header.trim(),  // header
                    id: isNullOrUndefined(file.file_id) || file.file_id === "" ? null : file.file_id,   //  ID файла
                    orig_name: isNullOrUndefined(file.orig_file_name) || file.orig_file_name === "" ?
                        null : file.orig_file_name,    //  имя файла
                    size: isNullOrUndefined(file.size) ? null : file.size,    //  размер
                    summary: isNullOrUndefined(file.summary) || file.summary === "" ? null : file.summary,  // аннотация
                };
                }
            );
            //  вернули результат
            return treeFile;
        }
    }

    //  конвертация дерева
    //  serverTree: IServerTree - серверный тип дерева для НСИ
    //  parentsIDList - массив всех ид до ноды, включая ноду
    //  parentsNameList - массив всех ид до ноды, включая ноду
    //  parentsPath - путь до ноды
    //  parentId - ид родителя
    public nsiConvertTreeStoL(serverTree: IServerTree, parentsIDList: string[], parentsNameList: string[],
                              parentPath: string, parentId: string): ITree {
        //  новый экземпляр списка ид родителей
        let treeIDList: string[] = [];
        //  добавляем копию верхнего списка
        if (!isNullOrUndefined(parentsIDList)) {
            treeIDList = [...parentsIDList];
        }
        //  добавляем текущую ноду
        if (!isNullOrUndefined(serverTree.id) || serverTree.id === "") {
            treeIDList.push(serverTree.id);
        }
        //  новый экземпляр списка имен родителей
        let treeNameList: string[] = [];
        //  добавляем копию верхнего списка
        if (!isNullOrUndefined(parentsNameList)) {
            treeNameList = [...parentsNameList];
        }
        //  добавляем текущую ноду
        if (!isNullOrUndefined(serverTree.name) || serverTree.name === "") {
            treeNameList.push(serverTree.name);
        }
        //  создаем переменные
        let tree: ITree;
        //  конвертим основное тело
        if (!isNullOrUndefined(serverTree)) {
            tree = {
                changed: undefined,                                             //  показатель того, что карточку меняли
                children: this.checkArray(serverTree.children)   //  перебираем детей
                    .map((child: IServerTree) => {
                        return this.nsiConvertTreeStoL(child, treeIDList, treeNameList, parentPath +
                            serverTree.name.trim() + " / ", parentId);
                    }),
                description: serverTree.description,                            //  описание ноды ноды
                files: this.nsiConvertTreeFilesStoL(serverTree.files),          //  пачка файлов
                id: isNullOrUndefined(serverTree.id) ? null : serverTree.id,    //  ID
                isOpened: serverTree.isOpened,                                  //  бит открытия
                name: serverTree.name.trim(),                                   //  имя ноды
                parentId: isNullOrUndefined(parentId) || parentId === "" ? undefined : parentId,  //  ID родителя
                parentsIDList: treeIDList,                                      //  список ID всех но, включая текущую
                parentsNameList: treeNameList,   //  список имен всех, кроме текущего
                parentsPath: parentPath,                                        //  путь до ноды
                tags: this.checkArray(serverTree.tags),                         //  поисковые тэги
            };
        }
        return tree;
    }
