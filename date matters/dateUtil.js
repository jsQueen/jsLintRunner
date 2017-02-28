/*jslint node:true es5:true*/
'use strict';
var month = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"],
    monthData = [
        { name: 'January', shortName: 'Jan', index: 1},
        { name: 'February', shortName: 'Feb', index: 2},
        { name: 'March', shortName: 'Mar', index: 3},
        { name: 'April', shortName: 'Apr', index: 4},
        { name: 'May', shortName: 'May', index: 5},
        { name: 'June', shortName: 'Jun', index: 6},
        { name: 'July', shortName: 'Jul', index: 7},
        { name: 'August', shortName: 'Aug', index: 8},
        { name: 'September', shortName: 'Sep', index: 9},
        { name: 'October', shortName: 'Oct', index: 10},
        { name: 'November', shortName: 'Nov', index: 11},
        { name: 'December', shortName: 'Dec', index : 12}
    ],
    intervals = {
        millisecPerDay: 86400000,
        millisecPerYear: 31536000000,    //365 * 86400000
        millisecPerTimeZone: 60000      //3600000 / 60
    };

function getMonthName(index) {
    return month[index];
}
function getMonthIndexByShortName(monthName) {
    var i = 0, len = monthData.length, result = -1;
    if (monthName && monthName.trim() !== '') {
        for (i = 0; i < len; i += 1) {
            if (monthData[i].shortName.toLowerCase() === monthName.trim().toLowerCase()) {
                result = monthData[i].index;
                break;
            }
        }
    }
    return result;
}
function getMonthYearFormat(d) { //Month.Year
    var date = new Date(d);
    return [getMonthName(date.getMonth()).substr(0, 3), ".", date.getFullYear().toString().substring(2, 4)].join('');
}

function getMonthYearLabel(d) { //Month Year: March 2014
    var date = new Date(d);
    return [getMonthName(date.getMonth()), " ", date.getFullYear().toString()].join('');
}

function getDefaultJson(d) {
    return {
        Date: d,
        Month: d.getMonth() + 1,
        Year: d.getFullYear(),
        ShortName: getMonthYearFormat(d),
        YearMonth: [ d.getFullYear(), '.', d.getMonth() + 1].join(''),
        FullDate: [ d.getFullYear(), '.', d.getMonth() + 1, '.', d.getDate()].join('')
    };
}

function formatDateStringFromTimestamp(timestamp) {
    var theDate;
    if (!isNaN(timestamp)) {
        theDate = new Date(timestamp);
    }
    if (theDate instanceof Date) {
        theDate = theDate.getMonth() + 1 + '/' + theDate.getDate() + '/' + theDate.getFullYear();
    } else {
        theDate = 'N/A';
    }
    return theDate;
}
function getPrevMonth(nMonth) {
    var today = new Date();
    today.setMonth(today.getMonth() - nMonth);
    return new Date(today);
}
function getDays(startDate, endDate) {
    var rDays = [],
        nextDay = function (d) {
            var date = new Date(d);
            return date.setDate(date.getDate() + 1);
        };
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    while (startDate.getTime() <= endDate.getTime()) {
        rDays.push(getDefaultJson(new Date(startDate)));
        startDate = new Date(nextDay(startDate));
    }
    return rDays;
}

function getMonthYearRange(startDate, endDate) {
    function getMonthRangeImpl(startDate, endDate) {
        var rMonthYears = [],
            nextMonth = function (d) {
                var c = new Date(d);
                return new Date(c.setMonth(c.getMonth() + 1));
            };
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        while (startDate <= endDate) {
            rMonthYears.push(getDefaultJson(startDate));
            startDate = nextMonth(startDate);
        }
        return rMonthYears;
    }
    if (getMonthYearFormat(startDate) === getMonthYearFormat(endDate)) {return [getDefaultJson(new Date(startDate))]; }
    return getMonthRangeImpl(startDate, endDate);
}

function getPrevMonths(nMonth, includeCurrentMonth) {
    var i, retMonths = [], date;//, monthYear;
    for (i = nMonth; i > 0; i -= 1) {
        date = getPrevMonth(i);
        retMonths.push(getDefaultJson(date));
    }
    if (includeCurrentMonth) {
        date = new Date();
        retMonths.push(getDefaultJson(date));
    }
    return retMonths;
}

function isValidDateRange(startDate, endDate) {
    var value = false;
    if (startDate !== null && endDate !== null) {
        startDate = new Date(startDate).getTime();
        endDate = new Date(endDate).getTime();
        if (endDate >= startDate) {
            value = true;
        }
    }
    return value;
}

function getJustUTCDate(date) {
    var d = (date !== undefined) ? new Date(date) : new Date();
    return new Date(d.toISOString().substring(0, 10));
}

function getJustDate(date) {
    var d = (date !== undefined) ? new Date(date) : new Date();
    return new Date(d.toString().substring(0, 15));
}

function getEndOfLastMonth() {
    var today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 23, 59, 59) - 86400000);
}
function getFirstDayOfLastMonth() {
    var today = new Date();
    return new Date(today.getUTCFullYear(), today.getUTCMonth() - 1, 1);
}
function setDateToEndOfDay(timestamp) {
    var vDate = new Date(timestamp);
    return new Date([vDate.getFullYear(), "/", (vDate.getMonth() + 1), "/", vDate.getDate(), " 23:59:59"].join('')).getTime();
}

function getCategoryDateRange(dateRange, startDate, endDate, reportView) {
    var value = 'Monthly', category,
        showMonthView = function (startDate, endDate, reportView) {
            var days = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
            return ((reportView !== undefined && reportView === true) || (days > 30));
        };
    if (dateRange !== undefined) {
        value = dateRange;
    }
    if (startDate && endDate) {
        if (showMonthView(startDate, endDate, reportView)) {
            value = 'Monthly';
            category = getMonthYearRange(startDate, endDate);
        } else {
            value = 'Daily';
            category = getDays(startDate, endDate);
        }
    }
    return {DateRange: value, Category: category};
}
function getCurrentQuarterRange() {
    var d = new Date(),
        quarter = Math.floor((d.getMonth() / 3)),
        qStart = new Date(d.getFullYear(), quarter * 3, 1);

    return {
        qStart: qStart.getTime(),
        qEnd: new Date(qStart.getFullYear(), qStart.getMonth() + 3, 0).getTime()
    };
}
function getDateOffset(days) {
    var today = new Date(),
        dateOffset = (24 * 60 * 60 * 1000) * days;
    return new Date(today.setTime(today.getTime() - dateOffset));
}
function getDaysBetween(firstDate, secondDate, tz) {
    return Math.abs(Math.ceil((firstDate.getTime() - secondDate.getTime() + (tz || 0)) / (24 * 60 * 60 * 1000)));
}
function getYearsBetween(firstDate, secondDate, tz) {
    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime() + (tz || 0)) / (24 * 60 * 60 * 1000 * 365)));
}
function convertToLocalDate(timeStamp) {
    var date;
    if (!timeStamp) {
        return timeStamp;
    }
    date = new Date(timeStamp);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).getTime();
}
function getDayBegining() {
    var nowDate = new Date();
    return new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
}
function dateIsTodayOrGreater(date1) {
    var today = new Date(),
        vDate1 = new Date(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()).getTime(),
        todayCheck = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()).getTime();
    return todayCheck >= vDate1;
}

function sameDay(date1, date2) {
    var date1 = new Date(date1),
        date2 = new Date(date2),
        tsp1 = new Date(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()).getTime(),
        tsp2 = new Date(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()).getTime();
    return tsp1 === tsp2;
}

module.exports = {
    formatDateStringFromTimestamp: formatDateStringFromTimestamp,
    isValidDateRange: isValidDateRange,
    getPrevMonth: getPrevMonth,
    getPrevMonths: getPrevMonths,
    getMonthIndexByShortName: getMonthIndexByShortName,
    getMonthYearRange: getMonthYearRange,
    getDays: getDays,
    getJustUTCDate: getJustUTCDate,
    getJustDate: getJustDate,
    getCategoryDateRange: getCategoryDateRange,
    getFirstDayOfLastMonth: getFirstDayOfLastMonth,
    getEndOfLastMonth: getEndOfLastMonth,
    setDateToEndOfDay: setDateToEndOfDay,
    getCurrentQuarterRange: getCurrentQuarterRange,
    getMonthYearLabel: getMonthYearLabel,
    getDateOffset: getDateOffset,
    getDaysBetween: getDaysBetween,
    getYearsBetween: getYearsBetween,
    convertToLocalDate: convertToLocalDate,
    dateIsTodayOrGreater: dateIsTodayOrGreater,
    getDayBegining: getDayBegining,
    sameDay: sameDay,
    intervals: intervals
};
