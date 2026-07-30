import * as _angular_core from '@angular/core';
import { TemplateRef, OnInit, OnDestroy, EventEmitter, OnChanges, ElementRef, Renderer2, ChangeDetectorRef, Injector, InjectionToken, Provider, Type, Signal, DoCheck, EnvironmentInjector, ApplicationRef, ComponentRef } from '@angular/core';
import * as i7 from 'primeng/table';
import { TableHeaderCheckbox, Table, TablePageEvent, TableFilterEvent, TableRowSelectEvent, TableRowReorderEvent, TableRowExpandEvent, TableRowCollapseEvent } from 'primeng/table';
import { CheckboxChangeEvent, CheckboxPassThrough } from 'primeng/types/checkbox';
import * as _khcn_core_ui from '@khcn-core/ui';
import { BaseComponent } from 'primeng/basecomponent';
import { BaseStyle } from 'primeng/base';
import * as i2 from '@angular/common';
import * as i6 from '@angular/forms';
import { ControlValueAccessor, FormGroup, ValidatorFn, AsyncValidatorFn, AbstractControl, Validator, ValidationErrors, NgControl } from '@angular/forms';
import * as i8 from 'primeng/checkbox';
import { CheckboxChangeEvent as CheckboxChangeEvent$1 } from 'primeng/checkbox';
import * as i9 from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import * as i11 from 'primeng/tooltip';
import * as i3 from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';
import * as i5 from 'primeng/select';
import { Select } from 'primeng/select';
import * as primeng_api from 'primeng/api';
import { MessageService, MenuItem, ScrollerOptions, TreeNode, OverlayOptions as OverlayOptions$1, SortMeta, ConfirmEventType, ConfirmationService, MegaMenuItem } from 'primeng/api';
export { TooltipOptions } from 'primeng/api';
import { TieredMenu } from 'primeng/tieredmenu';
import { Editor } from 'primeng/editor';
import { MultiSelect, MultiSelectChangeEvent, MultiSelectFilterEvent, MultiSelectFocusEvent, MultiSelectBlurEvent, MultiSelectLazyLoadEvent, MultiSelectRemoveEvent, MultiSelectSelectAllChangeEvent } from 'primeng/multiselect';
import { ScrollPanel } from 'primeng/scrollpanel';
import { FileBeforeUploadEvent, FileSendEvent, FileUploadEvent, FileUploadErrorEvent, FileRemoveEvent, FileSelectEvent, FileProgressEvent, FileUploadHandlerEvent, RemoveUploadedFileEvent, FileUpload } from 'primeng/fileupload';
import { HttpHeaders, HttpContext } from '@angular/common/http';
import { Galleria } from 'primeng/galleria';
import { ToggleSwitchChangeEvent } from 'primeng/toggleswitch';
import { ButtonProps } from 'primeng/button';
import { AccordionTabCloseEvent, AccordionTabOpenEvent } from 'primeng/accordion';
import { SelectButtonChangeEvent } from 'primeng/selectbutton';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { SafeUrl } from '@angular/platform-browser';
import { Inplace } from 'primeng/inplace';
import { UIChart } from 'primeng/chart';
import { TreeNodeSelectEvent as TreeNodeSelectEvent$1, TreeNodeUnSelectEvent as TreeNodeUnSelectEvent$1, TreeFilterEvent as TreeFilterEvent$1, Tree } from 'primeng/tree';
import { TreeTable } from 'primeng/treetable';
import { PanelMenu } from 'primeng/panelmenu';
import { SliderSlideEndEvent } from 'primeng/slider';
import { ColorPickerChangeEvent } from 'primeng/colorpicker';
import * as i23 from 'primeng/popover';
import { Popover } from 'primeng/popover';
import { InputNumberInputEvent } from 'primeng/inputnumber';
import { ContextMenu } from 'primeng/contextmenu';
import { ListboxChangeEvent, ListboxFilterEvent, ListboxClickEvent, ListboxDoubleClickEvent } from 'primeng/listbox';
import { Menu } from 'primeng/menu';
import * as i22 from 'primeng/radiobutton';
import { RadioButtonClickEvent } from 'primeng/radiobutton';
import * as i1 from 'primeng/keyfilter';
import * as i1$1 from 'primeng/textarea';
import * as i1$2 from 'primeng/autofocus';
import * as i1$3 from 'primeng/badge';
import * as i1$4 from 'primeng/ripple';
import * as i1$5 from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import * as rxjs from 'rxjs';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import * as i2$1 from 'ngx-lottie';
import { AnimationOptions } from 'ngx-lottie';
import { DatePickerMonthChangeEvent, DatePickerYearChangeEvent } from 'primeng/datepicker';
import * as i19 from 'primeng/floatlabel';
import * as i25 from 'primeng/iconfield';
import * as i26 from 'primeng/inputicon';
import { HttpApiService } from '@khcn-core/common';

type TableSize = 'small' | 'large';
type TableResponsiveLayout = 'scroll' | 'stack';
type TableSortMode = 'single' | 'multiple';
type TableSelectionMode = 'single' | 'multiple';
type TablePaginatorPosition = 'top' | 'bottom' | 'both';
type TableStateStorage = 'session' | 'local';
interface TableProps {
    paginator?: boolean;
    rows?: number;
    first?: number;
    totalRecords?: number;
    showCurrentPageReport?: boolean;
    currentPageReportTemplate?: string;
    paginatorPosition?: TablePaginatorPosition;
    alwaysShowPaginator?: boolean;
    lazy?: boolean;
    loading?: boolean;
    dataKey?: string;
    sortField?: string;
    sortOrder?: number;
    sortMode?: TableSortMode;
    multiSortMeta?: any[];
    selectionMode?: TableSelectionMode;
    metaKeySelection?: boolean;
    selectionPageOnly?: boolean;
    /**
     *  With selectionPageOnly: true, the header reflects only the current page:
     *
     *   - none selected → unchecked
     *   - some selected → green indeterminate
     *   - all current-page rows selected → checked
     */
    showIndeterminateCheckAll?: boolean;
    indeterminateCheckAllClass?: string;
    contextMenuSelection?: any;
    compareSelectionBy?: 'equals' | 'deepEquals';
    rowTrackBy?: Function;
    contextMenu?: boolean;
    rowGroupMode?: 'subheader' | 'rowspan';
    groupRowsBy?: string | string[];
    expandableRowGroups?: boolean;
    expandedRowKeys?: {
        [key: string]: boolean;
    };
    editMode?: 'cell' | 'row';
    editingRowKeys?: {
        [key: string]: boolean;
    };
    showLoader?: boolean;
    globalFilterFields?: string[];
    filterDelay?: number;
    responsiveLayout?: TableResponsiveLayout;
    breakpoint?: string;
    rowHover?: boolean;
    reorderableColumns?: boolean;
    resizableColumns?: boolean;
    columnResizeMode?: string;
    scrollable?: boolean;
    scrollHeight?: string;
    virtualScroll?: boolean;
    virtualScrollItemSize?: number;
    frozenValue?: any[];
    frozenColumns?: any[];
    exportFilename?: string;
    stateStorage?: TableStateStorage;
    stateKey?: string;
    size?: TableSize;
    style?: Record<string, any>;
    styleClass?: string;
    tableStyle?: Record<string, any>;
    tableStyleClass?: string;
    isShowCheckBox?: boolean;
    isShowOrder?: boolean;
    colOrderName?: string;
    isSortColumn?: boolean;
    isClickRecord?: boolean;
    emptyMessage?: string;
}
interface ColumnDefinition {
    field: string;
    header: string;
    customTemplate?: TemplateRef<any> | null;
    headerTemplate?: TemplateRef<unknown> | null;
    searchType?: string;
    searchPlaceholder?: string;
    dropdownOptions?: Record<string, any>[];
    selectedOption?: string;
    maxLength?: number;
    filter?: boolean;
    regexIgnore?: any;
    tdColSpan?: number;
    thColSpan?: number;
    tdRowSpan?: number;
    thRowSpan?: number;
    tdClassName?: string;
    thClassName?: string;
    index?: number;
    currentRangeSelected?: number;
    filterTemplate?: TemplateRef<unknown> | null;
    isDateTimeField?: boolean;
    isFrozen?: boolean;
    isShowSort?: boolean;
    ellipsisRows?: number;
    maxWidth?: string;
    [key: string]: any;
}

type HeaderTableProps = {
    cols: ColumnDefinition[];
    isShowCheckBox: boolean;
    showIndeterminateCheckAll: boolean;
    indeterminateCheckAllClass?: string;
    isShowOrder: boolean;
    colOrderName: string;
    isSortColumn: boolean;
    colIndex: number;
    totalCols: number;
    ellipsisRows?: number;
};
declare class UbckTableHeader {
    props: _angular_core.InputSignal<HeaderTableProps>;
    checkAllRef: _angular_core.Signal<TableHeaderCheckbox | undefined>;
    private readonly dataTable;
    isAllSelected(): boolean;
    isIndeterminate(): boolean;
    isCheckAllDisabled(): boolean;
    toggleAllRows(event: CheckboxChangeEvent): void;
    tooltipCheckboxAll(): string;
    indeterminateCheckAllPassThrough(): CheckboxPassThrough | undefined;
    private getSelectableRows;
    private getSelection;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UbckTableHeader, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UbckTableHeader, "tr[ubck-table-header]", never, { "props": { "alias": "props"; "required": true; "isSignal": true; }; }, {}, never, never, false, never>;
}

type BodyTableProps = {
    isShowCheckBox: boolean;
    isShowOrder: boolean;
    isClickRecord: boolean;
    dataKey: string;
    rowData: any;
    active: boolean;
    rowIndex: number;
    currentPage: number;
    itemPerPage: number;
    cols: any;
    orderTemplate?: TemplateRef<any> | null;
};
declare class UBCKTableBody {
    props: _angular_core.InputSignal<BodyTableProps>;
    onClickRow: _angular_core.OutputEmitterRef<any>;
    getCurrentPage(): number;
    handleClickRow(rowData: any): void;
    getTooltipCheckbox(checkItem: any): "Bỏ chọn" | "Chọn";
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKTableBody, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UBCKTableBody, "tr[ubck-table-body]", never, { "props": { "alias": "props"; "required": true; "isSignal": true; }; }, { "onClickRow": "onClickRow"; }, never, never, false, never>;
}

declare class UBCKTableEmpty {
    totalCols: _angular_core.InputSignal<number>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKTableEmpty, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UBCKTableEmpty, "tr[ubck-table-empty]", never, { "totalCols": { "alias": "totalCols"; "required": true; "isSignal": true; }; }, {}, never, never, false, never>;
}

declare class UbckTableStyle extends BaseStyle {
    name: string;
    style: ({ dt }: any) => string;
    classes: {
        root: ({ instance }: any) => {
            'p-datatable p-component': boolean;
            'p-datatable-hoverable': any;
            'p-datatable-resizable': any;
            'p-datatable-resizable-fit': any;
            'p-datatable-scrollable': any;
            'p-datatable-flex-scrollable': any;
            'p-datatable-striped': any;
            'p-datatable-gridlines': any;
            'p-datatable-sm': boolean;
            'p-datatable-lg': boolean;
        };
        mask: string;
        loadingIcon: string;
        header: string;
        pcPaginator: ({ instance }: any) => string;
        tableContainer: string;
        table: ({ instance }: any) => {
            'p-datatable-table': boolean;
            'p-datatable-scrollable-table': any;
            'p-datatable-resizable-table': any;
            'p-datatable-resizable-table-fit': any;
        };
        thead: string;
        columnResizer: string;
        columnHeaderContent: string;
        columnTitle: string;
        columnFooter: string;
        sortIcon: string;
        pcSortBadge: string;
        filter: ({ instance }: any) => {
            'p-datatable-filter': boolean;
            'p-datatable-inline-filter': boolean;
            'p-datatable-popover-filter': boolean;
        };
        filterElementContainer: string;
        pcColumnFilterButton: string;
        pcColumnFilterClearButton: string;
        filterOverlay: ({ instance }: any) => {
            'p-datatable-filter-overlay p-component': boolean;
            'p-datatable-filter-overlay-popover': boolean;
        };
        filterConstraintList: string;
        filterConstraint: string;
        filterConstraintSeparator: string;
        filterOperator: string;
        pcFilterOperatorDropdown: string;
        filterRuleList: string;
        filterRule: string;
        pcFilterConstraintDropdown: string;
        pcFilterRemoveRuleButton: string;
        pcFilterAddRuleButton: string;
        filterButtonbar: string;
        pcFilterClearButton: string;
        pcFilterApplyButton: string;
        tbody: ({ instance }: any) => {
            'p-datatable-tbody': boolean;
            'p-datatable-frozen-tbody': any;
            'p-virtualscroller-content': any;
        };
        rowGroupHeader: string;
        rowToggleButton: string;
        rowToggleIcon: string;
        rowExpansion: string;
        rowGroupFooter: string;
        emptyMessage: string;
        bodyCell: ({ instance }: any) => {
            'p-datatable-frozen-column': any;
        };
        reorderableRowHandle: string;
        pcRowEditorInit: string;
        pcRowEditorSave: string;
        pcRowEditorCancel: string;
        tfoot: string;
        footerCell: ({ instance }: any) => {
            'p-datatable-frozen-column': any;
        };
        virtualScrollerSpacer: string;
        footer: string;
        columnResizeIndicator: string;
        rowReorderIndicatorUp: string;
        rowReorderIndicatorDown: string;
    };
    inlineStyles: {
        tableContainer: ({ instance }: any) => {
            'max-height': any;
            overflow: string;
        };
        thead: {
            position: string;
        };
        tfoot: {
            position: string;
        };
    };
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UbckTableStyle, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<UbckTableStyle>;
}

declare class UbckTable extends BaseComponent {
    _componentStyle: UbckTableStyle;
    currentPage: _angular_core.ModelSignal<number>;
    itemPerPage: _angular_core.ModelSignal<number>;
    tbl: _angular_core.Signal<Table<any> | undefined>;
    ObjectAssign: {
        <T extends {}, U>(target: T, source: U): T & U;
        <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    columns: _angular_core.InputSignal<ColumnDefinition[][]>;
    cols: _angular_core.Signal<ColumnDefinition[]>;
    captionTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headergroupedTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    bodyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loadingbodyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footergroupedTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    summaryTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    colgroupTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    expandedrowTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    groupheaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    groupfooterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    frozenheaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    frozenbodyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    frozenfooterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    frozencolgroupTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    frozenexpandedrowTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptymessageTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatorleftTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatorrightTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatordropdowniconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatordropdownitemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatorfirstpagelinkiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatorlastpagelinkiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatorpreviouspagelinkiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatornextpagelinkiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loadingiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    reorderindicatorupiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    reorderindicatordowniconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    sorticonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    checkboxiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headercheckboxiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    customItem: _angular_core.Signal<TemplateRef<any> | undefined>;
    orderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onClickRecord: _angular_core.OutputEmitterRef<Record<string, unknown>>;
    dataSources: _angular_core.InputSignal<Record<string, any>[]>;
    selection: _angular_core.ModelSignal<any>;
    _currentSelectedRow: any;
    props: _angular_core.InputSignal<TableProps>;
    onPage: _angular_core.OutputEmitterRef<TablePageEvent>;
    onSort: _angular_core.OutputEmitterRef<any>;
    onFilter: _angular_core.OutputEmitterRef<TableFilterEvent>;
    onRowSelect: _angular_core.OutputEmitterRef<TableRowSelectEvent<any>>;
    onRowUnselect: _angular_core.OutputEmitterRef<any>;
    onSelectAllChange: _angular_core.OutputEmitterRef<any>;
    onRowReorder: _angular_core.OutputEmitterRef<TableRowReorderEvent>;
    onRowExpand: _angular_core.OutputEmitterRef<TableRowExpandEvent<any>>;
    onRowCollapse: _angular_core.OutputEmitterRef<TableRowCollapseEvent>;
    onContextMenuSelect: _angular_core.OutputEmitterRef<any>;
    onColReorder: _angular_core.OutputEmitterRef<any>;
    onColResize: _angular_core.OutputEmitterRef<any>;
    onEditInit: _angular_core.OutputEmitterRef<any>;
    onEditComplete: _angular_core.OutputEmitterRef<any>;
    onEditCancel: _angular_core.OutputEmitterRef<any>;
    onHeaderCheckboxToggle: _angular_core.OutputEmitterRef<any>;
    onStateSave: _angular_core.OutputEmitterRef<any>;
    onStateRestore: _angular_core.OutputEmitterRef<any>;
    computedProps: _angular_core.Signal<{
        paginator: boolean;
        rows: number;
        first: number;
        totalRecords: number;
        showCurrentPageReport: boolean;
        currentPageReportTemplate: string;
        paginatorPosition: _khcn_core_ui.TablePaginatorPosition;
        alwaysShowPaginator: boolean;
        lazy: boolean;
        loading: boolean;
        dataKey: string;
        sortField: string | undefined;
        sortOrder: number;
        sortMode: _khcn_core_ui.TableSortMode;
        multiSortMeta: any[] | undefined;
        selectionMode: _khcn_core_ui.TableSelectionMode | undefined;
        metaKeySelection: boolean | undefined;
        selectionPageOnly: boolean | undefined;
        showIndeterminateCheckAll: boolean;
        indeterminateCheckAllClass: string | undefined;
        contextMenuSelection: any;
        compareSelectionBy: "equals" | "deepEquals";
        rowTrackBy: Function | undefined;
        contextMenu: boolean | undefined;
        rowGroupMode: "subheader" | "rowspan" | undefined;
        groupRowsBy: string | string[] | undefined;
        expandableRowGroups: boolean | undefined;
        expandedRowKeys: {
            [key: string]: boolean;
        } | undefined;
        editMode: "cell" | "row" | undefined;
        editingRowKeys: {
            [key: string]: boolean;
        } | undefined;
        showLoader: boolean | undefined;
        globalFilterFields: string[] | undefined;
        filterDelay: number | undefined;
        responsiveLayout: _khcn_core_ui.TableResponsiveLayout;
        breakpoint: string | undefined;
        rowHover: boolean | undefined;
        reorderableColumns: boolean | undefined;
        resizableColumns: boolean | undefined;
        columnResizeMode: string | undefined;
        scrollable: boolean | undefined;
        scrollHeight: string | undefined;
        virtualScroll: boolean | undefined;
        virtualScrollItemSize: number | undefined;
        frozenValue: any[] | undefined;
        frozenColumns: any[] | undefined;
        exportFilename: string | undefined;
        stateStorage: _khcn_core_ui.TableStateStorage | undefined;
        stateKey: string | undefined;
        size: _khcn_core_ui.TableSize | undefined;
        style: Record<string, any> | undefined;
        styleClass: string | undefined;
        tableStyle: Record<string, any> | undefined;
        tableStyleClass: string | undefined;
        colOrderName: string;
        emptyMessage: string;
        isShowCheckBox?: boolean;
        isShowOrder?: boolean;
        isSortColumn?: boolean;
        isClickRecord?: boolean;
    }>;
    getTotalColumns(): number;
    handleClickRow(rowData: any): void;
    getTableActiveRowClass(rowData: any): any;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UbckTable, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UbckTable, "ubck-table", never, { "currentPage": { "alias": "currentPage"; "required": false; "isSignal": true; }; "itemPerPage": { "alias": "itemPerPage"; "required": false; "isSignal": true; }; "columns": { "alias": "columns"; "required": true; "isSignal": true; }; "dataSources": { "alias": "dataSources"; "required": true; "isSignal": true; }; "selection": { "alias": "selection"; "required": false; "isSignal": true; }; "props": { "alias": "props"; "required": false; "isSignal": true; }; }, { "currentPage": "currentPageChange"; "itemPerPage": "itemPerPageChange"; "onClickRecord": "onClickRecord"; "selection": "selectionChange"; "onPage": "onPage"; "onSort": "onSort"; "onFilter": "onFilter"; "onRowSelect": "onRowSelect"; "onRowUnselect": "onRowUnselect"; "onSelectAllChange": "onSelectAllChange"; "onRowReorder": "onRowReorder"; "onRowExpand": "onRowExpand"; "onRowCollapse": "onRowCollapse"; "onContextMenuSelect": "onContextMenuSelect"; "onColReorder": "onColReorder"; "onColResize": "onColResize"; "onEditInit": "onEditInit"; "onEditComplete": "onEditComplete"; "onEditCancel": "onEditCancel"; "onHeaderCheckboxToggle": "onHeaderCheckboxToggle"; "onStateSave": "onStateSave"; "onStateRestore": "onStateRestore"; }, ["captionTemplate", "headerTemplate", "headergroupedTemplate", "bodyTemplate", "loadingbodyTemplate", "footerTemplate", "footergroupedTemplate", "summaryTemplate", "colgroupTemplate", "expandedrowTemplate", "groupheaderTemplate", "groupfooterTemplate", "frozenheaderTemplate", "frozenbodyTemplate", "frozenfooterTemplate", "frozencolgroupTemplate", "frozenexpandedrowTemplate", "emptymessageTemplate", "paginatorleftTemplate", "paginatorrightTemplate", "paginatordropdowniconTemplate", "paginatordropdownitemTemplate", "paginatorfirstpagelinkiconTemplate", "paginatorlastpagelinkiconTemplate", "paginatorpreviouspagelinkiconTemplate", "paginatornextpagelinkiconTemplate", "loadingiconTemplate", "reorderindicatorupiconTemplate", "reorderindicatordowniconTemplate", "sorticonTemplate", "checkboxiconTemplate", "headercheckboxiconTemplate", "customItem", "orderTemplate"], never, false, never>;
}

declare const UBCK_TABLE_DEFAULTS: {
    readonly PAGINATOR: false;
    readonly ROWS: 10;
    readonly FIRST: 0;
    readonly LOADING: false;
    readonly LAZY: false;
    readonly SORT_MODE: "single";
    readonly RESPONSIVE_LAYOUT: "scroll";
    readonly SHOW_CURRENT_PAGE_REPORT: true;
    readonly CURRENT_PAGE_REPORT_TEMPLATE: "{first} to {last} of {totalRecords}";
    readonly PAGINATOR_POSITION: "bottom";
    readonly ALWAYS_SHOW_PAGINATOR: true;
};
declare const UBCK_DEFAULT_RESULT_COUNT = 10;
declare const UBCK_MEDIUM_RESULT_COUNT = 50;
declare const UBCK_LARGE_RESULT_COUNT = 100;
declare const UBCK_MAX_QUANTITY_VALUE = 1000000;
declare const UBCK_DEFAULT_FILE_SIZE = 5000000;
declare const UBCK_MIN_QUANTITY_VALUE = 0;
declare const UBCK_MAX_REASON_MESSAGE_LENGTH = 512;
declare const UBCK_PAGINATOR_OPTIONS: number[];
declare const UBCK_PAGINATOR_EDOC_OPTIONS: number[];
declare const UBCK_DEFAULT_PAGE = 0;

declare class UBCKCustomTypographyStyles extends BaseStyle {
    style: any;
    name: string;
    classes: {};
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKCustomTypographyStyles, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<UBCKCustomTypographyStyles>;
}

declare class CmmEllipsisDirective extends BaseComponent implements OnInit, OnDestroy {
    _componentStyle: UBCKCustomTypographyStyles;
    private measureService;
    private cdr;
    private destroy$;
    appEllipsis: boolean;
    ellipsisRows: number;
    ellipsisExpandable: boolean;
    ellipsisSuffix: string;
    ellipsisSymbol: string;
    ellipsisChange: EventEmitter<boolean>;
    isEllipsis: boolean;
    expanded: boolean;
    originalContent: string;
    clampedContent: string;
    expandButton: HTMLElement | null;
    private supportsCssEllipsis;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
    /**
     * Check if CSS-based ellipsis is supported and can be used
     */
    private checkCssEllipsisSupport;
    /**
     * Main logic: check if text is clamped and apply ellipsis
     */
    private checkAndApplyEllipsis;
    /**
     * Apply CSS-based ellipsis (most performant)
     */
    private applyCssEllipsis;
    /**
     * Apply JS-based ellipsis (for expandable or complex cases)
     */
    private applyJsEllipsis;
    /**
     * Add "Expand" button
     */
    private addExpandButton;
    /**
     * Remove expand button
     */
    private removeExpandButton;
    /**
     * Expand to show full content
     */
    expand(): void;
    /**
     * Add "Collapse" button
     */
    private addCollapseButton;
    /**
     * Collapse back to ellipsis
     */
    collapse(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmEllipsisDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmEllipsisDirective, "[cmmEllipsis]", ["cmmEllipsis"], { "appEllipsis": { "alias": "appEllipsis"; "required": false; }; "ellipsisRows": { "alias": "ellipsisRows"; "required": false; }; "ellipsisExpandable": { "alias": "ellipsisExpandable"; "required": false; }; "ellipsisSuffix": { "alias": "ellipsisSuffix"; "required": false; }; "ellipsisSymbol": { "alias": "ellipsisSymbol"; "required": false; }; }, { "ellipsisChange": "ellipsisChange"; }, never, never, true, never>;
    static ngAcceptInputType_appEllipsis: unknown;
    static ngAcceptInputType_ellipsisRows: unknown;
    static ngAcceptInputType_ellipsisExpandable: unknown;
}

declare class UBCKTableModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKTableModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<UBCKTableModule, [typeof UbckTable, typeof UbckTableHeader, typeof UBCKTableBody, typeof UBCKTableEmpty], [typeof i2.CommonModule, typeof i6.FormsModule, typeof i7.TableModule, typeof i8.CheckboxModule, typeof i9.TranslatePipe, typeof CmmEllipsisDirective, typeof i11.TooltipModule], [typeof UbckTable, typeof UbckTableHeader, typeof UBCKTableBody, typeof UBCKTableEmpty]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<UBCKTableModule>;
}

declare const UBCK_PAGINATOR_THEME: ({ dt }: any) => string;
declare const UBCK_PAGNATOR_CLASSES: {
    paginator: ({ instance, key }: any) => (string | {
        [x: string]: any;
        'p-paginator-default': boolean;
    })[];
    content: string;
    contentStart: string;
    contentEnd: string;
    first: ({ instance }: any) => (string | {
        'p-disabled': any;
    })[];
    firstIcon: string;
    prev: ({ instance }: any) => (string | {
        'p-disabled': any;
    })[];
    prevIcon: string;
    next: ({ instance }: any) => (string | {
        'p-disabled': any;
    })[];
    nextIcon: string;
    last: ({ instance }: any) => (string | {
        'p-disabled': any;
    })[];
    lastIcon: string;
    pages: string;
    page: ({ props, pageLink }: any) => (string | {
        'p-paginator-page-selected': boolean;
    })[];
    current: string;
    pcRowPerPageDropdown: string;
    pcJumpToPageDropdown: string;
    pcJumpToPageInput: string;
};
declare class UBCKPaginatorStyles extends BaseStyle {
    name: string;
    classes: {
        paginator: ({ instance, key }: any) => (string | {
            [x: string]: any;
            'p-paginator-default': boolean;
        })[];
        content: string;
        contentStart: string;
        contentEnd: string;
        first: ({ instance }: any) => (string | {
            'p-disabled': any;
        })[];
        firstIcon: string;
        prev: ({ instance }: any) => (string | {
            'p-disabled': any;
        })[];
        prevIcon: string;
        next: ({ instance }: any) => (string | {
            'p-disabled': any;
        })[];
        nextIcon: string;
        last: ({ instance }: any) => (string | {
            'p-disabled': any;
        })[];
        lastIcon: string;
        pages: string;
        page: ({ props, pageLink }: any) => (string | {
            'p-paginator-page-selected': boolean;
        })[];
        current: string;
        pcRowPerPageDropdown: string;
        pcJumpToPageDropdown: string;
        pcJumpToPageInput: string;
    };
    style: ({ dt }: any) => string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKPaginatorStyles, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<UBCKPaginatorStyles>;
}

type PaginatorProps = {
    recordPerPage?: number;
    totalRecords: number;
    rowsPerPageOptions?: {
        value: number;
        label: string;
    }[];
    showCurrentPageReport?: boolean;
    currentPageReportTemplate?: string;
    alwaysShow?: boolean;
    showFirstLastIcon?: boolean;
    showPageLinks?: boolean;
    pageLinkSize?: number;
    style?: Record<string, any>;
    styleClass?: string;
    currentPage?: number;
    appendTo?: HTMLElement | string;
    dropdownAppendTo?: HTMLElement | string;
    showJumpToPageInput?: boolean;
    rows?: number;
    first?: number;
    showTotalRecords?: boolean;
};
type UBCKPaginatorState = {
    currentPage: number;
    recordPerPage: number;
} & Partial<PaginatorState>;

declare class UBCKPaginator extends BaseComponent {
    _componentStyle: UBCKPaginatorStyles;
    Number: NumberConstructor;
    props: _angular_core.ModelSignal<PaginatorProps | undefined>;
    computedProps: _angular_core.Signal<PaginatorProps>;
    onPageChange: _angular_core.OutputEmitterRef<UBCKPaginatorState>;
    handlePageChange(event: PaginatorState): void;
    handleRowsPerPageChange(event: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKPaginator, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UBCKPaginator, "ubck-paginator", never, { "props": { "alias": "props"; "required": false; "isSignal": true; }; }, { "props": "propsChange"; "onPageChange": "onPageChange"; }, never, never, false, never>;
}

declare class UBCKPaginatorModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKPaginatorModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<UBCKPaginatorModule, [typeof UBCKPaginator], [typeof i2.CommonModule, typeof i3.PaginatorModule, typeof i9.TranslateModule, typeof i5.Select, typeof i6.FormsModule], [typeof UBCKPaginator]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<UBCKPaginatorModule>;
}

declare const UBCK_PAGINATOR_DEFAULTS: {
    ROWS: number;
    FIRST: number;
    ALWAYS_SHOW: boolean;
    SHOW_CURRENT_PAGE_REPORT: boolean;
    CURRENT_PAGE_REPORT_TEMPLATE: string;
    SHOW_FIRST_LAST_ICON: boolean;
    SHOW_PAGE_LINKS: boolean;
    APPEND_TO: string;
    DROPDOWN_APPEND_TO: string;
    SHOW_JUMP_TO_PAGE_INPUT: boolean;
    PAGE_LINK_SIZE: number;
    CURRENT_PAGE: number;
    SHOW_TOTAL_RECORDS: boolean;
    ROWS_PER_PAGE_OPTIONS: {
        value: number;
        label: string;
    }[];
};

declare class CardUploadComponent implements OnChanges {
    fileList: File[];
    minWidth: string;
    maxWidth: string;
    minHeight: string;
    maxHeight: string;
    styleClassName: string;
    headerCard: string;
    uploadWithButton: boolean;
    filemime: string;
    maxFileSize: number;
    maxAllow: number | null;
    existingFilesEmit: EventEmitter<any[]>;
    filesSelected: EventEmitter<File[]>;
    ignoreDisplay: boolean;
    existingFiles: any[];
    messageService: MessageService;
    labelUploadAction: string;
    labelUploadOr: string;
    labelUploadBrowse: string;
    labelFileType: string;
    labelMaxFileSize: string;
    labelEachFile: string;
    messMaxFileSize: string;
    messExceeds: string;
    isShowAllowContentText: boolean;
    selectedFiles: File[];
    fileIcons: {
        [key: string]: string;
    };
    constructor();
    ngOnChanges(): void;
    onFileSelected(event: any): void;
    getFileIcon(file: File): string;
    removeFile(file: File): void;
    getExistingFileIcon(nameFile: string): string;
    removeExistingFile(file: File): void;
    showMessageError(mess: string): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CardUploadComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CardUploadComponent, "upload-card-wrapper", never, { "fileList": { "alias": "fileList"; "required": false; }; "minWidth": { "alias": "minWidth"; "required": false; }; "maxWidth": { "alias": "maxWidth"; "required": false; }; "minHeight": { "alias": "minHeight"; "required": false; }; "maxHeight": { "alias": "maxHeight"; "required": false; }; "styleClassName": { "alias": "styleClassName"; "required": false; }; "headerCard": { "alias": "headerCard"; "required": false; }; "uploadWithButton": { "alias": "uploadWithButton"; "required": false; }; "filemime": { "alias": "filemime"; "required": false; }; "maxFileSize": { "alias": "maxFileSize"; "required": false; }; "maxAllow": { "alias": "maxAllow"; "required": false; }; "ignoreDisplay": { "alias": "ignoreDisplay"; "required": false; }; "labelUploadAction": { "alias": "labelUploadAction"; "required": false; }; "labelUploadOr": { "alias": "labelUploadOr"; "required": false; }; "labelUploadBrowse": { "alias": "labelUploadBrowse"; "required": false; }; "labelFileType": { "alias": "labelFileType"; "required": false; }; "labelMaxFileSize": { "alias": "labelMaxFileSize"; "required": false; }; "labelEachFile": { "alias": "labelEachFile"; "required": false; }; "messMaxFileSize": { "alias": "messMaxFileSize"; "required": false; }; "messExceeds": { "alias": "messExceeds"; "required": false; }; "isShowAllowContentText": { "alias": "isShowAllowContentText"; "required": false; }; }, { "existingFilesEmit": "existingFilesEmit"; "filesSelected": "filesSelected"; }, never, ["[allowContentText]"], true, never>;
}

declare class HeaderComponent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<HeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<HeaderComponent, "cmm-header", never, {}, {}, never, ["*"], true, never>;
}

interface IUserActionHeader {
    amountNotifications: number;
    avatarUrl: string;
}

declare class UserActionHeaderComponent {
    meta: _angular_core.InputSignal<IUserActionHeader>;
    eventClickAvatar: _angular_core.OutputEmitterRef<MouseEvent>;
    eventClickNotification: _angular_core.OutputEmitterRef<MouseEvent>;
    avatarClick(evt: MouseEvent): void;
    notificationClick(evt: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UserActionHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UserActionHeaderComponent, "cmm-user-action-header", never, { "meta": { "alias": "meta"; "required": true; "isSignal": true; }; }, { "eventClickAvatar": "eventClickAvatar"; "eventClickNotification": "eventClickNotification"; }, never, never, true, never>;
}

declare class CardWrapperComponent {
    minWidth: string;
    maxWidth: string;
    minHeight: string;
    maxHeight: string;
    styleClassName: string;
    headerCard: string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CardWrapperComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CardWrapperComponent, "cmm-card-wrapper", never, { "minWidth": { "alias": "minWidth"; "required": false; }; "maxWidth": { "alias": "maxWidth"; "required": false; }; "minHeight": { "alias": "minHeight"; "required": false; }; "maxHeight": { "alias": "maxHeight"; "required": false; }; "styleClassName": { "alias": "styleClassName"; "required": false; }; "headerCard": { "alias": "headerCard"; "required": false; }; }, {}, never, ["*"], true, never>;
}

interface IImageMeta {
    src: string;
    alt: string;
    width: number;
    height: number;
}

/**
 * SizeType defines the supported sizing tokens used across the UI library.
 *
 * - small:  compact components / helper text
 * - medium: default size for inputs, buttons, body text
 * - large:  slightly larger controls / headings
 * - xLarge: large headings / prominent UI elements
 */
type SizeType = 'small' | 'medium' | 'large' | 'xLarge' | 'xxLarge';
/**
 * Default pixel values for each SizeType. Use for spacing, fonts, icons, etc.
 */
declare const SIZE_PX: Record<SizeType, string>;
/**
 * Default rem values for each SizeType (1rem = 16px).
 */
declare const SIZE_REM: Record<SizeType, string>;

interface ICmmSectionModel {
    title: string;
    size?: SizeType;
    description?: string;
    styleClass?: string;
    titleSize?: string;
    descriptionSize?: string;
}

declare class CmmSectionComponent {
    meta: _angular_core.InputSignal<ICmmSectionModel>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSectionComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSectionComponent, "cmm-section", never, { "meta": { "alias": "meta"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

type StatusType = 'active' | 'disabled' | 'danger' | 'blue';
/**
 * StatusBadgeDirective
 *
 * A directive that displays a status badge with a colored circle indicator and text.
 * Automatically applies appropriate styling based on the status type.
 *
 * @example
 * ```html
 * <span appStatusBadge [status]="'active'">Active</span>
 * <span appStatusBadge [status]="'disabled'">Disabled</span>
 * <span appStatusBadge [status]="'danger'">Danger</span>
 * ```
 *
 * ## Status Types:
 * - **active**: Green circle indicator (success state)
 * - **disabled**: Gray circle indicator (inactive/disabled state)
 * - **danger**: Red circle indicator (error/warning state)
 *
 * ## Features:
 * - Automatic color assignment based on status
 * - Colored circle indicator positioned to the left
 * - Flexible text display
 * - Clean, modern styling
 */
declare class StatusBadgeDirective implements OnInit {
    private el;
    private renderer;
    /**
     * The status type that determines the badge appearance
     */
    status: StatusType;
    /**
     * Optional: Custom text to display. If not provided, uses the element's text content
     */
    statusText?: string;
    private statusConfig;
    constructor(el: ElementRef, renderer: Renderer2);
    ngOnInit(): void;
    private applyStyles;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<StatusBadgeDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<StatusBadgeDirective, "[cmmStatusBadge]", never, { "status": { "alias": "status"; "required": false; }; "statusText": { "alias": "statusText"; "required": false; }; }, {}, never, never, true, never>;
}

interface IBtnActionsModel {
    label: string;
    img?: IImageMeta | null;
    icon?: string | null;
    styleClass?: string | null;
    btnType?: 'primary' | 'outline';
    disabled?: boolean;
    lastIcon?: string | null;
    clickHandler?: (evt: Event) => void;
}

declare class BtnActionsComponent {
    meta: _angular_core.InputSignal<IBtnActionsModel>;
    eventClick: _angular_core.OutputEmitterRef<MouseEvent>;
    handleClick(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<BtnActionsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<BtnActionsComponent, "cmm-btn-actions", never, { "meta": { "alias": "meta"; "required": true; "isSignal": true; }; }, { "eventClick": "eventClick"; }, never, never, true, never>;
}

declare class EyeIconComponent {
    eventClick: _angular_core.OutputEmitterRef<MouseEvent>;
    handleClick(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<EyeIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<EyeIconComponent, "cmm-icon-eye", never, {}, { "eventClick": "eventClick"; }, never, never, true, never>;
}

declare class EditIconComponent {
    eventClick: _angular_core.OutputEmitterRef<MouseEvent>;
    handleClick(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<EditIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<EditIconComponent, "cmm-icon-edit", never, {}, { "eventClick": "eventClick"; }, never, never, true, never>;
}

declare class DeleteIconComponent {
    eventClick: _angular_core.OutputEmitterRef<MouseEvent>;
    handleClick(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DeleteIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DeleteIconComponent, "cmm-icon-delete", never, {}, { "eventClick": "eventClick"; }, never, never, true, never>;
}

declare class UndoIconComponent {
    eventClick: _angular_core.OutputEmitterRef<MouseEvent>;
    handleClick(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UndoIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UndoIconComponent, "cmm-icon-undo", never, {}, { "eventClick": "eventClick"; }, never, never, true, never>;
}

declare class LogoComponent {
    eventClick: _angular_core.OutputEmitterRef<MouseEvent>;
    handleClick(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<LogoComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<LogoComponent, "cmm-icon-logo", never, {}, { "eventClick": "eventClick"; }, never, never, true, never>;
}

interface IBtnHeader {
    label: string;
    icon?: string | null;
    activeIcon?: string | null;
    img?: IImageMeta | null;
    activeImg?: IImageMeta | null;
    styleClass?: string | null;
    disabled?: boolean;
    status?: 'active' | 'inactive' | 'disabled';
    click?: (e: IBtnHeader) => void;
    withTiredmenu?: boolean;
    items?: MenuItem[];
    customTemplate?: TemplateRef<any>;
    clickTiredItem?: (meta: IBtnHeader, item: MenuItem) => void;
    key?: string;
}

declare class BtnHeaderComponent {
    meta: _angular_core.InputSignal<IBtnHeader>;
    eventClick: _angular_core.OutputEmitterRef<MouseEvent>;
    eventClickTiredItem: _angular_core.OutputEmitterRef<unknown>;
    handleClick(event: MouseEvent): void;
    handleClickTiredItem(event: unknown): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<BtnHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<BtnHeaderComponent, "cmm-btn-header", never, { "meta": { "alias": "meta"; "required": true; "isSignal": true; }; }, { "eventClick": "eventClick"; "eventClickTiredItem": "eventClickTiredItem"; }, never, never, true, never>;
}

declare class HistoryIconComponent {
    eventClick: _angular_core.OutputEmitterRef<MouseEvent>;
    handleClick(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<HistoryIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<HistoryIconComponent, "cmm-icon-history", never, {}, { "eventClick": "eventClick"; }, never, never, true, never>;
}

declare class DeletePopupIconComponent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DeletePopupIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DeletePopupIconComponent, "cmm-icon-delete-popup", never, {}, {}, never, never, true, never>;
}

declare class GroupBtnActionsComponent {
    meta: _angular_core.InputSignal<IBtnActionsModel[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<GroupBtnActionsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<GroupBtnActionsComponent, "cmm-group-btn-actions", never, { "meta": { "alias": "meta"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

type TTableActionType = 'view' | 'edit' | 'delete' | 'undo' | 'history' | 'custom';
interface ITableAction {
    type: TTableActionType;
    customTemplate?: any;
    onClick: (event: MouseEvent) => void;
}

declare class TableBtnActionsComponent {
    meta: _angular_core.InputSignal<ITableAction[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TableBtnActionsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TableBtnActionsComponent, "cmm-table-btn-actions", never, { "meta": { "alias": "meta"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class HeaderManagementComponent {
    headersConfig: _angular_core.InputSignal<IBtnHeader[]>;
    userActionMeta: _angular_core.InputSignal<IUserActionHeader | undefined>;
    eventClickAvatar: _angular_core.OutputEmitterRef<MouseEvent>;
    eventClickNotification: _angular_core.OutputEmitterRef<MouseEvent>;
    onAvatarClick(evt: MouseEvent): void;
    onNotificationClick(evt: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<HeaderManagementComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<HeaderManagementComponent, "cmm-header-management", never, { "headersConfig": { "alias": "headersConfig"; "required": true; "isSignal": true; }; "userActionMeta": { "alias": "userActionMeta"; "required": false; "isSignal": true; }; }, { "eventClickAvatar": "eventClickAvatar"; "eventClickNotification": "eventClickNotification"; }, never, ["*"], true, never>;
}

declare class CmmBasecomponentComponent extends BaseComponent {
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    computedStyleClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmBasecomponentComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmBasecomponentComponent, "cmm-basecomponent", ["cmmbasecomponent"], { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

interface CmmReadonlyProps {
    /**
     * Whether to truncate the text and display an ellipsis if it overflows its container.
     * @default true
     */
    ellipsis?: boolean;
    /**
     * The maximum number of visible lines when ellipsis is enabled.
     * @default 1
     */
    ellipsisRows?: number;
    /**
     * Position of the tooltip relative to the element.
     * Can be 'top', 'bottom', 'left', or 'right'.
     * @default 'top'
     */
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
    /**
     * CSS class(es) to customize the appearance of the tooltip overlay.
     * @default 'custom-tooltip-view-user-detail'
     */
    tooltipStyleClass?: string;
    disableTooltip?: boolean;
}

declare class CmmReadonlyComponent {
    value: _angular_core.InputSignal<any>;
    styleClass: _angular_core.InputSignal<string>;
    props: _angular_core.InputSignal<CmmReadonlyProps>;
    computedEllipsis: _angular_core.Signal<boolean>;
    computedEllipsisRows: _angular_core.Signal<number>;
    computedTooltipValue: _angular_core.Signal<any>;
    computedTooltipPosition: _angular_core.Signal<"top" | "bottom" | "left" | "right">;
    computedClass: _angular_core.Signal<string>;
    computedTooltipStyleClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmReadonlyComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmReadonlyComponent, "cmm-readonly", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "props": { "alias": "props"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class CmmBlockUIComponent {
    target: _angular_core.InputSignal<any>;
    blocked: _angular_core.ModelSignal<boolean>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    onBlocked: _angular_core.OutputEmitterRef<void>;
    onUnblocked: _angular_core.OutputEmitterRef<void>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    computedStyleClass: _angular_core.Signal<string>;
    handleBlocked(): void;
    handleUnblocked(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmBlockUIComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmBlockUIComponent, "cmm-block-ui", ["cmmblockui"], { "target": { "alias": "target"; "required": false; "isSignal": true; }; "blocked": { "alias": "blocked"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, { "blocked": "blockedChange"; "onBlocked": "onBlocked"; "onUnblocked": "onUnblocked"; }, ["contentTemplate"], ["*"], true, never>;
}

declare class CmmTieredmenuComponent {
    menu: _angular_core.Signal<TieredMenu | undefined>;
    id: _angular_core.InputSignal<string | undefined>;
    model: _angular_core.InputSignal<MenuItem[]>;
    popup: _angular_core.InputSignal<boolean>;
    appendTo: _angular_core.InputSignal<unknown>;
    breakpoint: _angular_core.InputSignal<string>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    autoDisplay: _angular_core.InputSignal<boolean>;
    showTransitionOptions: _angular_core.InputSignal<string>;
    hideTransitionOptions: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    tabindex: _angular_core.InputSignal<number>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    submenuIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onShow: _angular_core.OutputEmitterRef<any>;
    onHide: _angular_core.OutputEmitterRef<any>;
    toggle(event: Event): void;
    show(event: Event): void;
    hide(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTieredmenuComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTieredmenuComponent, "cmm-tieredmenu", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "model": { "alias": "model"; "required": false; "isSignal": true; }; "popup": { "alias": "popup"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "breakpoint": { "alias": "breakpoint"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "autoDisplay": { "alias": "autoDisplay"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, { "onShow": "onShow"; "onHide": "onHide"; }, ["itemTemplate", "submenuIconTemplate"], never, true, never>;
}

type TimelineAlign = 'left' | 'right' | 'alternate' | 'top' | 'bottom';
type TimelineLayout = 'vertical' | 'horizontal';

declare class CmmTimelineComponent {
    value: _angular_core.InputSignal<any[]>;
    layout: _angular_core.InputSignal<TimelineLayout>;
    align: _angular_core.InputSignal<TimelineAlign>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    oppositeTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    markerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    connectorTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTimelineComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTimelineComponent, "cmm-timeline", never, { "value": { "alias": "value"; "required": true; "isSignal": true; }; "layout": { "alias": "layout"; "required": false; "isSignal": true; }; "align": { "alias": "align"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, ["contentTemplate", "oppositeTemplate", "markerTemplate", "connectorTemplate"], never, true, never>;
}

declare class CmmMessageComponent {
    severity: _angular_core.InputSignal<any>;
    text: _angular_core.InputSignal<string | undefined>;
    escape: _angular_core.InputSignal<boolean>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string>;
    closable: _angular_core.InputSignal<boolean>;
    icon: _angular_core.InputSignal<string | undefined>;
    closeIcon: _angular_core.InputSignal<string | undefined>;
    showTransitionOptions: _angular_core.InputSignal<string>;
    hideTransitionOptions: _angular_core.InputSignal<string>;
    size: _angular_core.InputSignal<"small" | "large" | undefined>;
    variant: _angular_core.InputSignal<"outlined" | "text" | "simple" | undefined>;
    onClose: _angular_core.OutputEmitterRef<void>;
    iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    closeIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmMessageComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmMessageComponent, "cmm-message", never, { "severity": { "alias": "severity"; "required": false; "isSignal": true; }; "text": { "alias": "text"; "required": false; "isSignal": true; }; "escape": { "alias": "escape"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "closable": { "alias": "closable"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "closeIcon": { "alias": "closeIcon"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; }, { "onClose": "onClose"; }, ["iconTemplate", "closeIconTemplate"], ["*"], true, never>;
}

interface MeterItem {
    label?: string;
    value?: number;
    color?: string;
    icon?: string;
}
type MeterGroupOrientation = 'horizontal' | 'vertical';
type MeterGroupLabelPosition = 'start' | 'end';
type MeterGroupLabelOrientation = 'horizontal' | 'vertical';
interface CmmMetergroupProps {
    value?: MeterItem[];
    min?: number;
    max?: number;
    orientation?: MeterGroupOrientation;
    labelPosition?: MeterGroupLabelPosition;
    labelOrientation?: MeterGroupLabelOrientation;
    style?: Record<string, any>;
    styleClass?: string;
}

/**
 * MeterGroup displays scalar measurements within a known range.
 * Wraps PrimeNG MeterGroup component.
 */
declare class CmmMetergroupComponent {
    /**
     * Current value of the metergroup
     */
    value: _angular_core.InputSignal<MeterItem[] | undefined>;
    /**
     * Minimum boundary value
     */
    min: _angular_core.InputSignal<number>;
    /**
     * Maximum boundary value
     */
    max: _angular_core.InputSignal<number>;
    /**
     * Specifies the layout of the component
     */
    orientation: _angular_core.InputSignal<MeterGroupOrientation>;
    /**
     * Specifies the label position of the component
     */
    labelPosition: _angular_core.InputSignal<MeterGroupLabelPosition>;
    /**
     * Specifies the label orientation of the component
     */
    labelOrientation: _angular_core.InputSignal<MeterGroupLabelOrientation>;
    /**
     * Inline style of the element
     */
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    /**
     * Style class of the element
     */
    styleClass: _angular_core.InputSignal<string | undefined>;
    /**
     * Custom label template
     */
    labelTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom meter item template
     */
    meterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom start template
     */
    startTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom end template
     */
    endTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom icon template
     */
    iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmMetergroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmMetergroupComponent, "cmm-metergroup", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "labelPosition": { "alias": "labelPosition"; "required": false; "isSignal": true; }; "labelOrientation": { "alias": "labelOrientation"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, ["labelTemplate", "meterTemplate", "startTemplate", "endTemplate", "iconTemplate"], never, true, never>;
}

type ScrollerOrientation = 'horizontal' | 'vertical' | 'both';
type ScrollerToType = 'to-start' | 'to-end' | undefined;
interface ScrollerLazyLoadEvent {
    first: number;
    last: number;
}
interface ScrollerScrollEvent {
    originalEvent?: Event;
}
interface ScrollerScrollIndexChangeEvent {
    first: number;
    last: number;
}
interface ScrollerContentOptions {
    contentStyleClass?: string;
    items?: any[];
    loading?: boolean;
    itemSize?: number;
    rows?: any[];
    columns?: any[];
    spacerStyle?: Record<string, any>;
    contentStyle?: Record<string, any>;
    vertical?: boolean;
    horizontal?: boolean;
    both?: boolean;
    getItemOptions?: Function;
    getLoaderOptions?: Function;
}
interface ScrollerItemOptions {
    index?: number;
    count?: number;
    first?: boolean;
    last?: boolean;
    even?: boolean;
    odd?: boolean;
}
interface ScrollerLoaderOptions {
    index?: number;
    count?: number;
    first?: boolean;
    last?: boolean;
    even?: boolean;
    odd?: boolean;
}
interface ScrollerLoaderIconOptions {
    [key: string]: any;
}
interface CmmScrollerProps {
    id?: string;
    style?: any;
    styleClass?: string;
    tabindex?: number;
    items?: any[];
    itemSize?: number | number[];
    scrollHeight?: string;
    scrollWidth?: string;
    orientation?: ScrollerOrientation;
    step?: number;
    delay?: number;
    resizeDelay?: number;
    appendOnly?: boolean;
    inline?: boolean;
    lazy?: boolean;
    disabled?: boolean;
    loaderDisabled?: boolean;
    columns?: any[];
    showSpacer?: boolean;
    showLoader?: boolean;
    numToleratedItems?: number;
    loading?: boolean;
    autoSize?: boolean;
    trackBy?: Function;
    options?: ScrollerOptions;
}

/**
 * Scroller is a performance-approach to handle huge data efficiently with virtual scrolling.
 * Wraps PrimeNG Scroller component.
 */
declare class CmmScrollerComponent {
    /**
     * Unique identifier of the element
     */
    readonly id: _angular_core.InputSignal<string | undefined>;
    /**
     * Inline style of the component
     */
    readonly style: _angular_core.InputSignal<any>;
    /**
     * Style class of the element
     */
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    /**
     * Index of the element in tabbing order
     */
    readonly tabindex: _angular_core.InputSignal<number | undefined>;
    /**
     * An array of objects to display
     */
    readonly items: _angular_core.InputSignal<any[] | undefined>;
    /**
     * The height/width of item according to orientation
     */
    readonly itemSize: _angular_core.InputSignal<number | number[]>;
    /**
     * Height of the scroll viewport
     */
    readonly scrollHeight: _angular_core.InputSignal<string | undefined>;
    /**
     * Width of the scroll viewport
     */
    readonly scrollWidth: _angular_core.InputSignal<string | undefined>;
    /**
     * The orientation of scrollbar
     */
    readonly orientation: _angular_core.InputSignal<ScrollerOrientation>;
    /**
     * Used to specify how many items to load in each load method in lazy mode
     */
    readonly step: _angular_core.InputSignal<number>;
    /**
     * Delay in scroll before new data is loaded
     */
    readonly delay: _angular_core.InputSignal<number>;
    /**
     * Delay after window's resize finishes
     */
    readonly resizeDelay: _angular_core.InputSignal<number>;
    /**
     * Used to append each loaded item to top without removing any items from the DOM
     */
    readonly appendOnly: _angular_core.InputSignal<boolean>;
    /**
     * Specifies whether the scroller should be displayed inline or not
     */
    readonly inline: _angular_core.InputSignal<boolean>;
    /**
     * Defines if data is loaded and interacted with in lazy manner
     */
    readonly lazy: _angular_core.InputSignal<boolean>;
    /**
     * If disabled, the scroller feature is eliminated and the content is displayed directly
     */
    readonly disabled: _angular_core.InputSignal<boolean>;
    /**
     * Used to implement a custom loader instead of using the loader feature in the scroller
     */
    readonly loaderDisabled: _angular_core.InputSignal<boolean>;
    /**
     * Columns to display
     */
    readonly columns: _angular_core.InputSignal<any[] | undefined>;
    /**
     * Used to implement a custom spacer instead of using the spacer feature in the scroller
     */
    readonly showSpacer: _angular_core.InputSignal<boolean>;
    /**
     * Defines whether to show loader
     */
    readonly showLoader: _angular_core.InputSignal<boolean>;
    /**
     * Determines how many additional elements to add to the DOM outside of the view
     */
    readonly numToleratedItems: _angular_core.InputSignal<number | undefined>;
    /**
     * Defines whether the data is loaded
     */
    readonly loading: _angular_core.InputSignal<boolean>;
    /**
     * Defines whether to dynamically change the height or width of scrollable container
     */
    readonly autoSize: _angular_core.InputSignal<boolean>;
    /**
     * Function to optimize the dom operations by delegating to ngForTrackBy
     */
    readonly trackBy: _angular_core.InputSignal<Function | undefined>;
    /**
     * Defines whether to use the scroller feature
     */
    readonly options: _angular_core.InputSignal<ScrollerOptions | undefined>;
    /**
     * Custom content template
     */
    readonly contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom item template
     */
    readonly itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom loader template
     */
    readonly loaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom loader icon template
     */
    readonly loadericonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Callback to invoke in lazy mode to load new data
     */
    readonly onLazyLoad: _angular_core.OutputEmitterRef<ScrollerLazyLoadEvent>;
    /**
     * Callback to invoke when scroll position changes
     */
    readonly onScroll: _angular_core.OutputEmitterRef<ScrollerScrollEvent>;
    /**
     * Callback to invoke when scroll position and item's range in view changes
     */
    readonly onScrollIndexChange: _angular_core.OutputEmitterRef<ScrollerScrollIndexChangeEvent>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmScrollerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmScrollerComponent, "cmm-scroller", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "items": { "alias": "items"; "required": false; "isSignal": true; }; "itemSize": { "alias": "itemSize"; "required": false; "isSignal": true; }; "scrollHeight": { "alias": "scrollHeight"; "required": false; "isSignal": true; }; "scrollWidth": { "alias": "scrollWidth"; "required": false; "isSignal": true; }; "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "step": { "alias": "step"; "required": false; "isSignal": true; }; "delay": { "alias": "delay"; "required": false; "isSignal": true; }; "resizeDelay": { "alias": "resizeDelay"; "required": false; "isSignal": true; }; "appendOnly": { "alias": "appendOnly"; "required": false; "isSignal": true; }; "inline": { "alias": "inline"; "required": false; "isSignal": true; }; "lazy": { "alias": "lazy"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "loaderDisabled": { "alias": "loaderDisabled"; "required": false; "isSignal": true; }; "columns": { "alias": "columns"; "required": false; "isSignal": true; }; "showSpacer": { "alias": "showSpacer"; "required": false; "isSignal": true; }; "showLoader": { "alias": "showLoader"; "required": false; "isSignal": true; }; "numToleratedItems": { "alias": "numToleratedItems"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "autoSize": { "alias": "autoSize"; "required": false; "isSignal": true; }; "trackBy": { "alias": "trackBy"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; }, { "onLazyLoad": "onLazyLoad"; "onScroll": "onScroll"; "onScrollIndexChange": "onScrollIndexChange"; }, ["contentTemplate", "itemTemplate", "loaderTemplate", "loadericonTemplate"], never, true, never>;
}

declare class CmmEditorComponent implements ControlValueAccessor {
    editor: _angular_core.Signal<Editor | undefined>;
    value: _angular_core.ModelSignal<any>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    placeholder: _angular_core.InputSignal<string>;
    formats: _angular_core.InputSignal<string[] | undefined>;
    modules: _angular_core.InputSignal<any>;
    bounds: _angular_core.InputSignal<HTMLElement | undefined>;
    scrollingContainer: _angular_core.InputSignal<string | HTMLElement | undefined>;
    debug: _angular_core.InputSignal<string | undefined>;
    readonly: _angular_core.InputSignal<boolean>;
    showHeader: _angular_core.InputSignal<boolean>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onTextChange: _angular_core.OutputEmitterRef<any>;
    onSelectionChange: _angular_core.OutputEmitterRef<any>;
    onInit: _angular_core.OutputEmitterRef<any>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleTextChange(event: any): void;
    getQuill(): any;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmEditorComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmEditorComponent, "cmm-editor", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "formats": { "alias": "formats"; "required": false; "isSignal": true; }; "modules": { "alias": "modules"; "required": false; "isSignal": true; }; "bounds": { "alias": "bounds"; "required": false; "isSignal": true; }; "scrollingContainer": { "alias": "scrollingContainer"; "required": false; "isSignal": true; }; "debug": { "alias": "debug"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "showHeader": { "alias": "showHeader"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onTextChange": "onTextChange"; "onSelectionChange": "onSelectionChange"; "onInit": "onInit"; }, ["headerTemplate"], never, true, never>;
}

type MultiSelectVariant = 'outlined' | 'filled';
type MultiSelectSize = 'small' | 'large';
type MultiSelectDisplay = 'comma' | 'chip';
type MultiSelectFilterMatchMode = 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in';
interface MultiselectProps {
    options?: any[];
    optionLabel?: string;
    optionValue?: string;
    optionDisabled?: string;
    optionGroupLabel?: string;
    optionGroupChildren?: string;
    group?: boolean;
    disabled?: boolean;
    filter?: boolean;
    filterMatchMode?: MultiSelectFilterMatchMode;
    filterPlaceHolder?: string;
    filterLocale?: string;
    display?: MultiSelectDisplay;
    variant?: MultiSelectVariant;
    size?: MultiSelectSize;
    placeholder?: string;
    /**
     * When true, the `label` is rendered as a floating label (PrimeNG `p-floatlabel`) instead of an inline
     * placeholder. Requires `label` to be set; the inline `placeholder` is suppressed.
     */
    floatLabel?: boolean;
    /**
     * Text rendered as the floating label when `floatLabel` is enabled.
     */
    label?: string;
    /**
     * Id applied to the focusable element; used by the floating `<label for>`.
     */
    inputId?: string;
    maxSelectedLabels?: number;
    selectedItemsLabel?: string;
    showToggleAll?: boolean;
    showClear?: boolean;
    emptyMessage?: string;
    emptyFilterMessage?: string;
    scrollHeight?: string;
    maxVisibleSearchItems?: number;
    lazy?: boolean;
    virtualScroll?: boolean;
    virtualScrollItemSize?: number;
    virtualScrollOptions?: any;
    overlayVisible?: boolean;
    appendTo?: unknown;
    dataKey?: string;
    autofocusFilter?: boolean;
    resetFilterOnHide?: boolean;
    dropdownIcon?: string;
    showHeader?: boolean;
    autoZIndex?: boolean;
    baseZIndex?: number;
    panelStyle?: Record<string, any>;
    panelStyleClass?: string;
    styleClass?: string;
    style?: Record<string, any>;
    filterBy?: string;
    selectionLimit?: number;
    loading?: boolean;
    loadingIcon?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    autofocus?: boolean;
    maxWidth?: string | number;
    tabindex?: number;
    /**
     * Max length applied to the built-in filter input.
     */
    maxLength?: number;
    /**
     * Maximum width of a chip in pixels
     */
    maxChipWidth?: number;
}

declare class CmmMultiselectComponent implements ControlValueAccessor {
    private readonly hostElement;
    /**
     * When `floatLabel` is enabled the `label` is rendered as the floating label so the inline placeholder is suppressed.
     */
    getPlaceholder(): string;
    private getDefaultScrollHeight;
    getEmptyStateHeight(): string;
    value: _angular_core.ModelSignal<any[]>;
    multiselect: _angular_core.Signal<MultiSelect | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    selectedItemsTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyFilterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    props: _angular_core.InputSignal<MultiselectProps | undefined>;
    cvaDisabled: _angular_core.WritableSignal<boolean>;
    dropdownWrapper: _angular_core.Signal<ElementRef<any>>;
    dropdownWidth: _angular_core.WritableSignal<number>;
    doesSelectionOverflow: _angular_core.WritableSignal<boolean>;
    findOption(val: any): any;
    getOptionLabel(option: any): string;
    getSelectedItemsLabel(value: any[]): string;
    getCommaSeperatedLabels(value: any[]): string;
    getChipValue(item: any): any;
    removeChipItem(val: any): void;
    constructor();
    computedProps: _angular_core.Signal<{
        options: any[];
        optionLabel: string;
        optionValue: string;
        optionDisabled: string;
        optionGroupLabel: string;
        optionGroupChildren: string;
        group: boolean;
        disabled: boolean;
        filter: boolean;
        filterMatchMode: _khcn_core_ui.MultiSelectFilterMatchMode;
        filterPlaceHolder: string | undefined;
        filterLocale: string | undefined;
        display: _khcn_core_ui.MultiSelectDisplay;
        variant: _khcn_core_ui.MultiSelectVariant;
        size: _khcn_core_ui.MultiSelectSize | undefined;
        placeholder: string | undefined;
        floatLabel: boolean;
        label: string;
        inputId: string | undefined;
        maxSelectedLabels: number;
        selectedItemsLabel: string | undefined;
        showToggleAll: boolean;
        showClear: boolean;
        emptyMessage: string | undefined;
        emptyFilterMessage: string | undefined;
        scrollHeight: string;
        lazy: boolean;
        virtualScroll: boolean;
        virtualScrollItemSize: number | undefined;
        virtualScrollOptions: any;
        overlayVisible: boolean;
        appendTo: {};
        dataKey: string | undefined;
        autofocusFilter: boolean;
        resetFilterOnHide: boolean;
        dropdownIcon: string;
        showHeader: boolean;
        autoZIndex: boolean;
        baseZIndex: number;
        panelStyle: Record<string, any> | undefined;
        panelStyleClass: string | undefined;
        styleClass: string | undefined;
        style: Record<string, any> | undefined;
        filterBy: string | undefined;
        selectionLimit: number | undefined;
        loading: boolean;
        loadingIcon: string | undefined;
        ariaLabel: string | undefined;
        ariaLabelledBy: string | undefined;
        autofocus: boolean;
        maxWidth: string | number | undefined;
        tabindex: number;
        maxLength: number | undefined;
        maxChipWidth: number | undefined;
        maxVisibleSearchItems?: number;
    }>;
    handlePanelShow(): void;
    onChange: _angular_core.OutputEmitterRef<MultiSelectChangeEvent>;
    onFilter: _angular_core.OutputEmitterRef<MultiSelectFilterEvent>;
    onFocus: _angular_core.OutputEmitterRef<MultiSelectFocusEvent>;
    onBlur: _angular_core.OutputEmitterRef<MultiSelectBlurEvent>;
    onClick: _angular_core.OutputEmitterRef<Event>;
    onClear: _angular_core.OutputEmitterRef<void>;
    onPanelShow: _angular_core.OutputEmitterRef<void>;
    onPanelHide: _angular_core.OutputEmitterRef<void>;
    onLazyLoad: _angular_core.OutputEmitterRef<MultiSelectLazyLoadEvent>;
    onRemove: _angular_core.OutputEmitterRef<MultiSelectRemoveEvent>;
    onSelectAllChange: _angular_core.OutputEmitterRef<MultiSelectSelectAllChangeEvent>;
    handleClear(): void;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: any[]): void;
    registerOnChange(fn: (value: any[]) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: MultiSelectChangeEvent): void;
    handleFilter(event: MultiSelectFilterEvent): void;
    handleFocus(event: MultiSelectFocusEvent): void;
    handleBlur(event: MultiSelectBlurEvent): void;
    /**
     * Commit the touched state when the overlay closes, mirroring PrimeNG
     * MultiSelect's onModelTouched() call in onOverlayAfterLeave(). This covers the
     * filter flow where the combobox input already blurred (while the panel was
     * open) when focus moved into the filter, so handleBlur is skipped on close.
     */
    handlePanelHide(): void;
    /**
     * Handle document mouse down event
     * @param event Mouse event
     */
    handleDocumentMouseDown(event: MouseEvent): void;
    protected readonly MULTISELECT_DEFAULTS: {
        readonly DISABLED: false;
        readonly FILTER: false;
        readonly FILTER_MATCH_MODE: "contains";
        readonly DISPLAY: "comma";
        readonly VARIANT: "outlined";
        readonly SHOW_TOGGLE_ALL: true;
        readonly SHOW_CLEAR: false;
        readonly MAX_SELECTED_LABELS: 3;
        readonly AUTO_Z_INDEX: true;
        readonly BASE_Z_INDEX: 0;
        readonly SHOW_HEADER: true;
        readonly VIRTUAL_SCROLL: false;
        readonly LAZY: false;
        readonly OVERLAY_VISIBLE: false;
        readonly RESET_FILTER_ON_HIDE: false;
        readonly DROP_DOWN_ICON: "pi pi-chevron-down";
        readonly OPTION_LABEL: "label";
        readonly OPTION_VALUE: "value";
        readonly OPTION_DISABLED: "disabled";
        readonly OPTION_GROUP_LABEL: "label";
        readonly OPTION_GROUP_CHILDREN: "items";
    };
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmMultiselectComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmMultiselectComponent, "cmm-multiselect", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "props": { "alias": "props"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; "onFilter": "onFilter"; "onFocus": "onFocus"; "onBlur": "onBlur"; "onClick": "onClick"; "onClear": "onClear"; "onPanelShow": "onPanelShow"; "onPanelHide": "onPanelHide"; "onLazyLoad": "onLazyLoad"; "onRemove": "onRemove"; "onSelectAllChange": "onSelectAllChange"; }, ["itemTemplate", "selectedItemsTemplate", "headerTemplate", "footerTemplate", "emptyTemplate", "emptyFilterTemplate"], never, true, never>;
}

declare class CmmScrollpanelComponent {
    scrollPanel: _angular_core.Signal<ScrollPanel | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    step: _angular_core.InputSignal<number>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    scrollTop(scrollTop: number): void;
    refresh(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmScrollpanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmScrollpanelComponent, "cmm-scrollpanel", never, { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "step": { "alias": "step"; "required": false; "isSignal": true; }; }, {}, ["contentTemplate"], ["*"], true, never>;
}

/**
 * Event emitted before the fieldset panel is toggled
 */
interface FieldsetBeforeToggleEvent {
    /**
     * Browser event
     */
    originalEvent: Event;
    /**
     * Collapsed state of the panel
     */
    collapsed?: boolean;
}
/**
 * Event emitted after the fieldset panel is toggled
 */
interface FieldsetAfterToggleEvent {
    /**
     * Browser event
     */
    originalEvent: Event;
    /**
     * Collapsed state of the panel
     */
    collapsed?: boolean;
}

declare class CmmFieldsetComponent {
    collapsed: _angular_core.ModelSignal<boolean>;
    readonly headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly expandiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly collapseiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly legend: _angular_core.InputSignal<string>;
    readonly toggleable: _angular_core.InputSignal<boolean>;
    readonly style: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly styleClass: _angular_core.InputSignal<string>;
    readonly transitionOptions: _angular_core.InputSignal<string>;
    readonly onBeforeToggle: _angular_core.OutputEmitterRef<FieldsetBeforeToggleEvent>;
    readonly onAfterToggle: _angular_core.OutputEmitterRef<FieldsetAfterToggleEvent>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmFieldsetComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmFieldsetComponent, "cmm-fieldset", never, { "collapsed": { "alias": "collapsed"; "required": false; "isSignal": true; }; "legend": { "alias": "legend"; "required": false; "isSignal": true; }; "toggleable": { "alias": "toggleable"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; }, { "collapsed": "collapsedChange"; "onBeforeToggle": "onBeforeToggle"; "onAfterToggle": "onAfterToggle"; }, ["headerTemplate", "expandiconTemplate", "collapseiconTemplate", "contentTemplate"], ["*"], true, never>;
}

type ScrollTopTarget = 'window' | 'parent';
type ScrollTopBehavior = 'auto' | 'smooth';

declare class CmmScrolltopComponent {
    target: _angular_core.InputSignal<ScrollTopTarget>;
    threshold: _angular_core.InputSignal<number>;
    icon: _angular_core.InputSignal<string | undefined>;
    behavior: _angular_core.InputSignal<ScrollTopBehavior>;
    showTransitionOptions: _angular_core.InputSignal<string>;
    hideTransitionOptions: _angular_core.InputSignal<string>;
    buttonAriaLabel: _angular_core.InputSignal<string | undefined>;
    buttonProps: _angular_core.InputSignal<any>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmScrolltopComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmScrolltopComponent, "cmm-scrolltop", never, { "target": { "alias": "target"; "required": false; "isSignal": true; }; "threshold": { "alias": "threshold"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "behavior": { "alias": "behavior"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; "buttonAriaLabel": { "alias": "buttonAriaLabel"; "required": false; "isSignal": true; }; "buttonProps": { "alias": "buttonProps"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, ["iconTemplate"], never, true, never>;
}

/**
 * FileUpload size options
 */
declare const FILE_UPLOAD_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type FileUploadSize = (typeof FILE_UPLOAD_SIZES)[keyof typeof FILE_UPLOAD_SIZES];
/**
 * FileUpload style variants
 */
declare const FILE_UPLOAD_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type FileUploadVariant = (typeof FILE_UPLOAD_VARIANTS)[keyof typeof FILE_UPLOAD_VARIANTS];
/**
 * FileUpload modes
 */
declare const FILE_UPLOAD_MODES: {
    readonly BASIC: "basic";
    readonly ADVANCED: "advanced";
};
type FileUploadMode = (typeof FILE_UPLOAD_MODES)[keyof typeof FILE_UPLOAD_MODES];
/**
 * HTTP methods for file upload
 */
declare const FILE_UPLOAD_METHODS: {
    readonly POST: "post";
    readonly PUT: "put";
};
type FileUploadMethod = (typeof FILE_UPLOAD_METHODS)[keyof typeof FILE_UPLOAD_METHODS];
/**
 * Common file type patterns
 */
declare const FILE_TYPE_PATTERNS: {
    readonly IMAGES: "image/*";
    readonly DOCUMENTS: ".pdf,.doc,.docx,.txt";
    readonly SPREADSHEETS: ".xls,.xlsx,.csv";
    readonly VIDEOS: "video/*";
    readonly AUDIO: "audio/*";
    readonly ALL: "*";
};
/**
 * Common file size limits (in bytes)
 */
declare const FILE_SIZE_LIMITS: {
    readonly KB_100: 102400;
    readonly KB_500: 512000;
    readonly MB_1: 1048576;
    readonly MB_5: 5242880;
    readonly MB_10: 10485760;
    readonly MB_50: 52428800;
    readonly MB_100: 104857600;
};
declare const FILEUPLOAD_DEFAULTS: {
    readonly MODE: "advanced";
    readonly METHOD: "post";
    readonly MULTIPLE: false;
    readonly AUTO: false;
    readonly MAX_FILE_SIZE: 5242880;
    readonly DISABLED: false;
    readonly WITH_CREDENTIALS: false;
    readonly PREVIEW_WIDTH: 50;
    readonly SHOW_UPLOAD_BUTTON: true;
    readonly SHOW_CANCEL_BUTTON: true;
    readonly CUSTOM_UPLOAD: false;
};

declare class CmmFileUploadComponent {
    name: _angular_core.InputSignal<string | undefined>;
    url: _angular_core.InputSignal<string | undefined>;
    method: _angular_core.InputSignal<FileUploadMethod>;
    multiple: _angular_core.InputSignal<boolean>;
    accept: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    auto: _angular_core.InputSignal<boolean>;
    maxFileSize: _angular_core.InputSignal<number | null>;
    fileLimit: _angular_core.InputSignal<number | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    previewWidth: _angular_core.InputSignal<number>;
    chooseLabel: _angular_core.InputSignal<string | undefined>;
    uploadLabel: _angular_core.InputSignal<string | undefined>;
    cancelLabel: _angular_core.InputSignal<string | undefined>;
    chooseIcon: _angular_core.InputSignal<string | undefined>;
    uploadIcon: _angular_core.InputSignal<string | undefined>;
    cancelIcon: _angular_core.InputSignal<string | undefined>;
    showUploadButton: _angular_core.InputSignal<boolean>;
    showCancelButton: _angular_core.InputSignal<boolean>;
    mode: _angular_core.InputSignal<FileUploadMode>;
    headers: _angular_core.InputSignal<HttpHeaders | undefined>;
    customUpload: _angular_core.InputSignal<boolean>;
    withCredentials: _angular_core.InputSignal<boolean>;
    invalidFileSizeMessageSummary: _angular_core.InputSignal<string>;
    invalidFileSizeMessageDetail: _angular_core.InputSignal<string>;
    invalidFileTypeMessageSummary: _angular_core.InputSignal<string>;
    invalidFileTypeMessageDetail: _angular_core.InputSignal<string>;
    invalidFileLimitMessageDetail: _angular_core.InputSignal<string>;
    invalidFileLimitMessageSummary: _angular_core.InputSignal<string>;
    uploadStyleClass: _angular_core.InputSignal<string>;
    cancelStyleClass: _angular_core.InputSignal<string>;
    removeStyleClass: _angular_core.InputSignal<string>;
    chooseStyleClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    onBeforeUpload: _angular_core.OutputEmitterRef<FileBeforeUploadEvent>;
    onSend: _angular_core.OutputEmitterRef<FileSendEvent>;
    onUpload: _angular_core.OutputEmitterRef<FileUploadEvent>;
    onError: _angular_core.OutputEmitterRef<FileUploadErrorEvent>;
    onClear: _angular_core.OutputEmitterRef<Event>;
    onRemove: _angular_core.OutputEmitterRef<FileRemoveEvent>;
    onSelect: _angular_core.OutputEmitterRef<FileSelectEvent>;
    onProgress: _angular_core.OutputEmitterRef<FileProgressEvent>;
    uploadHandler: _angular_core.OutputEmitterRef<FileUploadHandlerEvent>;
    onImageError: _angular_core.OutputEmitterRef<Event>;
    onRemoveUploadedFile: _angular_core.OutputEmitterRef<RemoveUploadedFileEvent>;
    fileTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    toolbarTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    chooseIconTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    fileLabelTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    uploadIconTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    cancelIconTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    emptyTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    fileUploadRef: _angular_core.Signal<FileUpload | undefined>;
    computedStyleClass: _angular_core.Signal<string>;
    handleBeforeUpload(event: FileBeforeUploadEvent): void;
    handleSend(event: FileSendEvent): void;
    handleUpload(event: FileUploadEvent): void;
    handleError(event: FileUploadErrorEvent): void;
    handleClear(event: Event): void;
    handleRemove(event: FileRemoveEvent): void;
    handleSelect(event: FileSelectEvent): void;
    handleProgress(event: FileProgressEvent): void;
    handleUploadHandler(event: FileUploadHandlerEvent): void;
    handleImageError(event: Event): void;
    handleRemoveUploadedFile(event: RemoveUploadedFileEvent): void;
    upload(): void;
    clear(): void;
    remove(event: Event, index: number): void;
    getFiles(): File[];
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmFileUploadComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmFileUploadComponent, "cmm-fileUpload", ["cmmfileupload"], { "name": { "alias": "name"; "required": false; "isSignal": true; }; "url": { "alias": "url"; "required": false; "isSignal": true; }; "method": { "alias": "method"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "accept": { "alias": "accept"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "auto": { "alias": "auto"; "required": false; "isSignal": true; }; "maxFileSize": { "alias": "maxFileSize"; "required": false; "isSignal": true; }; "fileLimit": { "alias": "fileLimit"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "previewWidth": { "alias": "previewWidth"; "required": false; "isSignal": true; }; "chooseLabel": { "alias": "chooseLabel"; "required": false; "isSignal": true; }; "uploadLabel": { "alias": "uploadLabel"; "required": false; "isSignal": true; }; "cancelLabel": { "alias": "cancelLabel"; "required": false; "isSignal": true; }; "chooseIcon": { "alias": "chooseIcon"; "required": false; "isSignal": true; }; "uploadIcon": { "alias": "uploadIcon"; "required": false; "isSignal": true; }; "cancelIcon": { "alias": "cancelIcon"; "required": false; "isSignal": true; }; "showUploadButton": { "alias": "showUploadButton"; "required": false; "isSignal": true; }; "showCancelButton": { "alias": "showCancelButton"; "required": false; "isSignal": true; }; "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "headers": { "alias": "headers"; "required": false; "isSignal": true; }; "customUpload": { "alias": "customUpload"; "required": false; "isSignal": true; }; "withCredentials": { "alias": "withCredentials"; "required": false; "isSignal": true; }; "invalidFileSizeMessageSummary": { "alias": "invalidFileSizeMessageSummary"; "required": false; "isSignal": true; }; "invalidFileSizeMessageDetail": { "alias": "invalidFileSizeMessageDetail"; "required": false; "isSignal": true; }; "invalidFileTypeMessageSummary": { "alias": "invalidFileTypeMessageSummary"; "required": false; "isSignal": true; }; "invalidFileTypeMessageDetail": { "alias": "invalidFileTypeMessageDetail"; "required": false; "isSignal": true; }; "invalidFileLimitMessageDetail": { "alias": "invalidFileLimitMessageDetail"; "required": false; "isSignal": true; }; "invalidFileLimitMessageSummary": { "alias": "invalidFileLimitMessageSummary"; "required": false; "isSignal": true; }; "uploadStyleClass": { "alias": "uploadStyleClass"; "required": false; "isSignal": true; }; "cancelStyleClass": { "alias": "cancelStyleClass"; "required": false; "isSignal": true; }; "removeStyleClass": { "alias": "removeStyleClass"; "required": false; "isSignal": true; }; "chooseStyleClass": { "alias": "chooseStyleClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, { "onBeforeUpload": "onBeforeUpload"; "onSend": "onSend"; "onUpload": "onUpload"; "onError": "onError"; "onClear": "onClear"; "onRemove": "onRemove"; "onSelect": "onSelect"; "onProgress": "onProgress"; "uploadHandler": "uploadHandler"; "onImageError": "onImageError"; "onRemoveUploadedFile": "onRemoveUploadedFile"; }, ["fileTemplate", "headerTemplate", "contentTemplate", "toolbarTemplate", "chooseIconTemplate", "fileLabelTemplate", "uploadIconTemplate", "cancelIconTemplate", "emptyTemplate"], never, true, never>;
}

type SelectVariant = 'filled' | 'outlined';
type SelectSize = 'small' | 'large';
type FilterMatchMode = 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte';
interface SelectChangeEvent {
    originalEvent: Event;
    value: any;
}
interface SelectFilterEvent {
    originalEvent: Event;
    filter: any;
}
interface SelectLazyLoadEvent {
    first: number;
    last: number;
}
interface SelectFilterOptions {
    filter?: Function;
    reset?: Function;
}
interface OverlayOptions {
    [key: string]: any;
}
interface CmmSelectProps {
    options?: any[];
    optionLabel?: string;
    optionValue?: string;
    optionDisabled?: string;
    optionGroupLabel?: string;
    optionGroupChildren?: string;
    scrollHeight?: string;
    maxVisibleSearchItems?: number;
    filter?: boolean;
    filterBy?: string;
    filterPlaceholder?: string;
    filterLocale?: string;
    filterMatchMode?: FilterMatchMode;
    filterValue?: string;
    readonly?: boolean;
    required?: boolean;
    editable?: boolean;
    appendTo?: any;
    tabindex?: number;
    placeholder?: string;
    label?: string;
    floatLabel?: boolean;
    loadingIcon?: string;
    inputId?: string;
    dataKey?: string;
    autofocus?: boolean;
    autofocusFilter?: boolean;
    resetFilterOnHide?: boolean;
    checkmark?: boolean;
    variant?: SelectVariant;
    dropdownIcon?: string;
    loading?: boolean;
    autoDisplayFirst?: boolean;
    group?: boolean;
    showClear?: boolean;
    emptyFilterMessage?: string;
    emptyMessage?: string;
    lazy?: boolean;
    virtualScroll?: boolean;
    virtualScrollItemSize?: number;
    virtualScrollOptions?: ScrollerOptions;
    size?: SelectSize;
    overlayOptions?: OverlayOptions;
    ariaFilterLabel?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    maxlength?: number;
    /**
     * Max length applied to the built-in filter input.
     */
    maxLength?: number;
    tooltip?: string;
    tooltipPosition?: 'right' | 'left' | 'top' | 'bottom';
    tooltipPositionStyle?: string;
    tooltipStyleClass?: string;
    focusOnHover?: boolean;
    selectOnFocus?: boolean;
    autoOptionFocus?: boolean;
    fluid?: boolean;
    disabled?: boolean;
    style?: Record<string, any>;
    styleClass?: string;
    panelStyle?: Record<string, any>;
    panelStyleClass?: string;
    name?: string;
    maxWidth?: string | number;
    width?: string | number;
    /**
     * Use pseudo disabled mode just to show tooltip while typing
     * When this is true, the select will be disabled but it will not be disabled in the form
     */
    showTooltipWhenDisabled?: boolean;
}

/**
 * Select is a form component to choose a value from a collection of options with virtual scrolling support.
 * Wraps PrimeNG Select component.
 */
declare class CmmSelectComponent implements ControlValueAccessor {
    private readonly hostElement;
    private getDefaultScrollHeight;
    getEmptyStateHeight(): string;
    /**
     * Value of the select
     */
    value: _angular_core.ModelSignal<any>;
    /**
     * Component props
     */
    props: _angular_core.InputSignal<CmmSelectProps>;
    /** Reactive-forms disabled state (set via setDisabledState) */
    cvaDisabled: _angular_core.WritableSignal<boolean>;
    computedProps: _angular_core.Signal<{
        scrollHeight: string;
        filterMatchMode: _khcn_core_ui.FilterMatchMode;
        variant: _khcn_core_ui.SelectVariant;
        appendTo: any;
        tooltipPosition: "top" | "bottom" | "left" | "right";
        tooltipPositionStyle: string;
        name: string;
        required: boolean;
        disabled: boolean;
        readonly: boolean;
        style: Record<string, any> | undefined;
        optionGroupChildren: string;
        tabindex: number;
        width: string | number;
        dropdownIcon: string;
        showTooltipWhenDisabled: boolean;
        styleClass: string;
        floatLabel: boolean | undefined;
        options?: any[];
        optionLabel?: string;
        optionValue?: string;
        optionDisabled?: string;
        optionGroupLabel?: string;
        maxVisibleSearchItems?: number;
        filter?: boolean;
        filterBy?: string;
        filterPlaceholder?: string;
        filterLocale?: string;
        filterValue?: string;
        editable?: boolean;
        placeholder?: string;
        label?: string;
        loadingIcon?: string;
        inputId?: string;
        dataKey?: string;
        autofocus?: boolean;
        autofocusFilter?: boolean;
        resetFilterOnHide?: boolean;
        checkmark?: boolean;
        loading?: boolean;
        autoDisplayFirst?: boolean;
        group?: boolean;
        showClear?: boolean;
        emptyFilterMessage?: string;
        emptyMessage?: string;
        lazy?: boolean;
        virtualScroll?: boolean;
        virtualScrollItemSize?: number;
        virtualScrollOptions?: primeng_api.ScrollerOptions;
        size?: _khcn_core_ui.SelectSize;
        overlayOptions?: _khcn_core_ui.OverlayOptions;
        ariaFilterLabel?: string;
        ariaLabel?: string;
        ariaLabelledBy?: string;
        maxlength?: number;
        maxLength?: number;
        tooltip?: string;
        tooltipStyleClass?: string;
        focusOnHover?: boolean;
        selectOnFocus?: boolean;
        autoOptionFocus?: boolean;
        fluid?: boolean;
        panelStyle?: Record<string, any>;
        panelStyleClass?: string;
        maxWidth?: string | number;
    }>;
    getPlaceholder(): string;
    getStyle(): Record<string, any> | undefined;
    /**
     * Callback to invoke when value of select changes
     */
    onChange: _angular_core.OutputEmitterRef<SelectChangeEvent>;
    /**
     * Callback to invoke when data is filtered
     */
    onFilter: _angular_core.OutputEmitterRef<SelectFilterEvent>;
    /**
     * Callback to invoke when select gets focus
     */
    onFocus: _angular_core.OutputEmitterRef<Event>;
    /**
     * Callback to invoke when select loses focus
     */
    onBlur: _angular_core.OutputEmitterRef<Event>;
    /**
     * Callback to invoke when component is clicked
     */
    onClick: _angular_core.OutputEmitterRef<MouseEvent>;
    /**
     * Callback to invoke when select overlay gets visible
     */
    onShow: _angular_core.OutputEmitterRef<any>;
    handleShow(event: any): void;
    /**
     * Callback to invoke when select overlay gets hidden
     */
    onHide: _angular_core.OutputEmitterRef<any>;
    /**
     * Callback to invoke when select clears the value
     */
    onClear: _angular_core.OutputEmitterRef<Event>;
    /**
     * Callback to invoke in lazy mode to load new data
     */
    onLazyLoad: _angular_core.OutputEmitterRef<SelectLazyLoadEvent>;
    /**
     * Custom item template
     */
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom group template
     */
    groupTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom loader template
     */
    loaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom selected item template
     */
    selecteditemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom header template
     */
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom filter template
     */
    filterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom footer template
     */
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom empty filter template
     */
    emptyfilterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom empty template
     */
    emptyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom dropdown icon template
     */
    dropdowniconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom loading icon template
     */
    loadingiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom clear icon template
     */
    cleariconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom filter icon template
     */
    filtericonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Reference to the PrimeNG Select component
     */
    selectRef: _angular_core.Signal<Select | undefined>;
    private onChangeFn;
    private onTouchedFn;
    /**
     * Handles change event
     */
    handleChange(event: any): void;
    handleClear($event: Event): void;
    /**
     * Handles blur event
     */
    handleBlur(event: Event): void;
    /**
     * Commit the touched state when the overlay closes, mirroring PrimeNG Select's
     * onModelTouched() call in onOverlayAfterLeave(). This covers the filter flow
     * where the combobox input already blurred (while the panel was open) when
     * focus moved into the filter, so handleBlur is skipped on close.
     */
    handleHide(event: any): void;
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    /**
     * Callback to invoke on filter reset
     */
    resetFilter(): void;
    /**
     * Displays the panel
     */
    show(isFocus?: boolean): void;
    /**
     * Hides the panel
     */
    hide(isFocus?: boolean): void;
    /**
     * Applies focus
     */
    focus(): void;
    /**
     * Clears the model
     */
    clear(event?: Event): void;
    /**
     * Handle document mouse down event
     * @param event Mouse event
     */
    handleDocumentMouseDown(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSelectComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSelectComponent, "cmm-select", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "props": { "alias": "props"; "required": true; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; "onFilter": "onFilter"; "onFocus": "onFocus"; "onBlur": "onBlur"; "onClick": "onClick"; "onShow": "onShow"; "onHide": "onHide"; "onClear": "onClear"; "onLazyLoad": "onLazyLoad"; }, ["itemTemplate", "groupTemplate", "loaderTemplate", "selecteditemTemplate", "headerTemplate", "filterTemplate", "footerTemplate", "emptyfilterTemplate", "emptyTemplate", "dropdowniconTemplate", "loadingiconTemplate", "cleariconTemplate", "filtericonTemplate"], never, true, never>;
}

type FloatLabelVariant = 'over' | 'in' | 'on';

declare class CmmFloatlabelComponent {
    readonly variant: _angular_core.InputSignal<FloatLabelVariant>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmFloatlabelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmFloatlabelComponent, "cmm-floatlabel", never, { "variant": { "alias": "variant"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class CmmBreadcrumbComponent {
    model: _angular_core.InputSignal<MenuItem[]>;
    home: _angular_core.InputSignal<MenuItem | undefined>;
    homeAriaLabel: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"default" | "compact" | "spacious">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    onItemClick: _angular_core.OutputEmitterRef<{
        originalEvent: Event;
        item: MenuItem;
    }>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    separatorTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    computedStyleClass: _angular_core.Signal<string>;
    handleItemClick(event: {
        originalEvent: Event;
        item: MenuItem;
    }): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmBreadcrumbComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmBreadcrumbComponent, "cmm-breadcrumb", ["cmmbreadcrumb"], { "model": { "alias": "model"; "required": false; "isSignal": true; }; "home": { "alias": "home"; "required": false; "isSignal": true; }; "homeAriaLabel": { "alias": "homeAriaLabel"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, { "onItemClick": "onItemClick"; }, ["itemTemplate", "separatorTemplate"], never, true, never>;
}

type GalleriaResponsiveOptions = {
    breakpoint: string;
    numVisible: number;
};
type GalleriaTransitionType = 'fade' | 'slide';
type GalleriaThumbnailsPosition = 'bottom' | 'top' | 'left' | 'right';
type GalleriaIndicatorsPosition = 'bottom' | 'top' | 'left' | 'right';

declare class CmmGalleriaComponent {
    readonly galleria: _angular_core.Signal<Galleria | undefined>;
    visible: _angular_core.ModelSignal<boolean>;
    activeIndex: _angular_core.ModelSignal<number>;
    readonly id: _angular_core.InputSignal<string | undefined>;
    readonly value: _angular_core.InputSignal<any[]>;
    readonly responsiveOptions: _angular_core.InputSignal<GalleriaResponsiveOptions[] | undefined>;
    readonly numVisible: _angular_core.InputSignal<number>;
    readonly circular: _angular_core.InputSignal<boolean>;
    readonly autoPlay: _angular_core.InputSignal<boolean>;
    readonly shouldStopAutoplayByClick: _angular_core.InputSignal<boolean>;
    readonly transitionInterval: _angular_core.InputSignal<number>;
    readonly showThumbnails: _angular_core.InputSignal<boolean>;
    readonly thumbnailsPosition: _angular_core.InputSignal<GalleriaThumbnailsPosition>;
    readonly verticalThumbnailViewPortHeight: _angular_core.InputSignal<string>;
    readonly showIndicators: _angular_core.InputSignal<boolean>;
    readonly showIndicatorsOnItem: _angular_core.InputSignal<boolean>;
    readonly indicatorsPosition: _angular_core.InputSignal<"top" | "bottom" | "left" | "right">;
    readonly showItemNavigators: _angular_core.InputSignal<boolean>;
    readonly showItemNavigatorsOnHover: _angular_core.InputSignal<boolean>;
    readonly showThumbnailNavigators: _angular_core.InputSignal<boolean>;
    readonly changeItemOnIndicatorHover: _angular_core.InputSignal<boolean>;
    readonly fullScreen: _angular_core.InputSignal<boolean>;
    readonly baseZIndex: _angular_core.InputSignal<number>;
    readonly maskClass: _angular_core.InputSignal<string | undefined>;
    readonly containerClass: _angular_core.InputSignal<string | undefined>;
    readonly style: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    readonly showTransitionOptions: _angular_core.InputSignal<string>;
    readonly hideTransitionOptions: _angular_core.InputSignal<string>;
    readonly headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly thumbnailTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly captionTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly indicatorTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly closeIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly itemNextIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly itemPreviousIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly previousThumbnailIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly nextThumbnailIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly onShow: _angular_core.OutputEmitterRef<void>;
    readonly onHide: _angular_core.OutputEmitterRef<void>;
    readonly onActiveIndexChange: _angular_core.OutputEmitterRef<number>;
    handleActiveIndexChange(index: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmGalleriaComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmGalleriaComponent, "cmm-galleria", never, { "visible": { "alias": "visible"; "required": false; "isSignal": true; }; "activeIndex": { "alias": "activeIndex"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "responsiveOptions": { "alias": "responsiveOptions"; "required": false; "isSignal": true; }; "numVisible": { "alias": "numVisible"; "required": false; "isSignal": true; }; "circular": { "alias": "circular"; "required": false; "isSignal": true; }; "autoPlay": { "alias": "autoPlay"; "required": false; "isSignal": true; }; "shouldStopAutoplayByClick": { "alias": "shouldStopAutoplayByClick"; "required": false; "isSignal": true; }; "transitionInterval": { "alias": "transitionInterval"; "required": false; "isSignal": true; }; "showThumbnails": { "alias": "showThumbnails"; "required": false; "isSignal": true; }; "thumbnailsPosition": { "alias": "thumbnailsPosition"; "required": false; "isSignal": true; }; "verticalThumbnailViewPortHeight": { "alias": "verticalThumbnailViewPortHeight"; "required": false; "isSignal": true; }; "showIndicators": { "alias": "showIndicators"; "required": false; "isSignal": true; }; "showIndicatorsOnItem": { "alias": "showIndicatorsOnItem"; "required": false; "isSignal": true; }; "indicatorsPosition": { "alias": "indicatorsPosition"; "required": false; "isSignal": true; }; "showItemNavigators": { "alias": "showItemNavigators"; "required": false; "isSignal": true; }; "showItemNavigatorsOnHover": { "alias": "showItemNavigatorsOnHover"; "required": false; "isSignal": true; }; "showThumbnailNavigators": { "alias": "showThumbnailNavigators"; "required": false; "isSignal": true; }; "changeItemOnIndicatorHover": { "alias": "changeItemOnIndicatorHover"; "required": false; "isSignal": true; }; "fullScreen": { "alias": "fullScreen"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "maskClass": { "alias": "maskClass"; "required": false; "isSignal": true; }; "containerClass": { "alias": "containerClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; }, { "visible": "visibleChange"; "activeIndex": "activeIndexChange"; "onShow": "onShow"; "onHide": "onHide"; "onActiveIndexChange": "onActiveIndexChange"; }, ["headerTemplate", "footerTemplate", "itemTemplate", "thumbnailTemplate", "captionTemplate", "indicatorTemplate", "closeIconTemplate", "itemNextIconTemplate", "itemPreviousIconTemplate", "previousThumbnailIconTemplate", "nextThumbnailIconTemplate"], never, true, never>;
}

declare class CmmButtonComponent {
    label: _angular_core.InputSignal<string>;
    icon: _angular_core.InputSignal<string>;
    iconPos: _angular_core.InputSignal<"top" | "bottom" | "left" | "right">;
    badge: _angular_core.InputSignal<string>;
    loading: _angular_core.InputSignal<boolean>;
    loadingIcon: _angular_core.InputSignal<string>;
    severity: _angular_core.InputSignal<"danger" | "primary" | "secondary" | "success" | "info" | "help" | "contrast" | "warn" | null>;
    raised: _angular_core.InputSignal<boolean>;
    rounded: _angular_core.InputSignal<boolean>;
    text: _angular_core.InputSignal<boolean>;
    outlined: _angular_core.InputSignal<boolean>;
    link: _angular_core.InputSignal<boolean>;
    size: _angular_core.InputSignal<"small" | "large" | undefined>;
    plain: _angular_core.InputSignal<boolean>;
    variant: _angular_core.InputSignal<"outlined" | "text" | undefined>;
    fluid: _angular_core.InputSignal<boolean>;
    autofocus: _angular_core.InputSignal<boolean>;
    tabindex: _angular_core.InputSignal<number | undefined>;
    badgeClass: _angular_core.InputSignal<string>;
    badgeSeverity: _angular_core.InputSignal<"danger" | "primary" | "secondary" | "success" | "info" | "help" | "contrast" | "warn">;
    buttonProps: _angular_core.InputSignal<any>;
    type: _angular_core.InputSignal<"reset" | "submit" | "button">;
    disabled: _angular_core.InputSignal<boolean>;
    ariaLabel: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    customVariant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    onClick: _angular_core.OutputEmitterRef<Event>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loadingIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    computedStyleClass: _angular_core.Signal<string>;
    handleClick(event: Event): void;
    handleFocus(event: Event): void;
    handleBlur(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmButtonComponent, "cmm-button", ["cmmbutton"], { "label": { "alias": "label"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "iconPos": { "alias": "iconPos"; "required": false; "isSignal": true; }; "badge": { "alias": "badge"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "loadingIcon": { "alias": "loadingIcon"; "required": false; "isSignal": true; }; "severity": { "alias": "severity"; "required": false; "isSignal": true; }; "raised": { "alias": "raised"; "required": false; "isSignal": true; }; "rounded": { "alias": "rounded"; "required": false; "isSignal": true; }; "text": { "alias": "text"; "required": false; "isSignal": true; }; "outlined": { "alias": "outlined"; "required": false; "isSignal": true; }; "link": { "alias": "link"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "plain": { "alias": "plain"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "fluid": { "alias": "fluid"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "badgeClass": { "alias": "badgeClass"; "required": false; "isSignal": true; }; "badgeSeverity": { "alias": "badgeSeverity"; "required": false; "isSignal": true; }; "buttonProps": { "alias": "buttonProps"; "required": false; "isSignal": true; }; "type": { "alias": "type"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "customVariant": { "alias": "customVariant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, { "onClick": "onClick"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["contentTemplate", "loadingIconTemplate", "iconTemplate"], ["*"], true, never>;
}

declare class CmmButtongroupComponent {
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    orientation: _angular_core.InputSignal<"vertical" | "horizontal">;
    computedStyleClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmButtongroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmButtongroupComponent, "cmm-buttongroup", ["cmmbuttongroup"], { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | 'center';
type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

declare class CmmToastComponent {
    key: _angular_core.InputSignal<string | undefined>;
    position: _angular_core.InputSignal<ToastPosition>;
    life: _angular_core.InputSignal<number>;
    showTransitionOptions: _angular_core.InputSignal<string>;
    hideTransitionOptions: _angular_core.InputSignal<string>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    preventOpenDuplicates: _angular_core.InputSignal<boolean>;
    preventDuplicates: _angular_core.InputSignal<boolean>;
    style: _angular_core.InputSignal<Record<string, any>>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    breakpoints: _angular_core.InputSignal<Record<string, unknown> | undefined>;
    messageTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    onClose: _angular_core.OutputEmitterRef<any>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmToastComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmToastComponent, "cmm-toast", never, { "key": { "alias": "key"; "required": false; "isSignal": true; }; "position": { "alias": "position"; "required": false; "isSignal": true; }; "life": { "alias": "life"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "preventOpenDuplicates": { "alias": "preventOpenDuplicates"; "required": false; "isSignal": true; }; "preventDuplicates": { "alias": "preventDuplicates"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "breakpoints": { "alias": "breakpoints"; "required": false; "isSignal": true; }; }, { "onClose": "onClose"; }, ["messageTemplate"], never, true, never>;
}

interface ToggleButtonChangeEvent {
    originalEvent: Event;
    checked: boolean | undefined;
}
declare class CmmToggleButtonComponent implements ControlValueAccessor {
    checked: _angular_core.ModelSignal<boolean>;
    onLabel: _angular_core.InputSignal<string>;
    offLabel: _angular_core.InputSignal<string>;
    onIcon: _angular_core.InputSignal<string | undefined>;
    offIcon: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string>;
    inputId: _angular_core.InputSignal<string | undefined>;
    tabindex: _angular_core.InputSignal<number>;
    size: _angular_core.InputSignal<"small" | "large" | null | undefined>;
    iconPos: _angular_core.InputSignal<"left" | "right">;
    autofocus: _angular_core.InputSignal<boolean>;
    allowEmpty: _angular_core.InputSignal<boolean>;
    onChange: _angular_core.OutputEmitterRef<ToggleButtonChangeEvent>;
    iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    private onTouched;
    private onChangeFn;
    writeValue(value: boolean): void;
    registerOnChange(fn: (value: boolean) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: ToggleButtonChangeEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmToggleButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmToggleButtonComponent, "cmm-togglebutton", never, { "checked": { "alias": "checked"; "required": false; "isSignal": true; }; "onLabel": { "alias": "onLabel"; "required": false; "isSignal": true; }; "offLabel": { "alias": "offLabel"; "required": false; "isSignal": true; }; "onIcon": { "alias": "onIcon"; "required": false; "isSignal": true; }; "offIcon": { "alias": "offIcon"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "inputId": { "alias": "inputId"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "iconPos": { "alias": "iconPos"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; "allowEmpty": { "alias": "allowEmpty"; "required": false; "isSignal": true; }; }, { "checked": "checkedChange"; "onChange": "onChange"; }, ["iconTemplate", "contentTemplate"], never, true, never>;
}

declare class CmmCardComponent {
    header: _angular_core.InputSignal<string>;
    subheader: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    titleTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    subtitleTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    computedStyleClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmCardComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmCardComponent, "cmm-card", ["cmmcard"], { "header": { "alias": "header"; "required": false; "isSignal": true; }; "subheader": { "alias": "subheader"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, {}, ["headerTemplate", "titleTemplate", "subtitleTemplate", "contentTemplate", "footerTemplate"], ["*"], true, never>;
}

type CarouselOrientation = 'horizontal' | 'vertical';

declare class CmmCarouselComponent {
    value: _angular_core.InputSignal<any[]>;
    page: _angular_core.ModelSignal<number>;
    numVisible: _angular_core.InputSignal<number>;
    numScroll: _angular_core.InputSignal<number>;
    responsiveOptions: _angular_core.InputSignal<any[] | undefined>;
    orientation: _angular_core.InputSignal<CarouselOrientation>;
    verticalViewPortHeight: _angular_core.InputSignal<string>;
    contentClass: _angular_core.InputSignal<string>;
    indicatorsContentClass: _angular_core.InputSignal<string>;
    indicatorsContentStyle: _angular_core.InputSignal<Record<string, any> | null>;
    indicatorStyleClass: _angular_core.InputSignal<string>;
    indicatorStyle: _angular_core.InputSignal<Record<string, any> | null>;
    style: _angular_core.InputSignal<Record<string, any> | null>;
    styleClass: _angular_core.InputSignal<string>;
    circular: _angular_core.InputSignal<boolean>;
    autoplayInterval: _angular_core.InputSignal<number>;
    showNavigators: _angular_core.InputSignal<boolean>;
    showIndicators: _angular_core.InputSignal<boolean>;
    prevButtonProps: _angular_core.InputSignal<any>;
    nextButtonProps: _angular_core.InputSignal<any>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    previousIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    nextIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onPage: _angular_core.OutputEmitterRef<any>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmCarouselComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmCarouselComponent, "cmm-carousel", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "page": { "alias": "page"; "required": false; "isSignal": true; }; "numVisible": { "alias": "numVisible"; "required": false; "isSignal": true; }; "numScroll": { "alias": "numScroll"; "required": false; "isSignal": true; }; "responsiveOptions": { "alias": "responsiveOptions"; "required": false; "isSignal": true; }; "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "verticalViewPortHeight": { "alias": "verticalViewPortHeight"; "required": false; "isSignal": true; }; "contentClass": { "alias": "contentClass"; "required": false; "isSignal": true; }; "indicatorsContentClass": { "alias": "indicatorsContentClass"; "required": false; "isSignal": true; }; "indicatorsContentStyle": { "alias": "indicatorsContentStyle"; "required": false; "isSignal": true; }; "indicatorStyleClass": { "alias": "indicatorStyleClass"; "required": false; "isSignal": true; }; "indicatorStyle": { "alias": "indicatorStyle"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "circular": { "alias": "circular"; "required": false; "isSignal": true; }; "autoplayInterval": { "alias": "autoplayInterval"; "required": false; "isSignal": true; }; "showNavigators": { "alias": "showNavigators"; "required": false; "isSignal": true; }; "showIndicators": { "alias": "showIndicators"; "required": false; "isSignal": true; }; "prevButtonProps": { "alias": "prevButtonProps"; "required": false; "isSignal": true; }; "nextButtonProps": { "alias": "nextButtonProps"; "required": false; "isSignal": true; }; }, { "page": "pageChange"; "onPage": "onPage"; }, ["itemTemplate", "headerTemplate", "footerTemplate", "previousIconTemplate", "nextIconTemplate"], never, true, never>;
}

interface CmmToggleswitchProps {
    style?: Record<string, any>;
    styleClass?: string;
    tabindex?: number;
    inputId?: string;
    name?: string;
    disabled?: boolean;
    readonly?: boolean;
    trueValue?: any;
    falseValue?: any;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    autofocus?: boolean;
}

declare class CmmToggleswitchComponent implements ControlValueAccessor {
    /**
     * Value of the toggleswitch
     */
    value: _angular_core.ModelSignal<any>;
    /**
     * Component props
     */
    props: _angular_core.InputSignal<CmmToggleswitchProps>;
    cvaDisabled: _angular_core.WritableSignal<boolean>;
    computedProps: _angular_core.Signal<{
        tabindex: number;
        disabled: boolean;
        readonly: boolean;
        trueValue: any;
        falseValue: any;
        autofocus: boolean;
        styleClass: string;
        name: string;
        style?: Record<string, any>;
        inputId?: string;
        ariaLabel?: string;
        ariaLabelledBy?: string;
    }>;
    /**
     * Custom handle template
     */
    handleTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Callback to invoke when toggleswitch value changes
     */
    onChange: _angular_core.OutputEmitterRef<any>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: ToggleSwitchChangeEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmToggleswitchComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmToggleswitchComponent, "cmm-toggleswitch", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "props": { "alias": "props"; "required": true; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; }, ["handleTemplate"], never, true, never>;
}

declare class CmmToolbarComponent {
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    startTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    endTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    centerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmToolbarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmToolbarComponent, "cmm-toolbar", never, { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; }, {}, ["startTemplate", "endTemplate", "centerTemplate"], never, true, never>;
}

/**
 * Custom selection change event for OrderList component.
 * Emitted when the user selects or deselects items in the list.
 */
interface OrderListSelectionChangeEvent {
    /** Browser event */
    originalEvent: Event;
    /** Currently selected values */
    value: any[];
}
/**
 * Custom filter event for OrderList component.
 * Emitted when the list is filtered.
 */
interface OrderListFilterEvent {
    /** Browser event */
    originalEvent: Event;
    /** Filtered options */
    value: any[];
}
/**
 * Filter options for OrderList component.
 * Provides callbacks to filter and reset the list.
 */
interface OrderListFilterOptions {
    /** Callback to filter items */
    filter?: (value?: any) => void;
    /** Callback to reset the filter */
    reset?: () => void;
}

/**
 * Constants for OrderList component
 */
/** Controls position options */
declare const ORDERLIST_CONTROLS_POSITION: {
    LEFT: "left";
    RIGHT: "right";
};
/** Filter match mode options */
declare const ORDERLIST_FILTER_MATCH_MODE: {
    CONTAINS: "contains";
    STARTS_WITH: "startsWith";
    ENDS_WITH: "endsWith";
    EQUALS: "equals";
    NOT_EQUALS: "notEquals";
    IN: "in";
    LT: "lt";
    LTE: "lte";
    GT: "gt";
    GTE: "gte";
};
type OrderListControlsPosition = (typeof ORDERLIST_CONTROLS_POSITION)[keyof typeof ORDERLIST_CONTROLS_POSITION];
type OrderListFilterMatchMode = (typeof ORDERLIST_FILTER_MATCH_MODE)[keyof typeof ORDERLIST_FILTER_MATCH_MODE];

/**
 * CmmOrderListComponent - Angular 19 wrapper for PrimeNG OrderList
 *
 * A thin wrapper component that provides signal-based inputs and two-way binding
 * for PrimeNG's OrderList component. OrderList is used to manage the order of a collection
 * with drag-drop and control buttons for reordering.
 *
 * @example
 * ```html
 * <cmm-order-list
 *   [(value)]="products"
 *   [(selection)]="selectedProducts"
 *   [dragdrop]="true"
 *   header="Product List">
 *   <ng-template pTemplate="item" let-product>
 *     {{ product.name }}
 *   </ng-template>
 * </cmm-order-list>
 * ```
 */
declare class CmmOrderListComponent {
    /** Reference to the PrimeNG OrderList component */
    private readonly orderListRef;
    readonly itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly emptymessageTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly emptyfiltermessageTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly filterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly moveupiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movetopiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movedowniconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movebottomiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly filtericonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /** Text for the caption */
    readonly header: _angular_core.InputSignal<string | undefined>;
    /** Inline style of the component */
    readonly style: _angular_core.InputSignal<any>;
    /** Style class of the component */
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    /** Index of the element in tabbing order */
    readonly tabindex: _angular_core.InputSignal<number | undefined>;
    /** Defines a string that labels the input for accessibility */
    readonly ariaLabel: _angular_core.InputSignal<string | undefined>;
    /** Specifies one or more IDs in the DOM that labels the input field */
    readonly ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    /** Inline style of the list element */
    readonly listStyle: _angular_core.InputSignal<any>;
    /** Whether the component should be responsive */
    readonly responsive: _angular_core.InputSignal<boolean>;
    /** Fields to search against when filtering */
    readonly filterBy: _angular_core.InputSignal<string | undefined>;
    /** Placeholder of the filter input */
    readonly filterPlaceholder: _angular_core.InputSignal<string | undefined>;
    /** Locale to use in filtering */
    readonly filterLocale: _angular_core.InputSignal<string | undefined>;
    /** Whether metaKey needs to be pressed to select or unselect an item */
    readonly metaKeySelection: _angular_core.InputSignal<boolean>;
    /** Whether to enable dragdrop based reordering */
    readonly dragdrop: _angular_core.InputSignal<boolean>;
    /** Location of the buttons with respect to the list */
    readonly controlsPosition: _angular_core.InputSignal<OrderListControlsPosition>;
    /** Defines a string that labels the filter input */
    readonly ariaFilterLabel: _angular_core.InputSignal<string | undefined>;
    /** Defines how the items are filtered */
    readonly filterMatchMode: _angular_core.InputSignal<OrderListFilterMatchMode>;
    /** Width of the screen at which the component should change its behavior */
    readonly breakpoint: _angular_core.InputSignal<string>;
    /** Whether to displays rows with alternating colors */
    readonly stripedRows: _angular_core.InputSignal<boolean>;
    /** When present, it specifies that the component should be disabled */
    readonly disabled: _angular_core.InputSignal<boolean>;
    /** Function to optimize the dom operations by delegating to ngForTrackBy */
    readonly trackBy: _angular_core.InputSignal<Function | undefined>;
    /** Height of the viewport */
    readonly scrollHeight: _angular_core.InputSignal<string>;
    /** Whether to focus on the first visible or selected element */
    readonly autoOptionFocus: _angular_core.InputSignal<boolean>;
    /** Used to pass all properties to the Button component */
    readonly buttonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move up button */
    readonly moveUpButtonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move top button */
    readonly moveTopButtonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move down button */
    readonly moveDownButtonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move bottom button */
    readonly moveBottomButtonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Array of values to be displayed in the component */
    readonly value: _angular_core.ModelSignal<any[] | undefined>;
    /** A list of values that are currently selected */
    readonly selection: _angular_core.ModelSignal<any[] | undefined>;
    /** Callback to invoke when selection changes */
    readonly onSelectionChange: _angular_core.OutputEmitterRef<OrderListSelectionChangeEvent>;
    /** Callback to invoke when list is reordered */
    readonly onReorder: _angular_core.OutputEmitterRef<any>;
    /** Callback to invoke when filtering occurs */
    readonly onFilterEvent: _angular_core.OutputEmitterRef<OrderListFilterEvent>;
    /** Callback to invoke when the list is focused */
    readonly onFocus: _angular_core.OutputEmitterRef<Event>;
    /** Callback to invoke when the list is blurred */
    readonly onBlur: _angular_core.OutputEmitterRef<Event>;
    /**
     * Resets the filter
     */
    resetFilter(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmOrderListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmOrderListComponent, "cmm-order-list", ["cmmorderlist"], { "header": { "alias": "header"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "listStyle": { "alias": "listStyle"; "required": false; "isSignal": true; }; "responsive": { "alias": "responsive"; "required": false; "isSignal": true; }; "filterBy": { "alias": "filterBy"; "required": false; "isSignal": true; }; "filterPlaceholder": { "alias": "filterPlaceholder"; "required": false; "isSignal": true; }; "filterLocale": { "alias": "filterLocale"; "required": false; "isSignal": true; }; "metaKeySelection": { "alias": "metaKeySelection"; "required": false; "isSignal": true; }; "dragdrop": { "alias": "dragdrop"; "required": false; "isSignal": true; }; "controlsPosition": { "alias": "controlsPosition"; "required": false; "isSignal": true; }; "ariaFilterLabel": { "alias": "ariaFilterLabel"; "required": false; "isSignal": true; }; "filterMatchMode": { "alias": "filterMatchMode"; "required": false; "isSignal": true; }; "breakpoint": { "alias": "breakpoint"; "required": false; "isSignal": true; }; "stripedRows": { "alias": "stripedRows"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "trackBy": { "alias": "trackBy"; "required": false; "isSignal": true; }; "scrollHeight": { "alias": "scrollHeight"; "required": false; "isSignal": true; }; "autoOptionFocus": { "alias": "autoOptionFocus"; "required": false; "isSignal": true; }; "buttonProps": { "alias": "buttonProps"; "required": false; "isSignal": true; }; "moveUpButtonProps": { "alias": "moveUpButtonProps"; "required": false; "isSignal": true; }; "moveTopButtonProps": { "alias": "moveTopButtonProps"; "required": false; "isSignal": true; }; "moveDownButtonProps": { "alias": "moveDownButtonProps"; "required": false; "isSignal": true; }; "moveBottomButtonProps": { "alias": "moveBottomButtonProps"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "selection": { "alias": "selection"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "selection": "selectionChange"; "onSelectionChange": "onSelectionChange"; "onReorder": "onReorder"; "onFilterEvent": "onFilterEvent"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["itemTemplate", "emptymessageTemplate", "emptyfiltermessageTemplate", "filterTemplate", "headerTemplate", "moveupiconTemplate", "movetopiconTemplate", "movedowniconTemplate", "movebottomiconTemplate", "filtericonTemplate"], ["*"], true, never>;
}

/**
 * Custom events for OrganizationChart component
 */
interface OrganizationChartNodeSelectEvent {
    /** Browser event */
    originalEvent: Event;
    /** Node instance */
    node: TreeNode;
}
interface OrganizationChartNodeUnSelectEvent {
    /** Browser event */
    originalEvent: Event;
    /** Node instance */
    node: TreeNode;
}
interface OrganizationChartNodeExpandEvent {
    /** Browser event */
    originalEvent: Event;
    /** Node instance */
    node: TreeNode;
}
interface OrganizationChartNodeCollapseEvent {
    /** Browser event */
    originalEvent: Event;
    /** Node instance */
    node: TreeNode;
}

/**
 * Constants for OrganizationChart component
 */
/** Selection mode options */
declare const ORGANIZATIONCHART_SELECTION_MODE: {
    SINGLE: "single";
    MULTIPLE: "multiple";
};
type OrganizationChartSelectionMode = (typeof ORGANIZATIONCHART_SELECTION_MODE)[keyof typeof ORGANIZATIONCHART_SELECTION_MODE];

/**
 * CmmOrganizationChartComponent - Angular 19 wrapper for PrimeNG OrganizationChart
 *
 * A thin wrapper component that provides signal-based inputs and two-way binding
 * for PrimeNG's OrganizationChart component. OrganizationChart visualizes hierarchical
 * organization data in a tree structure.
 *
 * @example
 * ```html
 * <cmm-organization-chart
 *   [(value)]="orgData"
 *   [(selection)]="selectedNode"
 *   selectionMode="single">
 *   <ng-template pTemplate="person" let-node>
 *     <div>{{ node.label }}</div>
 *   </ng-template>
 * </cmm-organization-chart>
 * ```
 */
declare class CmmOrganizationChartComponent {
    readonly togglericonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /** Inline style of the component */
    readonly style: _angular_core.InputSignal<any>;
    /** Style class of the component */
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    /** Defines the selection mode */
    readonly selectionMode: _angular_core.InputSignal<OrganizationChartSelectionMode | undefined>;
    /** Whether the nodes can be expanded or toggled */
    readonly collapsible: _angular_core.InputSignal<boolean>;
    /** Whether the space allocated by a node is preserved when hidden */
    readonly preserveSpace: _angular_core.InputSignal<boolean>;
    /** An array of nested TreeNodes */
    readonly value: _angular_core.ModelSignal<TreeNode<any>[] | undefined>;
    /** A single treenode instance or an array to refer to the selections */
    readonly selection: _angular_core.ModelSignal<any>;
    /** Callback to invoke when a node is selected */
    readonly onNodeSelect: _angular_core.OutputEmitterRef<OrganizationChartNodeSelectEvent>;
    /** Callback to invoke when a node is unselected */
    readonly onNodeUnselect: _angular_core.OutputEmitterRef<OrganizationChartNodeUnSelectEvent>;
    /** Callback to invoke when a node is expanded */
    readonly onNodeExpand: _angular_core.OutputEmitterRef<OrganizationChartNodeExpandEvent>;
    /** Callback to invoke when a node is collapsed */
    readonly onNodeCollapse: _angular_core.OutputEmitterRef<OrganizationChartNodeCollapseEvent>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmOrganizationChartComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmOrganizationChartComponent, "cmm-organization-chart", ["cmmorganizationchart"], { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "collapsible": { "alias": "collapsible"; "required": false; "isSignal": true; }; "preserveSpace": { "alias": "preserveSpace"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "selection": { "alias": "selection"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "selection": "selectionChange"; "onNodeSelect": "onNodeSelect"; "onNodeUnselect": "onNodeUnselect"; "onNodeExpand": "onNodeExpand"; "onNodeCollapse": "onNodeCollapse"; }, ["togglericonTemplate"], ["*"], true, never>;
}

declare class CmmAccordionPanelComponent {
    readonly value: _angular_core.ModelSignal<any>;
    readonly multiple: _angular_core.InputSignal<boolean>;
    readonly style: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    readonly expandIcon: _angular_core.InputSignal<string | undefined>;
    readonly collapseIcon: _angular_core.InputSignal<string>;
    readonly selectOnFocus: _angular_core.InputSignal<boolean>;
    readonly transitionOptions: _angular_core.InputSignal<string>;
    readonly headerAriaLevel: _angular_core.InputSignal<number>;
    readonly activeIndex: _angular_core.InputSignal<number | number[] | undefined>;
    readonly id: _angular_core.InputSignal<string | undefined>;
    readonly header: _angular_core.InputSignal<string | undefined>;
    readonly headerStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly headerStyleClass: _angular_core.InputSignal<string | undefined>;
    readonly tabStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly tabStyleClass: _angular_core.InputSignal<string | undefined>;
    readonly contentStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly contentStyleClass: _angular_core.InputSignal<string | undefined>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly cache: _angular_core.InputSignal<boolean>;
    readonly iconPos: _angular_core.InputSignal<"start" | "end">;
    readonly selected: _angular_core.InputSignal<boolean | undefined>;
    readonly size: _angular_core.InputSignal<"small" | "large" | "default">;
    readonly variant: _angular_core.InputSignal<"outlined" | "filled">;
    readonly onClose: _angular_core.OutputEmitterRef<AccordionTabCloseEvent>;
    readonly onOpen: _angular_core.OutputEmitterRef<AccordionTabOpenEvent>;
    readonly selectedChange: _angular_core.OutputEmitterRef<boolean>;
    readonly activeIndexChange: _angular_core.OutputEmitterRef<number | number[]>;
    readonly toggleIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly computedStyleClass: _angular_core.Signal<string>;
    handleOpen(event: AccordionTabOpenEvent): void;
    handleClose(event: AccordionTabCloseEvent): void;
    handleSelectedChange(value: boolean): void;
    handleActiveIndexChange(value: number | number[]): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmAccordionPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmAccordionPanelComponent, "cmm-accordion-panel", ["cmmaccordionpanel"], { "value": { "alias": "value"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "expandIcon": { "alias": "expandIcon"; "required": false; "isSignal": true; }; "collapseIcon": { "alias": "collapseIcon"; "required": false; "isSignal": true; }; "selectOnFocus": { "alias": "selectOnFocus"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; "headerAriaLevel": { "alias": "headerAriaLevel"; "required": false; "isSignal": true; }; "activeIndex": { "alias": "activeIndex"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; "header": { "alias": "header"; "required": false; "isSignal": true; }; "headerStyle": { "alias": "headerStyle"; "required": false; "isSignal": true; }; "headerStyleClass": { "alias": "headerStyleClass"; "required": false; "isSignal": true; }; "tabStyle": { "alias": "tabStyle"; "required": false; "isSignal": true; }; "tabStyleClass": { "alias": "tabStyleClass"; "required": false; "isSignal": true; }; "contentStyle": { "alias": "contentStyle"; "required": false; "isSignal": true; }; "contentStyleClass": { "alias": "contentStyleClass"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "cache": { "alias": "cache"; "required": false; "isSignal": true; }; "iconPos": { "alias": "iconPos"; "required": false; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onClose": "onClose"; "onOpen": "onOpen"; "selectedChange": "selectedChange"; "activeIndexChange": "activeIndexChange"; }, ["toggleIconTemplate", "headerTemplate", "footerTemplate", "iconTemplate", "contentTemplate"], ["*"], true, never>;
}

type SelectButtonSize = 'small' | 'large';

declare class CmmSelectbuttonComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<any>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    options: _angular_core.InputSignal<any[]>;
    optionLabel: _angular_core.InputSignal<string>;
    optionValue: _angular_core.InputSignal<string>;
    optionDisabled: _angular_core.InputSignal<string>;
    multiple: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    size: _angular_core.InputSignal<SelectButtonSize | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    onChange: _angular_core.OutputEmitterRef<SelectButtonChangeEvent>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: SelectButtonChangeEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSelectbuttonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSelectbuttonComponent, "cmm-selectbutton", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; "optionLabel": { "alias": "optionLabel"; "required": false; "isSignal": true; }; "optionValue": { "alias": "optionValue"; "required": false; "isSignal": true; }; "optionDisabled": { "alias": "optionDisabled"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; }, ["itemTemplate"], never, true, never>;
}

declare class CmmAnimateOnScrollComponent {
    readonly enterClass: _angular_core.InputSignal<string>;
    readonly leaveClass: _angular_core.InputSignal<string>;
    readonly root: _angular_core.InputSignal<HTMLElement | undefined>;
    readonly rootMargin: _angular_core.InputSignal<string>;
    readonly threshold: _angular_core.InputSignal<number>;
    readonly once: _angular_core.InputSignal<boolean>;
    readonly styleClass: _angular_core.InputSignal<string>;
    readonly style: _angular_core.InputSignal<Record<string, any>>;
    readonly size: _angular_core.InputSignal<"small" | "large" | "default">;
    readonly variant: _angular_core.InputSignal<"outlined" | "filled">;
    readonly animationSpeed: _angular_core.InputSignal<"normal" | "fast" | "slow">;
    readonly computedStyleClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmAnimateOnScrollComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmAnimateOnScrollComponent, "cmm-animate-on-scroll", ["cmmanimateonscroll"], { "enterClass": { "alias": "enterClass"; "required": false; "isSignal": true; }; "leaveClass": { "alias": "leaveClass"; "required": false; "isSignal": true; }; "root": { "alias": "root"; "required": false; "isSignal": true; }; "rootMargin": { "alias": "rootMargin"; "required": false; "isSignal": true; }; "threshold": { "alias": "threshold"; "required": false; "isSignal": true; }; "once": { "alias": "once"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "animationSpeed": { "alias": "animationSpeed"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

declare class CmmSidebarComponent {
    visible: _angular_core.ModelSignal<boolean>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    position: _angular_core.InputSignal<SidebarPosition>;
    modal: _angular_core.InputSignal<boolean>;
    dismissable: _angular_core.InputSignal<boolean>;
    showCloseIcon: _angular_core.InputSignal<boolean>;
    closeOnEscape: _angular_core.InputSignal<boolean>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    transitionOptions: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    onShow: _angular_core.OutputEmitterRef<void>;
    onHide: _angular_core.OutputEmitterRef<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSidebarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSidebarComponent, "cmm-sidebar", never, { "visible": { "alias": "visible"; "required": false; "isSignal": true; }; "position": { "alias": "position"; "required": false; "isSignal": true; }; "modal": { "alias": "modal"; "required": false; "isSignal": true; }; "dismissable": { "alias": "dismissable"; "required": false; "isSignal": true; }; "showCloseIcon": { "alias": "showCloseIcon"; "required": false; "isSignal": true; }; "closeOnEscape": { "alias": "closeOnEscape"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, { "visible": "visibleChange"; "onShow": "onShow"; "onHide": "onHide"; }, ["headerTemplate", "footerTemplate"], never, true, never>;
}

declare class CmmAutoCompleteComponent implements ControlValueAccessor {
    readonly serializeId: string;
    private _value;
    onTouched: () => void;
    onChange: (_: any) => void;
    value: any;
    suggestions: _angular_core.ModelSignal<any[]>;
    field: _angular_core.InputSignal<string | undefined>;
    dropdown: _angular_core.InputSignal<boolean>;
    multiple: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.ModelSignal<boolean>;
    readonly: _angular_core.InputSignal<boolean>;
    optionLabel: _angular_core.InputSignal<string | ((item: any) => string) | undefined>;
    optionValue: _angular_core.InputSignal<string | ((item: any) => string) | undefined>;
    optionDisabled: _angular_core.InputSignal<string | undefined>;
    optionGroupLabel: _angular_core.InputSignal<string>;
    optionGroupChildren: _angular_core.InputSignal<string>;
    dataKey: _angular_core.InputSignal<string | undefined>;
    minLength: _angular_core.InputSignal<number>;
    delay: _angular_core.InputSignal<number>;
    completeOnFocus: _angular_core.InputSignal<boolean>;
    forceSelection: _angular_core.InputSignal<boolean>;
    unique: _angular_core.InputSignal<boolean>;
    autoHighlight: _angular_core.InputSignal<boolean>;
    selectOnFocus: _angular_core.InputSignal<boolean>;
    autoOptionFocus: _angular_core.InputSignal<boolean>;
    searchLocale: _angular_core.InputSignal<string | undefined>;
    focusOnHover: _angular_core.InputSignal<boolean>;
    typeahead: _angular_core.InputSignal<boolean>;
    placeholder: _angular_core.InputSignal<string>;
    emptyMessage: _angular_core.InputSignal<string | undefined>;
    dropdownIcon: _angular_core.InputSignal<string | undefined>;
    showClear: _angular_core.InputSignal<boolean>;
    autofocus: _angular_core.InputSignal<boolean>;
    virtualScroll: _angular_core.InputSignal<boolean>;
    virtualScrollItemSize: _angular_core.InputSignal<number | undefined>;
    virtualScrollOptions: _angular_core.InputSignal<any>;
    scrollHeight: _angular_core.InputSignal<string>;
    showEmptyMessage: _angular_core.InputSignal<boolean>;
    group: _angular_core.InputSignal<boolean>;
    dropdownMode: _angular_core.InputSignal<string>;
    name: _angular_core.InputSignal<string | undefined>;
    required: _angular_core.InputSignal<boolean>;
    maxlength: _angular_core.InputSignal<number | undefined>;
    tabindex: _angular_core.InputSignal<number | undefined>;
    type: _angular_core.InputSignal<string>;
    autoComplete: _angular_core.InputSignal<string>;
    styleClass: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<Record<string, any>>;
    panelStyleClass: _angular_core.InputSignal<string>;
    panelStyle: _angular_core.InputSignal<Record<string, any>>;
    inputStyleClass: _angular_core.InputSignal<string>;
    inputStyle: _angular_core.InputSignal<Record<string, any>>;
    inputId: _angular_core.InputSignal<string | undefined>;
    size: _angular_core.InputSignal<"small" | "large" | undefined>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    fluid: _angular_core.InputSignal<boolean>;
    appendTo: _angular_core.InputSignal<unknown>;
    overlayOptions: _angular_core.InputSignal<any>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    showTransitionOptions: _angular_core.InputSignal<string>;
    hideTransitionOptions: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    dropdownAriaLabel: _angular_core.InputSignal<string | undefined>;
    searchMessage: _angular_core.InputSignal<string | undefined>;
    emptySelectionMessage: _angular_core.InputSignal<string | undefined>;
    selectionMessage: _angular_core.InputSignal<string | undefined>;
    lazy: _angular_core.InputSignal<boolean>;
    id: _angular_core.InputSignal<string | undefined>;
    onComplete: _angular_core.OutputEmitterRef<AutoCompleteCompleteEvent>;
    onSelect: _angular_core.OutputEmitterRef<AutoCompleteSelectEvent>;
    onUnselect: _angular_core.OutputEmitterRef<any>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    onClear: _angular_core.OutputEmitterRef<void>;
    onKeyUp: _angular_core.OutputEmitterRef<KeyboardEvent>;
    onDropdownClick: _angular_core.OutputEmitterRef<any>;
    onShow: _angular_core.OutputEmitterRef<void>;
    onHide: _angular_core.OutputEmitterRef<void>;
    onLazyLoad: _angular_core.OutputEmitterRef<any>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    selectedItemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    groupTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    removeIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loadingIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    clearIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    dropdownIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    computedStyleClass: _angular_core.Signal<string>;
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    handleComplete(event: AutoCompleteCompleteEvent): void;
    handleSelect(event: AutoCompleteSelectEvent): void;
    handleUnselect(event: any): void;
    handleFocus(event: Event): void;
    handleBlur(event: Event): void;
    handleClear(): void;
    handleKeyUp(event: KeyboardEvent): void;
    handleDropdownClick(event: any): void;
    handleShow(): void;
    handleHide(): void;
    handleLazyLoad(event: any): void;
    handleModelChange(value: any): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmAutoCompleteComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmAutoCompleteComponent, "cmm-auto-complete", ["cmmautocomplete"], { "suggestions": { "alias": "suggestions"; "required": false; "isSignal": true; }; "field": { "alias": "field"; "required": false; "isSignal": true; }; "dropdown": { "alias": "dropdown"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "optionLabel": { "alias": "optionLabel"; "required": false; "isSignal": true; }; "optionValue": { "alias": "optionValue"; "required": false; "isSignal": true; }; "optionDisabled": { "alias": "optionDisabled"; "required": false; "isSignal": true; }; "optionGroupLabel": { "alias": "optionGroupLabel"; "required": false; "isSignal": true; }; "optionGroupChildren": { "alias": "optionGroupChildren"; "required": false; "isSignal": true; }; "dataKey": { "alias": "dataKey"; "required": false; "isSignal": true; }; "minLength": { "alias": "minLength"; "required": false; "isSignal": true; }; "delay": { "alias": "delay"; "required": false; "isSignal": true; }; "completeOnFocus": { "alias": "completeOnFocus"; "required": false; "isSignal": true; }; "forceSelection": { "alias": "forceSelection"; "required": false; "isSignal": true; }; "unique": { "alias": "unique"; "required": false; "isSignal": true; }; "autoHighlight": { "alias": "autoHighlight"; "required": false; "isSignal": true; }; "selectOnFocus": { "alias": "selectOnFocus"; "required": false; "isSignal": true; }; "autoOptionFocus": { "alias": "autoOptionFocus"; "required": false; "isSignal": true; }; "searchLocale": { "alias": "searchLocale"; "required": false; "isSignal": true; }; "focusOnHover": { "alias": "focusOnHover"; "required": false; "isSignal": true; }; "typeahead": { "alias": "typeahead"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; "isSignal": true; }; "dropdownIcon": { "alias": "dropdownIcon"; "required": false; "isSignal": true; }; "showClear": { "alias": "showClear"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; "virtualScroll": { "alias": "virtualScroll"; "required": false; "isSignal": true; }; "virtualScrollItemSize": { "alias": "virtualScrollItemSize"; "required": false; "isSignal": true; }; "virtualScrollOptions": { "alias": "virtualScrollOptions"; "required": false; "isSignal": true; }; "scrollHeight": { "alias": "scrollHeight"; "required": false; "isSignal": true; }; "showEmptyMessage": { "alias": "showEmptyMessage"; "required": false; "isSignal": true; }; "group": { "alias": "group"; "required": false; "isSignal": true; }; "dropdownMode": { "alias": "dropdownMode"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "maxlength": { "alias": "maxlength"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "type": { "alias": "type"; "required": false; "isSignal": true; }; "autoComplete": { "alias": "autoComplete"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "panelStyleClass": { "alias": "panelStyleClass"; "required": false; "isSignal": true; }; "panelStyle": { "alias": "panelStyle"; "required": false; "isSignal": true; }; "inputStyleClass": { "alias": "inputStyleClass"; "required": false; "isSignal": true; }; "inputStyle": { "alias": "inputStyle"; "required": false; "isSignal": true; }; "inputId": { "alias": "inputId"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "fluid": { "alias": "fluid"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "overlayOptions": { "alias": "overlayOptions"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "dropdownAriaLabel": { "alias": "dropdownAriaLabel"; "required": false; "isSignal": true; }; "searchMessage": { "alias": "searchMessage"; "required": false; "isSignal": true; }; "emptySelectionMessage": { "alias": "emptySelectionMessage"; "required": false; "isSignal": true; }; "selectionMessage": { "alias": "selectionMessage"; "required": false; "isSignal": true; }; "lazy": { "alias": "lazy"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; }, { "suggestions": "suggestionsChange"; "disabled": "disabledChange"; "onComplete": "onComplete"; "onSelect": "onSelect"; "onUnselect": "onUnselect"; "onFocus": "onFocus"; "onBlur": "onBlur"; "onClear": "onClear"; "onKeyUp": "onKeyUp"; "onDropdownClick": "onDropdownClick"; "onShow": "onShow"; "onHide": "onHide"; "onLazyLoad": "onLazyLoad"; }, ["itemTemplate", "emptyTemplate", "headerTemplate", "footerTemplate", "selectedItemTemplate", "groupTemplate", "loaderTemplate", "removeIconTemplate", "loadingIconTemplate", "clearIconTemplate", "dropdownIconTemplate"], never, true, never>;
}

/**
 * Skeleton is a placeholder to display instead of the actual content.
 * Wraps PrimeNG Skeleton component.
 */
declare class CmmSkeletonComponent {
    /**
     * Class of the element
     */
    readonly styleClass: _angular_core.InputSignal<string>;
    /**
     * Inline style of the element
     */
    readonly style: _angular_core.InputSignal<Record<string, any> | undefined>;
    /**
     * Shape of the element
     */
    readonly shape: _angular_core.InputSignal<string>;
    /**
     * Border radius of the element, defaults to value from theme
     */
    readonly borderRadius: _angular_core.InputSignal<string | undefined>;
    /**
     * Size of the skeleton
     */
    readonly size: _angular_core.InputSignal<string | undefined>;
    /**
     * Width of the element
     */
    readonly width: _angular_core.InputSignal<string>;
    /**
     * Height of the element
     */
    readonly height: _angular_core.InputSignal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSkeletonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSkeletonComponent, "cmm-skeleton", never, { "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "shape": { "alias": "shape"; "required": false; "isSignal": true; }; "borderRadius": { "alias": "borderRadius"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "width": { "alias": "width"; "required": false; "isSignal": true; }; "height": { "alias": "height"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class CmmIftalabelComponent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmIftalabelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmIftalabelComponent, "cmm-iftalabel", never, {}, {}, never, ["*"], true, never>;
}

declare class CmmImageComponent {
    readonly imageClass: _angular_core.InputSignal<string | undefined>;
    readonly imageStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly styleClass: _angular_core.InputSignal<string>;
    readonly style: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly src: _angular_core.InputSignal<string | SafeUrl | undefined>;
    readonly srcSet: _angular_core.InputSignal<string | SafeUrl | undefined>;
    readonly sizes: _angular_core.InputSignal<string | undefined>;
    readonly previewImageSrc: _angular_core.InputSignal<string | SafeUrl | undefined>;
    readonly previewImageSrcSet: _angular_core.InputSignal<string | SafeUrl | undefined>;
    readonly previewImageSizes: _angular_core.InputSignal<string | undefined>;
    readonly alt: _angular_core.InputSignal<string | undefined>;
    readonly imageWidth: _angular_core.InputSignal<string | undefined>;
    readonly imageHeight: _angular_core.InputSignal<string | undefined>;
    readonly imageLoading: _angular_core.InputSignal<"lazy" | "eager" | undefined>;
    readonly appendTo: _angular_core.InputSignal<unknown>;
    readonly preview: _angular_core.InputSignal<boolean>;
    readonly showTransitionOptions: _angular_core.InputSignal<string>;
    readonly hideTransitionOptions: _angular_core.InputSignal<string>;
    readonly onShow: _angular_core.OutputEmitterRef<any>;
    readonly onHide: _angular_core.OutputEmitterRef<any>;
    readonly onImageError: _angular_core.OutputEmitterRef<Event>;
    readonly indicatorTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly rotateRightIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly rotateLeftIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly zoomOutIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly zoomInIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly closeIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly previewTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly imageTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmImageComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmImageComponent, "cmm-image", never, { "imageClass": { "alias": "imageClass"; "required": false; "isSignal": true; }; "imageStyle": { "alias": "imageStyle"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "src": { "alias": "src"; "required": false; "isSignal": true; }; "srcSet": { "alias": "srcSet"; "required": false; "isSignal": true; }; "sizes": { "alias": "sizes"; "required": false; "isSignal": true; }; "previewImageSrc": { "alias": "previewImageSrc"; "required": false; "isSignal": true; }; "previewImageSrcSet": { "alias": "previewImageSrcSet"; "required": false; "isSignal": true; }; "previewImageSizes": { "alias": "previewImageSizes"; "required": false; "isSignal": true; }; "alt": { "alias": "alt"; "required": false; "isSignal": true; }; "imageWidth": { "alias": "width"; "required": false; "isSignal": true; }; "imageHeight": { "alias": "height"; "required": false; "isSignal": true; }; "imageLoading": { "alias": "loading"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "preview": { "alias": "preview"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; }, { "onShow": "onShow"; "onHide": "onHide"; "onImageError": "onImageError"; }, ["indicatorTemplate", "rotateRightIconTemplate", "rotateLeftIconTemplate", "zoomOutIconTemplate", "zoomInIconTemplate", "closeIconTemplate", "previewTemplate", "imageTemplate"], never, true, never>;
}

type CascadeSelectSize = 'small' | 'large';
type CascadeSelectVariant = 'outlined' | 'filled';

declare class CmmCascadeselectComponent implements ControlValueAccessor {
    id: _angular_core.InputSignal<string | undefined>;
    value: _angular_core.ModelSignal<any>;
    options: _angular_core.InputSignal<any[]>;
    optionLabel: _angular_core.InputSignal<string | undefined>;
    optionValue: _angular_core.InputSignal<string | undefined>;
    optionGroupLabel: _angular_core.InputSignal<string | undefined>;
    optionGroupChildren: _angular_core.InputSignal<string | undefined>;
    placeholder: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    dataKey: _angular_core.InputSignal<string | undefined>;
    inputId: _angular_core.InputSignal<string | undefined>;
    tabindex: _angular_core.InputSignal<number>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    inputLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    appendTo: _angular_core.InputSignal<unknown>;
    showClear: _angular_core.InputSignal<boolean>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    panelStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    panelStyleClass: _angular_core.InputSignal<string | undefined>;
    overlayOptions: _angular_core.InputSignal<any>;
    autofocus: _angular_core.InputSignal<boolean | undefined>;
    variant: _angular_core.InputSignal<CascadeSelectVariant>;
    loading: _angular_core.InputSignal<boolean>;
    loadingIcon: _angular_core.InputSignal<string | undefined>;
    selectOnFocus: _angular_core.InputSignal<boolean>;
    autoOptionFocus: _angular_core.InputSignal<boolean>;
    optionDisabled: _angular_core.InputSignal<any>;
    searchMessage: _angular_core.InputSignal<string | undefined>;
    emptyMessage: _angular_core.InputSignal<string | undefined>;
    selectionMessage: _angular_core.InputSignal<string | undefined>;
    emptySearchMessage: _angular_core.InputSignal<string | undefined>;
    emptySelectionMessage: _angular_core.InputSignal<string | undefined>;
    searchLocale: _angular_core.InputSignal<string | undefined>;
    fluid: _angular_core.InputSignal<boolean>;
    breakpoint: _angular_core.InputSignal<string | undefined>;
    size: _angular_core.InputSignal<CascadeSelectSize>;
    valueTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    optionTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    triggerIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loadingIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    optionGroupIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    clearIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onChange: _angular_core.OutputEmitterRef<any>;
    onGroupChange: _angular_core.OutputEmitterRef<Event>;
    onShow: _angular_core.OutputEmitterRef<any>;
    onHide: _angular_core.OutputEmitterRef<any>;
    onClear: _angular_core.OutputEmitterRef<any>;
    onBeforeShow: _angular_core.OutputEmitterRef<any>;
    onBeforeHide: _angular_core.OutputEmitterRef<any>;
    onFocus: _angular_core.OutputEmitterRef<FocusEvent>;
    onBlur: _angular_core.OutputEmitterRef<FocusEvent>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: any): void;
    handleBlur(event: FocusEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmCascadeselectComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmCascadeselectComponent, "cmm-cascadeselect", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; "optionLabel": { "alias": "optionLabel"; "required": false; "isSignal": true; }; "optionValue": { "alias": "optionValue"; "required": false; "isSignal": true; }; "optionGroupLabel": { "alias": "optionGroupLabel"; "required": false; "isSignal": true; }; "optionGroupChildren": { "alias": "optionGroupChildren"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "dataKey": { "alias": "dataKey"; "required": false; "isSignal": true; }; "inputId": { "alias": "inputId"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "inputLabel": { "alias": "inputLabel"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "showClear": { "alias": "showClear"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "panelStyle": { "alias": "panelStyle"; "required": false; "isSignal": true; }; "panelStyleClass": { "alias": "panelStyleClass"; "required": false; "isSignal": true; }; "overlayOptions": { "alias": "overlayOptions"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "loadingIcon": { "alias": "loadingIcon"; "required": false; "isSignal": true; }; "selectOnFocus": { "alias": "selectOnFocus"; "required": false; "isSignal": true; }; "autoOptionFocus": { "alias": "autoOptionFocus"; "required": false; "isSignal": true; }; "optionDisabled": { "alias": "optionDisabled"; "required": false; "isSignal": true; }; "searchMessage": { "alias": "searchMessage"; "required": false; "isSignal": true; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; "isSignal": true; }; "selectionMessage": { "alias": "selectionMessage"; "required": false; "isSignal": true; }; "emptySearchMessage": { "alias": "emptySearchMessage"; "required": false; "isSignal": true; }; "emptySelectionMessage": { "alias": "emptySelectionMessage"; "required": false; "isSignal": true; }; "searchLocale": { "alias": "searchLocale"; "required": false; "isSignal": true; }; "fluid": { "alias": "fluid"; "required": false; "isSignal": true; }; "breakpoint": { "alias": "breakpoint"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; "onGroupChange": "onGroupChange"; "onShow": "onShow"; "onHide": "onHide"; "onClear": "onClear"; "onBeforeShow": "onBeforeShow"; "onBeforeHide": "onBeforeHide"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["valueTemplate", "optionTemplate", "headerTemplate", "footerTemplate", "triggerIconTemplate", "loadingIconTemplate", "optionGroupIconTemplate", "clearIconTemplate"], never, true, never>;
}

declare class CmmInplaceComponent {
    inplace: _angular_core.Signal<Inplace | undefined>;
    active: _angular_core.ModelSignal<boolean>;
    closable: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    preventClick: _angular_core.InputSignal<boolean>;
    closeIcon: _angular_core.InputSignal<string | undefined>;
    closeAriaLabel: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    displayTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    closeIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onActivate: _angular_core.OutputEmitterRef<Event>;
    onDeactivate: _angular_core.OutputEmitterRef<Event>;
    activate(event: Event): void;
    deactivate(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmInplaceComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmInplaceComponent, "cmm-inplace", never, { "active": { "alias": "active"; "required": false; "isSignal": true; }; "closable": { "alias": "closable"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "preventClick": { "alias": "preventClick"; "required": false; "isSignal": true; }; "closeIcon": { "alias": "closeIcon"; "required": false; "isSignal": true; }; "closeAriaLabel": { "alias": "closeAriaLabel"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, { "active": "activeChange"; "onActivate": "onActivate"; "onDeactivate": "onDeactivate"; }, ["displayTemplate", "contentTemplate", "closeIconTemplate"], never, true, never>;
}

declare class CmmInputgroupComponent {
    readonly style: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmInputgroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmInputgroupComponent, "cmm-inputgroup", never, { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble';

declare class CmmChartComponent {
    chart: _angular_core.Signal<UIChart | undefined>;
    type: _angular_core.InputSignal<ChartType>;
    data: _angular_core.InputSignal<any>;
    options: _angular_core.InputSignal<any>;
    plugins: _angular_core.InputSignal<any[] | undefined>;
    width: _angular_core.InputSignal<string>;
    height: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    responsive: _angular_core.InputSignal<boolean>;
    onDataSelect: _angular_core.OutputEmitterRef<any>;
    refresh(): void;
    reinit(): void;
    generateLegend(): any;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmChartComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmChartComponent, "cmm-chart", never, { "type": { "alias": "type"; "required": false; "isSignal": true; }; "data": { "alias": "data"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; "plugins": { "alias": "plugins"; "required": false; "isSignal": true; }; "width": { "alias": "width"; "required": false; "isSignal": true; }; "height": { "alias": "height"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "responsive": { "alias": "responsive"; "required": false; "isSignal": true; }; }, { "onDataSelect": "onDataSelect"; }, never, never, true, never>;
}

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipEvent = 'hover' | 'focus' | 'both';

declare class CmmTooltipComponent {
    text: _angular_core.InputSignal<string>;
    position: _angular_core.InputSignal<TooltipPosition>;
    event: _angular_core.InputSignal<TooltipEvent>;
    showDelay: _angular_core.InputSignal<number>;
    hideDelay: _angular_core.InputSignal<number>;
    autoHide: _angular_core.InputSignal<boolean>;
    escape: _angular_core.InputSignal<boolean>;
    hideOnEscape: _angular_core.InputSignal<boolean>;
    fitContent: _angular_core.InputSignal<boolean>;
    tooltipStyleClass: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTooltipComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTooltipComponent, "cmm-tooltip", never, { "text": { "alias": "text"; "required": true; "isSignal": true; }; "position": { "alias": "position"; "required": false; "isSignal": true; }; "event": { "alias": "event"; "required": false; "isSignal": true; }; "showDelay": { "alias": "showDelay"; "required": false; "isSignal": true; }; "hideDelay": { "alias": "hideDelay"; "required": false; "isSignal": true; }; "autoHide": { "alias": "autoHide"; "required": false; "isSignal": true; }; "escape": { "alias": "escape"; "required": false; "isSignal": true; }; "hideOnEscape": { "alias": "hideOnEscape"; "required": false; "isSignal": true; }; "fitContent": { "alias": "fitContent"; "required": false; "isSignal": true; }; "tooltipStyleClass": { "alias": "tooltipStyleClass"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

type CheckboxVariant = 'outlined' | 'filled';
type CheckboxSize = 'small' | 'large' | undefined;

declare class CmmCheckboxComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<any>;
    name: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    cvaDisabled: _angular_core.WritableSignal<boolean>;
    binary: _angular_core.InputSignal<boolean>;
    readonly: _angular_core.InputSignal<boolean>;
    required: _angular_core.InputSignal<boolean>;
    trueValue: _angular_core.InputSignal<any>;
    falseValue: _angular_core.InputSignal<any>;
    tabindex: _angular_core.InputSignal<number>;
    inputId: _angular_core.InputSignal<string>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    inputStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    inputClass: _angular_core.InputSignal<string | undefined>;
    label: _angular_core.InputSignal<string | undefined>;
    checkboxIcon: _angular_core.InputSignal<string | undefined>;
    variant: _angular_core.InputSignal<CheckboxVariant>;
    size: _angular_core.InputSignal<CheckboxSize>;
    indeterminate: _angular_core.InputSignal<boolean>;
    autofocus: _angular_core.InputSignal<boolean>;
    onChange: _angular_core.OutputEmitterRef<CheckboxChangeEvent$1>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: CheckboxChangeEvent$1): void;
    handleFocus(event: Event): void;
    handleBlur(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmCheckboxComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmCheckboxComponent, "cmm-checkbox", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "binary": { "alias": "binary"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "trueValue": { "alias": "trueValue"; "required": false; "isSignal": true; }; "falseValue": { "alias": "falseValue"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "inputId": { "alias": "inputId"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "inputStyle": { "alias": "inputStyle"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "inputClass": { "alias": "inputClass"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "checkboxIcon": { "alias": "checkboxIcon"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "indeterminate": { "alias": "indeterminate"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, never, never, true, never>;
}

interface TreeNodeExpandEvent {
    originalEvent: Event;
    node: TreeNode;
}
interface TreeNodeCollapseEvent {
    originalEvent: Event;
    node: TreeNode;
}
interface TreeNodeContextMenuSelectEvent {
    originalEvent: Event;
    node: TreeNode;
}
interface TreeNodeDropEvent {
    originalEvent?: DragEvent;
    dragNode?: TreeNode | null;
    dropNode?: TreeNode | null;
    index?: number;
    accept?: Function;
}
interface TreeLazyLoadEvent {
    first: number;
    last: number;
}
interface TreeScrollIndexChangeEvent {
    first: number;
    last: number;
}
interface TreeScrollEvent {
    originalEvent?: Event;
}
declare class CmmTreeComponent {
    treeValue: _angular_core.InputSignal<TreeNode<any>[]>;
    selectionMode: _angular_core.InputSignal<"single" | "multiple" | "checkbox" | undefined>;
    loadingMode: _angular_core.InputSignal<"mask" | "icon">;
    selection: _angular_core.InputSignal<any>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    contextMenu: _angular_core.InputSignal<any>;
    draggableScope: _angular_core.InputSignal<any>;
    droppableScope: _angular_core.InputSignal<any>;
    draggableNodes: _angular_core.InputSignal<boolean>;
    droppableNodes: _angular_core.InputSignal<boolean>;
    metaKeySelection: _angular_core.InputSignal<boolean>;
    propagateSelectionUp: _angular_core.InputSignal<boolean>;
    propagateSelectionDown: _angular_core.InputSignal<boolean>;
    loading: _angular_core.InputSignal<boolean>;
    loadingIcon: _angular_core.InputSignal<string | undefined>;
    emptyMessage: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    togglerAriaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    validateDrop: _angular_core.InputSignal<boolean>;
    filter: _angular_core.InputSignal<boolean>;
    filterBy: _angular_core.InputSignal<string>;
    filterMode: _angular_core.InputSignal<string>;
    filterOptions: _angular_core.InputSignal<any>;
    filterPlaceholder: _angular_core.InputSignal<string | undefined>;
    filteredNodes: _angular_core.InputSignal<TreeNode<any>[] | undefined>;
    filterLocale: _angular_core.InputSignal<string | undefined>;
    scrollHeight: _angular_core.InputSignal<string | undefined>;
    lazy: _angular_core.InputSignal<boolean>;
    virtualScroll: _angular_core.InputSignal<boolean>;
    virtualScrollItemSize: _angular_core.InputSignal<number | undefined>;
    virtualScrollOptions: _angular_core.InputSignal<ScrollerOptions | undefined>;
    indentation: _angular_core.InputSignal<number>;
    _templateMap: _angular_core.InputSignal<any>;
    trackBy: _angular_core.InputSignal<Function | undefined>;
    highlightOnSelect: _angular_core.InputSignal<boolean>;
    selectionChange: _angular_core.OutputEmitterRef<any>;
    onNodeSelect: _angular_core.OutputEmitterRef<TreeNodeSelectEvent$1>;
    onNodeUnselect: _angular_core.OutputEmitterRef<TreeNodeUnSelectEvent$1>;
    onNodeExpand: _angular_core.OutputEmitterRef<TreeNodeExpandEvent>;
    onNodeCollapse: _angular_core.OutputEmitterRef<TreeNodeCollapseEvent>;
    onNodeContextMenuSelect: _angular_core.OutputEmitterRef<TreeNodeContextMenuSelectEvent>;
    onNodeDrop: _angular_core.OutputEmitterRef<TreeNodeDropEvent>;
    onLazyLoad: _angular_core.OutputEmitterRef<TreeLazyLoadEvent>;
    onScroll: _angular_core.OutputEmitterRef<TreeScrollEvent>;
    onScrollIndexChange: _angular_core.OutputEmitterRef<TreeScrollIndexChangeEvent>;
    onFilter: _angular_core.OutputEmitterRef<TreeFilterEvent$1>;
    nodeTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyMessageTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    togglerIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    checkboxIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loadingIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    filterIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    treeRef: _angular_core.Signal<Tree | undefined>;
    resetFilter(): void;
    scrollToVirtualIndex(index: number): void;
    scrollTo(options: any): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTreeComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTreeComponent, "cmm-tree", never, { "treeValue": { "alias": "value"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "loadingMode": { "alias": "loadingMode"; "required": false; "isSignal": true; }; "selection": { "alias": "selection"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "contextMenu": { "alias": "contextMenu"; "required": false; "isSignal": true; }; "draggableScope": { "alias": "draggableScope"; "required": false; "isSignal": true; }; "droppableScope": { "alias": "droppableScope"; "required": false; "isSignal": true; }; "draggableNodes": { "alias": "draggableNodes"; "required": false; "isSignal": true; }; "droppableNodes": { "alias": "droppableNodes"; "required": false; "isSignal": true; }; "metaKeySelection": { "alias": "metaKeySelection"; "required": false; "isSignal": true; }; "propagateSelectionUp": { "alias": "propagateSelectionUp"; "required": false; "isSignal": true; }; "propagateSelectionDown": { "alias": "propagateSelectionDown"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "loadingIcon": { "alias": "loadingIcon"; "required": false; "isSignal": true; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "togglerAriaLabel": { "alias": "togglerAriaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "validateDrop": { "alias": "validateDrop"; "required": false; "isSignal": true; }; "filter": { "alias": "filter"; "required": false; "isSignal": true; }; "filterBy": { "alias": "filterBy"; "required": false; "isSignal": true; }; "filterMode": { "alias": "filterMode"; "required": false; "isSignal": true; }; "filterOptions": { "alias": "filterOptions"; "required": false; "isSignal": true; }; "filterPlaceholder": { "alias": "filterPlaceholder"; "required": false; "isSignal": true; }; "filteredNodes": { "alias": "filteredNodes"; "required": false; "isSignal": true; }; "filterLocale": { "alias": "filterLocale"; "required": false; "isSignal": true; }; "scrollHeight": { "alias": "scrollHeight"; "required": false; "isSignal": true; }; "lazy": { "alias": "lazy"; "required": false; "isSignal": true; }; "virtualScroll": { "alias": "virtualScroll"; "required": false; "isSignal": true; }; "virtualScrollItemSize": { "alias": "virtualScrollItemSize"; "required": false; "isSignal": true; }; "virtualScrollOptions": { "alias": "virtualScrollOptions"; "required": false; "isSignal": true; }; "indentation": { "alias": "indentation"; "required": false; "isSignal": true; }; "_templateMap": { "alias": "_templateMap"; "required": false; "isSignal": true; }; "trackBy": { "alias": "trackBy"; "required": false; "isSignal": true; }; "highlightOnSelect": { "alias": "highlightOnSelect"; "required": false; "isSignal": true; }; }, { "selectionChange": "selectionChange"; "onNodeSelect": "onNodeSelect"; "onNodeUnselect": "onNodeUnselect"; "onNodeExpand": "onNodeExpand"; "onNodeCollapse": "onNodeCollapse"; "onNodeContextMenuSelect": "onNodeContextMenuSelect"; "onNodeDrop": "onNodeDrop"; "onLazyLoad": "onLazyLoad"; "onScroll": "onScroll"; "onScrollIndexChange": "onScrollIndexChange"; "onFilter": "onFilter"; }, ["nodeTemplate", "headerTemplate", "footerTemplate", "loaderTemplate", "emptyMessageTemplate", "togglerIconTemplate", "checkboxIconTemplate", "loadingIconTemplate", "filterIconTemplate"], never, true, never>;
}

interface TreeSelectNodeExpandEvent {
    originalEvent: Event;
    node: TreeNode;
}
interface TreeSelectNodeCollapseEvent {
    originalEvent: Event;
    node: TreeNode;
}
interface TreeNodeSelectEvent {
    originalEvent: Event;
    node: TreeNode;
}
interface TreeNodeUnSelectEvent {
    originalEvent: Event;
    node: TreeNode;
}
interface TreeFilterEvent {
    filter: string;
    filteredValue?: TreeNode[] | null;
}
declare class CmmTreeSelectComponent {
    value: _angular_core.ModelSignal<any>;
    inputId: _angular_core.InputSignal<string | undefined>;
    scrollHeight: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    metaKeySelection: _angular_core.InputSignal<boolean>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    display: _angular_core.InputSignal<"comma" | "chip">;
    selectionMode: _angular_core.InputSignal<"single" | "multiple" | "checkbox">;
    tabindex: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    placeholder: _angular_core.InputSignal<string | undefined>;
    panelClass: _angular_core.InputSignal<string | string[] | Record<string, any> | Set<string> | undefined>;
    panelStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    fluid: _angular_core.InputSignal<boolean>;
    panelStyleClass: _angular_core.InputSignal<string | undefined>;
    containerStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    containerStyleClass: _angular_core.InputSignal<string | undefined>;
    labelStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    labelStyleClass: _angular_core.InputSignal<string | undefined>;
    overlayOptions: _angular_core.InputSignal<OverlayOptions$1 | undefined>;
    emptyMessage: _angular_core.InputSignal<string>;
    appendTo: _angular_core.InputSignal<unknown>;
    filter: _angular_core.InputSignal<boolean>;
    filterBy: _angular_core.InputSignal<string>;
    filterMode: _angular_core.InputSignal<string>;
    filterPlaceholder: _angular_core.InputSignal<string | undefined>;
    filterLocale: _angular_core.InputSignal<string | undefined>;
    filterInputAutoFocus: _angular_core.InputSignal<boolean>;
    propagateSelectionDown: _angular_core.InputSignal<boolean>;
    propagateSelectionUp: _angular_core.InputSignal<boolean>;
    showClear: _angular_core.InputSignal<boolean>;
    resetFilterOnHide: _angular_core.InputSignal<boolean>;
    virtualScroll: _angular_core.InputSignal<boolean>;
    virtualScrollItemSize: _angular_core.InputSignal<number | undefined>;
    size: _angular_core.InputSignal<"small" | "large" | undefined>;
    virtualScrollOptions: _angular_core.InputSignal<ScrollerOptions | undefined>;
    autofocus: _angular_core.InputSignal<boolean>;
    options: _angular_core.InputSignal<TreeNode<any>[]>;
    showTransitionOptions: _angular_core.InputSignal<string | undefined>;
    hideTransitionOptions: _angular_core.InputSignal<string | undefined>;
    loading: _angular_core.InputSignal<boolean>;
    onNodeExpand: _angular_core.OutputEmitterRef<TreeSelectNodeExpandEvent>;
    onNodeCollapse: _angular_core.OutputEmitterRef<TreeSelectNodeCollapseEvent>;
    onShow: _angular_core.OutputEmitterRef<any>;
    onHide: _angular_core.OutputEmitterRef<Event>;
    onClear: _angular_core.OutputEmitterRef<any>;
    onFilter: _angular_core.OutputEmitterRef<TreeFilterEvent>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    onNodeUnselect: _angular_core.OutputEmitterRef<TreeNodeUnSelectEvent>;
    onNodeSelect: _angular_core.OutputEmitterRef<TreeNodeSelectEvent>;
    valueTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    clearIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    triggerIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    dropdownIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    filterIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    closeIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    itemTogglerIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    itemCheckboxIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    itemLoadingIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTreeSelectComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTreeSelectComponent, "cmm-treeselect", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "inputId": { "alias": "inputId"; "required": false; "isSignal": true; }; "scrollHeight": { "alias": "scrollHeight"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "metaKeySelection": { "alias": "metaKeySelection"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "display": { "alias": "display"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "panelClass": { "alias": "panelClass"; "required": false; "isSignal": true; }; "panelStyle": { "alias": "panelStyle"; "required": false; "isSignal": true; }; "fluid": { "alias": "fluid"; "required": false; "isSignal": true; }; "panelStyleClass": { "alias": "panelStyleClass"; "required": false; "isSignal": true; }; "containerStyle": { "alias": "containerStyle"; "required": false; "isSignal": true; }; "containerStyleClass": { "alias": "containerStyleClass"; "required": false; "isSignal": true; }; "labelStyle": { "alias": "labelStyle"; "required": false; "isSignal": true; }; "labelStyleClass": { "alias": "labelStyleClass"; "required": false; "isSignal": true; }; "overlayOptions": { "alias": "overlayOptions"; "required": false; "isSignal": true; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "filter": { "alias": "filter"; "required": false; "isSignal": true; }; "filterBy": { "alias": "filterBy"; "required": false; "isSignal": true; }; "filterMode": { "alias": "filterMode"; "required": false; "isSignal": true; }; "filterPlaceholder": { "alias": "filterPlaceholder"; "required": false; "isSignal": true; }; "filterLocale": { "alias": "filterLocale"; "required": false; "isSignal": true; }; "filterInputAutoFocus": { "alias": "filterInputAutoFocus"; "required": false; "isSignal": true; }; "propagateSelectionDown": { "alias": "propagateSelectionDown"; "required": false; "isSignal": true; }; "propagateSelectionUp": { "alias": "propagateSelectionUp"; "required": false; "isSignal": true; }; "showClear": { "alias": "showClear"; "required": false; "isSignal": true; }; "resetFilterOnHide": { "alias": "resetFilterOnHide"; "required": false; "isSignal": true; }; "virtualScroll": { "alias": "virtualScroll"; "required": false; "isSignal": true; }; "virtualScrollItemSize": { "alias": "virtualScrollItemSize"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "virtualScrollOptions": { "alias": "virtualScrollOptions"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onNodeExpand": "onNodeExpand"; "onNodeCollapse": "onNodeCollapse"; "onShow": "onShow"; "onHide": "onHide"; "onClear": "onClear"; "onFilter": "onFilter"; "onFocus": "onFocus"; "onBlur": "onBlur"; "onNodeUnselect": "onNodeUnselect"; "onNodeSelect": "onNodeSelect"; }, ["valueTemplate", "headerTemplate", "emptyTemplate", "footerTemplate", "clearIconTemplate", "triggerIconTemplate", "dropdownIconTemplate", "filterIconTemplate", "closeIconTemplate", "itemTogglerIconTemplate", "itemCheckboxIconTemplate", "itemLoadingIconTemplate"], never, true, never>;
}

type TreeTableNode<T = any> = TreeNode<T>;
interface TreeTableLazyLoadEvent {
    rows?: number | null;
    sortField?: string | string[] | null;
    sortOrder?: number | null;
    filters?: any | null;
    globalFilter?: string | string[] | null;
    multiSortMeta?: SortMeta[] | null;
    forceUpdate?: Function | null;
    first: any;
    last: any;
}
interface TreeTableColumnReorderEvent {
    dragIndex?: number;
    dropIndex?: number;
    columns?: any[];
}
interface TreeTableFilterEvent {
    filters?: any;
    filteredValue?: TreeNode[];
}
interface TreeTableNodeExpandEvent<T = any> {
    originalEvent: Event;
    node: TreeNode<T>;
}
interface TreeTableNodeCollapseEvent<T = any> {
    originalEvent: Event;
    node: TreeNode<T>;
}
interface TreeTableSortEvent {
    originalEvent?: Event;
    data?: TreeNode[];
    mode?: 'single' | 'multiple';
    field?: string;
    order?: number;
    multiSortMeta?: SortMeta[] | null;
    multisortmeta?: any;
    sortMeta?: SortMeta;
}
interface TreeTableColResizeEvent {
    element: HTMLElement;
    delta: number;
}
interface TreeTableNodeSelectEvent {
    originalEvent?: Event;
    node?: TreeNode;
    type?: string;
    index?: number;
}
interface TreeTableNodeUnSelectEvent {
    originalEvent?: Event;
    node?: TreeNode;
    type?: string;
}
interface TreeTableContextMenuSelectEvent {
    originalEvent: Event;
    node: TreeNode;
}
interface TreeTableHeaderCheckboxToggleEvent {
    originalEvent: Event;
    checked: boolean;
}
interface TreeTableEditEvent {
    field: string;
    data: any;
}
interface TreeTablePaginatorState {
    page?: number;
    first?: number;
    rows?: number;
    pageCount?: number;
}
interface TreeTableFilterOptions {
    filterField: string;
    filterValue: any;
    filterConstraint: Function;
    isStrictMode: boolean;
}

/**
 * TreeTable is used to display hierarchical data in tabular format.
 * Wraps PrimeNG TreeTable component.
 */
declare class CmmTreeTableComponent {
    /**
     * An array of objects to represent dynamic columns
     */
    readonly columns: _angular_core.InputSignal<any[]>;
    /**
     * An array of objects to display
     */
    readonly treeTableValue: _angular_core.InputSignal<TreeNode<any>[]>;
    /**
     * Inline style of the component
     */
    readonly style: _angular_core.InputSignal<any>;
    /**
     * Style class of the component
     */
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    /**
     * Inline style of the table
     */
    readonly tableStyle: _angular_core.InputSignal<any>;
    /**
     * Style class of the table
     */
    readonly tableStyleClass: _angular_core.InputSignal<string | undefined>;
    /**
     * Whether the cell widths scale according to their content or not
     */
    readonly autoLayout: _angular_core.InputSignal<boolean>;
    /**
     * When specifies, enables horizontal and/or vertical scrolling
     */
    readonly scrollable: _angular_core.InputSignal<boolean>;
    /**
     * Height of the scroll viewport in fixed pixels or the "flex" keyword for a dynamic size
     */
    readonly scrollHeight: _angular_core.InputSignal<string | undefined>;
    /**
     * Width of the frozen columns container
     */
    readonly frozenWidth: _angular_core.InputSignal<string | undefined>;
    /**
     * An array of objects to represent dynamic columns that are frozen
     */
    readonly frozenColumns: _angular_core.InputSignal<any>;
    /**
     * Whether to show grid lines between cells
     */
    readonly showGridlines: _angular_core.InputSignal<boolean>;
    /**
     * When specified as true, enables the pagination
     */
    readonly paginator: _angular_core.InputSignal<boolean>;
    /**
     * Number of rows to display per page
     */
    readonly rows: _angular_core.InputSignal<number | undefined>;
    /**
     * Index of the first row to be displayed
     */
    readonly first: _angular_core.InputSignal<number>;
    /**
     * Number of page links to display in paginator
     */
    readonly pageLinks: _angular_core.InputSignal<number>;
    /**
     * Array of integer/object values to display inside rows per page dropdown of paginator
     */
    readonly rowsPerPageOptions: _angular_core.InputSignal<any[] | undefined>;
    /**
     * Whether to show it even there is only one page
     */
    readonly alwaysShowPaginator: _angular_core.InputSignal<boolean>;
    /**
     * Position of the paginator
     */
    readonly paginatorPosition: _angular_core.InputSignal<"top" | "bottom" | "both">;
    /**
     * Custom style class for paginator
     */
    readonly paginatorStyleClass: _angular_core.InputSignal<string | undefined>;
    /**
     * Target element to attach the paginator dropdown overlay
     */
    readonly paginatorDropdownAppendTo: _angular_core.InputSignal<any>;
    /**
     * Template of the current page report element
     */
    readonly currentPageReportTemplate: _angular_core.InputSignal<string>;
    /**
     * Whether to display current page report
     */
    readonly showCurrentPageReport: _angular_core.InputSignal<boolean>;
    /**
     * Whether to display a dropdown to navigate to any page
     */
    readonly showJumpToPageDropdown: _angular_core.InputSignal<boolean>;
    /**
     * When enabled, icons are displayed on paginator to go first and last page
     */
    readonly showFirstLastIcon: _angular_core.InputSignal<boolean>;
    /**
     * Whether to show page links
     */
    readonly showPageLinks: _angular_core.InputSignal<boolean>;
    /**
     * Locale to be used in paginator formatting
     */
    readonly paginatorLocale: _angular_core.InputSignal<string | undefined>;
    /**
     * Sort order to use when an unsorted column gets sorted by user interaction
     */
    readonly defaultSortOrder: _angular_core.InputSignal<number>;
    /**
     * Defines whether sorting works on single column or on multiple columns
     */
    readonly sortMode: _angular_core.InputSignal<"single" | "multiple">;
    /**
     * When true, resets paginator to first page after sorting
     */
    readonly resetPageOnSort: _angular_core.InputSignal<boolean>;
    /**
     * Whether to use the default sorting or a custom one using sortFunction
     */
    readonly customSort: _angular_core.InputSignal<boolean>;
    /**
     * Name of the field to sort data by default
     */
    readonly sortField: _angular_core.InputSignal<string | undefined>;
    /**
     * Order to sort when default sorting is enabled
     */
    readonly sortOrder: _angular_core.InputSignal<number | undefined>;
    /**
     * An array of SortMeta objects to sort the data by default in multiple sort mode
     */
    readonly multiSortMeta: _angular_core.InputSignal<SortMeta[] | undefined>;
    /**
     * Specifies the selection mode, valid values are "single" and "multiple"
     */
    readonly selectionMode: _angular_core.InputSignal<string | undefined>;
    /**
     * Selected row in single mode or an array of values in multiple mode
     */
    readonly selection: _angular_core.ModelSignal<any>;
    /**
     * A map of keys to control the selection state
     */
    readonly selectionKeys: _angular_core.ModelSignal<any>;
    /**
     * Selected row with a context menu
     */
    readonly contextMenuSelection: _angular_core.InputSignal<any>;
    /**
     * Mode of the contet menu selection
     */
    readonly contextMenuSelectionMode: _angular_core.InputSignal<string>;
    /**
     * A property to uniquely identify a record in data
     */
    readonly dataKey: _angular_core.InputSignal<string | undefined>;
    /**
     * Defines whether metaKey is should be considered for the selection
     */
    readonly metaKeySelection: _angular_core.InputSignal<boolean>;
    /**
     * Algorithm to define if a row is selected
     */
    readonly compareSelectionBy: _angular_core.InputSignal<string>;
    /**
     * Adds hover effect to rows without the need for selectionMode
     */
    readonly rowHover: _angular_core.InputSignal<boolean>;
    /**
     * An array of FilterMetadata objects to provide external filters
     */
    readonly filters: _angular_core.InputSignal<any>;
    /**
     * An array of fields as string to use in global filtering
     */
    readonly globalFilterFields: _angular_core.InputSignal<string[] | undefined>;
    /**
     * Delay in milliseconds before filtering the data
     */
    readonly filterDelay: _angular_core.InputSignal<number>;
    /**
     * Mode for filtering valid values are "lenient" and "strict"
     */
    readonly filterMode: _angular_core.InputSignal<string>;
    /**
     * Locale to use in filtering
     */
    readonly filterLocale: _angular_core.InputSignal<string | undefined>;
    /**
     * Whether the data should be loaded on demand during scroll
     */
    readonly virtualScroll: _angular_core.InputSignal<boolean>;
    /**
     * Height of a row to use in calculations of virtual scrolling
     */
    readonly virtualScrollItemSize: _angular_core.InputSignal<number | undefined>;
    /**
     * Whether to use the scroller feature
     */
    readonly virtualScrollOptions: _angular_core.InputSignal<ScrollerOptions | undefined>;
    /**
     * The delay (in milliseconds) before triggering the virtual scroll
     */
    readonly virtualScrollDelay: _angular_core.InputSignal<number>;
    /**
     * When enabled, columns can be resized using drag and drop
     */
    readonly resizableColumns: _angular_core.InputSignal<boolean>;
    /**
     * Defines whether the overall table width should change on column resize
     */
    readonly columnResizeMode: _angular_core.InputSignal<string>;
    /**
     * When enabled, columns can be reordered using drag and drop
     */
    readonly reorderableColumns: _angular_core.InputSignal<boolean>;
    /**
     * Defines if data is loaded and interacted with in lazy manner
     */
    readonly lazy: _angular_core.InputSignal<boolean>;
    /**
     * Whether to call lazy loading on initialization
     */
    readonly lazyLoadOnInit: _angular_core.InputSignal<boolean>;
    /**
     * Number of total records, defaults to length of value when not defined
     */
    readonly totalRecords: _angular_core.InputSignal<number | undefined>;
    /**
     * Displays a loader to indicate data load is in progress
     */
    readonly loading: _angular_core.InputSignal<boolean>;
    /**
     * The icon to show while indicating data load is in progress
     */
    readonly loadingIcon: _angular_core.InputSignal<string | undefined>;
    /**
     * Whether to show the loading mask when loading property is true
     */
    readonly showLoader: _angular_core.InputSignal<boolean>;
    /**
     * Local ng-template varilable of a ContextMenu
     */
    readonly contextMenu: _angular_core.InputSignal<any>;
    /**
     * Function to optimize the dom operations by delegating to ngForTrackBy
     */
    readonly rowTrackBy: _angular_core.InputSignal<Function | undefined>;
    /**
     * Callback to invoke on selected node change
     */
    readonly selectionChange: _angular_core.OutputEmitterRef<any>;
    /**
     * Callback to invoke when selectionKeys are changed
     */
    readonly selectionKeysChange: _angular_core.OutputEmitterRef<any>;
    /**
     * Callback to invoke on context menu selection change
     */
    readonly contextMenuSelectionChange: _angular_core.OutputEmitterRef<any>;
    /**
     * Callback to invoke when data is filtered
     */
    readonly onFilter: _angular_core.OutputEmitterRef<TreeTableFilterEvent>;
    /**
     * Callback to invoke when a node is expanded
     */
    readonly onNodeExpand: _angular_core.OutputEmitterRef<TreeTableNodeExpandEvent<any>>;
    /**
     * Callback to invoke when a node is collapsed
     */
    readonly onNodeCollapse: _angular_core.OutputEmitterRef<TreeTableNodeCollapseEvent<any>>;
    /**
     * Callback to invoke when pagination occurs
     */
    readonly onPage: _angular_core.OutputEmitterRef<TreeTablePaginatorState>;
    /**
     * Callback to invoke when a column gets sorted
     */
    readonly onSort: _angular_core.OutputEmitterRef<any>;
    /**
     * Callback to invoke when paging, sorting or filtering happens in lazy mode
     */
    readonly onLazyLoad: _angular_core.OutputEmitterRef<TreeTableLazyLoadEvent>;
    /**
     * An event emitter to invoke on custom sorting
     */
    readonly sortFunction: _angular_core.OutputEmitterRef<TreeTableSortEvent>;
    /**
     * Callback to invoke when a column is resized
     */
    readonly onColResize: _angular_core.OutputEmitterRef<TreeTableColResizeEvent>;
    /**
     * Callback to invoke when a column is reordered
     */
    readonly onColReorder: _angular_core.OutputEmitterRef<TreeTableColumnReorderEvent>;
    /**
     * Callback to invoke when a node is selected
     */
    readonly onNodeSelect: _angular_core.OutputEmitterRef<TreeTableNodeSelectEvent>;
    /**
     * Callback to invoke when a node is unselected
     */
    readonly onNodeUnselect: _angular_core.OutputEmitterRef<TreeTableNodeUnSelectEvent>;
    /**
     * Callback to invoke when a node is selected with right click
     */
    readonly onContextMenuSelect: _angular_core.OutputEmitterRef<TreeTableContextMenuSelectEvent>;
    /**
     * Callback to invoke when state of header checkbox changes
     */
    readonly onHeaderCheckboxToggle: _angular_core.OutputEmitterRef<TreeTableHeaderCheckboxToggleEvent>;
    /**
     * Callback to invoke when a cell switches to edit mode
     */
    readonly onEditInit: _angular_core.OutputEmitterRef<TreeTableEditEvent>;
    /**
     * Callback to invoke when cell edit is completed
     */
    readonly onEditComplete: _angular_core.OutputEmitterRef<TreeTableEditEvent>;
    /**
     * Callback to invoke when cell edit is cancelled with escape key
     */
    readonly onEditCancel: _angular_core.OutputEmitterRef<TreeTableEditEvent>;
    readonly caption: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly header: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly body: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly footer: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly summary: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly colgroup: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly emptymessage: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly paginatorleft: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly paginatorright: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly paginatordropdownitem: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly frozenheader: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly frozenbody: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly frozenfooter: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly frozencolgroup: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly loadingicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly reorderindicatorupicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly reorderindicatordownicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly sorticon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly checkboxicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly headercheckboxicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly togglericon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly paginatorfirstpagelinkicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly paginatorlastpagelinkicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly paginatorpreviouspagelinkicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly paginatornextpagelinkicon: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly treeTable: _angular_core.Signal<TreeTable>;
    /**
     * Resets scroll to top
     */
    resetScrollTop(): void;
    /**
     * Scrolls to given index when using virtual scroll
     */
    scrollToVirtualIndex(index: number): void;
    /**
     * Scrolls to given index
     */
    scrollTo(options: ScrollToOptions): void;
    /**
     * Clears the sort and paginator state
     */
    reset(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTreeTableComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTreeTableComponent, "cmm-treetable", never, { "columns": { "alias": "columns"; "required": false; "isSignal": true; }; "treeTableValue": { "alias": "value"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "tableStyle": { "alias": "tableStyle"; "required": false; "isSignal": true; }; "tableStyleClass": { "alias": "tableStyleClass"; "required": false; "isSignal": true; }; "autoLayout": { "alias": "autoLayout"; "required": false; "isSignal": true; }; "scrollable": { "alias": "scrollable"; "required": false; "isSignal": true; }; "scrollHeight": { "alias": "scrollHeight"; "required": false; "isSignal": true; }; "frozenWidth": { "alias": "frozenWidth"; "required": false; "isSignal": true; }; "frozenColumns": { "alias": "frozenColumns"; "required": false; "isSignal": true; }; "showGridlines": { "alias": "showGridlines"; "required": false; "isSignal": true; }; "paginator": { "alias": "paginator"; "required": false; "isSignal": true; }; "rows": { "alias": "rows"; "required": false; "isSignal": true; }; "first": { "alias": "first"; "required": false; "isSignal": true; }; "pageLinks": { "alias": "pageLinks"; "required": false; "isSignal": true; }; "rowsPerPageOptions": { "alias": "rowsPerPageOptions"; "required": false; "isSignal": true; }; "alwaysShowPaginator": { "alias": "alwaysShowPaginator"; "required": false; "isSignal": true; }; "paginatorPosition": { "alias": "paginatorPosition"; "required": false; "isSignal": true; }; "paginatorStyleClass": { "alias": "paginatorStyleClass"; "required": false; "isSignal": true; }; "paginatorDropdownAppendTo": { "alias": "paginatorDropdownAppendTo"; "required": false; "isSignal": true; }; "currentPageReportTemplate": { "alias": "currentPageReportTemplate"; "required": false; "isSignal": true; }; "showCurrentPageReport": { "alias": "showCurrentPageReport"; "required": false; "isSignal": true; }; "showJumpToPageDropdown": { "alias": "showJumpToPageDropdown"; "required": false; "isSignal": true; }; "showFirstLastIcon": { "alias": "showFirstLastIcon"; "required": false; "isSignal": true; }; "showPageLinks": { "alias": "showPageLinks"; "required": false; "isSignal": true; }; "paginatorLocale": { "alias": "paginatorLocale"; "required": false; "isSignal": true; }; "defaultSortOrder": { "alias": "defaultSortOrder"; "required": false; "isSignal": true; }; "sortMode": { "alias": "sortMode"; "required": false; "isSignal": true; }; "resetPageOnSort": { "alias": "resetPageOnSort"; "required": false; "isSignal": true; }; "customSort": { "alias": "customSort"; "required": false; "isSignal": true; }; "sortField": { "alias": "sortField"; "required": false; "isSignal": true; }; "sortOrder": { "alias": "sortOrder"; "required": false; "isSignal": true; }; "multiSortMeta": { "alias": "multiSortMeta"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "selection": { "alias": "selection"; "required": false; "isSignal": true; }; "selectionKeys": { "alias": "selectionKeys"; "required": false; "isSignal": true; }; "contextMenuSelection": { "alias": "contextMenuSelection"; "required": false; "isSignal": true; }; "contextMenuSelectionMode": { "alias": "contextMenuSelectionMode"; "required": false; "isSignal": true; }; "dataKey": { "alias": "dataKey"; "required": false; "isSignal": true; }; "metaKeySelection": { "alias": "metaKeySelection"; "required": false; "isSignal": true; }; "compareSelectionBy": { "alias": "compareSelectionBy"; "required": false; "isSignal": true; }; "rowHover": { "alias": "rowHover"; "required": false; "isSignal": true; }; "filters": { "alias": "filters"; "required": false; "isSignal": true; }; "globalFilterFields": { "alias": "globalFilterFields"; "required": false; "isSignal": true; }; "filterDelay": { "alias": "filterDelay"; "required": false; "isSignal": true; }; "filterMode": { "alias": "filterMode"; "required": false; "isSignal": true; }; "filterLocale": { "alias": "filterLocale"; "required": false; "isSignal": true; }; "virtualScroll": { "alias": "virtualScroll"; "required": false; "isSignal": true; }; "virtualScrollItemSize": { "alias": "virtualScrollItemSize"; "required": false; "isSignal": true; }; "virtualScrollOptions": { "alias": "virtualScrollOptions"; "required": false; "isSignal": true; }; "virtualScrollDelay": { "alias": "virtualScrollDelay"; "required": false; "isSignal": true; }; "resizableColumns": { "alias": "resizableColumns"; "required": false; "isSignal": true; }; "columnResizeMode": { "alias": "columnResizeMode"; "required": false; "isSignal": true; }; "reorderableColumns": { "alias": "reorderableColumns"; "required": false; "isSignal": true; }; "lazy": { "alias": "lazy"; "required": false; "isSignal": true; }; "lazyLoadOnInit": { "alias": "lazyLoadOnInit"; "required": false; "isSignal": true; }; "totalRecords": { "alias": "totalRecords"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "loadingIcon": { "alias": "loadingIcon"; "required": false; "isSignal": true; }; "showLoader": { "alias": "showLoader"; "required": false; "isSignal": true; }; "contextMenu": { "alias": "contextMenu"; "required": false; "isSignal": true; }; "rowTrackBy": { "alias": "rowTrackBy"; "required": false; "isSignal": true; }; }, { "selection": "selectionChange"; "selectionKeys": "selectionKeysChange"; "selectionChange": "selectionChange"; "selectionKeysChange": "selectionKeysChange"; "contextMenuSelectionChange": "contextMenuSelectionChange"; "onFilter": "onFilter"; "onNodeExpand": "onNodeExpand"; "onNodeCollapse": "onNodeCollapse"; "onPage": "onPage"; "onSort": "onSort"; "onLazyLoad": "onLazyLoad"; "sortFunction": "sortFunction"; "onColResize": "onColResize"; "onColReorder": "onColReorder"; "onNodeSelect": "onNodeSelect"; "onNodeUnselect": "onNodeUnselect"; "onContextMenuSelect": "onContextMenuSelect"; "onHeaderCheckboxToggle": "onHeaderCheckboxToggle"; "onEditInit": "onEditInit"; "onEditComplete": "onEditComplete"; "onEditCancel": "onEditCancel"; }, ["caption", "header", "body", "footer", "summary", "colgroup", "emptymessage", "paginatorleft", "paginatorright", "paginatordropdownitem", "frozenheader", "frozenbody", "frozenfooter", "frozencolgroup", "loadingicon", "reorderindicatorupicon", "reorderindicatordownicon", "sorticon", "checkboxicon", "headercheckboxicon", "togglericon", "paginatorfirstpagelinkicon", "paginatorlastpagelinkicon", "paginatorpreviouspagelinkicon", "paginatornextpagelinkicon"], never, true, never>;
}

interface PanelBeforeToggleEvent {
    originalEvent: Event;
    collapsed: boolean;
}
interface PanelAfterToggleEvent {
    originalEvent: Event;
    collapsed: boolean;
}
declare class CmmPanelComponent {
    toggleable: _angular_core.InputSignal<boolean>;
    header: _angular_core.InputSignal<string | undefined>;
    collapsed: _angular_core.ModelSignal<any>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string>;
    iconPos: _angular_core.InputSignal<"center" | "start" | "end">;
    expandIcon: _angular_core.InputSignal<string | undefined>;
    collapseIcon: _angular_core.InputSignal<string | undefined>;
    showHeader: _angular_core.InputSignal<boolean>;
    toggler: _angular_core.InputSignal<"header" | "icon">;
    transitionOptions: _angular_core.InputSignal<string>;
    toggleButtonProps: _angular_core.InputSignal<any>;
    onBeforeToggle: _angular_core.OutputEmitterRef<any>;
    onAfterToggle: _angular_core.OutputEmitterRef<any>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    iconsTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmPanelComponent, "cmm-panel", never, { "toggleable": { "alias": "toggleable"; "required": false; "isSignal": true; }; "header": { "alias": "header"; "required": false; "isSignal": true; }; "collapsed": { "alias": "collapsed"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "iconPos": { "alias": "iconPos"; "required": false; "isSignal": true; }; "expandIcon": { "alias": "expandIcon"; "required": false; "isSignal": true; }; "collapseIcon": { "alias": "collapseIcon"; "required": false; "isSignal": true; }; "showHeader": { "alias": "showHeader"; "required": false; "isSignal": true; }; "toggler": { "alias": "toggler"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; "toggleButtonProps": { "alias": "toggleButtonProps"; "required": false; "isSignal": true; }; }, { "collapsed": "collapsedChange"; "onBeforeToggle": "onBeforeToggle"; "onAfterToggle": "onAfterToggle"; }, ["headerTemplate", "iconsTemplate", "footerTemplate"], ["*"], true, never>;
}

declare class CmmPanelmenuComponent {
    panelMenu: _angular_core.Signal<PanelMenu | undefined>;
    id: _angular_core.InputSignal<string | undefined>;
    model: _angular_core.InputSignal<MenuItem[]>;
    multiple: _angular_core.InputSignal<boolean>;
    transitionOptions: _angular_core.InputSignal<string>;
    tabindex: _angular_core.InputSignal<number>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    submenuIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    collapseAll(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmPanelmenuComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmPanelmenuComponent, "cmm-panelmenu", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "model": { "alias": "model"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, ["itemTemplate", "submenuIconTemplate"], never, true, never>;
}

type SliderOrientation = 'horizontal' | 'vertical';
type SliderVariant = 'outlined' | 'filled';

declare class CmmSliderComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<number | number[]>;
    min: _angular_core.InputSignal<number>;
    max: _angular_core.InputSignal<number>;
    step: _angular_core.InputSignal<number>;
    orientation: _angular_core.InputSignal<SliderOrientation>;
    disabled: _angular_core.InputSignal<boolean>;
    range: _angular_core.InputSignal<boolean>;
    variant: _angular_core.InputSignal<SliderVariant>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    onChange: _angular_core.OutputEmitterRef<{
        value?: number | number[];
    }>;
    onSlideEnd: _angular_core.OutputEmitterRef<SliderSlideEndEvent>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: number | number[]): void;
    registerOnChange(fn: (value: number | number[]) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: {
        value?: number | number[];
    }): void;
    handleSlideEnd(event: SliderSlideEndEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSliderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSliderComponent, "cmm-slider", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "step": { "alias": "step"; "required": false; "isSignal": true; }; "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "range": { "alias": "range"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; "onSlideEnd": "onSlideEnd"; }, never, never, true, never>;
}

type PasswordVariant = 'outlined' | 'filled';
type PasswordSize = 'small' | 'large';
interface CmmPasswordProps {
    disabled?: boolean;
    feedback?: boolean;
    toggleMask?: boolean;
    variant?: PasswordVariant;
    size?: PasswordSize;
    placeholder?: string;
    promptLabel?: string;
    weakLabel?: string;
    mediumLabel?: string;
    strongLabel?: string;
    style?: Record<string, any>;
    styleClass?: string;
    inputStyle?: Record<string, any>;
    inputStyleClass?: string;
    panelStyle?: Record<string, any>;
    panelStyleClass?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    inputId?: string;
    fluid?: boolean;
    maxlength?: number | null;
    tabindex?: number;
}

declare class CmmPasswordComponent implements ControlValueAccessor {
    /**
     * Value of the password
     */
    value: _angular_core.ModelSignal<string>;
    /**
     * Component props
     */
    props: _angular_core.InputSignal<CmmPasswordProps>;
    cvaDisabled: _angular_core.WritableSignal<boolean>;
    computedProps: _angular_core.Signal<{
        disabled: boolean;
        feedback: boolean;
        toggleMask: boolean;
        variant: _khcn_core_ui.PasswordVariant;
        promptLabel: string;
        weakLabel: string;
        mediumLabel: string;
        strongLabel: string;
        placeholder: string;
        styleClass: string;
        inputStyleClass: string;
        ariaLabel: string;
        ariaLabelledBy: string;
        inputId: string;
        maxlength: number | null;
        tabindex: number;
        size?: _khcn_core_ui.PasswordSize;
        style?: Record<string, any>;
        inputStyle?: Record<string, any>;
        panelStyle?: Record<string, any>;
        panelStyleClass?: string;
        fluid?: boolean;
    }>;
    /**
     * Content children templates
     */
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Callback to invoke when password gets focus
     */
    onFocus: _angular_core.OutputEmitterRef<Event>;
    /**
     * Callback to invoke when password loses focus
     */
    onBlur: _angular_core.OutputEmitterRef<Event>;
    /**
     * Callback to invoke on input
     */
    onInput: _angular_core.OutputEmitterRef<Event>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: string): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleInput(event: Event): void;
    handleBlur(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmPasswordComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmPasswordComponent, "cmm-password", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "props": { "alias": "props"; "required": true; "isSignal": true; }; }, { "value": "valueChange"; "onFocus": "onFocus"; "onBlur": "onBlur"; "onInput": "onInput"; }, ["headerTemplate", "footerTemplate", "contentTemplate"], never, true, never>;
}

type SpeedDialDirection = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
type SpeedDialType = 'linear' | 'circle' | 'semi-circle' | 'quarter-circle';

declare class CmmSpeeddialComponent {
    id: _angular_core.InputSignal<string | undefined>;
    model: _angular_core.InputSignal<MenuItem[]>;
    visible: _angular_core.ModelSignal<boolean>;
    direction: _angular_core.InputSignal<SpeedDialDirection>;
    type: _angular_core.InputSignal<SpeedDialType>;
    radius: _angular_core.InputSignal<number>;
    mask: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    hideOnClickOutside: _angular_core.InputSignal<boolean>;
    transitionDelay: _angular_core.InputSignal<number>;
    buttonStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    buttonClass: _angular_core.InputSignal<string>;
    maskStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    maskClass: _angular_core.InputSignal<string>;
    showIcon: _angular_core.InputSignal<string>;
    hideIcon: _angular_core.InputSignal<string>;
    rotateAnimation: _angular_core.InputSignal<boolean>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    tooltipOptions: _angular_core.InputSignal<any>;
    buttonProps: _angular_core.InputSignal<any>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    buttonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onClick: _angular_core.OutputEmitterRef<MouseEvent>;
    onShow: _angular_core.OutputEmitterRef<Event>;
    onHide: _angular_core.OutputEmitterRef<Event>;
    onVisibleChange: _angular_core.OutputEmitterRef<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSpeeddialComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSpeeddialComponent, "cmm-speeddial", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "model": { "alias": "model"; "required": false; "isSignal": true; }; "visible": { "alias": "visible"; "required": false; "isSignal": true; }; "direction": { "alias": "direction"; "required": false; "isSignal": true; }; "type": { "alias": "type"; "required": false; "isSignal": true; }; "radius": { "alias": "radius"; "required": false; "isSignal": true; }; "mask": { "alias": "mask"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "hideOnClickOutside": { "alias": "hideOnClickOutside"; "required": false; "isSignal": true; }; "transitionDelay": { "alias": "transitionDelay"; "required": false; "isSignal": true; }; "buttonStyle": { "alias": "buttonStyle"; "required": false; "isSignal": true; }; "buttonClass": { "alias": "buttonClass"; "required": false; "isSignal": true; }; "maskStyle": { "alias": "maskStyle"; "required": false; "isSignal": true; }; "maskClass": { "alias": "maskClass"; "required": false; "isSignal": true; }; "showIcon": { "alias": "showIcon"; "required": false; "isSignal": true; }; "hideIcon": { "alias": "hideIcon"; "required": false; "isSignal": true; }; "rotateAnimation": { "alias": "rotateAnimation"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "tooltipOptions": { "alias": "tooltipOptions"; "required": false; "isSignal": true; }; "buttonProps": { "alias": "buttonProps"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, { "visible": "visibleChange"; "onClick": "onClick"; "onShow": "onShow"; "onHide": "onHide"; "onVisibleChange": "onVisibleChange"; }, ["buttonTemplate", "itemTemplate", "iconTemplate"], never, true, never>;
}

declare class CmmSplitButtonComponent {
    model: _angular_core.InputSignal<MenuItem[]>;
    severity: _angular_core.InputSignal<"danger" | "secondary" | "success" | "info" | "help" | "contrast" | "warn" | null | undefined>;
    raised: _angular_core.InputSignal<boolean>;
    rounded: _angular_core.InputSignal<boolean>;
    text: _angular_core.InputSignal<boolean>;
    outlined: _angular_core.InputSignal<boolean>;
    size: _angular_core.InputSignal<"small" | "large" | null | undefined>;
    plain: _angular_core.InputSignal<boolean>;
    icon: _angular_core.InputSignal<string | undefined>;
    iconPos: _angular_core.InputSignal<"left" | "right">;
    label: _angular_core.InputSignal<string | undefined>;
    tooltip: _angular_core.InputSignal<string | undefined>;
    tooltipOptions: _angular_core.InputSignal<any>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string>;
    menuStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    menuStyleClass: _angular_core.InputSignal<string>;
    dropdownIcon: _angular_core.InputSignal<string | undefined>;
    appendTo: _angular_core.InputSignal<string | HTMLElement>;
    disabled: _angular_core.InputSignal<boolean>;
    tabindex: _angular_core.InputSignal<number | undefined>;
    autofocus: _angular_core.InputSignal<boolean>;
    buttonProps: _angular_core.InputSignal<any>;
    menuButtonProps: _angular_core.InputSignal<any>;
    onClick: _angular_core.OutputEmitterRef<Event>;
    onDropdownClick: _angular_core.OutputEmitterRef<Event>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    dropdowniconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSplitButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSplitButtonComponent, "cmm-splitbutton", never, { "model": { "alias": "model"; "required": true; "isSignal": true; }; "severity": { "alias": "severity"; "required": false; "isSignal": true; }; "raised": { "alias": "raised"; "required": false; "isSignal": true; }; "rounded": { "alias": "rounded"; "required": false; "isSignal": true; }; "text": { "alias": "text"; "required": false; "isSignal": true; }; "outlined": { "alias": "outlined"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "plain": { "alias": "plain"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "iconPos": { "alias": "iconPos"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "tooltip": { "alias": "tooltip"; "required": false; "isSignal": true; }; "tooltipOptions": { "alias": "tooltipOptions"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "menuStyle": { "alias": "menuStyle"; "required": false; "isSignal": true; }; "menuStyleClass": { "alias": "menuStyleClass"; "required": false; "isSignal": true; }; "dropdownIcon": { "alias": "dropdownIcon"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; "buttonProps": { "alias": "buttonProps"; "required": false; "isSignal": true; }; "menuButtonProps": { "alias": "menuButtonProps"; "required": false; "isSignal": true; }; }, { "onClick": "onClick"; "onDropdownClick": "onDropdownClick"; }, ["contentTemplate", "dropdowniconTemplate"], never, true, never>;
}

declare class CmmInputgroupaddonComponent {
    readonly style: _angular_core.InputSignal<Record<string, any> | undefined>;
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmInputgroupaddonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmInputgroupaddonComponent, "cmm-inputgroupaddon", never, { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

type InputMaskVariant = 'outlined' | 'filled';
type InputMaskSize = 'small' | 'large';

declare class CmmInputmaskComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<string>;
    mask: _angular_core.InputSignal<string>;
    slotChar: _angular_core.InputSignal<string>;
    autoClear: _angular_core.InputSignal<boolean>;
    unmask: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    readonly: _angular_core.InputSignal<boolean>;
    variant: _angular_core.InputSignal<InputMaskVariant>;
    size: _angular_core.InputSignal<InputMaskSize | undefined>;
    placeholder: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    autofocus: _angular_core.InputSignal<boolean>;
    onComplete: _angular_core.OutputEmitterRef<Event>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    onInput: _angular_core.OutputEmitterRef<Event>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: string): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleComplete(event: Event): void;
    handleInput(event: Event): void;
    handleBlur(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmInputmaskComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmInputmaskComponent, "cmm-inputmask", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "mask": { "alias": "mask"; "required": true; "isSignal": true; }; "slotChar": { "alias": "slotChar"; "required": false; "isSignal": true; }; "autoClear": { "alias": "autoClear"; "required": false; "isSignal": true; }; "unmask": { "alias": "unmask"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onComplete": "onComplete"; "onFocus": "onFocus"; "onBlur": "onBlur"; "onInput": "onInput"; }, never, never, true, never>;
}

type ColorPickerFormat = 'hex' | 'rgb' | 'hsb';

declare class CmmColorpickerComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<string>;
    format: _angular_core.InputSignal<ColorPickerFormat>;
    inline: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    appendTo: _angular_core.InputSignal<any>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    onChange: _angular_core.OutputEmitterRef<ColorPickerChangeEvent>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: string): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: ColorPickerChangeEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmColorpickerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmColorpickerComponent, "cmm-colorpicker", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "format": { "alias": "format"; "required": false; "isSignal": true; }; "inline": { "alias": "inline"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; }, never, never, true, never>;
}

/**
 * Custom events for PickList component
 */
interface PickListMoveToSourceEvent {
    /** Moved items */
    items: any[];
}
interface PickListMoveAllToSourceEvent {
    /** Moved items */
    items: any[];
}
interface PickListMoveAllToTargetEvent {
    /** Moved items */
    items: any[];
}
interface PickListMoveToTargetEvent {
    /** Moved items */
    items: any[];
}
interface PickListSourceReorderEvent {
    /** Moved items */
    items: any[];
}
interface PickListTargetReorderEvent {
    /** Moved items */
    items: any[];
}
interface PickListSourceSelectEvent {
    /** Browser event */
    originalEvent: Event;
    /** Selected items */
    items: any[];
}
interface PickListTargetSelectEvent {
    /** Browser event */
    originalEvent: Event;
    /** Selected items */
    items: any[];
}
interface PickListSourceFilterEvent {
    /** Filter value */
    query: string | null | undefined;
    /** Filtered items */
    value: any[] | null | undefined;
}
interface PickListTargetFilterEvent {
    /** Filter value */
    query: string | null | undefined;
    /** Filtered items */
    value: any[] | null | undefined;
}
/**
 * Filter options for PickList component
 */
interface PickListFilterOptions {
    /** Callback to filter items */
    filter?: (value?: any) => void;
    /** Callback to reset the filter */
    reset?: () => void;
}

/**
 * Constants for PickList component
 */
/** Filter match mode options */
declare const PICKLIST_FILTER_MATCH_MODE: {
    CONTAINS: "contains";
    STARTS_WITH: "startsWith";
    ENDS_WITH: "endsWith";
    EQUALS: "equals";
    NOT_EQUALS: "notEquals";
    IN: "in";
    LT: "lt";
    LTE: "lte";
    GT: "gt";
    GTE: "gte";
};
type PickListFilterMatchMode = (typeof PICKLIST_FILTER_MATCH_MODE)[keyof typeof PICKLIST_FILTER_MATCH_MODE];

/**
 * CmmPickListComponent - Angular 19 wrapper for PrimeNG PickList
 *
 * A thin wrapper component that provides signal-based inputs and two-way binding
 * for PrimeNG's PickList component. PickList is used to reorder items between
 * different lists with drag-drop and transfer operations.
 *
 * @example
 * ```html
 * <cmm-pick-list
 *   [(source)]="availableProducts"
 *   [(target)]="selectedProducts"
 *   sourceHeader="Available"
 *   targetHeader="Selected">
 *   <ng-template pTemplate="item" let-product>
 *     {{ product.name }}
 *   </ng-template>
 * </cmm-pick-list>
 * ```
 */
declare class CmmPickListComponent {
    readonly itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly sourceheaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly targetheaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly sourcefilterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly targetfilterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly emptymessagesourceTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly emptyfiltermessagesourceTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly emptymessagetargetTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly emptyfiltermessagetargetTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly moveupiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movetopiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movedowniconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movebottomiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movetotargeticonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movealltotargeticonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movetosourceiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly movealltosourceiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly targetfiltericonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly sourcefiltericonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /** Text for the source list caption */
    readonly sourceHeader: _angular_core.InputSignal<string | undefined>;
    /** Text for the target list caption */
    readonly targetHeader: _angular_core.InputSignal<string | undefined>;
    /** Index of the element in tabbing order */
    readonly tabindex: _angular_core.InputSignal<number>;
    /** Aria label for right button */
    readonly rightButtonAriaLabel: _angular_core.InputSignal<string | undefined>;
    /** Aria label for left button */
    readonly leftButtonAriaLabel: _angular_core.InputSignal<string | undefined>;
    /** Aria label for all right button */
    readonly allRightButtonAriaLabel: _angular_core.InputSignal<string | undefined>;
    /** Aria label for all left button */
    readonly allLeftButtonAriaLabel: _angular_core.InputSignal<string | undefined>;
    /** Aria label for up button */
    readonly upButtonAriaLabel: _angular_core.InputSignal<string | undefined>;
    /** Aria label for down button */
    readonly downButtonAriaLabel: _angular_core.InputSignal<string | undefined>;
    /** Aria label for top button */
    readonly topButtonAriaLabel: _angular_core.InputSignal<string | undefined>;
    /** Aria label for bottom button */
    readonly bottomButtonAriaLabel: _angular_core.InputSignal<string | undefined>;
    /** Whether the component should be responsive */
    readonly responsive: _angular_core.InputSignal<boolean>;
    /** Fields to search against when filtering */
    readonly filterBy: _angular_core.InputSignal<string | undefined>;
    /** Locale to use in filtering */
    readonly filterLocale: _angular_core.InputSignal<string | undefined>;
    /** Function to optimize dom operations by delegating to ngForTrackBy */
    readonly trackBy: _angular_core.InputSignal<Function | undefined>;
    /** Function to optimize dom operations for source list */
    readonly sourceTrackBy: _angular_core.InputSignal<Function | undefined>;
    /** Function to optimize dom operations for target list */
    readonly targetTrackBy: _angular_core.InputSignal<Function | undefined>;
    /** Whether to show filter input for source list */
    readonly showSourceFilter: _angular_core.InputSignal<boolean>;
    /** Whether to show filter input for target list */
    readonly showTargetFilter: _angular_core.InputSignal<boolean>;
    /** Whether metaKey needs to be pressed to select or unselect */
    readonly metaKeySelection: _angular_core.InputSignal<boolean>;
    /** Whether to enable dragdrop based reordering */
    readonly dragdrop: _angular_core.InputSignal<boolean>;
    /** Inline style of the component */
    readonly style: _angular_core.InputSignal<any>;
    /** Style class of the component */
    readonly styleClass: _angular_core.InputSignal<string | undefined>;
    /** Inline style of the source list element */
    readonly sourceStyle: _angular_core.InputSignal<any>;
    /** Inline style of the target list element */
    readonly targetStyle: _angular_core.InputSignal<any>;
    /** Whether to show buttons of source list */
    readonly showSourceControls: _angular_core.InputSignal<boolean>;
    /** Whether to show buttons of target list */
    readonly showTargetControls: _angular_core.InputSignal<boolean>;
    /** Placeholder text on source filter input */
    readonly sourceFilterPlaceholder: _angular_core.InputSignal<string | undefined>;
    /** Placeholder text on target filter input */
    readonly targetFilterPlaceholder: _angular_core.InputSignal<string | undefined>;
    /** When present, it specifies that the component should be disabled */
    readonly disabled: _angular_core.InputSignal<boolean>;
    /** Defines a string that labels the filter input of source list */
    readonly ariaSourceFilterLabel: _angular_core.InputSignal<string | undefined>;
    /** Defines a string that labels the filter input of target list */
    readonly ariaTargetFilterLabel: _angular_core.InputSignal<string | undefined>;
    /** Defines how the items are filtered */
    readonly filterMatchMode: _angular_core.InputSignal<PickListFilterMatchMode>;
    /** Whether to displays rows with alternating colors */
    readonly stripedRows: _angular_core.InputSignal<boolean>;
    /** Keeps selection on the transfer list */
    readonly keepSelection: _angular_core.InputSignal<boolean>;
    /** Height of the viewport */
    readonly scrollHeight: _angular_core.InputSignal<string>;
    /** Whether to focus on the first visible or selected element */
    readonly autoOptionFocus: _angular_core.InputSignal<boolean>;
    /** Used to pass all properties to the Button component */
    readonly buttonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move up button */
    readonly moveUpButtonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move top button */
    readonly moveTopButtonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move down button */
    readonly moveDownButtonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move bottom button */
    readonly moveBottomButtonProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move to target button */
    readonly moveToTargetProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move all to target button */
    readonly moveAllToTargetProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move to source button */
    readonly moveToSourceProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Used to pass all properties to the move all to source button */
    readonly moveAllToSourceProps: _angular_core.InputSignal<ButtonProps | undefined>;
    /** Width of the screen at which the component should change its behavior */
    readonly breakpoint: _angular_core.InputSignal<string | undefined>;
    /** An array of objects for the source list */
    readonly source: _angular_core.ModelSignal<any>;
    /** An array of objects for the target list */
    readonly target: _angular_core.ModelSignal<any>;
    /** Callback to invoke when items are moved from target to source */
    readonly onMoveToSource: _angular_core.OutputEmitterRef<PickListMoveToSourceEvent>;
    /** Callback to invoke when all items are moved from target to source */
    readonly onMoveAllToSource: _angular_core.OutputEmitterRef<PickListMoveAllToSourceEvent>;
    /** Callback to invoke when all items are moved from source to target */
    readonly onMoveAllToTarget: _angular_core.OutputEmitterRef<PickListMoveAllToTargetEvent>;
    /** Callback to invoke when items are moved from source to target */
    readonly onMoveToTarget: _angular_core.OutputEmitterRef<PickListMoveToTargetEvent>;
    /** Callback to invoke when items are reordered within source list */
    readonly onSourceReorder: _angular_core.OutputEmitterRef<PickListSourceReorderEvent>;
    /** Callback to invoke when items are reordered within target list */
    readonly onTargetReorder: _angular_core.OutputEmitterRef<PickListTargetReorderEvent>;
    /** Callback to invoke when items are selected within source list */
    readonly onSourceSelect: _angular_core.OutputEmitterRef<PickListSourceSelectEvent>;
    /** Callback to invoke when items are selected within target list */
    readonly onTargetSelect: _angular_core.OutputEmitterRef<PickListTargetSelectEvent>;
    /** Callback to invoke when the source list is filtered */
    readonly onSourceFilter: _angular_core.OutputEmitterRef<PickListSourceFilterEvent>;
    /** Callback to invoke when the target list is filtered */
    readonly onTargetFilter: _angular_core.OutputEmitterRef<PickListTargetFilterEvent>;
    /** Callback to invoke when the list is focused */
    readonly onFocus: _angular_core.OutputEmitterRef<Event>;
    /** Callback to invoke when the list is blurred */
    readonly onBlur: _angular_core.OutputEmitterRef<Event>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmPickListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmPickListComponent, "cmm-pick-list", ["cmmpicklist"], { "sourceHeader": { "alias": "sourceHeader"; "required": false; "isSignal": true; }; "targetHeader": { "alias": "targetHeader"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "rightButtonAriaLabel": { "alias": "rightButtonAriaLabel"; "required": false; "isSignal": true; }; "leftButtonAriaLabel": { "alias": "leftButtonAriaLabel"; "required": false; "isSignal": true; }; "allRightButtonAriaLabel": { "alias": "allRightButtonAriaLabel"; "required": false; "isSignal": true; }; "allLeftButtonAriaLabel": { "alias": "allLeftButtonAriaLabel"; "required": false; "isSignal": true; }; "upButtonAriaLabel": { "alias": "upButtonAriaLabel"; "required": false; "isSignal": true; }; "downButtonAriaLabel": { "alias": "downButtonAriaLabel"; "required": false; "isSignal": true; }; "topButtonAriaLabel": { "alias": "topButtonAriaLabel"; "required": false; "isSignal": true; }; "bottomButtonAriaLabel": { "alias": "bottomButtonAriaLabel"; "required": false; "isSignal": true; }; "responsive": { "alias": "responsive"; "required": false; "isSignal": true; }; "filterBy": { "alias": "filterBy"; "required": false; "isSignal": true; }; "filterLocale": { "alias": "filterLocale"; "required": false; "isSignal": true; }; "trackBy": { "alias": "trackBy"; "required": false; "isSignal": true; }; "sourceTrackBy": { "alias": "sourceTrackBy"; "required": false; "isSignal": true; }; "targetTrackBy": { "alias": "targetTrackBy"; "required": false; "isSignal": true; }; "showSourceFilter": { "alias": "showSourceFilter"; "required": false; "isSignal": true; }; "showTargetFilter": { "alias": "showTargetFilter"; "required": false; "isSignal": true; }; "metaKeySelection": { "alias": "metaKeySelection"; "required": false; "isSignal": true; }; "dragdrop": { "alias": "dragdrop"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "sourceStyle": { "alias": "sourceStyle"; "required": false; "isSignal": true; }; "targetStyle": { "alias": "targetStyle"; "required": false; "isSignal": true; }; "showSourceControls": { "alias": "showSourceControls"; "required": false; "isSignal": true; }; "showTargetControls": { "alias": "showTargetControls"; "required": false; "isSignal": true; }; "sourceFilterPlaceholder": { "alias": "sourceFilterPlaceholder"; "required": false; "isSignal": true; }; "targetFilterPlaceholder": { "alias": "targetFilterPlaceholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "ariaSourceFilterLabel": { "alias": "ariaSourceFilterLabel"; "required": false; "isSignal": true; }; "ariaTargetFilterLabel": { "alias": "ariaTargetFilterLabel"; "required": false; "isSignal": true; }; "filterMatchMode": { "alias": "filterMatchMode"; "required": false; "isSignal": true; }; "stripedRows": { "alias": "stripedRows"; "required": false; "isSignal": true; }; "keepSelection": { "alias": "keepSelection"; "required": false; "isSignal": true; }; "scrollHeight": { "alias": "scrollHeight"; "required": false; "isSignal": true; }; "autoOptionFocus": { "alias": "autoOptionFocus"; "required": false; "isSignal": true; }; "buttonProps": { "alias": "buttonProps"; "required": false; "isSignal": true; }; "moveUpButtonProps": { "alias": "moveUpButtonProps"; "required": false; "isSignal": true; }; "moveTopButtonProps": { "alias": "moveTopButtonProps"; "required": false; "isSignal": true; }; "moveDownButtonProps": { "alias": "moveDownButtonProps"; "required": false; "isSignal": true; }; "moveBottomButtonProps": { "alias": "moveBottomButtonProps"; "required": false; "isSignal": true; }; "moveToTargetProps": { "alias": "moveToTargetProps"; "required": false; "isSignal": true; }; "moveAllToTargetProps": { "alias": "moveAllToTargetProps"; "required": false; "isSignal": true; }; "moveToSourceProps": { "alias": "moveToSourceProps"; "required": false; "isSignal": true; }; "moveAllToSourceProps": { "alias": "moveAllToSourceProps"; "required": false; "isSignal": true; }; "breakpoint": { "alias": "breakpoint"; "required": false; "isSignal": true; }; "source": { "alias": "source"; "required": false; "isSignal": true; }; "target": { "alias": "target"; "required": false; "isSignal": true; }; }, { "source": "sourceChange"; "target": "targetChange"; "onMoveToSource": "onMoveToSource"; "onMoveAllToSource": "onMoveAllToSource"; "onMoveAllToTarget": "onMoveAllToTarget"; "onMoveToTarget": "onMoveToTarget"; "onSourceReorder": "onSourceReorder"; "onTargetReorder": "onTargetReorder"; "onSourceSelect": "onSourceSelect"; "onTargetSelect": "onTargetSelect"; "onSourceFilter": "onSourceFilter"; "onTargetFilter": "onTargetFilter"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["itemTemplate", "sourceheaderTemplate", "targetheaderTemplate", "sourcefilterTemplate", "targetfilterTemplate", "emptymessagesourceTemplate", "emptyfiltermessagesourceTemplate", "emptymessagetargetTemplate", "emptyfiltermessagetargetTemplate", "moveupiconTemplate", "movetopiconTemplate", "movedowniconTemplate", "movebottomiconTemplate", "movetotargeticonTemplate", "movealltotargeticonTemplate", "movetosourceiconTemplate", "movealltosourceiconTemplate", "targetfiltericonTemplate", "sourcefiltericonTemplate"], ["*"], true, never>;
}

/**
 * Popover is a container component that can overlay other components on page.
 * Wraps PrimeNG Popover component.
 */
declare class CmmPopoverComponent {
    /**
     * Defines a string that labels the input for accessibility
     */
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    /**
     * Establishes relationships between the component and label(s)
     */
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    /**
     * Enables to hide the overlay when outside is clicked
     */
    dismissable: _angular_core.InputSignal<boolean>;
    /**
     * When enabled, displays a close icon at top right corner
     */
    showCloseIcon: _angular_core.InputSignal<boolean>;
    /**
     * Inline style of the component
     */
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    /**
     * Style class of the component
     */
    styleClass: _angular_core.InputSignal<string | undefined>;
    /**
     * Target element to attach the panel
     */
    appendTo: _angular_core.InputSignal<any>;
    /**
     * Whether to automatically manage layering
     */
    autoZIndex: _angular_core.InputSignal<boolean>;
    /**
     * Aria label of the close icon
     */
    ariaCloseLabel: _angular_core.InputSignal<string | undefined>;
    /**
     * Base zIndex value to use in layering
     */
    baseZIndex: _angular_core.InputSignal<number>;
    /**
     * When enabled, first button receives focus on show
     */
    focusOnShow: _angular_core.InputSignal<boolean>;
    /**
     * Transition options of the show animation
     */
    showTransitionOptions: _angular_core.InputSignal<string>;
    /**
     * Transition options of the hide animation
     */
    hideTransitionOptions: _angular_core.InputSignal<string>;
    /**
     * Callback to invoke when an overlay becomes visible
     */
    onShow: _angular_core.OutputEmitterRef<any>;
    /**
     * Callback to invoke when an overlay gets hidden
     */
    onHide: _angular_core.OutputEmitterRef<any>;
    /**
     * Custom content template
     */
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Custom close icon template
     */
    closeiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    /**
     * Reference to the PrimeNG Popover component
     */
    popoverRef: _angular_core.Signal<Popover | undefined>;
    /**
     * Toggles the visibility of the panel
     */
    toggle(event: any, target?: any): void;
    /**
     * Displays the panel
     */
    show(event: any, target?: any): void;
    /**
     * Hides the panel
     */
    hide(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmPopoverComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmPopoverComponent, "cmm-popover", never, { "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "dismissable": { "alias": "dismissable"; "required": false; "isSignal": true; }; "showCloseIcon": { "alias": "showCloseIcon"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "ariaCloseLabel": { "alias": "ariaCloseLabel"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "focusOnShow": { "alias": "focusOnShow"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; }, { "onShow": "onShow"; "onHide": "onHide"; }, ["contentTemplate", "closeiconTemplate"], ["*"], true, never>;
}

interface SplitterResizeStartEvent {
    originalEvent: MouseEvent | TouchEvent;
    sizes: number[];
}
interface SplitterResizeEndEvent {
    originalEvent: MouseEvent | TouchEvent;
    sizes: number[];
}
declare class CmmSplitterComponent {
    styleClass: _angular_core.InputSignal<string>;
    panelStyleClass: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    panelStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    stateStorage: _angular_core.InputSignal<"session" | "local">;
    stateKey: _angular_core.InputSignal<string | undefined>;
    layout: _angular_core.InputSignal<"vertical" | "horizontal">;
    gutterSize: _angular_core.InputSignal<number>;
    step: _angular_core.InputSignal<number>;
    minSizes: _angular_core.InputSignal<number[]>;
    panelSizes: _angular_core.InputSignal<number[]>;
    onResizeEnd: _angular_core.OutputEmitterRef<any>;
    onResizeStart: _angular_core.OutputEmitterRef<any>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmSplitterComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmSplitterComponent, "cmm-splitter", never, { "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "panelStyleClass": { "alias": "panelStyleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "panelStyle": { "alias": "panelStyle"; "required": false; "isSignal": true; }; "stateStorage": { "alias": "stateStorage"; "required": false; "isSignal": true; }; "stateKey": { "alias": "stateKey"; "required": false; "isSignal": true; }; "layout": { "alias": "layout"; "required": false; "isSignal": true; }; "gutterSize": { "alias": "gutterSize"; "required": false; "isSignal": true; }; "step": { "alias": "step"; "required": false; "isSignal": true; }; "minSizes": { "alias": "minSizes"; "required": false; "isSignal": true; }; "panelSizes": { "alias": "panelSizes"; "required": false; "isSignal": true; }; }, { "onResizeEnd": "onResizeEnd"; "onResizeStart": "onResizeStart"; }, never, ["*"], true, never>;
}

declare class CmmProgressBarComponent {
    value: _angular_core.InputSignal<number | undefined>;
    showValue: _angular_core.InputSignal<boolean>;
    styleClass: _angular_core.InputSignal<string>;
    valueStyleClass: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    unit: _angular_core.InputSignal<string>;
    mode: _angular_core.InputSignal<"determinate" | "indeterminate">;
    color: _angular_core.InputSignal<string | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmProgressBarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmProgressBarComponent, "cmm-progressbar", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "showValue": { "alias": "showValue"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "valueStyleClass": { "alias": "valueStyleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "unit": { "alias": "unit"; "required": false; "isSignal": true; }; "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; }, {}, ["contentTemplate"], never, true, never>;
}

/**
 * Stepper is a component that streamlines a wizard-like workflow,
 * organizing content into coherent steps and visually guiding users
 * through a numbered progression in a multistep process.
 * Wraps PrimeNG Stepper component.
 */
declare class CmmStepperComponent {
    /**
     * A model that can hold a numeric value or be undefined
     */
    readonly value: _angular_core.ModelSignal<number | undefined>;
    /**
     * A boolean variable that captures user input
     */
    readonly linear: _angular_core.InputSignal<boolean>;
    /**
     * Transition options of the animation
     */
    readonly transitionOptions: _angular_core.InputSignal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmStepperComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmStepperComponent, "cmm-stepper", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "linear": { "alias": "linear"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, ["*"], true, never>;
}

type InputNumberButtonLayout = 'stacked' | 'horizontal' | 'vertical';
type InputNumberMode = 'decimal' | 'currency';
type InputNumberSize = 'small' | 'large';
type InputNumberVariant = 'outlined' | 'filled';

declare class CmmInputnumberComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<number | null | undefined>;
    showButtons: _angular_core.InputSignal<boolean>;
    format: _angular_core.InputSignal<boolean>;
    buttonLayout: _angular_core.InputSignal<InputNumberButtonLayout>;
    inputId: _angular_core.InputSignal<string>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    placeholder: _angular_core.InputSignal<string | undefined>;
    size: _angular_core.InputSignal<InputNumberSize | undefined>;
    maxlength: _angular_core.InputSignal<number | undefined>;
    tabindex: _angular_core.InputSignal<number>;
    title: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaRequired: _angular_core.InputSignal<boolean>;
    name: _angular_core.InputSignal<string | undefined>;
    required: _angular_core.InputSignal<boolean>;
    autocomplete: _angular_core.InputSignal<string | undefined>;
    min: _angular_core.InputSignal<number | undefined>;
    max: _angular_core.InputSignal<number | undefined>;
    incrementButtonClass: _angular_core.InputSignal<string | undefined>;
    decrementButtonClass: _angular_core.InputSignal<string | undefined>;
    incrementButtonIcon: _angular_core.InputSignal<string | undefined>;
    decrementButtonIcon: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    readonly: _angular_core.InputSignal<boolean>;
    step: _angular_core.InputSignal<number>;
    allowEmpty: _angular_core.InputSignal<boolean>;
    locale: _angular_core.InputSignal<string | undefined>;
    localeMatcher: _angular_core.InputSignal<string | undefined>;
    mode: _angular_core.InputSignal<InputNumberMode>;
    currency: _angular_core.InputSignal<string>;
    currencyDisplay: _angular_core.InputSignal<string>;
    useGrouping: _angular_core.InputSignal<boolean>;
    minFractionDigits: _angular_core.InputSignal<number | undefined>;
    maxFractionDigits: _angular_core.InputSignal<number | undefined>;
    prefix: _angular_core.InputSignal<string | undefined>;
    suffix: _angular_core.InputSignal<string | undefined>;
    variant: _angular_core.InputSignal<InputNumberVariant>;
    fluid: _angular_core.InputSignal<boolean>;
    onInput: _angular_core.OutputEmitterRef<InputNumberInputEvent>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    onKeyDown: _angular_core.OutputEmitterRef<KeyboardEvent>;
    onClear: _angular_core.OutputEmitterRef<void>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: number | null): void;
    registerOnChange(fn: (value: number | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleInput(event: InputNumberInputEvent): void;
    handleFocus(event: Event): void;
    handleBlur(event: Event): void;
    handleKeyDown(event: KeyboardEvent): void;
    handleClear(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmInputnumberComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmInputnumberComponent, "cmm-inputnumber", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "showButtons": { "alias": "showButtons"; "required": false; "isSignal": true; }; "format": { "alias": "format"; "required": false; "isSignal": true; }; "buttonLayout": { "alias": "buttonLayout"; "required": false; "isSignal": true; }; "inputId": { "alias": "inputId"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "maxlength": { "alias": "maxlength"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "title": { "alias": "title"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaRequired": { "alias": "ariaRequired"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "autocomplete": { "alias": "autocomplete"; "required": false; "isSignal": true; }; "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "incrementButtonClass": { "alias": "incrementButtonClass"; "required": false; "isSignal": true; }; "decrementButtonClass": { "alias": "decrementButtonClass"; "required": false; "isSignal": true; }; "incrementButtonIcon": { "alias": "incrementButtonIcon"; "required": false; "isSignal": true; }; "decrementButtonIcon": { "alias": "decrementButtonIcon"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "step": { "alias": "step"; "required": false; "isSignal": true; }; "allowEmpty": { "alias": "allowEmpty"; "required": false; "isSignal": true; }; "locale": { "alias": "locale"; "required": false; "isSignal": true; }; "localeMatcher": { "alias": "localeMatcher"; "required": false; "isSignal": true; }; "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "currency": { "alias": "currency"; "required": false; "isSignal": true; }; "currencyDisplay": { "alias": "currencyDisplay"; "required": false; "isSignal": true; }; "useGrouping": { "alias": "useGrouping"; "required": false; "isSignal": true; }; "minFractionDigits": { "alias": "minFractionDigits"; "required": false; "isSignal": true; }; "maxFractionDigits": { "alias": "maxFractionDigits"; "required": false; "isSignal": true; }; "prefix": { "alias": "prefix"; "required": false; "isSignal": true; }; "suffix": { "alias": "suffix"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "fluid": { "alias": "fluid"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onInput": "onInput"; "onFocus": "onFocus"; "onBlur": "onBlur"; "onKeyDown": "onKeyDown"; "onClear": "onClear"; }, never, never, true, never>;
}

/**
 * Steps components is an indicator for the steps in a wizard workflow.
 * Wraps PrimeNG Steps component.
 */
declare class CmmStepsComponent {
    /**
     * Index of the active item
     */
    readonly activeIndex: _angular_core.ModelSignal<number>;
    /**
     * An array of menu items
     */
    readonly model: _angular_core.InputSignal<MenuItem[]>;
    /**
     * Whether the items are clickable or not
     */
    readonly readonly: _angular_core.InputSignal<boolean>;
    /**
     * Inline style of the component
     */
    readonly style: _angular_core.InputSignal<Record<string, any> | undefined>;
    /**
     * Style class of the component
     */
    readonly styleClass: _angular_core.InputSignal<string>;
    /**
     * Whether to apply 'router-link-active-exact' class if route exactly matches the item path
     */
    readonly exact: _angular_core.InputSignal<boolean>;
    /**
     * Callback to invoke when the new step is selected
     */
    readonly activeIndexChange: _angular_core.OutputEmitterRef<number>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmStepsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmStepsComponent, "cmm-steps", never, { "activeIndex": { "alias": "activeIndex"; "required": false; "isSignal": true; }; "model": { "alias": "model"; "required": true; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "exact": { "alias": "exact"; "required": false; "isSignal": true; }; }, { "activeIndex": "activeIndexChange"; "activeIndexChange": "activeIndexChange"; }, never, never, true, never>;
}

type InputOtpVariant = 'outlined' | 'filled';

declare class CmmInputotpComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<string | number | null>;
    inputTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    length: _angular_core.InputSignal<number>;
    mask: _angular_core.InputSignal<boolean>;
    integerOnly: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    readonly: _angular_core.InputSignal<boolean>;
    variant: _angular_core.InputSignal<InputOtpVariant>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    onChange: _angular_core.OutputEmitterRef<any>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: string | number | null): void;
    registerOnChange(fn: (value: string | number | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: any): void;
    handleBlur(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmInputotpComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmInputotpComponent, "cmm-inputotp", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "length": { "alias": "length"; "required": false; "isSignal": true; }; "mask": { "alias": "mask"; "required": false; "isSignal": true; }; "integerOnly": { "alias": "integerOnly"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["inputTemplate"], never, true, never>;
}

type ConfirmDialogDefaultFocus = 'accept' | 'reject' | 'close' | 'none';

declare class CmmConfirmdialogComponent {
    private confirmationService;
    header: _angular_core.InputSignal<string | undefined>;
    icon: _angular_core.InputSignal<string | undefined>;
    message: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    maskStyleClass: _angular_core.InputSignal<string | undefined>;
    acceptIcon: _angular_core.InputSignal<string | undefined>;
    acceptLabel: _angular_core.InputSignal<string | undefined>;
    acceptAriaLabel: _angular_core.InputSignal<string | undefined>;
    acceptVisible: _angular_core.InputSignal<boolean>;
    acceptButtonStyleClass: _angular_core.InputSignal<string | undefined>;
    rejectIcon: _angular_core.InputSignal<string | undefined>;
    rejectLabel: _angular_core.InputSignal<string | undefined>;
    rejectAriaLabel: _angular_core.InputSignal<string | undefined>;
    rejectVisible: _angular_core.InputSignal<boolean>;
    rejectButtonStyleClass: _angular_core.InputSignal<string | undefined>;
    closable: _angular_core.InputSignal<boolean>;
    closeAriaLabel: _angular_core.InputSignal<string | undefined>;
    closeOnEscape: _angular_core.InputSignal<boolean>;
    dismissableMask: _angular_core.InputSignal<boolean>;
    blockScroll: _angular_core.InputSignal<boolean>;
    rtl: _angular_core.InputSignal<boolean>;
    appendTo: _angular_core.InputSignal<any>;
    key: _angular_core.InputSignal<string | undefined>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    transitionOptions: _angular_core.InputSignal<string>;
    focusTrap: _angular_core.InputSignal<boolean>;
    defaultFocus: _angular_core.InputSignal<ConfirmDialogDefaultFocus>;
    breakpoints: _angular_core.InputSignal<any>;
    visible: _angular_core.InputSignal<any>;
    position: _angular_core.InputSignal<string | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    messageTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    acceptIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    rejectIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    closeIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onHide: _angular_core.OutputEmitterRef<ConfirmEventType>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmConfirmdialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmConfirmdialogComponent, "cmm-confirmdialog", never, { "header": { "alias": "header"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "message": { "alias": "message"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "maskStyleClass": { "alias": "maskStyleClass"; "required": false; "isSignal": true; }; "acceptIcon": { "alias": "acceptIcon"; "required": false; "isSignal": true; }; "acceptLabel": { "alias": "acceptLabel"; "required": false; "isSignal": true; }; "acceptAriaLabel": { "alias": "acceptAriaLabel"; "required": false; "isSignal": true; }; "acceptVisible": { "alias": "acceptVisible"; "required": false; "isSignal": true; }; "acceptButtonStyleClass": { "alias": "acceptButtonStyleClass"; "required": false; "isSignal": true; }; "rejectIcon": { "alias": "rejectIcon"; "required": false; "isSignal": true; }; "rejectLabel": { "alias": "rejectLabel"; "required": false; "isSignal": true; }; "rejectAriaLabel": { "alias": "rejectAriaLabel"; "required": false; "isSignal": true; }; "rejectVisible": { "alias": "rejectVisible"; "required": false; "isSignal": true; }; "rejectButtonStyleClass": { "alias": "rejectButtonStyleClass"; "required": false; "isSignal": true; }; "closable": { "alias": "closable"; "required": false; "isSignal": true; }; "closeAriaLabel": { "alias": "closeAriaLabel"; "required": false; "isSignal": true; }; "closeOnEscape": { "alias": "closeOnEscape"; "required": false; "isSignal": true; }; "dismissableMask": { "alias": "dismissableMask"; "required": false; "isSignal": true; }; "blockScroll": { "alias": "blockScroll"; "required": false; "isSignal": true; }; "rtl": { "alias": "rtl"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "key": { "alias": "key"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; "focusTrap": { "alias": "focusTrap"; "required": false; "isSignal": true; }; "defaultFocus": { "alias": "defaultFocus"; "required": false; "isSignal": true; }; "breakpoints": { "alias": "breakpoints"; "required": false; "isSignal": true; }; "visible": { "alias": "visible"; "required": false; "isSignal": true; }; "position": { "alias": "position"; "required": false; "isSignal": true; }; }, { "onHide": "onHide"; }, ["headerTemplate", "footerTemplate", "messageTemplate", "iconTemplate", "acceptIconTemplate", "rejectIconTemplate", "closeIconTemplate"], never, true, never>;
}

declare class CmmConfirmpopupComponent {
    confirmationService: ConfirmationService;
    key: _angular_core.InputSignal<string | undefined>;
    defaultFocus: _angular_core.InputSignal<"none" | "accept" | "reject">;
    acceptButtonStyleClass: _angular_core.InputSignal<string>;
    rejectButtonStyleClass: _angular_core.InputSignal<string>;
    acceptIcon: _angular_core.InputSignal<string>;
    rejectIcon: _angular_core.InputSignal<string>;
    acceptLabel: _angular_core.InputSignal<string>;
    rejectLabel: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    constructor(confirmationService: ConfirmationService);
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmConfirmpopupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmConfirmpopupComponent, "cmm-confirmpopup", never, { "key": { "alias": "key"; "required": false; "isSignal": true; }; "defaultFocus": { "alias": "defaultFocus"; "required": false; "isSignal": true; }; "acceptButtonStyleClass": { "alias": "acceptButtonStyleClass"; "required": false; "isSignal": true; }; "rejectButtonStyleClass": { "alias": "rejectButtonStyleClass"; "required": false; "isSignal": true; }; "acceptIcon": { "alias": "acceptIcon"; "required": false; "isSignal": true; }; "rejectIcon": { "alias": "rejectIcon"; "required": false; "isSignal": true; }; "acceptLabel": { "alias": "acceptLabel"; "required": false; "isSignal": true; }; "rejectLabel": { "alias": "rejectLabel"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class CmmContextmenuComponent {
    contextMenu: _angular_core.Signal<ContextMenu | undefined>;
    id: _angular_core.InputSignal<string | undefined>;
    model: _angular_core.InputSignal<MenuItem[]>;
    triggerEvent: _angular_core.InputSignal<string>;
    target: _angular_core.InputSignal<any>;
    global: _angular_core.InputSignal<boolean>;
    appendTo: _angular_core.InputSignal<any>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    breakpoint: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    pressDelay: _angular_core.InputSignal<number>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    submenuIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onShow: _angular_core.OutputEmitterRef<any>;
    onHide: _angular_core.OutputEmitterRef<void>;
    show(event: Event): void;
    hide(): void;
    toggle(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmContextmenuComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmContextmenuComponent, "cmm-contextmenu", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "model": { "alias": "model"; "required": false; "isSignal": true; }; "triggerEvent": { "alias": "triggerEvent"; "required": false; "isSignal": true; }; "target": { "alias": "target"; "required": false; "isSignal": true; }; "global": { "alias": "global"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "breakpoint": { "alias": "breakpoint"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "pressDelay": { "alias": "pressDelay"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, { "onShow": "onShow"; "onHide": "onHide"; }, ["itemTemplate", "submenuIconTemplate"], never, true, never>;
}

type DataViewLayout = 'list' | 'grid';
type DataViewPaginatorPosition = 'top' | 'bottom' | 'both';
interface DataViewPageEvent {
    first: number;
    rows: number;
}
interface DataViewLazyLoadEvent extends DataViewPageEvent {
    sortField?: string;
    sortOrder?: number;
}
interface DataViewSortEvent {
    sortField: string;
    sortOrder: number;
}
interface DataViewLayoutChangeEvent {
    layout: DataViewLayout;
}

declare class CmmDataviewComponent {
    layout: _angular_core.ModelSignal<DataViewLayout>;
    value: _angular_core.InputSignal<any[] | undefined>;
    paginator: _angular_core.InputSignal<boolean>;
    rows: _angular_core.InputSignal<number | undefined>;
    totalRecords: _angular_core.InputSignal<number | undefined>;
    pageLinks: _angular_core.InputSignal<number>;
    rowsPerPageOptions: _angular_core.InputSignal<any[] | undefined>;
    paginatorPosition: _angular_core.InputSignal<DataViewPaginatorPosition>;
    paginatorStyleClass: _angular_core.InputSignal<string | undefined>;
    alwaysShowPaginator: _angular_core.InputSignal<boolean>;
    paginatorDropdownAppendTo: _angular_core.InputSignal<any>;
    paginatorDropdownScrollHeight: _angular_core.InputSignal<string>;
    currentPageReportTemplate: _angular_core.InputSignal<string>;
    showCurrentPageReport: _angular_core.InputSignal<boolean>;
    showJumpToPageDropdown: _angular_core.InputSignal<boolean>;
    showFirstLastIcon: _angular_core.InputSignal<boolean>;
    showPageLinks: _angular_core.InputSignal<boolean>;
    lazy: _angular_core.InputSignal<boolean>;
    lazyLoadOnInit: _angular_core.InputSignal<boolean>;
    emptyMessage: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    gridStyleClass: _angular_core.InputSignal<string>;
    trackBy: _angular_core.InputSignal<Function | undefined>;
    filterBy: _angular_core.InputSignal<string | undefined>;
    filterLocale: _angular_core.InputSignal<string | undefined>;
    loading: _angular_core.InputSignal<boolean>;
    loadingIcon: _angular_core.InputSignal<string | undefined>;
    first: _angular_core.InputSignal<number>;
    sortField: _angular_core.InputSignal<string | undefined>;
    sortOrder: _angular_core.InputSignal<number | undefined>;
    onPage: _angular_core.OutputEmitterRef<DataViewPageEvent>;
    onLazyLoad: _angular_core.OutputEmitterRef<DataViewLazyLoadEvent>;
    onSort: _angular_core.OutputEmitterRef<DataViewSortEvent>;
    onChangeLayout: _angular_core.OutputEmitterRef<DataViewLayoutChangeEvent>;
    listTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    gridTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatorleftTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatorrightTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    paginatordropdownitemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    loadingiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    listiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    gridiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    handlePage(event: DataViewPageEvent): void;
    handleLazyLoad(event: DataViewLazyLoadEvent): void;
    handleSort(event: DataViewSortEvent): void;
    handleChangeLayout(event: DataViewLayoutChangeEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDataviewComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmDataviewComponent, "cmm-dataview", never, { "layout": { "alias": "layout"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "paginator": { "alias": "paginator"; "required": false; "isSignal": true; }; "rows": { "alias": "rows"; "required": false; "isSignal": true; }; "totalRecords": { "alias": "totalRecords"; "required": false; "isSignal": true; }; "pageLinks": { "alias": "pageLinks"; "required": false; "isSignal": true; }; "rowsPerPageOptions": { "alias": "rowsPerPageOptions"; "required": false; "isSignal": true; }; "paginatorPosition": { "alias": "paginatorPosition"; "required": false; "isSignal": true; }; "paginatorStyleClass": { "alias": "paginatorStyleClass"; "required": false; "isSignal": true; }; "alwaysShowPaginator": { "alias": "alwaysShowPaginator"; "required": false; "isSignal": true; }; "paginatorDropdownAppendTo": { "alias": "paginatorDropdownAppendTo"; "required": false; "isSignal": true; }; "paginatorDropdownScrollHeight": { "alias": "paginatorDropdownScrollHeight"; "required": false; "isSignal": true; }; "currentPageReportTemplate": { "alias": "currentPageReportTemplate"; "required": false; "isSignal": true; }; "showCurrentPageReport": { "alias": "showCurrentPageReport"; "required": false; "isSignal": true; }; "showJumpToPageDropdown": { "alias": "showJumpToPageDropdown"; "required": false; "isSignal": true; }; "showFirstLastIcon": { "alias": "showFirstLastIcon"; "required": false; "isSignal": true; }; "showPageLinks": { "alias": "showPageLinks"; "required": false; "isSignal": true; }; "lazy": { "alias": "lazy"; "required": false; "isSignal": true; }; "lazyLoadOnInit": { "alias": "lazyLoadOnInit"; "required": false; "isSignal": true; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "gridStyleClass": { "alias": "gridStyleClass"; "required": false; "isSignal": true; }; "trackBy": { "alias": "trackBy"; "required": false; "isSignal": true; }; "filterBy": { "alias": "filterBy"; "required": false; "isSignal": true; }; "filterLocale": { "alias": "filterLocale"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "loadingIcon": { "alias": "loadingIcon"; "required": false; "isSignal": true; }; "first": { "alias": "first"; "required": false; "isSignal": true; }; "sortField": { "alias": "sortField"; "required": false; "isSignal": true; }; "sortOrder": { "alias": "sortOrder"; "required": false; "isSignal": true; }; }, { "layout": "layoutChange"; "onPage": "onPage"; "onLazyLoad": "onLazyLoad"; "onSort": "onSort"; "onChangeLayout": "onChangeLayout"; }, ["listTemplate", "gridTemplate", "headerTemplate", "footerTemplate", "emptyTemplate", "paginatorleftTemplate", "paginatorrightTemplate", "paginatordropdownitemTemplate", "loadingiconTemplate", "listiconTemplate", "gridiconTemplate"], never, true, never>;
}

declare class CmmTabComponent {
    value: _angular_core.ModelSignal<string | number | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTabComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTabComponent, "cmm-tab", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, ["*"], true, never>;
}

declare class CmmTabListComponent {
    previcon: _angular_core.Signal<TemplateRef<any> | undefined>;
    nexticon: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTabListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTabListComponent, "cmm-tablist", never, {}, {}, ["previcon", "nexticon"], ["[previcon]", "[nexticon]", "*"], true, never>;
}

declare class CmmTabPanelComponent {
    value: _angular_core.ModelSignal<string | number | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTabPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTabPanelComponent, "cmm-tabpanel", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, ["*"], true, never>;
}

type KnobSize = 'small' | 'large';

declare class CmmKnobComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<number>;
    min: _angular_core.InputSignal<number>;
    max: _angular_core.InputSignal<number>;
    step: _angular_core.InputSignal<number>;
    disabled: _angular_core.InputSignal<boolean>;
    readonly: _angular_core.InputSignal<boolean>;
    showValue: _angular_core.InputSignal<boolean>;
    valueTemplate: _angular_core.InputSignal<string>;
    size: _angular_core.InputSignal<KnobSize | undefined>;
    knobSize: _angular_core.InputSignal<number>;
    strokeWidth: _angular_core.InputSignal<number>;
    textColor: _angular_core.InputSignal<string>;
    valueColor: _angular_core.InputSignal<string>;
    rangeColor: _angular_core.InputSignal<string>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    onChange: _angular_core.OutputEmitterRef<{
        value: number;
    }>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: number): void;
    registerOnChange(fn: (value: number) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmKnobComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmKnobComponent, "cmm-knob", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "step": { "alias": "step"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "showValue": { "alias": "showValue"; "required": false; "isSignal": true; }; "valueTemplate": { "alias": "valueTemplate"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "knobSize": { "alias": "knobSize"; "required": false; "isSignal": true; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; "isSignal": true; }; "textColor": { "alias": "textColor"; "required": false; "isSignal": true; }; "valueColor": { "alias": "valueColor"; "required": false; "isSignal": true; }; "rangeColor": { "alias": "rangeColor"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; }, never, never, true, never>;
}

type DialogPosition = 'center' | 'right' | 'left' | 'top' | 'bottom' | 'topleft' | 'bottomleft' | 'topright' | 'bottomright';
interface DialogMaximizeEvent {
    value: any;
}

declare class CmmDialogComponent {
    visible: _angular_core.ModelSignal<boolean>;
    header: _angular_core.InputSignal<string | undefined>;
    draggable: _angular_core.InputSignal<boolean>;
    resizable: _angular_core.InputSignal<boolean>;
    contentStyle: _angular_core.InputSignal<any>;
    contentStyleClass: _angular_core.InputSignal<string | undefined>;
    modal: _angular_core.InputSignal<boolean>;
    closeOnEscape: _angular_core.InputSignal<boolean>;
    dismissableMask: _angular_core.InputSignal<boolean>;
    rtl: _angular_core.InputSignal<boolean>;
    closable: _angular_core.InputSignal<boolean>;
    appendTo: _angular_core.InputSignal<unknown>;
    breakpoints: _angular_core.InputSignal<any>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    maskStyleClass: _angular_core.InputSignal<string | undefined>;
    maskStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    showHeader: _angular_core.InputSignal<boolean>;
    blockScroll: _angular_core.InputSignal<boolean>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    minX: _angular_core.InputSignal<number>;
    minY: _angular_core.InputSignal<number>;
    focusOnShow: _angular_core.InputSignal<boolean>;
    maximizable: _angular_core.InputSignal<boolean>;
    keepInViewport: _angular_core.InputSignal<boolean>;
    focusTrap: _angular_core.InputSignal<boolean>;
    transitionOptions: _angular_core.InputSignal<string>;
    closeIcon: _angular_core.InputSignal<string | undefined>;
    closeAriaLabel: _angular_core.InputSignal<string | undefined>;
    closeTabindex: _angular_core.InputSignal<string>;
    minimizeIcon: _angular_core.InputSignal<string | undefined>;
    maximizeIcon: _angular_core.InputSignal<string | undefined>;
    closeButtonProps: _angular_core.InputSignal<any>;
    maximizeButtonProps: _angular_core.InputSignal<any>;
    style: _angular_core.InputSignal<any>;
    position: _angular_core.InputSignal<DialogPosition | undefined>;
    positionLeft: _angular_core.InputSignal<number | undefined>;
    positionTop: _angular_core.InputSignal<number | undefined>;
    responsive: _angular_core.InputSignal<boolean | undefined>;
    breakpoint: _angular_core.InputSignal<number | undefined>;
    onShow: _angular_core.OutputEmitterRef<any>;
    onHide: _angular_core.OutputEmitterRef<any>;
    onResizeInit: _angular_core.OutputEmitterRef<MouseEvent>;
    onResizeEnd: _angular_core.OutputEmitterRef<MouseEvent>;
    onDragEnd: _angular_core.OutputEmitterRef<DragEvent>;
    onMaximize: _angular_core.OutputEmitterRef<DialogMaximizeEvent>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    closeiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    maximizeiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    minimizeiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headlessTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    handleShow(event: any): void;
    handleHide(event: any): void;
    handleResizeInit(event: MouseEvent): void;
    handleResizeEnd(event: MouseEvent): void;
    handleDragEnd(event: DragEvent): void;
    handleMaximize(event: any): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmDialogComponent, "cmm-dialog", never, { "visible": { "alias": "visible"; "required": false; "isSignal": true; }; "header": { "alias": "header"; "required": false; "isSignal": true; }; "draggable": { "alias": "draggable"; "required": false; "isSignal": true; }; "resizable": { "alias": "resizable"; "required": false; "isSignal": true; }; "contentStyle": { "alias": "contentStyle"; "required": false; "isSignal": true; }; "contentStyleClass": { "alias": "contentStyleClass"; "required": false; "isSignal": true; }; "modal": { "alias": "modal"; "required": false; "isSignal": true; }; "closeOnEscape": { "alias": "closeOnEscape"; "required": false; "isSignal": true; }; "dismissableMask": { "alias": "dismissableMask"; "required": false; "isSignal": true; }; "rtl": { "alias": "rtl"; "required": false; "isSignal": true; }; "closable": { "alias": "closable"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "breakpoints": { "alias": "breakpoints"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "maskStyleClass": { "alias": "maskStyleClass"; "required": false; "isSignal": true; }; "maskStyle": { "alias": "maskStyle"; "required": false; "isSignal": true; }; "showHeader": { "alias": "showHeader"; "required": false; "isSignal": true; }; "blockScroll": { "alias": "blockScroll"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "minX": { "alias": "minX"; "required": false; "isSignal": true; }; "minY": { "alias": "minY"; "required": false; "isSignal": true; }; "focusOnShow": { "alias": "focusOnShow"; "required": false; "isSignal": true; }; "maximizable": { "alias": "maximizable"; "required": false; "isSignal": true; }; "keepInViewport": { "alias": "keepInViewport"; "required": false; "isSignal": true; }; "focusTrap": { "alias": "focusTrap"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; "closeIcon": { "alias": "closeIcon"; "required": false; "isSignal": true; }; "closeAriaLabel": { "alias": "closeAriaLabel"; "required": false; "isSignal": true; }; "closeTabindex": { "alias": "closeTabindex"; "required": false; "isSignal": true; }; "minimizeIcon": { "alias": "minimizeIcon"; "required": false; "isSignal": true; }; "maximizeIcon": { "alias": "maximizeIcon"; "required": false; "isSignal": true; }; "closeButtonProps": { "alias": "closeButtonProps"; "required": false; "isSignal": true; }; "maximizeButtonProps": { "alias": "maximizeButtonProps"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "position": { "alias": "position"; "required": false; "isSignal": true; }; "positionLeft": { "alias": "positionLeft"; "required": false; "isSignal": true; }; "positionTop": { "alias": "positionTop"; "required": false; "isSignal": true; }; "responsive": { "alias": "responsive"; "required": false; "isSignal": true; }; "breakpoint": { "alias": "breakpoint"; "required": false; "isSignal": true; }; }, { "visible": "visibleChange"; "onShow": "onShow"; "onHide": "onHide"; "onResizeInit": "onResizeInit"; "onResizeEnd": "onResizeEnd"; "onDragEnd": "onDragEnd"; "onMaximize": "onMaximize"; }, ["headerTemplate", "contentTemplate", "footerTemplate", "closeiconTemplate", "maximizeiconTemplate", "minimizeiconTemplate", "headlessTemplate"], ["*"], true, never>;
}

type DividerAlign = 'left' | 'center' | 'right' | 'top' | 'center' | 'bottom';
type DividerLayout = 'horizontal' | 'vertical';
type DividerType = 'solid' | 'dashed' | 'dotted';

declare class CmmDividerComponent {
    layout: _angular_core.InputSignal<DividerLayout>;
    align: _angular_core.InputSignal<DividerAlign>;
    type: _angular_core.InputSignal<DividerType>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDividerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmDividerComponent, "cmm-divider", never, { "layout": { "alias": "layout"; "required": false; "isSignal": true; }; "align": { "alias": "align"; "required": false; "isSignal": true; }; "type": { "alias": "type"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, ["contentTemplate"], ["*"], true, never>;
}

declare class CmmAvatarComponent {
    label: _angular_core.InputSignal<string>;
    icon: _angular_core.InputSignal<string>;
    image: _angular_core.InputSignal<string>;
    size: _angular_core.InputSignal<"large" | "normal" | "xlarge">;
    shape: _angular_core.InputSignal<"circle" | "square">;
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    imageAlt: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string>;
    ariaLabelledBy: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    onImageError: _angular_core.OutputEmitterRef<Event>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    computedStyleClass: _angular_core.Signal<string>;
    handleImageError(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmAvatarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmAvatarComponent, "cmm-avatar", ["cmmavatar"], { "label": { "alias": "label"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "image": { "alias": "image"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "shape": { "alias": "shape"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "imageAlt": { "alias": "imageAlt"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, { "onImageError": "onImageError"; }, ["contentTemplate"], never, true, never>;
}

declare class CmmAvatarGroupComponent {
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    computedStyleClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmAvatarGroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmAvatarGroupComponent, "cmm-avatar-group", ["cmmavatargroup"], { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class CmmBadgeComponent {
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    badgeSize: _angular_core.InputSignal<"small" | "large" | "xlarge" | undefined>;
    severity: _angular_core.InputSignal<"danger" | "primary" | "secondary" | "success" | "info" | "help" | "contrast" | "warn" | undefined>;
    value: _angular_core.InputSignal<string | number>;
    disabled: _angular_core.InputSignal<boolean>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    computedStyleClass: _angular_core.Signal<string>;
    getSeverity(): any;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmBadgeComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmBadgeComponent, "cmm-badge", ["cmmbadge"], { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "badgeSize": { "alias": "badgeSize"; "required": false; "isSignal": true; }; "severity": { "alias": "severity"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class CmmTabPanelsComponent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTabPanelsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTabPanelsComponent, "cmm-tabpanels", never, {}, {}, never, ["*"], true, never>;
}

declare class CmmTabsComponent {
    value: _angular_core.ModelSignal<string | number | undefined>;
    scrollable: _angular_core.InputSignal<boolean>;
    lazy: _angular_core.InputSignal<boolean>;
    selectOnFocus: _angular_core.InputSignal<boolean>;
    showNavigators: _angular_core.InputSignal<boolean>;
    tabindex: _angular_core.InputSignal<number>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTabsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTabsComponent, "cmm-tabs", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "scrollable": { "alias": "scrollable"; "required": false; "isSignal": true; }; "lazy": { "alias": "lazy"; "required": false; "isSignal": true; }; "selectOnFocus": { "alias": "selectOnFocus"; "required": false; "isSignal": true; }; "showNavigators": { "alias": "showNavigators"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, ["*"], true, never>;
}

declare class CmmTagComponent {
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string>;
    severity: _angular_core.InputSignal<"danger" | "secondary" | "success" | "info" | "contrast" | "warn" | undefined>;
    value: _angular_core.InputSignal<string | undefined>;
    icon: _angular_core.InputSignal<string | undefined>;
    rounded: _angular_core.InputSignal<boolean>;
    iconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTagComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTagComponent, "cmm-tag", never, { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "severity": { "alias": "severity"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "rounded": { "alias": "rounded"; "required": false; "isSignal": true; }; }, {}, ["iconTemplate"], ["*"], true, never>;
}

type ListboxVariant = 'outlined' | 'filled';
type ListboxFilterMatchMode = 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals';

declare class CmmListboxComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<any>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    groupTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyFilterTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    options: _angular_core.InputSignal<any[]>;
    optionLabel: _angular_core.InputSignal<string>;
    optionValue: _angular_core.InputSignal<string>;
    optionDisabled: _angular_core.InputSignal<string>;
    optionGroupLabel: _angular_core.InputSignal<string>;
    optionGroupChildren: _angular_core.InputSignal<string>;
    group: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    readonly: _angular_core.InputSignal<boolean>;
    multiple: _angular_core.InputSignal<boolean>;
    checkbox: _angular_core.InputSignal<boolean>;
    filter: _angular_core.InputSignal<boolean>;
    filterMatchMode: _angular_core.InputSignal<ListboxFilterMatchMode>;
    filterPlaceHolder: _angular_core.InputSignal<string | undefined>;
    filterLocale: _angular_core.InputSignal<string | undefined>;
    variant: _angular_core.InputSignal<ListboxVariant>;
    listStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    listStyleClass: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    emptyMessage: _angular_core.InputSignal<string | undefined>;
    emptyFilterMessage: _angular_core.InputSignal<string | undefined>;
    striped: _angular_core.InputSignal<boolean>;
    showToggleAll: _angular_core.InputSignal<boolean>;
    filterBy: _angular_core.InputSignal<string | undefined>;
    dataKey: _angular_core.InputSignal<string | undefined>;
    onChange: _angular_core.OutputEmitterRef<ListboxChangeEvent>;
    onFilter: _angular_core.OutputEmitterRef<ListboxFilterEvent>;
    onClick: _angular_core.OutputEmitterRef<ListboxClickEvent>;
    onDblClick: _angular_core.OutputEmitterRef<ListboxDoubleClickEvent>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleChange(event: ListboxChangeEvent): void;
    handleFilter(event: ListboxFilterEvent): void;
    handleClick(event: ListboxClickEvent): void;
    handleDoubleClick(event: ListboxDoubleClickEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmListboxComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmListboxComponent, "cmm-listbox", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; "optionLabel": { "alias": "optionLabel"; "required": false; "isSignal": true; }; "optionValue": { "alias": "optionValue"; "required": false; "isSignal": true; }; "optionDisabled": { "alias": "optionDisabled"; "required": false; "isSignal": true; }; "optionGroupLabel": { "alias": "optionGroupLabel"; "required": false; "isSignal": true; }; "optionGroupChildren": { "alias": "optionGroupChildren"; "required": false; "isSignal": true; }; "group": { "alias": "group"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "checkbox": { "alias": "checkbox"; "required": false; "isSignal": true; }; "filter": { "alias": "filter"; "required": false; "isSignal": true; }; "filterMatchMode": { "alias": "filterMatchMode"; "required": false; "isSignal": true; }; "filterPlaceHolder": { "alias": "filterPlaceHolder"; "required": false; "isSignal": true; }; "filterLocale": { "alias": "filterLocale"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "listStyle": { "alias": "listStyle"; "required": false; "isSignal": true; }; "listStyleClass": { "alias": "listStyleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; "isSignal": true; }; "emptyFilterMessage": { "alias": "emptyFilterMessage"; "required": false; "isSignal": true; }; "striped": { "alias": "striped"; "required": false; "isSignal": true; }; "showToggleAll": { "alias": "showToggleAll"; "required": false; "isSignal": true; }; "filterBy": { "alias": "filterBy"; "required": false; "isSignal": true; }; "dataKey": { "alias": "dataKey"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onChange": "onChange"; "onFilter": "onFilter"; "onClick": "onClick"; "onDblClick": "onDblClick"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["itemTemplate", "groupTemplate", "headerTemplate", "footerTemplate", "emptyTemplate", "emptyFilterTemplate"], never, true, never>;
}

/**
 * Terminal is a text based user interface.
 * Wraps PrimeNG Terminal component.
 */
declare class CmmTerminalComponent {
    /**
     * Initial text to display on terminal
     */
    welcomeMessage: _angular_core.InputSignal<string>;
    /**
     * Prompt text for each command
     */
    prompt: _angular_core.InputSignal<string>;
    /**
     * Inline style of the component
     */
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    /**
     * Style class of the component
     */
    styleClass: _angular_core.InputSignal<string | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTerminalComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmTerminalComponent, "cmm-terminal", never, { "welcomeMessage": { "alias": "welcomeMessage"; "required": false; "isSignal": true; }; "prompt": { "alias": "prompt"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

type MegaMenuOrientation = 'horizontal' | 'vertical';

declare class CmmMegamenuComponent {
    id: _angular_core.InputSignal<string | undefined>;
    model: _angular_core.InputSignal<MegaMenuItem[]>;
    orientation: _angular_core.InputSignal<MegaMenuOrientation>;
    breakpoint: _angular_core.InputSignal<string>;
    scrollHeight: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    tabindex: _angular_core.InputSignal<number>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    startTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    endTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    menuIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    submenuIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    buttonTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    buttonIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmMegamenuComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmMegamenuComponent, "cmm-megamenu", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "model": { "alias": "model"; "required": false; "isSignal": true; }; "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "breakpoint": { "alias": "breakpoint"; "required": false; "isSignal": true; }; "scrollHeight": { "alias": "scrollHeight"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; }, {}, ["startTemplate", "endTemplate", "menuIconTemplate", "submenuIconTemplate", "itemTemplate", "buttonTemplate", "buttonIconTemplate"], never, true, never>;
}

type DockPosition = 'bottom' | 'top' | 'left' | 'right';
interface DockItem extends MenuItem {
    icon?: string;
    label?: string;
    command?: () => void;
}

declare class CmmDockComponent {
    id: _angular_core.InputSignal<string | undefined>;
    model: _angular_core.InputSignal<DockItem[]>;
    position: _angular_core.InputSignal<DockPosition>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    onFocus: _angular_core.OutputEmitterRef<FocusEvent>;
    onBlur: _angular_core.OutputEmitterRef<FocusEvent>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDockComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmDockComponent, "cmm-dock", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "model": { "alias": "model"; "required": false; "isSignal": true; }; "position": { "alias": "position"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; }, { "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["itemTemplate"], never, true, never>;
}

declare class CmmProgressSpinnerComponent {
    styleClass: _angular_core.InputSignal<string>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    strokeWidth: _angular_core.InputSignal<string>;
    fill: _angular_core.InputSignal<string>;
    animationDuration: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmProgressSpinnerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmProgressSpinnerComponent, "cmm-progressspinner", never, { "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; "isSignal": true; }; "fill": { "alias": "fill"; "required": false; "isSignal": true; }; "animationDuration": { "alias": "animationDuration"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class CmmMenuComponent {
    model: _angular_core.InputSignal<MenuItem[]>;
    popup: _angular_core.InputSignal<boolean>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string>;
    appendTo: _angular_core.InputSignal<unknown>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    showTransitionOptions: _angular_core.InputSignal<string>;
    hideTransitionOptions: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    id: _angular_core.InputSignal<string | undefined>;
    tabindex: _angular_core.InputSignal<number>;
    onShow: _angular_core.OutputEmitterRef<any>;
    onHide: _angular_core.OutputEmitterRef<any>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    startTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    endTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    submenuHeaderTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    menuRef: _angular_core.Signal<Menu | undefined>;
    toggle(event: Event): void;
    show(event: any): void;
    hide(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmMenuComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmMenuComponent, "cmm-menu", never, { "model": { "alias": "model"; "required": false; "isSignal": true; }; "popup": { "alias": "popup"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; }, { "onShow": "onShow"; "onHide": "onHide"; "onBlur": "onBlur"; "onFocus": "onFocus"; }, ["startTemplate", "endTemplate", "headerTemplate", "itemTemplate", "submenuHeaderTemplate"], never, true, never>;
}

declare class CmmMenubarComponent {
    model: _angular_core.InputSignal<MenuItem[]>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    autoDisplay: _angular_core.InputSignal<boolean>;
    autoHide: _angular_core.InputSignal<boolean>;
    breakpoint: _angular_core.InputSignal<string>;
    autoHideDelay: _angular_core.InputSignal<number>;
    id: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    onFocus: _angular_core.OutputEmitterRef<FocusEvent>;
    onBlur: _angular_core.OutputEmitterRef<FocusEvent>;
    startTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    endTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    itemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    menuIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    submenuIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmMenubarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmMenubarComponent, "cmm-menubar", never, { "model": { "alias": "model"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "autoDisplay": { "alias": "autoDisplay"; "required": false; "isSignal": true; }; "autoHide": { "alias": "autoHide"; "required": false; "isSignal": true; }; "breakpoint": { "alias": "breakpoint"; "required": false; "isSignal": true; }; "autoHideDelay": { "alias": "autoHideDelay"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; }, { "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["startTemplate", "endTemplate", "itemTemplate", "menuIconTemplate", "submenuIconTemplate"], never, true, never>;
}

type RadioButtonVariant = 'outlined' | 'filled';
type RadioButtonSize = 'small' | 'large';

declare class CmmRadiobuttonComponent implements ControlValueAccessor {
    value: _angular_core.ModelSignal<any>;
    optionValue: _angular_core.ModelSignal<any>;
    name: _angular_core.InputSignal<string>;
    disabled: _angular_core.ModelSignal<boolean>;
    variant: _angular_core.InputSignal<RadioButtonVariant>;
    size: _angular_core.InputSignal<RadioButtonSize | undefined>;
    tabindex: _angular_core.InputSignal<number>;
    inputId: _angular_core.InputSignal<string>;
    ariaLabelledBy: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    autofocus: _angular_core.InputSignal<boolean>;
    onClick: _angular_core.OutputEmitterRef<RadioButtonClickEvent>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    private onChangeFn;
    private onTouchedFn;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    handleClick(event: RadioButtonClickEvent): void;
    handleFocus(event: Event): void;
    handleBlur(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmRadiobuttonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmRadiobuttonComponent, "cmm-radiobutton, div[cmm-radiobutton]", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "optionValue": { "alias": "optionValue"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "tabindex": { "alias": "tabindex"; "required": false; "isSignal": true; }; "inputId": { "alias": "inputId"; "required": false; "isSignal": true; }; "ariaLabelledBy": { "alias": "ariaLabelledBy"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "optionValue": "optionValueChange"; "disabled": "disabledChange"; "onClick": "onClick"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, never, never, true, never>;
}

type DrawerPosition = 'left' | 'right' | 'bottom' | 'top';

declare class CmmDrawerComponent {
    visible: _angular_core.ModelSignal<boolean>;
    header: _angular_core.InputSignal<string | undefined>;
    position: _angular_core.InputSignal<DrawerPosition>;
    appendTo: _angular_core.InputSignal<any>;
    blockScroll: _angular_core.InputSignal<boolean>;
    style: _angular_core.InputSignal<Record<string, any> | undefined>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    ariaCloseLabel: _angular_core.InputSignal<string | undefined>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    modal: _angular_core.InputSignal<boolean>;
    closeButtonProps: _angular_core.InputSignal<any>;
    dismissible: _angular_core.InputSignal<boolean>;
    showCloseIcon: _angular_core.InputSignal<boolean>;
    closeOnEscape: _angular_core.InputSignal<boolean>;
    transitionOptions: _angular_core.InputSignal<string>;
    fullScreen: _angular_core.InputSignal<boolean | undefined>;
    maskStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    closable: _angular_core.InputSignal<boolean>;
    onShow: _angular_core.OutputEmitterRef<any>;
    onHide: _angular_core.OutputEmitterRef<any>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    closeiconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headlessTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    handleShow(event: any): void;
    handleHide(event: any): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDrawerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmDrawerComponent, "cmm-drawer", never, { "visible": { "alias": "visible"; "required": false; "isSignal": true; }; "header": { "alias": "header"; "required": false; "isSignal": true; }; "position": { "alias": "position"; "required": false; "isSignal": true; }; "appendTo": { "alias": "appendTo"; "required": false; "isSignal": true; }; "blockScroll": { "alias": "blockScroll"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "ariaCloseLabel": { "alias": "ariaCloseLabel"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "modal": { "alias": "modal"; "required": false; "isSignal": true; }; "closeButtonProps": { "alias": "closeButtonProps"; "required": false; "isSignal": true; }; "dismissible": { "alias": "dismissible"; "required": false; "isSignal": true; }; "showCloseIcon": { "alias": "showCloseIcon"; "required": false; "isSignal": true; }; "closeOnEscape": { "alias": "closeOnEscape"; "required": false; "isSignal": true; }; "transitionOptions": { "alias": "transitionOptions"; "required": false; "isSignal": true; }; "fullScreen": { "alias": "fullScreen"; "required": false; "isSignal": true; }; "maskStyle": { "alias": "maskStyle"; "required": false; "isSignal": true; }; "closable": { "alias": "closable"; "required": false; "isSignal": true; }; }, { "visible": "visibleChange"; "onShow": "onShow"; "onHide": "onHide"; }, ["headerTemplate", "footerTemplate", "contentTemplate", "closeiconTemplate", "headlessTemplate"], ["*"], true, never>;
}

interface RatingRateEvent {
    originalEvent: Event;
    value: number | undefined;
}
declare class CmmRatingComponent {
    disabled: _angular_core.InputSignal<boolean>;
    readonly: _angular_core.InputSignal<boolean>;
    stars: _angular_core.InputSignal<number>;
    iconOnClass: _angular_core.InputSignal<string | undefined>;
    iconOnStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    iconOffClass: _angular_core.InputSignal<string | undefined>;
    iconOffStyle: _angular_core.InputSignal<Record<string, any> | undefined>;
    autofocus: _angular_core.InputSignal<boolean>;
    value: _angular_core.ModelSignal<number | undefined>;
    onRate: _angular_core.OutputEmitterRef<RatingRateEvent>;
    onCancel: _angular_core.OutputEmitterRef<Event>;
    onFocus: _angular_core.OutputEmitterRef<FocusEvent>;
    onBlur: _angular_core.OutputEmitterRef<FocusEvent>;
    onIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    offIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    cancelIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmRatingComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmRatingComponent, "cmm-rating", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "readonly": { "alias": "readonly"; "required": false; "isSignal": true; }; "stars": { "alias": "stars"; "required": false; "isSignal": true; }; "iconOnClass": { "alias": "iconOnClass"; "required": false; "isSignal": true; }; "iconOnStyle": { "alias": "iconOnStyle"; "required": false; "isSignal": true; }; "iconOffClass": { "alias": "iconOffClass"; "required": false; "isSignal": true; }; "iconOffStyle": { "alias": "iconOffStyle"; "required": false; "isSignal": true; }; "autofocus": { "alias": "autofocus"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "onRate": "onRate"; "onCancel": "onCancel"; "onFocus": "onFocus"; "onBlur": "onBlur"; }, ["onIconTemplate", "offIconTemplate", "cancelIconTemplate"], never, true, never>;
}

declare class CmmBaseComponent {
    style: _angular_core.InputSignal<{
        [klass: string]: any;
    } | null>;
    styleClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    computedStyleClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmBaseComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmBaseComponent, "cmm-base", ["cmmbase"], { "style": { "alias": "style"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

type KeyFilterPattern = 'pint' | 'int' | 'pnum' | 'num' | 'hex' | 'email' | 'alpha' | 'alphanum';

declare class CmmKeyfilterDirective {
    pKeyFilter: _angular_core.InputSignal<RegExp | KeyFilterPattern | undefined>;
    pValidateOnly: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmKeyfilterDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmKeyfilterDirective, "[cmmKeyFilter]", never, { "pKeyFilter": { "alias": "pKeyFilter"; "required": false; "isSignal": true; }; "pValidateOnly": { "alias": "pValidateOnly"; "required": false; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1.KeyFilter; inputs: { "pKeyFilter": "pKeyFilter"; "pValidateOnly": "pValidateOnly"; }; outputs: {}; }]>;
}

type TextareaVariant = 'outlined' | 'filled';
type TextareaSize = 'small' | 'large';

declare class CmmTextareaDirective {
    autoResize: _angular_core.InputSignal<boolean>;
    variant: _angular_core.InputSignal<TextareaVariant>;
    fluid: _angular_core.InputSignal<boolean>;
    size: _angular_core.InputSignal<TextareaSize | undefined>;
    onResize: _angular_core.OutputEmitterRef<Event>;
    get textareaClass(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTextareaDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmTextareaDirective, "textarea[cmmTextarea]", never, { "autoResize": { "alias": "autoResize"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "fluid": { "alias": "fluid"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; }, { "onResize": "onResize"; }, never, never, true, [{ directive: typeof i1$1.Textarea; inputs: { "autoResize": "autoResize"; "variant": "variant"; "fluid": "fluid"; }; outputs: { "onResize": "onResize"; }; }]>;
}

declare class CmmAutoFocusDirective {
    private el;
    private cdr;
    cmmAutoFocus: _angular_core.InputSignal<boolean>;
    focusDelay: _angular_core.InputSignal<number>;
    selectOnFocus: _angular_core.InputSignal<boolean>;
    constructor();
    private applyFocus;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmAutoFocusDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmAutoFocusDirective, "[cmmAutoFocus]", ["cmmautofocus"], { "cmmAutoFocus": { "alias": "cmmAutoFocus"; "required": false; "isSignal": true; }; "focusDelay": { "alias": "focusDelay"; "required": false; "isSignal": true; }; "selectOnFocus": { "alias": "selectOnFocus"; "required": false; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1$2.AutoFocus; inputs: {}; outputs: {}; }]>;
}

declare class CmmTooltipDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTooltipDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmTooltipDirective, "[cmmTooltip]", never, {}, {}, never, never, true, [{ directive: typeof i11.Tooltip; inputs: { "pTooltip": "cmmTooltip"; "tooltipPosition": "tooltipPosition"; "tooltipEvent": "tooltipEvent"; "appendTo": "appendTo"; "positionStyle": "positionStyle"; "tooltipStyleClass": "tooltipStyleClass"; "tooltipZIndex": "tooltipZIndex"; "escape": "escape"; "showDelay": "showDelay"; "hideDelay": "hideDelay"; "life": "life"; "positionTop": "positionTop"; "positionLeft": "positionLeft"; "autoHide": "autoHide"; "fitContent": "fitContent"; "hideOnEscape": "hideOnEscape"; "tooltipOptions": "tooltipOptions"; }; outputs: {}; }]>;
}

declare class CmmBadgeDirective {
    cmmBadge: _angular_core.InputSignal<string | number>;
    value: _angular_core.InputSignal<string | number>;
    disabled: _angular_core.InputSignal<boolean>;
    badgeSize: _angular_core.InputSignal<"small" | "large" | "xlarge" | undefined>;
    severity: _angular_core.InputSignal<"danger" | "primary" | "secondary" | "success" | "info" | "help" | "contrast" | "warn" | undefined>;
    badgeClass: _angular_core.InputSignal<string>;
    variant: _angular_core.InputSignal<"outlined" | "filled">;
    customSize: _angular_core.InputSignal<"small" | "large" | "default">;
    computedBadgeClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmBadgeDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmBadgeDirective, "[cmmBadge]", ["cmmbadge"], { "cmmBadge": { "alias": "cmmBadge"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "badgeSize": { "alias": "badgeSize"; "required": false; "isSignal": true; }; "severity": { "alias": "severity"; "required": false; "isSignal": true; }; "badgeClass": { "alias": "badgeClass"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "customSize": { "alias": "customSize"; "required": false; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1$3.BadgeDirective; inputs: {}; outputs: {}; }]>;
}

type DragEffect = 'link' | 'none' | 'copy' | 'move' | 'copyLink' | 'copyMove' | 'linkMove' | 'all' | 'uninitialized';
type DropEffect = 'link' | 'none' | 'copy' | 'move';

declare class CmmDraggableDirective {
    private el;
    dragEffect: _angular_core.InputSignal<DragEffect>;
    dragHandle: _angular_core.InputSignal<string | undefined>;
    onDragStart: _angular_core.OutputEmitterRef<DragEvent>;
    onDragEnd: _angular_core.OutputEmitterRef<DragEvent>;
    onDrag: _angular_core.OutputEmitterRef<DragEvent>;
    constructor(el: ElementRef);
    handleDragStart(event: DragEvent): void;
    handleDrag(event: DragEvent): void;
    handleDragEnd(event: DragEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDraggableDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmDraggableDirective, "[cmmDraggable]", never, { "dragEffect": { "alias": "dragEffect"; "required": false; "isSignal": true; }; "dragHandle": { "alias": "dragHandle"; "required": false; "isSignal": true; }; }, { "onDragStart": "onDragStart"; "onDragEnd": "onDragEnd"; "onDrag": "onDrag"; }, never, never, true, never>;
}

declare class CmmDroppableDirective {
    disabled: _angular_core.InputSignal<boolean>;
    dropEffect: _angular_core.InputSignal<DropEffect>;
    onDragEnter: _angular_core.OutputEmitterRef<DragEvent>;
    onDragLeave: _angular_core.OutputEmitterRef<DragEvent>;
    onDrop: _angular_core.OutputEmitterRef<DragEvent>;
    handleDragEnter(event: DragEvent): void;
    handleDragOver(event: DragEvent): void;
    handleDragLeave(event: DragEvent): void;
    handleDrop(event: DragEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDroppableDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmDroppableDirective, "[cmmDroppable]", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "dropEffect": { "alias": "dropEffect"; "required": false; "isSignal": true; }; }, { "onDragEnter": "onDragEnter"; "onDragLeave": "onDragLeave"; "onDrop": "onDrop"; }, never, never, true, never>;
}

declare class CmmRippleDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmRippleDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmRippleDirective, "[cmmRipple]", never, {}, {}, never, never, true, [{ directive: typeof i1$4.Ripple; inputs: {}; outputs: {}; }]>;
}

type InputTextVariant = 'outlined' | 'filled';
type InputTextSize = 'small' | 'large';

declare class CmmInputText {
    variant: _angular_core.InputSignal<InputTextVariant>;
    fluid: _angular_core.InputSignal<boolean>;
    size: _angular_core.InputSignal<InputTextSize | undefined>;
    get inputTextClass(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmInputText, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmInputText, "input[cmmInputText]", never, { "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "fluid": { "alias": "fluid"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1$5.InputText; inputs: {}; outputs: {}; }]>;
}

/**
 * CmmZIndexUtilsService
 *
 * A wrapper service for PrimeNG's ZIndexUtils utility.
 * Provides z-index management for overlay components like dialogs, menus, and tooltips.
 *
 * This service helps manage stacking order of multiple overlay components,
 * ensuring they appear in the correct order based on when they were opened.
 */
declare class CmmZIndexUtilsService {
    /**
     * Get the current z-index value for an element
     * @param el - HTML element
     * @returns Current z-index
     */
    get(el: HTMLElement): number;
    /**
     * Set a custom z-index value
     * @param key - Optional key for the element
     * @param el - HTML element
     * @param baseZIndex - Base z-index value
     */
    set(key: string, el: HTMLElement, baseZIndex?: number): void;
    /**
     * Clear the z-index for a specific element
     * @param el - HTML element to clear
     */
    clear(el: HTMLElement): void;
    /**
     * Get the current z-index value
     * @returns Current z-index or undefined
     */
    getCurrent(): number;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmZIndexUtilsService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<CmmZIndexUtilsService>;
}

/**
 * BaseComponent size options
 */
declare const BASECOMPONENT_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type BaseComponentSize = (typeof BASECOMPONENT_SIZES)[keyof typeof BASECOMPONENT_SIZES];
/**
 * BaseComponent style variants
 */
declare const BASECOMPONENT_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type BaseComponentVariant = (typeof BASECOMPONENT_VARIANTS)[keyof typeof BASECOMPONENT_VARIANTS];

declare const TERMINAL_DEFAULTS: {
    readonly WELCOME_MESSAGE: "";
    readonly PROMPT: "";
};

interface CmmTerminalProps {
    welcomeMessage?: string;
    prompt?: string;
    style?: Record<string, any>;
    styleClass?: string;
}

/**
 * BlockableUI interface wrapper
 * Re-exports PrimeNG's BlockableUI interface for use in custom components
 */
interface BlockableUI {
    getBlockableElement(): HTMLElement;
}

declare const TEXTAREA_DEFAULTS: {
    readonly AUTO_RESIZE: false;
    readonly VARIANT: "outlined";
    readonly FLUID: false;
};

/**
 * BlockUI size options
 */
declare const BLOCK_UI_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type BlockUISize = (typeof BLOCK_UI_SIZES)[keyof typeof BLOCK_UI_SIZES];
/**
 * BlockUI style variants
 */
declare const BLOCK_UI_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type BlockUIVariant = (typeof BLOCK_UI_VARIANTS)[keyof typeof BLOCK_UI_VARIANTS];

/**
 * Breadcrumb size options
 */
declare const BREADCRUMB_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type BreadcrumbSize = (typeof BREADCRUMB_SIZES)[keyof typeof BREADCRUMB_SIZES];
/**
 * Breadcrumb spacing variants
 */
declare const BREADCRUMB_VARIANTS: {
    readonly DEFAULT: "default";
    readonly COMPACT: "compact";
    readonly SPACIOUS: "spacious";
};
type BreadcrumbVariant = (typeof BREADCRUMB_VARIANTS)[keyof typeof BREADCRUMB_VARIANTS];
/**
 * Common breadcrumb configurations
 */
declare const BREADCRUMB_EXAMPLES: {
    HOME_ONLY: () => MenuItem;
    BASIC_TRAIL: () => MenuItem[];
    WITH_ICONS: () => MenuItem[];
    WITH_URLS: () => MenuItem[];
};

declare const TIEREDMENU_DEFAULTS: {
    readonly POPUP: false;
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
};

declare const TIMELINE_DEFAULTS: {
    readonly LAYOUT: "vertical";
    readonly ALIGN: "left";
};

declare const CMM_MENUBAR_DEFAULTS: {
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
    readonly AUTO_DISPLAY: true;
    readonly AUTO_HIDE: false;
    readonly BREAKPOINT: "960px";
    readonly AUTO_HIDE_DELAY: 100;
    readonly STYLE_CLASS: "";
};
declare const CMM_MENUBAR_CLASSES: {
    readonly BASE: "cmm-menubar";
    readonly HORIZONTAL: "cmm-menubar-horizontal";
    readonly MOBILE: "cmm-menubar-mobile";
};

declare const CMM_MESSAGE_DEFAULTS: {
    readonly SEVERITY: "info";
    readonly ESCAPE: true;
    readonly STYLE_CLASS: "";
    readonly CLOSABLE: false;
    readonly SHOW_TRANSITION_OPTIONS: "300ms ease-out";
    readonly HIDE_TRANSITION_OPTIONS: "200ms cubic-bezier(0.86, 0, 0.07, 1)";
};
declare const CMM_MESSAGE_SEVERITIES: {
    readonly SUCCESS: "success";
    readonly INFO: "info";
    readonly WARN: "warn";
    readonly ERROR: "error";
    readonly SECONDARY: "secondary";
    readonly CONTRAST: "contrast";
};
declare const CMM_MESSAGE_SIZES: {
    readonly SMALL: "small";
    readonly LARGE: "large";
};
declare const CMM_MESSAGE_VARIANTS: {
    readonly TEXT: "text";
    readonly OUTLINED: "outlined";
    readonly SIMPLE: "simple";
};
declare const CMM_MESSAGE_CLASSES: {
    readonly BASE: "cmm-message";
    readonly CLOSABLE: "cmm-message-closable";
    readonly SUCCESS: "cmm-message-success";
    readonly INFO: "cmm-message-info";
    readonly WARN: "cmm-message-warn";
    readonly ERROR: "cmm-message-error";
};

type RippleType = string;

declare const METERGROUP_DEFAULTS: {
    readonly MIN: 0;
    readonly MAX: 100;
    readonly ORIENTATION: MeterGroupOrientation;
    readonly LABEL_POSITION: MeterGroupLabelPosition;
    readonly LABEL_ORIENTATION: MeterGroupLabelOrientation;
};

declare const SCROLLER_DEFAULTS: {
    readonly ORIENTATION: ScrollerOrientation;
    readonly STEP: 0;
    readonly DELAY: 0;
    readonly RESIZE_DELAY: 10;
    readonly APPEND_ONLY: false;
    readonly INLINE: false;
    readonly LAZY: false;
    readonly DISABLED: false;
    readonly LOADER_DISABLED: false;
    readonly SHOW_SPACER: true;
    readonly SHOW_LOADER: false;
    readonly LOADING: false;
    readonly AUTO_SIZE: false;
};

declare const EDITOR_DEFAULTS: {
    readonly PLACEHOLDER: "";
    readonly READONLY: false;
    readonly SHOW_HEADER: true;
};

type EditorFormat = 'background' | 'bold' | 'color' | 'font' | 'code' | 'italic' | 'link' | 'size' | 'strike' | 'script' | 'underline' | 'blockquote' | 'header' | 'indent' | 'list' | 'align' | 'direction' | 'code-block' | 'formula';

declare const SCROLLPANEL_DEFAULTS: {
    readonly STEP: 5;
};

declare const FIELDSET_DEFAULTS: {
    readonly TOGGLEABLE: false;
    readonly COLLAPSED: false;
};

declare const SCROLLTOP_DEFAULTS: {
    readonly TARGET: "window";
    readonly THRESHOLD: 400;
    readonly BEHAVIOR: "smooth";
    readonly SHOW_TRANSITION: ".15s";
    readonly HIDE_TRANSITION: ".15s";
};

declare const FLOATLABEL_DEFAULTS: {
    readonly VARIANT: "over";
};

/**
 * Button size options
 */
declare const BUTTON_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type ButtonSize = (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES];
/**
 * Button style variants
 */
declare const BUTTON_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type ButtonVariant = (typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS];
/**
 * Button severities
 */
declare const BUTTON_SEVERITIES: {
    readonly PRIMARY: "primary";
    readonly SECONDARY: "secondary";
    readonly SUCCESS: "success";
    readonly INFO: "info";
    readonly WARNING: "warning";
    readonly DANGER: "danger";
    readonly HELP: "help";
    readonly CONTRAST: "contrast";
};
type ButtonSeverity = (typeof BUTTON_SEVERITIES)[keyof typeof BUTTON_SEVERITIES];
/**
 * Button icon positions
 */
declare const BUTTON_ICON_POSITIONS: {
    readonly LEFT: "left";
    readonly RIGHT: "right";
    readonly TOP: "top";
    readonly BOTTOM: "bottom";
};
type ButtonIconPosition = (typeof BUTTON_ICON_POSITIONS)[keyof typeof BUTTON_ICON_POSITIONS];
/**
 * Button types
 */
declare const BUTTON_TYPES: {
    readonly BUTTON: "button";
    readonly SUBMIT: "submit";
    readonly RESET: "reset";
};
type ButtonType = (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];

declare const GALLERIA_DEFAULTS: {
    readonly NUM_VISIBLE: 3;
    readonly CIRCULAR: false;
    readonly AUTO_PLAY: false;
    readonly TRANSITION_INTERVAL: 4000;
    readonly SHOW_THUMBNAILS: true;
    readonly THUMBNAILS_POSITION: "bottom";
    readonly SHOW_INDICATORS: false;
    readonly SHOW_INDICATORS_ON_ITEM: false;
    readonly SHOW_ITEM_NAVIGATORS: false;
    readonly SHOW_THUMBNAIL_NAVIGATORS: true;
    readonly FULL_SCREEN: false;
    readonly BASE_Z_INDEX: 0;
};

/**
 * ButtonGroup size options
 */
declare const BUTTONGROUP_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type ButtonGroupSize = (typeof BUTTONGROUP_SIZES)[keyof typeof BUTTONGROUP_SIZES];
/**
 * ButtonGroup style variants
 */
declare const BUTTONGROUP_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type ButtonGroupVariant = (typeof BUTTONGROUP_VARIANTS)[keyof typeof BUTTONGROUP_VARIANTS];
/**
 * ButtonGroup orientation options
 */
declare const BUTTONGROUP_ORIENTATIONS: {
    readonly HORIZONTAL: "horizontal";
    readonly VERTICAL: "vertical";
};
type ButtonGroupOrientation = (typeof BUTTONGROUP_ORIENTATIONS)[keyof typeof BUTTONGROUP_ORIENTATIONS];

declare const TOAST_DEFAULTS: {
    readonly POSITION: "top-right";
    readonly LIFE: 3000;
    readonly SHOW_TRANSITION_OPTIONS: ".3s ease-out";
    readonly HIDE_TRANSITION_OPTIONS: ".3s ease-in";
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 999999;
    readonly PREVENT_OPEN_DUPLICATES: true;
    readonly PREVENT_DUPLICATES: true;
};

/**
 * Card size options
 */
declare const CARD_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type CardSize = (typeof CARD_SIZES)[keyof typeof CARD_SIZES];
/**
 * Card style variants
 */
declare const CARD_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type CardVariant = (typeof CARD_VARIANTS)[keyof typeof CARD_VARIANTS];

declare const CMM_TOGGLEBUTTON_DEFAULTS: {
    readonly CHECKED: false;
    readonly ON_LABEL: "Yes";
    readonly OFF_LABEL: "No";
    readonly DISABLED: false;
    readonly STYLE_CLASS: "";
    readonly TABINDEX: 0;
    readonly ICON_POS: "left";
    readonly AUTOFOCUS: false;
    readonly ALLOW_EMPTY: false;
};
declare const CMM_TOGGLEBUTTON_SIZES: {
    readonly SMALL: "small";
    readonly LARGE: "large";
};
declare const CMM_TOGGLEBUTTON_ICON_POSITIONS: {
    readonly LEFT: "left";
    readonly RIGHT: "right";
};
declare const CMM_TOGGLEBUTTON_CLASSES: {
    readonly BASE: "cmm-togglebutton";
    readonly CHECKED: "cmm-togglebutton-checked";
    readonly UNCHECKED: "cmm-togglebutton-unchecked";
    readonly DISABLED: "cmm-togglebutton-disabled";
    readonly ICON: "cmm-togglebutton-icon";
    readonly LABEL: "cmm-togglebutton-label";
};

type ToggleButtonSize = 'small' | 'large';

declare const TOGGLESWITCH_DEFAULTS: {
    readonly DISABLED: false;
    readonly READONLY: false;
    readonly TRUE_VALUE: true;
    readonly FALSE_VALUE: false;
    readonly TABINDEX: 0;
    readonly AUTOFOCUS: false;
};

declare const MULTISELECT_DEFAULTS: {
    readonly DISABLED: false;
    readonly FILTER: false;
    readonly FILTER_MATCH_MODE: "contains";
    readonly DISPLAY: "comma";
    readonly VARIANT: "outlined";
    readonly SHOW_TOGGLE_ALL: true;
    readonly SHOW_CLEAR: false;
    readonly MAX_SELECTED_LABELS: 3;
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
    readonly SHOW_HEADER: true;
    readonly VIRTUAL_SCROLL: false;
    readonly LAZY: false;
    readonly OVERLAY_VISIBLE: false;
    readonly RESET_FILTER_ON_HIDE: false;
    readonly DROP_DOWN_ICON: "pi pi-chevron-down";
    readonly OPTION_LABEL: "label";
    readonly OPTION_VALUE: "value";
    readonly OPTION_DISABLED: "disabled";
    readonly OPTION_GROUP_LABEL: "label";
    readonly OPTION_GROUP_CHILDREN: "items";
};

declare const SELECT_DEFAULTS: {
    readonly VARIANT: SelectVariant;
    readonly SCROLL_HEIGHT: "200px";
    readonly FILTER: false;
    readonly FILTER_MATCH_MODE: FilterMatchMode;
    readonly READONLY: false;
    readonly REQUIRED: false;
    readonly EDITABLE: false;
    readonly AUTOFOCUS: false;
    readonly AUTOFOCUS_FILTER: true;
    readonly RESET_FILTER_ON_HIDE: false;
    readonly CHECKMARK: false;
    readonly LOADING: false;
    readonly AUTO_DISPLAY_FIRST: true;
    readonly GROUP: false;
    readonly SHOW_CLEAR: false;
    readonly LAZY: false;
    readonly VIRTUAL_SCROLL: false;
    readonly FOCUS_ON_HOVER: true;
    readonly SELECT_ON_FOCUS: false;
    readonly AUTO_OPTION_FOCUS: true;
    readonly FLUID: false;
    readonly DISABLED: false;
    readonly TABINDEX: 0;
    readonly APPEND_TO: "body";
    readonly OPTION_GROUP_LABEL: "label";
    readonly OPTION_GROUP_CHILDREN: "items";
    readonly TOOLTIP_POSITION: "right";
    readonly TOOLTIP_POSITION_STYLE: "absolute";
};

declare const ACCORDION_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
declare const ACCORDION_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
declare const ACCORDION_ICON_POSITIONS: {
    readonly START: "start";
    readonly END: "end";
};
declare const DEFAULT_TRANSITION_OPTIONS = "400ms cubic-bezier(0.86, 0, 0.07, 1)";
type AccordionSize = (typeof ACCORDION_SIZES)[keyof typeof ACCORDION_SIZES];
type AccordionVariant = (typeof ACCORDION_VARIANTS)[keyof typeof ACCORDION_VARIANTS];
type AccordionIconPosition = (typeof ACCORDION_ICON_POSITIONS)[keyof typeof ACCORDION_ICON_POSITIONS];

declare const SELECTBUTTON_DEFAULTS: {
    readonly DISABLED: false;
    readonly MULTIPLE: false;
    readonly OPTION_LABEL: "label";
    readonly OPTION_VALUE: "value";
    readonly OPTION_DISABLED: "disabled";
};

declare const ANIMATION_CLASSES: {
    readonly FADE_IN: "fadein";
    readonly FADE_OUT: "fadeout";
    readonly SLIDE_UP: "slideup";
    readonly SLIDE_DOWN: "slidedown";
    readonly SLIDE_LEFT: "slideleft";
    readonly SLIDE_RIGHT: "slideright";
    readonly ZOOM_IN: "zoomin";
    readonly ZOOM_OUT: "zoomout";
    readonly FLIP_UP: "flipup";
    readonly FLIP_DOWN: "flipdown";
};
declare const ANIMATE_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
declare const ANIMATE_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
declare const ANIMATION_SPEEDS: {
    readonly FAST: "fast";
    readonly NORMAL: "normal";
    readonly SLOW: "slow";
};
declare const DEFAULT_THRESHOLD = 0.5;
declare const DEFAULT_ROOT_MARGIN = "0px";
type AnimationClass = (typeof ANIMATION_CLASSES)[keyof typeof ANIMATION_CLASSES];
type AnimateSize = (typeof ANIMATE_SIZES)[keyof typeof ANIMATE_SIZES];
type AnimateVariant = (typeof ANIMATE_VARIANTS)[keyof typeof ANIMATE_VARIANTS];
type AnimationSpeed = (typeof ANIMATION_SPEEDS)[keyof typeof ANIMATION_SPEEDS];

declare const AUTOCOMPLETE_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
declare const AUTOCOMPLETE_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
declare const DEFAULT_MIN_LENGTH = 1;
declare const DEFAULT_DELAY = 300;
declare const DEFAULT_SCROLL_HEIGHT = "200px";
declare const DEFAULT_EMPTY_MESSAGE = "No results found";
type AutoCompleteSize = (typeof AUTOCOMPLETE_SIZES)[keyof typeof AUTOCOMPLETE_SIZES];
type AutoCompleteVariant = (typeof AUTOCOMPLETE_VARIANTS)[keyof typeof AUTOCOMPLETE_VARIANTS];

declare const SIDEBAR_DEFAULTS: {
    readonly VISIBLE: false;
    readonly POSITION: "left";
    readonly MODAL: true;
    readonly DISMISSABLE: true;
    readonly SHOW_CLOSE_ICON: true;
    readonly CLOSE_ON_ESCAPE: true;
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
    readonly TRANSITION_OPTIONS: ".3s cubic-bezier(0, 0, 0.2, 1)";
};

declare const AUTOFOCUS_DEFAULTS: {
    readonly ENABLED: true;
    readonly DELAY: 0;
    readonly SELECT_ON_FOCUS: false;
};
declare const FOCUS_DELAYS: {
    readonly IMMEDIATE: 0;
    readonly SHORT: 100;
    readonly MEDIUM: 300;
    readonly LONG: 500;
};
type FocusDelay = (typeof FOCUS_DELAYS)[keyof typeof FOCUS_DELAYS];

declare const CMM_SKELETON_DEFAULTS: {
    readonly STYLE_CLASS: "";
    readonly SHAPE: "rectangle";
    readonly WIDTH: "100%";
    readonly HEIGHT: "1rem";
};
declare const CMM_SKELETON_SHAPES: {
    readonly RECTANGLE: "rectangle";
    readonly CIRCLE: "circle";
};
declare const CMM_SKELETON_CLASSES: {
    readonly BASE: "cmm-skeleton";
    readonly RECTANGLE: "cmm-skeleton-rectangle";
    readonly CIRCLE: "cmm-skeleton-circle";
};

/**
 * Avatar size options
 */
declare const AVATAR_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type AvatarSize = (typeof AVATAR_SIZES)[keyof typeof AVATAR_SIZES];
/**
 * PrimeNG Avatar native size options
 */
declare const PRIMENG_AVATAR_SIZES: {
    readonly NORMAL: "normal";
    readonly LARGE: "large";
    readonly XLARGE: "xlarge";
};
type PrimeNGAvatarSize = (typeof PRIMENG_AVATAR_SIZES)[keyof typeof PRIMENG_AVATAR_SIZES];
/**
 * Avatar shape options
 */
declare const AVATAR_SHAPES: {
    readonly SQUARE: "square";
    readonly CIRCLE: "circle";
};
type AvatarShape = (typeof AVATAR_SHAPES)[keyof typeof AVATAR_SHAPES];
/**
 * Avatar style variants
 */
declare const AVATAR_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type AvatarVariant = (typeof AVATAR_VARIANTS)[keyof typeof AVATAR_VARIANTS];
/**
 * Avatar display types
 */
declare const AVATAR_TYPES: {
    readonly LABEL: "label";
    readonly ICON: "icon";
    readonly IMAGE: "image";
};
type AvatarType = (typeof AVATAR_TYPES)[keyof typeof AVATAR_TYPES];

declare const IFTALABEL_DEFAULTS: {};

type IftaLabelType = string;

declare const CAROUSEL_DEFAULTS: {
    readonly PAGE: 0;
    readonly NUM_VISIBLE: 1;
    readonly NUM_SCROLL: 1;
    readonly ORIENTATION: "horizontal";
    readonly CIRCULAR: false;
    readonly AUTOPLAY_INTERVAL: 0;
    readonly SHOW_INDICATORS: true;
    readonly SHOW_NAVIGATORS: true;
};

declare const CMM_IMAGE_DEFAULTS: {
    readonly PREVIEW: false;
    readonly STYLE_CLASS: "";
    readonly SHOW_TRANSITION: "150ms cubic-bezier(0, 0, 0.2, 1)";
    readonly HIDE_TRANSITION: "150ms cubic-bezier(0, 0, 0.2, 1)";
};
declare const CMM_IMAGE_LOADING: {
    readonly LAZY: "lazy";
    readonly EAGER: "eager";
};
declare const CMM_IMAGE_CLASSES: {
    readonly BASE: "cmm-image";
    readonly PREVIEW_ENABLED: "cmm-image-preview";
    readonly LOADING: "cmm-image-loading";
};

declare const CASCADESELECT_DEFAULTS: {
    readonly VARIANT: "outlined";
    readonly DISABLED: false;
    readonly SELECT_ON_FOCUS: false;
    readonly AUTO_OPTION_FOCUS: true;
    readonly SHOW_CLEAR: false;
    readonly LOADING: false;
    readonly FLUID: false;
    readonly TABINDEX: 0;
};

declare const INPLACE_DEFAULTS: {
    readonly ACTIVE: false;
    readonly CLOSABLE: false;
    readonly DISABLED: false;
    readonly PREVENT_CLICK: false;
};

declare const CMM_TOOLBAR_DEFAULTS: {
    readonly STYLE_CLASS: "";
};
declare const CMM_TOOLBAR_CLASSES: {
    readonly BASE: "cmm-toolbar";
    readonly START: "cmm-toolbar-start";
    readonly CENTER: "cmm-toolbar-center";
    readonly END: "cmm-toolbar-end";
};

declare const INPUTGROUP_DEFAULTS: {};

declare const CHART_DEFAULTS: {
    readonly TYPE: "line";
    readonly WIDTH: "100%";
    readonly HEIGHT: "400px";
    readonly RESPONSIVE: true;
};

declare const CMM_TOOLTIP_DEFAULTS: {
    readonly TOOLTIP_EVENT: "hover";
    readonly ESCAPE: true;
    readonly AUTO_HIDE: true;
    readonly FIT_CONTENT: true;
    readonly HIDE_ON_ESCAPE: true;
};
declare const CMM_TOOLTIP_POSITIONS: {
    readonly TOP: "top";
    readonly BOTTOM: "bottom";
    readonly LEFT: "left";
    readonly RIGHT: "right";
};
declare const CMM_TOOLTIP_EVENTS: {
    readonly HOVER: "hover";
    readonly FOCUS: "focus";
    readonly BOTH: "both";
};
declare const CMM_TOOLTIP_CLASSES: {
    readonly BASE: "cmm-tooltip";
    readonly ARROW: "cmm-tooltip-arrow";
    readonly TEXT: "cmm-tooltip-text";
};

declare const CHECKBOX_DEFAULTS: {
    readonly DISABLED: false;
    readonly BINARY: false;
    readonly READONLY: false;
    readonly REQUIRED: false;
    readonly TRUE_VALUE: true;
    readonly FALSE_VALUE: false;
    readonly TABINDEX: 0;
    readonly VARIANT: "outlined";
};

declare const CMM_TREE_DEFAULTS: {
    readonly VALUE: any[];
    readonly LOADING_MODE: "mask";
    readonly DRAGGABLE_NODES: false;
    readonly DROPPABLE_NODES: false;
    readonly META_KEY_SELECTION: false;
    readonly PROPAGATE_SELECTION_UP: true;
    readonly PROPAGATE_SELECTION_DOWN: true;
    readonly LOADING: false;
    readonly EMPTY_MESSAGE: "";
    readonly VALIDATE_DROP: false;
    readonly FILTER: false;
    readonly FILTER_BY: "label";
    readonly FILTER_MODE: "lenient";
    readonly LAZY: false;
    readonly VIRTUAL_SCROLL: false;
    readonly INDENTATION: 1.5;
    readonly HIGHLIGHT_ON_SELECT: false;
};
declare const CMM_TREE_SELECTION_MODES: {
    readonly SINGLE: "single";
    readonly MULTIPLE: "multiple";
    readonly CHECKBOX: "checkbox";
};
declare const CMM_TREE_LOADING_MODES: {
    readonly MASK: "mask";
    readonly ICON: "icon";
};
declare const CMM_TREE_FILTER_MODES: {
    readonly LENIENT: "lenient";
    readonly STRICT: "strict";
};
declare const CMM_TREE_CLASSES: {
    readonly BASE: "cmm-tree";
    readonly FILTERED: "cmm-tree-filtered";
    readonly LOADING: "cmm-tree-loading";
    readonly DRAGGABLE: "cmm-tree-draggable";
};

declare const CMM_TREESELECT_DEFAULTS: {
    readonly SCROLL_HEIGHT: "400px";
    readonly DISABLED: false;
    readonly META_KEY_SELECTION: false;
    readonly VARIANT: "outlined";
    readonly DISPLAY: "comma";
    readonly SELECTION_MODE: "single";
    readonly TABINDEX: "0";
    readonly FLUID: false;
    readonly EMPTY_MESSAGE: "";
    readonly FILTER: false;
    readonly FILTER_BY: "label";
    readonly FILTER_MODE: "lenient";
    readonly FILTER_INPUT_AUTO_FOCUS: true;
    readonly PROPAGATE_SELECTION_DOWN: true;
    readonly PROPAGATE_SELECTION_UP: true;
    readonly SHOW_CLEAR: false;
    readonly RESET_FILTER_ON_HIDE: true;
    readonly VIRTUAL_SCROLL: false;
    readonly AUTOFOCUS: false;
    readonly OPTIONS: any[];
    readonly LOADING: false;
};
declare const CMM_TREESELECT_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
declare const CMM_TREESELECT_DISPLAY_MODES: {
    readonly CHIP: "chip";
    readonly COMMA: "comma";
};
declare const CMM_TREESELECT_SELECTION_MODES: {
    readonly SINGLE: "single";
    readonly MULTIPLE: "multiple";
    readonly CHECKBOX: "checkbox";
};
declare const CMM_TREESELECT_FILTER_MODES: {
    readonly LENIENT: "lenient";
    readonly STRICT: "strict";
};
declare const CMM_TREESELECT_SIZES: {
    readonly SMALL: "small";
    readonly LARGE: "large";
};
declare const CMM_TREESELECT_CLASSES: {
    readonly BASE: "cmm-treeselect";
    readonly FILTERED: "cmm-treeselect-filtered";
    readonly DISABLED: "cmm-treeselect-disabled";
    readonly MULTIPLE: "cmm-treeselect-multiple";
};

declare const CMM_PANEL_DEFAULTS: {
    readonly TOGGLEABLE: false;
    readonly COLLAPSED: false;
    readonly STYLE_CLASS: "";
    readonly ICON_POS: "end";
    readonly SHOW_HEADER: true;
    readonly TOGGLER: "icon";
    readonly TRANSITION_OPTIONS: "400ms cubic-bezier(0.86, 0, 0.07, 1)";
};
declare const CMM_PANEL_ICON_POSITIONS: {
    readonly START: "start";
    readonly CENTER: "center";
    readonly END: "end";
};
declare const CMM_PANEL_TOGGLERS: {
    readonly HEADER: "header";
    readonly ICON: "icon";
};
declare const CMM_PANEL_CLASSES: {
    readonly BASE: "cmm-panel";
    readonly TOGGLEABLE: "cmm-panel-toggleable";
    readonly COLLAPSED: "cmm-panel-collapsed";
    readonly HEADER: "cmm-panel-header";
    readonly CONTENT: "cmm-panel-content";
    readonly FOOTER: "cmm-panel-footer";
};

declare const SLIDER_DEFAULTS: {
    readonly MIN: 0;
    readonly MAX: 100;
    readonly STEP: 1;
    readonly ORIENTATION: "horizontal";
    readonly DISABLED: false;
    readonly RANGE: false;
    readonly VARIANT: "outlined";
};

declare const PANELMENU_DEFAULTS: {
    readonly MULTIPLE: true;
};

declare const PASSWORD_DEFAULTS: {
    readonly DISABLED: false;
    readonly FEEDBACK: false;
    readonly TOGGLE_MASK: false;
    readonly VARIANT: "outlined";
    readonly PROMPT_LABEL: "Enter a password";
    readonly WEAK_LABEL: "Weak";
    readonly MEDIUM_LABEL: "Medium";
    readonly STRONG_LABEL: "Strong";
};

declare const SPEEDDIAL_DEFAULTS: {
    readonly DIRECTION: "up";
    readonly TYPE: "linear";
    readonly RADIUS: 0;
    readonly MASK: false;
    readonly DISABLED: false;
    readonly HIDE_ON_CLICK_OUTSIDE: true;
    readonly BUTTON_CLASS: "";
    readonly MASK_CLASS: "";
    readonly SHOW_ICON: "pi pi-plus";
    readonly HIDE_ICON: "pi pi-times";
    readonly ROTATE_ANIMATION: true;
};

type InputGroupType = string;

declare const CMM_SPLITBUTTON_DEFAULTS: {
    readonly RAISED: false;
    readonly ROUNDED: false;
    readonly TEXT: false;
    readonly OUTLINED: false;
    readonly PLAIN: false;
    readonly ICON_POS: "left";
    readonly STYLE_CLASS: "";
    readonly MENU_STYLE_CLASS: "";
    readonly DISABLED: false;
    readonly AUTOFOCUS: false;
};
declare const CMM_SPLITBUTTON_SEVERITIES: {
    readonly SECONDARY: "secondary";
    readonly SUCCESS: "success";
    readonly INFO: "info";
    readonly WARN: "warn";
    readonly DANGER: "danger";
    readonly CONTRAST: "contrast";
    readonly HELP: "help";
};
declare const CMM_SPLITBUTTON_SIZES: {
    readonly SMALL: "small";
    readonly LARGE: "large";
};
declare const CMM_SPLITBUTTON_ICON_POSITIONS: {
    readonly LEFT: "left";
    readonly RIGHT: "right";
};
declare const CMM_SPLITBUTTON_CLASSES: {
    readonly BASE: "cmm-splitbutton";
    readonly RAISED: "cmm-splitbutton-raised";
    readonly ROUNDED: "cmm-splitbutton-rounded";
    readonly TEXT: "cmm-splitbutton-text";
    readonly OUTLINED: "cmm-splitbutton-outlined";
    readonly PLAIN: "cmm-splitbutton-plain";
};

declare const INPUTGROUPADDON_DEFAULTS: {};

type InputGroupAddonType = string;

declare const INPUTMASK_DEFAULTS: {
    readonly DISABLED: false;
    readonly READONLY: false;
    readonly VARIANT: "outlined";
    readonly UNMASK: false;
    readonly AUTOFOCUS: false;
    readonly AUTOCLR: true;
    readonly SLOT_CHAR: "_";
};

declare const COLORPICKER_DEFAULTS: {
    readonly FORMAT: "hex";
    readonly INLINE: false;
    readonly DISABLED: false;
    readonly APPEND_TO: "body";
};

declare const POPOVER_DEFAULTS: {
    readonly DISMISSABLE: true;
    readonly SHOW_CLOSE_ICON: false;
    readonly APPEND_TO: "body";
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
    readonly FOCUS_ON_SHOW: true;
    readonly SHOW_TRANSITION: ".12s cubic-bezier(0, 0, 0.2, 1)";
    readonly HIDE_TRANSITION: ".1s linear";
};

interface CmmPopoverProps {
    ariaLabel?: string;
    ariaLabelledBy?: string;
    dismissable?: boolean;
    showCloseIcon?: boolean;
    style?: Record<string, any>;
    styleClass?: string;
    appendTo?: any;
    autoZIndex?: boolean;
    ariaCloseLabel?: string;
    baseZIndex?: number;
    focusOnShow?: boolean;
    showTransitionOptions?: string;
    hideTransitionOptions?: string;
}

declare const CMM_SPLITTER_DEFAULTS: {
    readonly STYLE_CLASS: "";
    readonly PANEL_STYLE_CLASS: "";
    readonly STATE_STORAGE: "session";
    readonly LAYOUT: "horizontal";
    readonly GUTTER_SIZE: 4;
    readonly STEP: 5;
    readonly MIN_SIZES: number[];
};
declare const CMM_SPLITTER_LAYOUTS: {
    readonly HORIZONTAL: "horizontal";
    readonly VERTICAL: "vertical";
};
declare const CMM_SPLITTER_STORAGE: {
    readonly SESSION: "session";
    readonly LOCAL: "local";
};
declare const CMM_SPLITTER_CLASSES: {
    readonly BASE: "cmm-splitter";
    readonly HORIZONTAL: "cmm-splitter-horizontal";
    readonly VERTICAL: "cmm-splitter-vertical";
    readonly PANEL: "cmm-splitter-panel";
    readonly GUTTER: "cmm-splitter-gutter";
};

declare const CMM_PROGRESSBAR_DEFAULTS: {
    readonly SHOW_VALUE: true;
    readonly STYLE_CLASS: "";
    readonly VALUE_STYLE_CLASS: "";
    readonly UNIT: "%";
    readonly MODE: "determinate";
};
declare const CMM_PROGRESSBAR_MODES: {
    readonly DETERMINATE: "determinate";
    readonly INDETERMINATE: "indeterminate";
};
declare const CMM_PROGRESSBAR_CLASSES: {
    readonly BASE: "cmm-progressbar";
    readonly VALUE: "cmm-progressbar-value";
    readonly LABEL: "cmm-progressbar-label";
};

type ProgressBarMode = 'determinate' | 'indeterminate';

declare const CMM_STEPPER_DEFAULTS: {
    readonly LINEAR: false;
    readonly TRANSITION_OPTIONS: "400ms cubic-bezier(0.86, 0, 0.07, 1)";
};
declare const CMM_STEPPER_CLASSES: {
    readonly BASE: "cmm-stepper";
    readonly LINEAR: "cmm-stepper-linear";
    readonly HORIZONTAL: "cmm-stepper-horizontal";
    readonly VERTICAL: "cmm-stepper-vertical";
};

declare const CMM_STEPS_DEFAULTS: {
    readonly ACTIVE_INDEX: 0;
    readonly READONLY: true;
    readonly STYLE_CLASS: "";
    readonly EXACT: true;
};
declare const CMM_STEPS_CLASSES: {
    readonly BASE: "cmm-steps";
    readonly READONLY: "cmm-steps-readonly";
    readonly INTERACTIVE: "cmm-steps-interactive";
};

declare const INPUTNUMBER_DEFAULTS: {
    readonly SHOW_BUTTONS: false;
    readonly FORMAT: true;
    readonly BUTTON_LAYOUT: "stacked";
    readonly DISABLED: false;
    readonly READONLY: false;
    readonly REQUIRED: false;
    readonly TABINDEX: 0;
    readonly MIN_FRACTION_DIGITS: 0;
    readonly MAX_FRACTION_DIGITS: 2;
    readonly USE_GROUPING: true;
    readonly MODE: "decimal";
    readonly CURRENCY: "USD";
    readonly CURRENCY_DISPLAY: "symbol";
    readonly STEP: 1;
    readonly ALLOW_EMPTY: true;
    readonly VARIANT: "outlined";
    readonly FLUID: false;
};

declare const INPUTOTP_DEFAULTS: {
    readonly DISABLED: false;
    readonly READONLY: false;
    readonly VARIANT: "outlined";
    readonly LENGTH: 4;
    readonly MASK: false;
    readonly INTEGER_ONLY: false;
};

declare const CONFIRMDIALOG_DEFAULTS: {
    readonly ACCEPT_VISIBLE: true;
    readonly REJECT_VISIBLE: true;
    readonly CLOSABLE: true;
    readonly CLOSE_ON_ESCAPE: true;
    readonly DISMISSABLE_MASK: false;
    readonly BLOCK_SCROLL: true;
    readonly RTL: false;
    readonly APPEND_TO: "body";
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
    readonly TRANSITION_OPTIONS: "150ms cubic-bezier(0, 0, 0.2, 1)";
    readonly FOCUS_TRAP: true;
    readonly DEFAULT_FOCUS: "accept";
};

declare const CONFIRMPOPUP_DEFAULTS: {
    readonly ACCEPT_LABEL: "Yes";
    readonly REJECT_LABEL: "No";
    readonly ACCEPT_ICON: "pi pi-check";
    readonly REJECT_ICON: "pi pi-times";
    readonly ACCEPT_BUTTON_STYLE_CLASS: "p-button-sm";
    readonly REJECT_BUTTON_STYLE_CLASS: "p-button-sm p-button-text";
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
};

type ConfirmPopupPosition = 'left' | 'right' | 'top' | 'bottom';

declare const INPUTTEXT_DEFAULTS: {
    readonly VARIANT: "outlined";
    readonly FLUID: false;
};

declare const CONTEXTMENU_DEFAULTS: {
    readonly APPEND_TO: "body";
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
};

type ContextMenuAppendTo = 'body' | any;

/**
 * Tab component constants
 */
declare const TAB_DEFAULTS: {
    readonly DISABLED: false;
};
type TabValue = string | number;

declare const TREETABLE_DEFAULTS: {
    readonly autoLayout: false;
    readonly scrollable: false;
    readonly showGridlines: false;
    readonly paginator: false;
    readonly first: 0;
    readonly pageLinks: 5;
    readonly alwaysShowPaginator: true;
    readonly paginatorPosition: "bottom";
    readonly currentPageReportTemplate: "{currentPage} of {totalPages}";
    readonly showCurrentPageReport: false;
    readonly showJumpToPageDropdown: false;
    readonly showFirstLastIcon: true;
    readonly showPageLinks: true;
    readonly defaultSortOrder: 1;
    readonly sortMode: "single";
    readonly resetPageOnSort: true;
    readonly customSort: false;
    readonly contextMenuSelectionMode: "separate";
    readonly metaKeySelection: false;
    readonly compareSelectionBy: "deepEquals";
    readonly rowHover: false;
    readonly filters: {};
    readonly filterDelay: 300;
    readonly filterMode: "lenient";
    readonly virtualScroll: false;
    readonly virtualScrollDelay: 150;
    readonly resizableColumns: false;
    readonly columnResizeMode: "fit";
    readonly reorderableColumns: false;
    readonly lazy: false;
    readonly lazyLoadOnInit: true;
    readonly loading: false;
    readonly showLoader: true;
};
declare const PAGINATOR_POSITIONS: {
    readonly TOP: "top";
    readonly BOTTOM: "bottom";
    readonly BOTH: "both";
};
type PaginatorPosition = (typeof PAGINATOR_POSITIONS)[keyof typeof PAGINATOR_POSITIONS];
declare const SORT_MODES: {
    readonly SINGLE: "single";
    readonly MULTIPLE: "multiple";
};
type SortMode = (typeof SORT_MODES)[keyof typeof SORT_MODES];
declare const FILTER_MODES: {
    readonly LENIENT: "lenient";
    readonly STRICT: "strict";
};
type FilterMode = (typeof FILTER_MODES)[keyof typeof FILTER_MODES];
declare const COLUMN_RESIZE_MODES: {
    readonly FIT: "fit";
    readonly EXPAND: "expand";
};
type ColumnResizeMode = (typeof COLUMN_RESIZE_MODES)[keyof typeof COLUMN_RESIZE_MODES];
declare const SELECTION_MODES: {
    readonly SINGLE: "single";
    readonly MULTIPLE: "multiple";
    readonly CHECKBOX: "checkbox";
};
type SelectionMode = (typeof SELECTION_MODES)[keyof typeof SELECTION_MODES];
declare const CONTEXT_MENU_SELECTION_MODES: {
    readonly SEPARATE: "separate";
    readonly JOINT: "joint";
};
type ContextMenuSelectionMode = (typeof CONTEXT_MENU_SELECTION_MODES)[keyof typeof CONTEXT_MENU_SELECTION_MODES];
declare const COMPARE_SELECTION_BY: {
    readonly EQUALS: "equals";
    readonly DEEP_EQUALS: "deepEquals";
};
type CompareSelectionBy = (typeof COMPARE_SELECTION_BY)[keyof typeof COMPARE_SELECTION_BY];
declare const TREETABLE_CLASSES: {
    readonly ROOT: "p-treetable";
    readonly LOADING: "p-treetable-loading";
    readonly MASK: "p-treetable-mask";
    readonly LOADING_ICON: "p-treetable-loading-icon";
    readonly HEADER: "p-treetable-header";
    readonly PAGINATOR: "p-treetable-paginator";
    readonly TABLE_CONTAINER: "p-treetable-table-container";
    readonly TABLE: "p-treetable-table";
    readonly THEAD: "p-treetable-thead";
    readonly COLUMN_RESIZER: "p-treetable-column-resizer";
    readonly COLUMN_TITLE: "p-treetable-column-title";
    readonly SORT_ICON: "p-treetable-sort-icon";
    readonly SORT_BADGE: "p-treetable-sort-badge";
    readonly TBODY: "p-treetable-tbody";
    readonly NODE_TOGGLE_BUTTON: "p-treetable-node-toggle-button";
    readonly NODE_TOGGLE_ICON: "p-treetable-node-toggle-icon";
    readonly NODE_CHECKBOX: "p-treetable-node-checkbox";
    readonly EMPTY_MESSAGE: "p-treetable-empty-message";
    readonly TFOOT: "p-treetable-tfoot";
    readonly FOOTER: "p-treetable-footer";
    readonly COLUMN_RESIZE_INDICATOR: "p-treetable-column-resize-indicator";
};
declare const COMMON_COLUMNS: {
    readonly NAME: {
        readonly field: "name";
        readonly header: "Name";
        readonly sortable: true;
    };
    readonly SIZE: {
        readonly field: "size";
        readonly header: "Size";
        readonly sortable: true;
    };
    readonly TYPE: {
        readonly field: "type";
        readonly header: "Type";
        readonly sortable: true;
    };
    readonly DATE_MODIFIED: {
        readonly field: "dateModified";
        readonly header: "Date Modified";
        readonly sortable: true;
    };
    readonly STATUS: {
        readonly field: "status";
        readonly header: "Status";
        readonly sortable: false;
    };
};
declare const ICON_CLASSES: {
    readonly LOADING: "pi pi-spinner pi-spin";
    readonly SORT_ASC: "pi pi-sort-amount-up-alt";
    readonly SORT_DESC: "pi pi-sort-amount-down";
    readonly SORT: "pi pi-sort-alt";
    readonly EXPAND: "pi pi-chevron-right";
    readonly COLLAPSE: "pi pi-chevron-down";
    readonly CHECK: "pi pi-check";
    readonly FILTER: "pi pi-filter";
};
declare const SCROLL_HEIGHTS: {
    readonly SMALL: "300px";
    readonly MEDIUM: "400px";
    readonly LARGE: "600px";
    readonly FLEX: "flex";
};
declare const VIRTUAL_SCROLL_ITEM_SIZES: {
    readonly SMALL: 40;
    readonly MEDIUM: 50;
    readonly LARGE: 60;
};
declare const ROWS_PER_PAGE_OPTIONS: readonly [10, 20, 30, 50, 100];
declare const FILTER_OPERATORS: {
    readonly STARTS_WITH: "startsWith";
    readonly CONTAINS: "contains";
    readonly NOT_CONTAINS: "notContains";
    readonly ENDS_WITH: "endsWith";
    readonly EQUALS: "equals";
    readonly NOT_EQUALS: "notEquals";
    readonly IN: "in";
    readonly LESS_THAN: "lt";
    readonly LESS_THAN_OR_EQUAL: "lte";
    readonly GREATER_THAN: "gt";
    readonly GREATER_THAN_OR_EQUAL: "gte";
    readonly BETWEEN: "between";
    readonly IS: "is";
    readonly IS_NOT: "isNot";
    readonly BEFORE: "before";
    readonly AFTER: "after";
    readonly DATE_IS: "dateIs";
    readonly DATE_IS_NOT: "dateIsNot";
    readonly DATE_BEFORE: "dateBefore";
    readonly DATE_AFTER: "dateAfter";
};

/**
 * TabList component constants
 */
declare const TABLIST_DEFAULTS: {};

declare const DATAVIEW_DEFAULTS: {
    readonly PAGINATOR: false;
    readonly PAGE_LINKS: 5;
    readonly PAGINATOR_POSITION: DataViewPaginatorPosition;
    readonly ALWAYS_SHOW_PAGINATOR: true;
    readonly PAGINATOR_DROPDOWN_SCROLL_HEIGHT: "200px";
    readonly CURRENT_PAGE_REPORT_TEMPLATE: "{currentPage} of {totalPages}";
    readonly SHOW_CURRENT_PAGE_REPORT: false;
    readonly SHOW_JUMP_TO_PAGE_DROPDOWN: false;
    readonly SHOW_FIRST_LAST_ICON: true;
    readonly SHOW_PAGE_LINKS: true;
    readonly LAZY: false;
    readonly LAZY_LOAD_ON_INIT: true;
    readonly EMPTY_MESSAGE: "";
    readonly GRID_STYLE_CLASS: "";
    readonly LOADING: false;
    readonly LAYOUT: DataViewLayout;
    readonly FIRST: 0;
};

/**
 * Default base z-index values for different overlay types
 */
declare const ZINDEX_BASE_VALUES: {
    readonly MODAL: 1100;
    readonly OVERLAY: 1000;
    readonly MENU: 1000;
    readonly TOOLTIP: 1100;
    readonly TOAST: 1200;
    readonly SIDEBAR: 1050;
};
type ZIndexBaseValue = (typeof ZINDEX_BASE_VALUES)[keyof typeof ZINDEX_BASE_VALUES];
/**
 * Z-Index layer types for semantic usage
 */
declare const ZINDEX_LAYERS: {
    readonly BASE: 0;
    readonly DROPDOWN: 1000;
    readonly STICKY: 1020;
    readonly FIXED: 1030;
    readonly MODAL_BACKDROP: 1040;
    readonly MODAL: 1050;
    readonly POPOVER: 1060;
    readonly TOOLTIP: 1070;
    readonly NOTIFICATION: 1080;
};
type ZIndexLayer = (typeof ZINDEX_LAYERS)[keyof typeof ZINDEX_LAYERS];

declare const KEYFILTER_DEFAULTS: {
    readonly VALIDATE_ONLY: false;
};

declare const KNOB_DEFAULTS: {
    readonly MIN: 0;
    readonly MAX: 100;
    readonly STEP: 1;
    readonly DISABLED: false;
    readonly READONLY: false;
    readonly SHOW_VALUE: true;
    readonly VALUE_TEMPLATE: "{value}";
    readonly SIZE: 100;
    readonly STROKE_WIDTH: 14;
    readonly TEXT_COLOR: "#495057";
    readonly VALUE_COLOR: "#495057";
    readonly RANGE_COLOR: "#ced4da";
};

declare const DIALOG_DEFAULTS: {
    readonly DRAGGABLE: true;
    readonly RESIZABLE: true;
    readonly MODAL: false;
    readonly CLOSE_ON_ESCAPE: true;
    readonly DISMISSABLE_MASK: false;
    readonly RTL: false;
    readonly CLOSABLE: true;
    readonly SHOW_HEADER: true;
    readonly BLOCK_SCROLL: false;
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
    readonly MIN_X: 0;
    readonly MIN_Y: 0;
    readonly FOCUS_ON_SHOW: true;
    readonly MAXIMIZABLE: false;
    readonly KEEP_IN_VIEWPORT: true;
    readonly FOCUS_TRAP: true;
    readonly TRANSITION_OPTIONS: "150ms cubic-bezier(0, 0, 0.2, 1)";
    readonly CLOSE_TABINDEX: "0";
};
declare const DIALOG_POSITIONS: readonly DialogPosition[];

declare const DIVIDER_DEFAULTS: {
    readonly LAYOUT: "horizontal";
    readonly ALIGN: "center";
    readonly TYPE: "solid";
};

/**
 * AvatarGroup size options
 */
declare const AVATAR_GROUP_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type AvatarGroupSize = (typeof AVATAR_GROUP_SIZES)[keyof typeof AVATAR_GROUP_SIZES];
/**
 * AvatarGroup style variants
 */
declare const AVATAR_GROUP_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type AvatarGroupVariant = (typeof AVATAR_GROUP_VARIANTS)[keyof typeof AVATAR_GROUP_VARIANTS];

/**
 * Badge size options
 */
declare const BADGE_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type BadgeSize = (typeof BADGE_SIZES)[keyof typeof BADGE_SIZES];
/**
 * PrimeNG Badge native size options
 */
declare const PRIMENG_BADGE_SIZES: {
    readonly LARGE: "large";
    readonly XLARGE: "xlarge";
};
type PrimeNGBadgeSize = (typeof PRIMENG_BADGE_SIZES)[keyof typeof PRIMENG_BADGE_SIZES];
/**
 * Badge severity options
 */
declare const BADGE_SEVERITIES: {
    readonly SUCCESS: "success";
    readonly INFO: "info";
    readonly WARNING: "warning";
    readonly DANGER: "danger";
};
type BadgeSeverity = (typeof BADGE_SEVERITIES)[keyof typeof BADGE_SEVERITIES];
/**
 * Badge style variants
 */
declare const BADGE_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type BadgeVariant = (typeof BADGE_VARIANTS)[keyof typeof BADGE_VARIANTS];

/**
 * TabPanel component constants
 */
declare const TABPANEL_DEFAULTS: {};
type TabPanelValue = string | number;

/**
 * TabPanels component constants
 */
declare const TABPANELS_DEFAULTS: {};

/**
 * Tabs component constants
 */
declare const TABS_DEFAULTS: {
    readonly SCROLLABLE: false;
    readonly LAZY: false;
    readonly SELECT_ON_FOCUS: false;
    readonly SHOW_NAVIGATORS: true;
    readonly TABINDEX: 0;
};
type TabsValue = string | number;

declare const CMM_TAG_DEFAULTS: {
    readonly STYLE_CLASS: "";
    readonly ROUNDED: false;
};
declare const CMM_TAG_SEVERITIES: {
    readonly SECONDARY: "secondary";
    readonly SUCCESS: "success";
    readonly INFO: "info";
    readonly WARN: "warn";
    readonly DANGER: "danger";
    readonly CONTRAST: "contrast";
};
declare const CMM_TAG_CLASSES: {
    readonly BASE: "cmm-tag";
    readonly ROUNDED: "cmm-tag-rounded";
    readonly WITH_ICON: "cmm-tag-icon";
};

declare const LISTBOX_DEFAULTS: {
    readonly DISABLED: false;
    readonly READONLY: false;
    readonly MULTIPLE: false;
    readonly CHECKBOX: false;
    readonly FILTER: false;
    readonly FILTER_MATCH_MODE: "contains";
    readonly VARIANT: "outlined";
    readonly OPTION_LABEL: "label";
    readonly OPTION_VALUE: "value";
    readonly OPTION_DISABLED: "disabled";
    readonly OPTION_GROUP_LABEL: "label";
    readonly OPTION_GROUP_CHILDREN: "items";
    readonly STRIPED: false;
    readonly SHOW_TOGGLE_ALL: true;
    readonly EMPTY_MESSAGE: "";
    readonly EMPTY_FILTER_MESSAGE: "";
};

declare const MEGAMENU_DEFAULTS: {
    readonly ORIENTATION: "horizontal";
};

declare const DOCK_DEFAULTS: {
    readonly POSITION: "bottom";
};

declare const CMM_PROGRESSSPINNER_DEFAULTS: {
    readonly STYLE_CLASS: "";
    readonly STROKE_WIDTH: "2";
    readonly FILL: "none";
    readonly ANIMATION_DURATION: "2s";
};
declare const CMM_PROGRESSSPINNER_SIZES: {
    readonly SMALL: {
        readonly width: "50px";
        readonly height: "50px";
    };
    readonly MEDIUM: {
        readonly width: "100px";
        readonly height: "100px";
    };
    readonly LARGE: {
        readonly width: "150px";
        readonly height: "150px";
    };
};
declare const CMM_PROGRESSSPINNER_CLASSES: {
    readonly BASE: "cmm-progressspinner";
    readonly SMALL: "cmm-progressspinner-small";
    readonly MEDIUM: "cmm-progressspinner-medium";
    readonly LARGE: "cmm-progressspinner-large";
};

type ProgressSpinnerStrokeWidth = string;
type ProgressSpinnerFill = string;
type ProgressSpinnerAnimationDuration = string;

declare const DRAGDROP_DEFAULTS: {
    readonly DRAG_EFFECT: DragEffect;
    readonly DROP_EFFECT: DropEffect;
    readonly DROPPABLE_DISABLED: false;
};

declare const CMM_MENU_DEFAULTS: {
    readonly POPUP: false;
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
    readonly SHOW_TRANSITION: ".12s cubic-bezier(0, 0, 0.2, 1)";
    readonly HIDE_TRANSITION: ".1s linear";
    readonly STYLE_CLASS: "";
    readonly TABINDEX: 0;
};
declare const CMM_MENU_CLASSES: {
    readonly BASE: "cmm-menu";
    readonly POPUP: "cmm-menu-popup";
    readonly OVERLAY: "cmm-menu-overlay";
};

declare const RADIOBUTTON_DEFAULTS: {
    readonly DISABLED: false;
    readonly TABINDEX: 0;
    readonly VARIANT: "outlined";
};

declare const CMM_RATING_DEFAULTS: {
    readonly DISABLED: false;
    readonly READONLY: false;
    readonly STARS: 5;
    readonly AUTOFOCUS: false;
};
declare const CMM_RATING_CLASSES: {
    readonly BASE: "cmm-rating";
    readonly STAR: "cmm-rating-star";
    readonly STAR_ON: "cmm-rating-star-on";
    readonly STAR_OFF: "cmm-rating-star-off";
    readonly CANCEL: "cmm-rating-cancel";
    readonly READONLY: "cmm-rating-readonly";
    readonly DISABLED: "cmm-rating-disabled";
};

declare const DRAWER_DEFAULTS: {
    readonly APPEND_TO: "body";
    readonly BLOCK_SCROLL: false;
    readonly AUTO_Z_INDEX: true;
    readonly BASE_Z_INDEX: 0;
    readonly MODAL: true;
    readonly DISMISSIBLE: true;
    readonly SHOW_CLOSE_ICON: true;
    readonly CLOSE_ON_ESCAPE: true;
    readonly TRANSITION_OPTIONS: "150ms cubic-bezier(0, 0, 0.2, 1)";
    readonly CLOSABLE: true;
    readonly POSITION: DrawerPosition;
};
declare const DRAWER_POSITIONS: readonly DrawerPosition[];

declare const RIPPLE_DEFAULTS: {};

/**
 * Base component size options
 */
declare const BASE_SIZES: {
    readonly SMALL: "small";
    readonly DEFAULT: "default";
    readonly LARGE: "large";
};
type BaseSize = (typeof BASE_SIZES)[keyof typeof BASE_SIZES];
/**
 * Base component style variants
 */
declare const BASE_VARIANTS: {
    readonly OUTLINED: "outlined";
    readonly FILLED: "filled";
};
type BaseVariant = (typeof BASE_VARIANTS)[keyof typeof BASE_VARIANTS];

interface ScreenProps {
    /**
     * Enable scrolling for content area
     * @default true
     */
    enableScroll?: boolean;
    /**
     * Custom CSS class to apply to content area
     */
    styleClass?: string;
    /**
     * Show left panel (sidebar)
     * When false, only the main content area is displayed
     * @default true
     */
    showLeftPanel?: boolean;
    /**
     * Width of left panel (CSS value or flex number)
     * @default '1' (equal width with right panel)
     */
    leftPanelWidth?: string;
    /**
     * Width of right panel (CSS value or flex number)
     * @default '1'
     */
    rightPanelWidth?: string;
}
/**
 * CommonLayoutComponent - A reusable layout wrapper with fixed header and scrollable content
 * Now powered by directive-based layout system
 *
 * @example Basic usage with single content area
 * ```html
 * <app-common-layout [props]="{ showLeftPanel: false }">
 *   <div header>
 *     <h1>Dashboard</h1>
 *   </div>
 *   <div content>
 *     <p>Your content here...</p>
 *   </div>
 * </app-common-layout>
 * ```
 *
 * @example With left and right panels
 * ```html
 * <app-common-layout [props]="{ showLeftPanel: true, leftPanelWidth: '300px' }">
 *   <div header>Header</div>
 *   <div left>Sidebar content</div>
 *   <div right>Main content</div>
 * </app-common-layout>
 * ```
 */
declare class CommonLayoutComponent {
    props: _angular_core.InputSignal<ScreenProps>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CommonLayoutComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CommonLayoutComponent, "app-common-layout", never, { "props": { "alias": "props"; "required": false; "isSignal": true; }; }, {}, never, ["[header]", "[left]", "[right], [content]"], true, never>;
}

interface ICmmTab {
    title: string;
    value: number;
    tabPanelTemplate: TemplateRef<unknown>;
    pTabTemplate?: TemplateRef<unknown>;
}

declare class TabsComponent {
    tabs: _angular_core.InputSignal<ICmmTab[]>;
    activeTab: _angular_core.ModelSignal<string | number>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TabsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TabsComponent, "app-tabs", never, { "tabs": { "alias": "tabs"; "required": true; "isSignal": true; }; "activeTab": { "alias": "activeTab"; "required": true; "isSignal": true; }; }, { "activeTab": "activeTabChange"; }, never, never, true, never>;
}

declare enum DIALOG_ICON_ENUM {
    DELETE = "delete",
    WARNING = "warn",
    INFO = "info",
    SUCCESS = "success"
}

interface IDialogBase {
    title?: string;
    styleClass?: string;
    withMeta?: Record<string, any>;
    template?: TemplateRef<any>;
    customIconHeaderTemplate?: TemplateRef<unknown>;
}
interface IDialogConfig extends DynamicDialogConfig {
    withHeader: IDialogHeader;
    width?: string;
    height?: string;
    closable?: boolean;
    draggable?: boolean;
    resizable?: boolean;
    styleClass?: string;
    closeHandler?: (dialogRef: DynamicDialogRef) => void;
    customIconHeaderTemplate?: TemplateRef<unknown>;
    submitHandler?: (dialogRef: DynamicDialogRef, data: unknown) => void;
    templateHeader: TemplateRef<unknown>;
    templateFooter?: TemplateRef<unknown>;
    [key: string]: any;
}
interface IDialogHeader extends IDialogBase {
    closeHandler: (dialogRef: DynamicDialogRef) => void;
    hideCloseIcon?: boolean;
}
interface IDialogDelete extends IDialogConfig {
    titleConfirm: string;
    descriptionConfirm: string;
    btnCancelLabel?: string;
    btnConfirmLabel?: string;
    reasonLabel?: string;
    formGrDelete: FormGroup;
    placeholderReason?: string;
    maxLength?: number;
    note?: string;
    iconType?: DIALOG_ICON_ENUM;
}
interface IDialogConfirm extends IDialogConfig {
    content: string;
    title: string;
    description: string;
    btnCancelLabel?: string;
    btnConfirmLabel?: string;
    iconType?: DIALOG_ICON_ENUM;
    hint?: string;
    contentTemplate?: TemplateRef<any>;
}

declare class DialogDeleteComponent {
    meta: DynamicDialogConfig<any, any>;
    dialogRef: DynamicDialogRef<any>;
    submitted: boolean;
    data: IDialogDelete;
    constructor();
    getFormControlNameKey(): "deleteReason" | "reason";
    defaultMaxLength: number;
    handleSubmitForm(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DialogDeleteComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DialogDeleteComponent, "[cmm-dialog-delete]", never, {}, {}, never, never, true, never>;
}

declare class DialogHeaderComponent {
    meta: _angular_core.InputSignal<IDialogHeader>;
    eventClose: _angular_core.OutputEmitterRef<MouseEvent | undefined>;
    dialogRef: DynamicDialogRef<any>;
    handleClose(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DialogHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DialogHeaderComponent, "cmm-dialog-header", never, { "meta": { "alias": "meta"; "required": true; "isSignal": true; }; }, { "eventClose": "eventClose"; }, never, never, true, never>;
}

interface IDropdownItem {
    label: any;
    code?: string | number;
    id?: string | number;
    value: any;
}
interface IDropdownItemMultiSelect extends IDropdownItem {
    active: boolean;
    isAdmin?: number | string;
    [key: string]: unknown;
}
interface DropdownPanel {
    templateRef: TemplateRef<any>;
    readonly closed: EventEmitter<void>;
}

interface DropdownCheckboxProps {
    isLoading?: boolean;
    items?: IDropdownItemMultiSelect[];
    totalItems?: number;
    itemPerPage?: number;
    itemHeight?: number;
    placeholder?: string;
    filter?: boolean;
    appendOnly?: boolean;
    itemSelectedBeforeSearch?: IDropdownItemMultiSelect[];
    customPlaceHolderTemplate?: TemplateRef<unknown>;
    checkAll?: boolean;
    showCheckAll?: boolean;
    hasApplyLazyLoad?: boolean;
    labelItemClazz?: string;
    isNeedClearItem?: boolean;
    hasEventBlur?: boolean;
    maxLength?: number;
    emptyMessage?: string;
    styleClass?: string;
    searchPlaceholderLabel?: string;
    allLabel?: string;
    maxLabelSelected?: number;
    seletedItemLabel?: string;
    maxVisibleSearchItems?: number;
    dropdownIcon?: string;
    showClear?: boolean;
    disableCheckAllWhenNoResult?: boolean;
    appendTo?: string;
    checkAllCheckboxStyleClass?: string;
    floatLabel?: boolean;
    label?: string;
    [key: string]: any;
}
/**
 * Snapshot emitted with a filter action so consumers can handle search while
 * preserving the existing string-only eventFilter output contract.
 */
interface DropdownCheckboxFilterState {
    /** Current filter text submitted by the user. */
    value: string;
    /** Whether the component is currently in select-all mode. */
    checkAll: boolean;
    /** Current selected item count, including remote selections represented by select all. */
    selectedCount: number;
}

declare class DropdownCheckboxComponent implements ControlValueAccessor, OnDestroy {
    private injector;
    private onTouch;
    private onChange;
    isDisabled: boolean;
    readonly id: _angular_core.WritableSignal<string>;
    get isInvalid(): boolean;
    get isTouched(): boolean;
    get isDirty(): boolean;
    getViewportHeight(): string;
    writeValue(obj: IDropdownItemMultiSelect[] | IDropdownItemMultiSelect | null): void;
    handleClearSearch(): void;
    registerOnChange(fn: (value: IDropdownItemMultiSelect[] | IDropdownItemMultiSelect | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState?(isDisabled: boolean): void;
    handleCloseDropdown(): void;
    /**
     * Component props
     */
    props: _angular_core.InputSignal<DropdownCheckboxProps>;
    computedProps: _angular_core.Signal<{
        isLoading: boolean;
        items: IDropdownItemMultiSelect[];
        totalItems: number;
        itemPerPage: number;
        itemHeight: number;
        placeholder: string;
        filter: boolean;
        appendOnly: boolean;
        itemSelectedBeforeSearch: IDropdownItemMultiSelect[];
        customPlaceHolderTemplate: TemplateRef<unknown> | undefined;
        checkAll: boolean;
        showCheckAll: boolean;
        hasApplyLazyLoad: boolean;
        labelItemClazz: string;
        isNeedClearItem: boolean;
        hasEventBlur: boolean;
        maxLength: number;
        searchPlaceholderLabel: string;
        allLabel: string;
        emptyMessage: string;
        maxLabelSelected: number;
        seletedItemLabel: string;
        maxVisibleSearchItems: number;
        dropdownIcon: string;
        showClear: boolean;
        disableCheckAllWhenNoResult: boolean;
        checkAllCheckboxStyleClass: string;
        floatLabel: boolean;
        label: string;
        styleClass?: string;
        appendTo?: string;
    }>;
    /**
     * Callback to emit when load more is needed
     */
    eventEmitLoadMore: _angular_core.OutputEmitterRef<void>;
    /**
     * Legacy filter output. Emits only the submitted filter text so existing
     * consumers that bind (eventFilter) continue receiving a string.
     */
    eventFilter: _angular_core.OutputEmitterRef<string>;
    /**
     * Emits a filter-action snapshot for consumers that also need selection
     * context at the moment search is submitted.
     */
    eventFilterState: _angular_core.OutputEmitterRef<DropdownCheckboxFilterState>;
    /**
     * Callback to emit when item is clicked
     */
    eventClickItem: _angular_core.OutputEmitterRef<IDropdownItemMultiSelect[] | null>;
    /**
     * Callback to emit when check all is toggled
     */
    eventEmitCheckAll: _angular_core.OutputEmitterRef<boolean>;
    /**
     * Callback to emit when item is unchecked
     */
    eventUncheckedItem: _angular_core.OutputEmitterRef<IDropdownItemMultiSelect>;
    /**
     * Callback to emit when item is checked separately
     */
    eventCheckedSeparatelyItem: _angular_core.OutputEmitterRef<IDropdownItemMultiSelect>;
    /**
     * Custom item template
     */
    itemTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    /**
     * Custom empty template
     */
    emptyTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    viewport: _angular_core.Signal<CdkVirtualScrollViewport>;
    op: _angular_core.Signal<Popover>;
    dropdownWrapper: _angular_core.Signal<ElementRef<any>>;
    dropdownWidth: _angular_core.WritableSignal<number>;
    cdr: ChangeDetectorRef;
    render2: Renderer2;
    private ngZone;
    private resizeObserver?;
    private scrollUnlisten?;
    labelItemMaxWidths: number[];
    currentSelected: IDropdownItemMultiSelect[];
    private selectedCountSignal;
    activeIndex: number;
    labelSelected: string;
    localSearchItemList: IDropdownItemMultiSelect[] | undefined;
    inputValue: _angular_core.ModelSignal<string>;
    checkAllInternal: _angular_core.WritableSignal<boolean>;
    private previousCheckAllInput?;
    appendOnlyInternal: boolean;
    isDropdownOpen: _angular_core.WritableSignal<boolean>;
    isLabelFloated: _angular_core.Signal<boolean>;
    constructor();
    /**
     * handle check all items
     * @param evt
     */
    handleCheckAll(evt: boolean): void;
    /**
     * check click item
     * @param item
     */
    handleClickItem(item: IDropdownItemMultiSelect): void;
    updateLabelSelected(selectedCount?: number): void;
    mergeDistinctLists(currentList?: IDropdownItemMultiSelect[], beforeList?: IDropdownItemMultiSelect[]): IDropdownItemMultiSelect[];
    handleFilterUniqueItem(list: IDropdownItemMultiSelect[]): IDropdownItemMultiSelect[];
    handleScroll(evt: Event): void;
    handleClearItem(): void;
    resetMultiSelect(): void;
    resetFunction(options: {
        reset: () => void;
    }): void;
    customFilterFunction(val?: string): void;
    handleOpenDropdown(evt: MouseEvent | Event): void;
    /**
     * Register a document-level scroll listener when the popover opens.
     * Ignores scrolls that originate inside the cdk-virtual-scroll-viewport
     * so that the item list can be scrolled freely without closing the dropdown.
     */
    onPopoverShow(): void;
    /** Remove the document scroll listener (called on popover hide and destroy). */
    onPopoverHide(): void;
    private removeScrollListener;
    /**
     * Handle document mouse down event
     * @param event Mouse event
     */
    handleDocumentMouseDown(event: MouseEvent): void;
    handleToggleDropdown(evt: Event): void;
    handleKeyDown(event: KeyboardEvent): void;
    /**
     *  handle unselect items
     * @param evt
     */
    handleUnSelectItem(evt: IDropdownItemMultiSelect): void;
    trackByFn(index: number, item: IDropdownItemMultiSelect): string | number;
    /**
     * Calculate max-width for each label item based on available space
     */
    private calculateLabelWidths;
    /**
     * Get max-width for label text at specific index
     */
    getLabelTextMaxWidth(index: number): string;
    /**
     * Check if should show count instead of individual labels
     * Returns true if:
     * 1. Number of selected items exceeds maxLabelSelected OR
     * 2. Labels would overflow the container
     */
    shouldShowCount: _angular_core.Signal<boolean>;
    /**
     * Count number of selected items
     * @returns Number of selected items
     */
    countValue: _angular_core.Signal<number>;
    isCheckAllIndeterminate: _angular_core.Signal<boolean>;
    /**
     * Disable check all if there's no result to show
     */
    shouldInternalDisableCheckAll(): boolean;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DropdownCheckboxComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DropdownCheckboxComponent, "cmm-dropdown-checkbox", never, { "props": { "alias": "props"; "required": true; "isSignal": true; }; "inputValue": { "alias": "inputValue"; "required": false; "isSignal": true; }; }, { "eventEmitLoadMore": "eventEmitLoadMore"; "eventFilter": "eventFilter"; "eventFilterState": "eventFilterState"; "eventClickItem": "eventClickItem"; "eventEmitCheckAll": "eventEmitCheckAll"; "eventUncheckedItem": "eventUncheckedItem"; "eventCheckedSeparatelyItem": "eventCheckedSeparatelyItem"; "inputValue": "inputValueChange"; }, ["itemTemplate", "emptyTemplate"], never, true, never>;
}

interface DropdownLazyProps {
    isLoading?: boolean;
    items?: {
        [key: string]: unknown;
    }[];
    totalItems?: number;
    itemPerPage?: number;
    itemHeight?: number;
    maxVisibleSearchItems?: number;
    placeholder?: string;
    filter?: boolean;
    maxLengthFilter?: number;
    width?: string;
    appendOnly?: boolean;
    isShowIcon?: boolean;
    iconSrc?: string;
    customClass?: string;
    showClear?: boolean;
    hasBlurEvent?: boolean;
    emptyMessage?: string;
    dropdownIcon?: string;
    searchPlaceholderLabel?: string;
    appendTo?: string;
    floatLabel?: boolean;
    label?: string;
    resetControlStateOnClear?: boolean;
}

declare class DropdownLazyComponent implements ControlValueAccessor {
    private injector;
    private onTouch;
    private onChange;
    isDisabled: boolean;
    readonly id: _angular_core.WritableSignal<string>;
    get isInvalid(): boolean;
    get isTouched(): boolean;
    get isDirty(): boolean;
    writeValue(obj: unknown): void;
    handleClearSearch(): void;
    /**
    * Register a document-level scroll listener when the popover opens.
    * Ignores scrolls that originate inside the cdk-virtual-scroll-viewport
    * so that the item list can be scrolled freely without closing the dropdown.
    */
    onPopoverShow(): void;
    registerOnChange(fn: (value: unknown) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState?(isDisabled: boolean): void;
    handleCloseDropdown(): void;
    trackByFn(index: number, item: any): string | number;
    getViewportHeight(): string;
    /**
     * Component props
     */
    props: _angular_core.InputSignal<DropdownLazyProps>;
    computedProps: _angular_core.Signal<{
        isLoading: boolean;
        items: {
            [key: string]: unknown;
        }[];
        totalItems: number;
        itemPerPage: number;
        itemHeight: number;
        maxVisibleSearchItems: number;
        placeholder: string;
        filter: boolean;
        maxLengthFilter: number;
        width: string;
        appendOnly: boolean;
        isShowIcon: boolean;
        iconSrc: string;
        customClass: string;
        showClear: boolean;
        hasBlurEvent: boolean;
        dropdownIcon: string;
        searchPlaceholderLabel: string;
        resetControlStateOnClear: boolean;
        appendTo: string;
        floatLabel: boolean;
        label: string;
        emptyMessage?: string;
    }>;
    /**
     * Callback to emit when load more is needed
     */
    eventEmitLoadMore: _angular_core.OutputEmitterRef<string>;
    /**
     * Callback to emit when filter is applied
     */
    eventFilter: _angular_core.OutputEmitterRef<string>;
    /**
     * Callback to emit when item is clicked
     */
    eventClickItem: _angular_core.OutputEmitterRef<unknown>;
    /**
     * Callback to emit when text search is performed
     */
    eventTextSearchFunction: _angular_core.OutputEmitterRef<string>;
    viewport: _angular_core.Signal<CdkVirtualScrollViewport>;
    op: _angular_core.Signal<Popover>;
    /**
     * Custom item template
     */
    itemTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    /**
     * Custom empty template
     */
    emptyTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    dropdownWrapper: _angular_core.Signal<ElementRef<any>>;
    dropdownWidth: _angular_core.WritableSignal<number>;
    inputValue: _angular_core.ModelSignal<string>;
    render2: Renderer2;
    currentSelected: Record<string, any> | null;
    activeIndex: number;
    appendOnlyInternal: boolean;
    isDropdownOpen: _angular_core.WritableSignal<boolean>;
    private hasValue;
    isLabelFloated: _angular_core.Signal<boolean>;
    handleClickItem(item: Record<string, unknown>): void;
    handleScroll(evt: Event): void;
    handleClearItem(): void;
    handleResetControlState(): void;
    resetFunction(options: {
        reset: () => void;
    }): void;
    constructor();
    customFilterFunction(val: string): void;
    textSearchFunction(val: string): void;
    handleOpenDropdown(evt: unknown): void;
    /**
     * Handle document mouse down event
     * @param event Mouse event
     */
    handleDocumentMouseDown(event: MouseEvent): void;
    handleToggleDropdown(evt: Event): void;
    handleKeyDown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DropdownLazyComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DropdownLazyComponent, "cmm-dropdown-lazy", never, { "props": { "alias": "props"; "required": true; "isSignal": true; }; "inputValue": { "alias": "inputValue"; "required": false; "isSignal": true; }; }, { "eventEmitLoadMore": "eventEmitLoadMore"; "eventFilter": "eventFilter"; "eventClickItem": "eventClickItem"; "eventTextSearchFunction": "eventTextSearchFunction"; "inputValue": "inputValueChange"; }, ["itemTemplate", "emptyTemplate"], never, true, never>;
}

interface ToastData {
    avatar?: string;
    customIcon?: string;
    actionLabel?: string;
    actionCallback?: () => void;
    onCloseCallback?: () => void;
    [key: string]: any;
}
interface ToastMessage {
    severity?: ToastSeverity;
    summary?: string;
    detail?: string;
    life?: number;
    sticky?: boolean;
    closable?: boolean;
    key?: string;
    icon?: string;
    styleClass?: string;
    contentStyleClass?: string;
    data?: ToastData;
}
interface ToastOptions {
    life?: number;
    sticky?: boolean;
    closable?: boolean;
    key?: string;
    icon?: string;
    styleClass?: string;
    contentStyleClass?: string;
    data?: ToastData;
}
interface ToastConfig {
    position?: ToastPosition;
    life?: number;
    preventDuplicates?: boolean;
    showActionButton?: boolean;
    showCloseButton?: boolean;
}

declare class ToastService {
    readonly injector: Injector;
    /**
     * Show a success toast
     */
    success(summary: string, detail?: string, options?: ToastOptions): void;
    /**
     * Show an info toast
     */
    info(summary: string, detail?: string, options?: ToastOptions): void;
    /**
     * Show a warning toast
     */
    warn(summary: string, detail?: string, options?: ToastOptions): void;
    /**
     * Show an error toast
     */
    error(summary: string, detail?: string, options?: ToastOptions): void;
    /**
     * Show a toast with avatar
     */
    withAvatar(severity: ToastSeverity, summary: string, detail: string, avatar: string, options?: ToastOptions): void;
    /**
     * Show a toast with custom icon
     */
    withIcon(severity: ToastSeverity, summary: string, detail: string, icon: string, options?: ToastOptions): void;
    /**
     * Show a toast with action button
     */
    withAction(severity: ToastSeverity, summary: string, detail: string, actionLabel: string, actionCallback: () => void, options?: ToastOptions): void;
    /**
     * Success toast with action button
     */
    successWithAction(summary: string, detail: string, actionLabel: string, actionCallback: () => void, options?: ToastOptions): void;
    /**
     * Info toast with action button
     */
    infoWithAction(summary: string, detail: string, actionLabel: string, actionCallback: () => void, options?: ToastOptions): void;
    /**
     * Error toast with action button
     */
    errorWithAction(summary: string, detail: string, actionLabel: string, actionCallback: () => void, options?: ToastOptions): void;
    /**
     * Show a custom toast message with avatar and action
     */
    avatarWithAction(severity: ToastSeverity, summary: string, detail: string, avatar: string, actionLabel: string, actionCallback: () => void, options?: ToastOptions): void;
    /**
     * Generic show method
     */
    show(message: ToastMessage): void;
    /**
     * Show multiple toasts
     */
    showAll(messages: ToastMessage[]): void;
    /**
     * Clear all toasts or toasts with specific key
     */
    clear(key?: string): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ToastService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ToastService>;
}

declare class ToastComponent {
    key: _angular_core.InputSignal<string | undefined>;
    position: _angular_core.InputSignal<ToastPosition>;
    life: _angular_core.InputSignal<number>;
    showTransitionOptions: _angular_core.InputSignal<string>;
    hideTransitionOptions: _angular_core.InputSignal<string>;
    autoZIndex: _angular_core.InputSignal<boolean>;
    baseZIndex: _angular_core.InputSignal<number>;
    preventOpenDuplicates: _angular_core.InputSignal<boolean>;
    preventDuplicates: _angular_core.InputSignal<boolean>;
    styleClass: _angular_core.InputSignal<string | undefined>;
    breakpoints: _angular_core.InputSignal<Record<string, unknown> | undefined>;
    style: _angular_core.InputSignal<Record<string, any>>;
    ellipsisRows: _angular_core.InputSignal<number>;
    readonly toastService: ToastService;
    readonly injector: Injector;
    getSeverityIcon(severity?: string): string;
    getSeverityClass(severity?: string): string;
    getToastSummaryClass(severity?: string): string;
    handleAction(message: any): void;
    handleClose(message: any): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ToastComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ToastComponent, "app-toast", never, { "key": { "alias": "key"; "required": false; "isSignal": true; }; "position": { "alias": "position"; "required": false; "isSignal": true; }; "life": { "alias": "life"; "required": false; "isSignal": true; }; "showTransitionOptions": { "alias": "showTransitionOptions"; "required": false; "isSignal": true; }; "hideTransitionOptions": { "alias": "hideTransitionOptions"; "required": false; "isSignal": true; }; "autoZIndex": { "alias": "autoZIndex"; "required": false; "isSignal": true; }; "baseZIndex": { "alias": "baseZIndex"; "required": false; "isSignal": true; }; "preventOpenDuplicates": { "alias": "preventOpenDuplicates"; "required": false; "isSignal": true; }; "preventDuplicates": { "alias": "preventDuplicates"; "required": false; "isSignal": true; }; "styleClass": { "alias": "styleClass"; "required": false; "isSignal": true; }; "breakpoints": { "alias": "breakpoints"; "required": false; "isSignal": true; }; "style": { "alias": "style"; "required": false; "isSignal": true; }; "ellipsisRows": { "alias": "ellipsisRows"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

interface LoadingItem {
    id: string;
    isLoading: boolean;
    metadata?: Record<string, unknown>;
}
declare class LoadingService {
    private readonly loadingState;
    setLoading(loadingItem: LoadingItem): void;
    getLoading(): Observable<Map<string, LoadingItem>>;
    isAppLoading(): Observable<boolean>;
    getRequestLoading(reqId: string): Observable<LoadingItem | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<LoadingService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<LoadingService>;
}

declare class UbckLoading {
    private readonly ANIMATION_TOKEN_LOADING;
    readonly loadingService: LoadingService;
    options: _angular_core.WritableSignal<AnimationOptions>;
    getLoading: rxjs.Observable<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UbckLoading, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UbckLoading, "ubck-loading", never, {}, {}, never, never, false, never>;
}

/**
 * CmmLayoutDirective - Main layout container
 *
 * Takes 100vh of viewport height and sets up flexbox container.
 * Should be the root container for the layout system.
 *
 * @example
 * ```html
 * <div cmmLayout>
 *   <div cmmHeader>Header content</div>
 *   <div cmmContent>
 *     <div cmmLeftContent>Left panel</div>
 *     <div cmmRightContent>Right panel</div>
 *   </div>
 * </div>
 * ```
 */
declare class CmmLayoutDirective {
    private el;
    private renderer;
    private injector;
    private static stylesInjected;
    private static readonly minifiedCss;
    constructor();
    private injectStyles;
    private applyStyles;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmLayoutDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmLayoutDirective, "[cmmLayout]", never, {}, {}, never, never, true, never>;
}

/**
 * CmmHeaderDirective - Header section with dynamic height
 *
 * Header takes its natural content height and doesn't grow or shrink.
 * Must be used inside cmmLayout directive.
 *
 * @example
 * ```html
 * <div cmmLayout>
 *   <div cmmHeader>
 *     <h1>Page Title</h1>
 *     <nav>Navigation...</nav>
 *   </div>
 *   <div cmmContent>...</div>
 * </div>
 * ```
 */
declare class CmmHeaderDirective {
    private el;
    private renderer;
    private injector;
    private static stylesInjected;
    private static readonly minifiedCss;
    constructor();
    private injectStyles;
    private applyStyles;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmHeaderDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmHeaderDirective, "[cmmHeader]", never, {}, {}, never, never, true, never>;
}

/**
 * CmmContentDirective - Main content area that fills remaining height
 *
 * Automatically fills the remaining vertical space after header.
 * Sets up horizontal flexbox container for left and right panels.
 * Must be used inside cmmLayout directive.
 *
 * @example
 * ```html
 * <div cmmLayout>
 *   <div cmmHeader>Header</div>
 *   <div cmmContent>
 *     <div cmmLeftContent>Left panel</div>
 *     <div cmmRightContent>Right panel</div>
 *   </div>
 * </div>
 * ```
 */
declare class CmmContentDirective {
    private el;
    private renderer;
    private injector;
    private static stylesInjected;
    private static readonly minifiedCss;
    constructor();
    private injectStyles;
    private applyStyles;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmContentDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmContentDirective, "[cmmContent]", never, {}, {}, never, never, true, never>;
}

/**
 * CmmLeftContentDirective - Left panel in the content area
 *
 * Can optionally enable scrolling. Takes up specified width or flex proportion.
 * Must be used inside cmmContent directive.
 *
 * @input enableScroll - Enable scrolling for this panel (default: false)
 * @input width - CSS width value (e.g., '300px', '30%', or flex value like '1')
 *
 * @example
 * ```html
 * <div cmmContent>
 *   <div cmmLeftContent [enableScroll]="true" width="300px">
 *     Long content that can scroll...
 *   </div>
 *   <div cmmRightContent>Right panel</div>
 * </div>
 * ```
 */
declare class CmmLeftContentDirective {
    enableScroll: _angular_core.InputSignal<boolean>;
    width: _angular_core.InputSignal<string>;
    private el;
    private renderer;
    private injector;
    private static stylesInjected;
    private static readonly minifiedCss;
    constructor();
    private injectStyles;
    private applyStyles;
    private isFlexValue;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmLeftContentDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmLeftContentDirective, "[cmmLeftContent]", never, { "enableScroll": { "alias": "enableScroll"; "required": false; "isSignal": true; }; "width": { "alias": "width"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * CmmRightContentDirective - Right panel in the content area
 *
 * Can optionally enable scrolling. Takes up specified width or flex proportion.
 * Must be used inside cmmContent directive.
 *
 * @input enableScroll - Enable scrolling for this panel (default: false)
 * @input width - CSS width value (e.g., '300px', '30%', or flex value like '1')
 *
 * @example
 * ```html
 * <div cmmContent>
 *   <div cmmLeftContent>Left panel</div>
 *   <div cmmRightContent [enableScroll]="true" width="2">
 *     Long content that can scroll...
 *   </div>
 * </div>
 * ```
 */
declare class CmmRightContentDirective {
    enableScroll: _angular_core.InputSignal<boolean>;
    width: _angular_core.InputSignal<string>;
    private el;
    private renderer;
    private injector;
    private static stylesInjected;
    private static readonly minifiedCss;
    constructor();
    private injectStyles;
    private applyStyles;
    private isFlexValue;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmRightContentDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmRightContentDirective, "[cmmRightContent]", never, { "enableScroll": { "alias": "enableScroll"; "required": false; "isSignal": true; }; "width": { "alias": "width"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class CommonLayoutModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CommonLayoutModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<CommonLayoutModule, never, [typeof CmmContentDirective, typeof CmmLeftContentDirective, typeof CmmRightContentDirective, typeof CmmLayoutDirective, typeof CmmHeaderDirective], [typeof CmmContentDirective, typeof CmmLeftContentDirective, typeof CmmRightContentDirective, typeof CmmLayoutDirective, typeof CmmHeaderDirective]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<CommonLayoutModule>;
}

/**
 * this model for frontend usage
 */
type Permission = {
    permissionId: string;
    permissionCode: string;
    permissionName: string;
    permissionDescription: string;
    endpoint: string;
    method: string;
    active?: boolean;
};
type System = {
    systemId: string;
    systemCode: string;
    systemName: string;
    systemDescription: string;
    permissions: Permission[];
    active?: boolean;
};
type Roles = {
    roleId: string;
    roleName: string;
    system: string;
    roleDescription: string;
    status: string;
    totalPermissions: number;
    systems: System[];
};
type SCREEN_STATUS = 'EDITING' | 'VIEWONLY';
declare const SCREEN_STATUS_ENUM: {
    readonly EDITING: SCREEN_STATUS;
    readonly VIEWONLY: SCREEN_STATUS;
};

interface RoleProps extends Roles {
    screenMode: SCREEN_STATUS;
    fullPermissionsLabel: string;
    activeSystem?: string;
}
declare class RoleComponent {
    props: _angular_core.ModelSignal<RoleProps>;
    readonly currentSystem: _angular_core.WritableSignal<System | null>;
    handleActiveItemChange(system: System): void;
    handleCheckAllEvent(checked: boolean): void;
    constructor();
    handleCheckDefaultSystem(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<RoleComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<RoleComponent, "app-role", never, { "props": { "alias": "props"; "required": true; "isSignal": true; }; }, { "props": "propsChange"; }, never, never, true, never>;
}

type PermissionProps = System;
declare class PermissionComponent {
    props: _angular_core.ModelSignal<System>;
    screenMode: _angular_core.InputSignal<SCREEN_STATUS>;
    fullPermissionsLabel: _angular_core.InputSignal<string>;
    checkAllEvent: _angular_core.OutputEmitterRef<boolean>;
    checkItemEvent: _angular_core.OutputEmitterRef<System>;
    readonly inputId: string;
    readonly SCREEN_STATUS_ENUM: {
        readonly EDITING: SCREEN_STATUS;
        readonly VIEWONLY: SCREEN_STATUS;
    };
    handleToggleFullPermissions(evt: ToggleSwitchChangeEvent): void;
    handleCheckChange(): void;
    isCheckedAllPermissions(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<PermissionComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<PermissionComponent, "app-permission", never, { "props": { "alias": "props"; "required": true; "isSignal": true; }; "screenMode": { "alias": "screenMode"; "required": true; "isSignal": true; }; "fullPermissionsLabel": { "alias": "fullPermissionsLabel"; "required": false; "isSignal": true; }; }, { "props": "propsChange"; "checkAllEvent": "checkAllEvent"; "checkItemEvent": "checkItemEvent"; }, never, never, true, never>;
}

declare class UBCKDefereredSectionComponent {
    readonly el: ElementRef<any>;
    private observer;
    isVisible: _angular_core.WritableSignal<boolean>;
    private destroyRef;
    readonly loadContent: _angular_core.OutputEmitterRef<void>;
    private timeout;
    loadingContent: _angular_core.Signal<TemplateRef<any> | undefined>;
    constructor();
    handleImplementWhenDomStable(): void;
    handleComponentDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKDefereredSectionComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UBCKDefereredSectionComponent, "ubck-deferered-section", never, {}, { "loadContent": "loadContent"; }, ["loadingContent"], ["*"], true, never>;
}

declare class DialogConfirmComponent {
    meta: DynamicDialogConfig<any, any>;
    dialogRef: DynamicDialogRef<any>;
    submitted: boolean;
    data: IDialogConfirm;
    constructor();
    defaultMaxLength: number;
    handleSubmit(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DialogConfirmComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DialogConfirmComponent, "[cmm-dialog-confirm]", never, {}, {}, never, never, true, never>;
}

declare class LoadingModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<LoadingModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<LoadingModule, [typeof UbckLoading], [typeof i2$1.LottieComponent, typeof i2.CommonModule], [typeof UbckLoading]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<LoadingModule>;
}

declare const ANIMATION_TOKEN_LOADING: InjectionToken<AnimationOptions>;

declare enum DownloadState {
    Downloading = "Downloading",
    Waiting = "Waiting",
    Paused = "Paused",
    Error = "Error",
    Completed = "Completed"
}
interface DownloadProgress {
    id: string;
    fileName: string;
    state: DownloadState;
    loadedBytes?: number;
    totalBytes?: number;
    percent?: number;
    errorMsg?: string;
    fileType?: string;
    _blob?: Blob;
}
interface DownloadRequest {
    url: string;
    method: 'GET' | 'POST';
    body?: unknown;
    fileNameFallback: string;
}
/**
 * Consumer-tweakable knobs for the download manager (lib-portable).
 * Supplied via {@link provideDownloadManager}; consumers set only the fields they care
 * about and the rest fall back to {@link DEFAULT_DOWNLOAD_MANAGER_CONFIG}.
 */
interface DownloadManagerConfig {
    /**
     * API base URL prepended to a {@link DownloadRequest.url} that is API-relative
     * (e.g. `COUNTRY_API_CONST.EXPORT`). Keeps the manager lib-portable: each consumer
     * supplies its own base (ECAT/IAM) via {@link provideDownloadManager} instead of the
     * service importing `environment` directly. Already-absolute URLs bypass this.
     */
    baseUrl: string;
    /**
     * UC-07 / min-display-time: how long the Completed (100% + ✓) state stays visible
     * before the slot auto-clears. Also masks the small-file flash (a tiny export
     * finishes almost instantly, so without this pause the success state would flicker).
     */
    minDisplayTimeMs: number;
    /**
     * UC-01 / delay-before-download: how long the Waiting (Phase 2) state stays visible
     * after API completes successfully before transitioning to Downloading.
     */
    delayBeforeDownloadMs: number;
    /**
     * UC-02 / progress-duration: total duration (in ms) of the simulated progress bar.
     */
    progressDurationMs: number;
    /**
     * Delay (in ms) before the popover auto-closes once every download has completed.
     * Only applies when the list size is `<= autoCloseMaxItems`; larger lists never
     * auto-close (the user dismisses them manually).
     */
    autoCloseDelayMs: number;
    /**
     * List size at/below which the popover auto-closes after completion. Above this
     * threshold the popover stays open until the user closes it manually.
     */
    autoCloseMaxItems: number;
    /**
     * Clear previous download list when user start new download
     */
    clearPreviousDownloadList: boolean;
    httpContext?: HttpContext;
}

/**
 * Public contract for {@link DownloadNotifyComponent}: the per-slot styling map, the
 * template-ready view-model, and the typed contexts handed to projected content templates.
 *
 * Consumers import these from the library `public-api` to type their `tailwindClass` map and
 * their `#headerTemplate` / `#itemTemplate` overrides.
 */
/**
 * Per-slot Tailwind class overrides. Every key is optional; the value is **appended** to the
 * component's own default classes for that slot (defaults are never replaced), matching the
 * repo convention of layering custom classes through `[ngClass]`.
 */
interface DownloadNotifyClasses {
    /** Root popover container. */
    container?: string;
    /** Header bar (title + chevron + close). */
    header?: string;
    /** Header title text. */
    title?: string;
    /** Header subtitle (shown while minimized). */
    subtitle?: string;
    /** Scrollable list wrapper. */
    list?: string;
    /** A single download row. */
    item?: string;
    /** File-name text. */
    fileName?: string;
    /** Progress-bar track (background). */
    progressTrack?: string;
    /** Progress-bar fill. */
    progressBar?: string;
    /** Byte counter text. */
    byteCount?: string;
    /** Error message text. */
    errorText?: string;
    /** Actions row wrapper. */
    actions?: string;
    /** Cancel button. */
    cancelBtn?: string;
    /** Secondary button (pause / resume / retry). */
    secondaryBtn?: string;
}
/**
 * Flattened, template-ready projection of one download. Built once per item in a `computed`
 * so the template reads plain fields instead of calling predicate/format helpers per row.
 */
interface DownloadItemVm {
    id: string;
    /** Resolved filename, or `null` while a translation key should be shown instead. */
    fileName: string | null;
    /** Translation key for the waiting/preparing label, or `null` once a real filename exists. */
    fileNameKey: string | null;
    isDownloading: boolean;
    isPaused: boolean;
    isPreparing: boolean;
    isCompleted: boolean;
    isError: boolean;
    /** Excel icon vs. the empty-file placeholder. */
    showExcelIcon: boolean;
    /** Whether the progress/error row is rendered. */
    showProgressRow: boolean;
    /** Whether to render the error variant of the progress row. */
    showError: boolean;
    errorMsg: string;
    /** Whether the Cancel/Pause/Resume/Retry row is rendered. */
    showActions: boolean;
    /** A real percent has arrived (drives spinner vs. number). */
    hasPercent: boolean;
    percent: number;
    /** Whether the byte counter is rendered. */
    showBytes: boolean;
    loadedLabel: string;
    totalLabel: string;
}
/** Callbacks exposed to both default and projected item templates. */
interface DownloadItemActions {
    cancel: (id: string) => void;
    pause: (id: string) => void;
    resume: (id: string) => void;
    retry: (id: string) => void;
}
/** Callbacks exposed to both default and projected header templates. */
interface DownloadHeaderActions {
    toggleExpand: () => void;
    close: () => void;
}
/** `$implicit` value handed to the header template. */
interface DownloadHeaderState {
    isExpanded: boolean;
    completedCount: number;
    totalCount: number;
}
/** Typed context for a projected `#headerTemplate`. */
interface DownloadHeaderContext {
    $implicit: DownloadHeaderState;
    actions: DownloadHeaderActions;
}
/** Typed context for a projected `#itemTemplate`. */
interface DownloadItemContext {
    $implicit: DownloadItemVm;
    actions: DownloadItemActions;
}
/** Typed context for a projected `#fileIconTemplate` in the default item template. */
interface DownloadFileIconContext {
    $implicit: DownloadItemVm;
}

/**
 * Translation keys for the popover. Externalised so labels are i18n-driven and the
 * component stays lib-portable. Keys live under `DOWNLOAD.*` in public/translate/{vi,en}.json.
 */
declare const DOWNLOAD_NOTIFY_KEYS: {
    readonly title: "DOWNLOAD.TITLE";
    readonly subtitle: "DOWNLOAD.SUBTITLE";
    readonly preparing: "DOWNLOAD.PREPARING";
    readonly cancel: "DOWNLOAD.CANCEL";
    readonly retry: "DOWNLOAD.RETRY";
    readonly pause: "DOWNLOAD.PAUSE";
    readonly resume: "DOWNLOAD.RESUME";
    readonly waiting: "DOWNLOAD.WAITING";
};
/**
 * Centralised palette for the popover. Icon directives take colours as `[props]` strings, so the
 * hex values live here (referenced from the template) — a palette change is now a single edit.
 */
declare const DOWNLOAD_NOTIFY_COLORS: {
    readonly ink: "#0F1110";
    readonly muted: "#909090";
    readonly progressTrack: "#D0DDE9";
    readonly progressFill: "#1570EF";
    readonly progressTrackPaused: "#FEECE6";
    readonly progressPaused: "#F79009";
    readonly error: "#DE3730";
    readonly success: "#00894A";
    readonly secondary: "#0F5A43";
    readonly divider: "#E4E7EC";
};
declare class DownloadNotifyComponent {
    private readonly downloadManager;
    readonly i18nKeys: {
        readonly title: "DOWNLOAD.TITLE";
        readonly subtitle: "DOWNLOAD.SUBTITLE";
        readonly preparing: "DOWNLOAD.PREPARING";
        readonly cancel: "DOWNLOAD.CANCEL";
        readonly retry: "DOWNLOAD.RETRY";
        readonly pause: "DOWNLOAD.PAUSE";
        readonly resume: "DOWNLOAD.RESUME";
        readonly waiting: "DOWNLOAD.WAITING";
    };
    readonly colors: {
        readonly ink: "#0F1110";
        readonly muted: "#909090";
        readonly progressTrack: "#D0DDE9";
        readonly progressFill: "#1570EF";
        readonly progressTrackPaused: "#FEECE6";
        readonly progressPaused: "#F79009";
        readonly error: "#DE3730";
        readonly success: "#00894A";
        readonly secondary: "#0F5A43";
        readonly divider: "#E4E7EC";
    };
    /**
     * Max width (px) of the popover. The container sizes to its longest row
     * (`width: max-content`) and is capped here; longer filenames ellipsize + show a tooltip.
     */
    readonly maxWidth: _angular_core.InputSignal<number>;
    /** Min width (px) of the popover, so short filenames don't collapse it too narrow. */
    readonly minWidth: _angular_core.InputSignal<number>;
    /** Per-slot Tailwind class overrides; appended onto the component defaults. */
    readonly tailwindClass: _angular_core.InputSignal<DownloadNotifyClasses>;
    /** Convenience accessor so the template can read `cls().container` etc. */
    readonly cls: _angular_core.Signal<DownloadNotifyClasses>;
    readonly headerTemplate: _angular_core.Signal<TemplateRef<DownloadHeaderContext> | undefined>;
    readonly itemTemplate: _angular_core.Signal<TemplateRef<DownloadItemContext> | undefined>;
    /** Replaces only the file icon in the default item template. */
    readonly fileIconTemplate: _angular_core.Signal<TemplateRef<DownloadFileIconContext> | undefined>;
    /** Bridge the service slot to a signal for OnPush-friendly template reads. */
    private readonly active;
    /**
     * Single → list bridge: feeds the multi-download `@for` from the single slot.
     * Length 0 (nothing active) or 1 (one active download).
     */
    readonly downloads: _angular_core.Signal<DownloadProgress[]>;
    /** Template-ready view-models — all per-row logic resolved once, here. */
    readonly items: _angular_core.Signal<DownloadItemVm[]>;
    /** UC-06: expanded vs minimized (mini bar). */
    readonly isExpanded: _angular_core.WritableSignal<boolean>;
    /** UC-08: whether the popover is shown. Hiding it must NOT abort the download. */
    readonly isVisible: _angular_core.WritableSignal<boolean>;
    readonly completedCount: _angular_core.Signal<number>;
    readonly totalCount: _angular_core.Signal<number>;
    /** `$implicit` + actions bundle for the header template. */
    readonly headerContext: _angular_core.Signal<DownloadHeaderContext>;
    readonly itemActions: DownloadItemActions;
    readonly headerActions: DownloadHeaderActions;
    toggleExpand(): void;
    /** Manual close only hides the popover — the download keeps running in the service. */
    closePanel(): void;
    /** Collapse one {@link DownloadProgress} into the flat {@link DownloadItemVm} the template reads. */
    private toVm;
    /**
     * Resolve what the filename row shows. Returns a translation *key* (resolved in the template via
     * `| translate`, so it reacts to language switches) for the waiting/preparing phases, otherwise
     * the literal filename:
     * - "Đang chờ tải…" while the API is in flight,
     * - "Đang chuẩn bị…" until the real filename is resolved,
     * - then the actual filename.
     */
    private resolveFileName;
    /** Bytes → human-readable (e.g. "30.3 KB"). */
    private formatBytes;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DownloadNotifyComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DownloadNotifyComponent, "ubck-download-notify", never, { "maxWidth": { "alias": "maxWidth"; "required": false; "isSignal": true; }; "minWidth": { "alias": "minWidth"; "required": false; "isSignal": true; }; "tailwindClass": { "alias": "tailwindClass"; "required": false; "isSignal": true; }; }, {}, ["headerTemplate", "itemTemplate", "fileIconTemplate"], never, true, never>;
}

declare abstract class DownloadTransportInterface {
    /**
     * Start a download and stream its progress.
     *
     * Contract (relied on by DownloadManagerService):
     * - The transport OWNS every per-download state value. It drives ALL of
     *   `Waiting → Downloading → (Paused ⇄ Downloading) → Completed | Error`
     *   through `next`; the manager never synthesises state, it only mirrors each
     *   emission into its list (keyed by `id`) and runs list/UI lifecycle.
     * - The stream ALWAYS terminates with one terminal `next` followed by `complete()`.
     *   The Observable `error` channel is NOT used — the manager treats both outcomes
     *   uniformly as data.
     *   - On success: terminal `next` is a `Completed` progress carrying the resolved
     *     `fileName` (and percent 100).
     *   - On failure: terminal `next` is an `Error` progress carrying `errorMsg`
     *     (already extracted from the JSON error body) and the `fileName` if known.
     * - Pause/resume are NON-terminal: between Downloading and Completed the transport
     *   may emit a `Paused` progress (frozen percent) in response to {@link pause}, then
     *   resume `Downloading` from the same percent in response to {@link resume}.
     * - Every emitted progress must carry the same `id` it was started with, for the
     *   lifetime of the download.
     */
    abstract start(id: string, req: DownloadRequest): Observable<DownloadProgress>;
    cancel?(id: string): void;
    pause?(id: string): void;
    resume?(id: string): void;
    protected triggerExportFile(blob: Blob, fileName: string): void;
}

declare class DownloadManagerService {
    readonly activeDownload$: BehaviorSubject<DownloadProgress[]>;
    readonly isVisible: _angular_core.WritableSignal<boolean>;
    private seenIds;
    private requests;
    private cancelSignals;
    private transport;
    private readonly destroyRef;
    private readonly config;
    constructor();
    /**
     * Abort every in-flight download and release all per-download resources at once.
     *
     * Wired to {@link DestroyRef} in the constructor, so it runs exactly once when this
     * service instance is destroyed. As a `providedIn: 'root'` singleton it lives for the
     * app's lifetime and this never fires; it earns its keep only when a consumer of the
     * (lib-portable) manager provides it at a component/route scope and that scope is torn down — then in-flight HTTP
     * streams and pending timers must not outlive it.
     */
    private disposeAll;
    start(req: DownloadRequest, existingId?: string): void;
    private resolveUrl;
    handleComplete(id: string): void;
    cancel(id: string): void;
    /**
     * UC-04: Pause the in-flight download. Pure delegation — the transport owns state, so it
     * emits the `Paused` progress through its stream, which the `start()` subscription mirrors
     * into the list. The service never sets `Paused` itself.
     */
    pause(id: string): void;
    /** UC-04: Resume a paused download. Delegated — the transport re-emits `Downloading`. */
    resume(id: string): void;
    retry(id: string): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DownloadManagerService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<DownloadManagerService>;
}

/**
 * Resolve a download filename from a Content-Disposition header.
 *
 * RFC 5987 aware: prefers the `filename*=UTF-8''<pct-encoded>` form (which carries
 * the correct UTF-8 name, e.g. Vietnamese diacritics) over the plain ASCII
 * `filename="…"` form, then falls back to the provided fallback name.
 *
 * Resolution order:
 *   1. `filename*=<charset>''<pct-encoded>` → split on `''`, `decodeURIComponent` the value.
 *   2. `filename="…"` (ASCII form, quotes stripped).
 *   3. `fallbackName`.
 *
 * @param contentDisposition Content-Disposition header value (may be empty/null).
 * @param fallbackName Fallback filename when the header has no usable name.
 * @returns The resolved filename, or `fallbackName` when none is found.
 */
declare function resolveFileName(contentDisposition: string | null | undefined, fallbackName: string): string;

declare const DEFAULT_DOWNLOAD_MANAGER_CONFIG: DownloadManagerConfig;
/**
 * Plumbing — the resolved config the service injects. Private by convention:
 * consumers should NOT provide this token directly (its `useValue` is typed `any`, so a
 * partial object would silently drop fields). Use {@link provideDownloadManager} instead.
 */
declare const DOWNLOAD_MANAGER_CONFIG: InjectionToken<DownloadManagerConfig>;
/**
 * One-call setup for the Download Manager feature. Add the returned providers to a
 * `providers` array (in `app.config.ts` for app-wide use, or a component for a scoped
 * instance) and the popover (`<ubck-download-notify>`) plus {@link DownloadManagerService}
 * are ready to use — you do **not** need to register `DownloadManagerService` yourself.
 *
 * It wires three things:
 * 1. {@link DownloadManagerService} — the lifecycle service the component injects.
 * 2. The resolved config (your overrides merged onto {@link DEFAULT_DOWNLOAD_MANAGER_CONFIG}).
 * 3. The transport that performs the actual download (see `transportProvider`).
 *
 * **Where you call it controls the instance lifetime:** at the root injector you get one
 * app-wide manager; in a component's `providers` you get a fresh instance that is torn down
 * (and aborts in-flight downloads) with that component.
 *
 * @param config Partial config; only the fields you set are overridden, the rest fall back to
 *   {@link DEFAULT_DOWNLOAD_MANAGER_CONFIG}. Common field: `baseUrl` (prefixed onto relative
 *   download URLs).
 * @param transportProvider Optional provider for the {@link DownloadTransportInterface} token —
 *   i.e. how downloads actually run. Omit it to use the library's built-in
 *   {@link SyncBlobTransportService}. To plug in your own transport, pass a provider for the
 *   `DownloadTransportInterface` token:
 *   - `useExisting` — reuse a transport already registered elsewhere (e.g. one marked
 *     `@Injectable({ providedIn: 'root' })`). Preferred when the transport is a root singleton,
 *     so you don't end up with two instances.
 *   - `useClass` — let Angular create a new instance bound to the token.
 * @returns The providers to spread/add into a `providers` array.
 *
 * @example
 * // Default transport, app-wide:
 * // app.config.ts
 * providers: [
 *   provideDownloadManager({ baseUrl: environment.apiUrl }),
 * ]
 *
 * @example
 * // Your own transport (a root-singleton service) — reuse it via useExisting:
 * providers: [
 *   provideDownloadManager(
 *     { baseUrl: environment.apiUrl },
 *     { provide: DownloadTransportInterface, useExisting: MyHttpTransportService },
 *   ),
 * ]
 *
 * @example
 * // A throwaway/fake transport for a demo or test — useClass:
 * providers: [
 *   provideDownloadManager(
 *     { minDisplayTimeMs: 1500 },
 *     { provide: DownloadTransportInterface, useClass: FakeDownloadTransport },
 *   ),
 * ]
 */
declare function provideDownloadManager(config?: Partial<DownloadManagerConfig>, transportProvider?: Provider): Provider[];

/**
 * Upload Component Types & Interfaces
 * Following SOLID - Interface Segregation Principle
 */

interface FileValidationError {
    type: 'size' | 'type' | 'limit' | 'duplicate' | 'custom';
    message: string;
    file?: File;
}
interface FileMetadata {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}
interface UploadValidationConfig {
    maxFileSize: number;
    maxFiles: number;
    minFiles: number;
    accept: string;
    invalidFileSizeMessageDetail?: string;
    invalidFileLimitMessageDetail?: string;
    invalidFileTypeMessageDetail?: string;
    invalidFileSizeMessageSummary?: string;
    invalidFileTypeMessageSummary?: string;
    invalidFileLimitMessageSummary?: string;
}
interface UploadUIConfig {
    title: string;
    chooseLabel: string;
    dropZoneLabel: string;
    orLabel: string;
    acceptInfoLabel: string;
    primaryButtonLabel: string;
    secondaryButtonLabel: string;
    importNoteLabel: string;
    templateLinkLabel: string;
    importWarningLabel: string;
}
interface UploadBehaviorConfig {
    name: string;
    url: string;
    method: FileUploadMethod;
    multiple: boolean;
    disabled: boolean;
    auto: boolean;
    showTemplateLink: boolean;
    showImportNotes: boolean;
    showFooter: boolean;
}
interface UploadConfig extends UploadValidationConfig, UploadUIConfig, UploadBehaviorConfig {
}
interface UploadProps {
    name?: string;
    url?: string;
    method?: FileUploadMethod;
    multiple?: boolean;
    disabled?: boolean;
    auto?: boolean;
    maxFileSize?: number;
    maxFiles?: number;
    minFiles?: number;
    accept?: string;
    title?: string;
    chooseLabel?: string;
    dropZoneLabel?: string;
    orLabel?: string;
    acceptInfoLabel?: string;
    primaryButtonLabel?: string;
    secondaryButtonLabel?: string;
    importNoteLabel?: string;
    templateLinkLabel?: string;
    importWarningLabel?: string;
    showTemplateLink?: boolean;
    showImportNotes?: boolean;
    showFooter?: boolean;
    showProgressBar?: boolean;
    uploading?: boolean;
    uploadPercent?: number;
    fileItemTemplate?: TemplateRef<unknown>;
    invalidFileSizeMessageDetail?: string;
    invalidFileLimitMessageDetail?: string;
    invalidFileTypeMessageDetail?: string;
    invalidFileSizeMessageSummary?: string;
    invalidFileTypeMessageSummary?: string;
    invalidFileLimitMessageSummary?: string;
    summary?: string;
    fileNameClass?: string;
    [key: string]: any;
}
interface UploadTemplates {
    headerTemplate?: TemplateRef<any>;
    contentTemplate?: TemplateRef<any>;
    emptyTemplate?: TemplateRef<any>;
    infoTemplate?: TemplateRef<any>;
    footerTemplate?: TemplateRef<any>;
}
interface UploadState {
    files: File[];
    errors: FileValidationError[];
    isUploading: boolean;
    isDragOver: boolean;
}
interface UploadDerivedState {
    hasFiles: boolean;
    fileCount: number;
    totalSize: number;
    totalSizeFormatted: string;
    isValid: boolean;
    canSubmit: boolean;
}
interface FileSelectEventData {
    files: File[];
    timestamp: number;
}
interface FileRemoveEventData {
    file: File;
    index: number;
}
interface ValidationErrorEventData {
    errors: FileValidationError[];
    timestamp: number;
}
interface IFileValidator {
    validateFiles(files: File[], config: UploadValidationConfig): FileValidationError[];
    validateFileType(file: File, accept: string): boolean;
    validateFileSize(file: File, maxSize: number): boolean;
}
interface IFileFormatter {
    formatFileSize(bytes: number): string;
    getFileIcon(file: File): string;
    extractFileExtension(filename: string): string;
}
interface IUploadFacade {
    readonly files: () => File[];
    readonly errors: () => FileValidationError[];
    readonly isUploading: () => boolean;
    readonly isDragOver: () => boolean;
    readonly hasFiles: () => boolean;
    readonly fileCount: () => number;
    readonly isValid: () => boolean;
    readonly canSubmit: () => boolean;
    selectFiles(files: File[]): void;
    removeFile(index: number): void;
    clearFiles(): void;
    setDragOver(isDragOver: boolean): void;
    handleDrop(files: File[]): void;
}

declare class FileValidationService implements IFileValidator {
    /**
     * Validate array of files against configuration
     * Returns array of validation errors (empty if valid)
     */
    validateFiles(files: File[], config: UploadValidationConfig, existingFiles?: File[]): FileValidationError[];
    /**
     * Validate file count against min/max limits
     */
    private validateFileCount;
    /**
     * Validate individual file
     */
    private validateSingleFile;
    /**
     * Validate file type against accept pattern
     */
    validateFileType(file: File, accept: string): boolean;
    /**
     * Validate file size against max size
     */
    validateFileSize(file: File, maxSize: number): boolean;
    /**
     * Check if files array is valid
     */
    isValid(files: File[], config: UploadValidationConfig): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<FileValidationService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<FileValidationService>;
}

declare class UploadFacade implements IUploadFacade {
    private readonly validationService;
    private readonly filesState;
    private readonly errorsState;
    private readonly uploadingState;
    private readonly dragOverState;
    private readonly dragInvalidState;
    private readonly dragErrorsState;
    private readonly validationConfig;
    private readonly multipleFlag;
    readonly files: _angular_core.Signal<File[]>;
    readonly errors: _angular_core.Signal<FileValidationError[]>;
    readonly isUploading: _angular_core.Signal<boolean>;
    readonly isDragOver: _angular_core.Signal<boolean>;
    readonly isDragInvalid: _angular_core.Signal<boolean>;
    readonly dragErrors: _angular_core.Signal<FileValidationError[]>;
    readonly hasFiles: _angular_core.Signal<boolean>;
    readonly fileCount: _angular_core.Signal<number>;
    readonly totalSize: _angular_core.Signal<number>;
    readonly isValid: _angular_core.Signal<boolean>;
    readonly canSubmit: _angular_core.Signal<boolean>;
    readonly totalSizeFormatted: _angular_core.Signal<string>;
    constructor(validationService: FileValidationService);
    /**
     * Update validation configuration
     */
    updateConfig(config: Partial<UploadValidationConfig>): void;
    /**
     * Set multiple flag
     */
    setMultiple(multiple: boolean): void;
    /**
     * Select files (from file input or initial set)
     */
    selectFiles(files: File[]): void;
    /**
     * Remove file at specific index
     */
    removeFile(index: number): void;
    /**
     * Clear all files
     */
    clearFiles(): void;
    /**
     * Validate dragged files without adding them
     * Returns validation errors with type only (no message)
     * Parent component can handle error messages themselves
     */
    validateDraggedFiles(files: File[]): FileValidationError[];
    /**
     * Handle drag & drop
     */
    handleDrop(files: File[]): FileValidationError[];
    setDragOver(isDragOver: boolean): void;
    setDragInvalid(isInvalid: boolean): void;
    /**
     * Validate files during drag without modifying state
     * Note: During dragover, we can only check MIME types, not full file validation
     */
    validateOnDragOver(dragEvent: DragEvent): void;
    /**
     * Helper to convert extension to MIME types
     */
    private extensionToMimeTypes;
    setUploading(isUploading: boolean): void;
    private validateCurrentFiles;
    /**
     * Manually trigger validation
     */
    validate(): FileValidationError[];
    getFiles(): File[];
    getErrors(): FileValidationError[];
    /**
     * Format bytes to human-readable size
     * @private - Utility wrapper
     */
    private formatBytes;
    /**
     * Set files directly (for ControlValueAccessor writeValue)
     */
    setFiles(files: File[] | null): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UploadFacade, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<UploadFacade>;
}

interface DialogTemplates {
    header?: Type<any>;
    footer?: Type<any>;
    content?: Type<any>;
}
declare class CommonDialogService extends DialogService {
    private readonly commonConfig;
    openDialog<C, D>(component: Type<C>, data: D, config?: DynamicDialogConfig & {
        templates?: DialogTemplates;
    }): Observable<unknown>;
    openDialogWithRef<C, D>(component: Type<C>, data: D, config?: DynamicDialogConfig & {
        templates?: DialogTemplates;
    }): DynamicDialogRef;
    open(component: Type<any>, config: DynamicDialogConfig): DynamicDialogRef<any>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CommonDialogService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<CommonDialogService>;
}

/**
 * this model from server response
 */
type RoleModel = {
    id: string;
    code: string;
    name: string;
    description: string;
    status: string;
    system: string;
    createdAt: string;
    updatedAt: string;
    createdByName: string | null;
    updatedByName: string | null;
    totalPermissions: number;
    permissionGroups: PermissionModelGroup[];
    userIds: string[];
    users: any[] | null;
};
type PermissionModelGroup = {
    id: string;
    code: string;
    name: string;
    description: string;
    displayOrder: number;
    permissions: PermissionModel[];
};
type PermissionModel = {
    id: string;
    code: string;
    name: string;
    description: string;
    endpoint: string;
    method: string;
};

declare class PermissionUtil {
    static convertRoleModelToRolesPermission(role: RoleModel): Roles;
}

/**
 * Upload Utilities - Pure Functions Only
 * Following SOLID - Single Responsibility Principle
 *
 * RULES:
 * - NO signals
 * - NO dependency injection
 * - NO side effects
 * - Deterministic outputs only
 */

/**
 * Map common file extensions to their MIME types
 * @pure
 */
declare function extensionToMimeType(extension: string): string[];
/**
 * Format bytes to human-readable file size
 * @pure
 */
declare function formatFileSize(bytes: number): string;
/**
 * Convert human-readable size to bytes
 * @pure
 */
declare function parseFileSize(size: string): number;
/**
 * Check if file matches accepted type pattern
 * @pure
 */
declare function isFileTypeAccepted(file: File, accept: string): boolean;
/**
 * Extract file extension from filename
 * @pure
 */
declare function getFileExtension(filename: string): string;
/**
 * Get PrimeNG icon class for file type
 * @pure
 */
declare function getFileIcon(file: File): string;
/**
 * Extract metadata from File object
 * @pure
 */
declare function extractFileMetadata(file: File): FileMetadata;
/**
 * Convert FileList to File array
 * @pure
 */
declare function fileListToArray(fileList: FileList | null): File[];
/**
 * Filter files by accepted types
 * @pure
 */
declare function filterFilesByType(files: File[], accept: string): File[];
/**
 * Remove file at index immutably
 * @pure
 */
declare function removeFileAtIndex(files: File[], index: number): File[];
/**
 * Add files respecting multiple flag
 * @pure
 */
declare function addFiles(currentFiles: File[], newFiles: File[], multiple: boolean): File[];
/**
 * Limit files to max count
 * @pure
 */
declare function limitFiles(files: File[], maxFiles: number): File[];
/**
 * Build file size error message
 * @pure
 */
declare function buildFileSizeErrorMessage(filename: string, actualSize: number, maxSize: number): string;
/**
 * Build file type error message
 * @pure
 */
declare function buildFileTypeErrorMessage(filename: string): string;
/**
 * Build file limit error message
 * @pure
 */
declare function buildFileLimitErrorMessage(limit: number): string;
/**
 * Build min files error message
 * @pure
 */
declare function buildMinFilesErrorMessage(minFiles: number): string;
/**
 * Build duplicate file error message
 * @pure
 */
declare function buildDuplicateFileErrorMessage(filename: string): string;
/**
 * Check if file already exists in the file list
 * Compares by name, size, and lastModified timestamp
 * @pure
 */
declare function isFileDuplicate(file: File, existingFiles: File[]): boolean;
/**
 * Filter out duplicate files from a new file list
 * @pure
 */
declare function filterDuplicateFiles(newFiles: File[], existingFiles: File[]): File[];
/**
 * Extract files from DragEvent
 * @pure
 */
declare function extractFilesFromDragEvent(event: DragEvent): File[];
/**
 * Check if drag event contains files
 * @pure
 */
declare function dragEventHasFiles(event: DragEvent): boolean;
/**
 * Get file extensions from drag event items during dragover
 * Note: Full file access only available on drop, but we can check types
 * @pure
 */
declare function getDraggedFileTypes(event: DragEvent): string[];
/**
 * Check if any dragged file types match the accept pattern
 * @pure
 */
declare function validateDraggedTypes(event: DragEvent, accept: string): boolean;
/**
 * File type categories
 */
type FileType = 'excel' | 'pdf' | 'word' | 'image' | 'other';
/**
 * Get file type category based on MIME type and extension
 * @pure
 */
declare function getFileType(file: File): FileType;

declare class UploadComponent implements ControlValueAccessor {
    private readonly facade;
    props: _angular_core.InputSignal<UploadProps>;
    cvaDisabled: _angular_core.WritableSignal<boolean>;
    readonly uploadComponent: _angular_core.Signal<FileUpload | undefined>;
    computedProps: _angular_core.Signal<{
        name: string;
        url: string;
        method: _khcn_core_ui.FileUploadMethod;
        multiple: boolean;
        disabled: boolean;
        auto: boolean;
        maxFileSize: number;
        maxFiles: number;
        minFiles: number;
        accept: string;
        title: string;
        chooseLabel: string;
        dropZoneLabel: string;
        orLabel: string;
        acceptInfoLabel: string;
        primaryButtonLabel: string;
        secondaryButtonLabel: string;
        importNoteLabel: string;
        templateLinkLabel: string;
        importWarningLabel: string;
        showTemplateLink: boolean;
        showImportNotes: boolean;
        showFooter: boolean;
        uploading: boolean;
        showProgressBar: boolean;
        uploadPercent: number;
        fileItemTemplate: TemplateRef<unknown> | null;
        invalidFileSizeMessageDetail: string;
        invalidFileLimitMessageDetail: string;
        invalidFileTypeMessageDetail: string;
        invalidFileSizeMessageSummary: string;
        invalidFileTypeMessageSummary: string;
        invalidFileLimitMessageSummary: string;
        summary: string;
        fileNameClass: string;
    }>;
    fileSelect: _angular_core.OutputEmitterRef<File[]>;
    fileRemove: _angular_core.OutputEmitterRef<File>;
    validationError: _angular_core.OutputEmitterRef<FileValidationError>;
    dragValidationError: _angular_core.OutputEmitterRef<FileValidationError[]>;
    primaryAction: _angular_core.OutputEmitterRef<File[]>;
    secondaryAction: _angular_core.OutputEmitterRef<void>;
    templateDownload: _angular_core.OutputEmitterRef<void>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    contentTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    emptyTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    infoTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    fileItemTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    readonly selectedFiles: _angular_core.Signal<File[]>;
    readonly validationErrors: _angular_core.Signal<FileValidationError[]>;
    readonly isUploading: _angular_core.Signal<boolean>;
    readonly isDragOver: _angular_core.Signal<boolean>;
    readonly isDragInvalid: _angular_core.Signal<boolean>;
    readonly dragErrors: _angular_core.Signal<FileValidationError[]>;
    readonly hasFiles: _angular_core.Signal<boolean>;
    readonly fileCount: _angular_core.Signal<number>;
    readonly isValid: _angular_core.Signal<boolean>;
    readonly canSubmit: _angular_core.Signal<boolean>;
    isDragError: _angular_core.Signal<boolean>;
    private onChange;
    private onTouched;
    writeValue(value: File[] | null): void;
    registerOnChange(fn: (value: File[] | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    constructor();
    onSelect(event: FileSelectEvent, msgs: {
        severity: string;
        text: string;
    }[] | undefined): void;
    onRemove(event: FileRemoveEvent): void;
    onUpload(_: FileUploadEvent): void;
    onError(event: FileUploadErrorEvent): void;
    onClear(_event: Event): void;
    onRemoveFile(file: File, index: number): void;
    onRemoveFileUploadWithTemplate(event: Event, index: number): void;
    onChoose(_event: Event, chooseCallback: () => void): void;
    onDragOver(event: DragEvent): void;
    onDragLeave(event: DragEvent): void;
    onDrop(event: DragEvent): void;
    onPrimaryAction(): void;
    onSecondaryAction(): void;
    onTemplateDownload(): void;
    formatFileSize(bytes: number): string;
    getFileType(file: File): FileType;
    getTotalSize(): string;
    clearFiles(): void;
    addFiles(files: File[]): void;
    getFiles(): File[];
    getErrors(): FileValidationError[];
    totalSizeFormatted(): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UploadComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UploadComponent, "app-upload", never, { "props": { "alias": "props"; "required": false; "isSignal": true; }; }, { "fileSelect": "fileSelect"; "fileRemove": "fileRemove"; "validationError": "validationError"; "dragValidationError": "dragValidationError"; "primaryAction": "primaryAction"; "secondaryAction": "secondaryAction"; "templateDownload": "templateDownload"; }, ["headerTemplate", "contentTemplate", "emptyTemplate", "infoTemplate", "footerTemplate", "fileItemTemplate"], never, true, never>;
}

declare const DEFAULT_MAX_LENGTH_TEXT = 255;
declare const DynamicFieldTypes: {
    readonly TEXT: "text";
    readonly PASSWORD: "password";
    readonly TEXTAREA: "textarea";
    readonly CHECKBOX: "checkbox";
    readonly SWITCH: "switch";
    readonly RADIO: "radio";
    readonly SELECT: "select";
    readonly MULTISELECT: "multiselect";
    readonly DATE: "date";
    readonly FILE: "file";
    readonly CUSTOM: "custom";
    readonly SELECT_LAZY: "select-lazy";
    readonly MULTISELECT_LAZY: "multiselect-lazy";
    readonly READONLY: "readonly";
};
type DynamicFieldType = (typeof DynamicFieldTypes)[keyof typeof DynamicFieldTypes];
interface DynamicOption {
    label: string;
    value: any;
    disabled?: boolean;
    active?: boolean;
}
interface DynamicFormItem<T = any> {
    key: string;
    type: DynamicFieldType;
    value?: T;
    label?: string;
    placeholder?: string;
    placeholderParams?: Record<string, any>;
    hint?: string;
    floatLabel?: boolean | 'over' | 'in' | 'on';
    readonly?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    isRequired?: boolean;
    validators?: ValidatorFn[];
    asyncValidators?: AsyncValidatorFn[];
    order?: number;
    /**
     * group id (for same row)
     * same group => same row
     */
    group?: string | number;
    /** ===== Group-level Validation ===== */
    validatorsGroup?: ValidatorFn[];
    asyncValidatorsGroup?: AsyncValidatorFn[];
    /**
     * number of columns in this group (1 | 2 | 3 | 4)
     * default = auto
     */
    /**
     * span inside group (like grid-column)
     */
    groupLabel?: string;
    classes?: {
        control?: string;
        label?: string;
        group?: string;
        wrapper?: string;
        hintContent?: string;
    };
    rules?: {
        disabled?: boolean | ((ctx: any) => boolean);
        readonly?: boolean | ((ctx: any) => boolean);
        hidden?: boolean | ((ctx: any) => boolean);
        required?: boolean | ((ctx: any) => boolean);
        options?: any[] | ((ctx: any) => any[]);
    };
    options?: DynamicOption[];
    props: Record<string, any> | any;
    visibleWhen?: (formValue: any, form: FormGroup) => boolean;
    disabledWhen?: (formValue: any, form: FormGroup) => boolean;
    children?: DynamicFormItem[];
    formControlTemplate?: any;
    customMessages?: Record<string, string>;
}
type PropsEnricher = (item: DynamicFormItem) => Partial<Record<string, any>>;
interface DynamicFormFacade {
    form: Signal<FormGroup>;
    items: Signal<DynamicFormItem[]>;
    isVisible(item: DynamicFormItem): boolean;
    isDisabled(item: DynamicFormItem): boolean;
    getControl(item: DynamicFormItem): AbstractControl<any, any> | null;
}
interface CmmDynamicFormBuilder {
    build(items: DynamicFormItem[], visibilityContext?: any): FormGroup;
}

declare class CmmDynamicFormFacade implements DynamicFormFacade {
    private readonly fb;
    private readonly service;
    readonly currentHint: _angular_core.WritableSignal<string>;
    private disabledSyncSub?;
    private readonly _config;
    private readonly _form;
    readonly items: Signal<DynamicFormItem[]>;
    /**
     * Group items by row
     */
    readonly groupedItems: Signal<{
        group: string | number;
        groupLabel: string | undefined;
        groupClasses: string | undefined;
        items: DynamicFormItem[];
    }[]>;
    readonly form: Signal<FormGroup>;
    /**
     * Computed signal to automatically update validators when visibility changes
     */
    private readonly validatorUpdater;
    /**
     * Getter to trigger validator updater - used in component effect
     */
    triggerValidatorUpdate(): boolean;
    init(config: DynamicFormItem[]): void;
    private warnFloatLabel;
    isVisible(item: DynamicFormItem): boolean;
    isDisabled(item: DynamicFormItem): boolean;
    /**
     * Check if all items in a group are visible
     */
    isGroupVisible(items: DynamicFormItem[]): boolean;
    isVisibleSignal(item: DynamicFormItem): Signal<boolean>;
    getControl(item: DynamicFormItem): i6.AbstractControl<any, any, any> | null;
    readonly ObjectAssign: {
        <T extends {}, U>(target: T, source: U): T & U;
        <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
        <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
        (target: object, ...sources: any[]): any;
    };
    readonly ObjectKeys: {
        (o: object): string[];
        (o: {}): string[];
    };
    readonly ObjectValues: {
        <T>(o: {
            [s: string]: T;
        } | ArrayLike<T>): T[];
        (o: {}): any[];
    };
    readonly ObjectEntries: {
        <T>(o: {
            [s: string]: T;
        } | ArrayLike<T>): [string, T][];
        (o: {}): [string, any][];
    };
    private readonly propEnrichers;
    private enrichProps;
    groupItemsByRow(items: DynamicFormItem[]): Array<{
        group: string | number;
        groupLabel: string | undefined;
        groupClasses: string | undefined;
        items: DynamicFormItem[];
    }>;
    isDiabledSignal(item: DynamicFormItem): Signal<boolean>;
    /**
     * Submit form with validation check
     * @returns FormGroup value if valid, null if invalid
     */
    submitForm(): any | null;
    /**
     * Get all validation errors from the form
     */
    getFormErrors(): Record<string, any>;
    /**
     * Check if form has any errors
     */
    hasErrors(): boolean;
    /**
     * Update validators for all form controls based on current visibility
     */
    updateValidatorsBasedOnVisibility(): void;
    /** Re-evaluate isDisabled for every control and reflect it on the FormControl. */
    private syncDisabledState;
    /** (Re)subscribe the disabled sync to the given form's value changes. */
    private setupDisabledSync;
    getViewFormValue(formItem: DynamicFormItem): any;
    setHint(hint: string): void;
    destroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDynamicFormFacade, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<CmmDynamicFormFacade>;
}

declare class CmmDynamicFormComponent implements OnDestroy {
    readonly facade: CmmDynamicFormFacade;
    readonly id: _angular_core.WritableSignal<string>;
    op: Signal<Popover | undefined>;
    DynamicFieldTypes: {
        readonly TEXT: "text";
        readonly PASSWORD: "password";
        readonly TEXTAREA: "textarea";
        readonly CHECKBOX: "checkbox";
        readonly SWITCH: "switch";
        readonly RADIO: "radio";
        readonly SELECT: "select";
        readonly MULTISELECT: "multiselect";
        readonly DATE: "date";
        readonly FILE: "file";
        readonly CUSTOM: "custom";
        readonly SELECT_LAZY: "select-lazy";
        readonly MULTISELECT_LAZY: "multiselect-lazy";
        readonly READONLY: "readonly";
    };
    DEFAULT_MAX_LENGTH_TEXT: number;
    readonly config: _angular_core.InputSignal<DynamicFormItem<any>[]>;
    readonly items: Signal<DynamicFormItem<any>[]>;
    readonly form: Signal<FormGroup>;
    readonly isVisible: (item: DynamicFormItem) => boolean;
    readonly isDisabled: (item: DynamicFormItem) => boolean;
    readonly isGroupVisible: (items: DynamicFormItem[]) => boolean;
    constructor();
    handleBlur(event: FocusEvent): void;
    handleClickHint(item: DynamicFormItem): void;
    handleClearField(item: DynamicFormItem): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDynamicFormComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmDynamicFormComponent, "cmm-dynamic-form", never, { "config": { "alias": "config"; "required": false; "isSignal": true; }; }, {}, never, never, false, never>;
}

interface DatepickerProps {
    dateFormat?: string;
    minDate?: Date | null;
    maxDate?: Date | null;
    selectionMode?: 'single' | 'multiple' | 'range';
    showTime?: boolean;
    hourFormat?: '12' | '24';
    timeOnly?: boolean;
    showIcon?: boolean;
    iconDisplay?: 'input' | 'button';
    showButtonBar?: boolean;
    showClear?: boolean;
    readonlyInput?: boolean;
    inline?: boolean;
    placeholder?: string;
    styleClass?: string;
    panelStyleClass?: string;
    inputStyleClass?: string;
    rangeSeparator?: string;
    viewMode?: 'month' | 'year' | 'date';
    ariaLabel?: string;
    ariaLabelledBy?: string;
    inputId?: string;
    showOtherMonths?: boolean;
    selectOtherMonths?: boolean;
    numberOfMonths?: number;
    locale?: any;
    firstDayOfWeek?: number;
    disabledDates?: Date[];
    disabledDays?: number[];
    disabled?: boolean;
    tabindex?: number;
    fluid?: boolean;
    hideOnDateTimeSelect?: boolean;
    isStrictRangeValidate?: boolean;
}

declare class CmmDatepickerComponent implements ControlValueAccessor, Validator {
    readonly serializeId: string;
    private _value;
    onTouched: () => void;
    onChange: (_: any) => void;
    date: Date | Date[] | undefined;
    disabled: _angular_core.ModelSignal<boolean>;
    props: _angular_core.InputSignal<DatepickerProps | undefined>;
    propsComputed: _angular_core.Signal<{
        dateFormat: string;
        viewMode: "date" | "month" | "year";
        selectionMode: "single" | "multiple" | "range";
        showIcon: boolean;
        rangeSeparator: string;
        iconDisplay: "input" | "button";
        showTime: boolean;
        hourFormat: "12" | "24";
        showButtonBar: boolean;
        tabindex: number;
        fluid: boolean;
        isStrictRangeValidate: boolean;
        minDate?: Date | null;
        maxDate?: Date | null;
        timeOnly?: boolean;
        showClear?: boolean;
        readonlyInput?: boolean;
        inline?: boolean;
        placeholder?: string;
        styleClass?: string;
        panelStyleClass?: string;
        inputStyleClass?: string;
        ariaLabel?: string;
        ariaLabelledBy?: string;
        inputId?: string;
        showOtherMonths?: boolean;
        selectOtherMonths?: boolean;
        numberOfMonths?: number;
        locale?: any;
        firstDayOfWeek?: number;
        disabledDates?: Date[];
        disabledDays?: number[];
        disabled?: boolean;
        hideOnDateTimeSelect?: boolean;
    }>;
    private onValidatorChange;
    private rangeValidationRequested;
    private readonly selectionModeValidatorEffect;
    hasExplicitOnClickOutside: _angular_core.InputSignal<boolean>;
    eventDateChange: _angular_core.OutputEmitterRef<Date | Date[] | undefined>;
    onSelect: _angular_core.OutputEmitterRef<Date | Date[]>;
    onClear: _angular_core.OutputEmitterRef<void>;
    onMonthChange: _angular_core.OutputEmitterRef<DatePickerMonthChangeEvent>;
    onYearChange: _angular_core.OutputEmitterRef<DatePickerYearChangeEvent>;
    onFocus: _angular_core.OutputEmitterRef<Event>;
    onBlur: _angular_core.OutputEmitterRef<Event>;
    onShow: _angular_core.OutputEmitterRef<void>;
    onHide: _angular_core.OutputEmitterRef<void>;
    onClickOutside: _angular_core.OutputEmitterRef<Date | Date[] | undefined>;
    dateTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    footerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    decadeTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    previousIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    nextIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    triggerIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    clearIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    decrementIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    incrementIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    inputIconTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    handleDateChange(): void;
    handleSelect(event: Date | Date[]): void;
    handleInput(event: any): void;
    handleClickOutside(): void;
    handleClear(): void;
    handleMonthChange(event: DatePickerMonthChangeEvent): void;
    handleYearChange(event: DatePickerYearChangeEvent): void;
    handleFocus(event: Event): void;
    handleBlur(event: Event): void;
    handleShow(): void;
    handleHide(): void;
    updateValue(value: any): void;
    writeValue(obj: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    private isValidDate;
    setDisabledState?(isDisabled: boolean): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDatepickerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CmmDatepickerComponent, "cmm-datepicker", ["cmmDatepicker"], { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "props": { "alias": "props"; "required": false; "isSignal": true; }; "hasExplicitOnClickOutside": { "alias": "hasExplicitOnClickOutside"; "required": false; "isSignal": true; }; }, { "disabled": "disabledChange"; "eventDateChange": "eventDateChange"; "onSelect": "onSelect"; "onClear": "onClear"; "onMonthChange": "onMonthChange"; "onYearChange": "onYearChange"; "onFocus": "onFocus"; "onBlur": "onBlur"; "onShow": "onShow"; "onHide": "onHide"; "onClickOutside": "onClickOutside"; }, ["dateTemplate", "headerTemplate", "footerTemplate", "decadeTemplate", "previousIconTemplate", "nextIconTemplate", "triggerIconTemplate", "clearIconTemplate", "decrementIconTemplate", "incrementIconTemplate", "inputIconTemplate"], never, true, never>;
}

interface TypographyConfig {
    copyable?: boolean;
    editable?: boolean;
    ellipsis?: boolean | EllipsisConfig;
    type?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';
    disabled?: boolean;
}
interface TextFontSizes {
    base?: string;
    small?: string;
    large?: string;
}
interface EllipsisConfig {
    rows?: number;
    expandable?: boolean;
    suffix?: string;
    symbol?: string;
    onEllipsis?: (isEllipsis: boolean) => void;
}
interface HeadingConfig extends TypographyConfig {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}
interface HeadingFontSizes {
    h1?: string;
    h2?: string;
    h3?: string;
    h4?: string;
    h5?: string;
    h6?: string;
}

declare class CmmTypographyConfigService {
    private config;
    private headingSizes;
    private textSizes;
    setConfig(config: Partial<TypographyConfig>): void;
    getConfig(): Partial<TypographyConfig>;
    setHeadingSizes(sizes: Partial<HeadingFontSizes>): void;
    getHeadingSize(level: 1 | 2 | 3 | 4 | 5 | 6): string;
    setTextSizes(sizes: Partial<TextFontSizes>): void;
    getTextSize(size?: 'base' | 'small' | 'large'): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTypographyConfigService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<CmmTypographyConfigService>;
}

declare class CmmCopyableDirective extends BaseComponent implements OnDestroy {
    _componentStyle: UBCKCustomTypographyStyles;
    appCopyable: boolean;
    copyText?: string;
    tooltipText: string;
    tooltipDuration: number;
    tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
    copy: EventEmitter<string>;
    private tooltip;
    private copyTimeout?;
    handleCopy(event: Event): void;
    private getTextContent;
    private copyToClipboard;
    private showTooltip;
    private positionTooltip;
    private applyTooltipStyles;
    private hideTooltip;
    private removeTooltip;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmCopyableDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmCopyableDirective, "[cmmCopyable]", never, { "appCopyable": { "alias": "appCopyable"; "required": false; }; "copyText": { "alias": "copyText"; "required": false; }; "tooltipText": { "alias": "tooltipText"; "required": false; }; "tooltipDuration": { "alias": "tooltipDuration"; "required": false; }; "tooltipPosition": { "alias": "tooltipPosition"; "required": false; }; }, { "copy": "copy"; }, never, never, true, never>;
    static ngAcceptInputType_appCopyable: unknown;
}

/**
 * Editable feature - can be used independently
 */
declare class CmmEditableDirective extends BaseComponent {
    _componentStyle: UBCKCustomTypographyStyles;
    appEditable: boolean;
    disabled: boolean;
    contentChange: EventEmitter<string>;
    handleBlur(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmEditableDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmEditableDirective, "[cmmEditable]", never, { "appEditable": { "alias": "appEditable"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, { "contentChange": "contentChange"; }, never, never, true, never>;
    static ngAcceptInputType_appEditable: unknown;
    static ngAcceptInputType_disabled: unknown;
}

declare class CmmTypographyDirective extends BaseComponent implements OnInit, OnDestroy {
    protected configService: CmmTypographyConfigService;
    _componentStyle: UBCKCustomTypographyStyles;
    copyable: boolean;
    editable: boolean;
    disabled: boolean;
    ellipsis: boolean;
    type: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted' | 'form-required';
    contentChange: EventEmitter<string>;
    copy: EventEmitter<string>;
    get isSecondary(): boolean;
    get isSuccess(): boolean;
    get isWarning(): boolean;
    get isDanger(): boolean;
    get isMuted(): boolean;
    get isFormRequired(): boolean;
    ngOnInit(): void;
    ngOnDestroy(): void;
    protected getTextContent(): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTypographyDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmTypographyDirective, "[cmmTypography]", ["cmmTypography"], { "copyable": { "alias": "copyable"; "required": false; }; "editable": { "alias": "editable"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "ellipsis": { "alias": "ellipsis"; "required": false; }; "type": { "alias": "type"; "required": false; }; }, { "contentChange": "contentChange"; "copy": "copy"; }, never, never, true, [{ directive: typeof CmmEllipsisDirective; inputs: { "appEllipsis": "ellipsis"; "ellipsisRows": "ellipsisRows"; "ellipsisExpandable": "ellipsisExpandable"; "ellipsisSuffix": "ellipsisSuffix"; "ellipsisSymbol": "ellipsisSymbol"; }; outputs: { "ellipsisChange": "ellipsisChange"; }; }, { directive: typeof CmmCopyableDirective; inputs: { "appCopyable": "copyable"; }; outputs: { "copy": "copy"; }; }, { directive: typeof CmmEditableDirective; inputs: { "appEditable": "editable"; "disabled": "disabled"; }; outputs: { "contentChange": "contentChange"; }; }]>;
    static ngAcceptInputType_copyable: unknown;
    static ngAcceptInputType_editable: unknown;
    static ngAcceptInputType_disabled: unknown;
    static ngAcceptInputType_ellipsis: unknown;
}

declare class CmmHeadingDirective extends BaseComponent implements OnInit {
    _componentStyle: UBCKCustomTypographyStyles;
    private configService;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    fontSize?: string;
    ngOnInit(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmHeadingDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmHeadingDirective, "h1[cmmHeading], h2[cmmHeading], h3[cmmHeading], h4[cmmHeading], h5[cmmHeading], h6[cmmHeading]", never, { "level": { "alias": "level"; "required": false; }; "weight": { "alias": "weight"; "required": false; }; "fontSize": { "alias": "fontSize"; "required": false; }; }, {}, never, never, true, [{ directive: typeof CmmTypographyDirective; inputs: { "copyable": "copyable"; "editable": "editable"; "disabled": "disabled"; "ellipsis": "ellipsis"; "type": "type"; }; outputs: { "contentChange": "contentChange"; "copy": "copy"; }; }]>;
}

declare class CmmTextDirective extends BaseComponent implements OnInit {
    _componentStyle: UBCKCustomTypographyStyles;
    private configService;
    size?: 'small' | 'base' | 'large';
    fontSize?: string;
    get isParagraph(): boolean;
    ngOnInit(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTextDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<CmmTextDirective, "p[cmmParagraph], span[cmmText]", never, { "size": { "alias": "size"; "required": false; }; "fontSize": { "alias": "fontSize"; "required": false; }; }, {}, never, never, true, [{ directive: typeof CmmTypographyDirective; inputs: { "copyable": "copyable"; "editable": "editable"; "disabled": "disabled"; "ellipsis": "ellipsis"; "type": "type"; }; outputs: { "contentChange": "contentChange"; "copy": "copy"; }; }]>;
}

declare class CmmTypepographyModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTypepographyModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<CmmTypepographyModule, never, [typeof CmmTypographyDirective, typeof CmmHeadingDirective, typeof CmmTextDirective, typeof CmmEllipsisDirective, typeof CmmCopyableDirective, typeof CmmEditableDirective], [typeof CmmTypographyDirective, typeof CmmHeadingDirective, typeof CmmTextDirective, typeof CmmEllipsisDirective, typeof CmmCopyableDirective, typeof CmmEditableDirective]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<CmmTypepographyModule>;
}

declare const UBCK_VALIDATION_THEME: ({ dt }: any) => string;
declare const UBCK_VALIDATION_CLASSES: {};
declare class UbckValidationStyles extends BaseStyle {
    name: string;
    style: ({ dt }: any) => string;
    classes: {};
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UbckValidationStyles, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<UbckValidationStyles>;
}

/**
 * Message Function Type
 *
 * Function that returns a validation error message string.
 * Can accept parameters for dynamic message generation.
 */
type MessageFunction = (params?: any) => string;
/**
 * Validation Messages Type
 *
 * Key-value pairs where key is the validator name and value is either:
 * - String template with placeholders (legacy)
 * - Function that returns translated message (recommended)
 *
 * Template placeholders (for string templates):
 * - {{0}} or {{fieldName}} = field name/label
 * - {{1}} or specific param name = parameter value (min, max, minLength, maxLength, etc.)
 *
 * Example:
 * {
 *   required: (params) => translateService.instant('VALIDATION.required', params),
 *   email: '{{0}} must be a valid email'  // legacy string template
 * }
 */
type ValidationMessages = {
    [key: string]: string | MessageFunction;
};
/**
 * Injection Token for Validation Messages
 *
 * Use this token to provide custom validation messages at any level:
 * - Application level (app.config.ts)
 * - Feature level (feature providers)
 * - Component level (component providers)
 *
 * @example Application Level
 * ```typescript
 * // app.config.ts
 * import { VALIDATION_MESSAGES_TOKEN, VALIDATION_MESSAGES } from '@shared/validation';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     { provide: VALIDATION_MESSAGES_TOKEN, useValue: VALIDATION_MESSAGES }
 *   ]
 * };
 * ```
 *
 * @example Custom Messages Override
 * ```typescript
 * import { VALIDATION_MESSAGES_TOKEN } from '@shared/validation';
 *
 * const CUSTOM_MESSAGES = {
 *   required: '{{0}} không được để trống',
 *   email: '{{0}} phải là email hợp lệ',
 *   minlength: '{{0}} tối thiểu {{requiredLength}} ký tự'
 * };
 *
 * @Component({
 *   providers: [
 *     { provide: VALIDATION_MESSAGES_TOKEN, useValue: CUSTOM_MESSAGES }
 *   ]
 * })
 * ```
 *
 * @example Multi-language Support
 * ```typescript
 * import { VALIDATION_MESSAGES_TOKEN, VALIDATION_MESSAGES, VALIDATION_MESSAGES_EN } from '@shared/validation';
 * import { TranslateService } from '@ngx-translate/core';
 *
 * export function validationMessagesFactory(translate: TranslateService) {
 *   const currentLang = translate.currentLang;
 *   return currentLang === 'en' ? VALIDATION_MESSAGES_EN : VALIDATION_MESSAGES;
 * }
 *
 * // In providers
 * {
 *   provide: VALIDATION_MESSAGES_TOKEN,
 *   useFactory: validationMessagesFactory,
 *   deps: [TranslateService]
 * }
 * ```
 */
declare const VALIDATION_MESSAGES_TOKEN: InjectionToken<ValidationMessages>;

declare function provideValidationMessages(): Provider;
/**
 * Provides validation messages with custom overrides.
 * Custom messages can be strings or functions that return translated strings.
 *
 * @param customMessages - Partial object with custom message overrides
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { provideCustomValidationMessages } from '@shared/validation';
 *
 * const customMessages = {
 *   required: (params) => `${params.fieldName} is mandatory!`,
 *   email: (params) => translateService.instant('CUSTOM.email', params)
 * };
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideCustomValidationMessages(customMessages)
 *   ]
 * };
 * ```
 */
declare function provideCustomValidationMessages(customMessages: Partial<ValidationMessages>): Provider;

/**
 * Validation Messages Factory Functions
 *
 * Each message is a function that uses TranslateService to get the message
 * This approach provides:
 * - Reactive language switching
 * - Type safety
 * - Centralized translation management
 * - No need for manual factory setup
 *
 * Usage in validation:
 * - {{0}} = field name/label
 * - {{1}} = parameter value (min, max, minLength, maxLength, etc.)
 *
 * Translation key format: VALIDATION.{errorKey}
 * Example: VALIDATION.required, VALIDATION.email
 */
/**
 * Create validation messages object with translate functions
 * Call this function to get messages that are reactive to language changes
 */
declare function createValidationMessages(translateService?: TranslateService): {
    [key: string]: MessageFunction;
};

/**
 * Validation Service - Simplified Version
 *
 * ✅ Dynamic placeholder replacement
 * ✅ Multi-language support (auto handled by TranslateService)
 * ✅ Support named placeholders: {{fieldName}}, {{minLength}}, {{max}}, etc.
 * ✅ Support indexed placeholders: {{0}}, {{1}}, {{2}}, etc.
 * ✅ Flexible and extensible
 * ✅ Function-based messages that automatically react to language changes
 * ✅ Injectable messages via VALIDATION_MESSAGES_TOKEN
 */
declare class ValidationService {
    private translateService;
    private injectedMessages;
    private currentLang;
    private messagesSignal;
    messages: _angular_core.Signal<_khcn_core_ui.ValidationMessages>;
    /**
     * Get current messages (for reactivity tracking)
     */
    getMessages(): {
        [key: string]: string | MessageFunction;
    };
    /**
     * Set or extend validation messages
     *
     * Note: For application-wide custom messages, prefer using providers:
     * - provideValidationMessages()
     * - provideCustomValidationMessages()
     */
    setMessages(messages: {
        [key: string]: string | MessageFunction;
    }): void;
    /**
     * Get error message for a control
     *
     * @param control - FormControl instance
     * @param fieldName - Display name of the field
     * @param customMessages - Optional custom messages for this field
     * @returns Error message string or empty string
     */
    getErrorMessage(control: AbstractControl | null, fieldName?: string, customMessages?: {
        [key: string]: string;
    }): string;
    /**
     * Get all error messages for a form
     */
    getAllErrorMessages(form: FormGroup, fieldNames: {
        [key: string]: string;
    }): {
        [key: string]: string;
    };
    /**
     * Check if control has error (and is touched)
     */
    hasError(control: AbstractControl | null): boolean;
    /**
     * Check if control has specific error
     */
    hasSpecificError(control: AbstractControl | null, errorKey: string): boolean;
    /**
     * Mark all controls in a FormGroup as touched
     */
    markFormGroupTouched(formGroup: FormGroup): void;
    /**
     * Get validation classes for a control
     */
    getValidationClasses(control: AbstractControl | null): string;
    /**
     * Format message with dynamic placeholders
     *
     * Supports:
     * 1. Named placeholders: {{fieldName}}, {{minLength}}, {{max}}, etc.
     * 2. Indexed placeholders: {{0}}, {{1}}, {{2}}, etc.
     * 3. Special placeholders: {{value}}, {{actualLength}}, etc.
     *
     * Examples:
     * - "{{fieldName}} là bắt buộc" → "Email là bắt buộc"
     * - "{{fieldName}} phải có ít nhất {{minLength}} ký tự" → "Username phải có ít nhất 6 ký tự"
     * - "Giá trị phải từ {{min}} đến {{max}}" → "Giá trị phải từ 1 đến 100"
     * - "{{0}} không đúng định dạng {{1}}" → "Email không đúng định dạng email"
     *
     * @private
     */
    private formatMessage;
    /**
     * Build context object for placeholder replacement
     *
     * @private
     */
    private buildMessageContext;
    /**
     * Replace all placeholders in template with values from context
     *
     * Supports:
     * - {{fieldName}}, {{minLength}}, etc. (named)
     * - {{0}}, {{1}}, {{2}}, etc. (indexed)
     *
     * @private
     */
    private replacePlaceholders;
    /**
     * Format date for display
     * @private
     */
    private formatDate;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ValidationService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ValidationService>;
}

/**
 * Validation Error Component
 *
 * Displays validation error messages with optional icon
 *
 * This component is automatically created by ValidationDirective
 * You don't need to use it directly in templates
 */
declare class ValidationErrorComponent extends BaseComponent {
    message: string;
    showIcon: boolean;
    _componentStyle: UbckValidationStyles;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ValidationErrorComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ValidationErrorComponent, "app-validation-error", never, { "message": { "alias": "message"; "required": false; }; "showIcon": { "alias": "showIcon"; "required": false; }; }, {}, never, never, true, never>;
}

type ValidationDisplayMode = 'touched' | 'dirty' | 'always' | 'submit' | 'custom';
/**
 * Validation Directive - PrimeNG Support với Direct DOM Manipulation
 *
 * ✅ Không cần ::ng-deep
 * ✅ Không cần global CSS
 * ✅ Apply styles trực tiếp vào PrimeNG internal elements
 * ✅ Work với mọi PrimeNG version
 *
 * Usage:
 * ```html
 * <p-select
 *   formControlName="country"
 *   cmmValidation
 * />
 * ```
 */
declare class ValidationBaseDirective implements OnInit, DoCheck, OnDestroy {
    el: ElementRef;
    renderer: Renderer2;
    validationService: ValidationService;
    environmentInjector: EnvironmentInjector;
    appRef: ApplicationRef;
    ngControl: NgControl;
    fieldName: string;
    customMessages?: {
        [key: string]: string;
    };
    errorPosition: 'bottom' | 'top';
    showErrorIcon: boolean;
    errorClass: string;
    displayMode: ValidationDisplayMode;
    showValidation?: boolean;
    /**
     * Suppress error message rendering (useful for radio button groups)
     * When true, validation classes are still applied but error message is not shown
     */
    suppressError: boolean;
    /**
     * Custom selector to find the element after which the error should be inserted
     * Useful for complex component structures (e.g., password wrapper with toggle button)
     *
     * Example:
     * <div class="password-wrapper" #passwordWrapper>
     *   <input cmmValidation [errorInsertTarget]="passwordWrapper" />
     *   <button>Toggle</button>
     * </div>
     *
     * Or with class selector:
     * <input cmmValidation errorInsertTarget=".password-wrapper" />
     */
    errorInsertTarget?: HTMLElement | string;
    /**
     * PrimeNG component type (Optional - Auto-detected)
     * The directive automatically detects PrimeNG components by checking parent elements
     * for tags starting with 'p-' (e.g., p-dropdown, p-calendar, p-select)
     *
     * Only provide this input if auto-detection fails or you need to override it.
     *
     * Supported values:
     * - 'select' or 'dropdown' (p-select, p-dropdown)
     * - 'calendar' (p-calendar)
     * - 'inputNumber' (p-inputNumber)
     * - 'multiSelect' (p-multiSelect)
     * - 'autoComplete' (p-autoComplete)
     * - 'chips' (p-chips)
     * - 'inputMask' (p-inputMask)
     * - 'password' (p-password)
     * - 'inputTextarea' (p-inputTextarea)
     * - 'checkbox' (p-checkbox)
     * - 'radioButton' (p-radioButton)
     * - 'inputSwitch' (p-inputSwitch)
     *
     * Example (auto-detected):
     * <p-dropdown cmmValidation />
     *
     * Example (manual override):
     * <p-select cmmValidation primengComponent="select" />
     */
    primengComponent?: string;
    /**
     * Wrapper selector (fallback for custom cases)
     */
    wrapperSelector?: string;
    /**
     * Error container selector
     */
    errorContainer?: string;
    /**
     * Border color for invalid state
     */
    invalidBorderColor: string;
    /**
     * Border color for valid state
     */
    validBorderColor: string;
    errorComponentRef?: ComponentRef<ValidationErrorComponent>;
    destroy$: Subject<void>;
    control?: AbstractControl | null;
    wrapperElement?: HTMLElement;
    primengInnerElement?: HTMLElement;
    previousTouched: boolean;
    previousDirty: boolean;
    previousValid: boolean;
    previousDisabled: boolean;
    previousShowValidation?: boolean;
    lastErrorMessage: string;
    translateService: TranslateService | null;
    constructor(el: ElementRef, renderer: Renderer2, validationService: ValidationService, environmentInjector: EnvironmentInjector, appRef: ApplicationRef, ngControl: NgControl);
    onBlur(): void;
    ngOnInit(): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    findWrapperElement(): HTMLElement | undefined;
    findPrimeNGInnerElement(): HTMLElement | undefined;
    shouldShowError(): boolean;
    updateValidationState(): void;
    updateClasses(): void;
    updateInlineStyles(): void;
    removeInlineStyles(): void;
    showError(errorMessage: string): void;
    removeErrorElement(): void;
    getErrorInsertTarget(): HTMLElement;
    /**
     * Extract fieldName from error object if provided
     * This allows backend or custom validators to specify the field name directly
     *
     * Example error object:
     * { required: { fieldName: 'Họ tên' } }
     * { minlength: { fieldName: 'Mật khẩu', requiredLength: 8 } }
     */
    extractFieldNameFromError(): string | undefined;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ValidationBaseDirective, [null, null, null, null, null, { optional: true; host: true; }]>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<ValidationBaseDirective, "[cmmValidation]", never, { "fieldName": { "alias": "fieldName"; "required": false; }; "customMessages": { "alias": "customMessages"; "required": false; }; "errorPosition": { "alias": "errorPosition"; "required": false; }; "showErrorIcon": { "alias": "showErrorIcon"; "required": false; }; "errorClass": { "alias": "errorClass"; "required": false; }; "displayMode": { "alias": "displayMode"; "required": false; }; "showValidation": { "alias": "showValidation"; "required": false; }; "suppressError": { "alias": "suppressError"; "required": false; }; "errorInsertTarget": { "alias": "errorInsertTarget"; "required": false; }; "primengComponent": { "alias": "primengComponent"; "required": false; }; "wrapperSelector": { "alias": "wrapperSelector"; "required": false; }; "errorContainer": { "alias": "errorContainer"; "required": false; }; "invalidBorderColor": { "alias": "invalidBorderColor"; "required": false; }; "validBorderColor": { "alias": "validBorderColor"; "required": false; }; }, {}, never, never, true, never>;
}

/**
 * Validation Directive with Auto-injected Styles
 *
 * This wrapper automatically injects validation styles when directive is used
 * Similar to how PrimeNG components work
 *
 * @example Basic Usage
 * ```html
 * <input formControlName="email" cmmValidation />
 * ```
 *
 * @example Access validation state via template reference
 * ```html
 * <input formControlName="email" cmmValidation #emailValidation="cmmValidation" />
 *
 * <!-- Check if has errors -->
 * <div *ngIf="emailValidation.hasError">
 *   Có lỗi: {{ emailValidation.errorMessage }}
 * </div>
 *
 * <!-- Check if showing error (depends on displayMode) -->
 * <div *ngIf="emailValidation.isShowingError">
 *   Đang hiển thị lỗi
 * </div>
 *
 * <!-- Access specific errors -->
 * <div *ngIf="emailValidation.errors?.required">Required field</div>
 * <div *ngIf="emailValidation.errors?.email">Invalid email</div>
 * ```
 *
 * @example With submit mode
 * ```html
 * <form [formGroup]="form" (ngSubmit)="onSubmit()">
 *   <input
 *     formControlName="username"
 *     cmmValidation
 *     displayMode="submit"
 *     [showValidation]="isSubmitted"
 *     #usernameValidation="cmmValidation"
 *   />
 *
 *   <!-- Only show error after submit -->
 *   <div *ngIf="usernameValidation.isShowingError">
 *     {{ usernameValidation.errorMessage }}
 *   </div>
 * </form>
 * ```
 */
declare class ValidationDirective extends BaseComponent {
    _componentStyle: UbckValidationStyles;
    /**
     * Get core validation directive instance
     */
    private coreDirective;
    /**
     * Get the form control instance
     */
    get control(): AbstractControl | null | undefined;
    /**
     * Check if control has any validation errors
     * @returns true if control is invalid, false otherwise
     */
    get hasError(): boolean;
    /**
     * Check if validation error is currently being displayed
     * This considers the displayMode and showValidation settings
     * @returns true if error should be displayed based on displayMode
     */
    get isShowingError(): boolean;
    /**
     * Get all validation errors for the control
     * @returns ValidationErrors object or null
     */
    get errors(): ValidationErrors | null | undefined;
    /**
     * Get the current error message being displayed
     * @returns The formatted error message string
     */
    get errorMessage(): string;
    /**
     * Check if control is touched
     */
    get isTouched(): boolean;
    /**
     * Check if control is dirty
     */
    get isDirty(): boolean;
    /**
     * Check if control is valid
     */
    get isValid(): boolean;
    /**
     * Check if control is invalid
     */
    get isInvalid(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ValidationDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<ValidationDirective, "[cmmValidation]", ["cmmValidation"], {}, {}, never, never, true, [{ directive: typeof ValidationBaseDirective; inputs: { "fieldName": "fieldName"; "customMessages": "customMessages"; "errorPosition": "errorPosition"; "showErrorIcon": "showErrorIcon"; "errorClass": "errorClass"; "displayMode": "displayMode"; "showValidation": "showValidation"; "errorInsertTarget": "errorInsertTarget"; "primengComponent": "primengComponent"; "wrapperSelector": "wrapperSelector"; "errorContainer": "errorContainer"; "invalidBorderColor": "invalidBorderColor"; "validBorderColor": "validBorderColor"; "suppressError": "suppressError"; }; outputs: {}; }]>;
}

/**
 * Input Restriction Directive
 *
 * Restricts user input based on pattern and length constraints.
 * Prevents invalid characters from being entered (not just validation after input).
 *
 * Features:
 * - Pattern-based character restriction (block invalid input in real-time)
 * - Auto-trim when exceeding maxLength
 * - Optional trim whitespace on blur
 * - Optional uppercase/lowercase transformation
 * - Paste event handling
 *
 * @example
 * ```html
 * <!-- Only allow numbers -->
 * <input cmmInputRestrict [pattern]="'[0-9]'" maxlength="10" />
 *
 * <!-- Only alphanumeric -->
 * <input cmmInputRestrict [pattern]="'[a-zA-Z0-9]'" />
 *
 * <!-- Phone number (digits only) -->
 * <input cmmInputRestrict [pattern]="'\\d'" maxlength="10" [trimOnBlur]="true" />
 *
 * <!-- Username (alphanumeric + underscore) -->
 * <input cmmInputRestrict [pattern]="'[a-zA-Z0-9_]'" [maxLength]="20" [transform]="'lowercase'" />
 *
 * <!-- Decimal numbers -->
 * <input cmmInputRestrict [pattern]="'[0-9.]'" [customValidator]="decimalValidator" />
 * ```
 */
declare class InputRestrictBaseDirective implements OnInit {
    el: ElementRef<HTMLInputElement>;
    renderer: Renderer2;
    ngControl: NgControl;
    /**
     * Regular expression pattern for allowed characters
     * Can be string or RegExp object
     *
     * Common patterns:
     * - '[0-9]' or '\\d' - digits only
     * - '[a-zA-Z]' - letters only
     * - '[a-zA-Z0-9]' - alphanumeric
     * - '[a-zA-Z0-9_-]' - alphanumeric with underscore and hyphen
     * - '[0-9.]' - decimal numbers
     * - '[\\w]' - word characters (alphanumeric + underscore)
     */
    pattern?: string | RegExp;
    /**
     * Maximum length of input
     * Will auto-trim if user tries to exceed this length
     */
    maxLength?: number;
    /**
     * Trim whitespace on blur event
     * Default: false
     */
    trimOnBlur: boolean;
    /**
     * Transform input text
     * Options: 'uppercase' | 'lowercase' | 'none'
     * Default: 'none'
     */
    transform: 'uppercase' | 'lowercase' | 'none';
    /**
     * Allow spaces in input
     * Default: true
     */
    allowSpaces: boolean;
    /**
     * Custom validator function for complex validation
     * Return true if valid, false if invalid
     */
    customValidator?: (value: string) => boolean;
    /**
     * Block paste event if content doesn't match pattern
     * Default: true
     */
    blockInvalidPaste: boolean;
    /**
     * Format function to apply on blur
     * Receives raw value, returns formatted value
     *
     * @example
     * ```typescript
     * // Credit card: 1234-5678-9012-3456
     * formatOnBlur = (value: string) => {
     *   const cleaned = value.replace(/\D/g, '');
     *   return cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
     * }
     *
     * // Phone: (012) 345-6789
     * formatOnBlur = InputFormatters.phoneFormat('xxx-xxx-xxxx', '-')
     * ```
     */
    formatOnBlur?: (value: string) => string;
    regex?: RegExp;
    /**
     * True if host element is a single-line <input> (not a <textarea>).
     * Single-line inputs must never contain line breaks.
     */
    isSingleLine: boolean;
    constructor(el: ElementRef<HTMLInputElement>, renderer: Renderer2, ngControl: NgControl);
    ngOnInit(): void;
    /**
     * Handle keyboard input
     * Prevent invalid characters from being entered
     */
    onInput(event: Event): void;
    /**
     * Handle paste event
     * Validate pasted content against pattern
     */
    onPaste(event: ClipboardEvent): void;
    /**
     * Handle blur event
     * Apply trim and formatting
     */
    onBlur(event: Event): void;
    /**
     * Filter value by pattern
     * Remove characters that don't match the pattern
     */
    filterByPattern(value: string): string;
    /**
     * Apply text transformation
     */
    applyTransform(value: string): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<InputRestrictBaseDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<InputRestrictBaseDirective, "[cmmInputRestrict]", never, { "pattern": { "alias": "pattern"; "required": false; }; "maxLength": { "alias": "maxLength"; "required": false; }; "trimOnBlur": { "alias": "trimOnBlur"; "required": false; }; "transform": { "alias": "transform"; "required": false; }; "allowSpaces": { "alias": "allowSpaces"; "required": false; }; "customValidator": { "alias": "customValidator"; "required": false; }; "blockInvalidPaste": { "alias": "blockInvalidPaste"; "required": false; }; "formatOnBlur": { "alias": "formatOnBlur"; "required": false; }; }, {}, never, never, true, never>;
}

/**
 * Input Restrict Directive Wrapper
 *
 * Wraps the core InputRestrictDirective for easy importing.
 * This directive handles input restriction logic only - no styles needed.
 *
 * @example
 * ```typescript
 * import { InputRestrictDirective } from '@validations';
 *
 * @Component({
 *   standalone: true,
 *   imports: [InputRestrictDirective]
 * })
 * export class MyComponent {}
 * ```
 */
declare class InputRestrictDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<InputRestrictDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<InputRestrictDirective, "[cmmInputRestrict]", never, {}, {}, never, never, true, [{ directive: typeof InputRestrictBaseDirective; inputs: { "pattern": "pattern"; "maxLength": "maxLength"; "formatOnBlur": "formatOnBlur"; "transform": "transform"; "trimOnBlur": "trimOnBlur"; "allowSpaces": "allowSpaces"; "customValidator": "customValidator"; "blockInvalidPaste": "blockInvalidPaste"; }; outputs: {}; }]>;
}

/**
 * Validation Module
 *
 * Import this module to get validation directives with auto-loaded styles
 * Styles are injected automatically - no need for global imports!
 *
 * @example
 * ```typescript
 * import { ValidationModule } from '@validations';
 *
 * @Component({
 *   standalone: true,
 *   imports: [ValidationModule]
 * })
 * export class MyComponent {}
 * ```
 */
declare class ValidationModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ValidationModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<ValidationModule, never, [typeof i2.CommonModule, typeof ValidationDirective, typeof InputRestrictDirective, typeof ValidationErrorComponent], [typeof ValidationDirective, typeof InputRestrictDirective, typeof ValidationErrorComponent]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<ValidationModule>;
}

declare class CmmDynamicFormModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDynamicFormModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<CmmDynamicFormModule, [typeof CmmDynamicFormComponent], [typeof i2.CommonModule, typeof i6.ReactiveFormsModule, typeof CmmDatepickerComponent, typeof CmmInputText, typeof CmmTextareaDirective, typeof CmmSelectComponent, typeof CmmTypepographyModule, typeof ValidationModule, typeof CmmRadiobuttonComponent, typeof CmmCheckboxComponent, typeof CmmReadonlyComponent, typeof CmmMultiselectComponent, typeof CmmToggleswitchComponent, typeof UploadComponent, typeof DropdownLazyComponent, typeof DropdownCheckboxComponent, typeof CmmPasswordComponent, typeof i19.FloatLabelModule, typeof i9.TranslateModule, typeof i1$5.InputText, typeof i6.FormsModule, typeof i22.RadioButton, typeof i23.Popover, typeof i11.TooltipModule, typeof i25.IconFieldModule, typeof i26.InputIconModule], [typeof CmmDynamicFormComponent]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<CmmDynamicFormModule>;
}

declare class CmmDynamicFormService {
    isVisible(item: DynamicFormItem, form: FormGroup): boolean;
    isDisabled(item: DynamicFormItem, form: FormGroup): boolean;
    isVisibleSignal(item: DynamicFormItem, form: FormGroup): Signal<boolean>;
    isDiabledSignal(item: DynamicFormItem, form: FormGroup): Signal<boolean>;
    getControl(item: DynamicFormItem, form: FormGroup): i6.AbstractControl<any, any, any> | null;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDynamicFormService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<CmmDynamicFormService>;
}

interface VisibilityContext {
    isVisible: (item: DynamicFormItem) => boolean;
}
declare class CmmDynamicFormBuilderImpl implements CmmDynamicFormBuilder {
    build(items: DynamicFormItem[], visibilityContext?: VisibilityContext): FormGroup;
    private getValidatorsForGroup;
    private filerByGroupValidators;
    private buildControls;
    private buildControl;
    private buildGroup;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmDynamicFormBuilderImpl, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<CmmDynamicFormBuilderImpl>;
}

declare class ValidatorUtils {
}

declare class CmmTextEllipsisService {
    private static canvas;
    private static context;
    /**
     * Check if element content is clamped/truncated
     */
    isElementClamped(element: HTMLElement, rows: number): boolean;
    /**
     * Check if element has text ellipsis (single line)
     * Works for CSS-based text-overflow: ellipsis
     */
    isTextEllipsisActive(element: HTMLElement): boolean;
    /**
     * Check if element has ellipsis (single or multi-line)
     * Universal check for both CSS and JS implementations
     */
    hasEllipsis(element: HTMLElement, rows?: number): boolean;
    /**
     * Measure and truncate text to fit within specified rows
     */
    measureText(element: HTMLElement, rows: number, content: string, suffix?: string): {
        isClamped: boolean;
        clampedText: string;
    };
    /**
     * Get computed line height
     */
    private getLineHeight;
    /**
     * Create temporary element with same styles for measurement
     */
    private createTempElement;
    /**
     * Binary search to find optimal text length that fits
     */
    private binarySearchText;
    /**
     * Check if text width exceeds the maximum width
     * @param text - The text to measure
     * @param maxWidth - Maximum width in pixels
     * @param font - Font style (default: '14px Arial')
     * @returns true if text width exceeds maxWidth, false otherwise
     */
    static isEllipses(text: string, maxWidth: number, font?: string): boolean;
    /**
     * Get the actual width of text in pixels
     * @param text - The text to measure
     * @param font - Font style (default: '14px Arial')
     * @returns Width in pixels
     */
    static getTextWidth(text: string, font?: string): number;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CmmTextEllipsisService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<CmmTextEllipsisService>;
}

/**
 * Custom Validators Utility Class
 *
 * Provides reusable custom validators for Angular forms
 *
 * Usage:
 * ```typescript
 * this.form = this.fb.group({
 *   phone: ['', [ValidationUtils.phoneValidator()]],
 *   url: ['', [ValidationUtils.urlValidator()]],
 *   password: ['', [ValidationUtils.strongPassword()]],
 * });
 * ```
 */
declare class ValidationUtils {
    /**
     * Vietnamese phone number validator (10-11 digits, starts with 0)
     */
    static phoneValidator(): ValidatorFn;
    /**
     * URL validator
     */
    static urlValidator(): ValidatorFn;
    /**
     * No whitespace validator - prevents input with only spaces
     */
    static noWhitespaceValidator(): ValidatorFn;
    /**
     * Strong password validator
     * - At least 8 characters
     * - Contains uppercase and lowercase
     * - Contains number
     * - Contains special character
     */
    static strongPassword(): ValidatorFn;
    /**
     * Match validator - ensures two fields have the same value
     *
     * Usage:
     * ```typescript
     * this.form = this.fb.group({
     *   password: ['', Validators.required],
     *   confirmPassword: ['', Validators.required]
     * }, {
     *   validators: ValidationUtils.matchValidator('password', 'confirmPassword')
     * });
     * ```
     */
    static matchValidator(controlName: string, matchingControlName: string): ValidatorFn;
    /**
     * Date range validator
     */
    static dateRangeValidator(minDate: Date, maxDate: Date): ValidatorFn;
    /**
     * File type validator
     *
     * Usage:
     * ```typescript
     * ValidationUtils.fileTypeValidator(['image/png', 'image/jpeg'])
     * ```
     */
    static fileTypeValidator(allowedTypes: string[]): ValidatorFn;
    /**
     * File size validator (in MB)
     *
     * Usage:
     * ```typescript
     * ValidationUtils.fileSizeValidator(5) // Max 5MB
     * ```
     */
    static fileSizeValidator(maxSizeMB: number): ValidatorFn;
    /**
     * Number range validator
     */
    static numberRangeValidator(min: number, max: number): ValidatorFn;
    /**
     * Async validator example - check if value exists in database
     *
     * Usage:
     * ```typescript
     * this.form = this.fb.group({
     *   username: ['', [Validators.required], [ValidationUtils.asyncDuplicateValidator(this.userService)]]
     * });
     * ```
     */
    static asyncDuplicateValidator(checkService: any): (control: AbstractControl) => Promise<ValidationErrors | null>;
    /**
     * Get all error messages from a form group
     */
    static getAllFormErrors(form: FormGroup): {
        [key: string]: any;
    } | null;
}

/**
 * Common Input Patterns
 *
 * Pre-defined regex patterns for common input restrictions.
 * Use with cmmInputRestrict directive.
 *
 * @example
 * ```html
 * <input cmmInputRestrict [pattern]="InputPatterns.DIGITS_ONLY" />
 * <input cmmInputRestrict [pattern]="InputPatterns.ALPHANUMERIC" />
 * ```
 */
declare const InputPatterns: {
    /**
     * Digits only (0-9)
     */
    readonly DIGITS_ONLY: RegExp;
    /**
     * Letters only (a-z, A-Z)
     */
    readonly LETTERS_ONLY: RegExp;
    /**
     * Alphanumeric (a-z, A-Z, 0-9)
     */
    readonly ALPHANUMERIC: RegExp;
    /**
     * Alphanumeric with underscore and hyphen
     * Useful for usernames, slugs
     */
    readonly ALPHANUMERIC_DASH: RegExp;
    /**
     * Decimal number (digits and single dot)
     */
    readonly DECIMAL: RegExp;
    /**
     * Integer (positive or negative)
     */
    readonly INTEGER: RegExp;
    /**
     * Vietnamese characters with diacritics
     */
    readonly VIETNAMESE: RegExp;
    /**
     * Vietnamese alphanumeric
     */
    readonly VIETNAMESE_ALPHANUMERIC: RegExp;
    /**
     * Email characters (basic)
     */
    readonly EMAIL_CHARS: RegExp;
    /**
     * URL safe characters
     */
    readonly URL_SAFE: RegExp;
    /**
     * Hex color code
     */
    readonly HEX_COLOR: RegExp;
    /**
     * Credit card number (digits and spaces)
     */
    readonly CREDIT_CARD: RegExp;
    /**
     * Vietnamese phone number (digits, +, spaces, hyphens)
     */
    readonly PHONE_NUMBER: RegExp;
};
/**
 * Character patterns for filterByPattern
 * These match individual characters (not full strings)
 */
declare const CharPatterns: {
    readonly DIGIT: "[0-9]";
    readonly LETTER: "[a-zA-Z]";
    readonly ALPHANUMERIC: "[a-zA-Z0-9]";
    readonly ALPHANUMERIC_DASH: "[a-zA-Z0-9_-]";
    readonly DECIMAL: "[0-9.]";
    readonly VIETNAMESE: "[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\\s]";
    readonly WORD: "[\\w]";
    readonly HEX: "[0-9A-Fa-f]";
};
/**
 * Custom validator functions for complex restrictions
 */
declare const InputValidators: {
    /**
     * Validate decimal number (only one dot allowed)
     */
    readonly decimal: (value: string) => boolean;
    /**
     * Validate Vietnamese phone number format
     * Accepts: 0xxxxxxxxx, +84xxxxxxxxx, 84xxxxxxxxx
     */
    readonly vietnamesePhone: (value: string) => boolean;
    /**
     * Validate credit card number (Luhn algorithm)
     */
    readonly creditCard: (value: string) => boolean;
    /**
     * No consecutive spaces
     */
    readonly noConsecutiveSpaces: (value: string) => boolean;
    /**
     * No leading/trailing spaces
     */
    readonly noLeadingTrailingSpaces: (value: string) => boolean;
};

/**
 * Input Formatters
 *
 * Pre-built formatter functions for common formatting scenarios.
 * Use with cmmInputRestrict directive's formatOnBlur input.
 *
 * @example
 * ```html
 * <input
 *   cmmInputRestrict
 *   [formatOnBlur]="InputFormatters.creditCard()"
 * />
 * ```
 */
declare class InputFormatters {
    /**
     * Credit card formatter: 1234-5678-9012-3456
     * Groups of 4 digits
     */
    static creditCard(separator?: string): (value: string) => string;
    /**
     * Phone number formatter with custom pattern
     *
     * @param pattern - Pattern with 'x' for digits (e.g., 'xxx-xxx-xxxx')
     * @param separator - Separator character (default: '-')
     *
     * @example
     * ```typescript
     * // US: (123) 456-7890
     * InputFormatters.phoneFormat('(xxx) xxx-xxxx')
     *
     * // Vietnam: 012-345-6789
     * InputFormatters.phoneFormat('xxx-xxx-xxxx')
     * ```
     */
    static phoneFormat(pattern: string, separator?: string): (value: string) => string;
    /**
     * Vietnamese phone formatter: 0123-456-789
     * Pattern: xxx-xxx-xxx or xxxx-xxx-xxx
     */
    static vietnamesePhone(): (value: string) => string;
    /**
     * Date formatter: DD/MM/YYYY
     */
    static dateFormat(separator?: string): (value: string) => string;
    /**
     * Time formatter: HH:MM
     */
    static timeFormat(separator?: string): (value: string) => string;
    /**
     * Currency formatter: 1,234,567
     * Add thousand separators
     */
    static currency(separator?: string): (value: string) => string;
    /**
     * Decimal formatter: 1,234.56
     * With thousand separator and decimal places
     *
     * @param decimalPlaces - Number of decimal places (default: 2)
     * @param thousandSep - Thousand separator (default: ',')
     * @param decimalSep - Decimal separator (default: '.')
     */
    static decimal(decimalPlaces?: number, thousandSep?: string, decimalSep?: string): (value: string) => string;
    /**
     * Uppercase words: "hello world" => "Hello World"
     */
    static titleCase(): (value: string) => string;
    /**
     * Remove consecutive spaces and trim
     */
    static cleanSpaces(): (value: string) => string;
    /**
     * Custom pattern formatter
     * Replace digits in pattern with input digits
     *
     * @param pattern - Pattern string (e.g., 'xx-xx-xx', 'xxxx xxxx xxxx')
     * @param separator - Will be preserved from pattern
     *
     * @example
     * ```typescript
     * // Input: "123456" with pattern "xx-xx-xx"
     * // Output: "12-34-56"
     * InputFormatters.customPattern('xx-xx-xx')
     *
     * // Input: "1234567890" with pattern "xxxx xxxx xx"
     * // Output: "1234 5678 90"
     * InputFormatters.customPattern('xxxx xxxx xx')
     * ```
     */
    static customPattern(pattern: string): (value: string) => string;
    /**
     * Group digits with custom grouping
     *
     * @param groups - Array of group sizes (e.g., [4, 4, 4] for credit card)
     * @param separator - Separator between groups (default: '-')
     *
     * @example
     * ```typescript
     * // Credit card: 1234-5678-9012-3456
     * InputFormatters.groupDigits([4, 4, 4, 4], '-')
     *
     * // Vietnamese ID: 012345-678901
     * InputFormatters.groupDigits([6, 6], '-')
     *
     * // Custom: 123-4567-89
     * InputFormatters.groupDigits([3, 4, 2], '-')
     * ```
     */
    static groupDigits(groups: number[], separator?: string): (value: string) => string;
}
/**
 * Format pattern presets for common use cases
 */
declare const FormatPatterns: {
    /**
     * Credit card: xxxx-xxxx-xxxx-xxxx
     */
    readonly CREDIT_CARD: "xxxx-xxxx-xxxx-xxxx";
    /**
     * US Phone: (xxx) xxx-xxxx
     */
    readonly US_PHONE: "(xxx) xxx-xxxx";
    /**
     * Vietnam Phone: xxx-xxx-xxxx
     */
    readonly VN_PHONE: "xxx-xxx-xxxx";
    /**
     * Date: dd/mm/yyyy
     */
    readonly DATE_DDMMYYYY: "xx/xx/xxxx";
    /**
     * Date: mm/dd/yyyy
     */
    readonly DATE_MMDDYYYY: "xx/xx/xxxx";
    /**
     * Time: hh:mm
     */
    readonly TIME_HHMM: "xx:xx";
    /**
     * Time: hh:mm:ss
     */
    readonly TIME_HHMMSS: "xx:xx:xx";
    /**
     * Vietnamese ID: xxxxxx-xxxxxx
     */
    readonly VN_ID: "xxxxxx-xxxxxx";
    /**
     * Social Security: xxx-xx-xxxx
     */
    readonly SSN: "xxx-xx-xxxx";
};

/**
 * Utility to wrap validators with fieldName in error object
 * This allows the validation directive to extract the field name automatically
 *
 * Usage:
 * ```typescript
 * new FormControl('', [
 *   withFieldName('Họ tên', Validators.required),
 *   withFieldName('Họ tên', Validators.minLength(3)),
 * ])
 * ```
 *
 * Or use the pre-built validators:
 * ```typescript
 * new FormControl('', [
 *   requiredField('Tài khoản'),
 *   minLengthField('Mật khẩu', 8),
 * ])
 * ```
 */
/**
 * Wrap any validator with fieldName in error object
 *
 * This higher-order function takes a validator and returns a new validator that
 * adds the fieldName to the error object. This allows the validation directive
 * to automatically extract and display the correct field name in error messages.
 *
 * @param fieldName - Display name of the field for error messages (e.g., 'Họ tên', 'Email')
 * @param validator - Angular ValidatorFn to wrap
 * @returns ValidatorFn that includes fieldName in error objects
 *
 * @example
 * ```typescript
 * // Single validator
 * username: ['', withFieldName('Tên đăng nhập', Validators.required)]
 *
 * // Multiple validators
 * password: ['', [
 *   withFieldName('Mật khẩu', Validators.required),
 *   withFieldName('Mật khẩu', Validators.minLength(8))
 * ]]
 * ```
 */
declare function withFieldName(fieldName: string, validator: ValidatorFn): ValidatorFn;
/**
 * Pre-built validators with fieldName
 */
/**
 * Required field validator with custom field name
 *
 * Validates that the control has a non-empty value.
 *
 * @param fieldName - Display name of the field (e.g., 'Tài khoản', 'Email')
 * @returns ValidatorFn that checks for required value
 *
 * @example
 * ```typescript
 * username: ['', requiredField('Tài khoản')]
 * ```
 */
declare function requiredField(fieldName: string): ValidatorFn;
/**
 * Required true validator with custom field name
 *
 * Validates that the control value is true (useful for checkboxes).
 *
 * @param fieldName - Display name of the field (e.g., 'Điều khoản sử dụng')
 * @returns ValidatorFn that checks for true value
 *
 * @example
 * ```typescript
 * acceptTerms: [false, requiredTrueField('Điều khoản sử dụng')]
 * ```
 */
declare function requiredTrueField(fieldName: string): ValidatorFn;
/**
 * Email validator with custom field name
 *
 * Validates that the control value is a valid email format.
 *
 * @param fieldName - Display name of the field (e.g., 'Email', 'Địa chỉ email')
 * @returns ValidatorFn that checks for valid email format
 *
 * @example
 * ```typescript
 * email: ['', [requiredField('Email'), emailField('Email')]]
 * ```
 */
declare function emailField(fieldName: string): ValidatorFn;
/**
 * Minimum length validator with custom field name
 *
 * Validates that the control value has at least the specified length.
 *
 * @param fieldName - Display name of the field (e.g., 'Mật khẩu', 'Mô tả')
 * @param length - Minimum required length
 * @returns ValidatorFn that checks minimum length
 *
 * @example
 * ```typescript
 * password: ['', minLengthField('Mật khẩu', 8)]
 * description: ['', minLengthField('Mô tả', 10)]
 * ```
 */
declare function minLengthField(fieldName: string, length: number): ValidatorFn;
/**
 * Maximum length validator with custom field name
 *
 * Validates that the control value does not exceed the specified length.
 *
 * @param fieldName - Display name of the field (e.g., 'Họ tên', 'Tiêu đề')
 * @param length - Maximum allowed length
 * @returns ValidatorFn that checks maximum length
 *
 * @example
 * ```typescript
 * fullName: ['', maxLengthField('Họ tên', 100)]
 * title: ['', maxLengthField('Tiêu đề', 255)]
 * ```
 */
declare function maxLengthField(fieldName: string, length: number): ValidatorFn;
/**
 * Minimum value validator with custom field name
 *
 * Validates that the numeric control value is at least the specified minimum.
 *
 * @param fieldName - Display name of the field (e.g., 'Tuổi', 'Số lượng')
 * @param min - Minimum allowed value
 * @returns ValidatorFn that checks minimum value
 *
 * @example
 * ```typescript
 * age: [0, minField('Tuổi', 18)]
 * quantity: [0, minField('Số lượng', 1)]
 * ```
 */
declare function minField(fieldName: string, min: number): ValidatorFn;
/**
 * Maximum value validator with custom field name
 *
 * Validates that the numeric control value does not exceed the specified maximum.
 *
 * @param fieldName - Display name of the field (e.g., 'Tuổi', 'Giá')
 * @param max - Maximum allowed value
 * @returns ValidatorFn that checks maximum value
 *
 * @example
 * ```typescript
 * age: [0, maxField('Tuổi', 120)]
 * price: [0, maxField('Giá', 1000000)]
 * ```
 */
declare function maxField(fieldName: string, max: number): ValidatorFn;
/**
 * Pattern validator with custom field name
 *
 * Validates that the control value matches the specified regular expression pattern.
 *
 * @param fieldName - Display name of the field (e.g., 'Số điện thoại', 'Mã code')
 * @param pattern - Regular expression pattern (string or RegExp object)
 * @returns ValidatorFn that checks pattern match
 *
 * @example
 * ```typescript
 * phone: ['', patternField('Số điện thoại', /^\d{10}$/)]
 * code: ['', patternField('Mã code', '^[A-Z]{3}\\d{3}$')]
 * ```
 */
declare function patternField(fieldName: string, pattern: string | RegExp): ValidatorFn;
/**
 * Compose multiple validators with fieldName
 *
 * Combines multiple validators into a single validator function and adds
 * the fieldName to all error objects. This is useful when you want to apply
 * multiple validation rules with a single fieldName declaration.
 *
 * @param fieldName - Display name of the field for all validators
 * @param validators - Array of ValidatorFn to compose
 * @returns Single ValidatorFn that runs all validators and includes fieldName in errors
 *
 * @example
 * ```typescript
 * email: ['', composeWithFieldName('Email', [
 *   Validators.required,
 *   Validators.email,
 *   Validators.maxLength(100)
 * ])]
 *
 * // Equivalent to:
 * email: ['', [
 *   withFieldName('Email', Validators.required),
 *   withFieldName('Email', Validators.email),
 *   withFieldName('Email', Validators.maxLength(100))
 * ]]
 * ```
 */
declare function composeWithFieldName(fieldName: string, validators: ValidatorFn[]): ValidatorFn;

declare function getFormGroupFromDialogInstance<T>(dialogService: DialogService, dialogRef: DynamicDialogRef): FormGroup;

interface UbckImportProps extends UploadProps {
    templateInstructionKey?: string;
    downloadTemplateKey?: string;
    recordInstructionKey?: string;
    closeButtonKey?: string;
    continueButtonKey?: string;
    fileInprogressTitleKey?: string;
    importFileSuccessTitleKey?: string;
    chooseAnotherFileKey?: string;
    config: ImportConfig;
    toastService: ToastService;
    importSuccessHandler: (data: any) => void;
}

declare enum ImportStep {
    SELECT_FILE = "select-file",
    SHOW_SUCCESS_INFO = "show-success-info",
    UPLOAD_IN_PROGRESS = "upload-in-progress",
    SHOW_RESULT = "show-result"
}
interface ImportResult {
    totalRows: number;
    successCount: number;
    errorCount: number;
    message: string;
    errorFileName: string | null;
}
interface ImportConfig {
    templateUrl?: string;
    uploadEndpoint?: string;
    progressInterval?: number;
    baseUrl?: string;
    httpService: HttpApiService;
    downloadFileUrl: string;
}
declare class ImportFileService {
    private fileSelected;
    private currentStep;
    private uploadProgress;
    private uploadResult;
    private isUploading;
    private progressSubject;
    readonly file: _angular_core.Signal<File | null>;
    readonly step: _angular_core.Signal<ImportStep>;
    readonly progress: _angular_core.Signal<number>;
    readonly result: _angular_core.Signal<ImportResult | null>;
    readonly uploading: _angular_core.Signal<boolean>;
    readonly computedStep: _angular_core.Signal<ImportStep>;
    selectFile(file: File): void;
    removeFile(): void;
    startImport(config?: ImportConfig): Observable<ImportResult>;
    downloadTemplate(config: ImportConfig, templateUrl: string): void;
    downloadErrorReport(config: ImportConfig, fileName: string): void;
    reset(): void;
    private resetProgress;
    private downloadBlob;
    private downloadDirect;
    private getFileNameFromResponse;
    private getContentTypeFromResponse;
    getProgressStream(): Observable<number>;
    getImportStatus(): {
        step: ImportStep;
        progress: number;
        isUploading: boolean;
        hasResult: boolean;
    };
    checkImportStatus(importId: string, config: ImportConfig): Observable<any>;
    getImportHistory(config: ImportConfig): Observable<any[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ImportFileService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ImportFileService>;
}

declare class UbckImport {
    importService: ImportFileService;
    uploadErrorEvent: _angular_core.OutputEmitterRef<void>;
    props: _angular_core.InputSignal<UbckImportProps>;
    config: _angular_core.InputSignal<ImportConfig>;
    uploadSuccessEvent: _angular_core.OutputEmitterRef<ImportResult>;
    computedProps: _angular_core.Signal<UbckImportProps>;
    importReportData: _angular_core.Signal<ImportResult | null>;
    handleError(event: any): void;
    handleFileSelected(event: File[]): void;
    handleBackToPreviousStep(): void;
    handleRemoveFile(): void;
    handleUpload(): void;
    downloadTemplate(): void;
    handleClose(): void;
    handleDownloadReport(event: {
        fileName?: string | null;
    }): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UbckImport, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UbckImport, "ubck-import", never, { "props": { "alias": "props"; "required": true; "isSignal": true; }; "config": { "alias": "config"; "required": true; "isSignal": true; }; }, { "uploadErrorEvent": "uploadErrorEvent"; "uploadSuccessEvent": "uploadSuccessEvent"; }, never, never, true, never>;
}

declare class DialogImportFile {
    dialogData: UbckImportProps;
    messageService: ToastService;
    handleError(event: any): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DialogImportFile, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DialogImportFile, "ubck-import-dialog", never, {}, {}, never, never, true, never>;
}

/**
 * =====================================================
 * COPY VÀO FILE: public/translate/vi.json
 * =====================================================
 */
declare const IMPORT_TRANSLATIONS_VI: {
    "IMPORT.TEMPLATE.INSTRUCTION": string;
    "IMPORT.DOWNLOAD.TEMPLATE": string;
    "IMPORT.RECORD.INSTRUCTION": string;
    "IMPORT.BUTTON.CLOSE": string;
    "IMPORT.BUTTON.CONTINUE": string;
    "IMPORT.BUTTON.CHOOSE_ANOTHER": string;
    "IMPORT.FILE.INPROGRESS.TITLE": string;
    "IMPORT.FILE.SUCCESS.TITLE": string;
    "IMPORT.SUCCESS.MESSAGE": string;
    "IMPORT.REPORT.TITLE": string;
    "IMPORT.REPORT.SUCCESS.COUNT": string;
    "IMPORT.REPORT.FAILURE.COUNT": string;
    "IMPORT.REPORT.DOWNLOAD.DESCRIPTION": string;
    "IMPORT.ERROR.SUMMARY": string;
    "IMPORT.ERROR.FILE.SIZE": string;
    "IMPORT.ERROR.FILE.LIMIT": string;
    "IMPORT.ERROR.FILE.TYPE.XLSX": string;
    "IMPORT.ERROR.FILE.TYPE.GENERIC": string;
};
/**
 * =====================================================
 * COPY VÀO FILE: public/translate/en.json
 * =====================================================
 */
declare const IMPORT_TRANSLATIONS_EN: {
    "IMPORT.TEMPLATE.INSTRUCTION": string;
    "IMPORT.DOWNLOAD.TEMPLATE": string;
    "IMPORT.RECORD.INSTRUCTION": string;
    "IMPORT.BUTTON.CLOSE": string;
    "IMPORT.BUTTON.CONTINUE": string;
    "IMPORT.BUTTON.CHOOSE_ANOTHER": string;
    "IMPORT.FILE.INPROGRESS.TITLE": string;
    "IMPORT.FILE.SUCCESS.TITLE": string;
    "IMPORT.SUCCESS.MESSAGE": string;
    "IMPORT.REPORT.TITLE": string;
    "IMPORT.REPORT.SUCCESS.COUNT": string;
    "IMPORT.REPORT.FAILURE.COUNT": string;
    "IMPORT.REPORT.DOWNLOAD.DESCRIPTION": string;
    "IMPORT.ERROR.SUMMARY": string;
    "IMPORT.ERROR.FILE.SIZE": string;
    "IMPORT.ERROR.FILE.LIMIT": string;
    "IMPORT.ERROR.FILE.TYPE.XLSX": string;
    "IMPORT.ERROR.FILE.TYPE.GENERIC": string;
};
/**
 * Translation keys - Sử dụng trong component
 * Đây là constants để tránh typo khi gọi translate
 */
declare const IMPORT_TRANSLATION_KEYS: {
    readonly templateInstruction: "IMPORT.TEMPLATE.INSTRUCTION";
    readonly downloadTemplate: "IMPORT.DOWNLOAD.TEMPLATE";
    readonly recordInstruction: "IMPORT.RECORD.INSTRUCTION";
    readonly closeButton: "IMPORT.BUTTON.CLOSE";
    readonly continueButton: "IMPORT.BUTTON.CONTINUE";
    readonly chooseAnother: "IMPORT.BUTTON.CHOOSE_ANOTHER";
    readonly fileInprogressTitle: "IMPORT.FILE.INPROGRESS.TITLE";
    readonly fileSuccessTitle: "IMPORT.FILE.SUCCESS.TITLE";
    readonly successMessage: "IMPORT.SUCCESS.MESSAGE";
    readonly reportTitle: "IMPORT.REPORT.TITLE";
    readonly reportSuccessCount: "IMPORT.REPORT.SUCCESS.COUNT";
    readonly reportFailureCount: "IMPORT.REPORT.FAILURE.COUNT";
    readonly reportDownloadDescription: "IMPORT.REPORT.DOWNLOAD.DESCRIPTION";
    readonly errorSummary: "IMPORT.ERROR.SUMMARY";
    readonly errorFileSize: "IMPORT.ERROR.FILE.SIZE";
    readonly errorFileLimit: "IMPORT.ERROR.FILE.LIMIT";
    readonly errorFileType: "IMPORT.ERROR.FILE.TYPE.XLSX";
    readonly errorFileTypeGeneric: "IMPORT.ERROR.FILE.TYPE.GENERIC";
};
/**
 * @deprecated - Sử dụng IMPORT_TRANSLATIONS_VI và IMPORT_TRANSLATIONS_EN thay thế
 * Legacy format cho compatibility
 */
declare const IMPORT_FILE_TRANSLATIONS: {
    vi: {
        "IMPORT.TEMPLATE.INSTRUCTION": string;
        "IMPORT.DOWNLOAD.TEMPLATE": string;
        "IMPORT.RECORD.INSTRUCTION": string;
        "IMPORT.BUTTON.CLOSE": string;
        "IMPORT.BUTTON.CONTINUE": string;
        "IMPORT.BUTTON.CHOOSE_ANOTHER": string;
        "IMPORT.FILE.INPROGRESS.TITLE": string;
        "IMPORT.FILE.SUCCESS.TITLE": string;
        "IMPORT.SUCCESS.MESSAGE": string;
        "IMPORT.REPORT.TITLE": string;
        "IMPORT.REPORT.SUCCESS.COUNT": string;
        "IMPORT.REPORT.FAILURE.COUNT": string;
        "IMPORT.REPORT.DOWNLOAD.DESCRIPTION": string;
        "IMPORT.ERROR.SUMMARY": string;
        "IMPORT.ERROR.FILE.SIZE": string;
        "IMPORT.ERROR.FILE.LIMIT": string;
        "IMPORT.ERROR.FILE.TYPE.XLSX": string;
        "IMPORT.ERROR.FILE.TYPE.GENERIC": string;
    };
    en: {
        "IMPORT.TEMPLATE.INSTRUCTION": string;
        "IMPORT.DOWNLOAD.TEMPLATE": string;
        "IMPORT.RECORD.INSTRUCTION": string;
        "IMPORT.BUTTON.CLOSE": string;
        "IMPORT.BUTTON.CONTINUE": string;
        "IMPORT.BUTTON.CHOOSE_ANOTHER": string;
        "IMPORT.FILE.INPROGRESS.TITLE": string;
        "IMPORT.FILE.SUCCESS.TITLE": string;
        "IMPORT.SUCCESS.MESSAGE": string;
        "IMPORT.REPORT.TITLE": string;
        "IMPORT.REPORT.SUCCESS.COUNT": string;
        "IMPORT.REPORT.FAILURE.COUNT": string;
        "IMPORT.REPORT.DOWNLOAD.DESCRIPTION": string;
        "IMPORT.ERROR.SUMMARY": string;
        "IMPORT.ERROR.FILE.SIZE": string;
        "IMPORT.ERROR.FILE.LIMIT": string;
        "IMPORT.ERROR.FILE.TYPE.XLSX": string;
        "IMPORT.ERROR.FILE.TYPE.GENERIC": string;
    };
};

/**
 * Helper để tạo default import props với translation keys
 */
declare function createDefaultImportProps(config: ImportConfig, toastService: ToastService, importSuccessHandler: (data: any) => void, options?: Partial<UbckImportProps>): UbckImportProps;
/**
 * Helper để tạo ImportConfig object
 */
declare function createImportConfig(config: {
    templateUrl: string;
    uploadEndpoint: string;
    downloadFileUrl: string;
    httpService: any;
}): ImportConfig;
/**
 * Các preset config cho loại file thông dụng
 */
declare const IMPORT_FILE_PRESETS: {
    readonly xlsx: {
        readonly accept: ".xlsx";
        readonly invalidFileTypeMessage: "File tải lên không đúng định dạng .xlsx. Bạn vui lòng kiểm tra lại.";
        readonly invalidFileTypeMessageKey: "IMPORT.ERROR.FILE.TYPE.XLSX";
    };
    readonly csv: {
        readonly accept: ".csv";
        readonly invalidFileTypeMessage: "File tải lên không đúng định dạng .csv. Bạn vui lòng kiểm tra lại.";
        readonly invalidFileTypeMessageKey: "import.error.file.type.csv";
    };
    readonly excel: {
        readonly accept: ".xlsx,.xls";
        readonly invalidFileTypeMessage: "File tải lên không đúng định dạng Excel. Bạn vui lòng kiểm tra lại.";
        readonly invalidFileTypeMessageKey: "import.error.file.type.excel";
    };
};
/**
 * Helper để translate messages nếu cần
 * Sử dụng khi muốn get translated message trước khi truyền vào dialog
 */
declare function getTranslatedImportMessages(translateService: TranslateService): {
    summary: any;
    invalidFileSizeMessageDetail: any;
    invalidFileLimitMessageDetail: any;
    invalidFileTypeMessageDetail: any;
    templateInstructionKey: any;
    downloadTemplateKey: any;
    recordInstructionKey: any;
    closeButtonKey: any;
    continueButtonKey: any;
    fileInprogressTitleKey: any;
    importFileSuccessTitleKey: any;
    chooseAnotherFileKey: any;
};

/** Minimal shape a chip needs. Extra fields are allowed and ignored. */
type ChipItem = {
    name: string;
    [key: string]: unknown;
};
/**
 * Bundled inputs for `IamChipList`. Every field is optional; omitted fields fall
 * back to the component defaults (see each member below).
 */
type ChipListProps = {
    /** Rows of chips visible before collapsing. Default: `2`. */
    maxRows?: number;
    /** Hard cap on visible chips; `0` = measure by width/rows only. Default: `0`. */
    maxVisible?: number;
    /**
     * Fixed number of chips per row — "grid mode". When set to a positive number
     * `N`, the list renders a deterministic grid of exactly `N` chips per row over
     * at most `maxRows` rows, so the visible count no longer depends on flaky
     * pixel-width measurement.
     *
     * - Total slots = `chipsPerRow * maxRows`. When items fit, all render.
     * - When there are more items than slots, the **last slot becomes the `+N`
     *   badge** — i.e. the final row shows `chipsPerRow - 1` chips followed by the
     *   badge, never more than `maxRows` rows.
     * - Chips too wide to sit `N`-per-row do **not** wrap to their own line; they
     *   shrink (via flexbox) and clamp with an ellipsis so the grid keeps its shape.
     *
     * When set, `chipsPerRow` fully drives the count and `maxVisible` is ignored.
     * Leave unset (or `0`) to keep the default width-measured behaviour.
     * Default: unset (`0`).
     */
    chipsPerRow?: number;
    /** Max width of the whole list. Default: unset. */
    maxWidth?: string;
    /** Max width of a single chip. Default: `'15rem'`. */
    chipMaxWidth?: string;
    /** Max lines of text visible in a single chip; overflow is clamped with an ellipsis. Default: `2`. */
    chipMaxLines?: number;
    /** Text shown when there are no chips. Default: `'-'`. */
    emptyText?: string;
    /**
     * Utility/Tailwind classes applied to every chip. When set, the default chip
     * skin (background/color/padding/font) is dropped so these classes own the
     * appearance. Structural/layout styling is always kept. Default: unset.
     */
    chipClass?: string;
    /**
     * Utility/Tailwind classes applied to the `+N` badge. When set, the default
     * badge skin (circle/background/border/size) is dropped. Default: unset.
     */
    chipBadgeClass?: string;
    /** Utility/Tailwind classes applied to the empty-state text. Default: unset. */
    emptyClass?: string;
    /**
     * Sorts chips by their `name` length before rendering/measuring.
     * `'none'` keeps the order of `items`. Default: `'text-shortest-to-longest'`.
     */
    orderChipBy?: 'text-shortest-to-longest' | 'text-longest-to-shortest' | 'none';
};

/**
 * Renders a horizontal list of chips and collapses the ones that don't fit
 * within `maxRows` into a single `+N` badge.
 *
 * - `maxRows` (default 2): how many rows of chips are visible before collapsing.
 * - `maxVisible` (default `2`): hard cap on how many chips are shown. When set
 *   to a positive number `X`, at most `X` chips render and the rest collapse into
 *   `+(items.length - X)`. It only ever *lowers* the visible count — the layout
 *   measurement can still hide more chips if they don't physically fit. Pass
 *   `0` to opt out of the cap so the count is driven purely by the width/row
 *   measurement (e.g. to let `maxRows` alone decide how many chips fit).
 * - `chipsPerRow` (default `2`): "grid mode". When set to a positive number `N`,
 *   the list renders a deterministic `N`-per-row grid over at most `maxRows` rows
 *   instead of measuring pixel widths — so a 2x2 grid always shows up to 4 chips.
 *   The `+N` badge is appended as an *extra* on the last row (it does not take a
 *   chip slot). Chips too wide to sit `N`-per-row shrink + ellipsize rather than
 *   wrapping. `maxVisible` is ignored while grid mode is active. Pass `0` to fall
 *   back to width-measured mode. See {@link ChipListProps}.
 * - The `+N` badge always shows the tooltip (full, comma-joined name list).
 * - `orderChipBy` (default `'text-shortest-to-longest'`): sorts chips by `name`
 *   length before rendering/measuring. `'none'` keeps the `items` order as-is.
 */
declare class UbckChipList {
    /** All inputs are bundled here; see {@link ChipListProps} for per-field defaults. */
    readonly props: _angular_core.InputSignal<ChipListProps>;
    readonly items: _angular_core.InputSignal<ChipItem[]>;
    protected readonly maxRows: _angular_core.Signal<number>;
    protected readonly maxVisible: _angular_core.Signal<number | undefined>;
    /** Chips per row for the deterministic grid; `2` (default) = width-measured mode. */
    protected readonly chipsPerRow: _angular_core.Signal<number>;
    /** True when `chipsPerRow` is set — switches rendering to the fixed grid layout. */
    protected readonly gridMode: _angular_core.Signal<boolean>;
    protected readonly maxWidth: _angular_core.Signal<string | undefined>;
    protected readonly chipMaxLines: _angular_core.Signal<number | undefined>;
    protected readonly chipMaxWidth: _angular_core.Signal<string>;
    protected readonly emptyText: _angular_core.Signal<string>;
    protected readonly chipClass: _angular_core.Signal<string>;
    protected readonly chipBadgeClass: _angular_core.Signal<string>;
    protected readonly emptyClass: _angular_core.Signal<string>;
    protected readonly orderChipBy: _angular_core.Signal<NonNullable<"none" | "text-shortest-to-longest" | "text-longest-to-shortest" | undefined>>;
    protected readonly chipTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    protected readonly emptyTemplate: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    /**
     * Legacy `@Output()`/`EventEmitter` on purpose: `EventEmitter.observed` is the
     * only reliable way to tell whether a consumer bound the handler, which we use
     * to drive the badge cursor (pointer when bound, default otherwise). The signal
     * `output()` API exposes no equivalent. Emits the hidden chips.
     */
    badgeClick: EventEmitter<ChipItem[]>;
    private readonly container;
    private readonly measureContainer;
    private readonly measureChips;
    private readonly badgeRef;
    /** Number of chips kept visible; the rest are collapsed into the `+N` badge. */
    readonly visibleCount: _angular_core.WritableSignal<number>;
    /** Becomes true after the first measurement, so the badge isn't flashed early. */
    readonly measured: _angular_core.WritableSignal<boolean>;
    /** `items()` sorted per `orderChipBy`; drives rendering, measurement and the tooltip/badge. */
    readonly orderedItems: _angular_core.Signal<ChipItem[]>;
    readonly tooltip: _angular_core.Signal<string>;
    readonly badgeCount: _angular_core.Signal<number>;
    /**
     * Grid mode only: the visible chips chunked into rows of `chipsPerRow`, e.g.
     * `[[c0, c1], [c2, c3]]` for a 2x2 grid. Each row renders as its own
     * `flex-wrap: nowrap` container so the chips shrink to fit rather than wrapping
     * onto extra rows (plain `flex-wrap: wrap` wraps *before* it shrinks, which is
     * what pushed a 2-per-row layout onto 3 lines). Empty in measured mode.
     */
    readonly visibleRows: _angular_core.Signal<ChipItem[][]>;
    private resizeObserver?;
    private resizeDebounceTimer?;
    private lastWidth?;
    constructor();
    onBadgeClick(): void;
    private observeContainer;
    /**
     * Debounces the resize-driven recompute. The `ResizeObserver` fires on every
     * frame while the container is being dragged/resized; running the layout-reading
     * measurement each time makes the visible count oscillate near a row boundary,
     * which shows up as flickering chips. We instead wait for the size to settle for
     * {@link RESIZE_DEBOUNCE_MS} and recompute once. Data/config changes still go
     * through the (forced, immediate) `afterRenderEffect`, so they never feel laggy.
     */
    private scheduleRecompute;
    /**
     * Measures the chips by row (via `offsetTop`) and collapses the overflow into
     * the `+N` badge. Measurement runs on a hidden off-flow container so the visible
     * layout is never disturbed, completely eliminating resize-observer layout loops.
     */
    private recompute;
    /** Distinct row offsets (top -> bottom), one per visual row. */
    private rowTops;
    /**
     * Whether the badge placed right after the first `fit` chips would sit on the
     * last allowed row (i.e. not wrap past `lastAllowedTop`).
     */
    private badgeFits;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UbckChipList, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UbckChipList, "ubck-chip-list", never, { "props": { "alias": "props"; "required": false; "isSignal": true; }; "items": { "alias": "items"; "required": true; "isSignal": true; }; }, { "badgeClick": "badgeClick"; }, ["chipTemplate", "emptyTemplate"], never, true, never>;
}

declare class UBCKChipListModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UBCKChipListModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<UBCKChipListModule, never, [typeof UbckChipList], [typeof UbckChipList]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<UBCKChipListModule>;
}

export { ACCORDION_ICON_POSITIONS, ACCORDION_SIZES, ACCORDION_VARIANTS, ANIMATE_SIZES, ANIMATE_VARIANTS, ANIMATION_CLASSES, ANIMATION_SPEEDS, ANIMATION_TOKEN_LOADING, AUTOCOMPLETE_SIZES, AUTOCOMPLETE_VARIANTS, AUTOFOCUS_DEFAULTS, AVATAR_GROUP_SIZES, AVATAR_GROUP_VARIANTS, AVATAR_SHAPES, AVATAR_SIZES, AVATAR_TYPES, AVATAR_VARIANTS, BADGE_SEVERITIES, BADGE_SIZES, BADGE_VARIANTS, BASECOMPONENT_SIZES, BASECOMPONENT_VARIANTS, BASE_SIZES, BASE_VARIANTS, BLOCK_UI_SIZES, BLOCK_UI_VARIANTS, BREADCRUMB_EXAMPLES, BREADCRUMB_SIZES, BREADCRUMB_VARIANTS, BUTTONGROUP_ORIENTATIONS, BUTTONGROUP_SIZES, BUTTONGROUP_VARIANTS, BUTTON_ICON_POSITIONS, BUTTON_SEVERITIES, BUTTON_SIZES, BUTTON_TYPES, BUTTON_VARIANTS, BtnActionsComponent, BtnHeaderComponent, CARD_SIZES, CARD_VARIANTS, CAROUSEL_DEFAULTS, CASCADESELECT_DEFAULTS, CHART_DEFAULTS, CHECKBOX_DEFAULTS, CMM_IMAGE_CLASSES, CMM_IMAGE_DEFAULTS, CMM_IMAGE_LOADING, CMM_MENUBAR_CLASSES, CMM_MENUBAR_DEFAULTS, CMM_MENU_CLASSES, CMM_MENU_DEFAULTS, CMM_MESSAGE_CLASSES, CMM_MESSAGE_DEFAULTS, CMM_MESSAGE_SEVERITIES, CMM_MESSAGE_SIZES, CMM_MESSAGE_VARIANTS, CMM_PANEL_CLASSES, CMM_PANEL_DEFAULTS, CMM_PANEL_ICON_POSITIONS, CMM_PANEL_TOGGLERS, CMM_PROGRESSBAR_CLASSES, CMM_PROGRESSBAR_DEFAULTS, CMM_PROGRESSBAR_MODES, CMM_PROGRESSSPINNER_CLASSES, CMM_PROGRESSSPINNER_DEFAULTS, CMM_PROGRESSSPINNER_SIZES, CMM_RATING_CLASSES, CMM_RATING_DEFAULTS, CMM_SKELETON_CLASSES, CMM_SKELETON_DEFAULTS, CMM_SKELETON_SHAPES, CMM_SPLITBUTTON_CLASSES, CMM_SPLITBUTTON_DEFAULTS, CMM_SPLITBUTTON_ICON_POSITIONS, CMM_SPLITBUTTON_SEVERITIES, CMM_SPLITBUTTON_SIZES, CMM_SPLITTER_CLASSES, CMM_SPLITTER_DEFAULTS, CMM_SPLITTER_LAYOUTS, CMM_SPLITTER_STORAGE, CMM_STEPPER_CLASSES, CMM_STEPPER_DEFAULTS, CMM_STEPS_CLASSES, CMM_STEPS_DEFAULTS, CMM_TAG_CLASSES, CMM_TAG_DEFAULTS, CMM_TAG_SEVERITIES, CMM_TOGGLEBUTTON_CLASSES, CMM_TOGGLEBUTTON_DEFAULTS, CMM_TOGGLEBUTTON_ICON_POSITIONS, CMM_TOGGLEBUTTON_SIZES, CMM_TOOLBAR_CLASSES, CMM_TOOLBAR_DEFAULTS, CMM_TOOLTIP_CLASSES, CMM_TOOLTIP_DEFAULTS, CMM_TOOLTIP_EVENTS, CMM_TOOLTIP_POSITIONS, CMM_TREESELECT_CLASSES, CMM_TREESELECT_DEFAULTS, CMM_TREESELECT_DISPLAY_MODES, CMM_TREESELECT_FILTER_MODES, CMM_TREESELECT_SELECTION_MODES, CMM_TREESELECT_SIZES, CMM_TREESELECT_VARIANTS, CMM_TREE_CLASSES, CMM_TREE_DEFAULTS, CMM_TREE_FILTER_MODES, CMM_TREE_LOADING_MODES, CMM_TREE_SELECTION_MODES, COLORPICKER_DEFAULTS, COLUMN_RESIZE_MODES, COMMON_COLUMNS, COMPARE_SELECTION_BY, CONFIRMDIALOG_DEFAULTS, CONFIRMPOPUP_DEFAULTS, CONTEXTMENU_DEFAULTS, CONTEXT_MENU_SELECTION_MODES, CardUploadComponent, CardWrapperComponent, CharPatterns, CmmAccordionPanelComponent, CmmAnimateOnScrollComponent, CmmAutoCompleteComponent, CmmAutoFocusDirective, CmmAvatarComponent, CmmAvatarGroupComponent, CmmBadgeComponent, CmmBadgeDirective, CmmBaseComponent, CmmBasecomponentComponent, CmmBlockUIComponent, CmmBreadcrumbComponent, CmmButtonComponent, CmmButtongroupComponent, CmmCardComponent, CmmCarouselComponent, CmmCascadeselectComponent, CmmChartComponent, CmmCheckboxComponent, CmmColorpickerComponent, CmmConfirmdialogComponent, CmmConfirmpopupComponent, CmmContentDirective, CmmContextmenuComponent, CmmCopyableDirective, CmmDataviewComponent, CmmDialogComponent, CmmDividerComponent, CmmDockComponent, CmmDraggableDirective, CmmDrawerComponent, CmmDroppableDirective, CmmDynamicFormBuilderImpl, CmmDynamicFormComponent, CmmDynamicFormFacade, CmmDynamicFormModule, CmmDynamicFormService, CmmEditableDirective, CmmEditorComponent, CmmEllipsisDirective, CmmFieldsetComponent, CmmFileUploadComponent, CmmFloatlabelComponent, CmmGalleriaComponent, CmmHeaderDirective, CmmHeadingDirective, CmmIftalabelComponent, CmmImageComponent, CmmInplaceComponent, CmmInputText, CmmInputgroupComponent, CmmInputgroupaddonComponent, CmmInputmaskComponent, CmmInputnumberComponent, CmmInputotpComponent, CmmKeyfilterDirective, CmmKnobComponent, CmmLayoutDirective, CmmLeftContentDirective, CmmListboxComponent, CmmMegamenuComponent, CmmMenuComponent, CmmMenubarComponent, CmmMessageComponent, CmmMetergroupComponent, CmmMultiselectComponent, CmmOrderListComponent, CmmOrganizationChartComponent, CmmPanelComponent, CmmPanelmenuComponent, CmmPasswordComponent, CmmPickListComponent, CmmPopoverComponent, CmmProgressBarComponent, CmmProgressSpinnerComponent, CmmRadiobuttonComponent, CmmRatingComponent, CmmReadonlyComponent, CmmRightContentDirective, CmmRippleDirective, CmmScrollerComponent, CmmScrollpanelComponent, CmmScrolltopComponent, CmmSectionComponent, CmmSelectComponent, CmmSelectbuttonComponent, CmmSidebarComponent, CmmSkeletonComponent, CmmSliderComponent, CmmSpeeddialComponent, CmmSplitButtonComponent, CmmSplitterComponent, CmmStepperComponent, CmmStepsComponent, CmmTabComponent, CmmTabListComponent, CmmTabPanelComponent, CmmTabPanelsComponent, CmmTabsComponent, CmmTagComponent, CmmTerminalComponent, CmmTextDirective, CmmTextEllipsisService, CmmTextareaDirective, CmmTieredmenuComponent, CmmTimelineComponent, CmmToastComponent, CmmToggleButtonComponent, CmmToggleswitchComponent, CmmToolbarComponent, CmmTooltipComponent, CmmTooltipDirective, CmmTreeComponent, CmmTreeSelectComponent, CmmTreeTableComponent, CmmTypepographyModule, CmmTypographyConfigService, CmmTypographyDirective, CmmZIndexUtilsService, CommonDialogService, CommonLayoutComponent, CommonLayoutModule, DATAVIEW_DEFAULTS, DEFAULT_DELAY, DEFAULT_DOWNLOAD_MANAGER_CONFIG, DEFAULT_EMPTY_MESSAGE, DEFAULT_MAX_LENGTH_TEXT, DEFAULT_MIN_LENGTH, DEFAULT_ROOT_MARGIN, DEFAULT_SCROLL_HEIGHT, DEFAULT_THRESHOLD, DEFAULT_TRANSITION_OPTIONS, DIALOG_DEFAULTS, DIALOG_ICON_ENUM, DIALOG_POSITIONS, DIVIDER_DEFAULTS, DOCK_DEFAULTS, DOWNLOAD_MANAGER_CONFIG, DOWNLOAD_NOTIFY_COLORS, DOWNLOAD_NOTIFY_KEYS, DRAGDROP_DEFAULTS, DRAWER_DEFAULTS, DRAWER_POSITIONS, DeleteIconComponent, DeletePopupIconComponent, DialogConfirmComponent, DialogDeleteComponent, DialogHeaderComponent, DialogImportFile, DownloadManagerService, DownloadNotifyComponent, DownloadState, DownloadTransportInterface, DropdownCheckboxComponent, DropdownLazyComponent, DynamicFieldTypes, EDITOR_DEFAULTS, EditIconComponent, EyeIconComponent, FIELDSET_DEFAULTS, FILEUPLOAD_DEFAULTS, FILE_SIZE_LIMITS, FILE_TYPE_PATTERNS, FILE_UPLOAD_METHODS, FILE_UPLOAD_MODES, FILE_UPLOAD_SIZES, FILE_UPLOAD_VARIANTS, FILTER_MODES, FILTER_OPERATORS, FLOATLABEL_DEFAULTS, FOCUS_DELAYS, FileValidationService, FormatPatterns, GALLERIA_DEFAULTS, GroupBtnActionsComponent, HeaderComponent, HeaderManagementComponent, HistoryIconComponent, ICON_CLASSES, IFTALABEL_DEFAULTS, IMPORT_FILE_PRESETS, IMPORT_FILE_TRANSLATIONS, IMPORT_TRANSLATIONS_EN, IMPORT_TRANSLATIONS_VI, IMPORT_TRANSLATION_KEYS, INPLACE_DEFAULTS, INPUTGROUPADDON_DEFAULTS, INPUTGROUP_DEFAULTS, INPUTMASK_DEFAULTS, INPUTNUMBER_DEFAULTS, INPUTOTP_DEFAULTS, INPUTTEXT_DEFAULTS, ImportFileService, ImportStep, InputFormatters, InputPatterns, InputRestrictBaseDirective, InputRestrictDirective, InputValidators, KEYFILTER_DEFAULTS, KNOB_DEFAULTS, LISTBOX_DEFAULTS, LoadingModule, LoadingService, LogoComponent, MEGAMENU_DEFAULTS, METERGROUP_DEFAULTS, MULTISELECT_DEFAULTS, ORDERLIST_CONTROLS_POSITION, ORDERLIST_FILTER_MATCH_MODE, ORGANIZATIONCHART_SELECTION_MODE, PAGINATOR_POSITIONS, PANELMENU_DEFAULTS, PASSWORD_DEFAULTS, PICKLIST_FILTER_MATCH_MODE, POPOVER_DEFAULTS, PRIMENG_AVATAR_SIZES, PRIMENG_BADGE_SIZES, PermissionComponent, PermissionUtil, RADIOBUTTON_DEFAULTS, RIPPLE_DEFAULTS, ROWS_PER_PAGE_OPTIONS, RoleComponent, SCREEN_STATUS_ENUM, SCROLLER_DEFAULTS, SCROLLPANEL_DEFAULTS, SCROLLTOP_DEFAULTS, SCROLL_HEIGHTS, SELECTBUTTON_DEFAULTS, SELECTION_MODES, SELECT_DEFAULTS, SIDEBAR_DEFAULTS, SIZE_PX, SIZE_REM, SLIDER_DEFAULTS, SORT_MODES, SPEEDDIAL_DEFAULTS, StatusBadgeDirective, TABLIST_DEFAULTS, TABPANELS_DEFAULTS, TABPANEL_DEFAULTS, TABS_DEFAULTS, TAB_DEFAULTS, TERMINAL_DEFAULTS, TEXTAREA_DEFAULTS, TIEREDMENU_DEFAULTS, TIMELINE_DEFAULTS, TOAST_DEFAULTS, TOGGLESWITCH_DEFAULTS, TREETABLE_CLASSES, TREETABLE_DEFAULTS, TableBtnActionsComponent, TabsComponent, ToastComponent, ToastService, UBCKChipListModule, UBCKCustomTypographyStyles, UBCKDefereredSectionComponent, UBCKPaginator, UBCKPaginatorModule, UBCKPaginatorStyles, UBCKTableBody, UBCKTableEmpty, UBCKTableModule, UBCK_DEFAULT_FILE_SIZE, UBCK_DEFAULT_PAGE, UBCK_DEFAULT_RESULT_COUNT, UBCK_LARGE_RESULT_COUNT, UBCK_MAX_QUANTITY_VALUE, UBCK_MAX_REASON_MESSAGE_LENGTH, UBCK_MEDIUM_RESULT_COUNT, UBCK_MIN_QUANTITY_VALUE, UBCK_PAGINATOR_DEFAULTS, UBCK_PAGINATOR_EDOC_OPTIONS, UBCK_PAGINATOR_OPTIONS, UBCK_PAGINATOR_THEME, UBCK_PAGNATOR_CLASSES, UBCK_TABLE_DEFAULTS, UBCK_VALIDATION_CLASSES, UBCK_VALIDATION_THEME, UbckChipList, UbckImport, UbckLoading, UbckTable, UbckTableHeader, UbckTableStyle, UbckValidationStyles, UndoIconComponent, UploadComponent, UploadFacade, UserActionHeaderComponent, VALIDATION_MESSAGES_TOKEN, VIRTUAL_SCROLL_ITEM_SIZES, ValidationBaseDirective, ValidationDirective, ValidationErrorComponent, ValidationModule, ValidationService, ValidationUtils, ValidatorUtils, ZINDEX_BASE_VALUES, ZINDEX_LAYERS, addFiles, buildDuplicateFileErrorMessage, buildFileLimitErrorMessage, buildFileSizeErrorMessage, buildFileTypeErrorMessage, buildMinFilesErrorMessage, composeWithFieldName, createDefaultImportProps, createImportConfig, createValidationMessages, dragEventHasFiles, emailField, extensionToMimeType, extractFileMetadata, extractFilesFromDragEvent, fileListToArray, filterDuplicateFiles, filterFilesByType, formatFileSize, getDraggedFileTypes, getFileExtension, getFileIcon, getFileType, getFormGroupFromDialogInstance, getTranslatedImportMessages, isFileDuplicate, isFileTypeAccepted, limitFiles, maxField, maxLengthField, minField, minLengthField, parseFileSize, patternField, provideCustomValidationMessages, provideDownloadManager, provideValidationMessages, removeFileAtIndex, requiredField, requiredTrueField, resolveFileName, validateDraggedTypes, withFieldName };
export type { AccordionIconPosition, AccordionSize, AccordionVariant, AnimateSize, AnimateVariant, AnimationClass, AnimationSpeed, AutoCompleteSize, AutoCompleteVariant, AvatarGroupSize, AvatarGroupVariant, AvatarShape, AvatarSize, AvatarType, AvatarVariant, BadgeSeverity, BadgeSize, BadgeVariant, BaseComponentSize, BaseComponentVariant, BaseSize, BaseVariant, BlockUISize, BlockUIVariant, BlockableUI, BodyTableProps, BreadcrumbSize, BreadcrumbVariant, ButtonGroupOrientation, ButtonGroupSize, ButtonGroupVariant, ButtonIconPosition, ButtonSeverity, ButtonSize, ButtonType, ButtonVariant, CardSize, CardVariant, CarouselOrientation, CascadeSelectSize, CascadeSelectVariant, ChartType, CheckboxSize, CheckboxVariant, ChipItem, ChipListProps, BlockableUI as CmmBlockableUI, CmmDynamicFormBuilder, CmmMetergroupProps, CmmPasswordProps, CmmPopoverProps, CmmReadonlyProps, CmmScrollerProps, CmmSelectProps, CmmTerminalProps, CmmToggleswitchProps, ColorPickerFormat, ColumnDefinition, ColumnResizeMode, CompareSelectionBy, ConfirmDialogDefaultFocus, ConfirmPopupPosition, ContextMenuAppendTo, ContextMenuSelectionMode, DataViewLayout, DataViewLayoutChangeEvent, DataViewLazyLoadEvent, DataViewPageEvent, DataViewPaginatorPosition, DataViewSortEvent, DialogMaximizeEvent, DialogPosition, DialogTemplates, DividerAlign, DividerLayout, DividerType, DockItem, DockPosition, DownloadFileIconContext, DownloadHeaderActions, DownloadHeaderContext, DownloadHeaderState, DownloadItemActions, DownloadItemContext, DownloadItemVm, DownloadManagerConfig, DownloadNotifyClasses, DownloadProgress, DownloadRequest, DragEffect, DrawerPosition, DropEffect, DropdownPanel, DynamicFieldType, DynamicFormFacade, DynamicFormItem, DynamicOption, EditorFormat, EllipsisConfig, FieldsetAfterToggleEvent, FieldsetBeforeToggleEvent, FileMetadata, FileRemoveEventData, FileSelectEventData, FileType, FileUploadMethod, FileUploadMode, FileUploadSize, FileUploadVariant, FileValidationError, FilterMatchMode, FilterMode, FloatLabelVariant, FocusDelay, GalleriaIndicatorsPosition, GalleriaResponsiveOptions, GalleriaThumbnailsPosition, GalleriaTransitionType, HeaderTableProps, HeadingConfig, HeadingFontSizes, IBtnActionsModel, IBtnHeader, ICmmSectionModel, ICmmTab, IDialogConfig, IDialogConfirm, IDialogDelete, IDialogHeader, IDropdownItem, IDropdownItemMultiSelect, IFileFormatter, IFileValidator, IImageMeta, ITableAction, IUploadFacade, IUserActionHeader, IftaLabelType, ImportConfig, ImportResult, InputGroupAddonType, InputGroupType, InputMaskSize, InputMaskVariant, InputNumberButtonLayout, InputNumberMode, InputNumberSize, InputNumberVariant, InputOtpVariant, InputTextSize, InputTextVariant, KeyFilterPattern, KnobSize, ListboxFilterMatchMode, ListboxVariant, MegaMenuOrientation, MessageFunction, MeterGroupLabelOrientation, MeterGroupLabelPosition, MeterGroupOrientation, MeterItem, MultiSelectDisplay, MultiSelectFilterMatchMode, MultiSelectSize, MultiSelectVariant, MultiselectProps, OrderListControlsPosition, OrderListFilterEvent, OrderListFilterMatchMode, OrderListFilterOptions, OrderListSelectionChangeEvent, OrganizationChartNodeCollapseEvent, OrganizationChartNodeExpandEvent, OrganizationChartNodeSelectEvent, OrganizationChartNodeUnSelectEvent, OrganizationChartSelectionMode, OverlayOptions, PaginatorPosition, PaginatorProps, PanelAfterToggleEvent, PanelBeforeToggleEvent, PasswordSize, PasswordVariant, Permission, PermissionModel, PermissionModelGroup, PermissionProps, PickListFilterMatchMode, PickListFilterOptions, PickListMoveAllToSourceEvent, PickListMoveAllToTargetEvent, PickListMoveToSourceEvent, PickListMoveToTargetEvent, PickListSourceFilterEvent, PickListSourceReorderEvent, PickListSourceSelectEvent, PickListTargetFilterEvent, PickListTargetReorderEvent, PickListTargetSelectEvent, PrimeNGAvatarSize, PrimeNGBadgeSize, ProgressBarMode, ProgressSpinnerAnimationDuration, ProgressSpinnerFill, ProgressSpinnerStrokeWidth, PropsEnricher, RadioButtonSize, RadioButtonVariant, RatingRateEvent, RippleType, RoleModel, RoleProps, Roles, SCREEN_STATUS, ScreenProps, ScrollTopBehavior, ScrollTopTarget, ScrollerContentOptions, ScrollerItemOptions, ScrollerLazyLoadEvent, ScrollerLoaderIconOptions, ScrollerLoaderOptions, ScrollerOrientation, ScrollerScrollEvent, ScrollerScrollIndexChangeEvent, ScrollerToType, SelectButtonSize, SelectChangeEvent, SelectFilterEvent, SelectFilterOptions, SelectLazyLoadEvent, SelectSize, SelectVariant, SelectionMode, SidebarPosition, SizeType, SliderOrientation, SliderVariant, SortMode, SpeedDialDirection, SpeedDialType, SplitterResizeEndEvent, SplitterResizeStartEvent, StatusType, System, TTableActionType, TabPanelValue, TabValue, TablePaginatorPosition, TableProps, TableResponsiveLayout, TableSelectionMode, TableSize, TableSortMode, TableStateStorage, TabsValue, TextFontSizes, TextareaSize, TextareaVariant, TimelineAlign, TimelineLayout, ToastConfig, ToastData, ToastMessage, ToastOptions, ToastPosition, ToastSeverity, ToggleButtonChangeEvent, ToggleButtonSize, TooltipEvent, TooltipPosition, TreeFilterEvent, TreeLazyLoadEvent, TreeNodeCollapseEvent, TreeNodeContextMenuSelectEvent, TreeNodeDropEvent, TreeNodeExpandEvent, TreeNodeSelectEvent, TreeNodeUnSelectEvent, TreeScrollEvent, TreeScrollIndexChangeEvent, TreeSelectNodeCollapseEvent, TreeSelectNodeExpandEvent, TreeTableColResizeEvent, TreeTableColumnReorderEvent, TreeTableContextMenuSelectEvent, TreeTableEditEvent, TreeTableFilterEvent, TreeTableFilterOptions, TreeTableHeaderCheckboxToggleEvent, TreeTableLazyLoadEvent, TreeTableNode, TreeTableNodeCollapseEvent, TreeTableNodeExpandEvent, TreeTableNodeSelectEvent, TreeTableNodeUnSelectEvent, TreeTablePaginatorState, TreeTableSortEvent, TypographyConfig, UBCKPaginatorState, UbckImportProps, UploadBehaviorConfig, UploadConfig, UploadDerivedState, UploadProps, UploadState, UploadTemplates, UploadUIConfig, UploadValidationConfig, ValidationErrorEventData, ValidationMessages, VisibilityContext, ZIndexBaseValue, ZIndexLayer };
