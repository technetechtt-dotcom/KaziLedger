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
  FiLogOut
} from 'react-icons/fi';
import { signOutUser } from '../firebase/auth';
import { logAnalyticsEvent, AnalyticsEvents } from '../utils/analytics';

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
    position: relative;
    height: 100vh;
  }
  
  &.mobile-open {
    transform: translateX(0);
  }
`;


const NavContent = styled.div`
  padding: 2rem 0;
  flex: 1;
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const NavTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin: 0 0 1rem 1.5rem;
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
  padding: 0.75rem 1.5rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border-left-color: #60a5fa;
  }
`;

const NavIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
`;

const NavText = styled.span`
  font-weight: 500;
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
  padding: 0.75rem 0.5rem;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s ease;
  font-size: 0.75rem;
  
  &:hover {
    color: #3b82f6;
  }
  
  &.active {
    color: #3b82f6;
  }
`;

const BottomNavIcon = styled.span`
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
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
    display: ${props => props.show ? 'block' : 'none'};
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

const navigationItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/quotes', icon: FiFileText, label: 'Quotes' },
  { path: '/invoices', icon: FiReceipt, label: 'Invoices' },
  { path: '/statements', icon: FiCreditCard, label: 'Statements' },
  { path: '/scanner', icon: FiCamera, label: 'Scanner' },
  { path: '/reports', icon: FiBarChart, label: 'Reports' },
  { path: '/inventory', icon: FiPackage, label: 'Inventory' },
  { path: '/customers', icon: FiUsers, label: 'Customers' },
  { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
  { path: '/compliance', icon: FiShield, label: 'Compliance' },
  { path: '/settings', icon: FiSettings, label: 'Settings' }
];

const bottomNavItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/quotes', icon: FiFileText, label: 'Quotes' },
  { path: '/invoices', icon: FiReceipt, label: 'Invoices' },
  { path: '/reports', icon: FiBarChart, label: 'Reports' }
];

export default function Navigation({ isMobileMenuOpen, onCloseMobileMenu }) {
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const closeMobileMenu = () => {
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
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
          <NavSection>
            <NavTitle>Main</NavTitle>
            <NavList>
              {navigationItems.map((item) => (
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
              ))}
            </NavList>
          </NavSection>
        </NavContent>
        <SignOutSection>
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
        {bottomNavItems.map((item) => (
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
