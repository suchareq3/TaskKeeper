import { Timestamp } from "../TaskKeeper-mobile/exportedModules";

// For the "Authentication" module only, NOT for Firestore
export interface AuthenticationUser {
  email: string;
  password: string;
  uid?: string; // NOTE: identical to id from User
}

// For Firestore only, NOT for the "Authentication" module
export interface User {
  id?: string; // NOTE: identical to uid from AuthenticationUser
  first_name: string;
  last_name: string;
  date_of_birth: Timestamp;
  fcm_token: string;
  created_on: Timestamp;
  last_updated_on: Timestamp;
}

export interface Task {
  id?: string;
  task_assignee_uid: string;
  assigned_user_uid: string;
  created_on: Timestamp;
  last_updated_on: Timestamp;
  priority_level: "1" | "2" | "3" | "4" | "5";
  project_id: string;
  release_id: string;
  subtasks: Subtask[];
  task_description: string;
  task_name: string;
  task_type: "new-feature" | "change" | "bug-fix" | "testing" | "documentation" | "research" | "other";
  task_status: "on-hold" | "in-progress" | "completed";
}

export interface Subtask {
  completed: boolean;
  key: string;
  label: string;
}

export interface Project {
  id?: string;
  created_on: Timestamp;
  last_updated_on: Timestamp;
  description: string;
  github_url: string;
  invite_code: string;
  name: string;
  members: {
    [userId: string]: {
      isManager: boolean;
    }
  }
  // releases: Release[];
  // tasks: Task[];
}

export interface Release {
  id?: string;
  actual_end_date: Timestamp | null;
  planned_end_date: Timestamp;
  start_date: Timestamp | null;
  project_id: string;
  name: string;
  description: string;
  created_on: Timestamp;
  last_updated_on: Timestamp;
  status: "planned" | "in-progress" | "finished";
}

export interface Notification {
  id?: string;
  body: string;
  title: string;
  created_on: Timestamp;
  user_uids: string[];
}
