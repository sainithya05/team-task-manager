import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskStatus, setTaskStatus] = useState('pending');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', { name: projectName, description: projectDesc });
      setProjects([...projects, res.data]);
      setProjectName(''); setProjectDesc(''); setShowProjectForm(false);
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        dueDate: taskDue,
        status: taskStatus,
        project: selectedProject._id,
      });
      setTasks([...tasks, res.data]);
      setTaskTitle(''); setTaskDesc(''); setTaskDue(''); setTaskStatus('todo');
      setShowTaskForm(false);
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const projectTasks = selectedProject ? tasks.filter(t => t.project === selectedProject._id) : [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status !== 'completed';
  }).length;

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>Team Task Manager</h1>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user?.name || 'User'}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.statsRow}>
          <div style={styles.statCard}><div style={styles.statNumber}>{projects.length}</div><div style={styles.statLabel}>Projects</div></div>
          <div style={styles.statCard}><div style={styles.statNumber}>{totalTasks}</div><div style={styles.statLabel}>Total Tasks</div></div>
          <div style={styles.statCard}><div style={{...styles.statNumber, color: '#22c55e'}}>{completedTasks}</div><div style={styles.statLabel}>Completed</div></div>
          <div style={styles.statCard}><div style={{...styles.statNumber, color: '#ef4444'}}>{overdueTasks}</div><div style={styles.statLabel}>Overdue</div></div>
        </div>

        {/* Projects */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Projects</h2>
            <button style={styles.addBtn} onClick={() => setShowProjectForm(!showProjectForm)}>+ New Project</button>
          </div>
          {showProjectForm && (
            <form onSubmit={handleCreateProject} style={styles.form}>
              <input style={styles.input} placeholder="Project name" value={projectName} onChange={e => setProjectName(e.target.value)} required />
              <input style={styles.input} placeholder="Description (optional)" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} />
              <button style={styles.submitBtn} type="submit">Create</button>
            </form>
          )}
          <div style={styles.grid}>
            {projects.length === 0 && <p style={styles.empty}>No projects yet. Create one!</p>}
            {projects.map((project) => (
              <div key={project._id} style={{...styles.projectCard, border: selectedProject?._id === project._id ? '2px solid #4f46e5' : '1px solid #e5e7eb'}}
                onClick={() => { setSelectedProject(project); setShowTaskForm(false); }}>
                <h3 style={styles.projectName}>{project.name}</h3>
                <p style={styles.projectDesc}>{project.description || 'No description'}</p>
                <span style={styles.badge}>Admin</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks for selected project */}
        {selectedProject && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Tasks — {selectedProject.name}</h2>
              <button style={styles.addBtn} onClick={() => setShowTaskForm(!showTaskForm)}>+ Add Task</button>
            </div>
            {showTaskForm && (
              <form onSubmit={handleCreateTask} style={{...styles.form, flexDirection: 'column'}}>
                <input style={styles.input} placeholder="Task title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                <input style={styles.input} placeholder="Description (optional)" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                <input style={styles.input} type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} />
                <select style={styles.input} value={taskStatus} onChange={e => setTaskStatus(e.target.value)}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button style={styles.submitBtn} type="submit">Create Task</button>
              </form>
            )}
            {projectTasks.length === 0 && <p style={styles.empty}>No tasks yet. Add one!</p>}
            {projectTasks.map((task) => (
              <div key={task._id} style={styles.taskRow}>
                <div>
                  <div style={styles.taskName}>{task.title}</div>
                  <div style={styles.taskMeta}>{task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</div>
                </div>
                <span style={{...styles.statusBadge, background: task.status === 'completed' ? '#dcfce7' : task.status === 'in-progress' ? '#fef9c3' : '#f1f5f9', color: task.status === 'completed' ? '#16a34a' : task.status === 'in-progress' ? '#ca8a04' : '#475569'}}>
                  {task.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Tasks */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Tasks</h2>
          {tasks.length === 0 && <p style={styles.empty}>No tasks yet.</p>}
          {tasks.slice(0, 5).map((task) => (
            <div key={task._id} style={styles.taskRow}>
              <div>
                <div style={styles.taskName}>{task.title}</div>
                <div style={styles.taskMeta}>{task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</div>
              </div>
              <span style={{...styles.statusBadge, background: task.status === 'completed' ? '#dcfce7' : task.status === 'in-progress' ? '#fef9c3' : '#f1f5f9', color: task.status === 'completed' ? '#16a34a' : task.status === 'in-progress' ? '#ca8a04' : '#475569'}}>
                {task.status || 'pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' },
  navbar: { background: '#1a1a2e', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navTitle: { color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navUser: { color: '#ccc', fontSize: '14px' },
  logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  content: { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  statNumber: { fontSize: '36px', fontWeight: '700', color: '#1a1a2e' },
  statLabel: { fontSize: '14px', color: '#888', marginTop: '4px' },
  section: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1a2e', margin: 0 },
  addBtn: { background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  form: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', flex: 1, minWidth: '150px' },
  submitBtn: { background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  projectCard: { border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', cursor: 'pointer' },
  projectName: { fontSize: '16px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 8px' },
  projectDesc: { fontSize: '13px', color: '#888', margin: '0 0 12px' },
  badge: { background: '#ede9fe', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' },
  taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
  taskName: { fontSize: '14px', fontWeight: '500', color: '#1a1a2e' },
  taskMeta: { fontSize: '12px', color: '#888', marginTop: '2px' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  empty: { color: '#888', fontSize: '14px' },
};

export default Dashboard;
