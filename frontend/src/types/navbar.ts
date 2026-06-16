type NavItem = {
  to: string;
  label: string;
};

export interface NavProps {
  navItems: NavItem[];
}

export type Theme = 'light' | 'dark';

export interface LocationState {
  from?: unknown;
}
