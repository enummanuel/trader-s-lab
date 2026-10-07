/* ========================================
   PERFORMANCE PAGE
======================================== */

let activePerformancePeriod = "1M";


/* ========================================
   GET CURRENT USER
======================================== */

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


/* ========================================
   GET USER-SPECIFIC STORAGE KEY
======================================== */

function getTradesStorageKey() {

    const userId =
        getCurrentUserId();

    if (!userId) {
        return null;
    }

    return `tradersLabTrades_${userId}`;

}


/* ========================================
   GET TRADES
======================================== */

function getTrades() {

    const storageKey =
        getTradesStorageKey();

    if (!storageKey) {

        console.error(
            "No logged-in user found. Performance data cannot be loaded."
        );

        return [];

    }


    const storedTrades =
        localStorage.getItem(storageKey);


    if (!storedTrades) {
        return [];
    }


    try {

        return JSON.parse(storedTrades);

    } catch (error) {

        console.error(
            "Unable to read Traders Lab trades:",
            error
        );

        return [];

    }

}


/* ========================================
   NORMALIZE TRADES
======================================== */

function normalizeTrades(trades) {

    return trades.map((trade) => {

        return {
            ...trade,
            result: Number(trade.result) || 0
        };

    });

}


/* ========================================
   GET PERIOD START DATE
======================================== */

function getPeriodStartDate(period) {

    const today = new Date();

    switch (period) {

        case "1M":

            return new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                today.getDate()
            );


        case "3M":

            return new Date(
                today.getFullYear(),
                today.getMonth() - 3,
                today.getDate()
            );


        case "6M":

            return new Date(
                today.getFullYear(),
                today.getMonth() - 6,
                today.getDate()
            );


        case "1Y":

            return new Date(
                today.getFullYear() - 1,
                today.getMonth(),
                today.getDate()
            );


        case "ALL":

            return null;


        default:

            return new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                today.getDate()
            );

    }

}


/* ========================================
   FILTER TRADES BY PERIOD
======================================== */

function getFilteredTrades() {

    const trades =
        normalizeTrades(
            getTrades()
        );


    if (activePerformancePeriod === "ALL") {

        return trades;

    }


    const startDate =
        getPeriodStartDate(
            activePerformancePeriod
        );


    return trades.filter((trade) => {

        const tradeDate =
            new Date(trade.date);

        return !isNaN(tradeDate) &&
            tradeDate >= startDate;

    });

}


/* ========================================
   FORMAT R
======================================== */

function formatR(value) {

    const numericValue =
        Number(value || 0);


    const roundedValue =
        Number(
            numericValue.toFixed(2)
        );


    if (roundedValue > 0) {

        return `+${roundedValue}R`;

    }


    if (roundedValue < 0) {

        return `${roundedValue}R`;

    }


    return "0R";

}


/* ========================================
   FORMAT PERCENTAGE
======================================== */

function formatPercentage(value) {

    return `${Number(
        value.toFixed(1)
    )}%`;

}


/* ========================================
   UPDATE OVERVIEW
======================================== */

function updatePerformanceOverview() {

    const trades =
        getFilteredTrades();


    const totalTrades =
        trades.length;


    const winningTrades =
        trades.filter(
            (trade) => trade.result > 0
        ).length;


    const totalNetR =
        trades.reduce(
            (total, trade) =>
                total + trade.result,
            0
        );


    const winRate =
        totalTrades > 0
            ? (winningTrades / totalTrades) * 100
            : 0;


    const averageR =
        totalTrades > 0
            ? totalNetR / totalTrades
            : 0;


    /* Net Performance */

    const netPerformanceElement =
        document.getElementById(
            "performance-net-r"
        );


    if (netPerformanceElement) {

        netPerformanceElement.textContent =
            formatR(totalNetR);

    }


    /* Win Rate */

    const winRateElement =
        document.getElementById(
            "performance-win-rate"
        );


    if (winRateElement) {

        winRateElement.textContent =
            formatPercentage(winRate);

    }


    /* Average R */

    const averageRElement =
        document.getElementById(
            "performance-average-r"
        );


    if (averageRElement) {

        averageRElement.textContent =
            formatR(averageR);

    }


    /* Total Trades */

    const totalTradesElement =
        document.getElementById(
            "performance-total-trades"
        );


    if (totalTradesElement) {

        totalTradesElement.textContent =
            totalTrades;

    }

}


/* ========================================
   UPDATE PERIOD LABEL
======================================== */

function updatePeriodLabel() {

    const label =
        document.getElementById(
            "performance-chart-period"
        );


    if (!label) {
        return;
    }


    const labels = {

        "1M": "Last month",

        "3M": "Last 3 months",

        "6M": "Last 6 months",

        "1Y": "Last year",

        "ALL": "All time"

    };


    label.textContent =
        labels[activePerformancePeriod] ||
        "Last month";

}


/* ========================================
   EQUITY CURVE
======================================== */

function updateEquityCurve() {

    const chartContainer =
        document.getElementById(
            "performance-main-chart"
        );


    if (!chartContainer) {
        return;
    }


    const trades =
        getFilteredTrades()
            .filter((trade) => {

                return trade.date &&
                    !isNaN(
                        new Date(trade.date)
                    );

            })
            .sort((a, b) => {

                return new Date(a.date) -
                    new Date(b.date);

            });


    /* Empty state */

    if (trades.length === 0) {

        chartContainer.innerHTML = `

            <div class="performance-chart-empty">

                <span>
                    NO PERFORMANCE DATA
                </span>

                <p>
                    Your cumulative performance will appear here
                    as you record trades.
                </p>

            </div>

        `;

        return;

    }


    /* Build cumulative performance */

    let cumulativeR = 0;


    const points =
        trades.map((trade) => {

            cumulativeR +=
                trade.result;


            return {

                date:
                    new Date(trade.date),

                result:
                    trade.result,

                cumulativeR

            };

        });


    /* Find chart range */

    const values =
        points.map(
            (point) =>
                point.cumulativeR
        );


    const minValue =
        Math.min(
            0,
            ...values
        );


    const maxValue =
        Math.max(
            0,
            ...values
        );


    /* Prevent zero-height chart */

    const range =
        maxValue - minValue || 1;


    /* Chart dimensions */

    const width = 1000;

    const height = 320;

    const paddingLeft = 55;

    const paddingRight = 20;

    const paddingTop = 30;

    const paddingBottom = 45;


    const chartWidth =
        width -
        paddingLeft -
        paddingRight;


    const chartHeight =
        height -
        paddingTop -
        paddingBottom;


    /* Convert values into SVG coordinates */

    const getX = (index) => {

        if (points.length === 1) {

            return (
                paddingLeft +
                chartWidth / 2
            );

        }


        return (
            paddingLeft +
            (index / (points.length - 1)) *
            chartWidth
        );

    };


    const getY = (value) => {

        return (
            paddingTop +
            ((maxValue - value) / range) *
            chartHeight
        );

    };


    /* Create line points */

    const linePoints =
        points
            .map((point, index) => {

                return `${
                    getX(index)
                },${
                    getY(point.cumulativeR)
                }`;

            })
            .join(" ");


    /* Zero line */

    const zeroY =
        getY(0);


    /* Area points */

    const firstX =
        getX(0);


    const lastX =
        getX(points.length - 1);


    const areaPoints = `

        ${firstX},${zeroY}

        ${linePoints}

        ${lastX},${zeroY}

    `;


    /* Date labels */

    const firstDate =
        points[0].date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );


    const lastDate =
        points[
            points.length - 1
        ].date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );


    chartContainer.innerHTML = `

        <svg
            class="performance-equity-svg"
            viewBox="0 0 ${width} ${height}"
            preserveAspectRatio="none"
            role="img"
            aria-label="Cumulative trading performance"
        >

            <line
                class="performance-chart-zero"
                x1="${paddingLeft}"
                y1="${zeroY}"
                x2="${width - paddingRight}"
                y2="${zeroY}"
            />

            <polygon
                class="performance-chart-area"
                points="${areaPoints}"
            />

            <polyline
                class="performance-chart-line"
                points="${linePoints}"
            />

            <text
                class="performance-chart-value"
                x="${paddingLeft - 10}"
                y="${getY(maxValue) + 4}"
                text-anchor="end"
            >
                ${formatR(maxValue)}
            </text>

            <text
                class="performance-chart-value"
                x="${paddingLeft - 10}"
                y="${zeroY + 4}"
                text-anchor="end"
            >
                0R
            </text>

            <text
                class="performance-chart-value"
                x="${paddingLeft - 10}"
                y="${getY(minValue) + 4}"
                text-anchor="end"
            >
                ${formatR(minValue)}
            </text>

            <text
                class="performance-chart-date"
                x="${paddingLeft}"
                y="${height - 12}"
            >
                ${firstDate}
            </text>

            <text
                class="performance-chart-date"
                x="${width - paddingRight}"
                y="${height - 12}"
                text-anchor="end"
            >
                ${lastDate}
            </text>

        </svg>

    `;

}


/* ========================================
   TRADE ANALYSIS
======================================== */

function updateTradeAnalysis() {

    const trades =
        getFilteredTrades();


    const winningTrades =
        trades.filter(
            (trade) =>
                trade.result > 0
        );


    const losingTrades =
        trades.filter(
            (trade) =>
                trade.result < 0
        );


    /* Average winning R */

    const averageWinningR =
        winningTrades.length > 0

            ? winningTrades.reduce(
                (total, trade) =>
                    total + trade.result,
                0
            ) / winningTrades.length

            : 0;


    /* Average losing R */

    const averageLosingR =
        losingTrades.length > 0

            ? losingTrades.reduce(
                (total, trade) =>
                    total + trade.result,
                0
            ) / losingTrades.length

            : 0;


    /* Largest win */

    const largestWin =
        winningTrades.length > 0

            ? Math.max(
                ...winningTrades.map(
                    (trade) =>
                        trade.result
                )
            )

            : 0;


    /* Largest loss */

    const largestLoss =
        losingTrades.length > 0

            ? Math.min(
                ...losingTrades.map(
                    (trade) =>
                        trade.result
                )
            )

            : 0;


    /* Winning trades */

    const winningTradesElement =
        document.getElementById(
            "performance-winning-trades"
        );


    if (winningTradesElement) {

        winningTradesElement.textContent =
            winningTrades.length;

    }


    /* Losing trades */

    const losingTradesElement =
        document.getElementById(
            "performance-losing-trades"
        );


    if (losingTradesElement) {

        losingTradesElement.textContent =
            losingTrades.length;

    }


    /* Average winning R */

    const averageWinElement =
        document.getElementById(
            "performance-average-win"
        );


    if (averageWinElement) {

        averageWinElement.textContent =
            formatR(averageWinningR);

    }


    /* Average losing R */

    const averageLossElement =
        document.getElementById(
            "performance-average-loss"
        );


    if (averageLossElement) {

        averageLossElement.textContent =
            formatR(averageLosingR);

    }


    /* Largest win */

    const largestWinElement =
        document.getElementById(
            "performance-largest-win"
        );


    if (largestWinElement) {

        largestWinElement.textContent =
            formatR(largestWin);

    }


    /* Largest loss */

    const largestLossElement =
        document.getElementById(
            "performance-largest-loss"
        );


    if (largestLossElement) {

        largestLossElement.textContent =
            formatR(largestLoss);

    }

}


/* ========================================
   CONSISTENCY / TRADING RHYTHM
======================================== */

function updateConsistency() {

    const trades =
        getFilteredTrades();


    if (trades.length === 0) {

        document.getElementById(
            "performance-winning-days"
        ).textContent = "0";


        document.getElementById(
            "performance-losing-days"
        ).textContent = "0";


        document.getElementById(
            "performance-best-streak"
        ).textContent = "0 days";


        document.getElementById(
            "performance-worst-streak"
        ).textContent = "0 days";


        document.getElementById(
            "performance-average-trades-day"
        ).textContent = "0";


        return;

    }


    /* Group trades by date */

    const dailyResults = {};


    trades.forEach((trade) => {

        if (!trade.date) {
            return;
        }


        const date =
            new Date(trade.date);


        if (isNaN(date)) {
            return;
        }


        const dateKey =
            date.toISOString()
                .split("T")[0];


        if (!dailyResults[dateKey]) {

            dailyResults[dateKey] = {

                result: 0,

                trades: 0

            };

        }


        dailyResults[dateKey].result +=
            trade.result;


        dailyResults[dateKey].trades +=
            1;

    });


    const days =
        Object.values(
            dailyResults
        );


    /* Winning / losing days */

    const winningDays =
        days.filter(
            (day) =>
                day.result > 0
        ).length;


    const losingDays =
        days.filter(
            (day) =>
                day.result < 0
        ).length;


    /* Average trades per day */

    const totalTrades =
        days.reduce(
            (total, day) =>
                total + day.trades,
            0
        );


    const averageTradesPerDay =
        days.length > 0
            ? totalTrades / days.length
            : 0;


    /* Sort days chronologically */

    const sortedDays =
        Object.entries(
            dailyResults
        ).sort(
            ([dateA], [dateB]) => {

                return new Date(dateA) -
                    new Date(dateB);

            }
        );


    /* Calculate winning / losing streaks */

    let currentWinningStreak = 0;

    let currentLosingStreak = 0;

    let bestWinningStreak = 0;

    let worstLosingStreak = 0;


    sortedDays.forEach(
        ([, day]) => {

            if (day.result > 0) {

                currentWinningStreak += 1;

                currentLosingStreak = 0;


                bestWinningStreak =
                    Math.max(
                        bestWinningStreak,
                        currentWinningStreak
                    );

            }

            else if (day.result < 0) {

                currentLosingStreak += 1;

                currentWinningStreak = 0;


                worstLosingStreak =
                    Math.max(
                        worstLosingStreak,
                        currentLosingStreak
                    );

            }

            else {

                currentWinningStreak = 0;

                currentLosingStreak = 0;

            }

        }
    );


    /* Update UI */

    document.getElementById(
        "performance-winning-days"
    ).textContent =
        winningDays;


    document.getElementById(
        "performance-losing-days"
    ).textContent =
        losingDays;


    document.getElementById(
        "performance-best-streak"
    ).textContent =
        `${bestWinningStreak} days`;


    document.getElementById(
        "performance-worst-streak"
    ).textContent =
        `${worstLosingStreak} days`;


    document.getElementById(
        "performance-average-trades-day"
    ).textContent =
        averageTradesPerDay.toFixed(1);

}


/* ========================================
   PAIR PERFORMANCE
======================================== */

function updatePairPerformance() {

    const trades =
        getFilteredTrades();


    const pairData = {};


    trades.forEach((trade) => {

        const pair =
            trade.pair?.trim();


        if (!pair) {
            return;
        }


        if (!pairData[pair]) {

            pairData[pair] = {

                trades: 0,

                wins: 0,

                netR: 0

            };

        }


        pairData[pair].trades += 1;

        pairData[pair].netR +=
            trade.result;


        if (trade.result > 0) {

            pairData[pair].wins += 1;

        }

    });


    const pairs =
        Object.entries(pairData)
            .map(([pair, data]) => {

                const winRate =
                    data.trades > 0

                        ? (
                            data.wins /
                            data.trades
                        ) * 100

                        : 0;


                const averageR =
                    data.trades > 0

                        ? data.netR /
                            data.trades

                        : 0;


                return {

                    pair,

                    trades:
                        data.trades,

                    winRate,

                    netR:
                        data.netR,

                    averageR

                };

            })
            .sort(
                (a, b) =>
                    b.netR - a.netR
            );


    const container =
        document.getElementById(
            "performance-pair-list"
        );


    if (!container) {
        return;
    }


    if (pairs.length === 0) {

        container.innerHTML = `

            <div class="performance-empty-row">

                No pair performance available yet.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="performance-pair-header">

            <span>PAIR</span>

            <span>TRADES</span>

            <span>WIN RATE</span>

            <span>NET R</span>

            <span>AVERAGE R</span>

        </div>


        ${pairs.map((item) => {

            return `

                <div class="performance-pair-row">

                    <strong>
                        ${item.pair}
                    </strong>

                    <span>
                        ${item.trades}
                    </span>

                    <span>
                        ${formatPercentage(
                            item.winRate
                        )}
                    </span>

                    <strong>
                        ${formatR(
                            item.netR
                        )}
                    </strong>

                    <span>
                        ${formatR(
                            item.averageR
                        )}
                    </span>

                </div>

            `;

        }).join("")}

    `;

}


/* ========================================
   SETUP PERFORMANCE
======================================== */

function updateSetupPerformance() {

    const trades =
        getFilteredTrades();


    const setupData = {};


    trades.forEach((trade) => {

        const setup =
            trade.setup?.trim();


        if (!setup) {
            return;
        }


        if (!setupData[setup]) {

            setupData[setup] = {

                trades: 0,

                wins: 0,

                netR: 0

            };

        }


        setupData[setup].trades += 1;

        setupData[setup].netR +=
            trade.result;


        if (trade.result > 0) {

            setupData[setup].wins += 1;

        }

    });


    const setups =
        Object.entries(setupData)
            .map(([setup, data]) => {

                const winRate =
                    data.trades > 0

                        ? (
                            data.wins /
                            data.trades
                        ) * 100

                        : 0;


                const averageR =
                    data.trades > 0

                        ? data.netR /
                            data.trades

                        : 0;


                return {

                    setup,

                    trades:
                        data.trades,

                    winRate,

                    netR:
                        data.netR,

                    averageR

                };

            })
            .sort(
                (a, b) =>
                    b.netR - a.netR
            );


    const container =
        document.getElementById(
            "performance-setup-list"
        );


    if (!container) {
        return;
    }


    if (setups.length === 0) {

        container.innerHTML = `

            <div class="performance-empty-row">

                No setup performance available yet.

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="performance-setup-header">

            <span>SETUP</span>

            <span>TRADES</span>

            <span>WIN RATE</span>

            <span>NET R</span>

            <span>AVERAGE R</span>

        </div>


        ${setups.map((item) => {

            return `

                <div class="performance-setup-row">

                    <strong>
                        ${item.setup}
                    </strong>

                    <span>
                        ${item.trades}
                    </span>

                    <span>
                        ${formatPercentage(
                            item.winRate
                        )}
                    </span>

                    <strong>
                        ${formatR(
                            item.netR
                        )}
                    </strong>

                    <span>
                        ${formatR(
                            item.averageR
                        )}
                    </span>

                </div>

            `;

        }).join("")}

    `;

}


/* ========================================
   PERIOD SELECTOR
======================================== */

function setupPeriodSelector() {

    const buttons =
        document.querySelectorAll(
            ".performance-period-button"
        );


    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const selectedPeriod =
                    button.dataset.period;


                activePerformancePeriod =
                    selectedPeriod;


                /* Update active button */

                buttons.forEach((item) => {

                    item.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                /* Refresh performance */

                updatePerformanceOverview();

                updatePeriodLabel();

                updateEquityCurve();

                updateTradeAnalysis();

                updateConsistency();

                updatePairPerformance();

                updateSetupPerformance();

            }
        );

    });

}


/* ========================================
   INITIALIZE PERFORMANCE PAGE
======================================== */

function initPerformancePage() {

    updatePerformanceOverview();

    updatePeriodLabel();

    updateEquityCurve();

    updateTradeAnalysis();

    updateConsistency();

    updatePairPerformance();

    updateSetupPerformance();

    setupPeriodSelector();

}


initPerformancePage();