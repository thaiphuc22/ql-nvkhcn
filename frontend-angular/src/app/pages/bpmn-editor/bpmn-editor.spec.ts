import { safeBpmnFileName, starterBpmn } from './starter-bpmn';

describe('starterBpmn', () => {
  it('creates one executable process whose DI plane points to the requested id', () => {
    const xml = starterBpmn('Process_RD0202', 'Xét duyệt & phê duyệt');
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    const process = document.getElementsByTagNameNS(
      'http://www.omg.org/spec/BPMN/20100524/MODEL',
      'process',
    )[0];
    const plane = document.getElementsByTagNameNS(
      'http://www.omg.org/spec/BPMN/20100524/DI',
      'BPMNPlane',
    )[0];

    expect(document.querySelector('parsererror')).toBeNull();
    expect(process.getAttribute('id')).toBe('Process_RD0202');
    expect(process.getAttribute('name')).toBe('Xét duyệt & phê duyệt');
    expect(process.getAttribute('isExecutable')).toBe('true');
    expect(plane.getAttribute('bpmnElement')).toBe('Process_RD0202');
  });

  it('creates a safe .bpmn download filename', () => {
    expect(safeBpmnFileName(' Process_RD02/02 ')).toBe('Process_RD02_02.bpmn');
    expect(safeBpmnFileName('...')).toBe('process.bpmn');
  });
});
