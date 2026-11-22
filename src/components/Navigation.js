import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiHome,
  FiFileText,
  FiFileText as FiReceipt,
  FiCamera,
  FiBarChart,
  FiPackage,
  FiUsers,
  FiCalendar,
  FiSettings,
  FiShield,
  FiCreditCard,
  FiLogOut,
  FiDollarSign,
  FiBookOpen,
  FiBriefcase,
  FiShoppingCart,
  FiGlobe,
  FiPercent,
  FiFolder,
  FiTruck,
  FiCheckSquare,
  FiMail
} from 'react-icons/fi';
import { signOutUser } from '../firebase/auth';
import { logAnalyticsEvent, AnalyticsEvents } from '../utils/analytics';
import { useUser, PERMISSIONS } from '../context/UserContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';

const NavigationContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    transform: translateX(0);
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
  }

  &.mobile-open {
    transform: translateX(0);
  }
`;

const NavContent = styled.div`
  padding: 2rem 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const Brand = styled.div`
  padding: 0 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  margin-bottom: 1rem;
`;

const BrandName = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
`;

const BrandTag = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
`;

const NavSection = styled.div`
  margin-bottom: 1.5rem;
`;

const NavTitle = styled.h3`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin: 0 0 0.65rem 1.5rem;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.65rem 1.5rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    background: rgba(20, 184, 166, 0.18);
    color: #5eead4;
    border-left-color: #14b8a6;
  }
`;

const NavIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
`;

const NavText = styled.span`
  font-weight: 500;
  font-size: 0.9rem;
`;

const BottomNav = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  z-index: 100;

  @media (min-width: 768px) {
    display: none;
  }
`;

const BottomNavItem = styled(Link)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.35rem;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s ease;
  font-size: 0.7rem;

  &:hover {
    color: #14b8a6;
  }

  &.active {
    color: #14b8a6;
  }
`;

const BottomNavIcon = styled.span`
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;

  @media (max-width: 767px) {
    display: ${props => (props.show ? 'block' : 'none')};
  }
`;

const SignOutSection = styled.div`
  margin-top: auto;
  padding: 1rem 1.5rem 2rem;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
`;

const SignOutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
    color: #fecaca;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SignOutIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
`;

const navSections = [
  {
    title: 'Command',
    items: [
      { path: '/', icon: FiHome, label: 'Home' },
      { path: '/tasks', icon: FiCheckSquare, label: 'Tasks' }
    ]
  },
  {
    title: 'Sales & customers',
    items: [
      { path: '/quotes', icon: FiFileText, label: 'Quotes', permission: PERMISSIONS.VIEW_QUOTES },
      { path: '/invoices', icon: FiReceipt, label: 'Invoices', permission: PERMISSIONS.VIEW_INVOICES },
      { path: '/pos', icon: FiShoppingCart, label: 'POS', permission: PERMISSIONS.CREATE_INVOICES },
      { path: '/customers', icon: FiUsers, label: 'Customers', permission: PERMISSIONS.VIEW_CUSTOMERS },
      { path: '/statements', icon: FiCreditCard, label: 'Statements', permission: PERMISSIONS.VIEW_INVOICES },
      { path: '/collections', icon: FiMail, label: 'Collections', permission: PERMISSIONS.SEND_INVOICES },
      { path: '/appointments', icon: FiCalendar, label: 'Appointments' }
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/inventory', icon: FiPackage, label: 'Inventory', permission: PERMISSIONS.VIEW_INVENTORY },
      { path: '/suppliers', icon: FiTruck, label: 'Suppliers', permission: PERMISSIONS.EDIT_FINANCIAL_DATA },
      { path: '/purchase-orders', icon: FiPackage, label: 'Purchase Orders', permission: PERMISSIONS.EDIT_INVENTORY },
      { path: '/documents', icon: FiFolder, label: 'Documents' },
      { path: '/scanner', icon: FiCamera, label: 'Scanner', permission: PERMISSIONS.EDIT_FINANCIAL_DATA }
    ]
  },
  {
    title: 'Finance & accounting',
    items: [
      { path: '/bank-feeds', icon: FiDollarSign, label: 'Bank Feeds', permission: PERMISSIONS.VIEW_FINANCIAL_DATA },
      { path: '/general-ledger', icon: FiBookOpen, label: 'General Ledger', permission: PERMISSIONS.VIEW_FINANCIAL_DATA },
      { path: '/vat-returns', icon: FiPercent, label: 'VAT Returns', permission: PERMISSIONS.VIEW_FINANCIAL_DATA },
      { path: '/fx', icon: FiGlobe, label: 'FX', permission: PERMISSIONS.VIEW_FINANCIAL_DATA },
      { path: '/reports', icon: FiBarChart, label: 'Reports', permission: PERMISSIONS.VIEW_REPORTS }
    ]
  },
  {
    title: 'HR & people',
    items: [
      { path: '/payroll', icon: FiBriefcase, label: 'Payroll', permission: PERMISSIONS.EDIT_FINANCIAL_DATA }
    ]
  },
  {
    title: 'Compliance & settings',
    items: [
      { path: '/compliance', icon: FiShield, label: 'Compliance', permission: PERMISSIONS.VIEW_SETTINGS },
      { path: '/settings', icon: FiSettings, label: 'Settings', permission: PERMISSIONS.VIEW_SETTINGS }
    ]
  }
];

const bottomNavItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { path: '/invoices', icon: FiReceipt, label: 'Sales', permission: PERMISSIONS.VIEW_INVOICES },
  { path: '/reports', icon: FiBarChart, label: 'Finance', permission: PERMISSIONS.VIEW_REPORTS },
  { path: '/compliance', icon: FiShield, label: 'Compliance', permission: PERMISSIONS.VIEW_SETTINGS }
];

const renderNavLink = (item, location, closeMobileMenu) => (
  <NavItem key={item.path}>
    <NavLink
      to={item.path}
      className={location.pathname === item.path ? 'active' : ''}
      onClick={closeMobileMenu}
      aria-label={item.label}
      aria-current={location.pathname === item.path ? 'page' : undefined}
    >
      <NavIcon aria-hidden="true">
        <item.icon />
      </NavIcon>
      <NavText>{item.label}</NavText>
    </NavLink>
  </NavItem>
);

export default function Navigation({ isMobileMenuOpen, onCloseMobileMenu }) {
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);
  const { hasPermission } = useUser();
  const { business } = useFirebaseBusiness();
  const role = business?.role || 'owner';

  const can = (permission) => !permission || hasPermission(role, permission);

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => can(item.permission))
    }))
    .filter((section) => section.items.length > 0);

  const visibleBottom = bottomNavItems.filter((item) => can(item.permission));

  const closeMobileMenu = () => {
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await signOutUser();
      if (error) {
        console.error('Sign out error:', error);
        alert('Failed to sign out. Please try again.');
      } else {
        logAnalyticsEvent(AnalyticsEvents.LOGOUT);
        closeMobileMenu();
      }
    } catch (err) {
      console.error('Sign out error:', err);
      alert('Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <Overlay show={isMobileMenuOpen} onClick={closeMobileMenu} />
      <NavigationContainer className={isMobileMenuOpen ? 'mobile-open' : ''}>
        <NavContent>
          <Brand>
            <BrandName>KaziLedger</BrandName>
            <BrandTag>Run your business efficiently</BrandTag>
          </Brand>
          {visibleSections.map((section) => (
            <NavSection key={section.title}>
              <NavTitle>{section.title}</NavTitle>
              <NavList>
                {section.items.map((item) => renderNavLink(item, location, closeMobileMenu))}
              </NavList>
            </NavSection>
          ))}
        </NavContent>
        <SignOutSection>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Role: {role}
          </div>
          <SignOutButton
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
          >
            <SignOutIcon aria-hidden="true">
              <FiLogOut />
            </SignOutIcon>
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </SignOutButton>
        </SignOutSection>
      </NavigationContainer>

      <BottomNav>
        {visibleBottom.map((item) => (
          <BottomNavItem
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
            aria-label={item.label}
            aria-current={location.pathname === item.path ? 'page' : undefined}
          >
            <BottomNavIcon aria-hidden="true">
              <item.icon />
            </BottomNavIcon>
            <span>{item.label}</span>
          </BottomNavItem>
        ))}
      </BottomNav>
    </>
  );
}
