import { Typography } from '@mui/material'
import styles from './index.module.css'

const Header = () => {
  return (
    <header className={styles.header}>
      <Typography variant="h6" component="h1">Fifty Fifty</Typography>
    </header>
  )
}

export default Header
