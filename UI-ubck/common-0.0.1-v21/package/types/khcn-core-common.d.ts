import { HttpContextToken } from '@angular/common/http';
import { Observable, OperatorFunction } from 'rxjs';
import * as i0 from '@angular/core';
import { WritableSignal, ViewContainerRef, ElementRef, TemplateRef, InjectionToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

interface IHttpApiResponse<R> {
    data: R;
    httpStatus: string;
    resultCode: number;
    resultMsg: string;
    correlationId: string;
    responseTimestamp: string;
}
type HttpRequestMetadata = {
    [key: string]: unknown;
    ignoreLoadingIndicator?: boolean;
    ignoreErrorHandler?: boolean;
    ignoreRefreshToken?: boolean;
    crudHandlerType?: 'create' | 'read' | 'update' | 'delete';
};
declare abstract class HttpApiServiceConfig {
    abstract get<R>(baseUrl: string | null, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    abstract post<R, T>(baseUrl: string | null, body: T, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    abstract put<R, T>(baseUrl: string | null, body: T, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    abstract delete<R>(baseUrl: string | null, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    abstract patch<R, T>(baseUrl: string | null, body: T, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
}
declare class HttpApiService extends HttpApiServiceConfig {
    private http;
    static REQUEST_ID: HttpContextToken<string>;
    static HTTP_METADATA: HttpContextToken<HttpRequestMetadata>;
    protected environment: {
        apiUrl: string;
    } & Record<string, unknown>;
    protected transformerResponse<T>(): OperatorFunction<IHttpApiResponse<T>, T>;
    get<R>(baseUrl: string | null, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    post<R, T>(baseUrl: string | null, body: T, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    put<R, T>(baseUrl: string | null, body: T, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    delete<R>(baseUrl: string | null, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    patch<R, T>(baseUrl: string | null, body: T, endpoint: string, options?: {
        [key: string]: unknown;
    }): Observable<R>;
    handleParseUrl(baseUrl: string | null, endpoint: string, options?: {
        [key: string]: unknown;
    }): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HttpApiService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HttpApiService>;
}

type UBCKPermissionModel = {
    permission: string;
    description: string;
    code?: string;
    id?: string;
    path?: string;
    resource?: string;
} & Record<string, any>;
type PermissionConverterFnc = <T>(arg: T) => UBCKPermissionModel[];

declare abstract class PermissionServiceContract {
    protected abstract getPermissions(): Observable<UBCKPermissionModel[]>;
    protected abstract converter: PermissionConverterFnc;
}
declare class PermissionService extends PermissionServiceContract {
    getPermissions(): Observable<UBCKPermissionModel[]>;
    converter: PermissionConverterFnc;
    static ɵfac: i0.ɵɵFactoryDeclaration<PermissionService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PermissionService>;
}

declare abstract class PermissionStoreContract {
    abstract permissions: WritableSignal<UBCKPermissionModel[]>;
    abstract permissionsSet: WritableSignal<string[]>;
    abstract canAccess(permission: string | string[]): boolean;
    abstract loadPermissions(): void;
    abstract getPermissionAsync(): Observable<UBCKPermissionModel[]>;
    abstract getPermissionSetAsync(): Observable<string[]>;
    abstract setPermissions(permissions: UBCKPermissionModel[]): void;
    abstract loadPermissionsObservable(): Observable<UBCKPermissionModel[]>;
}
/**
 * PermissionStore service implementing the PermissionStoreContract.
 * Provides methods to manage and retrieve permissions.
 */
declare class PermissionStore extends PermissionStoreContract {
    readonly permissions: WritableSignal<UBCKPermissionModel[]>;
    readonly permissionsSet: WritableSignal<string[]>;
    private permissionService;
    loadPermissions(): void;
    loadPermissionsObservable(): Observable<UBCKPermissionModel[]>;
    canAccess(permission: string | string[], type?: 'equal' | 'startsWith'): boolean;
    getPermissionAsync(): Observable<UBCKPermissionModel[]>;
    getPermissionSetAsync(): Observable<string[]>;
    setPermissions(permissions: UBCKPermissionModel[]): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PermissionStore, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PermissionStore>;
}

/**
 *  Định nghĩa kiểu dữ liệu log thay đổi dữ liệu chung
 */
interface UbckHistoryChange {
    /**
     * ID của log (UUID)
     */
    logId: string;
    /**
     * Code từ bảng JOIN
     */
    entityCode?: string;
    /**
     * Name từ bảng JOIN
     */
    entityName?: string;
    /**
     * Thời gian cập nhật entity (OffsetDateTime -> JS Date)
     */
    updatedEntityAt?: string | null;
    /**
     * Người cập nhật
     */
    updatedByName?: string;
    /**
     * Nghiệp vụ ghi nhận
     */
    actionCustom?: string;
    /**
     * Chi tiết thay đổi (JSON object or raw string)
     */
    dataChange?: any;
}
declare const UbckACTION_CUSTOM_ENUM: {
    readonly CREATE: "CREATE";
    readonly UPDATE: "UPDATE";
    readonly DELETE: "DELETE";
};
type UbckActionCustomType = (typeof UbckACTION_CUSTOM_ENUM)[keyof typeof UbckACTION_CUSTOM_ENUM];
declare const UBCK_ACTION_CUSTOM_TRANSFORM_LABEL: Record<UbckActionCustomType, string>;

declare class HistoryChangeMapper<T extends Record<string, unknown>> {
    static readonly split_char = "[to]";
    static readonly separator = ", ";
    private readonly translateService;
    /**
     * Converts a change string into HTML format showing old vs new values.
     *
     * @param value - The change string to parse (same format as extractChangedFields).
     * @param labelMap -  mapping from field keys to display labels.
     *                   If not provided, field keys will be used as labels.
     * @returns HTML string with changes formatted as strikethrough old values and new values.
     *
     * @example
     * // UPDATE case:
     * const dataChange = "code=ADMIN_SSO_TEST_UPDATE336543423312 [to] ADMIN_SSO_TEST_UPDATE2, name=Admin [to] Admin Updated";
     * const labelMap = { code: 'Mã vai trò', name: 'Tên vai trò' };
     * const html = instance.extractChangedFieldsAsHtml(dataChange, labelMap);
     * // Returns:
     * // <div>Mã vai trò: <span class="line-through">ADMIN_SSO_TEST_UPDATE336543423312</span> -> <span>ADMIN_SSO_TEST_UPDATE2</span></div>
     * // <div>Tên vai trò: <span class="line-through">Admin</span> -> <span>Admin Updated</span></div>
     *
     * // CREATE case (no [to]):
     * const dataChange = "id=019be4b5-0f2b-7588-b477-421385d086e7";
     * // Returns:
     * // <div>id: <span>019be4b5-0f2b-7588-b477-421385d086e7</span></div>
     */
    extractChangedFieldsAsHtml(value: string, labelMap: T, { separator: sep, splitChar: splitChar, }?: {
        separator?: string | undefined;
        splitChar?: string | undefined;
    }): string;
    /**
     * extact action type
     */
    extractActionType(actionCustom: UbckActionCustomType, entityname: string): string;
    /**
     * check empty array, null, undefined
     * @param value - The value to check
     * @returns true if the value is an empty array, null, or undefined; otherwise, false.
     */
    isEmptyValue(value: any): boolean;
    /**
     * Recursively formats values, translating object keys and handling nested structures.
     *
     * @param value - The value to format (can be primitive, array, or object)
     * @returns Formatted string representation with translated keys
     *
     * @example
     * // String/number/boolean - returned as-is
     * formatValueRecursive("test") // "test"
     * formatValueRecursive(123) // "123"
     *
     * // Array of primitives
     * formatValueRecursive(["a", "b"]) // "a, b"
     *
     * // Array of objects
     * formatValueRecursive([{fullName: "John", email: "john@example.com"}])
     * // "Họ và tên: John, Email: john@example.com" (with translated keys)
     *
     * // Nested object
     * formatValueRecursive({fullName: "John", contact: {email: "john@example.com"}})
     * // "Họ và tên: John, Liên hệ: Email: john@example.com"
     * "{\"members\":{\"fieldName\":\"members\",\"type\":\"COLLECTION\",\"oldValue\":null,\"newValue\":null,\"added\":[],\"removed\":[{\"fullName\":\"tuoitb\",\"userId\":\"019cac55-b9c5-7d9d-abed-e7eafee5e286\",\"email\":\"tuoitb@ssc.gov.vn\",\"username\":\"tuoitb\"}]}}"
  
     */
    private formatValueRecursive;
    /**
     * Transforms log data with support for FIELD and collection types.
     *
     * @param jsonInput - JSON string with schema containing fields with type "FIELD" or "collection"
     * @param labelMap - Translation mapper for field names
     * @param actionType - The action type: 'CREATE', 'UPDATE', or 'DELETE'
     * @returns HTML string with formatted changes
     *
     * @example
     * const input = JSON.stringify({
     *   username: { fieldName: "username", type: "FIELD", oldValue: "old", newValue: "new" },
     *   roles: {
     *     fieldName: "roles",
     *     type: "collection",
     *     oldValue: null,
     *     newValue: null,
     *     added: [{ id: "1", name: "ADMIN" }],
     *     removed: [{ id: "2", name: "USER" }]
     *   }
     * });
     * const html = mapper.transformLogWithCollections(input, labelMap, 'UPDATE');
     */
    extractChangedFieldsAsHtmlV2(jsonInput: string, labelMap: T, actionType: 'CREATE' | 'UPDATE' | 'DELETE', statusKey?: string): string;
    escapeHtml(text: string): string;
    escapeDataChangeValues(dataChange: any): any;
    /**
     * Formats a FIELD type change
     */
    private formatFieldChange;
    /**
     * Formats a collection type change
     */
    private formatCollectionChange;
    /**
     *
     * @param dataChange object change
     * @param statusMapper mapping of status keys to their translations
     * @returns dataChange object with status value transformed to its translation based on the provided mapper
      * @example
     * const dataChange = "status=ACTIVE [to] INACTIVE";
     * const statusMapper = { ACTIVE: 'Kích hoạt', INACTIVE: 'Không kích hoạt' };
     * const result = handleTransformStatus(dataChange, statusMapper);
     * // result will be 'Kích hoạt [to] Không kích hoạt'
     *
     * const dataChange = "status=ACTIVE";
     * const statusMapper = { ACTIVE: 'Kích hoạt', INACTIVE: 'Không kích hoạt' };
     * const result = handleTransformStatus(dataChange, statusMapper);
     * // result will be 'Kích hoạt'
     */
    handleTransformStatus(dataChange: Record<string, any>, mapper: T, statusKey?: string): Record<string, any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HistoryChangeMapper<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HistoryChangeMapper<any>>;
}

declare class WithPermission {
    hasPermission: i0.WritableSignal<boolean>;
    requirePermission: i0.InputSignal<string[]>;
    private readonly permissionStore;
    readonly viewContainerRef: ViewContainerRef;
    readonly elementRef: ElementRef<any>;
    templateRef: TemplateRef<any> | null;
    permissionCheck: i0.EffectRef;
    static ɵfac: i0.ɵɵFactoryDeclaration<WithPermission, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<WithPermission, "[withPermissions]", ["withPermissions"], { "requirePermission": { "alias": "withPermissions"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare const PRIMENG_TRANSLATE: InjectionToken<PrimeNG>;
declare function primeNGTranslateFactory(translateService: TranslateService, primeng: PrimeNG): PrimeNG;

export { HistoryChangeMapper, HttpApiService, HttpApiServiceConfig, PRIMENG_TRANSLATE, PermissionService, PermissionServiceContract, PermissionStore, PermissionStoreContract, UBCK_ACTION_CUSTOM_TRANSFORM_LABEL, UbckACTION_CUSTOM_ENUM, WithPermission, primeNGTranslateFactory };
export type { HttpRequestMetadata, IHttpApiResponse, PermissionConverterFnc, UBCKPermissionModel, UbckActionCustomType, UbckHistoryChange };
