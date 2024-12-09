export const commonTextFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.2s ease-in-out',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: 'rgba(241, 245, 249, 0.9)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
  },
  // ... rest of the styles
};

export const buttonStyles = {
  removeButton: {
    width: '28px',
    height: '28px',
    minWidth: '28px',
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#ef4444',
      color: 'white',
      transform: 'scale(1.05)',
    },
    // ... rest of the styles
  },
  submitButton: {
    textTransform: 'none',
    backgroundColor: '#000000',
    '&:hover': {
      backgroundColor: '#424242',
    },
  }
}; 