import { Components, Theme } from '@mui/material/styles';

export const lightComponents: Components<Theme> = {
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        width: "100%",
        padding: 0,
        
        '& .MuiOutlinedInput-root': {
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.action.selected
        },
        '& .MuiInputBase-input': {
          padding: theme.spacing(1)
        },
      }),
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: ({ theme }) => ({
        width: '100%',
        display: 'flex',
        border: "1px solid",
        borderColor: 'rgba(255, 255, 255, 0.23)',
        '&:hover': {
          borderColor: 'white',
        },
        padding: theme.spacing(1),
        gap: theme.spacing(0.5)
      }),
      grouped: ({ theme }) => ({
        flex: 1,
        border: 0,
        borderColor: "divider",
        textTransform: 'none',
        textWrap: "nowrap",
        '&.Mui-selected': {
          paddingLeft: 10,
          paddingRight: 10,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
          },
        },
        '&.Mui-disabled': {
          border: 0,
        },
      }),
      middleButton: {
        padding: 10,
        borderLeft: '1px solid transparent',
      },
      lastButton: {
        borderLeft: '1px solid transparent',
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        textTransform: 'none',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        '&.Mui-selected': {
          fontWeight: 600,
        },
      }),
    },
  },
  MuiSelect: {
    defaultProps: {
      MenuProps: {
        PaperProps: {
          sx: {
            backgroundColor: 'background.paper',
            marginTop: 1,
          },
        },
        MenuListProps: {
          sx: {
            padding: '8px',
          },
        },
      },
    },
    styleOverrides: {
      select: ({ theme }) => ({
        padding: theme.spacing(1),
      }),
      root: ({ theme }) => ({
        margin: 0,
        p: 0,
        width: '100%',
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        },
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        minWidth: 200,
      }),
      list: {
        padding: '8px',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        margin: '2px 0',
        padding: '10px 12px',
        gap: 8,
        transition: 'all 0.2s ease',
        '& .MuiBox-root': {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        },
        '& .MuiSvgIcon-root': {
          fontSize: '1.25rem',
          transition: 'color 0.2s ease',
        },
        '& .MuiTypography-root': {
          transition: 'color 0.2s ease',
        },
        '&:hover': {
          transform: 'translateX(4px)',
          backgroundColor: 'transparent',
          '& .MuiTypography-root, & .MuiSvgIcon-root': {
            color: theme.palette.primary.main,
          },
        },
        '&.Mui-selected': {
          color: theme.palette.primary.main,
          borderRadius: theme.shape.borderRadius,
          border: "none",
          '& .MuiSvgIcon-root': {
            color: theme.palette.primary.main,
          },
          '&:hover': {
            transform: 'translateX(4px)',
          },
        },
        '&.Mui-focusVisible': {
          backgroundColor: theme.palette.action.hover,
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '-2px',
        },
        '&.Mui-disabled': {
          opacity: 1,
        },
      }),
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: ({ theme }) => ({
        minWidth: 36,
        color: 'inherit',
        '& .MuiSvgIcon-root': {
          fontSize: '1.5rem',
        },
      }),
    },
  },
  MuiListItemText: {
    styleOverrides: {
      root: {
        margin: 0,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.03)',
        },
      },
      contained: ({ theme }) => ({
        boxShadow: 'none',
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 'auto',
        alignItems: 'center',
        display: 'flex',
      },
      indicator: {
        display: 'none',
      },
      flexContainer: ({ theme }) => ({
        gap: theme.spacing(0.5),
      }),
    },
  },
  MuiTab: {
    defaultProps:{
      disableRipple: true,
    },
    styleOverrides: {
      root: ({ theme, ownerState }) => ({
        '&:hover': {
          color: theme.palette.primary.main,
          borderBottom: "2px solid",
          BorderColor: theme.palette.primary.main
        },
        '&.Mui-selected': {
          borderColor: theme.palette.primary.main,
          fontWeight: 600,
          borderBottom: "2px solid",
        },
        ...(ownerState.variant === 'contained' && {
          minHeight: 0,
          minWidth: 0,
          paddingTop: theme.spacing(0.5),
          paddingBottom: theme.spacing(0.5),
          paddingRight: theme.spacing(0.8),
          paddingLeft: theme.spacing(0.8),
          transition: 'all 0.2s ease-in-out',
          borderRadius: theme.shape.borderRadius,
          margin: 0,
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }),
      }),
    },
  },
};