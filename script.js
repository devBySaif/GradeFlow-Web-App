/* =========================================================
   AIUB GRADING SYSTEM V3
========================================================= */
const universityGradePoints = {
    AIUB: {
        "A+": 4.00,
        "A": 3.75,
        "B+": 3.50,
        "B": 3.25,
        "C+": 3.00,
        "C": 2.75,
        "D+": 2.50,
        "D": 2.25,
        "F": 0.00
    },
    IUB: {
        "A": 4.00,
        "A-": 3.70,
        "B+": 3.30,
        "B": 3.00,
        "B-": 2.70,
        "C+": 2.30,
        "C": 2.00,
        "C-": 1.70,
        "D+": 1.30,
        "D": 1.00,
        "F": 0.00
    },
    NSU: {
        "A": 4.00,
        "A-": 3.70,
        "B+": 3.30,
        "B": 3.00,
        "B-": 2.70,
        "C+": 2.30,
        "C": 2.00,
        "C-": 1.70,
        "D+": 1.30,
        "D": 1.00,
        "F": 0.00
    }
};

let selectedUniversity = 'AIUB';
let courseCount = 0;

function sanitizeWholeNumber(value) {
    return String(value).replace(/[^\d].*$/, "");
}

function gradeOptions() {
    const grades = Object.keys(universityGradePoints[selectedUniversity]);
    return `
        <option value="">Select Grade</option>
        ${grades.map(grade => `<option value="${grade}">${grade}</option>`).join('')}
    `;
}

function selectUniversity(name) {
    selectedUniversity = name;
    document.querySelectorAll('.uni-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `${name}-btn`);
    });
    document.getElementById('status').textContent = `Selected ${name}: CGPA will be calculated using ${name} grade points.`;
    document.querySelectorAll('.course-grade').forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = gradeOptions();
        if (universityGradePoints[selectedUniversity][selectedValue] !== undefined) {
            select.value = selectedValue;
        }
        updateGradePoint(select);
    });
}

function addCourse(name = "", credit = "", grade = "") {
    courseCount++;

    const row = document.createElement("div");
    row.className = "course-row";
    row.dataset.id = courseCount;

    row.innerHTML = `
        <div class="field-group">
            <input
                type="text"
                class="course-name"
                placeholder="e.g. Data Structures"
                value="${name}"
            >
            <div class="error-message"></div>
        </div>

        <div class="field-group">
            <input
                type="number"
                class="course-credit"
                min="0"
                step="1"
                inputmode="numeric"
                placeholder="3"
                value="${credit}"
            >
            <div class="error-message"></div>
        </div>

        <div class="field-group">
            <select
                class="course-grade"
                onchange="updateGradePoint(this)"
            >
                ${gradeOptions()}
            </select>
            <div class="error-message"></div>
        </div>

        <div class="grade-point">
            0.00
        </div>

        <button
            class="delete-btn"
            onclick="removeCourse(this)"
        >
            ×
        </button>
    `;

    const select = row.querySelector(".course-grade");
    select.value = grade;
    updateGradePoint(select);

    const nameInput = row.querySelector(".course-name");
    const creditInput = row.querySelector(".course-credit");

    nameInput.addEventListener("input", () => validateCourseField(nameInput));
    creditInput.addEventListener("input", () => {
        creditInput.value = sanitizeWholeNumber(creditInput.value);
        validateCourseField(creditInput);
    });
    select.addEventListener("change", () => validateCourseField(select));

    document.getElementById("courseList").appendChild(row);
}

function removeCourse(button) {
    const row = button.closest(".course-row");
    row.remove();
}

function updateGradePoint(select) {
    const row = select.closest(".course-row");
    const point = universityGradePoints[selectedUniversity][select.value] ?? 0;
    row.querySelector(".grade-point").textContent = point.toFixed(2);
}

function setFieldError(field, message) {
    const group = field.closest(".field-group");
    if (!group) return;
    const error = group.querySelector(".error-message");
    field.classList.add("error");
    error.textContent = message;
}

function clearFieldError(field) {
    const group = field.closest(".field-group");
    if (!group) return;
    const error = group.querySelector(".error-message");
    field.classList.remove("error");
    error.textContent = "";
}

function validateCourseField(field) {
    clearFieldError(field);

    if (field.classList.contains("course-name")) {
        if (!field.value.trim()) {
            setFieldError(field, "Course name is required.");
            return false;
        }
        return true;
    }

    if (field.classList.contains("course-credit")) {
        if (!field.value.trim()) {
            setFieldError(field, "Credit is required.");
            return false;
        }

        const credit = Number(field.value);
        if (isNaN(credit) || credit <= 0) {
            setFieldError(field, "Credit must be greater than 0.");
            return false;
        }

        if (!Number.isInteger(credit)) {
            setFieldError(field, "Credit must be a whole number.");
            return false;
        }
        return true;
    }

    if (field.classList.contains("course-grade")) {
        if (!field.value) {
            setFieldError(field, "Grade is required.");
            return false;
        }
        return true;
    }

    return true;
}

function validateCourseRow(row) {
    let valid = true;
    const name = row.querySelector(".course-name");
    const credit = row.querySelector(".course-credit");
    const grade = row.querySelector(".course-grade");

    if (name && !validateCourseField(name)) valid = false;
    if (credit && !validateCourseField(credit)) valid = false;
    if (grade && !validateCourseField(grade)) valid = false;

    return valid;
}

function calculateCGPA() {
    const rows = document.querySelectorAll("#courseList .course-row");
    let totalCredits = 0;
    let totalPoints = 0;
    let validCourses = 0;
    let hasErrors = false;

    rows.forEach(row => {
        if (!validateCourseRow(row)) {
            hasErrors = true;
            return;
        }

        const creditInput = row.querySelector(".course-credit");
        const gradeSelect = row.querySelector(".course-grade");

        if (!creditInput || !gradeSelect) return;

        const credit = Number(creditInput.value);
        const grade = gradeSelect.value;

        if (!isNaN(credit) && credit > 0 && grade) {
            const point = universityGradePoints[selectedUniversity][grade];
            totalCredits += credit;
            totalPoints += credit * point;
            validCourses++;
        }
    });

    if (hasErrors) {
        document.getElementById("status").textContent = "Please fix the highlighted fields before calculating.";
        return;
    }

    if (validCourses === 0) {
        alert("Please add at least one valid course.");
        return;
    }

    const semesterGPA = totalPoints / totalCredits;
    const previousCGPA = parseFloat(document.getElementById("previousCGPA").value);
    const previousCredits = parseFloat(document.getElementById("previousCredits").value);

    let cumulativeCGPA;

    if (!isNaN(previousCGPA) && !isNaN(previousCredits) && previousCredits > 0) {
        cumulativeCGPA = (
            previousCGPA * previousCredits + totalPoints
        ) / (previousCredits + totalCredits);
    } else {
        cumulativeCGPA = semesterGPA;
    }

    document.getElementById("semesterGPA").textContent = semesterGPA.toFixed(2);
    document.getElementById("cgpaResult").textContent = cumulativeCGPA.toFixed(2);
    document.getElementById("totalCredits").textContent = totalCredits.toFixed(2);
    document.getElementById("totalPoints").textContent = totalPoints.toFixed(2);
    document.getElementById("standing").textContent = getStanding(cumulativeCGPA);
    document.getElementById("progress").style.width = `${(cumulativeCGPA / 4) * 100}%`;
    document.getElementById("status").innerHTML = getStatus(cumulativeCGPA);

    saveData();
}

function getStanding(cgpa) {
    if (cgpa >= 3.95) return "Summa";
    if (cgpa >= 3.80) return "Magna";
    if (cgpa >= 3.65) return "Cum Laude";
    if (cgpa >= 3.25) return "Good";
    if (cgpa >= 2.50) return "Satisfactory";
    return "Probation";
}

function getStatus(cgpa) {
    if (cgpa >= 3.95) {
        return `
            🏆 <b>Top grade range.</b>
            Your CGPA is 3.95 or above.
        `;
    }

    if (cgpa >= 3.80) {
        return `
            🌟 <b>High performance.</b>
            Your CGPA is between 3.80 and 3.94.
        `;
    }

    if (cgpa >= 3.65) {
        return `
            🎓 <b>Strong result.</b>
            Your CGPA is between 3.65 and 3.79.
        `;
    }

    if (cgpa >= 2.50) {
        return `
            👍 Your CGPA is above the general graduation threshold.
        `;
    }

    return `
        ⚠️ Your CGPA is below the threshold.
        Keep working to improve it.
    `;
}

function showCourseMode() {
    document.getElementById("courseMode").classList.remove("hidden");
}

function resetCalculator() {
    if (!confirm("Reset all course data?")) return;

    document.getElementById("courseList").innerHTML = "";
    document.getElementById("previousCGPA").value = "";
    document.getElementById("previousCredits").value = "";
    courseCount = 0;
    addCourse();
    document.getElementById("cgpaResult").textContent = "0.00";
    document.getElementById("semesterGPA").textContent = "0.00";
    document.getElementById("totalCredits").textContent = "0.00";
    document.getElementById("totalPoints").textContent = "0.00";
    document.getElementById("standing").textContent = "—";
    document.getElementById("progress").style.width = "0%";
    document.getElementById("status").innerHTML = 'Add your courses and click <b>Calculate CGPA</b>.';
}

function resetSemesters() {
    if (!confirm("Reset academic history?")) return;

    document.getElementById("semesterList").innerHTML = "";
    semesterCount = 0;
    addSemester();
}

function saveData() {
    const data = {
        previousCGPA: document.getElementById("previousCGPA").value,
        previousCredits: document.getElementById("previousCredits").value,
        selectedUniversity,
        courses: []
    };

    document.querySelectorAll("#courseList .course-row").forEach(row => {
        data.courses.push({
            name: row.querySelector(".course-name").value,
            credit: row.querySelector(".course-credit").value,
            grade: row.querySelector(".course-grade").value
        });
    });

    localStorage.setItem("cgpaCalculatorData", JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem("cgpaCalculatorData");

    if (!saved) {
        addCourse();
        selectUniversity(selectedUniversity);
        return;
    }

    try {
        const data = JSON.parse(saved);

        selectedUniversity = data.selectedUniversity || selectedUniversity;
        document.getElementById('status').textContent = `Selected ${selectedUniversity}: CGPA will be calculated using ${selectedUniversity} grade points.`;
        selectUniversity(selectedUniversity);

        document.getElementById("previousCGPA").value = data.previousCGPA || "";
        document.getElementById("previousCredits").value = sanitizeWholeNumber(data.previousCredits || "");

        if (data.courses && data.courses.length) {
            data.courses.forEach(course => {
                addCourse(course.name, course.credit, course.grade);
            });
        } else {
            addCourse();
        }
    } catch (error) {
        addCourse();
        selectUniversity(selectedUniversity);
    }
}

document.addEventListener("input", function() {
    saveData();
});

function getKeyboardNavigationRows() {
    const rows = [
        [
            document.getElementById("previousCGPA"),
            document.getElementById("previousCredits")
        ]
    ];

    document.querySelectorAll("#courseList .course-row").forEach(row => {
        rows.push([
            row.querySelector(".course-name"),
            row.querySelector(".course-credit"),
            row.querySelector(".course-grade")
        ]);
    });

    return rows.map(row => row.filter(Boolean));
}

function findKeyboardPosition(rows, target) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const colIndex = rows[rowIndex].indexOf(target);

        if (colIndex !== -1) {
            return { rowIndex, colIndex };
        }
    }

    return null;
}

function focusCalculatorField(field) {
    if (!field) return;

    field.focus();

    if (field.tagName === "INPUT") {
        field.select();
    }
}

function moveCalculatorFocus(event) {
    const navigationKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

    if (!navigationKeys.includes(event.key)) return;

    const target = event.target;

    if (!(target instanceof Element)) return;

    if (!target.matches("#previousCGPA, #previousCredits, .course-name, .course-credit, .course-grade")) {
        return;
    }

    const rows = getKeyboardNavigationRows();
    const position = findKeyboardPosition(rows, target);

    if (!position) return;

    let nextField = null;

    if (event.key === "ArrowLeft") {
        nextField = rows[position.rowIndex][position.colIndex - 1];
    }

    if (event.key === "ArrowRight") {
        nextField = rows[position.rowIndex][position.colIndex + 1];
    }

    if (event.key === "ArrowUp" && position.rowIndex > 0) {
        const previousRow = rows[position.rowIndex - 1];
        nextField = previousRow[Math.min(position.colIndex, previousRow.length - 1)];
    }

    if (event.key === "ArrowDown" && position.rowIndex < rows.length - 1) {
        const nextRow = rows[position.rowIndex + 1];
        nextField = nextRow[Math.min(position.colIndex, nextRow.length - 1)];
    }

    if (!nextField) return;

    event.preventDefault();
    focusCalculatorField(nextField);
}

document.addEventListener("keydown", moveCalculatorFocus);

document.getElementById("previousCredits").addEventListener("input", function() {
    this.value = sanitizeWholeNumber(this.value);
});

function scrollToCalculator() {
    document.getElementById("calculator").scrollIntoView({
        behavior: "smooth"
    });
}

loadData();
