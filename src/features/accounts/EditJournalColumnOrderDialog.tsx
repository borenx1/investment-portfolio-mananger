import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles, Theme } from '@material-ui/core/styles'; 
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from "@material-ui/core/IconButton";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import AddEditDialog from '../../components/AddEditDialog';
import { editJournalColumnOrder, selectActiveAccountJournals } from './accountsSlice';
import { Journal, JournalColumnRole, journalColumnRoleDisplay } from '../../models/account';

interface Props {
  open: boolean;
  onDialogClose?: () => void;
  journal: number;
  displayRoleDefault?: boolean;
  editHide?: boolean;
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
  listItem: {
    paddingRight: props => props.editHide ? 100 : 50,
  },
}));

/**
 * Edit journal column order dialog React function component.
 * 
 * Props:
 * - open: Dialog shows if true.
 * - onDialogClose: Function called when the dialog requests to be closed.
 * - journal: The index of the journal of the column order to edit.
 * - displayRoleDefault: Use the column role as the identifier instead of the column name as the default. Default false.
 */
function EditJournalColumnOrderDialog(props: Readonly<Props>) {
  const classes = useStyles(props);
  const { journal: index, onDialogClose, open, displayRoleDefault } = props;
  const dispatch = useDispatch();
  const journals = useSelector(selectActiveAccountJournals);
  const journal = journals[index] as Journal | undefined;
  // The actual column order in the global state
  const columnOrder = journal?.columnOrder ?? [];
  // The edit column order in the dialog. Confirmed when the "edit" button is clicked.
  const [dialogColumnOrder, setDialogColumnOrder] = useState<JournalColumnRole[]>(columnOrder);
  const [hiddenColumns, setHiddenColumns] = useState<JournalColumnRole[]>([]);
  const [displayRole, setDisplayRole] = useState(displayRoleDefault ?? false);

  const handleReset = () => {
    setDialogColumnOrder(columnOrder);
    const newHiddenColumns: JournalColumnRole[] = [];
    columnOrder.forEach((role) => {
      if (typeof role === 'string' ? journal?.columns[role].hide : journal?.columns.extra[role].hide) {
        newHiddenColumns.push(role);
      }
    });
    setHiddenColumns(newHiddenColumns);
  };

  const handleReorderColumn = (index: number, newIndex: number) => {
    const newColumnOrder = [...dialogColumnOrder];
    newColumnOrder.splice(newIndex, 0, newColumnOrder.splice(index, 1)[0]);
    setDialogColumnOrder(newColumnOrder);
  };

  const handleToggleHide = (role: JournalColumnRole) => {
    const hiddenIndex = hiddenColumns.indexOf(role);
    const newHiddenColumns = [...hiddenColumns];
    if (hiddenIndex === -1) {
      newHiddenColumns.push(role);
    } else {
      newHiddenColumns.splice(hiddenIndex, 1);
    }
    setHiddenColumns(newHiddenColumns);
  }

  const handleSubmit = () => {
    dispatch(editJournalColumnOrder({index: index, columnOrder: dialogColumnOrder}));
    // TODO edit hidden status
    onDialogClose?.();
  };

  return (
    <AddEditDialog
      objectName={'Columns Layout'}
      edit
      open={open}
      onClose={onDialogClose}
      onEnter={handleReset}
      onReset={handleReset}
      onSubmit={handleSubmit}
    >
      <FormControlLabel
        control={<Switch />}
        checked={displayRole}
        onChange={(e, checked) => setDisplayRole(checked)}
        label={displayRole ? 'Role' : 'Name'}
        labelPlacement="end"
      />
      <List>
        {dialogColumnOrder.map((role, i) =>
          <ListItem dense disableGutters divider classes={{secondaryAction: classes.listItem}} key={role}>
            <ListItemIcon>
              <IconButton
                disableRipple
                disabled={i === 0}
                onClick={() => handleReorderColumn(i, i - 1)}
              >
                <ArrowUpwardIcon />
              </IconButton>
            </ListItemIcon>
            <ListItemText primary={displayRole ? journalColumnRoleDisplay(role) : (typeof role === 'string' ? journal!.columns[role].name : journal!.columns.extra[role].name)} />
            <ListItemSecondaryAction>
              {props.editHide && <Checkbox
                checked={hiddenColumns.indexOf(role) === -1}
                onChange={() => handleToggleHide(role)}
              />}
              <IconButton
                edge="end"
                disableRipple
                disabled={i === dialogColumnOrder.length - 1}
                onClick={() => handleReorderColumn(i, i + 1)}
              >
                <ArrowDownwardIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        )}
      </List>
    </AddEditDialog>
  );
}

export default EditJournalColumnOrderDialog;