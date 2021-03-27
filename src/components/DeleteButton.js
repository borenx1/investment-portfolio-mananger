import { makeStyles } from '@material-ui/core/styles';
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles(theme => ({
  root: {
    color: theme.palette.error.main,
  },
}));

function DeleteButton(props) {
  const classes = useStyles();
  return (
    <IconButton
      onClick={props.onClick}
      disabled={props.disabled}
      size={props.buttonSize}
      className={classes.root}
      aria-label="Delete"
    >
      <DeleteIcon fontSize={props.iconSize} />
    </IconButton>
  );
}

export default DeleteButton;