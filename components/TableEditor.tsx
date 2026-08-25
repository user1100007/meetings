"use client";

import React from "react";
import { MeetingTable } from "@/types/meeting";
import { Plus, Trash2, Table as TableIcon, PlusCircle } from "lucide-react";

interface TableEditorProps {
  tables: MeetingTable[];
  onChange: (tables: MeetingTable[]) => void;
}

export const TableEditor: React.FC<TableEditorProps> = ({ tables, onChange }) => {
  const handleAddTable = () => {
    const newTable: MeetingTable = {
      id: `tbl_${Date.now()}`,
      title: `តារាងទី ${tables.length + 1}៖ `,
      headers: ["ល.រ", "ពិពណ៌នា", "ចំនួន/បរិមាណ", "អ្នកទទួលខុសត្រូវ", "ផ្សេងៗ"],
      rows: [
        { id: "row_1", cells: ["១", "", "", "", ""] },
        { id: "row_2", cells: ["២", "", "", "", ""] },
      ],
    };
    onChange([...tables, newTable]);
  };

  const handleRemoveTable = (tblIndex: number) => {
    const updated = tables.filter((_, i) => i !== tblIndex);
    onChange(updated);
  };

  const handleTitleChange = (tblIndex: number, title: string) => {
    const updated = [...tables];
    updated[tblIndex] = { ...updated[tblIndex], title };
    onChange(updated);
  };

  const handleHeaderChange = (tblIndex: number, colIndex: number, value: string) => {
    const updated = [...tables];
    const newHeaders = [...updated[tblIndex].headers];
    newHeaders[colIndex] = value;
    updated[tblIndex] = { ...updated[tblIndex], headers: newHeaders };
    onChange(updated);
  };

  const handleAddColumn = (tblIndex: number) => {
    const updated = [...tables];
    const target = updated[tblIndex];
    const colName = `ជួរឈរ ${target.headers.length + 1}`;
    const newHeaders = [...target.headers, colName];
    const newRows = (target.rows || []).map((row, rIdx) => {
      const cells = Array.isArray(row) ? row : (row?.cells || []);
      return {
        id: (row as any)?.id || `row_${rIdx + 1}`,
        cells: [...cells, ""],
      };
    });
    updated[tblIndex] = { ...target, headers: newHeaders, rows: newRows };
    onChange(updated);
  };

  const handleRemoveColumn = (tblIndex: number, colIndex: number) => {
    const updated = [...tables];
    const target = updated[tblIndex];
    if (target.headers.length <= 1) return;
    const newHeaders = target.headers.filter((_, i) => i !== colIndex);
    const newRows = (target.rows || []).map((row, rIdx) => {
      const cells = Array.isArray(row) ? row : (row?.cells || []);
      return {
        id: (row as any)?.id || `row_${rIdx + 1}`,
        cells: cells.filter((_, i) => i !== colIndex),
      };
    });
    updated[tblIndex] = { ...target, headers: newHeaders, rows: newRows };
    onChange(updated);
  };

  const handleCellChange = (tblIndex: number, rowIndex: number, colIndex: number, value: string) => {
    const updated = [...tables];
    const target = updated[tblIndex];
    const newRows = (target.rows || []).map((row, rIdx) => {
      const cells = Array.isArray(row) ? [...row] : [...(row?.cells || [])];
      if (rIdx === rowIndex) {
        cells[colIndex] = value;
      }
      return {
        id: (row as any)?.id || `row_${rIdx + 1}`,
        cells,
      };
    });
    updated[tblIndex] = { ...target, rows: newRows };
    onChange(updated);
  };

  const handleAddRow = (tblIndex: number) => {
    const updated = [...tables];
    const target = updated[tblIndex];
    const newCells = target.headers.map((_, i) => (i === 0 ? `${target.rows.length + 1}` : ""));
    const newRows = [
      ...(target.rows || []).map((row, rIdx) => {
        const cells = Array.isArray(row) ? row : (row?.cells || []);
        return {
          id: (row as any)?.id || `row_${rIdx + 1}`,
          cells,
        };
      }),
      { id: `row_${target.rows.length + 1}`, cells: newCells },
    ];
    updated[tblIndex] = { ...target, rows: newRows };
    onChange(updated);
  };

  const handleRemoveRow = (tblIndex: number, rowIndex: number) => {
    const updated = [...tables];
    const target = updated[tblIndex];
    if (target.rows.length <= 1) return;
    const newRows = (target.rows || [])
      .filter((_, i) => i !== rowIndex)
      .map((row, rIdx) => {
        const cells = Array.isArray(row) ? row : (row?.cells || []);
        return {
          id: (row as any)?.id || `row_${rIdx + 1}`,
          cells,
        };
      });
    updated[tblIndex] = { ...target, rows: newRows };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-indigo-600" />
            តារាងទិន្នន័យ & ស្ថិតិក្នុងកំណត់ហេតុ
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            អ្នកអាចបង្កើតតារាងបែងចែកភារកិច្ច ស្ថិតិសិស្ស កាលវិភាគ ឬតារាងលទ្ធផលផ្សេងៗ
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddTable}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          បង្កើតតារាងថ្មី
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <TableIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">មិនទាន់មានតារាងទិន្នន័យនៅឡើយទេ</p>
          <p className="text-xs text-slate-400 mt-1">ចុចលើប៊ូតុង &ldquo;បង្កើតតារាងថ្មី&rdquo; ខាងលើដើម្បីបញ្ចូលតារាងក្នុងឯកសារ</p>
        </div>
      ) : (
        tables.map((table, tIdx) => (
          <div
            key={table.id || tIdx}
            className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4"
          >
            {/* Table Header & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-medium text-slate-600 mb-1">ចំណងជើងតារាង</label>
                <input
                  type="text"
                  value={table.title}
                  onChange={(e) => handleTitleChange(tIdx, e.target.value)}
                  placeholder="ឧ. តារាងបែងចែកភារកិច្ច..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddColumn(tIdx)}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                  ថែមជួរឈរ (Col)
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveTable(tIdx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                  title="លុបតារាងនេះ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editable Spreadsheet Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-indigo-50/70 border-b border-slate-300 text-indigo-950 font-bold">
                    {table.headers.map((head, cIdx) => (
                      <th key={cIdx} className="p-2 border-r border-slate-300 min-w-[110px] relative group">
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="text"
                            value={head}
                            onChange={(e) => handleHeaderChange(tIdx, cIdx, e.target.value)}
                            className="w-full bg-transparent font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-400 rounded px-1"
                          />
                          {table.headers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColumn(tIdx, cIdx)}
                              className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="លុបជួរឈរនេះ"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="p-2 w-10 text-center">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {(table.rows || []).map((row, rIdx) => {
                    const cells = Array.isArray(row) ? row : (row?.cells || []);
                    return (
                      <tr
                        key={(row as any)?.id || rIdx}
                        className={`border-b border-slate-200 ${
                          rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => handleCellChange(tIdx, rIdx, cIdx, e.target.value)}
                              className="w-full px-2 py-1 bg-transparent hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded text-slate-800 transition-colors"
                            />
                          </td>
                        ))}
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(tIdx, rIdx)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title="លុបជួរដេកនេះ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleAddRow(tIdx)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                បន្ថែមជួរដេក (Row) ថ្មី
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
