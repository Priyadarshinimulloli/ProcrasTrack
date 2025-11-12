const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db/db.js');

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



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})