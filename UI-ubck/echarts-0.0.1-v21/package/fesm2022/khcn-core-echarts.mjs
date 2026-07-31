import * as i0 from '@angular/core';
import { InjectionToken, inject, PLATFORM_ID, ElementRef, NgZone, input, output, Directive } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { ReplaySubject, Subscription, Subject, asyncScheduler, Observable } from 'rxjs';
import { throttleTime, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

const UBCK_ECHARTS_CONFIG = new InjectionToken('UBCK_ECHARTS_CONFIG');

function provideEchartsCore(config) {
    return {
        provide: UBCK_ECHARTS_CONFIG,
        useValue: config,
    };
}

class UbckFilterChangeObserver {
    subject = new ReplaySubject(1);
    subscriptions = new Subscription();
    observe(changes) {
        this.subject.next(changes);
    }
    unObserve() {
        this.subscriptions.unsubscribe();
    }
    notEmpty(key, handler) {
        this.subscriptions.add(this.subject.subscribe(changes => {
            if (changes[key]) {
                const value = changes[key].currentValue;
                if (value !== undefined && value !== null) {
                    handler(value);
                }
            }
        }));
    }
    has(key, handler) {
        this.subscriptions.add(this.subject.subscribe(changes => {
            if (changes[key]) {
                const value = changes[key].currentValue;
                handler(value);
            }
        }));
    }
    notFirst(key, handler) {
        this.subscriptions.add(this.subject.subscribe(changes => {
            if (changes[key] && !changes[key].isFirstChange()) {
                const value = changes[key].currentValue;
                handler(value);
            }
        }));
    }
    notFirstAndEmpty(key, handler) {
        this.subscriptions.add(this.subject.subscribe(changes => {
            if (changes[key] && !changes[key].isFirstChange()) {
                const value = changes[key].currentValue;
                if (value !== undefined && value !== null) {
                    handler(value);
                }
            }
        }));
    }
}

class UBCKEchartsDirective {
    platformId = inject(PLATFORM_ID);
    el = inject(ElementRef);
    ngZone = inject(NgZone);
    config = inject(UBCK_ECHARTS_CONFIG);
    options = input(null, ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    theme = input(this.config.theme ?? null, ...(ngDevMode ? [{ debugName: "theme" }] : /* istanbul ignore next */ []));
    initOpts = input(null, ...(ngDevMode ? [{ debugName: "initOpts" }] : /* istanbul ignore next */ []));
    merge = input(null, ...(ngDevMode ? [{ debugName: "merge" }] : /* istanbul ignore next */ []));
    autoResize = input(true, ...(ngDevMode ? [{ debugName: "autoResize" }] : /* istanbul ignore next */ []));
    loading = input(false, ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    loadingType = input('default', ...(ngDevMode ? [{ debugName: "loadingType" }] : /* istanbul ignore next */ []));
    loadingOpts = input(null, ...(ngDevMode ? [{ debugName: "loadingOpts" }] : /* istanbul ignore next */ []));
    // ngx-echarts events
    chartInit = output();
    optionsError = output();
    // echarts mouse events
    chartClick = outputFromObservable(this.createLazyEvent('click'));
    chartDblClick = outputFromObservable(this.createLazyEvent('dblclick'));
    chartMouseDown = outputFromObservable(this.createLazyEvent('mousedown'));
    chartMouseMove = outputFromObservable(this.createLazyEvent('mousemove'));
    chartMouseUp = outputFromObservable(this.createLazyEvent('mouseup'));
    chartMouseOver = outputFromObservable(this.createLazyEvent('mouseover'));
    chartMouseOut = outputFromObservable(this.createLazyEvent('mouseout'));
    chartGlobalOut = outputFromObservable(this.createLazyEvent('globalout'));
    chartContextMenu = outputFromObservable(this.createLazyEvent('contextmenu'));
    // echarts events
    chartHighlight = outputFromObservable(this.createLazyEvent('highlight'));
    chartDownplay = outputFromObservable(this.createLazyEvent('downplay'));
    chartSelectChanged = outputFromObservable(this.createLazyEvent('selectchanged'));
    chartLegendSelectChanged = outputFromObservable(this.createLazyEvent('legendselectchanged'));
    chartLegendSelected = outputFromObservable(this.createLazyEvent('legendselected'));
    chartLegendUnselected = outputFromObservable(this.createLazyEvent('legendunselected'));
    chartLegendLegendSelectAll = outputFromObservable(this.createLazyEvent('legendselectall'));
    chartLegendLegendInverseSelect = outputFromObservable(this.createLazyEvent('legendinverseselect'));
    chartLegendScroll = outputFromObservable(this.createLazyEvent('legendscroll'));
    chartDataZoom = outputFromObservable(this.createLazyEvent('datazoom'));
    chartDataRangeSelected = outputFromObservable(this.createLazyEvent('datarangeselected'));
    chartGraphRoam = outputFromObservable(this.createLazyEvent('graphroam'));
    chartGeoRoam = outputFromObservable(this.createLazyEvent('georoam'));
    chartTreeRoam = outputFromObservable(this.createLazyEvent('treeroam'));
    chartTimelineChanged = outputFromObservable(this.createLazyEvent('timelinechanged'));
    chartTimelinePlayChanged = outputFromObservable(this.createLazyEvent('timelineplaychanged'));
    chartRestore = outputFromObservable(this.createLazyEvent('restore'));
    chartDataViewChanged = outputFromObservable(this.createLazyEvent('dataviewchanged'));
    chartMagicTypeChanged = outputFromObservable(this.createLazyEvent('magictypechanged'));
    chartGeoSelectChanged = outputFromObservable(this.createLazyEvent('geoselectchanged'));
    chartGeoSelected = outputFromObservable(this.createLazyEvent('geoselected'));
    chartGeoUnselected = outputFromObservable(this.createLazyEvent('geounselected'));
    chartAxisAreaSelected = outputFromObservable(this.createLazyEvent('axisareaselected'));
    chartBrush = outputFromObservable(this.createLazyEvent('brush'));
    chartBrushEnd = outputFromObservable(this.createLazyEvent('brushend'));
    chartBrushSelected = outputFromObservable(this.createLazyEvent('brushselected'));
    chartGlobalCursorTaken = outputFromObservable(this.createLazyEvent('globalcursortaken'));
    chartRendered = outputFromObservable(this.createLazyEvent('rendered'));
    chartFinished = outputFromObservable(this.createLazyEvent('finished'));
    animationFrameID = null;
    chart;
    chart$ = new ReplaySubject(1);
    resizeOb;
    resize$ = new Subject();
    resizeSub;
    initChartTimer;
    changeFilter = new UbckFilterChangeObserver();
    loadingSub;
    resizeObFired = false;
    echarts = this.config.echarts;
    ngOnChanges(changes) {
        this.changeFilter.observe(changes);
    }
    ngOnInit() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        ;
        if (!window.ResizeObserver) {
            throw new Error('please install a polyfill for ResizeObserver');
        }
        this.resizeSub = this.resize$
            .pipe(throttleTime(100, asyncScheduler, { leading: false, trailing: true }))
            .subscribe(() => this.resize());
        if (this.autoResize()) {
            // https://github.com/xieziyu/ngx-echarts/issues/413
            this.resizeOb = this.ngZone.runOutsideAngular(() => new window.ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.target === this.el.nativeElement) {
                        // Ignore first fire on insertion, no resize actually happened
                        if (!this.resizeObFired) {
                            this.resizeObFired = true;
                        }
                        else {
                            this.animationFrameID = window.requestAnimationFrame(() => {
                                this.resize$.next();
                            });
                        }
                    }
                }
            }));
            this.resizeOb.observe(this.el.nativeElement);
        }
        this.changeFilter.notFirstAndEmpty('options', opt => this.onOptionsChange(opt));
        this.changeFilter.notFirstAndEmpty('merge', opt => this.setOption(opt));
        this.changeFilter.has('loading', v => this.toggleLoading(!!v));
        this.changeFilter.notFirst('theme', () => this.refreshChart());
    }
    ngOnDestroy() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        ;
        window.clearTimeout(this.initChartTimer);
        if (this.resizeSub) {
            this.resizeSub.unsubscribe();
        }
        if (this.animationFrameID) {
            window.cancelAnimationFrame(this.animationFrameID);
        }
        if (this.resizeOb) {
            this.resizeOb.unobserve(this.el.nativeElement);
        }
        if (this.loadingSub) {
            this.loadingSub.unsubscribe();
        }
        this.changeFilter.unObserve();
        this.dispose();
    }
    ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        ;
        this.initChartTimer = window.setTimeout(() => this.initChart());
    }
    dispose() {
        if (this.chart) {
            if (!this.chart.isDisposed()) {
                this.chart.dispose();
            }
            this.chart = null;
        }
    }
    /**
     * resize chart
     */
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
    toggleLoading(loading) {
        if (this.chart) {
            loading
                ? this.chart.showLoading(this.loadingType(), this.loadingOpts())
                : this.chart.hideLoading();
        }
        else {
            this.loadingSub = this.chart$.subscribe(chart => loading ? chart.showLoading(this.loadingType(), this.loadingOpts()) : chart.hideLoading());
        }
    }
    setOption(option, opts) {
        if (this.chart) {
            try {
                this.chart.setOption(option, opts);
            }
            catch (e) {
                console.error(e);
                this.optionsError.emit(e);
            }
        }
    }
    /**
     * dispose old chart and create a new one.
     */
    async refreshChart() {
        this.dispose();
        await this.initChart();
    }
    createChart() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        ;
        const dom = this.el.nativeElement;
        if (window && window.getComputedStyle) {
            const prop = window.getComputedStyle(dom, null).getPropertyValue('height');
            if ((!prop || prop === '0px') && (!dom.style.height || dom.style.height === '0px')) {
                dom.style.height = '400px';
            }
        }
        // here a bit tricky: we check if the echarts module is provided as function returning native import('...') then use the promise
        // otherwise create the function that imitates behaviour above with a provided as is module
        return this.ngZone.runOutsideAngular(() => {
            const load = typeof this.echarts === 'function' ? this.echarts : () => Promise.resolve(this.echarts);
            return load().then(({ init }) => init(dom, this.theme() ?? this.config?.theme, this.initOpts()));
        });
    }
    async initChart() {
        await this.onOptionsChange(this.options());
        const merge = this.merge();
        if (merge && this.chart) {
            this.setOption(merge);
        }
    }
    async onOptionsChange(opt) {
        if (!opt) {
            return;
        }
        if (this.chart) {
            this.setOption(this.options(), true);
        }
        else {
            this.chart = await this.createChart();
            this.chart$.next(this.chart);
            this.chartInit.emit(this.chart);
            this.setOption(this.options(), true);
        }
    }
    // allows to lazily bind to only those events that are requested through the `output()` by parent components
    // see https://stackoverflow.com/questions/51787972/optimal-reentering-the-ngzone-from-eventemitter-event for more info
    createLazyEvent(eventName) {
        return outputToObservable(this.chartInit).pipe(switchMap((chart) => new Observable(observer => {
            chart.on(eventName, (data) => this.ngZone.run(() => observer.next(data)));
            return () => {
                if (this.chart) {
                    if (!this.chart.isDisposed()) {
                        chart.off(eventName);
                    }
                }
            };
        })));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: UBCKEchartsDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "21.2.5", type: UBCKEchartsDirective, isStandalone: true, selector: "echarts, [echarts]", inputs: { options: { classPropertyName: "options", publicName: "options", isSignal: true, isRequired: false, transformFunction: null }, theme: { classPropertyName: "theme", publicName: "theme", isSignal: true, isRequired: false, transformFunction: null }, initOpts: { classPropertyName: "initOpts", publicName: "initOpts", isSignal: true, isRequired: false, transformFunction: null }, merge: { classPropertyName: "merge", publicName: "merge", isSignal: true, isRequired: false, transformFunction: null }, autoResize: { classPropertyName: "autoResize", publicName: "autoResize", isSignal: true, isRequired: false, transformFunction: null }, loading: { classPropertyName: "loading", publicName: "loading", isSignal: true, isRequired: false, transformFunction: null }, loadingType: { classPropertyName: "loadingType", publicName: "loadingType", isSignal: true, isRequired: false, transformFunction: null }, loadingOpts: { classPropertyName: "loadingOpts", publicName: "loadingOpts", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { chartInit: "chartInit", optionsError: "optionsError", chartClick: "chartClick", chartDblClick: "chartDblClick", chartMouseDown: "chartMouseDown", chartMouseMove: "chartMouseMove", chartMouseUp: "chartMouseUp", chartMouseOver: "chartMouseOver", chartMouseOut: "chartMouseOut", chartGlobalOut: "chartGlobalOut", chartContextMenu: "chartContextMenu", chartHighlight: "chartHighlight", chartDownplay: "chartDownplay", chartSelectChanged: "chartSelectChanged", chartLegendSelectChanged: "chartLegendSelectChanged", chartLegendSelected: "chartLegendSelected", chartLegendUnselected: "chartLegendUnselected", chartLegendLegendSelectAll: "chartLegendLegendSelectAll", chartLegendLegendInverseSelect: "chartLegendLegendInverseSelect", chartLegendScroll: "chartLegendScroll", chartDataZoom: "chartDataZoom", chartDataRangeSelected: "chartDataRangeSelected", chartGraphRoam: "chartGraphRoam", chartGeoRoam: "chartGeoRoam", chartTreeRoam: "chartTreeRoam", chartTimelineChanged: "chartTimelineChanged", chartTimelinePlayChanged: "chartTimelinePlayChanged", chartRestore: "chartRestore", chartDataViewChanged: "chartDataViewChanged", chartMagicTypeChanged: "chartMagicTypeChanged", chartGeoSelectChanged: "chartGeoSelectChanged", chartGeoSelected: "chartGeoSelected", chartGeoUnselected: "chartGeoUnselected", chartAxisAreaSelected: "chartAxisAreaSelected", chartBrush: "chartBrush", chartBrushEnd: "chartBrushEnd", chartBrushSelected: "chartBrushSelected", chartGlobalCursorTaken: "chartGlobalCursorTaken", chartRendered: "chartRendered", chartFinished: "chartFinished" }, exportAs: ["echarts"], usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.5", ngImport: i0, type: UBCKEchartsDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'echarts, [echarts]',
                    exportAs: 'echarts',
                }]
        }], propDecorators: { options: [{ type: i0.Input, args: [{ isSignal: true, alias: "options", required: false }] }], theme: [{ type: i0.Input, args: [{ isSignal: true, alias: "theme", required: false }] }], initOpts: [{ type: i0.Input, args: [{ isSignal: true, alias: "initOpts", required: false }] }], merge: [{ type: i0.Input, args: [{ isSignal: true, alias: "merge", required: false }] }], autoResize: [{ type: i0.Input, args: [{ isSignal: true, alias: "autoResize", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], loadingType: [{ type: i0.Input, args: [{ isSignal: true, alias: "loadingType", required: false }] }], loadingOpts: [{ type: i0.Input, args: [{ isSignal: true, alias: "loadingOpts", required: false }] }], chartInit: [{ type: i0.Output, args: ["chartInit"] }], optionsError: [{ type: i0.Output, args: ["optionsError"] }], chartClick: [{ type: i0.Output, args: ["chartClick"] }], chartDblClick: [{ type: i0.Output, args: ["chartDblClick"] }], chartMouseDown: [{ type: i0.Output, args: ["chartMouseDown"] }], chartMouseMove: [{ type: i0.Output, args: ["chartMouseMove"] }], chartMouseUp: [{ type: i0.Output, args: ["chartMouseUp"] }], chartMouseOver: [{ type: i0.Output, args: ["chartMouseOver"] }], chartMouseOut: [{ type: i0.Output, args: ["chartMouseOut"] }], chartGlobalOut: [{ type: i0.Output, args: ["chartGlobalOut"] }], chartContextMenu: [{ type: i0.Output, args: ["chartContextMenu"] }], chartHighlight: [{ type: i0.Output, args: ["chartHighlight"] }], chartDownplay: [{ type: i0.Output, args: ["chartDownplay"] }], chartSelectChanged: [{ type: i0.Output, args: ["chartSelectChanged"] }], chartLegendSelectChanged: [{ type: i0.Output, args: ["chartLegendSelectChanged"] }], chartLegendSelected: [{ type: i0.Output, args: ["chartLegendSelected"] }], chartLegendUnselected: [{ type: i0.Output, args: ["chartLegendUnselected"] }], chartLegendLegendSelectAll: [{ type: i0.Output, args: ["chartLegendLegendSelectAll"] }], chartLegendLegendInverseSelect: [{ type: i0.Output, args: ["chartLegendLegendInverseSelect"] }], chartLegendScroll: [{ type: i0.Output, args: ["chartLegendScroll"] }], chartDataZoom: [{ type: i0.Output, args: ["chartDataZoom"] }], chartDataRangeSelected: [{ type: i0.Output, args: ["chartDataRangeSelected"] }], chartGraphRoam: [{ type: i0.Output, args: ["chartGraphRoam"] }], chartGeoRoam: [{ type: i0.Output, args: ["chartGeoRoam"] }], chartTreeRoam: [{ type: i0.Output, args: ["chartTreeRoam"] }], chartTimelineChanged: [{ type: i0.Output, args: ["chartTimelineChanged"] }], chartTimelinePlayChanged: [{ type: i0.Output, args: ["chartTimelinePlayChanged"] }], chartRestore: [{ type: i0.Output, args: ["chartRestore"] }], chartDataViewChanged: [{ type: i0.Output, args: ["chartDataViewChanged"] }], chartMagicTypeChanged: [{ type: i0.Output, args: ["chartMagicTypeChanged"] }], chartGeoSelectChanged: [{ type: i0.Output, args: ["chartGeoSelectChanged"] }], chartGeoSelected: [{ type: i0.Output, args: ["chartGeoSelected"] }], chartGeoUnselected: [{ type: i0.Output, args: ["chartGeoUnselected"] }], chartAxisAreaSelected: [{ type: i0.Output, args: ["chartAxisAreaSelected"] }], chartBrush: [{ type: i0.Output, args: ["chartBrush"] }], chartBrushEnd: [{ type: i0.Output, args: ["chartBrushEnd"] }], chartBrushSelected: [{ type: i0.Output, args: ["chartBrushSelected"] }], chartGlobalCursorTaken: [{ type: i0.Output, args: ["chartGlobalCursorTaken"] }], chartRendered: [{ type: i0.Output, args: ["chartRendered"] }], chartFinished: [{ type: i0.Output, args: ["chartFinished"] }] } });

/*
 * Public API Surface of ubck-echarts
 */

/**
 * Generated bundle index. Do not edit.
 */

export { UBCKEchartsDirective, UBCK_ECHARTS_CONFIG, provideEchartsCore };
//# sourceMappingURL=khcn-core-echarts.mjs.map
