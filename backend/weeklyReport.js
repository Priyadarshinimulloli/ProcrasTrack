const db = require('./db/db.js');
const { getWeekRange } = require('./utils');

async function generateWeeklyReport(userId, weekDate) {
  const { weekStart, weekEnd } = getWeekRange(weekDate);
  const report = { week_start: weekStart, week_end: weekEnd };
  
  console.log('=== Weekly Report Generation ===');
  console.log('User ID:', userId);
  console.log('Week Date:', weekDate);
  console.log('Week Range:', weekStart, 'to', weekEnd);

  // 1. Total tasks (based on date_of_assigned)
  const totalTasks = await new Promise((resolve, reject) => {
    db.query(
      'SELECT COUNT(*) AS total_tasks FROM tasks t JOIN usertasks ut ON t.task_id = ut.task_id WHERE ut.user_id = ? AND DATE(ut.date_of_assigned) BETWEEN ? AND ?',
      [userId, weekStart, weekEnd],
      (err, result) => {
        if (err) return reject(err);
        console.log('Total tasks result:', result[0]);
        resolve(result[0].total_tasks);
      }
    );
  });
  report.total_tasks = totalTasks;

  // 2. Completed tasks (filter by actual_end OR date_of_assigned as per your logic)
  // Here we use actual_end to see which tasks were completed in that week
  const completedTasks = await new Promise((resolve, reject) => {
    db.query(
      'SELECT COUNT(*) AS completed_tasks FROM tasks t JOIN usertasks ut ON t.task_id = ut.task_id WHERE ut.user_id = ? AND DATE(ut.date_of_assigned) BETWEEN ? AND ? AND t.user_status = "completed" ',
      [userId, weekStart, weekEnd],
      (err, result) => {
        if (err) return reject(err);
        console.log('Completed tasks result:', result[0]);
        resolve(result[0].completed_tasks);
      }
    );
  });
  report.completed_tasks = completedTasks;

  // 3. Delayed tasks - only count tasks assigned this week
  const delayedTasks = await new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(DISTINCT pl.task_id) AS delayed_tasks
       FROM procrastination_log pl
       JOIN procrastination_details pd ON pl.log_id = pd.log_id
       JOIN usertasks ut ON pl.task_id = ut.task_id AND pl.user_id = ut.user_id
       WHERE pl.user_id = ? 
       AND DATE(pd.logged_date) BETWEEN ? AND ?
       AND DATE(ut.date_of_assigned) BETWEEN ? AND ?`,
      [userId, weekStart, weekEnd, weekStart, weekEnd],
      (err, result) => {
        if (err) return reject(err);
        console.log('Delayed tasks result:', result[0]);
        resolve(result[0].delayed_tasks);
      }
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
      (err, result) => {
        if (err) return reject(err);
        console.log('Avg delay result:', result[0]);
        resolve(result[0].avg_delay || 0);
      }
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
  // Calculate as: (completed_tasks / total_tasks) * 100
  // Then reduce by delay impact: subtract (avg_delay / 100) to penalize delays
  console.log('Productivity Score Calculation:', {
    totalTasks,
    completedTasks,
    delayedTasks,
    avgDelay
  });
  
  if (totalTasks > 0) {
    const completionRate = (completedTasks / totalTasks) * 100;
    
    // Cap delayed tasks at total tasks to prevent negative scores
    const effectiveDelayedTasks = Math.min(delayedTasks, totalTasks);
    const delayPenalty = (effectiveDelayedTasks / totalTasks) * 30; // Max 30% penalty for delays
    
    // Penalty for average delay time (more gradual)
    const avgDelayPenalty = Math.min(40, (avgDelay / 120) * 40); // Max 40% penalty, scaled to 2 hours
    
    console.log('Score breakdown:', {
      completionRate,
      effectiveDelayedTasks,
      delayPenalty,
      avgDelayPenalty,
      rawScore: completionRate - delayPenalty - avgDelayPenalty
    });
    
    report.productivity_score = Math.max(0, Math.min(100, completionRate - delayPenalty - avgDelayPenalty));
  } else {
    report.productivity_score = 0;
  }
  
  console.log('Final productivity_score:', report.productivity_score);

  // 8. Generated timestamp
  report.generated_at = new Date().toISOString();

  return report;
}

module.exports = { generateWeeklyReport };
