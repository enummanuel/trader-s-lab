function getCurrentUserId() {
    const session = JSON.parse(
        localStorage.getItem("tradersLabSession")
    );

    if (!session || !session.userId) {
        return null;
    }

    return session.userId;
}


function getTradesForPdf() {
    const userId = getCurrentUserId();

    if (!userId) {
        return [];
    }

    const userStorageKey = `tradersLabTrades_${userId}`;

    const storedTrades = localStorage.getItem(userStorageKey);

    if (!storedTrades) {
        return [];
    }

    try {
        return JSON.parse(storedTrades);
    } catch (error) {
        console.error("Unable to read trades for PDF:", error);
        return [];
    }
}


/* --------------------------------------------------
   PDF REFLECTION STYLES
-------------------------------------------------- */

function ensurePdfReflectionStyles() {

    if (document.getElementById("settings-pdf-reflection-styles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "settings-pdf-reflection-styles";

    style.textContent = `
        .pdf-journal-reflections {
            margin-top: 32px;
        }

        .pdf-reflection-list {
            display: flex;
            flex-direction: column;
            gap: 18px;
            margin-top: 18px;
        }

        .pdf-reflection-item {
            padding: 18px;
            border: 1px solid #dcdcdc;
            border-radius: 10px;
            background: #fafafa;
            page-break-inside: avoid;
        }

        .pdf-reflection-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px 18px;
            margin-bottom: 10px;
            font-size: 11px;
            color: #666;
        }

        .pdf-reflection-meta strong {
            color: #222;
        }

        .pdf-reflection-setup {
            margin-bottom: 12px;
            font-size: 11px;
            color: #555;
        }

        .pdf-reflection-note {
            margin: 0;
            padding: 14px 16px;
            border-left: 3px solid #222;
            background: #fff;
            font-size: 12px;
            line-height: 1.7;
            white-space: pre-wrap;
            color: #222;
        }

        .pdf-reflection-empty {
            padding: 18px;
            border: 1px solid #ddd;
            border-radius: 10px;
            color: #666;
            font-size: 12px;
            background: #fafafa;
        }

        @media print {
            .pdf-journal-reflections {
                page-break-before: auto;
            }

            .pdf-reflection-item {
                break-inside: avoid;
            }
        }
    `;

    document.head.appendChild(style);
}


/* --------------------------------------------------
   PDF REFLECTION SECTION
-------------------------------------------------- */

function ensurePdfReflectionsSection() {

    const pdfReport = document.getElementById("journal-pdf-report");

    if (!pdfReport) {
        console.error("PDF report container is missing.");
        return null;
    }

    let reflectionSection =
        pdfReport.querySelector(".pdf-journal-reflections");

    if (reflectionSection) {
        return reflectionSection;
    }

    reflectionSection = document.createElement("div");

    reflectionSection.className =
        "pdf-report-section pdf-journal-reflections";

    const sectionHeading = document.createElement("div");

    sectionHeading.className = "pdf-section-heading";

    const sectionNumber = document.createElement("span");

    sectionNumber.textContent = "02";

    const sectionTitle = document.createElement("h2");

    sectionTitle.textContent = "Journal Reflections";

    sectionHeading.appendChild(sectionNumber);
    sectionHeading.appendChild(sectionTitle);

    const reflectionList = document.createElement("div");

    reflectionList.className = "pdf-reflection-list";

    reflectionSection.appendChild(sectionHeading);
    reflectionSection.appendChild(reflectionList);

    const pdfFooter =
        pdfReport.querySelector(".pdf-report-footer");

    if (pdfFooter) {
        pdfReport.insertBefore(
            reflectionSection,
            pdfFooter
        );
    } else {
        pdfReport.appendChild(reflectionSection);
    }

    return reflectionSection;
}


/* --------------------------------------------------
   RENDER PDF REFLECTIONS
-------------------------------------------------- */

function renderPdfReflections(trades) {

    ensurePdfReflectionStyles();

    const reflectionSection =
        ensurePdfReflectionsSection();

    if (!reflectionSection) {
        return;
    }

    const reflectionList =
        reflectionSection.querySelector(".pdf-reflection-list");

    if (!reflectionList) {
        return;
    }

    reflectionList.innerHTML = "";

    const reflectionTrades = trades.filter(function (trade) {
        return (
            trade.notes &&
            String(trade.notes).trim() !== ""
        );
    });

    if (reflectionTrades.length === 0) {

        const emptyMessage =
            document.createElement("div");

        emptyMessage.className =
            "pdf-reflection-empty";

        emptyMessage.textContent =
            "No written journal reflections were recorded for this report period.";

        reflectionList.appendChild(emptyMessage);

        return;
    }


    reflectionTrades.forEach(function (trade) {

        const reflectionItem =
            document.createElement("article");

        reflectionItem.className =
            "pdf-reflection-item";


        /* META */

        const meta =
            document.createElement("div");

        meta.className =
            "pdf-reflection-meta";


        const date =
            document.createElement("span");

        date.innerHTML =
            `<strong>Date:</strong> `;

        const dateValue =
            document.createTextNode(
                trade.date || "—"
            );

        date.appendChild(dateValue);


        const pair =
            document.createElement("span");

        pair.innerHTML =
            `<strong>Pair:</strong> `;

        pair.appendChild(
            document.createTextNode(
                trade.pair || "—"
            )
        );


        const direction =
            document.createElement("span");

        direction.innerHTML =
            `<strong>Direction:</strong> `;

        direction.appendChild(
            document.createTextNode(
                trade.direction || "—"
            )
        );


        const outcome =
            document.createElement("span");

        outcome.innerHTML =
            `<strong>Outcome:</strong> `;

        outcome.appendChild(
            document.createTextNode(
                trade.outcome || "—"
            )
        );


        const result =
            document.createElement("span");

        result.innerHTML =
            `<strong>Result:</strong> `;

        const numericResult =
            Number(trade.result || 0);

        result.appendChild(
            document.createTextNode(
                `${numericResult > 0 ? "+" : ""}${numericResult}R`
            )
        );


        meta.appendChild(date);
        meta.appendChild(pair);
        meta.appendChild(direction);
        meta.appendChild(outcome);
        meta.appendChild(result);


        /* SETUP */

        if (trade.setup) {

            const setup =
                document.createElement("div");

            setup.className =
                "pdf-reflection-setup";

            const setupLabel =
                document.createElement("strong");

            setupLabel.textContent =
                "Setup: ";

            setup.appendChild(setupLabel);

            setup.appendChild(
                document.createTextNode(
                    trade.setup
                )
            );

            reflectionItem.appendChild(setup);
        }


        /* NOTE */

        const note =
            document.createElement("p");

        note.className =
            "pdf-reflection-note";

        /*
         * textContent is intentional here.
         * It prevents journal notes containing HTML
         * from being interpreted as actual HTML.
         */

        note.textContent =
            String(trade.notes).trim();


        reflectionItem.appendChild(meta);

        /*
         * If setup exists, it was already appended.
         * The note comes last.
         */

        reflectionItem.appendChild(note);

        reflectionList.appendChild(
            reflectionItem
        );
    });
}


/* --------------------------------------------------
   EXPORT JOURNAL PDF
-------------------------------------------------- */

function exportJournalPdf(
    trades,
    reportPeriod = "All recorded trades"
) {

    if (!trades || trades.length === 0) {
        alert(
            "There are no trades to include in the PDF report."
        );

        return;
    }


    const pdfTotalTrades =
        document.getElementById("pdf-total-trades");

    const pdfWinRate =
        document.getElementById("pdf-win-rate");

    const pdfNetResult =
        document.getElementById("pdf-net-result");

    const pdfAverageR =
        document.getElementById("pdf-average-r");

    const pdfTradeTableBody =
        document.getElementById("pdf-trade-table-body");

    const pdfReportPeriod =
        document.getElementById("pdf-report-period");

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


    /* --------------------------------------------------
       CALCULATE SUMMARY
    -------------------------------------------------- */

    const wins =
        trades.filter(function (trade) {
            return trade.outcome === "WIN";
        }).length;


    const losses =
        trades.filter(function (trade) {
            return trade.outcome === "LOSS";
        }).length;


    const completedTrades =
        wins + losses;


    const netResult =
        trades.reduce(function (total, trade) {

            return (
                total +
                Number(trade.result || 0)
            );

        }, 0);


    const averageR =
        trades.length > 0
            ? netResult / trades.length
            : 0;


    const winRate =
        completedTrades > 0
            ? (wins / completedTrades) * 100
            : 0;


    /* --------------------------------------------------
       REPORT HEADER
    -------------------------------------------------- */

    pdfReportPeriod.textContent =
        reportPeriod;


    pdfGeneratedDate.textContent =
        new Date().toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    /* --------------------------------------------------
       REPORT SUMMARY
    -------------------------------------------------- */

    pdfTotalTrades.textContent =
        trades.length;


    pdfWinRate.textContent =
        `${winRate.toFixed(1)}%`;


    pdfNetResult.textContent =
        `${netResult > 0 ? "+" : ""}${netResult.toFixed(2)}R`;


    pdfAverageR.textContent =
        `${averageR > 0 ? "+" : ""}${averageR.toFixed(2)}R`;


    /* --------------------------------------------------
       TRADE HISTORY
    -------------------------------------------------- */

    pdfTradeTableBody.innerHTML = "";


    trades.forEach(function (trade) {

        const row =
            document.createElement("tr");


        const dateCell =
            document.createElement("td");

        dateCell.textContent =
            trade.date || "—";


        const pairCell =
            document.createElement("td");

        pairCell.textContent =
            trade.pair || "—";


        const directionCell =
            document.createElement("td");

        directionCell.textContent =
            trade.direction || "—";


        const setupCell =
            document.createElement("td");

        setupCell.textContent =
            trade.setup || "—";


        const outcomeCell =
            document.createElement("td");

        outcomeCell.textContent =
            trade.outcome || "—";


        const resultCell =
            document.createElement("td");

        const numericResult =
            Number(trade.result || 0);

        resultCell.textContent =
            `${numericResult > 0 ? "+" : ""}${numericResult}R`;


        row.appendChild(dateCell);
        row.appendChild(pairCell);
        row.appendChild(directionCell);
        row.appendChild(setupCell);
        row.appendChild(outcomeCell);
        row.appendChild(resultCell);


        pdfTradeTableBody.appendChild(row);
    });


    /* --------------------------------------------------
       JOURNAL REFLECTIONS
    -------------------------------------------------- */

    renderPdfReflections(trades);


    /* --------------------------------------------------
       PRINT
    -------------------------------------------------- */

    window.print();
}