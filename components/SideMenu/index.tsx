import { MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ListIcon from '@mui/icons-material/List';
import styles from './index.module.css'

const moveCsv = () => {
  window.location.href = "/";
}

const moveList = () => {
  window.location.href = "/list";
}

const SideMenu = () => {
  return (
    <MenuList className={styles.menu}>
      <MenuItem onClick={moveCsv}>
        <ListItemIcon>
          <UploadFileIcon fontSize="small" sx={{ color: "#eaecfa" }}/>
        </ListItemIcon>
        <ListItemText>CSVアップロード</ListItemText>
      </MenuItem>
      <MenuItem onClick={moveList}>
        <ListItemIcon>
          <ListIcon fontSize="small" sx={{ color: "#eaecfa" }}/>
        </ListItemIcon>
        <ListItemText>月別一覧</ListItemText>
      </MenuItem>
    </MenuList>
  )
}

export default SideMenu
