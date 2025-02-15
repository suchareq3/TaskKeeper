import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

// NOTE: use snakeCase for the naming scheme
// The naming scheme : [name of directory]_[name of function containing the text snippet]_[name of component]_[some unique name for the text snippet]
// example #1: "app_signIn_input_emailPlaceholder"
// example #2: "app_tabs_projects_text_yourProjects"

const translations = {
  en: {
    /**** App ****/
    // Sign In
    app_signIn_input_emailPlaceholder: "Email",
    app_signIn_input_passwordPlaceholder: "Password",
    app_signIn_button_signIn: "Sign In",
    app_signIn_button_signUp: "Sign Up",
    // Sign Up
    app_signUp_input_namePlaceholder: "First name",
    app_signUp_input_lastNamePlaceholder: "Last name",
    app_signUp_button_pickDateOfBirth: "Pick your date of birth",
    app_signUp_text_datePicked: "Your date of birth",
    app_signUp_input_emailPlaceholder: "Email",
    app_signUp_input_passwordPlaceholder: "Password",
    app_signUp_button_createAccount: "Create account!",
    app_signUp_button_goBack: "Go back...",
    // Not Found
    app_notFound_stack_title: "Oops! 404: Not Found",
    app_notFound_button_goToMainScreen: "Sorry, you've encountered an unknown error! Press here to go to the main screen.",
    // Tabs Layout
    app_tabs_layout_text_tasks: "Tasks",
    app_tabs_layout_text_projects: "Projects",
    app_tabs_layout_text_loading: "Loading...",
    app_tabs_layout_draweritem_logOut: "Log out",
    app_tabs_layout_button_themeSwitchLight: "Light",
    app_tabs_layout_button_themeSwitchDark: "Dark",
    app_tabs_layout_button_themeSwitchSystem: "System",
    // Projects
    app_tabs_projects_text_yourProjects: "Your projects",
    app_tabs_projects_button_refreshProjects: "Refresh projects",
    app_tabs_projects_button_addProject: "Add new project",
    // Tasks
    app_tabs_tasks_text_yourTasks: "Your tasks",
    app_tabs_tasks_text_project: "Project",
    app_tabs_tasks_button_refreshTasks: "Refresh tasks",
    app_tabs_tasks_button_addTask: "Add new task",

    /**** Components ****/
    // Project Tile
    components_projectTile_text_id: "ID",
    components_projectTile_text_members: "Members",
    components_projectTile_dropdownMenuItem_editProject: "Edit project",
    // Task Tile
    components_taskTile_text_subtasksDone: "Sub-tasks done",
    components_taskTile_dropdownMenuItem_editTask: "Edit task",
    // Constants
    components_constants_const_priorityOptionsLabel1: "1 (highest)",
    components_constants_const_priorityOptionsLabel2: "2",
    components_constants_const_priorityOptionsLabel3: "3",
    components_constants_const_priorityOptionsLabel4: "4",
    components_constants_const_priorityOptionsLabel5: "5 (lowest)",
    components_constants_const_taskTypeOptionsLabelNewFeature: "New feature",
    components_constants_const_taskTypeOptionsLabelChange: "Change",
    components_constants_const_taskTypeOptionsLabelBugFix: "Bug fix",
    components_constants_const_taskTypeOptionsLabelTesting: "Testing",
    components_constants_const_taskTypeOptionsLabelDocumentation: "Documentation",
    components_constants_const_taskTypeOptionsLabelResearch: "Research",
    components_constants_const_taskTypeOptionsLabelOther: "Other",
    components_constants_const_taskStatusOptionsLabelInProgress: "In Progress",
    components_constants_const_taskStatusOptionsLabelCompleted: "Completed",
    components_constants_const_taskStatusOptionsLabelOnHold: "On Hold",

    /**** Inner Screens ****/
    // Inner Screens Layout
    app_innerScreens_layout_stack_addProjectTitle: "Add new project",
    app_innerScreens_layout_stack_editProjectTitle: "Editing project",
    app_innerScreens_layout_stack_addTaskTitle: "Add new task",
    app_innerScreens_layout_stack_editTaskTitle: "Editing task",
    // Add Project
    app_innerScreens_addProject_input_projectNamePlaceholder: "Project name",
    app_innerScreens_addProject_input_projectDescriptionPlaceholder: "Project description",
    app_innerScreens_addProject_input_githubUrlPlaceholder: "Github URL",
    app_innerScreens_addProject_input_inviteCodePlaceholder: "Type in your invite code here",
    app_innerScreens_addProject_button_createProject: "Create new project!",
    app_innerScreens_addProject_text_or: "OR...",
    app_innerScreens_addProject_button_joinExistingProject: "Join an existing project!",
    // Add Task
    app_innerScreens_addTask_const_defaultTaskTypeLabel: "New feature",
    app_innerScreens_addTask_select_pickProjectPlaceholder: "Pick a project",
    app_innerScreens_addTask_select_pickProjectLabel: "Your projects",
    app_innerScreens_addTask_input_taskNamePlaceholder: "Task name",
    app_innerScreens_addTask_input_taskDescriptionPlaceholder: "Task description (optional)",
    app_innerScreens_addTask_select_priorityLevelLabel: "Priority level",
    app_innerScreens_addTask_select_priorityLevelPlaceholder: "Set priority level",
    app_innerScreens_addTask_select_taskTypeLabel: "Task type",
    app_innerScreens_addTask_select_taskTypePlaceholder: "Set task type",
    app_innerScreens_addTask_button_createSubtask: "Create subtask",
    app_innerScreens_addTask_button_createTask: "Create new task!",
    app_innerScreens_addTask_select_taskAssigneeLabel: "Assigned to",
    app_innerScreens_addTask_select_taskAssigneePlaceholder: "Assign task to...",
    app_innerScreens_addTask_select_taskAssigneeYou: "(You!)",
    // Edit Project
    app_innerScreens_editProject_input_projectNamePlaceholder: "Project name",
    app_innerScreens_editProject_input_projectDescriptionPlaceholder: "Project description",
    app_innerScreens_editProject_input_githubUrlPlaceholder: "Github URL",
    app_innerScreens_editProject_text_yourProjectInviteCode: "Your project's invite code",
    app_innerScreens_editProject_toast_inviteCodeCopied: "Invite code copied!",
    app_innerScreens_editProject_button_editProject: "Edit project!",
    app_innerScreens_editProject_button_leaveProject: "Leave project",
    app_innerScreens_editProject_dialogTitle_leaveProject: "Leave project?!",
    app_innerScreens_editProject_dialogText_leaveProject: "ARE YOU SURE you want to leave your project? This process is irreversible!",
    app_innerScreens_editProject_button_leaveProjectRefuse: "No! Please take me back!",
    app_innerScreens_editProject_button_leaveProjectConfirm: "Yes, I'm sure!",
    app_innerScreens_editProject_button_deleteProject: "Delete project",
    app_innerScreens_editProject_dialogTitle_deleteProject: "Delete project?!",
    app_innerScreens_editProject_dialogText_deleteProject: "ARE YOU SURE you want to delete your project? This will also remove all its tasks. This process is irreversible!",
    app_innerScreens_editProject_button_deleteProjectRefuse: "No! Please take me back!",
    app_innerScreens_editProject_button_deleteProjectConfirm: "Yes, I'm sure!",
    app_innerScreens_editProject_dialogTitle_refreshInviteCode: "Refresh invite code?!",
    app_innerScreens_editProject_dialogDescription_refreshInviteCode: "ARE YOU SURE you want to refresh the project's invite code? This will invalidate the previous invite code!",
    app_innerScreens_editProject_button_refreshInviteCodeRefuse: "No! Please take me back!",
    app_innerScreens_editProject_button_refreshInviteCodeConfirm: "Yes, I'm sure!",

    // Edit Task
    app_innerScreens_editTask_input_taskNamePlaceholder: "Task name",
    app_innerScreens_editTask_input_taskDescriptionPlaceholder: "Task description (optional)",
    app_innerScreens_editTask_select_priorityLevelPlaceholder: "Priority level",
    app_innerScreens_editTask_select_taskTypePlaceholder: "Task type",
    app_innerScreens_editTask_select_taskStatusPlaceholder: "Task status",
    app_innerScreens_editTask_select_taskStatusLabel: "Task status",
    app_innerScreens_editTask_text_subtasks: "Subtasks",
    app_innerScreens_editTask_button_addSubtask: "Add subtask",
    app_innerScreens_editTask_button_saveChanges: "Save changes",
    app_innerScreens_editTask_text_newSubtaskTitle: "New subtask",
    app_innerScreens_editTask_toast_taskUpdateSuccess: "Task updated successfully!",
    app_innerScreens_editTask_toast_taskUpdateFailed: "Failed to update task",
    app_innerScreens_editTask_button_deleteTask: "Delete task",
    app_innerScreens_editTask_dialogTitle_deleteTask: "Delete task?!",
    app_innerScreens_editTask_dialogText_deleteTask: "ARE YOU SURE you want to delete this task? This process is irreversible!",
    app_innerScreens_editTask_button_deleteTaskRefuse: "No! Please take me back!",
    app_innerScreens_editTask_button_deleteTaskConfirm: "Yes, I'm sure!",
  },
  pl: {
    /**** App ****/
    // Sign In
    app_signIn_input_emailPlaceholder: "Email",
    app_signIn_input_passwordPlaceholder: "Hasło",
    app_signIn_button_signIn: "Zaloguj się",
    app_signIn_button_signUp: "Zarejestruj się",
    // Sign Up
    app_signUp_input_namePlaceholder: "Imię",
    app_signUp_input_lastNamePlaceholder: "Nazwisko",
    app_signUp_button_pickDateOfBirth: "Wybierz datę urodzenia",
    app_signUp_text_datePicked: "Twoja data urodzenia",
    app_signUp_input_emailPlaceholder: "Email",
    app_signUp_input_passwordPlaceholder: "Hasło",
    app_signUp_button_createAccount: "Utwórz konto!",
    app_signUp_button_goBack: "Wróć...",
    // Not Found
    app_notFound_stack_title: "Ups! 404: Nie znaleziono",
    app_notFound_button_goToMainScreen: "Przepraszamy, napotkano nieznany błąd! Kliknij tutaj, aby przejść do ekranu głównego.",
    // Tabs Layout
    app_tabs_layout_text_tasks: "Zadania",
    app_tabs_layout_text_projects: "Projekty",
    app_tabs_layout_text_loading: "Ładowanie...",
    app_tabs_layout_draweritem_logOut: "Wyloguj się",
    app_tabs_layout_button_themeSwitchLight: "Jasny",
    app_tabs_layout_button_themeSwitchDark: "Ciemny",
    app_tabs_layout_button_themeSwitchSystem: "Systemowy",
    // Projects
    app_tabs_projects_text_yourProjects: "Twoje projekty",
    app_tabs_projects_button_refreshProjects: "Odśwież projekty",
    app_tabs_projects_button_addProject: "Dodaj nowy projekt",
    // Tasks
    app_tabs_tasks_text_yourTasks: "Twoje zadania",
    app_tabs_tasks_text_project: "Projekt",
    app_tabs_tasks_button_refreshTasks: "Odśwież zadania",
    app_tabs_tasks_button_addTask: "Dodaj nowe zadanie",

    /**** Components ****/
    // Project Tile
    components_projectTile_text_id: "ID",
    components_projectTile_text_members: "Członkowie",
    components_projectTile_dropdownMenuItem_editProject: "Edytuj projekt",
    // Task Tile
    components_taskTile_text_subtasksDone: "Podzadania wykonane",
    components_taskTile_dropdownMenuItem_editTask: "Edytuj zadanie",
    // Constants
    components_constants_const_priorityOptionsLabel1: "1 (najwyższy)",
    components_constants_const_priorityOptionsLabel2: "2",
    components_constants_const_priorityOptionsLabel3: "3",
    components_constants_const_priorityOptionsLabel4: "4",
    components_constants_const_priorityOptionsLabel5: "5 (najniższy)",
    components_constants_const_taskTypeOptionsLabelNewFeature: "Nowa funkcja",
    components_constants_const_taskTypeOptionsLabelChange: "Zmiana",
    components_constants_const_taskTypeOptionsLabelBugFix: "Naprawa błędu",
    components_constants_const_taskTypeOptionsLabelTesting: "Testowanie",
    components_constants_const_taskTypeOptionsLabelDocumentation: "Dokumentacja",
    components_constants_const_taskTypeOptionsLabelResearch: "Badania",
    components_constants_const_taskTypeOptionsLabelOther: "Inne",
    components_constants_const_taskStatusOptionsLabelInProgress: "W trakcie",
    components_constants_const_taskStatusOptionsLabelCompleted: "Zakończone",
    components_constants_const_taskStatusOptionsLabelOnHold: "Wstrzymane",

    /**** Inner Screens ****/
    // Inner Screens Layout
    app_innerScreens_layout_stack_addProjectTitle: "Dodaj nowy projekt",
    app_innerScreens_layout_stack_editProjectTitle: "Edytowanie projektu",
    app_innerScreens_layout_stack_addTaskTitle: "Dodaj nowe zadanie",
    app_innerScreens_layout_stack_editTaskTitle: "Edytowanie zadania",
    // Add Project
    app_innerScreens_addProject_input_projectNamePlaceholder: "Nazwa projektu",
    app_innerScreens_addProject_input_projectDescriptionPlaceholder: "Opis projektu",
    app_innerScreens_addProject_input_githubUrlPlaceholder: "URL GitHub",
    app_innerScreens_addProject_input_inviteCodePlaceholder: "Wpisz tutaj swój kod zaproszenia",
    app_innerScreens_addProject_button_createProject: "Utwórz nowy projekt!",
    app_innerScreens_addProject_text_or: "LUB...",
    app_innerScreens_addProject_button_joinExistingProject: "Dołącz do istniejącego projektu!",
    // Add Task
    app_innerScreens_addTask_const_defaultTaskTypeLabel: "Nowa funkcja",
    app_innerScreens_addTask_select_pickProjectPlaceholder: "Wybierz projekt",
    app_innerScreens_addTask_select_pickProjectLabel: "Twoje projekty",
    app_innerScreens_addTask_input_taskNamePlaceholder: "Nazwa zadania",
    app_innerScreens_addTask_input_taskDescriptionPlaceholder: "Opis zadania (opcjonalnie)",
    app_innerScreens_addTask_select_priorityLevelLabel: "Poziom priorytetu",
    app_innerScreens_addTask_select_priorityLevelPlaceholder: "Ustaw poziom priorytetu",
    app_innerScreens_addTask_select_taskTypeLabel: "Typ zadania",
    app_innerScreens_addTask_select_taskTypePlaceholder: "Ustaw typ zadania",
    app_innerScreens_addTask_button_createSubtask: "Utwórz podzadanie",
    app_innerScreens_addTask_button_createTask: "Utwórz nowe zadanie!",
    app_innerScreens_addTask_select_taskAssigneeLabel: "Przydzielone do",
    app_innerScreens_addTask_select_taskAssigneePlaceholder: "Przypisz zadanie do...",
    app_innerScreens_addTask_select_taskAssigneeYou: "(Ty!)",
    // Edit Project
    app_innerScreens_editProject_input_projectNamePlaceholder: "Nazwa projektu",
    app_innerScreens_editProject_input_projectDescriptionPlaceholder: "Opis projektu",
    app_innerScreens_editProject_input_githubUrlPlaceholder: "URL GitHub",
    app_innerScreens_editProject_text_yourProjectInviteCode: "Kod zaproszenia do Twojego projektu",
    app_innerScreens_editProject_toast_inviteCodeCopied: "Kod zaproszenia skopiowany!",
    app_innerScreens_editProject_button_editProject: "Edytuj projekt!",
    app_innerScreens_editProject_button_leaveProject: "Opuść projekt",
    app_innerScreens_editProject_dialogTitle_leaveProject: "Opuścić projekt?!",
    app_innerScreens_editProject_dialogText_leaveProject: "CZY NA PEWNO chcesz opuścić ten projekt? Ten proces jest nieodwracalny!",
    app_innerScreens_editProject_button_leaveProjectRefuse: "Nie, zabierz mnie stąd!",
    app_innerScreens_editProject_button_leaveProjectConfirm: "Tak, na pewno!",
    app_innerScreens_editProject_button_deleteProject: "Usuń projekt",
    app_innerScreens_editProject_dialogTitle_deleteProject: "Usunąć projekt?!",
    app_innerScreens_editProject_dialogText_deleteProject: "CZY NA PEWNO chcesz usunąć ten projekt? To również usunie wszystkie jego zadania. Ten proces jest nieodwracalny!",
    app_innerScreens_editProject_button_deleteProjectRefuse: "Nie, zabierz mnie stąd!",
    app_innerScreens_editProject_button_deleteProjectConfirm: "Tak, na pewno!",
    app_innerScreens_editProject_dialogTitle_refreshInviteCode: "Odświeżyć kod zaproszenia?!",
    app_innerScreens_editProject_dialogDescription_refreshInviteCode: "CZY NA PEWNO chcesz odświeżyć kod zaproszenia projektu? To spowoduje unieważnienie poprzedniego kodu zaproszenia!",
    app_innerScreens_editProject_button_refreshInviteCodeRefuse: "Nie, zabierz mnie stąd!",
    app_innerScreens_editProject_button_refreshInviteCodeConfirm: "Tak, na pewno!",
    // Edit Task
    app_innerScreens_editTask_input_taskNamePlaceholder: "Nazwa zadania",
    app_innerScreens_editTask_input_taskDescriptionPlaceholder: "Opis zadania (opcjonalnie)",
    app_innerScreens_editTask_select_priorityLevelPlaceholder: "Poziom priorytetu",
    app_innerScreens_editTask_select_taskTypePlaceholder: "Typ zadania",
    app_innerScreens_editTask_select_taskStatusPlaceholder: "Status zadania",
    app_innerScreens_editTask_select_taskStatusLabel: "Status zadania",
    app_innerScreens_editTask_text_subtasks: "Podzadania",
    app_innerScreens_editTask_button_addSubtask: "Dodaj podzadanie",
    app_innerScreens_editTask_button_saveChanges: "Zapisz zmiany",
    app_innerScreens_editTask_text_newSubtaskTitle: "Nowe podzadanie",
    app_innerScreens_editTask_toast_taskUpdateSuccess: "Zadanie zaktualizowane pomyślnie!",
    app_innerScreens_editTask_toast_taskUpdateFailed: "Nie udało się zaktualizować zadania",
  },
};

const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? "en"; //default device language
i18n.enableFallback = true;

export default i18n;
