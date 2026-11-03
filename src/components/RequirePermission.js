import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUser, PERMISSIONS } from '../context/UserContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';

const Denied = styled.div`
  padding: 2rem;
  max-width: 480px;
  margin: 3rem auto;
  text-align: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
`;

/**
 * Route guard. Auth user is treated as business owner unless business.role is set.
 */
export default function RequirePermission({ permission, children, fallback = null }) {
  const { hasPermission } = useUser();
  const { business } = useFirebaseBusiness();
  const role = business?.role || 'owner';

  if (!permission) return children;

  if (!hasPermission(role, permission)) {
    if (fallback) return fallback;
    return (
      <Denied>
        <h2 style={{ marginTop: 0 }}>Access denied</h2>
        <p style={{ color: '#64748b' }}>
          Your role ({role}) does not include permission: {permission}
        </p>
      </Denied>
    );
  }

  return children;
}

export function RequirePermissionRedirect({ permission, to = '/', children }) {
  const { hasPermission } = useUser();
  const { business } = useFirebaseBusiness();
  const role = business?.role || 'owner';
  if (permission && !hasPermission(role, permission)) {
    return <Navigate to={to} replace />;
  }
  return children;
}

export { PERMISSIONS };
