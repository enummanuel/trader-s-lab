const TRADES_STORAGE_KEY = "tradersLabTrades";

function getTradesForPdf() {
    const storedTrades = localStorage.getItem(TRADES_STORAGE_KEY);

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

function exportJournalPdf(trades, reportPeriod = "All recorded trades") {
    if (!trades || trades.length === 0) {
        alert("There are no trades to include in the PDF report.");
        return;
    }

    const pdfTotalTrades = document.getElementById("pdf-total-trades");
    const pdfWinRate = document.getElementById("pdf-win-rate");
    const pdfNetResult = document.getElementById("pdf-net-result");
    const pdfAverageR = document.getElementById("pdf-average-r");
    const pdfTradeTableBody = document.getElementById("pdf-trade-table-body");
    const pdfReportPeriod = document.getElementById("pdf-report-period");
    const pdfGeneratedDate = document.getElementById("pdf-report-generated-date");

    if (
        !pdfTotalTrades ||
        !pdfWinRate ||
        !pdfNetResult ||
        !pdfAverageR ||
        !pdfTradeTableBody ||
        !pdfReportPeriod ||
        !pdfGeneratedDate
    ) {
        console.error("PDF report elements are missing.");
        return;
    }

    const wins = trades.filter(function (trade) {
        return trade.outcome === "WIN";
    }).length;

    const losses = trades.filter(function (trade) {
        return trade.outcome === "LOSS";
    }).length;

    const completedTrades = wins + losses;

    const netResult = trades.reduce(function (total, trade) {
        return total + Number(trade.result || 0);
    }, 0);

    const averageR = trades.length > 0
        ? netResult / trades.length
        : 0;

    const winRate = completedTrades > 0
        ? (wins / completedTrades) * 100
        : 0;

    pdfReportPeriod.textContent = reportPeriod;

    pdfGeneratedDate.textContent = new Date().toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

    pdfTotalTrades.textContent = trades.length;

    pdfWinRate.textContent = `${winRate.toFixed(1)}%`;

    pdfNetResult.textContent =
        `${netResult > 0 ? "+" : ""}${netResult.toFixed(2)}R`;

    pdfAverageR.textContent =
        `${averageR > 0 ? "+" : ""}${averageR.toFixed(2)}R`;

    pdfTradeTableBody.innerHTML = "";

    trades.forEach(function (trade) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${trade.date || "—"}</td>
            <td>${trade.pair || "—"}</td>
            <td>${trade.direction || "—"}</td>
            <td>${trade.setup || "—"}</td>
            <td>${trade.outcome || "—"}</td>
            <td>
                ${Number(trade.result || 0) > 0 ? "+" : ""}
                ${trade.result || 0}R
            </td>
        `;

        pdfTradeTableBody.appendChild(row);
    });

    window.print();
}