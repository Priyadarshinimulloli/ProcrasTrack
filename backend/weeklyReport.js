const db = require('./db/db.js');
const { getWeekRange } = require('./utils');

async function generateWeeklyReport(userId, weekDate) {
  const { weekStart, weekEnd } = getWeekRange(weekDate);
  const report = { week_start: weekStart, week_end: weekEnd };

  // 1. Total tasks (based on date_of_assigned)
  const totalTasks = await new Promise((resolve, reject) => {
    db.query(
      'SELECT COUNT(*) AS total_tasks FROM tasks t JOIN usertasks ut ON t.task_id = ut.task_id WHERE ut.user_id = ? AND DATE(ut.date_of_assigned) BETWEEN ? AND ?',
      [userId, weekStart, weekEnd],
      (err, result) => err ? reject(err) : resolve(result[0].total_tasks)
    );
  });
  report.total_tasks = totalTasks;

  // 2. Completed tasks (filter by actual_end OR date_of_assigned as per your logic)
  // Here we use actual_end to see which tasks were completed in that week
  const completedTasks = await new Promise((resolve, reject) => {
    db.query(
      'SELECT COUNT(*) AS completed_tasks FROM tasks t JOIN usertasks ut ON t.task_id = ut.task_id WHERE ut.user_id = ? AND DATE(ut.date_of_assigned) BETWEEN ? AND ? AND t.user_status = "completed" ',
      [userId, weekStart, weekEnd],
      (err, result) => err ? reject(err) : resolve(result[0].completed_tasks)
    );
  });
  report.completed_tasks = completedTasks;

  // 3. Delayed tasks
  const delayedTasks = await new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(DISTINCT pl.task_id) AS delayed_tasks
       FROM procrastination_log pl
       JOIN procrastination_details pd ON pl.log_id = pd.log_id
       WHERE pl.user_id = ? AND DATE(pd.logged_date) BETWEEN ? AND ?`,
      [userId, weekStart, weekEnd],
      (err, result) => err ? reject(err) : resolve(result[0].delayed_tasks)
    );
  });
  report.delayed_tasks = delayedTasks;

  // 4. Average delay
  const avgDelay = await new Promise((resolve, reject) => {
    db.query(
      `SELECT AVG(pd.delay_duration) AS avg_delay
       FROM procrastination_log pl
       JOIN procrastination_details pd ON pl.log_id = pd.log_id
       WHERE pl.user_id = ? AND DATE(pd.logged_date) BETWEEN ? AND ?`,
      [userId, weekStart, weekEnd],
      (err, result) => err ? reject(err) : resolve(result[0].avg_delay || 0)
    );
  });
  report.avg_delay = avgDelay;

  // 5. Average planned duration (still use planned_start/end, but filter by date_of_assigned)
  const avgPlanned = await new Promise((resolve, reject) => {
    db.query(
      `SELECT AVG(TIMESTAMPDIFF(MINUTE, t.planned_start, t.planned_end)) AS avg_planned_duration
       FROM tasks t
       JOIN usertasks ut ON t.task_id = ut.task_id
       WHERE ut.user_id = ? AND DATE(ut.date_of_assigned) BETWEEN ? AND ?`,
      [userId, weekStart, weekEnd],
      (err, result) => err ? reject(err) : resolve(result[0].avg_planned_duration || 0)
    );
  });
  report.avg_planned_duration = avgPlanned;

  // 6. Daily trend (still based on procrastination logs)
  const dailyTrend = await new Promise((resolve, reject) => {
    db.query(
      `SELECT DATE(pd.logged_date) AS day,
              COUNT(*) AS delay_count,
              AVG(pd.delay_duration) AS avg_delay
       FROM procrastination_log pl
       JOIN procrastination_details pd ON pl.log_id = pd.log_id
       WHERE pl.user_id = ? AND DATE(pd.logged_date) BETWEEN ? AND ?
       GROUP BY DATE(pd.logged_date)
       ORDER BY day ASC`,
      [userId, weekStart, weekEnd],
      (err, results) => err ? reject(err) : resolve(results)
    );
  });
  report.daily_trend = dailyTrend;

  // 7. Productivity score
  report.productivity_score = totalTasks > 0 
    ? Math.max(0, Math.min(100, ((totalTasks - delayedTasks)/totalTasks*100) - (avgDelay/avgPlanned*100)))
    : 100;

  // 8. Generated timestamp
  report.generated_at = new Date().toISOString();

  return report;
}

module.exports = { generateWeeklyReport };
