export type BpmnModdleElement = { isExecutable?: boolean };
export type BpmnElement = {
  type?: string;
  businessObject?: { isExecutable?: boolean; processRef?: BpmnModdleElement };
};
export type ExecutableProcessTarget = { element: BpmnElement; process: BpmnModdleElement };
export type ElementRegistryLike = { filter: (predicate: (element: BpmnElement) => boolean) => BpmnElement[] };

/**
 * Locates the executable bpmn:Process. For a bare process diagram it is registered directly in
 * the elementRegistry; once a Pool is drawn the root becomes bpmn:Collaboration and the process
 * only exists as the Participant's processRef, so it must be resolved through the pool instead.
 */
export function resolveExecutableProcess(registry: ElementRegistryLike): ExecutableProcessTarget {
  const direct = registry.filter(
    (element) => element.type === 'bpmn:Process' || element.businessObject?.isExecutable === true,
  )[0];
  if (direct) return { element: direct, process: direct.businessObject as BpmnModdleElement };

  const pools = registry
    .filter((element) => element.type === 'bpmn:Participant')
    .map((element) => ({ element, process: element.businessObject?.processRef }))
    .filter((candidate): candidate is ExecutableProcessTarget => !!candidate.process);
  if (pools.length === 0) throw new Error('Sơ đồ phải có một process executable.');
  if (pools.length > 1) throw new Error('Sơ đồ chỉ được có một process executable (một Pool có nội dung).');
  return pools[0];
}
