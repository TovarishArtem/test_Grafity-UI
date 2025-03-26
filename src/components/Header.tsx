import React from 'react';
import { Button } from '@gravity-ui/uikit';

interface HeaderProps {
  role: boolean;
  onRoleChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ role, onRoleChange }) => {
  return (
    <div className="header">
      <Button
        className="button_admin"
        view="action"
        size="xl"
        width="auto"
        form="circle"
        onClick={() => onRoleChange(!role)}
      >
        {role ? 'Admin' : 'User'}
      </Button>
    </div>
  );
};

export default Header;
