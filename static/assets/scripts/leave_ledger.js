document.addEventListener("DOMContentLoaded", () => {
  const currentYear = new Date().getFullYear();
  document.getElementById("currentYear").textContent = currentYear;

  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  const today = new Date();

  let nextMonthIndex = today.getMonth() + 1;

  if (nextMonthIndex > 11) {
    nextMonthIndex = 0;
  }

  const nextMonth = new Date(
    today.getFullYear(),
    nextMonthIndex,
    1
  ).toLocaleString("default", { month: "long" });
  document.getElementById("nextAccrual").textContent = nextMonth;
  document.querySelectorAll(".currentMonth").forEach((el) => {
    el.textContent = currentMonth;
    console.log(el);
  });

  console.log(currentMonth);
});

async function exportLedgerToExcel(userIdArg) {
  try {
    const userId = userIdArg || localStorage.getItem("selected");
    if (!userId) {
      alert("User ID not found.");
      return;
    }

    const response = await fetch(`/api/hr/leave_ledger/${userId}`, { method: "GET" });
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    console.log(data);

    // 1. Define Headers (Rows 1-3)
    const headerRows = [
      // Row 1: Info
      [
        `NAME: ${data.employee.full_name}`, "", "", "", "", "", 
        `DIVISION OFFICE: ${data.employee.department}`, "", "", "", 
        `FIRST DAY OF SERVICE: ${data.employee.created_at ? data.employee.created_at.split(' ')[0] : ''}`, "", "", "", "", 
        "Balance", "" 
      ],
      // Row 2: Group Headers
      [
        "PERIOD", 
        "PARTICULARS", "", "", "", 
        "VACATION LEAVE", "", "", "", 
        "SICK LEAVE", "", "", "", 
        "Date & Action Take on Application for Leave", "", 
        "VL", "SL"
      ],
      // Row 3: Sub Headers
      [
        "", 
        "Type of Leave", "Day", "Hrs", "Min",
        "EARNED", "ABSENT UND. WITH PAY", "BALANCE", "ABSENT UND. WITH W/O PAY",
        "EARNED", "ABSENT UND. WITH PAY", "BALANCE", "ABSENT UND. WITH W/O PAY",
        "", "",
        "", ""
      ]
    ];

    // 2. Map Data Rows
    const dataRows = data.ledger.map(row => [
      row.period,
      row.particulars.type,
      row.particulars.days,
      row.particulars.hrs,
      row.particulars.mins,
      row.vacation_leave.earned,
      row.vacation_leave.absent_with_pay,
      row.vacation_leave.balance,
      row.vacation_leave.absent_without_pay,
      row.sick_leave.earned,
      row.sick_leave.absent_with_pay,
      row.sick_leave.balance,
      row.sick_leave.absent_without_pay,
      row.remarks,
      "", // Extra col for merge if needed
      row.vacation_leave.balance, // VL Balance at end
      row.sick_leave.balance      // SL Balance at end
    ]);

    // Combine
    const finalData = [...headerRows, ...dataRows];

    // 3. Create Sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(finalData);

    // 4. Merges
    ws['!merges'] = [
        // Row 1
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },   // NAME
        { s: { r: 0, c: 6 }, e: { r: 0, c: 9 } },   // DIV
        { s: { r: 0, c: 10 }, e: { r: 0, c: 14 } }, // FIRST DAY
        { s: { r: 0, c: 15 }, e: { r: 0, c: 16 } }, // Balance Header

        // Row 2-3 Headers
        { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },   // PERIOD
        { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },   // PARTICULARS
        { s: { r: 1, c: 5 }, e: { r: 1, c: 8 } },   // VL
        { s: { r: 1, c: 9 }, e: { r: 1, c: 12 } },  // SL
        { s: { r: 1, c: 13 }, e: { r: 2, c: 14 } }, // Date & Action
    ];

    // 5. Column Widths
    ws['!cols'] = [
        { wch: 15 }, { wch: 20 }, { wch: 5 }, { wch: 5 }, { wch: 5 },
        { wch: 10 }, { wch: 22 }, { wch: 10 }, { wch: 25 },
        { wch: 10 }, { wch: 22 }, { wch: 10 }, { wch: 25 },
        { wch: 30 }, { wch: 5 }, { wch: 8 }, { wch: 8 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Leave Ledger");
    XLSX.writeFile(wb, `leave_ledger_${data.employee.full_name.replace(/\s+/g, "_")}.xlsx`);

  } catch (err) {
    console.error("Error exporting ledger:", err);
    alert("Failed to export ledger.");
  }
}
