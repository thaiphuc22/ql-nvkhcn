/** Contract của GET /api/my-tasks từ Service Hồ sơ. */
export interface MyTaskResponse {
  processInstanceKey: string;
  taskKey: string;
  taskDefinitionKey: string;
  maHoSo: string;
  tenBuoc: string;
  assignee: string | null;
  candidateUsers: string[];
  candidateGroups: string[];
  createdAt: string;
  dueAt: string | null;
  formKey: string | null;
}
