// основной урл
export const baseURL: string = "/ЗДЕСЬ_БЫЛО_ОРИГИНАЛЬНОЕ_НАЗВАНИЕ_ПРОЕКТА";

// урл для прокси
export const proxyUrl: string = "/proxy";

// урл для сервиса уведомлений
export const notificationsURL: string = "/notification_service";

// урл для получения настроек
export const settingsUrl: string = "/settings";

// урл для получения общих настроек
export const sharedSettingsUrl: string = "/api/v1/shared_settings";

// получение сведений об авторизации
export const loginURL: string = "/auth_user/api/v1/login";

// получение данных о выходе из авторизации пользователя
export const logoutURL: string = "/auth_user/api/v1/logout";

// получение сведений о пользователе
export const getUserInfoUrl: string = "/user_session_info/api/v1/user_info";

// получение информации по аудиту
export const getAuditUrl: string = "/api/v1/get_audit";

// получение пользовательской настройки
export const getUserSettingsUrl: string = "/api/v1/get_user_settings";

// сохранение пользовательских настроек
export const saveUserSettingsUrl: string = "/api/v1/save_user_settings";

// сброс пользовательских настроек
export const resetUserSettingsUrl: string = "/api/v1/reset_user_personal_settings";

// сохранение пользовательских настроек
export const saveListSettingsUrl: string = "/api/v1/save_settings";

// получение пользовательских настроек
export const getListSettingsUrl: string = "/api/v1/get_settings";

// базовый урл сервисов администрирования
export const administrationUrl: string = "/administration";

// урл для получения прав пользователей
export const userPermissionsUrl: string = "/api/v1/user_permissions";

// базовый урл сервисов мониторинга
export const monitoringUrl: string = "/monitoring";

// урл для получения сведений мониторинга серверов и сервисов
export const getSystemStatusInfoUrl: string = "/api/v2/system_info";

// блокировка и разблокировка сервисов
export const servicesControlUrl: string = "/api/v1/services_control";

// работа(получение и изменение) с настройками проекта
export const systemConfigUrl: string = "/system_conf";

// работа(получение и изменение) с настройками общих папок для обмена с изделиями
export const sharedFoldersConfigUrl: string = "/shared_folders";

// получение версиий программ, входящих в ***
export const progVersionsUrl: string = "/api/v1/versions";

// урл для получения сведений о всех пользователях
export const getAllUsersUrl: string = "/administration/api/v1/user_list";

// урл для получения уведомлений
export const getNotesUrl: string = "/api/v1/note";

// урл для получений количества уведомлений
export const getNotesCountUrl: string = "/count";

// урл для получения классификаторов
export const classifiersUrl: string = "/api/classifiers";

// урл для получения сопоставлений
export const getComparisonV1Url: string = "/api/v1/convert";

// урл для получения/изменения пользовательских настроек по типу, уникальных для пользователей
export const userSettingsUrl: string = "/settings/api/v1/user_settings";

//  НСИ
// урл для НСИ
export const nsiUrl: string = "/nsi";

// урл для вывода фильтрованного дерева
export const nsiGetFilteredTreeNodeUrl: string = "/nsi/api/v1/search";

// урл для добавления новой ноды
export const nsiAddNodeInTreeUrl: string = "/nsi/api/v1/add_node/";

// урл для сворачивания дерева
export const nsiCompressTreeUrl: string = "/nsi/api/v1/close_all_nodes";

// урл для удаления всех файлов из ноды
export const nsiDeleteAllFilesFromNodeUrl: string = "/nsi/api/v1/delete_files/";

// урл для удаления файла по ИД ноды
export const nsiDeleteFileInTreeUrl: string = "/nsi/api/v1/delete_file/";

// урл для удаления ноды
export const nsiDeleteNodeInTreeUrl: string = "/nsi/api/v1/delete_node/";

// урл для разворачивания дерева
export const nsiExpandTreeUrl: string = "/nsi/api/v1/open_all_nodes";

// урл для получения файла по ИД ноды
export const nsiDownloadAllFilesByNodeIdUrl: string = "/nsi/api/v1/get_all_files/";

// урл для получения файла по ИД ноды
export const nsiDownloadFileByIdUrl: string = "/nsi/api/v1/getfile/";

// урл для изменения ноды
export const nsiUpdateNodeInTreeUrl: string = "/nsi/api/v1/edit_node/";

// урл для добавления файлов новой ноды
export const nsiUploadFileInNodeUrl: string = "/nsi/api/v1/upload/";
