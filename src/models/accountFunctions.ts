import { Journal, JournalColumn, ExtraColumn, JournalColumnRole, JournalColumnType } from "./account";

export function journalColumnRoleDisplay(role: JournalColumnRole | undefined | null) {
  switch (role) {
    case undefined:
    case null:
      return role;
    case 'date':
      return 'Date';
    case 'base':
      return 'Base';
    case 'baseAmount':
      return 'Base amount';
    case 'quote':
      return 'Quote';
    case 'quoteAmount':
      return 'Quote amount';
    case 'price':
      return 'Price';
    case 'feeBase':
      return 'Base fee';
    case 'feeQuote':
      return 'Quote fee';
    case 'notes':
      return 'Notes';
    default:    // Implicit typeof role = number
      return `Extra (${(role + 1).toFixed()})`;
  }
}

// This code is too janky, use overloads instead, see below
// export function getJournalColumn<T extends JournalColumnRole>(journal: Journal, role: T): T extends number ? ExtraColumn : JournalColumn {
//   if (typeof role === 'number') {
//     return journal.columns.extra[role as number] as T extends number ? ExtraColumn : JournalColumn;
//   } else {
//     return journal.columns[role as JournalCoreColumnRole] as T extends number ? ExtraColumn : JournalColumn;
//   }
// }

// TODO add tests
// TODO note that this can sometimes return undefined (index out of range)
export function getJournalColumn(journal: Journal, role: number): ExtraColumn;
export function getJournalColumn(journal: Journal, role: Exclude<JournalColumnRole, number>): JournalColumn;
export function getJournalColumn(journal: Journal, role: JournalColumnRole): JournalColumn;
export function getJournalColumn(journal: Journal, role: JournalColumnRole) {
  if (typeof role === 'number') {
    return journal.columns.extra[role];
  } else {
    return journal.columns[role];
  }
}

export function isRightAlignJournalColumnType(type: JournalColumnType): boolean {
  return ['date', 'integer', 'decimal'].indexOf(type) !== -1;
}