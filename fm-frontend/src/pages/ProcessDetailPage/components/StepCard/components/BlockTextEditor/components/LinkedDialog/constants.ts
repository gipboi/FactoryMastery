export const colourStyles = {
  control: (styles: object) => ({ ...styles, backgroundColor: 'white' }),
  multiValue: (styles: object) => {
    return {
      ...styles,
      backgroundColor: '#ECECFF',
      border: '1px solid #D9D9FF',
      boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
      borderRadius: '6px'
    }
  },
  multiValueLabel: (styles: object) => ({
    ...styles,
    color: '#727CF5'
  }),
  multiValueRemove: (styles: object) => ({
    ...styles,
    color: '#727CF5',
    ':hover': {
      backgroundColor: '#727CF5',
      paddingLeft: '0px',
      paddingRight: '0px',
      margin: '4px',
      borderRadius: '50%',
      color: 'white'
    }
  }),
  placeholder: (styles: object) => ({
    ...styles,
    marginLeft: '22px'
  })
}

export const textColorBlack = '#313A46'
export const primary100 = '#DBF8FF'
export const primaryAlpha = 'rgba(0, 159, 221)'
