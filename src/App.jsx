import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// Assignment Log Table Component
const AssignmentLogTable = ({ assignmentLog }) => {
  return (
    <div className="assignment-log">
      <h3>Task Assignment History</h3>
      <div className="log-table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Task ID</th>
              <th>Task Weight</th>
              <th>Assigned To</th>
              <th>Server Load Before</th>
              <th>Server Load After</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignmentLog.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-log">
                  No assignments yet. Start simulation and add tasks to see assignment history.
                </td>
              </tr>
            ) : (
              assignmentLog.map((log, idx) => (
                <tr key={idx} className={log.status === 'completed' ? 'completed-row' : ''}>
                  <td>{log.timestamp}</td>
                  <td>T{log.taskId}</td>
                  <td>{log.taskWeight} units</td>
                  <td>Server {log.serverId}</td>
                  <td>{log.loadBefore}%</td>
                  <td>{log.loadAfter}%</td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status === 'assigned' ? '✓ Assigned' : '✓ Completed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Status Message Component
const StatusMessage = ({ status, servers, taskQueue, nextTask }) => {
  const getStatusMessage = () => {
    if (!status.isRunning) {
      return {
        current: 'Simulation is stopped. Click "Start Simulation" to begin processing tasks.',
        next: 'When started, the system will begin assigning tasks from the queue to servers.',
      };
    }

    if (taskQueue.length === 0) {
      const totalTasks = servers.reduce((sum, s) => sum + s.tasks.length, 0);
      if (totalTasks === 0) {
        return {
          current: 'No tasks in queue and no active tasks. System is idle.',
          next: 'Add tasks to see them get assigned to servers.',
        };
      }
      return {
        current: 'All tasks have been assigned. Servers are processing tasks.',
        next: 'Tasks will complete randomly (~30% chance every 2 seconds), freeing up server capacity.',
      };
    }

    if (nextTask) {
      const sortedServers = [...servers].sort((a, b) => a.load - b.load);
      const bestServer = sortedServers[0];
      const canAssign = bestServer.load + nextTask.weight <= bestServer.maxCapacity;

      if (canAssign) {
        return {
          current: `Task T${nextTask.id} (${nextTask.weight} units) is waiting in queue.`,
          next: `Next: Task T${nextTask.id} will be assigned to Server ${bestServer.id} (current load: ${bestServer.load}%). New load will be ${bestServer.load + nextTask.weight}%.`,
        };
      } else {
        return {
          current: `Task T${nextTask.id} (${nextTask.weight} units) cannot be assigned yet. All servers are at or near capacity.`,
          next: `Next: System will wait for tasks to complete. Server ${bestServer.id} needs ${nextTask.weight - (bestServer.maxCapacity - bestServer.load)} more units freed.`,
        };
      }
    }

    return {
      current: 'Processing tasks...',
      next: 'Checking queue for assignable tasks.',
    };
  };

  const message = getStatusMessage();

  return (
    <div className="status-message-panel">
      <h3>Current Status & Next Action</h3>
      <div className="status-content">
        <div className="status-section">
          <strong className="status-label">Current Situation:</strong>
          <p className="status-text">{message.current}</p>
        </div>
        <div className="status-section">
          <strong className="status-label">Next Process:</strong>
          <p className="status-text next-action">{message.next}</p>
        </div>
      </div>
    </div>
  );
};

// Server component to visualize individual servers
const Server = ({ id, load, tasks, maxCapacity }) => {
  const loadPercentage = (load / maxCapacity) * 100;
  const getLoadColor = () => {
    if (loadPercentage < 50) return '#4caf50';
    if (loadPercentage < 80) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="server">
      <div className="server-header">
        <h3>Server {id}</h3>
        <span className="load-percentage">{loadPercentage.toFixed(0)}%</span>
      </div>
      <div className="server-load-bar">
        <div
          className="server-load-fill"
          style={{
            width: `${loadPercentage}%`,
            backgroundColor: getLoadColor(),
          }}
        />
      </div>
      <div className="server-info">
        <p>Load: {load}/{maxCapacity}</p>
        <p>Tasks: {tasks.length}</p>
      </div>
      <div className="server-tasks">
        {tasks.map((task, idx) => (
          <div key={idx} className="task-item" title={`Task ${task.id} (${task.weight} units)`}>
            T{task.id}
          </div>
        ))}
      </div>
    </div>
  );
};

// Task Queue component
const TaskQueue = ({ queue }) => {
  return (
    <div className="task-queue">
      <h3>Task Queue</h3>
      <div className="queue-items">
        {queue.length === 0 ? (
          <p className="empty-queue">No pending tasks</p>
        ) : (
          queue.map((task) => (
            <div key={task.id} className="queue-task" title={`Weight: ${task.weight} units`}>
              T{task.id} ({task.weight})
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function App() {
  const [servers, setServers] = useState([
    { id: 1, load: 0, tasks: [], maxCapacity: 100 },
    { id: 2, load: 0, tasks: [], maxCapacity: 100 },
    { id: 3, load: 0, tasks: [], maxCapacity: 100 },
  ]);
  const [taskQueue, setTaskQueue] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [taskIdCounter, setTaskIdCounter] = useState(1);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    averageLoad: 0,
  });
  const [assignmentLog, setAssignmentLog] = useState([]);
  const [status, setStatus] = useState({
    isRunning: false,
    lastUpdate: null,
  });
  
  // Step-by-step navigation state
  const [stateHistory, setStateHistory] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const stepCounterRef = useRef(0);
  
  // Refs to track latest state for snapshot saving
  const serversRef = useRef(servers);
  const taskQueueRef = useRef(taskQueue);
  const statsRef = useRef(stats);
  const assignmentLogRef = useRef(assignmentLog);
  
  // Update refs when state changes
  useEffect(() => {
    serversRef.current = servers;
  }, [servers]);
  useEffect(() => {
    taskQueueRef.current = taskQueue;
  }, [taskQueue]);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);
  useEffect(() => {
    assignmentLogRef.current = assignmentLog;
  }, [assignmentLog]);

  // Save current state to history
  const saveStateSnapshot = useCallback(() => {
    const snapshot = {
      servers: JSON.parse(JSON.stringify(serversRef.current)),
      taskQueue: JSON.parse(JSON.stringify(taskQueueRef.current)),
      stats: JSON.parse(JSON.stringify(statsRef.current)),
      assignmentLog: JSON.parse(JSON.stringify(assignmentLogRef.current)),
      stepNumber: stepCounterRef.current,
    };
    
    setStateHistory((prevHistory) => {
      // Remove any future states if we're going back and then forward
      const newHistory = prevHistory.slice(0, currentStepIndex + 1);
      return [...newHistory, snapshot];
    });
    setCurrentStepIndex((prevIndex) => prevIndex + 1);
    stepCounterRef.current += 1;
  }, [currentStepIndex]);

  // Load balancing algorithm: Assign task to server with least load
  const assignTaskToServer = useCallback((task, shouldLog = true) => {
    setServers((prevServers) => {
      const sortedServers = [...prevServers].sort((a, b) => a.load - b.load);
      const targetServer = sortedServers[0];

      // Check if task can fit
      if (targetServer.load + task.weight <= targetServer.maxCapacity) {
        const loadBefore = targetServer.load;
        const loadAfter = targetServer.load + task.weight;
        const loadBeforePercent = (loadBefore / targetServer.maxCapacity) * 100;
        const loadAfterPercent = (loadAfter / targetServer.maxCapacity) * 100;

        // Log the assignment
        if (shouldLog) {
          const timestamp = new Date().toLocaleTimeString();
          setAssignmentLog((prevLog) => [
            {
              timestamp,
              taskId: task.id,
              taskWeight: task.weight,
              serverId: targetServer.id,
              loadBefore: loadBeforePercent.toFixed(1),
              loadAfter: loadAfterPercent.toFixed(1),
              status: 'assigned',
            },
            ...prevLog,
          ]);
        }

        return prevServers.map((server) =>
          server.id === targetServer.id
            ? {
                ...server,
                load: server.load + task.weight,
                tasks: [...server.tasks, task],
              }
            : server
        );
      }
      return prevServers;
    });
  }, []);

  // Execute next step
  const executeNextStep = useCallback(() => {
    if (!isRunning) return false;

    // Save current state before making changes
    saveStateSnapshot();

    // Try to assign a task first
    if (taskQueue.length > 0) {
      const task = taskQueue[0];
      const canAssign = servers.some(
        (s) => s.load + task.weight <= s.maxCapacity
      );

      if (canAssign) {
        assignTaskToServer(task, true);
        setTaskQueue((prevQueue) => prevQueue.slice(1));
        setStats((prev) => ({
          ...prev,
          totalTasks: prev.totalTasks + 1,
        }));
        return true;
      }
    }

    // Try to complete tasks if no assignment possible
    let taskCompleted = false;
    setServers((prevServers) => {
      return prevServers.map((server) => {
        if (server.tasks.length === 0) return server;

        // Try to complete one task (deterministic - complete first task)
        const taskToComplete = server.tasks[0];
        const remainingTasks = server.tasks.slice(1);
        const loadReduction = taskToComplete.weight;

        const loadBefore = server.load;
        const loadAfter = Math.max(0, server.load - loadReduction);
        const loadBeforePercent = (loadBefore / server.maxCapacity) * 100;
        const loadAfterPercent = (loadAfter / server.maxCapacity) * 100;

        // Log task completion
        const timestamp = new Date().toLocaleTimeString();
        setAssignmentLog((prevLog) => [
          {
            timestamp,
            taskId: taskToComplete.id,
            taskWeight: taskToComplete.weight,
            serverId: server.id,
            loadBefore: loadBeforePercent.toFixed(1),
            loadAfter: loadAfterPercent.toFixed(1),
            status: 'completed',
          },
          ...prevLog,
        ]);

        setStats((prev) => ({
          ...prev,
          completedTasks: prev.completedTasks + 1,
        }));

        taskCompleted = true;

        return {
          ...server,
          load: loadAfter,
          tasks: remainingTasks,
        };
      });
    });

    return taskCompleted;
  }, [isRunning, taskQueue, servers, assignTaskToServer, saveStateSnapshot]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex <= 0) return;

    const previousIndex = currentStepIndex - 1;
    const previousState = stateHistory[previousIndex];

    if (previousState) {
      setServers(previousState.servers);
      setTaskQueue(previousState.taskQueue);
      setStats(previousState.stats);
      setAssignmentLog(previousState.assignmentLog);
      setCurrentStepIndex(previousIndex);
      stepCounterRef.current = previousState.stepNumber + 1;
      
      // Update refs
      serversRef.current = previousState.servers;
      taskQueueRef.current = previousState.taskQueue;
      statsRef.current = previousState.stats;
      assignmentLogRef.current = previousState.assignmentLog;
    }
  }, [currentStepIndex, stateHistory]);

  // Navigate to next step (if we went back)
  const goToNextStep = useCallback(() => {
    if (currentStepIndex >= stateHistory.length - 1) {
      // We're at the latest state, execute next step
      executeNextStep();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    const nextState = stateHistory[nextIndex];

    if (nextState) {
      setServers(nextState.servers);
      setTaskQueue(nextState.taskQueue);
      setStats(nextState.stats);
      setAssignmentLog(nextState.assignmentLog);
      setCurrentStepIndex(nextIndex);
      stepCounterRef.current = nextState.stepNumber + 1;
      
      // Update refs
      serversRef.current = nextState.servers;
      taskQueueRef.current = nextState.taskQueue;
      statsRef.current = nextState.stats;
      assignmentLogRef.current = nextState.assignmentLog;
    }
  }, [currentStepIndex, stateHistory, executeNextStep]);

  // Calculate average load
  useEffect(() => {
    const totalLoad = servers.reduce((sum, s) => sum + s.load, 0);
    const avgLoad = totalLoad / servers.length;
    setStats((prev) => ({ ...prev, averageLoad: avgLoad }));
  }, [servers]);

  const addTask = () => {
    const weight = Math.floor(Math.random() * 30) + 10; // Random weight between 10-40
    const newTask = {
      id: taskIdCounter,
      weight: weight,
    };
    setTaskQueue((prev) => [...prev, newTask]);
    setTaskIdCounter((prev) => prev + 1);
  };

  const addMultipleTasks = () => {
    for (let i = 0; i < 5; i++) {
      addTask();
    }
  };

  const reset = () => {
    setServers([
      { id: 1, load: 0, tasks: [], maxCapacity: 100 },
      { id: 2, load: 0, tasks: [], maxCapacity: 100 },
      { id: 3, load: 0, tasks: [], maxCapacity: 100 },
    ]);
    setTaskQueue([]);
    setTaskIdCounter(1);
    setStats({
      totalTasks: 0,
      completedTasks: 0,
      averageLoad: 0,
    });
    setAssignmentLog([]);
    setStatus({ isRunning: false, lastUpdate: null });
    setStateHistory([]);
    setCurrentStepIndex(-1);
    stepCounterRef.current = 0;
  };

  // Update status
  useEffect(() => {
    setStatus({ isRunning, lastUpdate: new Date() });
  }, [isRunning, servers, taskQueue]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dynamic Load Balancing in Multiprogramming System</h1>
        <p className="subtitle">
          Visualizing how tasks are distributed across multiple servers based on
          current load
        </p>
      </header>

      <div className="controls">
        <button onClick={addTask} disabled={!isRunning}>
          Add Single Task
        </button>
        <button onClick={addMultipleTasks} disabled={!isRunning}>
          Add 5 Tasks
        </button>
        <button
          onClick={() => {
            const newRunningState = !isRunning;
            setIsRunning(newRunningState);
            if (newRunningState) {
              // Save initial state when starting - use setTimeout to ensure state is updated
              setTimeout(() => {
                saveStateSnapshot();
              }, 0);
            }
          }}
          className={isRunning ? 'stop-button' : 'start-button'}
        >
          {isRunning ? 'Stop Simulation' : 'Start Simulation'}
        </button>
        <button onClick={reset} className="reset-button">
          Reset
        </button>
      </div>

      {isRunning && (
        <div className="step-controls">
          <h3 className="step-controls-title">Step-by-Step Navigation</h3>
          <div className="step-controls-buttons">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex <= 0}
              className="prev-button"
            >
              ← Previous Step
            </button>
            <div className="step-info">
              <span>Step: {currentStepIndex + 1}</span>
              {currentStepIndex < stateHistory.length - 1 && (
                <span className="step-hint">(Viewing history)</span>
              )}
            </div>
            <button
              onClick={goToNextStep}
              disabled={
                currentStepIndex >= stateHistory.length - 1 &&
                taskQueue.length === 0 &&
                servers.every((s) => s.tasks.length === 0)
              }
              className="next-button"
            >
              Next Step →
            </button>
          </div>
        </div>
      )}

      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">Total Tasks:</span>
          <span className="stat-value">{stats.totalTasks}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed:</span>
          <span className="stat-value">{stats.completedTasks}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Load:</span>
          <span className="stat-value">{stats.averageLoad.toFixed(1)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending:</span>
          <span className="stat-value">{taskQueue.length}</span>
        </div>
      </div>

      <StatusMessage
        status={status}
        servers={servers}
        taskQueue={taskQueue}
        nextTask={taskQueue.length > 0 ? taskQueue[0] : null}
      />

      <div className="main-content">
        <TaskQueue queue={taskQueue} />
        <div className="servers-container">
          <h2>Servers</h2>
          <div className="servers-grid">
            {servers.map((server) => (
              <Server
                key={server.id}
                id={server.id}
                load={server.load}
                tasks={server.tasks}
                maxCapacity={server.maxCapacity}
              />
            ))}
          </div>
        </div>
      </div>

      <AssignmentLogTable assignmentLog={assignmentLog} />

      <div className="info-panel">
        <h3>How It Works</h3>
        <ul>
          <li>
            <strong>Load Balancing Algorithm:</strong> Tasks are assigned to
            the server with the least current load
          </li>
          <li>
            <strong>Task Weight:</strong> Each task has a weight (10-40 units)
            representing its computational requirement
          </li>
          <li>
            <strong>Server Capacity:</strong> Each server has a maximum capacity
            of 100 units
          </li>
          <li>
            <strong>Dynamic Distribution:</strong> As tasks complete, servers
            become available for new tasks, maintaining balanced load
          </li>
          <li>
            <strong>Color Coding:</strong> Green (&lt;50%), Orange (50-80%),
            Red (&gt;80%)
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
