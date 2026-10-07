// ======================================================
// JOURNAL STORAGE
// ======================================================

let editingTradeId = null;
let activeJournalFilter = "all";


function getCurrentUserId() {

    const sessionData =
        localStorage.getItem("tradersLabSession");

    if (!sessionData) {
        return null;
    }

    try {

        const session =
            JSON.parse(sessionData);

        return session.userId || null;

    } catch (error) {

        console.error(
            "Unable to read current session:",
            error
        );

        return null;
    }
}


function getTradesStorageKey() {

    const userId =
        getCurrentUserId();

    if (!userId) {
        return null;
    }

    return `tradersLabTrades_${userId}`;
}


function getTrades() {

    const storageKey =
        getTradesStorageKey();

    if (!storageKey) {
        return [];
    }

    const storedTrades =
        localStorage.getItem(storageKey);

    if (storedTrades) {

        try {

            return JSON.parse(
                storedTrades
            );

        } catch (error) {

            console.error(
                "Unable to read user trades:",
                error
            );

            return [];
        }
    }


    // --------------------------------------------------
    // Migrate old global journal data
    // --------------------------------------------------

    const oldTrades =
        localStorage.getItem(
            "tradersLabTrades"
        );

    if (oldTrades) {

        try {

            const parsedOldTrades =
                JSON.parse(oldTrades);

            localStorage.setItem(
                storageKey,
                JSON.stringify(
                    parsedOldTrades
                )
            );

            localStorage.removeItem(
                "tradersLabTrades"
            );

            return parsedOldTrades;

        } catch (error) {

            console.error(
                "Unable to migrate old journal data:",
                error
            );

            return [];
        }
    }

    return [];
}


function saveTrades(trades) {

    const storageKey =
        getTradesStorageKey();

    if (!storageKey) {

        console.error(
            "No logged-in user found. Trades cannot be saved."
        );

        return;
    }

    localStorage.setItem(
        storageKey,
        JSON.stringify(trades)
    );
}


// ======================================================
// RENDER TRADES
// ======================================================

function renderTrades() {

    const trades =
        getFilteredTrades();

    const tradeList =
        document.getElementById(
            "journal-trade-list"
        );

    const emptyState =
        document.getElementById(
            "journal-empty-state"
        );


    if (!tradeList || !emptyState) {
        return;
    }


    tradeList.innerHTML = "";


    if (trades.length === 0) {

        emptyState.style.display =
            "block";

        return;
    }


    emptyState.style.display =
        "none";


    trades.forEach(function (trade) {

        const tradeItem =
            document.createElement(
                "article"
            );

        tradeItem.className =
            "journal-trade-item";


        tradeItem.innerHTML = `
            <div>
                <strong>${trade.pair || "—"}</strong>
                <span>${trade.direction || "—"}</span>
            </div>

            <div>
                <span>${trade.setup || "—"}</span>
                <small>${trade.date || "—"}</small>

                <small class="trade-outcome ${
                    trade.outcome
                        ? `trade-outcome-${trade.outcome.toLowerCase()}`
                        : ""
                }">
                    ${trade.outcome || "—"}
                </small>
            </div>

            <div class="journal-trade-screenshot">

                ${
                    trade.screenshot
                        ? `
                            <button
                                type="button"
                                class="trade-screenshot-button"
                                data-screenshot="${trade.id}"
                                aria-label="View trade screenshot"
                            >
                                <img
                                    src="${trade.screenshot}"
                                    alt="Trade screenshot"
                                >
                            </button>
                        `
                        : `
                            <span class="trade-no-screenshot">
                                —
                            </span>
                        `
                }

            </div>

            <strong class="${
                Number(trade.result) >= 0
                    ? "trade-result-profit"
                    : "trade-result-loss"
            }">
                ${
                    Number(trade.result) > 0
                        ? "+"
                        : ""
                }${trade.result || 0}R
            </strong>

            <div class="journal-trade-actions">

                <button
                    type="button"
                    class="trade-edit-button"
                    data-id="${trade.id}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="trade-delete-button"
                    data-id="${trade.id}"
                >
                    Delete
                </button>

            </div>
        `;


        tradeList.appendChild(
            tradeItem
        );

    });
}


// ======================================================
// ELEMENTS
// ======================================================

const addTradePanel =
    document.getElementById(
        "add-trade-panel"
    );

const openTradeButton =
    document.getElementById(
        "open-trade-form"
    );

const openTradeEmptyButton =
    document.getElementById(
        "open-trade-form-empty"
    );

const cancelTradeButton =
    document.getElementById(
        "cancel-trade-form"
    );

const exportJournalButton =
    document.getElementById(
        "export-journal"
    );

const importJournalButton =
    document.getElementById(
        "import-journal"
    );

const journalImportFile =
    document.getElementById(
        "journal-import-file"
    );

const exportCsvButton =
    document.getElementById(
        "export-csv"
    );


// ======================================================
// JSON EXPORT
// ======================================================

if (exportJournalButton) {

    exportJournalButton.addEventListener(
        "click",
        function () {

            const trades =
                getTrades();


            if (trades.length === 0) {

                alert(
                    "There are no trades to export yet."
                );

                return;
            }


            const exportData = {

                app: "Traders Lab",

                type: "trading-journal",

                version: 1,

                exportedAt:
                    new Date().toISOString(),

                trades: trades

            };


            const jsonData =
                JSON.stringify(
                    exportData,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [jsonData],
                    {
                        type:
                            "application/json"
                    }
                );


            const downloadUrl =
                URL.createObjectURL(
                    blob
                );


            const downloadLink =
                document.createElement(
                    "a"
                );


            downloadLink.href =
                downloadUrl;


            downloadLink.download =
                `traders-lab-journal-${new Date()
                    .toISOString()
                    .slice(0, 10)}.json`;


            document.body.appendChild(
                downloadLink
            );


            downloadLink.click();


            downloadLink.remove();


            URL.revokeObjectURL(
                downloadUrl
            );

        }
    );

}


// ======================================================
// JSON IMPORT
// ======================================================

if (
    importJournalButton &&
    journalImportFile
) {

    importJournalButton.addEventListener(
        "click",
        function () {

            journalImportFile.click();

        }
    );


    journalImportFile.addEventListener(
        "change",
        function () {

            const file =
                journalImportFile.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    try {

                        const importedData =
                            JSON.parse(
                                event.target.result
                            );


                        if (
                            !importedData ||
                            importedData.app !==
                                "Traders Lab" ||
                            !Array.isArray(
                                importedData.trades
                            )
                        ) {

                            alert(
                                "Invalid Traders Lab journal file."
                            );

                            return;
                        }


                        const confirmed =
                            confirm(
                                "Importing this journal will replace your current journal data. Continue?"
                            );


                        if (!confirmed) {
                            return;
                        }


                        saveTrades(
                            importedData.trades
                        );


                        activeJournalFilter =
                            "all";


                        document
                            .querySelectorAll(
                                ".journal-filter"
                            )
                            .forEach(
                                function (button) {

                                    button.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        const allFilterButton =
                            document.querySelector(
                                '.journal-filter[data-filter="all"]'
                            );


                        if (allFilterButton) {

                            allFilterButton.classList.add(
                                "active"
                            );

                        }


                        renderTrades();

                        updateJournalSummary();

                        updateJournalReflections();


                        alert(
                            `${importedData.trades.length} trade(s) imported successfully.`
                        );


                    } catch (error) {

                        console.error(
                            "Journal import error:",
                            error
                        );


                        alert(
                            "This file could not be imported. Please select a valid Traders Lab JSON file."
                        );

                    }


                    journalImportFile.value =
                        "";

                };


            reader.readAsText(
                file
            );

        }
    );

}


// ======================================================
// CSV EXPORT
// ======================================================

if (exportCsvButton) {

    exportCsvButton.addEventListener(
        "click",
        function () {

            const trades =
                getTrades();


            if (trades.length === 0) {

                alert(
                    "There are no trades to export yet."
                );

                return;
            }


            const headers = [

                "ID",

                "Date",

                "Time",

                "Pair",

                "Direction",

                "Setup",

                "Entry",

                "Stop Loss",

                "Take Profit",

                "Risk",

                "Outcome",

                "Result",

                "Notes"

            ];


            const rows =
                trades.map(
                    function (trade) {

                        return [

                            trade.id,

                            trade.date,

                            trade.time,

                            trade.pair,

                            trade.direction,

                            trade.setup,

                            trade.entry,

                            trade.stopLoss,

                            trade.takeProfit,

                            trade.risk,

                            trade.outcome,

                            trade.result,

                            trade.notes

                        ];

                    }
                );


            function escapeCsvValue(
                value
            ) {

                const stringValue =
                    String(
                        value ?? ""
                    );


                return `"${stringValue.replace(
                    /"/g,
                    '""'
                )}"`;

            }


            const csv = [

                headers
                    .map(
                        escapeCsvValue
                    )
                    .join(","),

                ...rows.map(
                    function (row) {

                        return row
                            .map(
                                escapeCsvValue
                            )
                            .join(",");

                    }
                )

            ].join("\n");


            const blob =
                new Blob(
                    [csv],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const downloadUrl =
                URL.createObjectURL(
                    blob
                );


            const downloadLink =
                document.createElement(
                    "a"
                );


            downloadLink.href =
                downloadUrl;


            downloadLink.download =
                `traders-lab-journal-${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`;


            document.body.appendChild(
                downloadLink
            );


            downloadLink.click();


            downloadLink.remove();


            URL.revokeObjectURL(
                downloadUrl
            );

        }
    );

}


// ======================================================
// TRADE FORM
// ======================================================

function openTradeForm() {

    if (!addTradePanel) {
        return;
    }

    addTradePanel.style.display =
        "block";
}


function closeTradeForm() {

    if (!addTradePanel) {
        return;
    }

    addTradePanel.style.display =
        "none";
}


if (openTradeButton) {

    openTradeButton.addEventListener(
        "click",
        openTradeForm
    );

}


if (openTradeEmptyButton) {

    openTradeEmptyButton.addEventListener(
        "click",
        openTradeForm
    );

}


if (cancelTradeButton) {

    cancelTradeButton.addEventListener(
        "click",
        closeTradeForm
    );

}


// ======================================================
// TRADE INPUTS
// ======================================================

const tradeForm =
    document.querySelector(
        ".trade-form"
    );

const tradeRiskInput =
    document.getElementById(
        "trade-risk"
    );

const tradeOutcomeInput =
    document.getElementById(
        "trade-outcome"
    );

const tradeResultInput =
    document.getElementById(
        "trade-result"
    );

const tradeScreenshotInput =
    document.getElementById(
        "trade-screenshot"
    );


let selectedScreenshot =
    null;


// ======================================================
// SCREENSHOT UPLOAD
// ======================================================

if (tradeScreenshotInput) {

    tradeScreenshotInput.addEventListener(
        "change",
        function () {

            const file =
                tradeScreenshotInput.files[0];


            if (!file) {

                selectedScreenshot =
                    null;

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    selectedScreenshot =
                        event.target.result;


                    const preview =
                        document.getElementById(
                            "screenshot-preview"
                        );


                    if (preview) {

                        preview.src =
                            selectedScreenshot;

                        preview.style.display =
                            "block";

                    }


                    const dropzone =
                        document.querySelector(
                            ".screenshot-dropzone"
                        );


                    if (!dropzone) {
                        return;
                    }


                    const icon =
                        dropzone.querySelector(
                            ".screenshot-upload-icon"
                        );

                    const strong =
                        dropzone.querySelector(
                            "strong"
                        );

                    const small =
                        dropzone.querySelector(
                            "small"
                        );


                    if (icon) {
                        icon.textContent =
                            "✓";
                    }

                    if (strong) {
                        strong.textContent =
                            "Screenshot attached";
                    }

                    if (small) {
                        small.textContent =
                            file.name;
                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ======================================================
// OUTCOME / RESULT
// ======================================================

if (
    tradeOutcomeInput &&
    tradeRiskInput &&
    tradeResultInput
) {

    tradeOutcomeInput.addEventListener(
        "change",
        function () {

            if (
                tradeOutcomeInput.value ===
                "LOSS"
            ) {

                const risk =
                    Number(
                        tradeRiskInput.value
                    );


                tradeResultInput.value =
                    risk > 0
                        ? `-${risk}`
                        : "";


                tradeResultInput.readOnly =
                    true;
            }


            if (
                tradeOutcomeInput.value ===
                "BREAKEVEN"
            ) {

                tradeResultInput.value =
                    "0";


                tradeResultInput.readOnly =
                    true;
            }


            if (
                tradeOutcomeInput.value ===
                "WIN"
            ) {

                tradeResultInput.value =
                    "";


                tradeResultInput.readOnly =
                    false;
            }

        }
    );


    tradeRiskInput.addEventListener(
        "input",
        function () {

            if (
                tradeOutcomeInput.value ===
                "LOSS"
            ) {

                const risk =
                    Number(
                        tradeRiskInput.value
                    );


                tradeResultInput.value =
                    risk > 0
                        ? `-${risk}`
                        : "";

            }

        }
    );

}


// ======================================================
// SAVE TRADE
// ======================================================

if (tradeForm) {

    tradeForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const trade = {

                pair:
                    document.getElementById(
                        "trade-pair"
                    ).value,

                direction:
                    document.getElementById(
                        "trade-direction"
                    ).value,

                date:
                    document.getElementById(
                        "trade-date"
                    ).value,

                time:
                    document.getElementById(
                        "trade-time"
                    ).value,

                setup:
                    document.getElementById(
                        "trade-setup"
                    ).value.trim(),

                entry:
                    document.getElementById(
                        "trade-entry"
                    ).value,

                stopLoss:
                    document.getElementById(
                        "trade-stop"
                    ).value,

                takeProfit:
                    document.getElementById(
                        "trade-target"
                    ).value,

                risk:
                    document.getElementById(
                        "trade-risk"
                    ).value,

                outcome:
                    document.getElementById(
                        "trade-outcome"
                    ).value,

                result:
                    document.getElementById(
                        "trade-result"
                    ).value,

                notes:
                    document.getElementById(
                        "trade-notes"
                    ).value.trim(),

                screenshot:
                    selectedScreenshot

            };


            if (
                !trade.pair ||
                !trade.direction ||
                !trade.date ||
                !trade.setup ||
                !trade.risk ||
                !trade.outcome ||
                !trade.result
            ) {

                alert(
                    "Please complete all required trade fields."
                );

                return;
            }


            const trades =
                getTrades();


            // --------------------------------------------------
            // EDIT
            // --------------------------------------------------

            if (
                editingTradeId !==
                null
            ) {

                const tradeIndex =
                    trades.findIndex(
                        function (existingTrade) {

                            return (
                                Number(
                                    existingTrade.id
                                ) ===
                                Number(
                                    editingTradeId
                                )
                            );

                        }
                    );


                if (
                    tradeIndex !==
                    -1
                ) {

                    trade.id =
                        editingTradeId;


                    if (
                        !selectedScreenshot
                    ) {

                        trade.screenshot =
                            trades[
                                tradeIndex
                            ].screenshot ||
                            null;

                    }


                    trades[
                        tradeIndex
                    ] = trade;

                }

            }


            // --------------------------------------------------
            // NEW TRADE
            // --------------------------------------------------

            else {

                trade.id =
                    Date.now();


                trades.push(
                    trade
                );

            }


            saveTrades(
                trades
            );


            renderTrades();

            updateJournalSummary();

            updateJournalReflections();


            tradeForm.reset();


            selectedScreenshot =
                null;


            editingTradeId =
                null;


            const screenshotPreview =
                document.getElementById(
                    "screenshot-preview"
                );


            if (screenshotPreview) {

                screenshotPreview.src =
                    "";

                screenshotPreview.style.display =
                    "none";

            }


            const dropzone =
                document.querySelector(
                    ".screenshot-dropzone"
                );


            if (dropzone) {

                const icon =
                    dropzone.querySelector(
                        ".screenshot-upload-icon"
                    );

                const strong =
                    dropzone.querySelector(
                        "strong"
                    );

                const small =
                    dropzone.querySelector(
                        "small"
                    );


                if (icon) {
                    icon.textContent =
                        "+";
                }

                if (strong) {
                    strong.textContent =
                        "Upload trade screenshot";
                }

                if (small) {
                    small.textContent =
                        "PNG, JPG or WebP";
                }

            }


            closeTradeForm();

        }
    );

}


// ======================================================
// EDIT TRADE
// ======================================================

function editTrade(
    tradeId
) {

    const trades =
        getTrades();


    const trade =
        trades.find(
            function (trade) {

                return (
                    Number(
                        trade.id
                    ) ===
                    Number(
                        tradeId
                    )
                );

            }
        );


    if (!trade) {
        return;
    }


    editingTradeId =
        trade.id;


    document.getElementById(
        "trade-pair"
    ).value =
        trade.pair || "";


    document.getElementById(
        "trade-direction"
    ).value =
        trade.direction || "";


    document.getElementById(
        "trade-date"
    ).value =
        trade.date || "";


    document.getElementById(
        "trade-time"
    ).value =
        trade.time || "";


    document.getElementById(
        "trade-setup"
    ).value =
        trade.setup || "";


    document.getElementById(
        "trade-entry"
    ).value =
        trade.entry || "";


    document.getElementById(
        "trade-stop"
    ).value =
        trade.stopLoss || "";


    document.getElementById(
        "trade-target"
    ).value =
        trade.takeProfit || "";


    document.getElementById(
        "trade-risk"
    ).value =
        trade.risk || "";


    document.getElementById(
        "trade-outcome"
    ).value =
        trade.outcome || "";


    document.getElementById(
        "trade-result"
    ).value =
        trade.result || "";


    document.getElementById(
        "trade-notes"
    ).value =
        trade.notes || "";


    if (trade.screenshot) {

        selectedScreenshot =
            trade.screenshot;


        const preview =
            document.getElementById(
                "screenshot-preview"
            );


        if (preview) {

            preview.src =
                trade.screenshot;

            preview.style.display =
                "block";

        }

    } else {

        selectedScreenshot =
            null;

    }


    openTradeForm();

}


// ======================================================
// EDIT / DELETE BUTTONS
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "trade-edit-button"
            )
        ) {

            const tradeId =
                event.target.dataset.id;


            editTrade(
                tradeId
            );

        }


        if (
            event.target.classList.contains(
                "trade-delete-button"
            )
        ) {

            const tradeId =
                event.target.dataset.id;


            openDeleteModal(
                tradeId
            );

        }

    }
);


// ======================================================
// DELETE MODAL
// ======================================================

const deleteCancelButton =
    document.getElementById(
        "trade-delete-cancel"
    );

const deleteConfirmButton =
    document.getElementById(
        "trade-delete-confirm"
    );


let tradeToDeleteId =
    null;


function openDeleteModal(
    tradeId
) {

    tradeToDeleteId =
        Number(
            tradeId
        );


    const deleteModal =
        document.getElementById(
            "trade-delete-modal"
        );


    if (!deleteModal) {
        return;
    }


    deleteModal.classList.add(
        "is-visible"
    );

}


function closeDeleteModal() {

    tradeToDeleteId =
        null;


    const deleteModal =
        document.getElementById(
            "trade-delete-modal"
        );


    if (!deleteModal) {
        return;
    }


    deleteModal.classList.remove(
        "is-visible"
    );

}


function deleteTrade() {

    if (
        tradeToDeleteId ===
        null
    ) {

        return;
    }


    const trades =
        getTrades();


    const updatedTrades =
        trades.filter(
            function (trade) {

                return (
                    Number(
                        trade.id
                    ) !==
                    tradeToDeleteId
                );

            }
        );


    saveTrades(
        updatedTrades
    );


    renderTrades();

    updateJournalSummary();

    updateJournalReflections();


    closeDeleteModal();

}


if (deleteCancelButton) {

    deleteCancelButton.addEventListener(
        "click",
        closeDeleteModal
    );

}


if (deleteConfirmButton) {

    deleteConfirmButton.addEventListener(
        "click",
        deleteTrade
    );

}


// ======================================================
// SCREENSHOT VIEWER
// ======================================================

const screenshotModal =
    document.getElementById(
        "trade-screenshot-modal"
    );

const screenshotViewer =
    document.getElementById(
        "trade-screenshot-viewer"
    );

const screenshotCloseButton =
    document.getElementById(
        "trade-screenshot-close"
    );


function openScreenshotViewer(
    tradeId
) {

    const trades =
        getTrades();


    const trade =
        trades.find(
            function (trade) {

                return (
                    Number(
                        trade.id
                    ) ===
                    Number(
                        tradeId
                    )
                );

            }
        );


    if (
        !trade ||
        !trade.screenshot
    ) {

        return;
    }


    if (
        !screenshotViewer ||
        !screenshotModal
    ) {

        return;
    }


    screenshotViewer.src =
        trade.screenshot;


    screenshotModal.classList.add(
        "is-visible"
    );

}


function closeScreenshotViewer() {

    if (!screenshotModal) {
        return;
    }


    screenshotModal.classList.remove(
        "is-visible"
    );


    if (screenshotViewer) {

        screenshotViewer.src =
            "";

    }

}


document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.closest(
                ".trade-screenshot-button"
            )
        ) {

            const button =
                event.target.closest(
                    ".trade-screenshot-button"
                );


            openScreenshotViewer(
                button.dataset.screenshot
            );

        }

    }
);


if (screenshotCloseButton) {

    screenshotCloseButton.addEventListener(
        "click",
        closeScreenshotViewer
    );

}


if (screenshotModal) {

    screenshotModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                screenshotModal
            ) {

                closeScreenshotViewer();

            }

        }
    );

}


// ======================================================
// JOURNAL SUMMARY
// ======================================================

function updateJournalSummary() {

    const trades =
        getTrades();


    const totalTradesElement =
        document.getElementById(
            "journal-total-trades"
        );

    const winRateElement =
        document.getElementById(
            "journal-win-rate"
        );

    const netResultElement =
        document.getElementById(
            "journal-net-result"
        );

    const averageRElement =
        document.getElementById(
            "journal-average-r"
        );


    if (
        !totalTradesElement ||
        !winRateElement ||
        !netResultElement ||
        !averageRElement
    ) {

        return;
    }


    const totalTrades =
        trades.length;


    const wins =
        trades.filter(
            function (trade) {

                return (
                    trade.outcome ===
                    "WIN"
                );

            }
        ).length;


    const completedTrades =
        trades.filter(
            function (trade) {

                return (
                    trade.outcome ===
                        "WIN" ||
                    trade.outcome ===
                        "LOSS"
                );

            }
        ).length;


    const netResult =
        trades.reduce(
            function (
                total,
                trade
            ) {

                return (
                    total +
                    Number(
                        trade.result ||
                        0
                    )
                );

            },
            0
        );


    const averageR =
        totalTrades > 0
            ? netResult /
                totalTrades
            : 0;


    const winRate =
        completedTrades > 0
            ? (
                wins /
                completedTrades
            ) * 100
            : 0;


    totalTradesElement.textContent =
        totalTrades;


    winRateElement.textContent =
        `${winRate.toFixed(1)}%`;


    netResultElement.textContent =
        `${
            netResult > 0
                ? "+"
                : ""
        }${netResult.toFixed(2)}R`;


    averageRElement.textContent =
        `${
            averageR > 0
                ? "+"
                : ""
        }${averageR.toFixed(2)}R`;

}


// ======================================================
// JOURNAL FILTERS
// ======================================================

function getFilteredTrades() {

    const trades =
        getTrades();


    if (
        activeJournalFilter ===
        "all"
    ) {

        return trades;

    }


    const now =
        new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const tomorrow =
        new Date(today);


    tomorrow.setDate(
        today.getDate() + 1
    );


    const yesterday =
        new Date(today);


    yesterday.setDate(
        today.getDate() - 1
    );


    // Monday = 0, Sunday = 6

    const dayOfWeek =
        (
            today.getDay() + 6
        ) % 7;


    const startOfThisWeek =
        new Date(today);


    startOfThisWeek.setDate(
        today.getDate() -
        dayOfWeek
    );


    const endOfThisWeek =
        new Date(
            startOfThisWeek
        );


    endOfThisWeek.setDate(
        startOfThisWeek.getDate() +
        7
    );


    const startOfLastWeek =
        new Date(
            startOfThisWeek
        );


    startOfLastWeek.setDate(
        startOfThisWeek.getDate() -
        7
    );


    const endOfLastWeek =
        new Date(
            startOfThisWeek
        );


    const startOfLastMonth =
        new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
        );


    const startOfThisMonth =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    const startOfNextMonth =
        new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            1
        );


    return trades.filter(
        function (trade) {

            if (!trade.date) {
                return false;
            }


            const tradeDate =
                new Date(
                    trade.date +
                    "T00:00:00"
                );


            if (
                activeJournalFilter ===
                "today"
            ) {

                return (
                    tradeDate >= today &&
                    tradeDate < tomorrow
                );

            }


            if (
                activeJournalFilter ===
                "yesterday"
            ) {

                return (
                    tradeDate >= yesterday &&
                    tradeDate < today
                );

            }


            if (
                activeJournalFilter ===
                "this-week"
            ) {

                return (
                    tradeDate >=
                        startOfThisWeek &&
                    tradeDate <
                        endOfThisWeek
                );

            }


            if (
                activeJournalFilter ===
                "last-week"
            ) {

                return (
                    tradeDate >=
                        startOfLastWeek &&
                    tradeDate <
                        endOfLastWeek
                );

            }


            if (
                activeJournalFilter ===
                "this-month"
            ) {

                return (
                    tradeDate >=
                        startOfThisMonth &&
                    tradeDate <
                        startOfNextMonth
                );

            }


            if (
                activeJournalFilter ===
                "last-month"
            ) {

                return (
                    tradeDate >=
                        startOfLastMonth &&
                    tradeDate <
                        startOfThisMonth
                );

            }


            return true;

        }
    );

}


// ======================================================
// FILTER BUTTONS
// ======================================================

const journalFilterButtons =
    document.querySelectorAll(
        ".journal-filter"
    );


journalFilterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                activeJournalFilter =
                    button.dataset.filter;


                journalFilterButtons.forEach(
                    function (
                        filterButton
                    ) {

                        filterButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                renderTrades();

                updateJournalSummary();

                updateJournalReflections();

            }
        );

    }
);


// ======================================================
// PDF REFLECTION STYLES
// ======================================================

function ensurePdfReflectionStyles() {

    if (
        document.getElementById(
            "traders-lab-pdf-reflection-styles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "traders-lab-pdf-reflection-styles";


    style.textContent = `
        .pdf-reflections-section {
            margin-top: 32px;
        }

        .pdf-reflections-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .pdf-reflection-item {
            padding: 16px 18px;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            background: #fafafa;
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .pdf-reflection-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 7px;
        }

        .pdf-reflection-trade {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
        }

        .pdf-reflection-trade strong {
            font-size: 13px;
        }

        .pdf-reflection-trade span {
            font-size: 10px;
            color: #666;
        }

        .pdf-reflection-details {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 12px;
            font-size: 10px;
            color: #777;
        }

        .pdf-reflection-note {
            margin: 0;
            padding: 12px 14px;
            border-left: 2px solid #cfd3d8;
            background: #fff;
            font-size: 11px;
            line-height: 1.7;
            color: #333;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        .pdf-reflection-result {
            flex-shrink: 0;
            font-size: 12px;
            font-weight: 600;
        }

        .pdf-reflection-result.profit {
            color: #16794c;
        }

        .pdf-reflection-result.loss {
            color: #b42318;
        }

        .pdf-reflection-result.neutral {
            color: #777;
        }

        .pdf-reflection-empty {
            margin: 0;
            padding: 18px;
            border: 1px dashed #d8dce1;
            color: #777;
            font-size: 11px;
        }

        @media print {

            .pdf-reflections-section {
                break-inside: auto;
                page-break-inside: auto;
            }

            .pdf-reflection-item {
                break-inside: avoid;
                page-break-inside: avoid;
            }

        }
    `;


    document.head.appendChild(
        style
    );

}


// ======================================================
// CREATE PDF REFLECTION CONTAINER
// ======================================================

function getPdfReflectionsList() {

    let reflectionSection =
        document.getElementById(
            "pdf-reflections-section"
        );


    let reflectionList =
        document.getElementById(
            "pdf-reflections-list"
        );


    if (
        reflectionSection &&
        reflectionList
    ) {

        return reflectionList;

    }


    const pdfReport =
        document.getElementById(
            "journal-pdf-report"
        );


    if (!pdfReport) {
        return null;
    }


    ensurePdfReflectionStyles();


    reflectionSection =
        document.createElement(
            "div"
        );


    reflectionSection.id =
        "pdf-reflections-section";


    reflectionSection.className =
        "pdf-report-section pdf-reflections-section";


    reflectionSection.innerHTML = `
        <div class="pdf-section-heading">
            <span>02</span>
            <h2>Journal Reflections</h2>
        </div>

        <div
            class="pdf-reflections-list"
            id="pdf-reflections-list"
        ></div>
    `;


    const footer =
        pdfReport.querySelector(
            ".pdf-report-footer"
        );


    if (footer) {

        pdfReport.insertBefore(
            reflectionSection,
            footer
        );

    } else {

        pdfReport.appendChild(
            reflectionSection
        );

    }


    reflectionList =
        document.getElementById(
            "pdf-reflections-list"
        );


    return reflectionList || null;

}


// ======================================================
// RENDER PDF REFLECTIONS
// ======================================================

function renderPdfReflections(
    trades
) {

    const reflectionList =
        getPdfReflectionsList();


    if (!reflectionList) {
        return;
    }


    reflectionList.innerHTML =
        "";


    const reflectionTrades =
        trades.filter(
            function (trade) {

                return (
                    typeof trade.notes ===
                        "string" &&
                    trade.notes.trim().length >
                        0
                );

            }
        );


    if (
        reflectionTrades.length ===
        0
    ) {

        const emptyMessage =
            document.createElement(
                "p"
            );


        emptyMessage.className =
            "pdf-reflection-empty";


        emptyMessage.textContent =
            "No written reflections were recorded for this period.";


        reflectionList.appendChild(
            emptyMessage
        );


        return;
    }


    reflectionTrades.forEach(
        function (trade) {

            const reflection =
                document.createElement(
                    "article"
                );


            reflection.className =
                "pdf-reflection-item";


            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "pdf-reflection-meta";


            const tradeInfo =
                document.createElement(
                    "div"
                );


            tradeInfo.className =
                "pdf-reflection-trade";


            const pair =
                document.createElement(
                    "strong"
                );


            pair.textContent =
                trade.pair || "—";


            const direction =
                document.createElement(
                    "span"
                );


            direction.textContent =
                trade.direction || "—";


            const outcome =
                document.createElement(
                    "span"
                );


            outcome.textContent =
                trade.outcome || "—";


            tradeInfo.appendChild(
                pair
            );

            tradeInfo.appendChild(
                direction
            );

            tradeInfo.appendChild(
                outcome
            );


            const result =
                Number(
                    trade.result || 0
                );


            const resultElement =
                document.createElement(
                    "span"
                );


            resultElement.className =
                "pdf-reflection-result " +
                (
                    result > 0
                        ? "profit"
                        : result < 0
                            ? "loss"
                            : "neutral"
                );


            resultElement.textContent =
                `${
                    result > 0
                        ? "+"
                        : ""
                }${trade.result || 0}R`;


            meta.appendChild(
                tradeInfo
            );

            meta.appendChild(
                resultElement
            );


            const details =
                document.createElement(
                    "div"
                );


            details.className =
                "pdf-reflection-details";


            const date =
                document.createElement(
                    "span"
                );


            date.textContent =
                trade.date || "—";


            details.appendChild(
                date
            );


            if (trade.setup) {

                const setup =
                    document.createElement(
                        "span"
                    );


                setup.textContent =
                    trade.setup;


                details.appendChild(
                    setup
                );

            }


            const note =
                document.createElement(
                    "p"
                );


            note.className =
                "pdf-reflection-note";


            note.textContent =
                trade.notes.trim();


            reflection.appendChild(
                meta
            );

            reflection.appendChild(
                details
            );

            reflection.appendChild(
                note
            );


            reflectionList.appendChild(
                reflection
            );

        }
    );

}


// ======================================================
// JOURNAL PDF
// ======================================================

const exportPdfButton =
    document.getElementById(
        "export-pdf"
    );


function exportJournalPdf(
    useAllTrades = false
) {

    const trades =
        useAllTrades
            ? getTrades()
            : getFilteredTrades();


    if (
        trades.length === 0
    ) {

        alert(
            "There are no trades to include in the PDF report."
        );

        return;
    }


    const pdfTotalTrades =
        document.getElementById(
            "pdf-total-trades"
        );

    const pdfWinRate =
        document.getElementById(
            "pdf-win-rate"
        );

    const pdfNetResult =
        document.getElementById(
            "pdf-net-result"
        );

    const pdfAverageR =
        document.getElementById(
            "pdf-average-r"
        );

    const pdfTradeTableBody =
        document.getElementById(
            "pdf-trade-table-body"
        );

    const pdfReportPeriod =
        document.getElementById(
            "pdf-report-period"
        );

    const pdfGeneratedDate =
        document.getElementById(
            "pdf-report-generated-date"
        );


    if (
        !pdfTotalTrades ||
        !pdfWinRate ||
        !pdfNetResult ||
        !pdfAverageR ||
        !pdfTradeTableBody ||
        !pdfReportPeriod ||
        !pdfGeneratedDate
    ) {

        console.error(
            "PDF report elements are missing."
        );

        return;
    }


    const wins =
        trades.filter(
            function (trade) {

                return (
                    trade.outcome ===
                    "WIN"
                );

            }
        ).length;


    const losses =
        trades.filter(
            function (trade) {

                return (
                    trade.outcome ===
                    "LOSS"
                );

            }
        ).length;


    const completedTrades =
        wins + losses;


    const netResult =
        trades.reduce(
            function (
                total,
                trade
            ) {

                return (
                    total +
                    Number(
                        trade.result ||
                        0
                    )
                );

            },
            0
        );


    const averageR =
        trades.length > 0
            ? netResult /
                trades.length
            : 0;


    const winRate =
        completedTrades > 0
            ? (
                wins /
                completedTrades
            ) * 100
            : 0;


    const filterButton =
        document.querySelector(
            `.journal-filter[data-filter="${activeJournalFilter}"]`
        );


    pdfReportPeriod.textContent =
        useAllTrades
            ? "All recorded trades"
            : filterButton
                ? filterButton.textContent
                : "All recorded trades";


    pdfGeneratedDate.textContent =
        new Date().toLocaleDateString(
            "en-GB",
            {
                day:
                    "2-digit",

                month:
                    "long",

                year:
                    "numeric"
            }
        );


    pdfTotalTrades.textContent =
        trades.length;


    pdfWinRate.textContent =
        `${winRate.toFixed(1)}%`;


    pdfNetResult.textContent =
        `${
            netResult > 0
                ? "+"
                : ""
        }${netResult.toFixed(2)}R`;


    pdfAverageR.textContent =
        `${
            averageR > 0
                ? "+"
                : ""
        }${averageR.toFixed(2)}R`;


    // --------------------------------------------------
    // TRADE HISTORY
    // --------------------------------------------------

    pdfTradeTableBody.innerHTML =
        "";


    trades.forEach(
        function (trade) {

            const row =
                document.createElement(
                    "tr"
                );


            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.textContent =
                trade.date || "—";


            const pairCell =
                document.createElement(
                    "td"
                );

            pairCell.textContent =
                trade.pair || "—";


            const directionCell =
                document.createElement(
                    "td"
                );

            directionCell.textContent =
                trade.direction || "—";


            const setupCell =
                document.createElement(
                    "td"
                );

            setupCell.textContent =
                trade.setup || "—";


            const outcomeCell =
                document.createElement(
                    "td"
                );

            outcomeCell.textContent =
                trade.outcome || "—";


            const resultCell =
                document.createElement(
                    "td"
                );


            const numericResult =
                Number(
                    trade.result || 0
                );


            resultCell.textContent =
                `${
                    numericResult > 0
                        ? "+"
                        : ""
                }${trade.result || 0}R`;


            row.appendChild(
                dateCell
            );

            row.appendChild(
                pairCell
            );

            row.appendChild(
                directionCell
            );

            row.appendChild(
                setupCell
            );

            row.appendChild(
                outcomeCell
            );

            row.appendChild(
                resultCell
            );


            pdfTradeTableBody.appendChild(
                row
            );

        }
    );


    // --------------------------------------------------
    // JOURNAL REFLECTIONS
    // --------------------------------------------------

    renderPdfReflections(
        trades
    );


    // --------------------------------------------------
    // PRINT
    // --------------------------------------------------

    window.print();

}


if (exportPdfButton) {

    exportPdfButton.addEventListener(
        "click",
        function () {

            exportJournalPdf(
                false
            );

        }
    );

}


// ======================================================
// JOURNAL REFLECTIONS
// ======================================================

function updateJournalReflections() {

    const trades =
        getFilteredTrades();


    const entriesElement =
        document.getElementById(
            "journal-reflection-entries"
        );

    const wordCountElement =
        document.getElementById(
            "journal-reflection-word-count"
        );

    const reflectionList =
        document.getElementById(
            "journal-reflection-list"
        );

    const emptyState =
        document.getElementById(
            "journal-reflection-empty"
        );


    if (
        !entriesElement ||
        !wordCountElement ||
        !reflectionList ||
        !emptyState
    ) {

        return;
    }


    const reflectionTrades =
        trades.filter(
            function (trade) {

                return (
                    typeof trade.notes ===
                        "string" &&
                    trade.notes.trim().length >
                        0
                );

            }
        );


    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    const totalWords =
        reflectionTrades.reduce(
            function (
                total,
                trade
            ) {

                return (
                    total +
                    trade.notes
                        .trim()
                        .split(/\s+/)
                        .filter(
                            function (word) {

                                return (
                                    word.length >
                                    0
                                );

                            }
                        )
                        .length
                );

            },
            0
        );


    entriesElement.textContent =
        reflectionTrades.length;


    wordCountElement.textContent =
        totalWords;


    // --------------------------------------------------
    // EMPTY STATE
    // --------------------------------------------------

    reflectionList.innerHTML =
        "";


    if (
        reflectionTrades.length ===
        0
    ) {

        emptyState.style.display =
            "block";

        return;
    }


    emptyState.style.display =
        "none";


    // --------------------------------------------------
    // RENDER REFLECTIONS
    // --------------------------------------------------

    reflectionTrades.forEach(
        function (trade) {

            const reflection =
                document.createElement(
                    "article"
                );


            reflection.className =
                "journal-reflection-item";


            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "journal-reflection-meta";


            const tradeInfo =
                document.createElement(
                    "div"
                );


            tradeInfo.className =
                "journal-reflection-trade";


            const pair =
                document.createElement(
                    "strong"
                );


            pair.textContent =
                trade.pair || "—";


            const direction =
                document.createElement(
                    "span"
                );


            direction.textContent =
                trade.direction || "—";


            const outcome =
                document.createElement(
                    "span"
                );


            outcome.textContent =
                trade.outcome || "—";


            tradeInfo.appendChild(
                pair
            );

            tradeInfo.appendChild(
                direction
            );

            tradeInfo.appendChild(
                outcome
            );


            const result =
                Number(
                    trade.result || 0
                );


            const resultElement =
                document.createElement(
                    "div"
                );


            resultElement.className =
                "journal-reflection-result " +
                (
                    result > 0
                        ? "profit"
                        : result < 0
                            ? "loss"
                            : "neutral"
                );


            resultElement.textContent =
                `${
                    result > 0
                        ? "+"
                        : ""
                }${trade.result || 0}R`;


            meta.appendChild(
                tradeInfo
            );

            meta.appendChild(
                resultElement
            );


            const details =
                document.createElement(
                    "div"
                );


            details.className =
                "journal-reflection-details";


            const date =
                document.createElement(
                    "span"
                );


            date.textContent =
                trade.date || "—";


            details.appendChild(
                date
            );


            if (trade.setup) {

                const setup =
                    document.createElement(
                        "span"
                    );


                setup.textContent =
                    trade.setup;


                details.appendChild(
                    setup
                );

            }


            const note =
                document.createElement(
                    "blockquote"
                );


            note.className =
                "journal-reflection-note";


            note.textContent =
                trade.notes.trim();


            reflection.appendChild(
                meta
            );

            reflection.appendChild(
                details
            );

            reflection.appendChild(
                note
            );


            reflectionList.appendChild(
                reflection
            );

        }
    );

}


// ======================================================
// INITIAL RENDER
// ======================================================

renderTrades();

updateJournalSummary();

updateJournalReflections();