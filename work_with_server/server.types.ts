//  ведение НСИ
// экспорт серверного типа для настроек НСИ
export type IServerNSISettings = {
    settings: {
        proportion: string}
    type: string;
};

//  структура ноды
export interface IServerTree {
    description?: string;   //  поле описания карточки
    id: string;    // ID
    isOpened?: boolean; //  бит для отображения открытой/закрытой папки
    name?: string;  //  имя файла
    children?: IServerTree[]; //  дети такие же ноды
    parent?: IServerTree; //  задел на перспективу
    tags?: string[];    //  поисковые тэги
    files?: IServerTreeFile[];    //  пачка файлов
}

//  поля файлов для ноды
export interface IServerTreeFile {
    file_id: string;    //  ID файла
    header?: string;    //  заголовок
    summary?: string;   //  аннотация
    orig_file_name: string; //  имя файла
    size?: number;  //  размер
    upload_date?: string;   //  дата изменения
}

//  заготовка под прием количества документов
//  приходящий с сервера пакет
export interface IServerTreePackage {
    tree: IServerTree[];    //  дерево
    full: number;           //  количество элементов в базе
    results?: number;       //  найдено элементов в результате поиска
    selected: number;       //  отображено элеменитов в результате поиска
    suggestions?: string[]; //  предложенные теги в результате поиска
}
