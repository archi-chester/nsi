

    //  конвертация файлов в дереве
    //  treeFiles - массив файлов для добавления
    //  serverTreePackage: IServerTreePackage - серверный тип дерева + переменные с количеством узлов для НСИ
    public nsiConvertTreeFilesLtoS(treeFiles: ITreeFile[]): IServerTreeFile[] {
        //  создаем переменные
        let serverFile: IServerTreeFile[] = [];
        //  конвертим основное тело
        if (!isNullOrUndefined(treeFiles)) {
            treeFiles.forEach((file: ITreeFile) => {
                //
                serverFile.push({
                    file_id: isNullOrUndefined(file.id) || file.id === "" ? null : file.id,   //  ID файла
                    header:  isNullOrUndefined(file.header) ||
                        file.header === "" ? null : file.header.trim(),   //  заголовок файла
                    orig_file_name: isNullOrUndefined(file.orig_name) || file.orig_name === "" ?
                        null : file.orig_name,    //  имя файла
                    size: isNullOrUndefined(file.size) ? null : file.size,    //  размер
                    summary:  isNullOrUndefined(file.summary) ||
                        file.summary === "" ? null : file.summary,   //  описание файла
                    upload_date: isNullOrUndefined(file.date) || file.date === "" ?
                        null : file.date,    //  имя файла
                });
            });
        }
        //  вернули результат
        return serverFile;
    }

    // конвертация дерева
    // local: ITree - локальный тип дерева для НСИ
    public nsiConvertTreeLtoS(localTree: ITree): IServerTree {
        //  создаем переменные
        let tree: IServerTree = null;
        //  конвертим основное тело
        if (!isNullOrUndefined(localTree)) {
        tree = {
                children: this.checkArray(localTree.children)
                    .map((child: ITree) => {
                        return this.nsiConvertTreeLtoS(child);
                    }),
                description: localTree.description,  //  описание ноды
                files: this.nsiConvertTreeFilesLtoS(localTree.files),    //  пачка файлов
                id: isNullOrUndefined(localTree.id) ? null : localTree.id,    // ID
                isOpened: localTree.isOpened, //  бит открытия
                name: localTree.name.trim(),  //  имя ноды
                // parent: localTree.parent, //  задел на перспективу
                tags: this.checkArray(localTree.tags),    //  поисковые тэги
            };
        }
        return tree;
    }
