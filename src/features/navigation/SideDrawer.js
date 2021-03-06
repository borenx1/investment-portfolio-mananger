import { Link, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CreateIcon from '@material-ui/icons/Create';
import BookIcon from '@material-ui/icons/Book';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import { drawerWidth } from '../../constants';

const useStyles = makeStyles(theme => ({
  root: {
    
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // Have the same height as the top app bar
    ...theme.mixins.toolbar
  },
  drawer: {
    width: drawerWidth,
    whiteSpace: 'nowrap',   // Prevent text wrapping when closing the drawer
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    overflowX: "hidden",
    width: theme.spacing(7),
    // Have extra space for the scrollbar if needed
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  }
}));

/**
 * See
 * - https://material-ui.com/components/drawers/#mini-variant-drawer
 * - https://material-ui.com/api/drawer/
 * - https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/dashboard/Dashboard.js
 * - https://material-ui.com/getting-started/templates/dashboard/
 */
function SideDrawer(props) {
  const classes = useStyles();
  const location = useLocation();
  const path = location.pathname;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      classes={{
        paper: clsx({
          [classes.drawerOpen]: props.open,
          [classes.drawerClose]: !props.open
        })
      }}
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: props.open,
        [classes.drawerClose]: !props.open
      })}
    >
      <div className={classes.toolbar}>
        <IconButton onClick={props.onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      <List component="nav" aria-label="Journals">
        <ListItem
          button
          component={Link}
          to={'/journals'}
          selected={path === '/journals' || path === '/'}
        >
          <ListItemIcon>
            <CreateIcon />
          </ListItemIcon>
          <ListItemText primary="Journals" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to={'/capital-changes'}
          selected={path === '/capital-changes'}
        >
          <ListItemIcon>
            <CreateIcon />
          </ListItemIcon>
          <ListItemText primary="Capital changes" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to={'/asset-statements'}
          selected={path === '/asset-statements'}
        >
          <ListItemIcon>
            <BookIcon />
          </ListItemIcon>
          <ListItemText primary="Asset Statements" />
        </ListItem>
      </List>
      <Divider />
      <List component="nav" aria-label="Financials">
        <ListSubheader inset disableSticky={true}>Financials</ListSubheader>
        <ListItem button>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Monthly" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Quarterly" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Biyearly" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Yearly" />
        </ListItem>
      </List>
      <Divider />
      <List component="nav" aria-label="Account settings">
        <ListItem
          button
          component={Link}
          to={'/account-settings'}
          selected={path === '/account-settings'}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Account settings" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default SideDrawer;