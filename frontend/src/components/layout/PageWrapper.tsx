import { FC, ReactNode } from 'react';
import Box from '@mui/material/Box';

const BOTTOM_NAV_HEIGHT = 56;

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper: FC<PageWrapperProps> = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      pb: `${BOTTOM_NAV_HEIGHT + 16}px`,
      px: 2,
      pt: 2,
    }}
  >
    {children}
  </Box>
);

export default PageWrapper;
