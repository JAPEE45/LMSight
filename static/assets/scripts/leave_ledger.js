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

async function exportLedgerToExcel() {
  try {
    // Get user_id from localStorage
    const userId = localStorage.getItem("selected");
    if (!userId) {
      alert("User ID not found in localStorage.");
      return;
    }

    // Fetch from Django endpoint
    const response = await fetch(`/api/hr/leave_ledger/${userId}`, {
      method: "GET",
    });
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    console.log(data);

    // Transform ledger data into a flat table
    const rows = data.ledger.map((row) => ({
      Period: row.period,
      "Leave Type": row.particulars.type,
      Days: row.particulars.days,
      Hours: row.particulars.hrs,
      Minutes: row.particulars.mins,

      "VL Earned": row.vacation_leave.earned,
      "VL Absent With Pay": row.vacation_leave.absent_with_pay,
      "VL Balance": row.vacation_leave.balance,
      "VL Absent Without Pay": row.vacation_leave.absent_without_pay,

      "SL Earned": row.sick_leave.earned,
      "SL Absent With Pay": row.sick_leave.absent_with_pay,
      "SL Balance": row.sick_leave.balance,
      "SL Absent Without Pay": row.sick_leave.absent_without_pay,

      Remarks: row.remarks,
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet from ledger rows
    const worksheet = XLSX.utils.json_to_sheet(rows, { origin: 4 }); // leave 4 rows for employee info

    // Add employee info at the top
    const employeeInfo = [
      ["Employee Name:", data.employee.full_name],
      ["Department:", data.employee.department],
      ["First day of service:", data.employee.created_at],
      [], // empty row before ledger table
    ];
    XLSX.utils.sheet_add_aoa(worksheet, employeeInfo, { origin: "A1" });

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Ledger");

    // Export to Excel file
    XLSX.writeFile(
      workbook,
      `leave_ledger_${data.employee.full_name.replace(/\s+/g, "_")}.xlsx`
    );
  } catch (err) {
    console.error("Error exporting ledger:", err);
    alert("Failed to export ledger. Check console for details.");
  }
}
