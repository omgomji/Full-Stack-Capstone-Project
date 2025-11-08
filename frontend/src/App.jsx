import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleGuard from './components/RoleGuard.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PostsPage from './pages/PostsPage.jsx';
import PostEditorPage from './pages/PostEditorPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import UserAdminPage from './pages/UserAdminPage.jsx';
import PermissionDeniedPage from './pages/PermissionDeniedPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/new" element={<PostEditorPage mode="create" />} />
          <Route path="/posts/:id" element={<PostEditorPage mode="edit" />} />
          <Route path="/posts/:id/view" element={<PostDetailPage />} />
          <Route
            path="/audit"
            element={(
              <RoleGuard roles={["admin"]} fallback={<PermissionDeniedPage message="Admin privileges are required to view audit logs." />}>
                <AuditPage />
              </RoleGuard>
            )}
          />
          <Route
            path="/users"
            element={(
              <RoleGuard roles={["admin"]} fallback={<PermissionDeniedPage message="Only admins can manage users." />}>
                <UserAdminPage />
              </RoleGuard>
            )}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
