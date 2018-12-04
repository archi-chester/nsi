//  структура ноды
export interface ITree {
    id: string;                 //  ID
    isOpened?: boolean;         //  бит для отображения открытой/закрытой папки
    isLoadingFile?: boolean;    //  бит загрузки файла
    name?: string;              //  имя файла
    children?: ITree[];         //  дети такие же ноды
    changed?: boolean;          //  признак изменений в ноде (нужно для отображения иконки тербуется запись)
    description?: string;       //  поле описания документа
    parentId?: string;          //  ID родителя
    parentsIDList?: string[];   //  список ID всех верхних нод, включая текущую
    parentsNameList?: string[]; //  список Name всех верхних нод, включая текущую
    parentsPath?: string;       //  путь к ноде
    path?: string[];            //  ID верхних нод для отслеживания иерархии
    tags?: string[];            //  поисковые тэги
    files?: ITreeFile[];        //  пачка файлов
}

export interface ITreeCounts {
    full: number;       //  количество узлов всего
    amount: number;     //  количество узлов после фильтрации
    results?: number;   //  количество узлов, найденных в результате поиска
}

//  поля файлов для ноды
export interface ITreeFile {
    id: string;         //  ID файла
    header?: string;    //  заголовок
    summary?: string;   //  аннотация
    orig_name: string;  //  имя файла
    size?: number;      //  размер
    date?: string;      //  дата изменения
}

//  описание приходящего с сервера пакета
export interface ITreePackage {
    tree: ITree[];          //  tree
    counts: ITreeCounts;    //  счетчики
    suggestions?: string[]; //  предложенные по результатам поиска теги
}
