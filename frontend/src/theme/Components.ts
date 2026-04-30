import { Components, Theme } from '@mui/material/styles';

export const components: Components<Theme> = {
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        width: "100%",
        borderRadius: 10,
        padding: 0,
        '& .MuiOutlinedInput-root': {          
          borderRadius: 8,
          margin: 0,
          padding: 0
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
        borderRadius: 8,
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
        borderRadius: theme.shape.borderRadius,
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
    styleOverrides: {
      select: ({ theme }) => ({
        padding: theme.spacing(1),
      }),
      root: ({ theme }) => ({
        margin: 0,
        p: 0,
        borderRadius: 8,
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
        backgroundColor: '#141614ff',
        marginTop: 8,
        borderRadius: 8,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(145, 221, 53, 0.2)',
      }),
      list: {
        padding: '8px',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 6,
        margin: '2px 0',
        padding: '10px 12px',
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
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          transform: 'translateX(4px)',
          '& .MuiSvgIcon-root': {
            color: theme.palette.primary.main,
          },
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,
          color: theme.palette.primary.main,
          fontWeight: 600,
          '& .MuiSvgIcon-root': {
            color: theme.palette.primary.main,
          },
          '&:hover': {
            backgroundColor: 'rgba(145, 221, 53, 0.24)',
          },
        },
        '&.Mui-focusVisible': {
          backgroundColor: theme.palette.action.hover,
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '-2px',
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
        borderRadius: 25,
        transition: 'all 0.3s ease',
      },
      contained: ({ theme }) => ({
        boxShadow: 'none',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: '0 0 20px rgba(145, 221, 53, 0.1)',
          backgroundColor: theme.palette.primary.main
        },
      }),
      outlined: {
        borderWidth: 2,
        '&:hover': {
          transform: 'scale(1.03)',
          borderWidth: 2,
          boxShadow: '0 0 10px rgba(145, 221, 53, 0.4)',
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 'auto',
        alignItems: 'center',
        display: 'flex',
        '& .MuiTabs-flexContainer': { gap: '4px' },
      },
      indicator: {
        display: 'none',
      },
    },
  },
  MuiTab: {
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
          borderRadius: theme.shape.borderRadius,
          transition: 'all 0.2s ease-in-out',
          margin: 0,
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
        }),
      }),
    },
  },
};