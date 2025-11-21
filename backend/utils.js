// utils.js
function getWeekRange(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday...
  const diffToMon = (day + 6) % 7; // Monday start
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - diffToMon);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return {
    weekStart: weekStart.toISOString().slice(0,10), // 'YYYY-MM-DD'
    weekEnd: weekEnd.toISOString().slice(0,10)
  };
}

module.exports = { getWeekRange };
