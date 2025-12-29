import type { ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

type StringKeys<T> = Extract<keyof T, string>

export interface CustomDynamicTableProps<T> {
  tableData: T[]
  tableColumns: StringKeys<T>[]
  excludeColumns?: StringKeys<T>[]
  className?: string
  rowClassName?: string
  customHeadRender?: (columnKey: StringKeys<T>) => ReactNode | null
  customBodyRender?: (
    rowData: T,
    columnKey: StringKeys<T>
  ) => ReactNode | null
  onRowClick?: (rowData: T) => void
}

export const CustomDynamicTable = <T extends Record<string, any>>({
  tableData,
  tableColumns,
  excludeColumns = [],
  className,
  rowClassName,
  customHeadRender,
  customBodyRender,
  onRowClick,
}: CustomDynamicTableProps<T>) => {
  const visibleColumns = tableColumns.filter(
    (col) => !excludeColumns.includes(col)
  )

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead key={column}>
                {customHeadRender
                  ? customHeadRender(column) ?? formatHeader(column)
                  : formatHeader(column)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length}
                className="text-center py-6"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            tableData.map((row, index) => (
              <TableRow
                key={index}
                className={rowClassName}
                onClick={() => onRowClick?.(row)}
              >
                {visibleColumns.map((column) => (
                  <TableCell key={column}>
                    {customBodyRender
                      ? customBodyRender(row, column) ?? String(row[column])
                      : String(row[column] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function formatHeader(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
}
