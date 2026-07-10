import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  DEFAULT_DOMAIN_CODE,
  RBAC_ROLES,
  ROLE_PERMISSION_POLICIES,
  USER_ROLE_ASSIGNMENTS,
  defaultScopeForRole,
  type DataScopeCode,
  type RbacRole,
  type RolePermissionPolicy,
  type UserRoleAssignment,
} from '../data/rbac'

/** Payload gán/cập nhật phạm vi dữ liệu cho user (scope-overlay). */
export interface UpsertAssignmentInput {
  userId: string
  roleCode: string
  dataScope: DataScopeCode
  orgUnitId?: string
  effectiveFrom?: string
  effectiveTo?: string
}

interface RbacCtxValue {
  roles: RbacRole[]
  setRoles: Dispatch<SetStateAction<RbacRole[]>>
  policies: RolePermissionPolicy[]
  setPolicies: Dispatch<SetStateAction<RolePermissionPolicy[]>>
  assignments: UserRoleAssignment[]
  setAssignments: Dispatch<SetStateAction<UserRoleAssignment[]>>

  // ── Helper cho màn Người dùng (scope-overlay) ──────────────────────────────
  assignmentsForUser: (userId: string) => UserRoleAssignment[]
  /** Upsert theo (userId, roleCode) — id ổn định `URA-{user}-{role}`. */
  upsertAssignment: (input: UpsertAssignmentInput) => void
  removeAssignment: (id: string) => void

  /** Khôi phục toàn bộ roles/policies/assignments về seed gốc. */
  resetDefaults: () => void
}

const RbacCtx = createContext<RbacCtxValue | null>(null)

export function useRbac(): RbacCtxValue {
  const ctx = useContext(RbacCtx)
  if (!ctx) throw new Error('useRbac must be used within RbacProvider')
  return ctx
}

export function RbacProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<RbacRole[]>(RBAC_ROLES)
  const [policies, setPolicies] = useState<RolePermissionPolicy[]>(ROLE_PERMISSION_POLICIES)
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>(USER_ROLE_ASSIGNMENTS)

  const value = useMemo<RbacCtxValue>(() => {
    const assignmentsForUser = (userId: string) => assignments.filter((a) => a.userId === userId)

    const upsertAssignment: RbacCtxValue['upsertAssignment'] = (input) => {
      const id = `URA-${input.userId}-${input.roleCode}`
      const row: UserRoleAssignment = {
        id,
        domainCode: DEFAULT_DOMAIN_CODE,
        userId: input.userId,
        roleCode: input.roleCode,
        dataScope: input.dataScope,
        orgUnitId: input.orgUnitId,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
      }
      setAssignments((prev) => {
        const idx = prev.findIndex((a) => a.userId === input.userId && a.roleCode === input.roleCode)
        if (idx === -1) return [...prev, row]
        const next = [...prev]
        next[idx] = row
        return next
      })
    }

    const removeAssignment: RbacCtxValue['removeAssignment'] = (id) => {
      setAssignments((prev) => prev.filter((a) => a.id !== id))
    }

    const resetDefaults = () => {
      setRoles(RBAC_ROLES)
      setPolicies(ROLE_PERMISSION_POLICIES)
      setAssignments(USER_ROLE_ASSIGNMENTS)
    }

    return {
      roles,
      setRoles,
      policies,
      setPolicies,
      assignments,
      setAssignments,
      assignmentsForUser,
      upsertAssignment,
      removeAssignment,
      resetDefaults,
    }
  }, [roles, policies, assignments])

  return <RbacCtx.Provider value={value}>{children}</RbacCtx.Provider>
}

export { defaultScopeForRole }
