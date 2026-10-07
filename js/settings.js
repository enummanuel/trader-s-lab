const PASSWORD_STORAGE_KEY = "tradersLabPasswordHash";
const SETTINGS_STORAGE_KEY = "tradersLabSettings";


const defaultSettings = {
    defaultRisk: 0.5,
    defaultSession: "London",
    confirmDelete: true,
    showScreenshots: true
};


function getSettings() {

    const storedSettings =
        localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!storedSettings) {
        return { ...defaultSettings };
    }

    try {

        return {
            ...defaultSettings,
            ...JSON.parse(storedSettings)
        };

    } catch (error) {

        console.error(
            "Unable to read Traders Lab settings:",
            error
        );

        return { ...defaultSettings };
    }
}


function saveSettings(settings) {

    localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
    );
}


function loadSettingsIntoForm() {

    const settings = getSettings();

    const defaultRisk =
        document.getElementById("settings-default-risk");

    const defaultSession =
        document.getElementById("settings-default-session");

    const confirmDelete =
        document.getElementById("settings-confirm-delete");

    const showScreenshots =
        document.getElementById("settings-show-screenshots");


    if (defaultRisk) {
        defaultRisk.value = settings.defaultRisk;
    }

    if (defaultSession) {
        defaultSession.value = settings.defaultSession;
    }

    if (confirmDelete) {
        confirmDelete.checked = settings.confirmDelete;
    }

    if (showScreenshots) {
        showScreenshots.checked = settings.showScreenshots;
    }
}


function saveSettingsFromForm() {

    const defaultRisk =
        document.getElementById("settings-default-risk");

    const defaultSession =
        document.getElementById("settings-default-session");

    const confirmDelete =
        document.getElementById("settings-confirm-delete");

    const showScreenshots =
        document.getElementById("settings-show-screenshots");


    const settings = {
        defaultRisk: Number(defaultRisk?.value) || 0.5,
        defaultSession: defaultSession?.value || "London",
        confirmDelete: confirmDelete?.checked ?? true,
        showScreenshots: showScreenshots?.checked ?? true
    };


    saveSettings(settings);
}


function setupSettingsListeners() {

    const inputs = document.querySelectorAll(
        "#settings-default-risk, " +
        "#settings-default-session, " +
        "#settings-confirm-delete, " +
        "#settings-show-screenshots"
    );


    inputs.forEach((input) => {

        input.addEventListener(
            "change",
            saveSettingsFromForm
        );

    });
}


/* ========================================
   PASSWORD
======================================== */

async function hashPassword(password) {

    const encoder = new TextEncoder();

    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    const hashArray = Array.from(
        new Uint8Array(hashBuffer)
    );

    return hashArray
        .map((byte) =>
            byte.toString(16).padStart(2, "0")
        )
        .join("");
}


async function initializePassword() {

    const storedHash =
        localStorage.getItem(PASSWORD_STORAGE_KEY);

    if (storedHash) {
        return;
    }

    const defaultPassword = "traderslab";

    const passwordHash =
        await hashPassword(defaultPassword);

    localStorage.setItem(
        PASSWORD_STORAGE_KEY,
        passwordHash
    );
}


function showPasswordFeedback(message, type) {

    const feedback =
        document.getElementById("password-feedback");

    if (!feedback) return;

    feedback.textContent = message;

    feedback.className =
        `settings-password-feedback ${type}`;
}


async function handlePasswordChange(event) {

    event.preventDefault();

    const currentPassword =
        document.getElementById("current-password").value;

    const newPassword =
        document.getElementById("new-password").value;

    const confirmPassword =
        document.getElementById("confirm-password").value;


    if (newPassword.length < 8) {

        showPasswordFeedback(
            "Password must be at least 8 characters.",
            "error"
        );

        return;
    }


    if (newPassword !== confirmPassword) {

        showPasswordFeedback(
            "New passwords do not match.",
            "error"
        );

        return;
    }


    const storedHash =
        localStorage.getItem(PASSWORD_STORAGE_KEY);

    const currentPasswordHash =
        await hashPassword(currentPassword);


    if (currentPasswordHash !== storedHash) {

        showPasswordFeedback(
            "Current password is incorrect.",
            "error"
        );

        return;
    }


    const newPasswordHash =
        await hashPassword(newPassword);


    localStorage.setItem(
        PASSWORD_STORAGE_KEY,
        newPasswordHash
    );


    document
        .getElementById("change-password-form")
        .reset();


    showPasswordFeedback(
        "Password changed successfully.",
        "success"
    );
}


/* ========================================
   INITIALIZE
======================================== */

function initializeSettingsPage() {

    loadSettingsIntoForm();

    setupSettingsListeners();

    initializePassword();


    const passwordForm =
        document.getElementById("change-password-form");


    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            handlePasswordChange
        );

    }
}


initializeSettingsPage();

/* ========================================
   CLEAR LOCAL DATA
======================================== */

function setupClearDataModal() {

    const modal =
        document.getElementById("clear-data-modal");

    const openButton =
        document.getElementById("open-clear-data");

    const cancelButton =
        document.getElementById("cancel-clear-data");

    const confirmButton =
        document.getElementById("confirm-clear-data");

    const backdrop =
        modal?.querySelector(".settings-modal-backdrop");


    if (
        !modal ||
        !openButton ||
        !cancelButton ||
        !confirmButton
    ) {
        return;
    }


    function openModal() {

        modal.classList.add("active");

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal() {

        modal.classList.remove("active");

        document.body.classList.remove(
            "modal-open"
        );

    }


    openButton.addEventListener(
        "click",
        openModal
    );


    cancelButton.addEventListener(
        "click",
        closeModal
    );


    backdrop?.addEventListener(
        "click",
        closeModal
    );


    confirmButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "tradersLabTrades"
            );

            localStorage.removeItem(
                "tradersLabSettings"
            );

            localStorage.removeItem(
                "tradersLabPasswordHash"
            );


            closeModal();

            window.location.reload();

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {
                closeModal();
            }

        }
    );

}


setupClearDataModal();

function setupSettingsDataActions() {
    const exportPdfButton =
        document.getElementById("settings-export-pdf");

    const importJournalButton =
        document.getElementById("settings-import-journal");

    const importFile =
        document.getElementById("settings-import-file");


    if (exportPdfButton) {
        exportPdfButton.addEventListener("click", function () {
            const trades = getTradesForPdf();

            exportJournalPdf(
                trades,
                "All recorded trades"
            );
        });
    }


    if (importJournalButton && importFile) {

        importJournalButton.addEventListener("click", function () {
            importFile.click();
        });


        importFile.addEventListener("change", function () {

            const file = importFile.files[0];

            if (!file) {
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {

                try {

                    const importedData =
                        JSON.parse(event.target.result);


                    if (
                        !importedData ||
                        importedData.app !== "Traders Lab" ||
                        !Array.isArray(importedData.trades)
                    ) {
                        alert(
                            "Invalid Traders Lab journal file."
                        );

                        return;
                    }


                    const confirmed = confirm(
                        "Importing this journal will replace your current journal data. Continue?"
                    );


                    if (!confirmed) {
                        return;
                    }


                    localStorage.setItem(
                        "tradersLabTrades",
                        JSON.stringify(importedData.trades)
                    );


                    alert(
                        `${importedData.trades.length} trade(s) imported successfully.`
                    );


                    window.location.reload();

                } catch (error) {

                    alert(
                        "This file could not be imported. Please select a valid Traders Lab JSON file."
                    );

                }


                importFile.value = "";

            };


            reader.readAsText(file);

        });

    }
}


setupSettingsDataActions();