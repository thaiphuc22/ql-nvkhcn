import { BpmnElement, ElementRegistryLike, resolveExecutableProcess } from './executable-process';

function registryOf(elements: BpmnElement[]): ElementRegistryLike {
  return { filter: (predicate) => elements.filter(predicate) };
}

describe('resolveExecutableProcess', () => {
  it('finds a bare process registered directly in the elementRegistry', () => {
    const process: BpmnElement = { type: 'bpmn:Process', businessObject: { isExecutable: false } };
    const registry = registryOf([{ type: 'bpmn:StartEvent' }, process]);

    const target = resolveExecutableProcess(registry);

    expect(target.element).toBe(process);
    expect(target.process).toBe(process.businessObject);
  });

  it('resolves the process behind a single Pool (bpmn:Collaboration root)', () => {
    const processRef = { isExecutable: false };
    const pool: BpmnElement = { type: 'bpmn:Participant', businessObject: { processRef } };
    const registry = registryOf([{ type: 'bpmn:Collaboration' }, pool]);

    const target = resolveExecutableProcess(registry);

    expect(target.element).toBe(pool);
    expect(target.process).toBe(processRef);
  });

  it('throws when there is no process and no Pool with a processRef', () => {
    const registry = registryOf([{ type: 'bpmn:Collaboration' }, { type: 'bpmn:Participant', businessObject: {} }]);

    expect(() => resolveExecutableProcess(registry)).toThrowError('Sơ đồ phải có một process executable.');
  });

  it('throws a distinct error when more than one Pool has its own process', () => {
    const registry = registryOf([
      { type: 'bpmn:Participant', businessObject: { processRef: {} } },
      { type: 'bpmn:Participant', businessObject: { processRef: {} } },
    ]);

    expect(() => resolveExecutableProcess(registry)).toThrowError(
      'Sơ đồ chỉ được có một process executable (một Pool có nội dung).',
    );
  });
});
