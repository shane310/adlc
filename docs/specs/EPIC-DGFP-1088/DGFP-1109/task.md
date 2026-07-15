# Story 1.15: Implement System Administration Dashboard

**Status**: ready-for-dev  
**Epic**: 1 - Project Foundation & Infrastructure  
**Story ID**: 1.15  
**Story Key**: 1-15-implement-system-administration-dashboard

---

## Story Overview

**As a** system administrator,  
**I want** a comprehensive admin dashboard to manage users, monitor system health, and access critical configuration,  
**So that** I can effectively maintain the platform and respond to issues proactively.

### Business Context

This story completes **EPIC 1: PROJECT FOUNDATION & INFRASTRUCTURE** by delivering the system administration interface that enables SYSTEM_ADMIN users to maintain the NISIT platform. This is the final foundational story before transitioning to Epic 2 (Certification Application workflows).

**Critical Success Factors:**
- Dedicated admin area at `/admin` accessible only to SYSTEM_ADMIN role
- User management capabilities (create, edit, deactivate, role assignment)
- Role and permission management interface
- System monitoring dashboard with health metrics
- Configuration settings management
- Audit log viewer with search and export
- Health check API endpoint for load balancer monitoring

**Epic 1 Context:**  
Stories 1.1-1.14 established authentication, database, Redis, security, RBAC, audit logging, and design system foundations. This story unifies those capabilities into a centralized administration interface, ensuring SYSTEM_ADMIN users can maintain the platform operationally.

**Integration with Previous Stories:**
- **Story 1.2**: Uses User, Role, Permission models from database schema
- **Story 1.3**: Monitors Redis connection status, uses cache for metrics
- **Story 1.5**: Requires NextAuth.js authentication
- **Story 1.7**: Enforces RBAC (SYSTEM_ADMIN role only access)
- **Story 1.10**: Displays audit logs with search and export
- **Story 1.11**: Monitors security headers, encryption status

---

## Acceptance Criteria

### AC1: Admin Dashboard Overview Page

**Given** a user with SYSTEM_ADMIN role logs in and navigates to `/admin`  
**When** the dashboard page loads  
**Then** the page displays the admin navigation sidebar with sections:
- Dashboard (overview metrics)
- User Management
- Role & Permission Management
- System Monitoring
- Audit Logs
- Configuration Settings

**And** the dashboard overview displays key metrics in card widgets:

**System Health Metrics:**
- System uptime display (e.g., "Uptime: 99.8% (14 days, 3 hours)")
- Current active user sessions count
- Database connection status (✅ Connected or ❌ Disconnected)
- Redis connection status for all 3 databases (session, cache, pub/sub)
- Disk storage usage (used/total with percentage)
- Memory usage (current/available)
- Recent errors count (last 24 hours)

**Application Metrics:**
- Total user accounts
- Active users (last 7 days)
- Total certification applications (all time)
- Applications submitted this month
- Certificates issued this month

**And** metrics auto-refresh every 30 seconds using client-side polling or WebSocket
**And** critical issues are highlighted with warning indicators (red for errors, yellow for warnings)
**And** "Last updated: X seconds ago" timestamp is visible

**Validation:**
- ✅ Dashboard displays all metric cards with current values
- ✅ Auto-refresh updates metrics without page reload
- ✅ Critical issues are visually highlighted
- ✅ Non-SYSTEM_ADMIN users receive 403 Forbidden error

---

### AC2: User Management Interface

**Given** an admin navigates to `/admin/users`  
**When** the user management page loads  
**Then** the page displays a paginated table of all users with columns:
- Email
- Name (firstName + lastName)
- Company
- Role (badge with role name)
- MFA Status (Enabled/Disabled badge)
- Active Status (Active/Inactive badge)
- Last Login (relative time, e.g., "2 hours ago")
- Created Date
- Actions (View, Edit, Deactivate buttons)

**And** the table includes search and filter functionality:
- Search by email or name (instant filter)
- Filter by role (dropdown: All, Business User, Inspector, Administrator, etc.)
- Filter by active status (Active/Inactive/All)
- Filter by MFA status (Enabled/Disabled/All)

**And** pagination displays 20 users per page with "Previous" and "Next" buttons
**And** "Add User" button is prominently displayed at top of page

**Given** an admin clicks on a user row  
**When** the user detail modal opens  
**Then** the modal displays complete user profile:
- Email (read-only)
- First Name, Last Name (read-only in detail view, editable in edit mode)
- Company Name
- Phone Number
- Role assignment (dropdown to change role)
- MFA Status (read-only display, cannot force enable/disable from admin)
- Active Status (toggle to activate/deactivate)
- Created At, Updated At timestamps
- Last Login timestamp

**And** "Edit" button opens edit mode
**And** "Deactivate Account" button (if user is active) or "Reactivate Account" button (if inactive)
**And** "Close" button dismisses modal

**Given** an admin clicks "Edit" on a user  
**When** edit mode is enabled  
**Then** the admin can modify: firstName, lastName, companyName, phone, roleId
**And** clicking "Save Changes" validates input and updates the User record
**And** success toast notification displays: "User updated successfully"
**And** action is logged in audit trail: userId (admin), action: "user_updated", resource: "user", resourceId: {userId}, details: {changed fields}

**Given** an admin clicks "Deactivate Account"  
**When** confirmation dialog appears  
**Then** the dialog warns: "Deactivating this account will immediately log out the user and prevent future logins. Continue?"
**And** clicking "Confirm" sets User.isActive = false
**And** all active sessions for that user are invalidated (deleted from Session table and Redis)
**And** success notification displays: "User account deactivated"
**And** action is logged in audit trail

**Given** an admin clicks "Add User"  
**When** the add user form opens  
**Then** the form includes fields: email, password, confirmPassword, firstName, lastName, companyName (optional), phone, roleId (dropdown)
**And** form validates: email format, password complexity (12 chars min, mixed case, number, special char), passwords match
**And** clicking "Create User" hashes password with bcryptjs and creates User record
**And** success notification displays: "User account created successfully"
**And** action is logged in audit trail

**Validation:**
- ✅ User table displays all users with correct data
- ✅ Search and filters work instantly
- ✅ User detail modal shows complete profile
- ✅ Edit mode updates user data correctly
- ✅ Deactivation invalidates sessions immediately
- ✅ Add user creates new account with hashed password
- ✅ All actions are logged in audit trail

---

### AC3: Role and Permission Management

**Given** an admin navigates to `/admin/roles`  
**When** the role management page loads  
**Then** the page displays the 6 system roles in cards:
1. BUSINESS_USER (requiresMfa: false)
2. INSPECTOR (requiresMfa: true)
3. ADMINISTRATOR (requiresMfa: true)
4. GOVERNMENT_AGENCY (requiresMfa: false)
5. PUBLIC_CITIZEN (requiresMfa: false)
6. SYSTEM_ADMIN (requiresMfa: true)

**And** each role card displays:
- Role name (PascalCase converted to Title Case: "Business User", "System Admin")
- Description
- MFA Requirement badge (Required/Not Required)
- Number of users with this role
- "View Permissions" button

**Given** an admin clicks "View Permissions" on a role  
**When** the permissions modal opens  
**Then** the modal displays:
- Role name and description
- Complete list of permissions assigned to this role
- Permissions grouped by resource (applications, certificates, users, etc.)
- Each permission shows: resource + action (e.g., "applications:create", "users:manage")

**And** permissions can be added or removed via checkboxes (except SYSTEM_ADMIN which has all permissions)
**And** "Add Permission" button opens permission selector
**And** "Remove Permission" button next to each permission

**Given** an admin modifies role permissions  
**When** the admin clicks "Save Changes"  
**Then** a confirmation dialog appears: "Changing permissions affects all users with this role. Continue?"
**And** clicking "Confirm" updates the role permissions in RolePermissions join table
**And** permission cache in Redis is invalidated for all users with this role
**And** success notification displays: "Role permissions updated successfully"
**And** action is logged in audit trail: userId (admin), action: "role_permissions_updated", resource: "role", resourceId: {roleId}, details: {added permissions, removed permissions}

**Given** an admin attempts to modify SYSTEM_ADMIN permissions  
**When** the admin opens SYSTEM_ADMIN permissions modal  
**Then** all checkboxes are disabled with message: "SYSTEM_ADMIN role has all permissions by default and cannot be modified"

**Validation:**
- ✅ All 6 roles display with correct data
- ✅ Permission modal shows complete permission list
- ✅ Permission changes update database and invalidate cache
- ✅ SYSTEM_ADMIN permissions cannot be modified
- ✅ Changes require confirmation dialog
- ✅ All actions are logged in audit trail

---

### AC4: System Monitoring Dashboard

**Given** an admin views the dashboard at `/admin`  
**When** the system monitoring section displays  
**Then** the page shows real-time system health metrics:

**Database Status:**
- MySQL connection status (✅ Connected or ❌ Disconnected)
- Connection pool usage (e.g., "3/5 connections active")
- Query performance: Average query time (last 5 minutes)
- Recent slow queries count (> 500ms)

**Redis Status:**
- Redis DB 0 (Sessions): ✅ Connected, Key count, Memory usage
- Redis DB 1 (Cache): ✅ Connected, Key count, Memory usage, Cache hit rate
- Redis DB 2 (Pub/Sub): ✅ Connected, Active subscriptions

**Server Metrics:**
- Server uptime (days, hours, minutes)
- Memory usage: Used/Total (e.g., "4.2 GB / 8 GB (52%)")
- CPU usage (if available from system, otherwise omit)
- Disk storage: Used/Total for application directory and storage directory

**Application Health:**
- Active user sessions count
- WebSocket connections count (if WebSocket server running)
- Recent API errors (last 1 hour, last 24 hours)
- Failed login attempts (last 1 hour)

**And** metrics are fetched from `/api/admin/health` endpoint
**And** critical warnings display if:
- Database connection fails (red alert)
- Redis connection fails (yellow warning)
- Disk usage > 90% (yellow warning)
- Memory usage > 85% (yellow warning)
- Recent errors > 10 in last hour (yellow warning)

**And** "Refresh Metrics" button manually triggers update
**And** metrics auto-refresh every 30 seconds

**Validation:**
- ✅ All metrics display current system state
- ✅ Database and Redis connection status is accurate
- ✅ Warnings display for critical issues
- ✅ Auto-refresh updates metrics without page reload
- ✅ Manual refresh button works immediately

---

### AC5: Health Check API Endpoint

**Given** a load balancer or monitoring system queries `/api/health`  
**When** the health check endpoint is called  
**Then** the endpoint returns JSON response with structure:
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234567, // seconds since server start
  "services": {
    "database": "up" | "down",
    "redis_session": "up" | "down",
    "redis_cache": "up" | "down",
    "redis_pubsub": "up" | "down"
  },
  "metrics": {
    "activeConnections": 23,
    "memoryUsage": 52.4, // percentage
    "diskUsage": 67.8 // percentage
  }
}
```

**And** HTTP status codes are:
- 200 OK if status = "healthy" (all services up)
- 200 OK if status = "degraded" (some non-critical services down, but database up)
- 503 Service Unavailable if status = "unhealthy" (database down or critical failure)

**And** the endpoint does NOT require authentication (public for infrastructure monitoring)
**And** response time is < 100ms (fast health check for load balancer)

**And** health status determination logic:
- "healthy": All services up (database + all 3 Redis DBs)
- "degraded": Database up, but 1+ Redis DB down (non-critical)
- "unhealthy": Database down or unable to query

**Validation:**
- ✅ Endpoint returns correct JSON structure
- ✅ HTTP status codes match health status
- ✅ Response time is < 100ms
- ✅ No authentication required (public endpoint)
- ✅ Health status accurately reflects service states

---

### AC6: Configuration Settings Management

**Given** an admin navigates to `/admin/settings`  
**When** the settings page loads  
**Then** the page displays configurable system parameters grouped by category:

**Security Settings:**
- Session timeout duration (minutes, default: 30)
- Password complexity toggle (enabled/disabled, default: enabled)
- MFA enforcement policies (per role or global)