import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.nav`
  width: 250px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`;

const Logo = styled.div`
  padding: 0 20px 30px;
  border-bottom: 1px solid #34495e;
  margin-bottom: 20px;
`;

const LogoTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #ecf0f1;
`;

const LogoSubtitle = styled.p`
  margin: 5px 0 0;
  font-size: 12px;
  color: #95a5a6;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const MenuItem = styled.li`
  margin: 0;
`;

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  
  &:hover {
    background: #34495e;
    color: #fff;
  }
  
  ${props => props.$active && `
    background: #3498db;
    border-left-color: #2980b9;
    color: #fff;
  `}
`;

const MenuIcon = styled.span`
  margin-right: 12px;
  font-size: 18px;
  width: 20px;
  text-align: center;
`;

const MenuText = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const Footer = styled.div`
  padding: 20px;
  border-top: 1px solid #34495e;
  font-size: 12px;
  color: #95a5a6;
  text-align: center;
`;

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/tests', icon: '🧪', label: 'Test Runner' },
    { path: '/history', icon: '📈', label: 'Test History' },
    { path: '/system', icon: '⚙️', label: 'System Info' }
  ];

  return (
    <SidebarContainer>
      <Logo>
        <LogoTitle>K6 Dashboard</LogoTitle>
        <LogoSubtitle>Load Testing Suite</LogoSubtitle>
      </Logo>
      
      <MenuList>
        {menuItems.map((item) => (
          <MenuItem key={item.path}>
            <MenuLink 
              to={item.path}
              $active={location.pathname === item.path}
            >
              <MenuIcon>{item.icon}</MenuIcon>
              <MenuText>{item.label}</MenuText>
            </MenuLink>
          </MenuItem>
        ))}
      </MenuList>
      
      <Footer>
        Traefik Multi-Project Setup<br />
        K6 Load Testing v1.0
      </Footer>
    </SidebarContainer>
  );
}

export default Sidebar;