// Khai báo type tối thiểu cho các gói bpmn.io không kèm .d.ts.
declare module 'bpmn-js-properties-panel' {
  const BpmnPropertiesPanelModule: unknown
  const BpmnPropertiesProviderModule: unknown
  const ZeebePropertiesProviderModule: unknown
  const CamundaPlatformPropertiesProviderModule: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useService(name: string): any
  export {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ZeebePropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
  }
}

declare module '@bpmn-io/properties-panel' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function SelectEntry(props: any): any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function isSelectEntryEdited(node: any): boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function TextFieldEntry(props: any): any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function isTextFieldEntryEdited(node: any): boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function CheckboxEntry(props: any): any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function isCheckboxEntryEdited(node: any): boolean
}

declare module 'diagram-js-grid' {
  const GridModule: unknown
  export default GridModule
}

declare module 'zeebe-bpmn-moddle/resources/zeebe.json' {
  const zeebeModdle: unknown
  export default zeebeModdle
}

declare module 'diagram-js-minimap' {
  const MinimapModule: unknown
  export default MinimapModule
}
