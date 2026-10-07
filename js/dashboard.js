// ========================================
// TRADERS LAB — DASHBOARD DATA
// ========================================


// ========================================
// 1. SOURCE DATA
// ========================================

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

        console.error(
            "No logged-in user found. Dashboard cannot load trades."
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


const trades = getTrades().map((trade) => {

    return {
        ...trade,
        result: Number(trade.result) || 0
    };

});


// ========================================
// 2. TRADE CALCULATIONS
// ========================================

const totalTrades = trades.length;

const winningTrades = trades.filter((trade) => {
    return trade.result > 0;
}).length;

const losingTrades = trades.filter((trade) => {
    return trade.result < 0;
}).length;

const breakevenTrades = trades.filter((trade) => {
    return trade.result === 0;
}).length;


const totalNetR = trades.reduce((total, trade) => {
    return total + trade.result;
}, 0);


const winRate = totalTrades > 0
    ? (winningTrades / totalTrades) * 100
    : 0;


const averageR = totalTrades > 0
    ? totalNetR / totalTrades
    : 0;


// ========================================
// 3. FORMATTERS
// ========================================

function formatR(value) {

    const numericValue = Number(value || 0);

    const roundedValue =
        Number(numericValue.toFixed(2));

    if (roundedValue > 0) {
        return `+${roundedValue}R`;
    }

    if (roundedValue < 0) {
        return `${roundedValue}R`;
    }

    return "0R";
}


function formatPercentage(value) {
    return `${Number(value.toFixed(1))}%`;
}


// ========================================
// 4. CHRONOLOGICAL PERFORMANCE
// ========================================

const chronologicalTrades = [...trades].sort((a, b) => {

    return new Date(
        `${a.date}T${a.time}`
    ) - new Date(
        `${b.date}T${b.time}`
    );

});


const cumulativePerformance = [];

let runningR = 0;


chronologicalTrades.forEach((trade) => {

    runningR += Number(trade.result || 0);

    cumulativePerformance.push({

        date: trade.date,

        value: Number(
            runningR.toFixed(2)
        )

    });

});


// ========================================
// 5. UPDATE MAIN PERFORMANCE
// ========================================

const netPerformanceElement =
    document.getElementById("net-performance");


if (netPerformanceElement) {

    netPerformanceElement.textContent =
        formatR(totalNetR);

}


// ========================================
// 6. UPDATE METRIC CARDS
// ========================================

const winRateElement =
    document.getElementById("dashboard-win-rate");

const averageRElement =
    document.getElementById("dashboard-average-r");

const totalTradesElement =
    document.getElementById("dashboard-total-trades");

const tradeBreakdownElement =
    document.getElementById("dashboard-trade-breakdown");


if (winRateElement) {

    winRateElement.textContent =
        formatPercentage(winRate);

}


if (averageRElement) {

    averageRElement.textContent =
        formatR(averageR);

}


if (totalTradesElement) {

    totalTradesElement.textContent =
        totalTrades;

}


if (tradeBreakdownElement) {

    tradeBreakdownElement.textContent =
        `${winningTrades}W · ${losingTrades}L`;

}


// ========================================
// 7. UPDATE RECENT TRADES
// ========================================

const tradeList =
    document.querySelector(".trade-list");


function getPairShortName(pair) {

    const pairNames = {

        GBPJPY: "GJ",

        GBPUSD: "GU",

        EURUSD: "EU",

        XAUUSD: "XAU",

        BTCUSD: "BTC"

    };

    return pairNames[pair] || pair;

}


function formatTradeDate(date, time) {

    const tradeDate =
        new Date(`${date}T${time}`);

    return tradeDate.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    ) + ` · ${time}`;

}


if (tradeList) {

    const recentTrades =
        [...trades]
            .sort((a, b) => {

                return new Date(
                    `${b.date}T${b.time}`
                ) - new Date(
                    `${a.date}T${a.time}`
                );

            })
            .slice(0, 5);


    tradeList.innerHTML =
        recentTrades.map((trade) => {

            const resultClass =
                trade.result > 0
                    ? "positive"
                    : trade.result < 0
                        ? "negative"
                        : "neutral";


            const directionClass =
                trade.direction.toLowerCase();


            return `

                <div class="trade-row">

                    <div class="trade-symbol">

                        <div class="trade-pair">
                            ${getPairShortName(trade.pair)}
                        </div>

                        <span>
                            ${trade.pair}
                        </span>

                    </div>


                    <div class="trade-direction ${directionClass}">
                        ${trade.direction}
                    </div>


                    <div class="trade-setup">

                        <span>
                            ${trade.setup}
                        </span>

                        <small>
                            ${formatTradeDate(
                                trade.date,
                                trade.time
                            )}
                        </small>

                    </div>


                    <div class="trade-result ${resultClass}">
                        ${formatR(trade.result)}
                    </div>

                </div>

            `;

        }).join("");

}


// ========================================
// 8. PAIR PERFORMANCE
// ========================================

const pairList =
    document.querySelector(".pair-list");


const pairData = {};


trades.forEach((trade) => {

    if (!pairData[trade.pair]) {

        pairData[trade.pair] = {

            trades: 0,
            wins: 0,
            losses: 0,
            netR: 0

        };

    }


    pairData[trade.pair].trades += 1;

    pairData[trade.pair].netR +=
        trade.result;


    if (trade.result > 0) {

        pairData[trade.pair].wins += 1;

    }


    if (trade.result < 0) {

        pairData[trade.pair].losses += 1;

    }

});


const pairPerformance =
    Object.entries(pairData)
        .map(([pair, data]) => {

            const pairWinRate =
                data.trades > 0
                    ? (data.wins / data.trades) * 100
                    : 0;


            return {

                pair,

                trades: data.trades,

                wins: data.wins,

                losses: data.losses,

                netR: data.netR,

                winRate: pairWinRate

            };

        })
        .sort((a, b) => {

            return b.netR - a.netR;

        });


if (pairList) {

    const maximumNetR =
        Math.max(
            ...pairPerformance.map(
                (pair) => Math.abs(pair.netR)
            ),
            1
        );


    pairList.innerHTML =
        pairPerformance.map((pair) => {

            const resultClass =
                pair.netR >= 0
                    ? "positive"
                    : "negative";


            const fillClass =
                pair.netR >= 0
                    ? "positive-fill"
                    : "negative-fill";


            const barWidth =
                (Math.abs(pair.netR) / maximumNetR) * 100;


            return `

                <div class="pair-item">

                    <div class="pair-info">

                        <div>

                            <strong>
                                ${pair.pair}
                            </strong>

                            <span>
                                ${pair.trades} trades ·
                                ${formatPercentage(pair.winRate)}
                                win rate
                            </span>

                        </div>


                        <strong class="pair-result ${resultClass}">
                            ${formatR(pair.netR)}
                        </strong>

                    </div>


                    <div class="pair-bar">

                        <span
                            class="pair-bar-fill ${fillClass}"
                            style="width: ${barWidth}%"
                        ></span>

                    </div>

                </div>

            `;

        }).join("");

}


// ========================================
// 9. PERFORMANCE PERIOD
// ========================================

let activePerformancePeriod = "1M";


const performancePeriodButtons =
    document.querySelectorAll(
        ".performance-period [data-period]"
    );


const performanceNetElement =
    document.getElementById(
        "net-performance"
    );


const performanceChangeValue =
    document.getElementById(
        "performance-change-value"
    );


const performanceChangeLabel =
    document.getElementById(
        "performance-change-label"
    );


const performancePeriodLabel =
    document.getElementById(
        "dashboard-period-label"
    );


const performanceWinRateElement =
    document.getElementById(
        "dashboard-win-rate"
    );


const performanceAverageRElement =
    document.getElementById(
        "dashboard-average-r"
    );


const performanceTotalTradesElement =
    document.getElementById(
        "dashboard-total-trades"
    );


const performanceTradeBreakdownElement =
    document.getElementById(
        "dashboard-trade-breakdown"
    );


// ----------------------------------------
// GET PERIOD START DATE
// ----------------------------------------

function getPeriodStartDate(period) {

    const today =
        new Date();

    const startDate =
        new Date(today);

    if (period === "1M") {

        startDate.setMonth(
            startDate.getMonth() - 1
        );

    }

    if (period === "3M") {

        startDate.setMonth(
            startDate.getMonth() - 3
        );

    }

    if (period === "6M") {

        startDate.setMonth(
            startDate.getMonth() - 6
        );

    }

    if (period === "1Y") {

        startDate.setFullYear(
            startDate.getFullYear() - 1
        );

    }

    return startDate;

}


// ----------------------------------------
// FILTER TRADES
// ----------------------------------------

function getPerformanceTrades(period) {

    if (period === "ALL") {

        return [...trades];

    }

    const startDate =
        getPeriodStartDate(period);

    return trades.filter((trade) => {

        const tradeDate =
            new Date(
                `${trade.date}T${trade.time || "00:00"}`
            );

        return tradeDate >= startDate;

    });

}


// ----------------------------------------
// PREVIOUS PERIOD
// ----------------------------------------

function getPreviousPeriodTrades(period) {

    if (period === "ALL") {

        return [];

    }

    const today =
        new Date();

    const currentStart =
        getPeriodStartDate(period);

    const periodLength =
        today.getTime() -
        currentStart.getTime();

    const previousStart =
        new Date(
            currentStart.getTime() -
            periodLength
        );

    return trades.filter((trade) => {

        const tradeDate =
            new Date(
                `${trade.date}T${trade.time || "00:00"}`
            );

        return (
            tradeDate >= previousStart &&
            tradeDate < currentStart
        );

    });

}


// ----------------------------------------
// CALCULATE PERIOD DATA
// ----------------------------------------

function calculatePerformanceData(periodTrades) {

    const total =
        periodTrades.length;


    const wins =
        periodTrades.filter(
            (trade) => trade.result > 0
        ).length;


    const losses =
        periodTrades.filter(
            (trade) => trade.result < 0
        ).length;


    const netR =
        periodTrades.reduce(
            (total, trade) => {

                return total + trade.result;

            },
            0
        );


    const average =
        total > 0
            ? netR / total
            : 0;


    const completedTrades =
        wins + losses;


    const periodWinRate =
        completedTrades > 0
            ? (wins / completedTrades) * 100
            : 0;


    return {

        total,

        wins,

        losses,

        netR,

        average,

        winRate: periodWinRate

    };

}


// ----------------------------------------
// UPDATE PERFORMANCE HERO
// ----------------------------------------

function updatePerformancePeriod(period) {

    const periodTrades =
        getPerformanceTrades(period);


    const previousTrades =
        getPreviousPeriodTrades(period);


    const currentData =
        calculatePerformanceData(
            periodTrades
        );


    const previousData =
        calculatePerformanceData(
            previousTrades
        );


    // ------------------------------------
    // Main net performance
    // ------------------------------------

    if (performanceNetElement) {

        performanceNetElement.textContent =
            formatR(currentData.netR);

    }


    // ------------------------------------
    // Metrics
    // ------------------------------------

    if (performanceWinRateElement) {

        performanceWinRateElement.textContent =
            formatPercentage(
                currentData.winRate
            );

    }


    if (performanceAverageRElement) {

        performanceAverageRElement.textContent =
            formatR(
                currentData.average
            );

    }


    if (performanceTotalTradesElement) {

        performanceTotalTradesElement.textContent =
            currentData.total;

    }


    if (performanceTradeBreakdownElement) {

        performanceTradeBreakdownElement.textContent =
            `${currentData.wins}W · ${currentData.losses}L`;

    }


    // ------------------------------------
    // Period comparison
    // ------------------------------------

    if (previousTrades.length === 0) {

        if (performanceChangeValue) {

            performanceChangeValue.textContent =
                "—";

        }

        if (performanceChangeLabel) {

            performanceChangeLabel.textContent =
                "no previous period data";

        }

    } else {

        const previousNet =
            previousData.netR;


        if (previousNet === 0) {

            if (performanceChangeValue) {

                performanceChangeValue.textContent =
                    "—";

            }

        } else {

            const percentageChange =
                (
                    (
                        currentData.netR -
                        previousNet
                    ) /
                    Math.abs(previousNet)
                ) * 100;


            if (performanceChangeValue) {

                performanceChangeValue.textContent =
                    `${
                        percentageChange > 0
                            ? "+"
                            : ""
                    }${percentageChange.toFixed(1)}%`;

            }

        }


        if (performanceChangeLabel) {

            performanceChangeLabel.textContent =
                "vs. previous period";

        }

    }


    // ------------------------------------
    // Render chart
    // ------------------------------------

    renderPerformanceChart(
        periodTrades
    );

}


// ========================================
// PERFORMANCE CHART
// ========================================

function renderPerformanceChart(periodTrades) {

    const chartLine =
        document.querySelector(
            ".chart-line"
        );


    const chartArea =
        document.querySelector(
            ".chart-area"
        );


    const chartPoint =
        document.querySelector(
            ".chart-point"
        );


    if (
        !chartLine ||
        !chartArea ||
        !chartPoint
    ) {

        return;

    }


    if (periodTrades.length === 0) {

        chartLine.setAttribute(
            "d",
            ""
        );

        chartArea.setAttribute(
            "d",
            ""
        );

        chartPoint.setAttribute(
            "cx",
            "0"
        );

        chartPoint.setAttribute(
            "cy",
            "0"
        );

        return;

    }


    const chronologicalPeriodTrades =
        [...periodTrades].sort((a, b) => {

            return new Date(
                `${a.date}T${a.time || "00:00"}`
            ) - new Date(
                `${b.date}T${b.time || "00:00"}`
            );

        });


    const chartData = [];

    let runningR = 0;


    chronologicalPeriodTrades.forEach(
        (trade) => {

            runningR +=
                trade.result;

            chartData.push({
                value: Number(
                    runningR.toFixed(2)
                )
            });

        }
    );


    const chartWidth = 700;

    const chartHeight = 220;

    const chartPadding = 20;


    const values =
        chartData.map(
            (item) => item.value
        );


    const minValue =
        Math.min(...values, 0);


    const maxValue =
        Math.max(...values, 0);


    const valueRange =
        maxValue - minValue || 1;


    const points =
        chartData.map(
            (item, index) => {

                const x =
                    chartData.length === 1
                        ? chartWidth / 2
                        : (
                            index /
                            (chartData.length - 1)
                        ) * chartWidth;


                const y =
                    chartHeight -
                    (
                        (
                            item.value -
                            minValue
                        ) /
                        valueRange
                    ) *
                    (
                        chartHeight -
                        chartPadding * 2
                    ) -
                    chartPadding;


                return {
                    x,
                    y
                };

            }
        );


    const linePath =
        points.map(
            (point, index) => {

                return `${
                    index === 0
                        ? "M"
                        : "L"
                }${point.x} ${point.y}`;

            }
        ).join(" ");


    const areaPath =
        linePath +
        ` L${chartWidth} ${chartHeight}` +
        ` L0 ${chartHeight} Z`;


    chartLine.setAttribute(
        "d",
        linePath
    );


    chartArea.setAttribute(
        "d",
        areaPath
    );


    const lastPoint =
        points[points.length - 1];


    chartPoint.setAttribute(
        "cx",
        lastPoint.x
    );


    chartPoint.setAttribute(
        "cy",
        lastPoint.y

    );

}


// ----------------------------------------
// PERIOD LABEL
// ----------------------------------------

function updatePerformancePeriodLabel(period) {

    if (!performancePeriodLabel) {

        return;

    }


    if (period === "ALL") {

        performancePeriodLabel.textContent =
            "All recorded trades";

        return;

    }


    const today =
        new Date();


    const currentMonth =
        today.toLocaleDateString(
            "en-US",
            {
                month: "long"
            }
        );


    const currentYear =
        today.getFullYear();


    const months =
        {
            "1M": 1,
            "3M": 3,
            "6M": 6,
            "1Y": 12
        };


    if (period === "1M") {

        performancePeriodLabel.textContent =
            currentMonth + " " + currentYear;

        return;

    }


    performancePeriodLabel.textContent =
        `Last ${months[period]} months`;

}


// ----------------------------------------
// PERIOD BUTTONS
// ----------------------------------------

performancePeriodButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                activePerformancePeriod =
                    button.dataset.period;


                performancePeriodButtons.forEach(
                    (periodButton) => {

                        periodButton.classList.remove(
                            "period-active"
                        );

                    }
                );


                button.classList.add(
                    "period-active"
                );


                updatePerformancePeriod(
                    activePerformancePeriod
                );


                updatePerformancePeriodLabel(
                    activePerformancePeriod
                );

            }
        );

    }
);


// Initial state

updatePerformancePeriod(
    activePerformancePeriod
);

updatePerformancePeriodLabel(
    activePerformancePeriod
);


// ========================================
// 10. DASHBOARD CONSOLE CHECK
// ========================================

console.log("Dashboard data loaded.");

console.log("Total trades:", totalTrades);

console.log("Winning trades:", winningTrades);

console.log("Losing trades:", losingTrades);

console.log("Breakeven trades:", breakevenTrades);

console.log("Win rate:", winRate);

console.log("Average R:", averageR);

console.log("Net R:", totalNetR);

console.log("Pair performance:", pairPerformance);


console.log(
    "Cumulative performance:",
    cumulativePerformance
);


// ========================================
// 11. DAILY PERFORMANCE DATA
// ========================================

const dailyPerformance = {};


trades.forEach((trade) => {

    if (!dailyPerformance[trade.date]) {

        dailyPerformance[trade.date] = {
            result: 0,
            trades: 0
        };

    }

    dailyPerformance[trade.date].result +=
        trade.result;

    dailyPerformance[trade.date].trades +=
        1;

});


console.log(
    "Daily performance:",
    dailyPerformance
);


// ========================================
// 11.5. DASHBOARD PERIOD LABELS
// ========================================

const currentDate =
    new Date();


const currentMonthName =
    currentDate.toLocaleDateString(
        "en-US",
        {
            month: "long"
        }
    );


const currentYear =
    currentDate.getFullYear();


const currentPeriodLabel =
    `${currentMonthName} ${currentYear}`;


const dashboardPeriodLabel =
    document.getElementById(
        "dashboard-period-label"
    );


const dailyPerformanceMonth =
    document.getElementById(
        "daily-performance-month"
    );


const pairPerformancePeriod =
    document.getElementById(
        "pair-performance-period"
    );


if (dashboardPeriodLabel) {

    dashboardPeriodLabel.textContent =
        currentPeriodLabel;

}


if (dailyPerformanceMonth) {

    dailyPerformanceMonth.textContent =
        currentPeriodLabel;

}


if (pairPerformancePeriod) {

    pairPerformancePeriod.textContent =
        currentPeriodLabel;

}


// ========================================
// 12. BUILD DAILY PERFORMANCE CALENDAR
// ========================================

const calendarGrid =
    document.getElementById(
        "performance-calendar-grid"
    );


const today =
    new Date();


const calendarYear =
    today.getFullYear();


const calendarMonth =
    today.getMonth();


if (calendarGrid) {

    const firstDay =
        new Date(
            calendarYear,
            calendarMonth,
            1
        );


    const daysInMonth =
        new Date(
            calendarYear,
            calendarMonth + 1,
            0
        ).getDate();


    /*
        JavaScript gives Sunday = 0.

        We want Monday = 0.

        So we convert:

        Sunday → 6
        Monday → 0
        Tuesday → 1
        etc.
    */


    const startingDay =
        (firstDay.getDay() + 6) % 7;


    // ----------------------------------------
    // Empty cells before month begins
    // ----------------------------------------

    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");


        emptyDay.className =
            "calendar-day empty";


        calendarGrid.appendChild(
            emptyDay
        );

    }


    // ----------------------------------------
    // Build each day
    // ----------------------------------------

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateKey =
            `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const dayData =
            dailyPerformance[dateKey];


        const calendarDay =
            document.createElement("div");


        // ------------------------------------
        // No trade
        // ------------------------------------

        if (!dayData) {

            calendarDay.className =
                "calendar-day empty";


            calendarDay.innerHTML = `

                <span class="day-number">
                    ${day}
                </span>

            `;

        }


        // ------------------------------------
        // Day has trades
        // ------------------------------------

        else {

            const result =
                Number(
                    dayData.result.toFixed(2)
                );


            let resultClass =
                "neutral";


            let resultText =
                "BE";


            if (result > 0) {

                resultClass =
                    "profitable";


                resultText =
                    `+${result}R`;

            }


            if (result < 0) {

                resultClass =
                    "losing";


                resultText =
                    `${result}R`;

            }


            const tradeLabel =
                dayData.trades === 1
                    ? "trade"
                    : "trades";


            calendarDay.className =
                `calendar-day ${resultClass}`;


            calendarDay.innerHTML = `

                <span class="day-number">
                    ${day}
                </span>

                <strong>
                    ${resultText}
                </strong>

                <small>
                    ${dayData.trades} ${tradeLabel}
                </small>

            `;

        }


        calendarGrid.appendChild(
            calendarDay
        );

    }

}


// ========================================
// 13. TRADING PULSE
// ========================================

const pulseCurrentStreak =
    document.getElementById(
        "pulse-current-streak"
    );


const pulseStreakMessage =
    document.getElementById(
        "pulse-streak-message"
    );


const pulseWinRate =
    document.getElementById(
        "pulse-win-rate"
    );


const pulseWinRateMeta =
    document.getElementById(
        "pulse-win-rate-meta"
    );


const pulseAverageR =
    document.getElementById(
        "pulse-average-r"
    );


const pulseAverageRMeta =
    document.getElementById(
        "pulse-average-r-meta"
    );


const pulseBestPair =
    document.getElementById(
        "pulse-best-pair"
    );


const pulseBestPairResult =
    document.getElementById(
        "pulse-best-pair-result"
    );


const pulseTopSetup =
    document.getElementById(
        "pulse-top-setup"
    );


const pulseTopSetupRate =
    document.getElementById(
        "pulse-top-setup-rate"
    );


// ----------------------------------------
// WIN RATE
// ----------------------------------------

if (pulseWinRate) {

    pulseWinRate.textContent =
        formatPercentage(winRate);

}


if (pulseWinRateMeta) {

    pulseWinRateMeta.textContent =
        `${winningTrades}W · ${losingTrades}L`;

}


// ----------------------------------------
// AVERAGE R
// ----------------------------------------

if (pulseAverageR) {

    pulseAverageR.textContent =
        formatR(averageR);

}


if (pulseAverageRMeta) {

    pulseAverageRMeta.textContent =
        `${totalTrades} trades`;

}


// ----------------------------------------
// BEST PAIR
// ----------------------------------------

if (pairPerformance.length > 0) {

    const bestPair =
        pairPerformance[0];


    if (pulseBestPair) {

        pulseBestPair.textContent =
            bestPair.pair;

    }


    if (pulseBestPairResult) {

        pulseBestPairResult.textContent =
            formatR(bestPair.netR);

    }

}


// ----------------------------------------
// TOP SETUP
// ----------------------------------------

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
            wins: 0

        };

    }


    setupData[setup].trades += 1;


    if (trade.result > 0) {

        setupData[setup].wins += 1;

    }

});


const setupPerformance =
    Object.entries(setupData)
        .map(([setup, data]) => {

            const setupWinRate =
                data.trades > 0
                    ? (data.wins / data.trades) * 100
                    : 0;


            return {

                setup,

                trades: data.trades,

                wins: data.wins,

                winRate: setupWinRate

            };

        })
        .sort((a, b) => {

            if (b.winRate !== a.winRate) {

                return b.winRate - a.winRate;

            }


            return b.trades - a.trades;

        });


if (setupPerformance.length > 0) {

    const topSetup =
        setupPerformance[0];


    if (pulseTopSetup) {

        pulseTopSetup.textContent =
            topSetup.setup;

    }


    if (pulseTopSetupRate) {

        pulseTopSetupRate.textContent =
            `${topSetup.winRate.toFixed(1)}% win rate`;

    }

}


// ----------------------------------------
// CURRENT WINNING-DAY STREAK
// ----------------------------------------

const dailyResults =
    Object.entries(dailyPerformance)
        .map(([date, data]) => {

            return {

                date,

                result: data.result

            };

        })
        .sort((a, b) => {

            return new Date(b.date) -
                new Date(a.date);

        });


let winningDayStreak = 0;


for (const day of dailyResults) {

    if (day.result > 0) {

        winningDayStreak += 1;

    } else {

        break;

    }

}


if (pulseCurrentStreak) {

    pulseCurrentStreak.textContent =
        `${winningDayStreak} winning ${
            winningDayStreak === 1
                ? "day"
                : "days"
        }`;

}


if (pulseStreakMessage) {

    if (winningDayStreak > 0) {

        pulseStreakMessage.textContent =
            "You're currently building positive momentum across your trading sessions.";

    } else if (dailyResults.length > 0) {

        pulseStreakMessage.textContent =
            "Keep following your process. Consistency matters more than individual results.";

    } else {

        pulseStreakMessage.textContent =
            "Your trading performance will appear here as you record trades.";

    }

}