/* ========================================
   ANALYTICS PAGE
======================================== */

let activeAnalyticsPeriod = "1M";


/* ========================================
   CURRENT USER STORAGE
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
            "No logged-in user found. Analytics data cannot be loaded."
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
            result: Number(trade.result) || 0,
            risk: Number(trade.risk) || 0
        };

    });

}


/* ========================================
   PERIOD START
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
   FILTER TRADES
======================================== */

function getFilteredTrades() {

    const trades =
        normalizeTrades(getTrades());

    if (activeAnalyticsPeriod === "ALL") {
        return trades;
    }

    const startDate =
        getPeriodStartDate(activeAnalyticsPeriod);

    return trades.filter((trade) => {

        const tradeDate =
            new Date(trade.date);

        return (
            !isNaN(tradeDate) &&
            tradeDate >= startDate
        );

    });

}


/* ========================================
   FORMAT R
======================================== */

function formatR(value) {

    const numericValue =
        Number(value || 0);

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


/* ========================================
   FORMAT PERCENTAGE
======================================== */

function formatPercentage(value) {

    return `${Number(
        value.toFixed(1)
    )}%`;

}


/* ========================================
   EXPECTANCY
======================================== */

function calculateExpectancy(trades) {

    if (trades.length === 0) {
        return 0;
    }

    const totalR = trades.reduce(
        (total, trade) => {
            return total + trade.result;
        },
        0
    );

    return totalR / trades.length;

}


/* ========================================
   PROFIT FACTOR
======================================== */

function calculateProfitFactor(trades) {

    const grossProfit = trades
        .filter((trade) => trade.result > 0)
        .reduce(
            (total, trade) => {
                return total + trade.result;
            },
            0
        );

    const grossLoss = Math.abs(
        trades
            .filter((trade) => trade.result < 0)
            .reduce(
                (total, trade) => {
                    return total + trade.result;
                },
                0
            )
    );

    if (grossLoss === 0) {

        return grossProfit > 0
            ? Infinity
            : 0;

    }

    return grossProfit / grossLoss;

}


/* ========================================
   MAX DRAWDOWN
======================================== */

function calculateMaxDrawdown(trades) {

    if (trades.length === 0) {
        return 0;
    }

    const sortedTrades = [...trades].sort(
        (a, b) => {
            return new Date(a.date) -
                new Date(b.date);
        }
    );

    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;

    sortedTrades.forEach((trade) => {

        equity += trade.result;

        if (equity > peak) {
            peak = equity;
        }

        const drawdown =
            equity - peak;

        if (drawdown < maxDrawdown) {
            maxDrawdown = drawdown;
        }

    });

    return maxDrawdown;

}


/* ========================================
   RISK CONSISTENCY
======================================== */

function calculateRiskConsistency(trades) {

    const risks = trades
        .map((trade) => Number(trade.risk))
        .filter((risk) => risk > 0);

    if (risks.length === 0) {
        return 0;
    }

    const averageRisk =
        risks.reduce(
            (total, risk) => {
                return total + risk;
            },
            0
        ) / risks.length;

    if (averageRisk === 0) {
        return 0;
    }

    const averageDeviation =
        risks.reduce(
            (total, risk) => {
                return total +
                    Math.abs(
                        risk - averageRisk
                    );
            },
            0
        ) / risks.length;

    const consistency =
        100 -
        (
            averageDeviation /
            averageRisk
        ) * 100;

    return Math.max(
        0,
        Math.min(100, consistency)
    );

}


/* ========================================
   UPDATE ANALYTICS OVERVIEW
======================================== */

function updateAnalyticsOverview() {

    const trades =
        getFilteredTrades();

    const expectancy =
        calculateExpectancy(trades);

    const profitFactor =
        calculateProfitFactor(trades);

    const maxDrawdown =
        calculateMaxDrawdown(trades);

    const riskConsistency =
        calculateRiskConsistency(trades);


    /* Expectancy */

    const expectancyElement =
        document.getElementById(
            "analytics-expectancy"
        );

    if (expectancyElement) {

        expectancyElement.textContent =
            formatR(expectancy);

    }


    /* Profit Factor */

    const profitFactorElement =
        document.getElementById(
            "analytics-profit-factor"
        );

    if (profitFactorElement) {

        profitFactorElement.textContent =
            profitFactor === Infinity
                ? "∞"
                : profitFactor.toFixed(2);

    }


    /* Maximum Drawdown */

    const drawdownElement =
        document.getElementById(
            "analytics-max-drawdown"
        );

    if (drawdownElement) {

        drawdownElement.textContent =
            formatR(maxDrawdown);

    }


    /* Risk Consistency */

    const riskConsistencyElement =
        document.getElementById(
            "analytics-risk-consistency"
        );

    if (riskConsistencyElement) {

        riskConsistencyElement.textContent =
            formatPercentage(
                riskConsistency
            );

    }

}


/* ========================================
   DIRECTION ANALYSIS
======================================== */

function updateDirectionAnalysis() {

    const trades = getFilteredTrades();

    const directionData = {
        Long: {
            trades: 0,
            wins: 0,
            netR: 0
        },
        Short: {
            trades: 0,
            wins: 0,
            netR: 0
        }
    };


    trades.forEach((trade) => {

        const tradeDirection =
            trade.direction?.trim();

        if (!tradeDirection) return;

        const normalizedDirection =
            tradeDirection.toLowerCase();

        let key = null;

        if (
            normalizedDirection === "long" ||
            normalizedDirection === "buy"
        ) {
            key = "Long";
        }

        if (
            normalizedDirection === "short" ||
            normalizedDirection === "sell"
        ) {
            key = "Short";
        }

        if (!key) return;

        directionData[key].trades += 1;

        directionData[key].netR +=
            trade.result;

        if (trade.result > 0) {
            directionData[key].wins += 1;
        }

    });


    const container =
        document.getElementById(
            "analytics-direction-grid"
        );

    if (!container) return;


    const hasData =
        directionData.Long.trades > 0 ||
        directionData.Short.trades > 0;


    if (!hasData) {

        container.innerHTML = `
            <div class="analytics-empty-row">
                No direction data available yet.
            </div>
        `;

        return;

    }


    const directions = [
        {
            name: "Long",
            data: directionData.Long
        },
        {
            name: "Short",
            data: directionData.Short
        }
    ];


    container.innerHTML = directions
        .map((direction) => {

            const data =
                direction.data;

            const winRate =
                data.trades > 0
                    ? (data.wins / data.trades) * 100
                    : 0;

            const averageR =
                data.trades > 0
                    ? data.netR / data.trades
                    : 0;


            return `
                <div class="analytics-direction-card">

                    <div class="analytics-direction-heading">

                        <span class="app-eyebrow">
                            ${direction.name}
                        </span>

                        <strong>
                            ${formatR(data.netR)}
                        </strong>

                    </div>


                    <div class="analytics-direction-stats">

                        <div>
                            <span>TRADES</span>
                            <strong>
                                ${data.trades}
                            </strong>
                        </div>

                        <div>
                            <span>WIN RATE</span>
                            <strong>
                                ${formatPercentage(winRate)}
                            </strong>
                        </div>

                        <div>
                            <span>AVERAGE R</span>
                            <strong>
                                ${formatR(averageR)}
                            </strong>
                        </div>

                    </div>

                </div>
            `;

        })
        .join("");

}


/* ========================================
   TIMING ANALYSIS
======================================== */

function updateTimingAnalysis() {

    const trades = getFilteredTrades();

    const timingData = {
        "Early Morning": {
            trades: 0,
            wins: 0,
            netR: 0
        },

        "Morning": {
            trades: 0,
            wins: 0,
            netR: 0
        },

        "Afternoon": {
            trades: 0,
            wins: 0,
            netR: 0
        },

        "Evening": {
            trades: 0,
            wins: 0,
            netR: 0
        }
    };


    trades.forEach((trade) => {

        if (!trade.time) return;

        const hour =
            Number(
                trade.time.split(":")[0]
            );

        if (isNaN(hour)) return;


        let period = null;


        if (hour >= 0 && hour < 6) {

            period = "Early Morning";

        } else if (hour >= 6 && hour < 12) {

            period = "Morning";

        } else if (hour >= 12 && hour < 18) {

            period = "Afternoon";

        } else {

            period = "Evening";

        }


        timingData[period].trades += 1;

        timingData[period].netR +=
            trade.result;


        if (trade.result > 0) {

            timingData[period].wins += 1;

        }

    });


    const container =
        document.getElementById(
            "analytics-time-grid"
        );


    if (!container) return;


    const hasData =
        Object.values(timingData)
            .some((period) => {
                return period.trades > 0;
            });


    if (!hasData) {

        container.innerHTML = `
            <div class="analytics-empty-row">
                No timing data available yet.
            </div>
        `;

        return;

    }


    const periods = [
        "Early Morning",
        "Morning",
        "Afternoon",
        "Evening"
    ];


    container.innerHTML =
        periods.map((period) => {

            const data =
                timingData[period];


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


            return `
                <div class="analytics-time-card">

                    <div class="analytics-time-heading">

                        <span class="app-eyebrow">
                            ${period}
                        </span>

                        <strong>
                            ${formatR(data.netR)}
                        </strong>

                    </div>


                    <div class="analytics-time-stats">

                        <div>
                            <span>TRADES</span>
                            <strong>
                                ${data.trades}
                            </strong>
                        </div>


                        <div>
                            <span>WIN RATE</span>
                            <strong>
                                ${formatPercentage(winRate)}
                            </strong>
                        </div>


                        <div>
                            <span>AVERAGE R</span>
                            <strong>
                                ${formatR(averageR)}
                            </strong>
                        </div>

                    </div>

                </div>
            `;

        }).join("");

}


/* ========================================
   WEEKDAY ANALYSIS
======================================== */

function updateWeekdayAnalysis() {

    const trades = getFilteredTrades();

    const weekdayData = {
        Monday: {
            trades: 0,
            wins: 0,
            netR: 0
        },

        Tuesday: {
            trades: 0,
            wins: 0,
            netR: 0
        },

        Wednesday: {
            trades: 0,
            wins: 0,
            netR: 0
        },

        Thursday: {
            trades: 0,
            wins: 0,
            netR: 0
        },

        Friday: {
            trades: 0,
            wins: 0,
            netR: 0
        }
    };


    trades.forEach((trade) => {

        if (!trade.date) return;

        const tradeDate =
            new Date(trade.date);

        if (isNaN(tradeDate)) return;


        const weekday =
            tradeDate.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        if (!weekdayData[weekday]) return;


        weekdayData[weekday].trades += 1;

        weekdayData[weekday].netR +=
            trade.result;


        if (trade.result > 0) {

            weekdayData[weekday].wins += 1;

        }

    });


    const container =
        document.getElementById(
            "analytics-weekday-grid"
        );


    if (!container) return;


    const hasData =
        Object.values(weekdayData)
            .some((day) => {
                return day.trades > 0;
            });


    if (!hasData) {

        container.innerHTML = `
            <div class="analytics-empty-row">
                No weekday data available yet.
            </div>
        `;

        return;

    }


    const weekdays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];


    container.innerHTML =
        weekdays.map((weekday) => {

            const data =
                weekdayData[weekday];


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


            return `
                <div class="analytics-weekday-card">

                    <div class="analytics-weekday-heading">

                        <span class="app-eyebrow">
                            ${weekday}
                        </span>

                        <strong>
                            ${formatR(data.netR)}
                        </strong>

                    </div>


                    <div class="analytics-weekday-stats">

                        <div>
                            <span>TRADES</span>
                            <strong>
                                ${data.trades}
                            </strong>
                        </div>


                        <div>
                            <span>WIN RATE</span>
                            <strong>
                                ${formatPercentage(winRate)}
                            </strong>
                        </div>


                        <div>
                            <span>AVERAGE R</span>
                            <strong>
                                ${formatR(averageR)}
                            </strong>
                        </div>

                    </div>

                </div>
            `;

        }).join("");

}


/* ========================================
   RISK ANALYSIS
======================================== */

function updateRiskAnalysis() {

    const trades = getFilteredTrades();

    const risks = trades
        .map((trade) => Number(trade.risk))
        .filter((risk) => risk > 0);


    const container =
        document.getElementById(
            "analytics-risk-grid"
        );


    if (!container) return;


    if (risks.length === 0) {

        container.innerHTML = `
            <div class="analytics-empty-row">
                No risk data available yet.
            </div>
        `;

        return;

    }


    const averageRisk =
        risks.reduce(
            (total, risk) => {
                return total + risk;
            },
            0
        ) / risks.length;


    const highestRisk =
        Math.max(...risks);


    const lowestRisk =
        Math.min(...risks);


    const averageDeviation =
        risks.reduce(
            (total, risk) => {
                return total +
                    Math.abs(
                        risk - averageRisk
                    );
            },
            0
        ) / risks.length;


    const riskConsistency =
        averageRisk > 0
            ? Math.max(
                0,
                Math.min(
                    100,
                    100 -
                    (
                        averageDeviation /
                        averageRisk
                    ) * 100
                )
            )
            : 0;


    const outsideNormalRisk =
        risks.filter((risk) => {

            return Math.abs(
                risk - averageRisk
            ) > averageRisk * 0.25;

        }).length;


    const outsideNormalPercentage =
        risks.length > 0
            ? (
                outsideNormalRisk /
                risks.length
            ) * 100
            : 0;


    const riskRange =
        highestRisk - lowestRisk;


    container.innerHTML = `

        <div class="analytics-risk-card">

            <div class="analytics-risk-heading">

                <span class="app-eyebrow">
                    AVERAGE RISK
                </span>

                <strong>
                    ${formatPercentage(averageRisk)}
                </strong>

            </div>

            <p>
                Your average risk per recorded trade.
            </p>

        </div>


        <div class="analytics-risk-card">

            <div class="analytics-risk-heading">

                <span class="app-eyebrow">
                    HIGHEST RISK
                </span>

                <strong>
                    ${formatPercentage(highestRisk)}
                </strong>

            </div>

            <p>
                Your largest recorded risk.
            </p>

        </div>


        <div class="analytics-risk-card">

            <div class="analytics-risk-heading">

                <span class="app-eyebrow">
                    LOWEST RISK
                </span>

                <strong>
                    ${formatPercentage(lowestRisk)}
                </strong>

            </div>

            <p>
                Your smallest recorded risk.
            </p>

        </div>


        <div class="analytics-risk-card">

            <div class="analytics-risk-heading">

                <span class="app-eyebrow">
                    RISK RANGE
                </span>

                <strong>
                    ${formatPercentage(riskRange)}
                </strong>

            </div>

            <p>
                Difference between your highest and lowest risk.
            </p>

        </div>


        <div class="analytics-risk-card">

            <div class="analytics-risk-heading">

                <span class="app-eyebrow">
                    CONSISTENCY
                </span>

                <strong>
                    ${formatPercentage(riskConsistency)}
                </strong>

            </div>

            <p>
                How consistently you maintain your normal risk.
            </p>

        </div>


        <div class="analytics-risk-card">

            <div class="analytics-risk-heading">

                <span class="app-eyebrow">
                    OUTSIDE NORMAL
                </span>

                <strong>
                    ${outsideNormalRisk}
                </strong>

            </div>

            <p>
                ${formatPercentage(outsideNormalPercentage)}
                of trades deviated significantly from your average risk.
            </p>

        </div>

    `;

}


/* ========================================
   INITIALIZE ANALYTICS
======================================== */

function initAnalyticsPage() {

    updateAnalyticsOverview();
    updateDirectionAnalysis();
    updateTimingAnalysis();
    updateWeekdayAnalysis();
    updateRiskAnalysis();
    setupAnalyticsPeriodSelector();

}


/* ========================================
   PERIOD SELECTOR
======================================== */

function setupAnalyticsPeriodSelector() {

    const buttons = document.querySelectorAll(
        ".analytics-period-button"
    );

    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const selectedPeriod =
                    button.dataset.period;

                activeAnalyticsPeriod =
                    selectedPeriod;

                buttons.forEach((item) => {

                    item.classList.remove(
                        "active"
                    );

                });

                button.classList.add("active");

                updateAnalyticsOverview();
                updateDirectionAnalysis();
                updateTimingAnalysis();
                updateWeekdayAnalysis();
                updateRiskAnalysis();

            }
        );

    });

}

initAnalyticsPage();