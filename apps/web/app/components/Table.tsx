import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (data: T[keyof T]) => JSX.Element;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (rowData: T) => void;
}

const Table = <T,>({ columns, data, onRowClick }: TableProps<T>) => {
  return (
    <div className="overflow-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              className={onRowClick ? "cursor-pointer hover" : "hover"}
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.render
                    ? col.render(row[col.accessor])
                    : JSON.stringify(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
