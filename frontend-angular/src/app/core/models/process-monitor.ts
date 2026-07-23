export interface ProcessMonitorStats { active: number; incidents: number; completed: number; terminated: number; }
export interface ProcessMonitorStep { elementId: string; name: string; type: string; startedAt: string | null; hasIncident: boolean; }
export interface ProcessMonitorInstance {
  processInstanceKey: string; businessId: string; bpmnProcessId: string; processName: string; version: number;
  state: 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'UNKNOWN'; startedAt: string | null; endedAt: string | null;
  hasIncident: boolean; currentSteps: ProcessMonitorStep[];
}
export interface ProcessMonitorResponse {
  available: boolean; message: string | null; observedAt: string; stats: ProcessMonitorStats; instances: ProcessMonitorInstance[];
}
