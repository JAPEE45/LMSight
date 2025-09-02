document.addEventListener("DOMContentLoaded", () => {
  const closeAllDropdowns = () => {
    document.querySelectorAll(".actions-dropdown.show").forEach((dropdown) => {
      dropdown.classList.remove("show", "drop-up");
    });
  };


  function createCode(number) {
    const numberStr = number.toString();
    const n = numberStr.length;

    if (n > 9) {
        throw new Error("Number must be at most 9 digits");
    }

    const pad = 10 - n;
    let filler = "";
    for (let i = 0; i < pad; i++) {
        filler += Math.floor(Math.random() * 10); // random digit
    }

    const code = n.toString() + numberStr + filler;
    return code;
}
  const updateSelectAllCheckbox = () => {
    const checkboxes = document.querySelectorAll("tbody .row-checkbox");
    const checkedBoxes = document.querySelectorAll(
      "tbody .row-checkbox:checked"
    );
    const selectAll = document.getElementById("selectAll");

    selectAll.checked =
      checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
    selectAll.indeterminate =
      checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
  };

  const updateDeleteSelectedVisibility = () => {
    const checkedBoxes = document.querySelectorAll(
      "tbody .row-checkbox:checked"
    );
    const deleteSelected = document.getElementById("deleteSelected");
    deleteSelected.classList.toggle("show", checkedBoxes.length > 0);
  };

  window.toggleActionDropdown = (button) => {
    const dropdown = button.nextElementSibling;

    closeAllDropdowns();

    if (dropdown.classList.contains("show")) {
      dropdown.classList.remove("show", "drop-up");
      return;
    }

    dropdown.style.display = "block";
    const rect = dropdown.getBoundingClientRect();
    dropdown.style.display = "";

    const spaceBelow =
      window.innerHeight - button.getBoundingClientRect().bottom;
    if (spaceBelow < rect.height) {
      dropdown.classList.add("drop-up");
    }

    dropdown.classList.add("show");
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".action-cell")) {
      closeAllDropdowns();
    }
  });

  window.editUser = (element) => {
    const row = element.closest("tr");
    const userName = row.querySelector(".user-name").textContent;
    const id = row.querySelector("#id").textContent;
    const hash = createCode(id);

    window.location.href = '/admin/edit_user?type=edit&hash=' + hash;
    closeAllDropdowns();
  };

  window.deleteUser = (element) => {
    const row = element.closest("tr");
    const userName = row.querySelector(".user-name").textContent;
    const id = row.querySelector("#id").textContent;
    if (confirm(`Are you sure you want to delete user: ${userName}?`)) {
      row.remove();
      updateSelectAllCheckbox();
      updateDeleteSelectedVisibility();
    }
    closeAllDropdowns();
  };

  const selectAll = document.getElementById("selectAll");

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      document.querySelectorAll("tbody .row-checkbox").forEach((checkbox) => {
        checkbox.checked = selectAll.checked;
      });
      updateDeleteSelectedVisibility();
      updateSelectAllCheckbox();
    });
  }

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("row-checkbox")) {
      updateDeleteSelectedVisibility();
      updateSelectAllCheckbox();
    }
  });

  const deleteSelectedBtn = document.getElementById("deleteSelected");
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", () => {
      const checkedBoxes = document.querySelectorAll(
        "tbody .row-checkbox:checked"
      );
      if (checkedBoxes.length === 0) return;

      if (
        confirm(
          `Are you sure you want to delete ${checkedBoxes.length} selected user(s)?`
        )
      ) {
        checkedBoxes.forEach((cb) => cb.closest("tr").remove());
        updateDeleteSelectedVisibility();
        updateSelectAllCheckbox();
      }
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();
      document.querySelectorAll("tbody tr").forEach((row) => {
        const name =
          row.querySelector(".user-name")?.textContent.toLowerCase() || "";
        const dept = row.cells[2]?.textContent.toLowerCase() || "";
        const title = row.cells[3]?.textContent.toLowerCase() || "";

        const match = [name, dept, title].some((text) => text.includes(term));
        row.style.display = match ? "" : "none";
      });
    });
  }

  document.querySelectorAll(".filter-btn, .dropdown-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Filter/dropdown clicked:", btn.textContent.trim());
    });
  });
});
