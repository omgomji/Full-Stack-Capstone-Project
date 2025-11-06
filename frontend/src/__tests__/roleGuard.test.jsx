import { render, screen } from '@testing-library/react';
import RoleGuard from '../components/RoleGuard.jsx';

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { role: 'viewer' }, can: () => false })
}));

describe('RoleGuard', () => {
  it('hides children when role missing', () => {
    render(<RoleGuard roles={['admin']} fallback={<span>denied</span>}>secret</RoleGuard>);
    expect(screen.getByText('denied')).toBeInTheDocument();
  });
});
