import '@testing-library/jest-dom';

import { vi } from 'vitest';

vi.mock('react-router-dom', async () => {
 const actual = await vi.importActual('react-router-dom');
 return {
 ...actual,
 useNavigate: () => vi.fn(),
 useLocation: () => ({ pathname: '/' }),
 useParams: () => ({}),
 };
});

vi.mock('@features/auth/AuthContext', () => ({
 useAuth: () => ({
 currentUser: null,
 currentCompany: null,
 isHydrating: false,
 logout: () => {},
 refreshCurrentUser: async () => null,
 }),
}));

if (typeof window !== 'undefined') {
 window.alert = window.alert || (() => {});
 window.confirm = window.confirm || (() => true);
}

globalThis.vi = vi;

