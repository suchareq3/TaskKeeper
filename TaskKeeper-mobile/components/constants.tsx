import i18n from "./translations";

export const PRIORITY_OPTIONS = [
  { value: "1", label: i18n.t("components_constants_const_priorityOptionsLabel1") },
  { value: "2", label: i18n.t("components_constants_const_priorityOptionsLabel2") },
  { value: "3", label: i18n.t("components_constants_const_priorityOptionsLabel3") },
  { value: "4", label: i18n.t("components_constants_const_priorityOptionsLabel4") },
  { value: "5", label: i18n.t("components_constants_const_priorityOptionsLabel5") },
];

export const TASK_TYPE_OPTIONS = [
  { value: "new-feature", label: i18n.t("components_constants_const_taskTypeOptionsLabelNewFeature") },
  { value: "change", label: i18n.t("components_constants_const_taskTypeOptionsLabelChange") },
  { value: "bug-fix", label: i18n.t("components_constants_const_taskTypeOptionsLabelBugFix") },
  { value: "testing", label: i18n.t("components_constants_const_taskTypeOptionsLabelTesting") },
  { value: "documentation", label: i18n.t("components_constants_const_taskTypeOptionsLabelDocumentation") },
  { value: "research", label: i18n.t("components_constants_const_taskTypeOptionsLabelResearch") },
  { value: "other", label: i18n.t("components_constants_const_taskTypeOptionsLabelOther") },
];

export const TASK_STATUS_OPTIONS = [
  { value: "in-progress", label: i18n.t("components_constants_const_taskStatusOptionsLabelInProgress") },
  { value: "completed", label: i18n.t("components_constants_const_taskStatusOptionsLabelCompleted") },
  { value: "on-hold", label: i18n.t("components_constants_const_taskStatusOptionsLabelOnHold") },
];
