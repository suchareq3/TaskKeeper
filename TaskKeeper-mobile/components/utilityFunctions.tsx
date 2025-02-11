const getUserProjects = () => {

}

const getUserTasks = () => {
  
}

export const countSubtasks = (subtasks: Array<{ completed: boolean }>) => {
  let completedCount = 0;
  let totalCount = subtasks.length;

  for (const subtask of subtasks) {
    if (subtask.completed) {
      completedCount++;
    }
  }

  return {
    total: totalCount,
    completed: completedCount,
  };
};