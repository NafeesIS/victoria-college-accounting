export interface Teacher {
  _id: string;
  name: string;
  department: string;
  bcsBatch: string;
  idNumber: string;
  nidNumber: string;
  eTin: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TeacherFormProps {
  onTeacherAdded: (teacher: Teacher) => void;
}

export interface Filters {
  search: string;
  department: string;
  sortBy: string;
  sortOrder: string;
}

export interface TeacherTableProps {
  teachers: Teacher[];
  isLoading: boolean;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userName: string;
}