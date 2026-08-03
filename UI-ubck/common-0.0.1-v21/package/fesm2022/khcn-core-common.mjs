import { HttpClient, HttpContextToken } from '@angular/common/http';
import * as i0 from '@angular/core';
import { inject, Injectable, signal, input, ViewContainerRef, ElementRef, TemplateRef, effect, Directive, InjectionToken } from '@angular/core';
import { map, Observable, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import DOMPurify from 'dompurify';

class HttpApiServiceConfig {
}
class HttpApiService extends HttpApiServiceConfig {
    http = inject(HttpClient);
    static REQUEST_ID = new HttpContextToken(() => 'REQUEST_ID');
    static HTTP_METADATA = new HttpContextToken(() => ({
        ignoreLoadingIndicator: false,
        ignoreErrorHandler: false,
        ignoreRefreshToken: false,
    }));
    environment = {
        apiUrl: '',
    };
    transformerResponse() {
        return map((response) => response.data);
    }
    get(baseUrl, endpoint, options = {}) {
        const api = this.handleParseUrl(baseUrl, endpoint, options);
        return this.http
            .get(api, options)
            .pipe(this.transformerResponse());
    }
    post(baseUrl, body, endpoint, options = {}) {
        const api = this.handleParseUrl(baseUrl, endpoint, options);
        return this.http
            .post(api, body, options)
            .pipe(this.transformerResponse());
    }
    put(baseUrl, body, endpoint, options = {}) {
        const api = this.handleParseUrl(baseUrl, endpoint, options);
        return this.http
            .put(api, body, options)
            .pipe(this.transformerResponse());
    }
    delete(baseUrl, endpoint, options = {}) {
        const api = this.handleParseUrl(baseUrl, endpoint, options);
        return this.http
            .delete(api, options)
            .pipe(this.transformerResponse());
    }
    patch(baseUrl, body, endpoint, options = {}) {
        const api = this.handleParseUrl(baseUrl, endpoint, options);
        return this.http
            .patch(api, body, options)
            .pipe(this.transformerResponse());
    }
    handleParseUrl(baseUrl, endpoint, options = {}) {
        const keys = Object.keys(options);
        let finalEndpoint = endpoint;
        let finalBaseUrl = baseUrl;
        let api = '';
        for (const key of keys) {
            finalEndpoint = finalEndpoint.replace(`{${key}}`, options[key]);
        }
        if (!finalBaseUrl) {
            finalBaseUrl = this.environment.apiUrl;
        }
        api = finalBaseUrl + finalEndpoint;
        return api;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: HttpApiService, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: HttpApiService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: HttpApiService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });

class PermissionServiceContract {
}
//  demo implementation of PermissionService with contract
class PermissionService extends PermissionServiceContract {
    getPermissions() {
        return new Observable((observer) => {
            setTimeout(() => {
                observer.next(Array.from({ length: 1000 }, (_v, k) => {
                    return {
                        permission_id: `permission_${k}`,
                        description: `Description for permission_${k}`
                    };
                }));
                observer.complete();
            }, 3000);
        }).pipe(map((data) => this.converter(data)));
    }
    converter = (arg) => {
        let argument = arg;
        return argument.map(item => {
            return {
                permission: item.permission_id,
                description: item.description
            };
        });
    };
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: PermissionService, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: PermissionService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: PermissionService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });

class PermissionStoreContract {
}
/**
 * PermissionStore service implementing the PermissionStoreContract.
 * Provides methods to manage and retrieve permissions.
 */
class PermissionStore extends PermissionStoreContract {
    permissions = signal([], ...(ngDevMode ? [{ debugName: "permissions" }] : /* istanbul ignore next */ []));
    permissionsSet = signal([], ...(ngDevMode ? [{ debugName: "permissionsSet" }] : /* istanbul ignore next */ []));
    permissionService = inject(PermissionService);
    loadPermissions() {
        this.loadPermissionsObservable().subscribe();
    }
    loadPermissionsObservable() {
        return this.permissionService.getPermissions().pipe(take(1), map(res => {
            this.permissions.set(res);
            this.permissionsSet.set(this.permissions()?.map(perm => perm['permission']) || []);
            return res;
        }));
    }
    canAccess(permission, type = 'equal') {
        let ok = false;
        const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
        switch (type) {
            case 'equal':
                ok = permissionsToCheck.some(p => this.permissionsSet().includes(p));
                break;
            case 'startsWith':
                ok = permissionsToCheck.some(p => this.permissionsSet().some(sp => sp.startsWith(p)));
                break;
        }
        return ok;
    }
    getPermissionAsync() {
        return this.permissionService.getPermissions();
    }
    getPermissionSetAsync() {
        return this.permissionService.getPermissions().pipe(
        // Map to extract only permission strings
        map(perms => perms.map(perm => perm['permission'])));
    }
    setPermissions(permissions) {
        this.permissions.set(permissions);
        this.permissionsSet.set(permissions.map(perm => perm['permission']));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: PermissionStore, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: PermissionStore, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: PermissionStore, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });

//  add thêm loại action CUSTOM_ENUM nếu cần
// không xóa các loại action khác
const UbckACTION_CUSTOM_ENUM = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
};
const UBCK_ACTION_CUSTOM_TRANSFORM_LABEL = {
    CREATE: 'COMMON.ACTION_TYPE.CREATE',
    UPDATE: 'COMMON.ACTION_TYPE.UPDATE',
    DELETE: 'COMMON.ACTION_TYPE.DELETE',
};

class HistoryChangeMapper {
    static split_char = '[to]';
    static separator = ', ';
    translateService = inject(TranslateService);
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
    extractChangedFieldsAsHtml(value, labelMap, { separator: sep = HistoryChangeMapper.separator, splitChar: splitChar = HistoryChangeMapper.split_char, } = {}) {
        if (!value) {
            return '';
        }
        const dataChange = value.replaceAll(/{|}/g, '');
        const fields = dataChange.split(sep);
        const htmlParts = [];
        try {
            for (const field of fields) {
                const [key, rest] = field.split('=');
                if (!(key && rest)) {
                    continue;
                }
                const trimmedKey = key.trim();
                const label = this.translateService.instant(labelMap?.[trimmedKey] || '') || trimmedKey;
                // Check if this is an UPDATE (has [to]) or CREATE (no [to])
                if (rest.includes(splitChar)) {
                    // UPDATE case: show old value with line-through and new value
                    const [oldValue, newValue] = rest.split(splitChar).map((s) => s.trim());
                    if (newValue !== undefined) {
                        const htmlLine = `<div>${label}: <span class="line-through">${oldValue}</span> → <span>${newValue}</span></div>`;
                        htmlParts.push(htmlLine);
                    }
                }
                else {
                    // CREATE case: only show the new value without line-through
                    const value = rest.trim();
                    const htmlLine = `<div>${label}: <span>${value}</span></div>`;
                    htmlParts.push(htmlLine);
                }
            }
        }
        catch (error) {
            console.error('Error parsing change string:', error);
        }
        return DOMPurify.sanitize(htmlParts.join(''));
    }
    /**
     * extact action type
     */
    extractActionType(actionCustom, entityname) {
        return this.translateService.instant(UBCK_ACTION_CUSTOM_TRANSFORM_LABEL[actionCustom], {
            entityName: this.translateService.instant(entityname),
        });
    }
    /**
     * check empty array, null, undefined
     * @param value - The value to check
     * @returns true if the value is an empty array, null, or undefined; otherwise, false.
     */
    isEmptyValue(value) {
        return value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
    }
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
    formatValueRecursive(value, mapper) {
        // Handle null/undefined
        if (value === null || value === undefined) {
            return '';
        }
        // Handle primitive types (string, number, boolean)
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        // Handle arrays
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '';
            }
            return value
                .map(item => this.formatValueRecursive(item, mapper))
                .filter(v => v)
                .join('; ');
        }
        // Handle objects
        if (typeof value === 'object') {
            const parts = [];
            for (const [key, val] of Object.entries(value)) {
                const translatedKey = this.translateService.instant(mapper?.[key] || key);
                const formattedValue = this.formatValueRecursive(val, mapper);
                if (formattedValue) {
                    parts.push(`${translatedKey}: ${formattedValue}`);
                }
            }
            return parts.join(', ');
        }
        return String(value);
    }
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
    extractChangedFieldsAsHtmlV2(jsonInput, labelMap, actionType, statusKey = 'status') {
        if (!jsonInput) {
            return '';
        }
        try {
            let logData = JSON.parse(jsonInput);
            logData = this.escapeDataChangeValues(logData);
            logData = this.handleTransformStatus(logData, labelMap, statusKey);
            const htmlParts = [];
            for (const [key, change] of Object.entries(logData)) {
                const changeData = change;
                const fieldName = changeData.fieldName || key;
                const labelKey = labelMap?.[fieldName];
                if (!labelKey) {
                    console.warn('Missing translation key, please check!', `${fieldName}`);
                }
                const label = labelKey ? this.translateService.instant(labelKey) : fieldName;
                if (!changeData.type || changeData.type === 'FIELD') {
                    // Handle FIELD type
                    const htmlLine = this.formatFieldChange(label, changeData.oldValue, changeData.newValue, actionType, labelMap);
                    if (htmlLine) {
                        htmlParts.push(htmlLine);
                    }
                }
                else if (changeData.type === 'collection' || changeData.type === 'COLLECTION') {
                    // Handle collection type
                    const htmlLine = this.formatCollectionChange(label, changeData, actionType, labelMap);
                    if (htmlLine) {
                        htmlParts.push(htmlLine);
                    }
                }
            }
            return DOMPurify.sanitize(htmlParts.join(' '));
        }
        catch (error) {
            console.error('Error parsing log data:', error);
            return '';
        }
    }
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    ;
    escapeDataChangeValues(dataChange) {
        const escaped = {};
        for (const key in dataChange) {
            if (dataChange[key] && typeof dataChange[key] === 'object') {
                escaped[key] = {
                    ...dataChange[key],
                    newValue: typeof dataChange[key].newValue === 'string'
                        ? this.escapeHtml(dataChange[key].newValue)
                        : dataChange[key].newValue,
                    oldValue: typeof dataChange[key].oldValue === 'string'
                        ? this.escapeHtml(dataChange[key].oldValue)
                        : dataChange[key].oldValue,
                };
            }
            else {
                escaped[key] = dataChange[key];
            }
        }
        return escaped;
    }
    ;
    /**
     * Formats a FIELD type change
     */
    formatFieldChange(label, oldValue, newValue, actionType, labelMap) {
        if (actionType === 'DELETE') {
            // DELETE: show oldValue with strikethrough
            const displayValue = !this.isEmptyValue(oldValue) ? this.formatValueRecursive(oldValue, labelMap) : 'Null';
            return `<div>${label}: <span class="line-through" style="word-break: break-word">${displayValue}</span></div>`;
        }
        else if (actionType === 'UPDATE') {
            // UPDATE: show oldValue with strikethrough -> newValue
            const displayOldValue = !this.isEmptyValue(oldValue) ? this.formatValueRecursive(oldValue, labelMap) : null;
            const displayNewValue = !this.isEmptyValue(newValue) ? this.formatValueRecursive(newValue, labelMap) : null;
            if (!displayOldValue) {
                // Only render new value if old value is null
                return `<div>${label}: <span style="word-break: break-word">${displayNewValue}</span></div>`;
            }
            if (!displayNewValue && displayOldValue) {
                return `<div>${label}: <span class="line-through" style="word-break: break-word">${displayOldValue}</span></div>`;
            }
            return `<div>${label}: <span class="line-through" style="word-break: break-word">${displayOldValue}</span> → <span style="word-break: break-word">${displayNewValue}</span></div>`;
        }
        else if (actionType === 'CREATE') {
            // CREATE: show newValue only
            const displayValue = !this.isEmptyValue(newValue) ? this.formatValueRecursive(newValue, labelMap) : 'Null';
            return `<div>${label}: <span style="word-break: break-word">${displayValue}</span></div>`;
        }
        return '';
    }
    /**
     * Formats a collection type change
     */
    formatCollectionChange(label, changeData, actionType, labelMap) {
        const added = changeData.added || [];
        const removed = changeData.removed || [];
        const parts = [];
        const ADDED_KEY = labelMap['ADDED_KEY'] ? this.translateService.instant(labelMap['ADDED_KEY']) : 'Thêm';
        const REMOVED_KEY = labelMap['REMOVED_KEY'] ? this.translateService.instant(labelMap['REMOVED_KEY']) : 'Xóa';
        if (actionType === 'UPDATE') {
            // UPDATE: handle both added and removed
            if (added.length > 0) {
                const addedValues = added.map((item) => Object.values(item).join(', ')).join('; ');
                parts.push(`<div>${ADDED_KEY} ${label}: <span style="word-break: break-word">${addedValues}</span></div>`);
            }
            if (removed.length > 0) {
                const removedValues = removed.map((item) => Object.values(item).join(', ')).join('; ');
                parts.push(`<div>${REMOVED_KEY} ${label}: <span class="line-through" style="word-break: break-word">${removedValues}</span></div>`);
            }
        }
        else if (actionType === 'CREATE') {
            // CREATE: show added without strikethrough
            if (added.length > 0) {
                const addedValues = added.map((item) => Object.values(item).join(', ')).join('; ');
                parts.push(`<div>${ADDED_KEY} ${label}: <span style="word-break: break-word">${addedValues}</span></div>`);
            }
        }
        else if (actionType === 'DELETE') {
            // DELETE: show removed with strikethrough
            if (removed.length > 0) {
                const removedValues = removed.map((item) => Object.values(item).join(', ')).join('; ');
                parts.push(`<div>${REMOVED_KEY} ${label}: <span class="line-through" style="word-break: break-word">${removedValues}</span></div>`);
            }
        }
        return parts.join('');
    }
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
    handleTransformStatus(dataChange, mapper, statusKey = 'status') {
        // check if status is key level 1 in dataChange
        let response = dataChange;
        const keyMatch = Object.keys(dataChange).find(key => key === statusKey);
        if (keyMatch) {
            const value = dataChange[keyMatch];
            if (value) {
                const oldValueKey = mapper?.[value['oldValue']];
                const newValueKey = mapper?.[value['newValue']];
                value['oldValue'] = oldValueKey ? this.translateService.instant(oldValueKey) : value['oldValue'];
                value['newValue'] = newValueKey ? this.translateService.instant(newValueKey) : value['newValue'];
            }
            response = {
                ...dataChange,
                [statusKey]: value,
            };
        }
        return response;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: HistoryChangeMapper, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: HistoryChangeMapper, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: HistoryChangeMapper, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });

class WithPermission {
    hasPermission = signal(false, ...(ngDevMode ? [{ debugName: "hasPermission" }] : /* istanbul ignore next */ []));
    requirePermission = input.required({ ...(ngDevMode ? { debugName: "requirePermission" } : /* istanbul ignore next */ {}), alias: 'withPermissions' });
    permissionStore = inject(PermissionStore);
    viewContainerRef = inject(ViewContainerRef);
    elementRef = inject(ElementRef);
    templateRef = inject((TemplateRef), { optional: true });
    permissionCheck = effect(() => {
        if (!this.templateRef) {
            console.warn('withPermissions directive requires a TemplateRef. Please use it on an ng-template element.');
            return;
        }
        this.viewContainerRef.clear();
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        const hasPermission = (this.permissionStore.permissionsSet()).some(p => this.requirePermission().includes(p));
        this.hasPermission.set(hasPermission);
    }, ...(ngDevMode ? [{ debugName: "permissionCheck" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: WithPermission, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "21.2.5", type: WithPermission, isStandalone: true, selector: "[withPermissions]", inputs: { requirePermission: { classPropertyName: "requirePermission", publicName: "withPermissions", isSignal: true, isRequired: true, transformFunction: null } }, exportAs: ["withPermissions"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: WithPermission, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[withPermissions]',
                    exportAs: 'withPermissions'
                }]
        }], propDecorators: { requirePermission: [{ type: i0.Input, args: [{ isSignal: true, alias: "withPermissions", required: true }] }] } });

var en = {
    startsWith: 'Starts with',
    contains: 'Contains',
    notContains: 'Not contains',
    endsWith: 'Ends with',
    equals: 'Equals',
    notEquals: 'Not equals',
    noFilter: 'No Filter',
    lt: 'Less than',
    lte: 'Less than or equal to',
    gt: 'Greater than',
    gte: 'Greater than or equal to',
    is: 'Is',
    isNot: 'Is not',
    before: 'Before',
    after: 'After',
    dateIs: 'Date is',
    dateIsNot: 'Date is not',
    dateBefore: 'Date is before',
    dateAfter: 'Date is after',
    clear: 'Clear',
    apply: 'Apply',
    matchAll: 'Match All',
    matchAny: 'Match Any',
    addRule: 'Add Rule',
    removeRule: 'Remove Rule',
    accept: 'Yes',
    reject: 'No',
    choose: 'Choose',
    upload: 'Upload',
    cancel: 'Cancel',
    pending: 'Pending',
    fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    chooseYear: 'Choose Year',
    chooseMonth: 'Choose Month',
    chooseDate: 'Choose Date',
    prevDecade: 'Previous Decade',
    nextDecade: 'Next Decade',
    prevYear: 'Previous Year',
    nextYear: 'Next Year',
    prevMonth: 'Previous Month',
    nextMonth: 'Next Month',
    prevHour: 'Previous Hour',
    nextHour: 'Next Hour',
    prevMinute: 'Previous Minute',
    nextMinute: 'Next Minute',
    prevSecond: 'Previous Second',
    nextSecond: 'Next Second',
    am: 'am',
    pm: 'pm',
    dateFormat: 'mm/dd/yy',
    firstDayOfWeek: 0,
    today: 'Today',
    weekHeader: 'Wk',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    passwordPrompt: 'Enter a password',
    emptyMessage: 'No results found',
    searchMessage: 'Search results are available',
    selectionMessage: '{0} items selected',
    emptySelectionMessage: 'No selected item',
    emptySearchMessage: 'No results found',
    emptyFilterMessage: 'No results found',
    fileChosenMessage: 'Files',
    noFileChosenMessage: 'No file chosen',
    aria: {
        trueLabel: 'True',
        falseLabel: 'False',
        nullLabel: 'Not Selected',
        star: '1 star',
        stars: '{star} stars',
        selectAll: 'All items selected',
        unselectAll: 'All items unselected',
        close: 'Close',
        previous: 'Previous',
        next: 'Next',
        navigation: 'Navigation',
        scrollTop: 'Scroll Top',
        moveTop: 'Move Top',
        moveUp: 'Move Up',
        moveDown: 'Move Down',
        moveBottom: 'Move Bottom',
        moveToTarget: 'Move to Target',
        moveToSource: 'Move to Source',
        moveAllToTarget: 'Move All to Target',
        moveAllToSource: 'Move All to Source',
        pageLabel: '{page}',
        firstPageLabel: 'First Page',
        lastPageLabel: 'Last Page',
        nextPageLabel: 'Next Page',
        prevPageLabel: 'Previous Page',
        rowsPerPageLabel: 'Rows per page',
        previousPageLabel: 'Previous Page',
        jumpToPageDropdownLabel: 'Jump to Page Dropdown',
        jumpToPageInputLabel: 'Jump to Page Input',
        selectRow: 'Row Selected',
        unselectRow: 'Row Unselected',
        expandRow: 'Row Expanded',
        collapseRow: 'Row Collapsed',
        showFilterMenu: 'Show Filter Menu',
        hideFilterMenu: 'Hide Filter Menu',
        filterOperator: 'Filter Operator',
        filterConstraint: 'Filter Constraint',
        editRow: 'Row Edit',
        saveEdit: 'Save Edit',
        cancelEdit: 'Cancel Edit',
        listView: 'List View',
        gridView: 'Grid View',
        slide: 'Slide',
        slideNumber: '{slideNumber}',
        zoomImage: 'Zoom Image',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        rotateRight: 'Rotate Right',
        rotateLeft: 'Rotate Left',
        listLabel: 'Option List',
        selectColor: 'Select a color',
        removeLabel: 'Remove',
        browseFiles: 'Browse Files',
        maximizeLabel: 'Maximize'
    }
};

var vi = {
    startsWith: 'Bắt đầu với',
    contains: 'Chứa',
    notContains: 'Không chứa',
    endsWith: 'Kết thúc với',
    equals: 'Bằng',
    notEquals: 'Không bằng',
    noFilter: 'Không lọc',
    lt: 'Nhỏ hơn',
    lte: 'Nhỏ hơn hoặc bằng',
    gt: 'Lớn hơn',
    gte: 'Lớn hơn hoặc bằng',
    is: 'Là',
    isNot: 'Không là',
    before: 'Trước',
    after: 'Sau',
    dateIs: 'Ngày là',
    dateIsNot: 'Ngày không là',
    dateBefore: 'Ngày trước',
    dateAfter: 'Ngày sau',
    clear: 'Xóa',
    apply: 'Áp dụng',
    matchAll: 'Khớp tất cả',
    matchAny: 'Khớp bất kỳ',
    addRule: 'Thêm quy tắc',
    removeRule: 'Xóa quy tắc',
    accept: 'Có',
    reject: 'Không',
    choose: 'Chọn',
    upload: 'Tải lên',
    cancel: 'Hủy',
    pending: 'Đang chờ',
    fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    dayNamesMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    monthNames: ['Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'],
    monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
    chooseYear: 'Chọn năm',
    chooseMonth: 'Chọn tháng',
    chooseDate: 'Chọn ngày',
    prevDecade: 'Thập kỷ trước',
    nextDecade: 'Thập kỷ sau',
    prevYear: 'Năm trước',
    nextYear: 'Năm sau',
    prevMonth: 'Tháng trước',
    nextMonth: 'Tháng sau',
    prevHour: 'Giờ trước',
    nextHour: 'Giờ sau',
    prevMinute: 'Phút trước',
    nextMinute: 'Phút sau',
    prevSecond: 'Giây trước',
    nextSecond: 'Giây sau',
    am: 'sáng',
    pm: 'chiều',
    dateFormat: 'dd/mm/yy',
    firstDayOfWeek: 1,
    today: 'Hôm nay',
    weekHeader: 'Tuần',
    weak: 'Yếu',
    medium: 'Trung bình',
    strong: 'Mạnh',
    passwordPrompt: 'Nhập mật khẩu',
    emptyMessage: 'Không tìm thấy kết quả',
    searchMessage: 'Kết quả tìm kiếm khả dụng',
    selectionMessage: '{0} mục đã chọn',
    emptySelectionMessage: 'Không có mục được chọn',
    emptySearchMessage: 'Không tìm thấy kết quả',
    emptyFilterMessage: 'Không tìm thấy kết quả',
    fileChosenMessage: 'Tệp',
    noFileChosenMessage: 'Chưa chọn tệp',
    aria: {
        trueLabel: 'Đúng',
        falseLabel: 'Sai',
        nullLabel: 'Chưa chọn',
        star: '1 sao',
        stars: '{star} sao',
        selectAll: 'Đã chọn tất cả',
        unselectAll: 'Đã bỏ chọn tất cả',
        close: 'Đóng',
        previous: 'Trước',
        next: 'Tiếp',
        navigation: 'Điều hướng',
        scrollTop: 'Cuộn lên đầu',
        moveTop: 'Chuyển lên đầu',
        moveUp: 'Chuyển lên',
        moveDown: 'Chuyển xuống',
        moveBottom: 'Chuyển xuống cuối',
        moveToTarget: 'Chuyển sang đích',
        moveToSource: 'Chuyển về nguồn',
        moveAllToTarget: 'Chuyển tất cả sang đích',
        moveAllToSource: 'Chuyển tất cả về nguồn',
        pageLabel: '{page}',
        firstPageLabel: 'Trang đầu',
        lastPageLabel: 'Trang cuối',
        nextPageLabel: 'Trang tiếp',
        prevPageLabel: 'Trang trước',
        rowsPerPageLabel: 'Số hàng mỗi trang',
        previousPageLabel: 'Trang trước',
        jumpToPageDropdownLabel: 'Chuyển đến trang',
        jumpToPageInputLabel: 'Nhập số trang',
        selectRow: 'Đã chọn hàng',
        unselectRow: 'Đã bỏ chọn hàng',
        expandRow: 'Đã mở rộng hàng',
        collapseRow: 'Đã thu gọn hàng',
        showFilterMenu: 'Hiển thị menu lọc',
        hideFilterMenu: 'Ẩn menu lọc',
        filterOperator: 'Toán tử lọc',
        filterConstraint: 'Điều kiện lọc',
        editRow: 'Chỉnh sửa hàng',
        saveEdit: 'Lưu chỉnh sửa',
        cancelEdit: 'Hủy chỉnh sửa',
        listView: 'Xem dạng danh sách',
        gridView: 'Xem dạng lưới',
        slide: 'Trượt',
        slideNumber: '{slideNumber}',
        zoomImage: 'Phóng to ảnh',
        zoomIn: 'Phóng to',
        zoomOut: 'Thu nhỏ',
        rotateRight: 'Xoay phải',
        rotateLeft: 'Xoay trái',
        listLabel: 'Danh sách tùy chọn',
        selectColor: 'Chọn màu',
        removeLabel: 'Xóa',
        browseFiles: 'Duyệt tệp',
        maximizeLabel: 'Phóng to'
    }
};

var Language = {
    en: en,
    vi: vi
};

const PRIMENG_TRANSLATE = new InjectionToken('PRIMENG_TRANSLATE');
function primeNGTranslateFactory(translateService, primeng) {
    primeng.setTranslation(Language.vi); // default language    
    translateService.onLangChange.subscribe((lang) => {
        const newLang = Language[lang.lang] || Language.vi;
        primeng.setTranslation(newLang);
    });
    return primeng;
}

// SERVICES

/**
 * Generated bundle index. Do not edit.
 */

export { HistoryChangeMapper, HttpApiService, HttpApiServiceConfig, PRIMENG_TRANSLATE, PermissionService, PermissionServiceContract, PermissionStore, PermissionStoreContract, UBCK_ACTION_CUSTOM_TRANSFORM_LABEL, UbckACTION_CUSTOM_ENUM, WithPermission, primeNGTranslateFactory };
//# sourceMappingURL=khcn-core-common.mjs.map
