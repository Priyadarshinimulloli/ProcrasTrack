const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db/db.js');
const { generateWeeklyReport } = require('./weeklyReport');

dotenv.config({silent:true});
const app = express();
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Backend is running....")
})
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    console.log(results);
    res.json(results);
  });
});

app.post('/signup',(req,res)=>{
  const {username,email,password,occupation}=req.body;
  const sql="INSERT INTO users(user_name, user_email, user_password, occupation) VALUES(?,?,?,?)";
  db.query(sql,[username,email,password,occupation],(err,result)=>{
    if(err){
      console.log(err);
      return res.status(500).json({error:err});
    }
    // Return the newly created user's ID and data
    const userId = result.insertId;
    res.status(201).json({
      message:"User created successfully",
      userId: userId,
      username: username,
      email: email
    });
  });
});

app.post('/login',(req,res)=>{
  const {email,password}=req.body;
  const sql="SELECT * FROM users WHERE user_email=? and user_password=?";
  db.query(sql,[email,password],(err,result)=>{
    if(err){
      console.log(err);
      return res.status(500).json({error:err});
    }
    if(result.length==0){
      return  res.status(401).json({message:"Invalid credentials"});
    }
    // Return user profile data
    const user = result[0];
    res.json({
      message:"Login successful",
      userId: user.user_id,
      username: user.user_name,
      email: user.user_email,
      occupation: user.occupation
    });
  });

});

// Task API Endpoints

// Get all tasks for a user
app.get('/api/tasks', (req, res) => {
  // Require user_id for now (replace with auth token extraction later)
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ message: 'user_id query parameter is required' });

  const sql = 'SELECT t.* FROM tasks t JOIN usertasks ut ON t.task_id = ut.task_id WHERE ut.user_id = ? ORDER BY ut.date_of_assigned DESC';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Create a new task
app.post('/api/tasks', (req, res) => {
  // Expect user_id to associate task with a profile. In future this should come from an auth token.
  const userId = req.body.user_id || req.body.userId;
  const task_name = req.body.task_name || req.body.title;
  const category = req.body.category;
  const planned_start = req.body.planned_start || req.body.planned_start_time;
  const planned_end = req.body.planned_end || req.body.planned_end_time;

  if (!userId) return res.status(400).json({ message: 'Missing user_id. Include user_id in the request body.' });
  if (!task_name || !category || !planned_start || !planned_end) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = `INSERT INTO tasks (task_name, category, planned_start, planned_end, user_status) VALUES (?, ?, ?, ?, 'pending')`;

  db.query(sql, [task_name, category, planned_start, planned_end], (err, result) => {
    if (err) {
      console.error('Error creating task:', err);
      return res.status(500).json({ error: err.message });
    }

    const newTaskId = result.insertId;
    // Link task to user in usertasks join table
    const linkSql = 'INSERT INTO usertasks (user_id, task_id, date_of_assigned) VALUES (?, ?, NOW())';
    db.query(linkSql, [userId, newTaskId], (linkErr) => {
      if (linkErr) {
        console.error('Error linking task to user:', linkErr);
        // Note: task was created, but link failed. Respond with partial success.
        return res.status(201).json({ message: 'Task created but failed to assign to user', taskId: newTaskId });
      }

      res.status(201).json({ message: 'Task created and assigned to user', taskId: newTaskId });
    });
  });
});

// Start a task
app.post('/api/tasks/:id/start', (req, res) => {
  const taskId = req.params.id;
  const { actual_start, user_id } = req.body;

  if (!user_id) return res.status(400).json({ message: 'Missing user_id in request body' });

  // Verify task belongs to user
  const checkSql = 'SELECT * FROM usertasks WHERE task_id = ? AND user_id = ?';
  db.query(checkSql, [taskId, user_id], (checkErr, checkRes) => {
    if (checkErr) {
      console.error('Error checking task ownership:', checkErr);
      return res.status(500).json({ error: checkErr.message });
    }

    if (!checkRes || checkRes.length === 0) {
      return res.status(403).json({ message: 'User does not own this task' });
    }

    const sql = `UPDATE tasks SET actual_start = ?, user_status = 'in-progress' WHERE task_id = ?`;
    db.query(sql, [actual_start, taskId], (err, result) => {
      if (err) {
        console.error('Error starting task:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Task started successfully' });
    });
  });
});

// Complete a task
app.post('/api/tasks/:id/complete', (req, res) => {
  const taskId = req.params.id;
  const { actual_end, user_id } = req.body;

  if (!user_id) return res.status(400).json({ message: 'Missing user_id in request body' });

  // Verify task belongs to user
  const checkSql = 'SELECT * FROM usertasks WHERE task_id = ? AND user_id = ?';
  db.query(checkSql, [taskId, user_id], (checkErr, checkRes) => {
    if (checkErr) {
      console.error('Error checking task ownership:', checkErr);
      return res.status(500).json({ error: checkErr.message });
    }

    if (!checkRes || checkRes.length === 0) {
      return res.status(403).json({ message: 'User does not own this task' });
    }

    const sql = `UPDATE tasks SET actual_end = ?, user_status = 'completed' WHERE task_id = ?`;
    db.query(sql, [actual_end, taskId], (err, result) => {
      if (err) {
        console.error('Error completing task:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Task completed successfully' });
    });
  });
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, category, planned_start, planned_end, user_id } = req.body;

  if (!user_id) return res.status(400).json({ message: 'Missing user_id in request body' });

  // Verify ownership
  const checkSql = 'SELECT * FROM usertasks WHERE task_id = ? AND user_id = ?';
  db.query(checkSql, [taskId, user_id], (checkErr, checkRes) => {
    if (checkErr) {
      console.error('Error checking task ownership:', checkErr);
      return res.status(500).json({ error: checkErr.message });
    }
    if (!checkRes || checkRes.length === 0) return res.status(403).json({ message: 'User does not own this task' });

    const sql = `UPDATE tasks SET task_name = ?, category = ?, planned_start = ?, planned_end = ? WHERE task_id = ?`;
    db.query(sql, [title, category, planned_start, planned_end, taskId], (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Task updated successfully' });
    });
  });
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const userId = req.query.user_id;

  if (!userId) return res.status(400).json({ message: 'Missing user_id query parameter' });

  // Verify ownership
  const checkSql = 'SELECT * FROM usertasks WHERE task_id = ? AND user_id = ?';
  db.query(checkSql, [taskId, userId], (checkErr, checkRes) => {
    if (checkErr) {
      console.error('Error checking task ownership:', checkErr);
      return res.status(500).json({ error: checkErr.message });
    }

    if (!checkRes || checkRes.length === 0) {
      return res.status(403).json({ message: 'User does not own this task' });
    }

    // Delete from usertasks first (foreign key constraint)
    const deleteUserTaskSql = 'DELETE FROM usertasks WHERE task_id = ? AND user_id = ?';
    db.query(deleteUserTaskSql, [taskId, userId], (deleteUserTaskErr) => {
      if (deleteUserTaskErr) {
        console.error('Error deleting from usertasks:', deleteUserTaskErr);
        return res.status(500).json({ error: deleteUserTaskErr.message });
      }

      // Then delete the task itself
      const deleteTaskSql = 'DELETE FROM tasks WHERE task_id = ?';
      db.query(deleteTaskSql, [taskId], (deleteTaskErr) => {
        if (deleteTaskErr) {
          console.error('Error deleting task:', deleteTaskErr);
          return res.status(500).json({ error: deleteTaskErr.message });
        }

        res.json({ message: 'Task deleted successfully' });
      });
    });
  });
});

// Get all reasons for procrastination
app.get('/api/reasons', (req, res) => {
  const sql = 'SELECT * FROM reason ORDER BY reason_id';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching reasons:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get all emotional states
app.get('/api/emotional-states', (req, res) => {
  const sql = 'SELECT * FROM emotional_state ORDER BY emotional_id';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching emotional states:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get all procrastination logs with task details
app.get('/api/procrastination-logs', (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  const sql = `
    SELECT 
      pl.log_id,
      pl.task_id,
      t.task_name,
      t.category,
      t.planned_end,
      t.actual_end,
      pd.delay_duration,
      r.reason_text,
      es.emotion_text,
      pd.logged_date,
      pd.detail_id
    FROM procrastination_log pl
    INNER JOIN tasks t ON pl.task_id = t.task_id
    INNER JOIN procrastination_details pd ON pl.log_id = pd.log_id
    INNER JOIN reason r ON pd.reason_id = r.reason_id
    INNER JOIN emotional_state es ON pd.emotional_id = es.emotional_id
    WHERE pl.user_id = ?
    ORDER BY pd.logged_date DESC, t.actual_end DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching procrastination logs:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Procrastination logs fetched:', results.length);
    res.json(results);
  });
});

// Get analytics data for a user
app.get('/api/analytics', (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  // Get total tasks and delayed tasks
  const totalTasksSql = `
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN user_status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
    FROM tasks t
    INNER JOIN usertasks ut ON t.task_id = ut.task_id
    WHERE ut.user_id = ?
  `;

  // Get delayed tasks count
  const delayedTasksSql = `
    SELECT COUNT(DISTINCT pl.task_id) as delayed_tasks
    FROM procrastination_log pl
    WHERE pl.user_id = ?
  `;

  // Get reasons breakdown
  const reasonsSql = `
    SELECT r.reason_text, COUNT(*) as count
    FROM procrastination_log pl
    INNER JOIN procrastination_details pd ON pl.log_id = pd.log_id
    INNER JOIN reason r ON pd.reason_id = r.reason_id
    WHERE pl.user_id = ?
    GROUP BY r.reason_text
    ORDER BY count DESC
  `;

  // Get emotional states breakdown
  const emotionsSql = `
    SELECT es.emotion_text, COUNT(*) as count
    FROM procrastination_log pl
    INNER JOIN procrastination_details pd ON pl.log_id = pd.log_id
    INNER JOIN emotional_state es ON pd.emotional_id = es.emotional_id
    WHERE pl.user_id = ?
    GROUP BY es.emotion_text
    ORDER BY count DESC
  `;

  // Get average delay duration
  const avgDelaySql = `
    SELECT AVG(pd.delay_duration) as avg_delay
    FROM procrastination_log pl
    INNER JOIN procrastination_details pd ON pl.log_id = pd.log_id
    WHERE pl.user_id = ?
  `;

  // Get category-wise delays
  const categorySql = `
    SELECT t.category, COUNT(*) as delay_count, AVG(pd.delay_duration) as avg_delay
    FROM procrastination_log pl
    INNER JOIN tasks t ON pl.task_id = t.task_id
    INNER JOIN procrastination_details pd ON pl.log_id = pd.log_id
    WHERE pl.user_id = ?
    GROUP BY t.category
    ORDER BY delay_count DESC
  `;

  // Get delay trends over time (last 30 days)
  const trendsSql = `
    SELECT 
      DATE(pd.logged_date) as date,
      COUNT(*) as delay_count,
      AVG(pd.delay_duration) as avg_delay
    FROM procrastination_log pl
    INNER JOIN procrastination_details pd ON pl.log_id = pd.log_id
    WHERE pl.user_id = ? AND pd.logged_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(pd.logged_date)
    ORDER BY date ASC
  `;

  // Execute all queries
  const analytics = {};

  db.query(totalTasksSql, [user_id], (err1, totalResults) => {
    if (err1) {
      console.error('Error fetching total tasks:', err1);
      return res.status(500).json({ error: err1.message });
    }
    analytics.totalTasks = totalResults[0];

    db.query(delayedTasksSql, [user_id], (err2, delayedResults) => {
      if (err2) {
        console.error('Error fetching delayed tasks:', err2);
        return res.status(500).json({ error: err2.message });
      }
      analytics.delayedTasks = delayedResults[0].delayed_tasks;

      db.query(reasonsSql, [user_id], (err3, reasonsResults) => {
        if (err3) {
          console.error('Error fetching reasons:', err3);
          return res.status(500).json({ error: err3.message });
        }
        analytics.reasonsBreakdown = reasonsResults;

        db.query(emotionsSql, [user_id], (err4, emotionsResults) => {
          if (err4) {
            console.error('Error fetching emotions:', err4);
            return res.status(500).json({ error: err4.message });
          }
          analytics.emotionsBreakdown = emotionsResults;

          db.query(avgDelaySql, [user_id], (err5, avgDelayResults) => {
            if (err5) {
              console.error('Error fetching avg delay:', err5);
              return res.status(500).json({ error: err5.message });
            }
            analytics.avgDelay = avgDelayResults[0].avg_delay || 0;

            db.query(categorySql, [user_id], (err6, categoryResults) => {
              if (err6) {
                console.error('Error fetching category delays:', err6);
                return res.status(500).json({ error: err6.message });
              }
              analytics.categoryDelays = categoryResults;

              db.query(trendsSql, [user_id], (err7, trendsResults) => {
                if (err7) {
                  console.error('Error fetching trends:', err7);
                  return res.status(500).json({ error: err7.message });
                }
                analytics.delayTrends = trendsResults;
                res.json(analytics);
              });
            });
          });
        });
      });
    });
  });
});

// Create a new procrastination log
app.post('/api/procrastination-logs', (req, res) => {
  const { task_id, user_id, reason_id, emotional_id, duration_minutes, date } = req.body;

  if (!task_id || !user_id || !reason_id || !emotional_id || !duration_minutes) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // First, insert into procrastination_log table
  const logSql = `INSERT INTO procrastination_log (user_id, task_id) VALUES (?, ?)`;

  db.query(logSql, [user_id, task_id], (logErr, logResult) => {
    if (logErr) {
      console.error('Error creating procrastination log:', logErr);
      return res.status(500).json({ error: logErr.message });
    }

    const logId = logResult.insertId;

    // Then, insert into procrastination_detail table
    const detailSql = `INSERT INTO procrastination_details (log_id, delay_duration, reason_id, emotional_id, logged_date) 
                       VALUES (?, ?, ?, ?, ?)`;

    db.query(detailSql, [logId, duration_minutes, reason_id, emotional_id, date], (detailErr, detailResult) => {
      if (detailErr) {
        console.error('Error creating procrastination detail:', detailErr);
        // Rollback: Delete the log entry if detail insertion fails
        db.query('DELETE FROM procrastination_log WHERE log_id = ?', [logId], () => {
          return res.status(500).json({ error: detailErr.message });
        });
        return;
      }

      res.status(201).json({ 
        message: 'Procrastination log created successfully',
        log_id: logId,
        detail_id: detailResult.insertId
      });
    });
  });
});


app.get('/api/reports/weekly', async (req, res) => {
  const { user_id, date } = req.query;
  if (!user_id || !date) return res.status(400).json({ message: 'user_id and date are required' });

  try {
    const report = await generateWeeklyReport(user_id, date);
    res.json(report);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})