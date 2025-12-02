# Dynamic Load Balancing in Multiprogramming System

A visual simulation tool that demonstrates dynamic load balancing algorithms in a multiprogramming system. This React application provides an interactive way to understand how tasks are distributed across multiple servers based on their current load capacity.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Overview

This application simulates a load balancing system where tasks with varying computational weights are dynamically assigned to servers. The system uses a **least-loaded server algorithm** to ensure optimal distribution of workload across multiple servers.

## ✨ Features

### Core Functionality
- **Dynamic Task Assignment**: Automatically assigns tasks to the server with the least current load
- **Real-time Visualization**: Visual representation of server load with color-coded indicators
- **Task Queue Management**: Queue system for pending tasks waiting to be assigned
- **Step-by-Step Navigation**: Navigate through simulation steps forward and backward
- **Assignment History**: Complete log of all task assignments and completions

### Interactive Controls
- **Add Single Task**: Add a single task with random weight (10-40 units)
- **Add Multiple Tasks**: Add 5 tasks at once for bulk testing
- **Start/Stop Simulation**: Control the simulation execution
- **Reset**: Clear all data and start fresh
- **Step Navigation**: Move forward/backward through simulation history

### Visual Indicators
- **Color-Coded Load Levels**:
  - 🟢 Green: Low load (< 50%)
  - 🟠 Orange: Medium load (50-80%)
  - 🔴 Red: High load (> 80%)
- **Real-time Statistics**: Track total tasks, completed tasks, average load, and pending tasks
- **Status Messages**: Current situation and next action information

## 🛠️ Technologies Used

- **React 19.2.0** - UI framework
- **Vite 7.2.4** - Build tool and dev server
- **ESLint** - Code linting
- **Modern CSS** - Responsive design with gradients and animations

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dynamic-Load-Balancing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🚀 Usage

### Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   npm run preview
   ```

4. **Lint Code**
   ```bash
   npm run lint
   ```

### Using the Simulation

1. **Start the Simulation**: Click "Start Simulation" to begin
2. **Add Tasks**: Use "Add Single Task" or "Add 5 Tasks" buttons (only available when simulation is running)
3. **Monitor Progress**: Watch as tasks are assigned to servers based on load
4. **Navigate Steps**: Use "Previous Step" and "Next Step" buttons to review simulation history
5. **View Logs**: Check the "Task Assignment History" table for detailed assignment records
6. **Reset**: Click "Reset" to clear everything and start over

## 🔧 How It Works

### Load Balancing Algorithm

The system uses a **Least-Loaded Server** algorithm:

1. **Task Arrival**: Tasks arrive with random weights (10-40 units)
2. **Server Selection**: System identifies the server with the lowest current load
3. **Capacity Check**: Verifies if the task can fit (load + task weight ≤ max capacity)
4. **Assignment**: If capacity allows, task is assigned; otherwise, it waits in queue
5. **Task Completion**: Tasks complete deterministically, freeing server capacity
6. **Dynamic Rebalancing**: As tasks complete, new tasks are automatically assigned

### System Components

- **Servers**: 3 servers, each with a maximum capacity of 100 units
- **Task Queue**: FIFO queue for pending tasks
- **State Management**: React hooks for state management
- **History Tracking**: Step-by-step state snapshots for navigation

### Key Metrics

- **Total Tasks**: Number of tasks processed
- **Completed Tasks**: Number of finished tasks
- **Average Load**: Average load percentage across all servers
- **Pending Tasks**: Number of tasks waiting in queue

## 📁 Project Structure

```
Dynamic-Load-Balancing/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── index.css        # Global styles
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
├── package.json         # Project dependencies
└── README.md           # This file
```

## 🎨 Features Breakdown

### Assignment Log Table
- Timestamp of each assignment/completion
- Task ID and weight
- Assigned server
- Load before and after assignment
- Status (Assigned/Completed)

### Status Message Panel
- Current situation description
- Next action prediction
- Real-time system state information

### Server Visualization
- Individual server cards
- Load percentage display
- Visual load bar with color coding
- Active tasks list
- Current load vs. capacity

## 🔍 Algorithm Details

### Task Assignment Logic
```javascript
// Pseudo-code
1. Sort servers by current load (ascending)
2. Select server with minimum load
3. Check: server.load + task.weight <= server.maxCapacity
4. If true: assign task, update load, log assignment
5. If false: keep task in queue, wait for capacity
```

### Task Completion Logic
```javascript
// Pseudo-code
1. For each server with active tasks
2. Complete first task in queue
3. Reduce server load by task weight
4. Remove task from server
5. Log completion
6. Check queue for assignable tasks
```

## 📊 Performance Considerations

- **State Management**: Uses React hooks (useState, useEffect, useCallback, useRef) for efficient updates
- **History Tracking**: Deep cloning for state snapshots to prevent reference issues
- **Rendering**: Optimized component structure to minimize re-renders
- **Responsive Design**: Mobile-friendly layout with CSS Grid and Flexbox

## 🎓 Educational Value

This project is excellent for understanding:
- Load balancing algorithms
- Task scheduling in multiprogramming systems
- React state management patterns
- Real-time UI updates
- Algorithm visualization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with React and Vite
- Uses modern web standards and best practices

---

**Note**: This is a simulation tool for educational purposes. Real-world load balancing systems may use more sophisticated algorithms and consider additional factors like network latency, server health, and geographic location.
